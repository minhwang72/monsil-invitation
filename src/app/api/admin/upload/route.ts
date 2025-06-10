import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import sharp from 'sharp'
import pool from '@/lib/db'
import { ensureUploadDir, getTodayDateString } from '@/lib/fileUtils'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Upload request started')
    
    // Check admin session
    const sessionToken = request.cookies.get('admin_session')?.value
    console.log('🔍 [DEBUG] Admin session:', sessionToken)

    if (!sessionToken || !sessionToken.startsWith('admin_')) {
      console.log('❌ [DEBUG] Unauthorized upload attempt')
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // FormData로 파일 직접 받기 (base64 대신)
    const formData = await request.formData()
    const file = formData.get('file') as File
    const image_type = formData.get('image_type') as string || 'gallery'
    
    console.log('🔍 [DEBUG] Upload info:', {
      filename: file?.name,
      size: file?.size,
      type: file?.type,
      image_type
    })

    if (!file) {
      console.log('❌ [DEBUG] No file provided')
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      )
    }

    // 파일을 버퍼로 읽기
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('🔍 [DEBUG] File buffer size:', buffer.length)

    // Generate paths and filename
    const dateString = getTodayDateString()
    const datePath = await ensureUploadDir(dateString)
    const timestamp = Date.now()
    const cleanName = file.name.replace(/\.[^/.]+$/, '') // 확장자 제거
    const dbFilename = `${timestamp}_${cleanName}.jpg` // 항상 .jpg로 저장
    const filepath = join(datePath, dbFilename)
    const dbPath = `${dateString}/${dbFilename}` // DB에 저장할 상대 경로
    
    console.log('🔍 [DEBUG] File paths:', {
      dateString,
      datePath,
      dbFilename,
      filepath,
      dbPath
    })

    // Handle main image type - soft delete existing main image and remove physical files
    if (image_type === 'main') {
      console.log('🔍 [DEBUG] Processing main image upload - deleting existing')
      const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
      const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
      
      // Get existing main images to delete physical files
      const [existingRows] = await pool.query(
        'SELECT filename FROM gallery WHERE image_type = "main" AND deleted_at IS NULL'
      )
      const existingImages = existingRows as { filename: string }[]
      console.log('🔍 [DEBUG] Existing main images to delete:', existingImages)
      
      // Soft delete existing main images
      await pool.query(
        'UPDATE gallery SET deleted_at = ? WHERE image_type = "main" AND deleted_at IS NULL',
        [formattedTime]
      )
      
      // Delete physical files
      for (const image of existingImages) {
        if (image.filename) {
          const oldFilePath = join(process.cwd(), 'public', 'uploads', image.filename)
          try {
            await import('fs/promises').then(fs => fs.unlink(oldFilePath))
            console.log('🔍 [DEBUG] Deleted physical file:', oldFilePath)
          } catch (error) {
            console.log('🔍 [DEBUG] File deletion info:', error)
          }
        }
      }
    }

    // Sharp를 사용하여 이미지 처리 (HEIC 포함 모든 형식 지원)
    console.log('🔍 [DEBUG] Processing image with Sharp...')
    try {
      await sharp(buffer)
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .resize(1920, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .toFile(filepath)
      
      console.log('✅ [DEBUG] Image processed and saved with Sharp')
    } catch (sharpError) {
      console.error('❌ [DEBUG] Sharp processing failed:', sharpError)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `이미지 처리에 실패했습니다: ${sharpError instanceof Error ? sharpError.message : '알 수 없는 오류'}`,
        },
        { status: 500 }
      )
    }

    // Save to database with file path
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
    
    console.log('🔍 [DEBUG] Inserting to database:', {
      filename: dbPath,
      image_type,
      formattedTime
    })

    const insertResult = await pool.query(
      'INSERT INTO gallery (filename, image_type, created_at) VALUES (?, ?, ?)',
      [dbPath, image_type, formattedTime]
    )
    
    console.log('✅ [DEBUG] Database insert result:', insertResult)

    return NextResponse.json<ApiResponse<{ filename: string }>>({
      success: true,
      data: { filename: dbPath },
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