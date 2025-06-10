import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse, Gallery } from '@/types'

export async function GET() {
  try {
    // 갤러리 이미지들 조회 (삭제되지 않은 것만)
    const [rows] = await pool.query(
      'SELECT id, filename, created_at, image_type FROM gallery WHERE deleted_at IS NULL ORDER BY image_type DESC, created_at DESC'
    )
    const galleryRows = rows as { id: number; filename: string; created_at: Date; image_type: 'main' | 'gallery' }[]
    
    // filename을 url로 변환하여 Gallery 타입으로 변환
    const galleryData: Gallery[] = galleryRows.map(row => ({
      ...row,
      url: `/uploads/${row.filename}`
    }))
    
    const response = NextResponse.json<ApiResponse<Gallery[]>>({
      success: true,
      data: galleryData,
    })

    // 캐싱 헤더 추가 (5분 캐시)
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300')
    
    return response
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
      
      await pool.query(
        'UPDATE gallery SET deleted_at = ? WHERE image_type = "main" AND deleted_at IS NULL',
        [formattedTime]
      )
    }

    // 새 이미지 추가
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query(
      'INSERT INTO gallery (filename, image_type, created_at) VALUES (?, ?, ?)',
      [filename, image_type, formattedTime]
    )

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

    // 이미지 존재 확인
    const [existingRows] = await pool.query(
      'SELECT id FROM gallery WHERE id = ? AND deleted_at IS NULL',
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

    // Soft delete
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query(
      'UPDATE gallery SET deleted_at = ? WHERE id = ?',
      [formattedTime, id]
    )

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