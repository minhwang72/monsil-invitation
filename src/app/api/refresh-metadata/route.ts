import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    // Next.js 캐시 무효화
    revalidatePath('/')
    revalidateTag('metadata')
    
    // 메타데이터 강제 새로고침을 위한 응답
    const response = NextResponse.json({
      success: true,
      message: 'Metadata cache cleared successfully',
      timestamp: new Date().toISOString()
    })
    
    // 캐시 방지 헤더 추가
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error refreshing metadata:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to refresh metadata',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Metadata refresh endpoint is working',
    instructions: 'Use POST method to refresh metadata cache'
  })
} 