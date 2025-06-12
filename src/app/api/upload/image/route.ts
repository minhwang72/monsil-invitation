import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import sharp from 'sharp'
import pool from '@/lib/db'
import { ensureImageUploadDir } from '@/lib/fileUtils'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] New image upload API called')
    
    // FormData에서 파일과 targetId 추출
    const formData = await request.formData()
    const file = formData.get('file') as File
    const targetId = formData.get('targetId') as string
    
    console.log('🔍 [DEBUG] Upload info:', {
      filename: file?.name,
      size: file?.size,
      type: file?.type,
      targetId
    })

    if (!file) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      )
    }

    // 파일 크기 체크 (50MB 제한으로 증가)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'File size exceeds 50MB limit',
        },
        { status: 400 }
      )
    }

    // 지원되는 파일 형식 체크 (클라이언트에서 HEIC 변환됨)
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    
    if (!supportedTypes.includes(file.type)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unsupported file type. Only JPG, PNG, and WebP are allowed. HEIC files should be converted on the client side.',
        },
        { status: 400 }
      )
    }

    // uploads/images 디렉토리 생성 (강화된 권한 처리)
    let uploadsDir: string
    try {
      uploadsDir = await ensureImageUploadDir()
    } catch (dirError) {
      console.error('❌ [DEBUG] Failed to ensure upload directory:', dirError)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Failed to prepare upload directory: ${dirError instanceof Error ? dirError.message : 'Unknown error'}`,
        },
        { status: 500 }
      )
    }

    // 파일명 생성 (targetId가 있으면 사용, 없으면 timestamp)
    const timestamp = Date.now()
    const fileExtension = '.jpg' // 항상 JPEG로 변환하여 저장
    const fileName = targetId ? `${targetId}${fileExtension}` : `${timestamp}${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    const fileUrl = `/uploads/images/${fileName}`

    console.log('🔍 [DEBUG] File paths:', {
      fileName,
      filePath,
      fileUrl
    })

    // 기존 파일이 있으면 삭제 (동일 targetId인 경우)
    if (targetId) {
      try {
        // DB에서 기존 이미지 조회
        const [existingRows] = await pool.query(
          'SELECT filename FROM images WHERE target_id = ? AND deleted_at IS NULL',
          [targetId]
        )
        const existingImages = existingRows as { filename: string }[]
        
        // 기존 물리 파일들 삭제
        for (const existingImage of existingImages) {
          const oldFilePath = join(uploadsDir, existingImage.filename)
          try {
            const { unlink, access } = await import('fs/promises')
            await access(oldFilePath)
            await unlink(oldFilePath)
            console.log('✅ [DEBUG] Deleted existing file:', oldFilePath)
          } catch {
            console.log('ℹ️ [DEBUG] Could not delete existing file (may not exist):', oldFilePath)
          }
        }
        
        // DB에서 기존 이미지 소프트 삭제
        const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
        const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
        
        await pool.query(
          'UPDATE images SET deleted_at = ? WHERE target_id = ? AND deleted_at IS NULL',
          [formattedTime, targetId]
        )
        
      } catch (error) {
        console.log('⚠️ [DEBUG] Could not delete existing files:', error)
      }
    }

    // 파일을 버퍼로 읽기
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('🔍 [DEBUG] File buffer size:', buffer.length)

    // Sharp를 사용하여 이미지 처리 및 저장
    let processedFileSize = 0
    try {
      const processedBuffer = await sharp(buffer)
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .resize(1920, 1920, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .toBuffer()
      
      processedFileSize = processedBuffer.length
      
      await writeFile(filePath, processedBuffer)
      console.log('✅ [DEBUG] Image processed and saved with Sharp')
    } catch (sharpError) {
      console.error('❌ [DEBUG] Sharp processing failed:', sharpError)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Image processing failed: ${sharpError instanceof Error ? sharpError.message : 'Unknown error'}`,
        },
        { status: 500 }
      )
    }

    // DB에 이미지 정보 저장
    try {
      const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
      const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
      
      // image_type 결정
      let imageType = 'other'
      if (targetId) {
        if (targetId.includes('main') || targetId.includes('cover')) {
          imageType = 'main'
        } else if (targetId.includes('gallery')) {
          imageType = 'gallery'
        } else if (targetId.includes('profile')) {
          imageType = 'profile'
        }
      }
      
      // images 테이블에 저장
      await pool.query(
        `INSERT INTO images (filename, original_name, target_id, file_size, image_type, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [fileName, file.name, targetId, processedFileSize, imageType, formattedTime, formattedTime]
      )
      
      // 호환성을 위해 gallery 테이블에도 저장 (main 타입인 경우)
      if (imageType === 'main') {
        // 기존 main 이미지 삭제
        await pool.query(
          'UPDATE gallery SET deleted_at = ? WHERE image_type = "main" AND deleted_at IS NULL',
          [formattedTime]
        )
        
        // 새 main 이미지 저장
        await pool.query(
          'INSERT INTO gallery (filename, image_type, created_at) VALUES (?, ?, ?)',
          [`images/${fileName}`, 'main', formattedTime]
        )
        
        console.log('✅ [DEBUG] Main image also saved to gallery table for compatibility')
      }
      
      console.log('✅ [DEBUG] Image info saved to database')
    } catch (dbError) {
      console.error('❌ [DEBUG] Database save failed:', dbError)
      // 파일은 저장되었으니 계속 진행 (DB 오류는 비치명적)
    }

    console.log('✅ [DEBUG] File uploaded successfully:', fileUrl)

    return NextResponse.json<ApiResponse<{ fileUrl: string; fileName: string }>>({
      success: true,
      data: { 
        fileUrl,
        fileName 
      },
    })
  } catch (error) {
    console.error('❌ [DEBUG] Error uploading file:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to upload file',
      },
      { status: 500 }
    )
  }
} 