import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { writeFile } from 'fs/promises'
import sharp from 'sharp'
import pool from '@/lib/db'
import { ensureImageUploadDir } from '@/lib/fileUtils'
import type { ApiResponse } from '@/types'

// Next.js API Route 설정 - 파일 업로드 제한 설정
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 바디 파서 설정
export const config = {
  api: {
    bodyParser: false, // FormData 처리를 위해 비활성화
    responseLimit: false,
    externalResolver: true,
  },
}

// 최대 파일 크기 설정 (50MB) - 상수로 선언
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export const maxDuration = 60 // 60초 타임아웃

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] New image upload API called')
    console.log('🔍 [DEBUG] Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔍 [DEBUG] Request method:', request.method)
    console.log('🔍 [DEBUG] Request URL:', request.url)
    
    // FormData에서 파일과 targetId 추출
    let formData: FormData
    try {
      formData = await request.formData()
      console.log('🔍 [DEBUG] FormData parsed successfully')
    } catch (formDataError) {
      console.error('❌ [DEBUG] Failed to parse FormData:', formDataError)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Failed to parse form data: ${formDataError instanceof Error ? formDataError.message : 'Unknown error'}`,
        },
        { status: 400 }
      )
    }
    
    const file = formData.get('file') as File
    const targetId = formData.get('targetId') as string
    
    console.log('🔍 [DEBUG] Upload info:', {
      filename: file?.name,
      size: file?.size,
      sizeInMB: file ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A',
      type: file?.type,
      targetId,
      hasFile: !!file
    })

    if (!file) {
      console.error('❌ [DEBUG] No file provided in request')
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      )
    }

    // 파일 크기 체크 (50MB 제한으로 증가)
    console.log('🔍 [DEBUG] File size check:', {
      fileSize: file.size,
      maxSize: MAX_FILE_SIZE,
      fileSizeInMB: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      maxSizeInMB: (MAX_FILE_SIZE / 1024 / 1024).toFixed(2) + 'MB',
      exceedsLimit: file.size > MAX_FILE_SIZE
    })
    
    if (file.size > MAX_FILE_SIZE) {
      console.error('❌ [DEBUG] File size exceeds limit')
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `File size exceeds 50MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
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
    
    // 413 오류 특별 처리
    if (error instanceof Error && error.message.includes('413')) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: '파일 크기가 너무 큽니다. 서버 제한을 초과했습니다. 파일을 압축하거나 더 작은 파일을 업로드해주세요.',
        },
        { status: 413 }
      )
    }
    
    // FormData 파싱 오류 처리
    if (error instanceof Error && (
      error.message.includes('FormData') || 
      error.message.includes('Request Entity Too Large')
    )) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: '요청 크기가 너무 큽니다. 파일 크기를 50MB 이하로 줄여주세요.',
        },
        { status: 413 }
      )
    }
    
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: `파일 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      },
      { status: 500 }
    )
  }
} 