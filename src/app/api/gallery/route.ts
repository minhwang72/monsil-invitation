import { NextResponse } from 'next/server'
import type { ApiResponse, Gallery } from '@/types'

export async function GET() {
  try {
    // 임시로 빈 배열 반환
    const galleryData: Gallery[] = []
    
    return NextResponse.json<ApiResponse<Gallery[]>>({
      success: true,
      data: galleryData,
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