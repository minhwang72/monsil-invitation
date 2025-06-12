import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 메타데이터 관련 캐시 무효화
    revalidateTag('gallery')
    revalidateTag('cover-image')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Metadata refreshed successfully' 
    })
  } catch (error) {
    console.error('Error refreshing metadata:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to refresh metadata' },
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