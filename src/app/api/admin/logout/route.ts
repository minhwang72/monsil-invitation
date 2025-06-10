import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types'

export async function POST() {
  try {
    const response = NextResponse.json<ApiResponse<null>>({
      success: true,
    })

    // Clear session cookie
    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    })

    return response
  } catch (error) {
    console.error('Error in admin logout:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Logout failed',
      },
      { status: 500 }
    )
  }
} 