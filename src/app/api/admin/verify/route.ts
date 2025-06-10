import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !sessionToken.startsWith('admin_')) {
      return NextResponse.json<ApiResponse<{ authenticated: boolean }>>({
        success: true,
        data: { authenticated: false }
      })
    }

    // Simple session validation (in production, you'd want to store sessions in database)
    return NextResponse.json<ApiResponse<{ authenticated: boolean }>>({
      success: true,
      data: { authenticated: true }
    })
  } catch (error) {
    console.error('Error verifying admin session:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Verification failed',
      },
      { status: 500 }
    )
  }
} 