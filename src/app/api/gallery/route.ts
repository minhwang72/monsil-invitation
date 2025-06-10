import { NextResponse } from 'next/server'
import type { ApiResponse, Gallery } from '@/types'

export async function GET() {
  try {
    // 임시로 빈 배열 반환
    const galleryData: Gallery[] = []
    
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