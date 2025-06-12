import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import sharp from 'sharp'
import pool from '@/lib/db'
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

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Admin upload request started')
    console.log('🔍 [DEBUG] Request headers:', Object.fromEntries(request.headers.entries()))
    
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
    const image_type = formData.get('image_type') as string || 'gallery'
    
    console.log('🔍 [DEBUG] Upload info:', {
      filename: file?.name,
      size: file?.size,
      sizeInMB: file ? (file.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A',
      type: file?.type,
      image_type,
      hasFile: !!file
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

    // 파일 크기 체크 (50MB 제한)
    if (file.size > MAX_FILE_SIZE) {
      console.log('❌ [DEBUG] File too large:', file.size)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'File size exceeds 50MB limit',
        },
        { status: 400 }
      )
    }

    // 파일을 버퍼로 읽기
    const buffer = Buffer.from(await file.arrayBuffer())
    console.log('🔍 [DEBUG] File buffer size:', buffer.length)

    // Generate paths and filename - images 폴더로 통합
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const imagesDir = join(uploadsDir, 'images')
    
    // images 디렉토리 확인 및 생성
    try {
      await import('fs/promises').then(async (fs) => {
        try {
          await fs.access(imagesDir)
        } catch {
          await fs.mkdir(imagesDir, { recursive: true })
          console.log('✅ [DEBUG] Created images directory')
        }
      })
    } catch (dirError) {
      console.error('❌ [DEBUG] Failed to ensure images directory:', dirError)
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: `Failed to prepare upload directory: ${dirError instanceof Error ? dirError.message : 'Unknown error'}`,
        },
        { status: 500 }
      )
    }
    
    // 파일명 생성 로직 개선
    let dbFilename: string
    
    if (image_type === 'main') {
      // 메인 이미지는 main_cover.jpg로 저장
      dbFilename = 'main_cover.jpg'
    } else {
      // 갤러리 이미지인 경우 순서 번호를 조회하여 gallery01.jpg, gallery02.jpg로 저장
      const [countRows] = await pool.query(
        'SELECT COUNT(*) as count FROM gallery WHERE image_type = "gallery" AND deleted_at IS NULL'
      )
      const countResult = countRows as { count: number }[]
      const nextOrder = countResult[0].count + 1
      const orderString = nextOrder.toString().padStart(2, '0')
      dbFilename = `gallery${orderString}.jpg`
    }
    
    const filepath = join(imagesDir, dbFilename)
    const dbPath = `images/${dbFilename}` // DB에 저장할 상대 경로
    
    console.log('🔍 [DEBUG] File paths:', {
      imagesDir,
      dbFilename,
      filepath,
      dbPath,
      image_type
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
            console.log('✅ [DEBUG] Deleted physical file:', oldFilePath)
          } catch (error) {
            console.log('ℹ️ [DEBUG] File deletion info:', error)
          }
        }
      }
    }

    // Sharp를 사용하여 이미지 처리 (HEIC 포함 모든 형식 지원)
    console.log('🔍 [DEBUG] Processing image with Sharp...')
    try {
      await sharp(buffer)
        .rotate() // EXIF 방향 정보에 따라 자동 회전
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .resize(1920, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .toFile(filepath)
      
      console.log('✅ [DEBUG] Image processed and saved with Sharp (auto-rotated)')
    } catch (sharpError) {
      console.error('❌ [DEBUG] Sharp processing failed:', sharpError)
      
      // HEIC 파일 특별 처리
      const isHeicFile = file.name.toLowerCase().includes('.heic') || file.type === 'image/heic'
      
      if (isHeicFile) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: 'HEIC 파일 처리에 실패했습니다. 클라이언트에서 JPEG로 변환된 파일을 사용하거나, 다른 형식(JPG, PNG)으로 변환하여 업로드해주세요.',
          },
          { status: 400 }
        )
      }
      
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