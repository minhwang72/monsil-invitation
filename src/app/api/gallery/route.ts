import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse, Gallery } from '@/types'

interface DatabaseGalleryRow {
  id: number
  filename: string
  image_type: 'main' | 'gallery'
  created_at: Date
  order_index?: number
}

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT id, filename, image_type, created_at, order_index
      FROM gallery 
      WHERE deleted_at IS NULL 
      ORDER BY 
        CASE 
          WHEN image_type = 'main' THEN 0
          ELSE 1
        END,
        CASE 
          WHEN image_type = 'gallery' AND order_index IS NOT NULL THEN order_index
          ELSE created_at
        END ASC
    `)
    
    const gallery = (rows as DatabaseGalleryRow[]).map(row => ({
      id: row.id,
      url: `/uploads/${row.filename}`, // 파일 경로를 URL로 변환
      filename: row.filename,
      image_type: row.image_type,
      created_at: row.created_at
    }))

    return NextResponse.json<ApiResponse<Gallery[]>>({
      success: true,
      data: gallery,
    })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch gallery',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { filename, image_type = 'gallery' } = body

    // 입력 유효성 검사
    if (!filename) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Filename is required',
        },
        { status: 400 }
      )
    }

    if (!['main', 'gallery'].includes(image_type)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid image_type. Must be "main" or "gallery"',
        },
        { status: 400 }
      )
    }

    // 메인 이미지인 경우 기존 메인 이미지를 삭제 (soft delete)
    if (image_type === 'main') {
      const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
      const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
      
      // 기존 메인 이미지 파일명 조회 후 물리적 파일 삭제
      const [existingMainRows] = await pool.query(
        'SELECT filename FROM gallery WHERE image_type = "main" AND deleted_at IS NULL'
      )
      const existingMainImages = existingMainRows as { filename: string }[]
      
      // 기존 메인 이미지 soft delete
      await pool.query(
        'UPDATE gallery SET deleted_at = ? WHERE image_type = "main" AND deleted_at IS NULL',
        [formattedTime]
      )
      
      // 기존 메인 이미지 물리적 파일 삭제
      for (const existingImage of existingMainImages) {
        if (existingImage.filename) {
          try {
            const { unlink, access } = await import('fs/promises')
            const { join } = await import('path')
            
            const filePath = join(process.cwd(), 'public', 'uploads', existingImage.filename)
            
            // 파일이 존재하는지 확인 후 삭제
            await access(filePath)
            await unlink(filePath)
            console.log('✅ [DEBUG] Deleted existing main image file:', filePath)
          } catch (fileError) {
            console.log('ℹ️ [DEBUG] Could not delete existing main image file (may not exist):', existingImage.filename, fileError)
          }
        }
      }
    }

    // 새 이미지 추가
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    // gallery 타입인 경우 order_index 설정
    if (image_type === 'gallery') {
      // 현재 최대 order_index 조회
      const [maxOrderRows] = await pool.query(
        'SELECT COALESCE(MAX(order_index), 0) as max_order FROM gallery WHERE image_type = "gallery" AND deleted_at IS NULL'
      )
      const maxOrder = (maxOrderRows as { max_order: number }[])[0]?.max_order || 0
      const newOrderIndex = maxOrder + 1

      await pool.query(
        'INSERT INTO gallery (filename, image_type, created_at, order_index) VALUES (?, ?, ?, ?)',
        [filename, image_type, formattedTime, newOrderIndex]
      )
    } else {
      // main 타입인 경우 order_index는 NULL
      await pool.query(
        'INSERT INTO gallery (filename, image_type, created_at) VALUES (?, ?, ?)',
        [filename, image_type, formattedTime]
      )
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error creating gallery entry:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to create gallery entry',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'ID is required',
        },
        { status: 400 }
      )
    }

    // 이미지 존재 확인 및 파일명 조회
    const [existingRows] = await pool.query(
      'SELECT id, filename FROM gallery WHERE id = ? AND deleted_at IS NULL',
      [id]
    )

    if (!Array.isArray(existingRows) || existingRows.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Image not found',
        },
        { status: 404 }
      )
    }

    const existingImage = existingRows[0] as { id: number; filename: string }

    // Soft delete
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query(
      'UPDATE gallery SET deleted_at = ? WHERE id = ?',
      [formattedTime, id]
    )

    // Delete physical file
    if (existingImage.filename) {
      try {
        const { unlink, access } = await import('fs/promises')
        const { join } = await import('path')
        
        const filePath = join(process.cwd(), 'public', 'uploads', existingImage.filename)
        
        // 파일이 존재하는지 확인 후 삭제
        await access(filePath)
        await unlink(filePath)
        console.log('✅ [DEBUG] Physical file deleted:', filePath)
      } catch (fileError) {
        console.log('ℹ️ [DEBUG] Could not delete physical file (may not exist):', existingImage.filename, fileError)
      }
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting gallery entry:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to delete gallery entry',
      },
      { status: 500 }
    )
  }
} 