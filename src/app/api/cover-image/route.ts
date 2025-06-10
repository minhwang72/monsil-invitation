import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

interface CoverImageData {
  imageUrl?: string
}

export async function GET() {
  try {
    // 갤러리 테이블에서 메인 이미지 조회
    const [rows] = await pool.query(
      'SELECT filename FROM gallery WHERE image_type = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1',
      ['main']
    )
    
    const coverImageDataObj: CoverImageData = {}
    
    if (Array.isArray(rows) && rows.length > 0) {
      const mainImage = rows[0] as { filename: string }
      coverImageDataObj.imageUrl = `/uploads/${mainImage.filename}`
    }
    
    const response = NextResponse.json<ApiResponse<CoverImageData>>({
      success: true,
      data: coverImageDataObj,
    })

    // 캐싱 헤더 추가 (10분 캐시)
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600')
    
    return response
  } catch (error) {
    console.error('Error fetching cover image:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch cover image',
      },
      { status: 500 }
    )
  }
} 