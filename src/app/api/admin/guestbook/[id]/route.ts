import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

function getIdFromRequest(request: NextRequest) {
  const url = new URL(request.url)
  const paths = url.pathname.split('/')
  return parseInt(paths[paths.length - 1])
}

export async function DELETE(request: NextRequest) {
  try {
    // Check admin session
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !sessionToken.startsWith('admin_')) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const id = getIdFromRequest(request)

    // Soft delete - set deleted_at timestamp
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
    await pool.query('UPDATE guestbook SET deleted_at = ? WHERE id = ?', [formattedTime, id])

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting guestbook entry:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to delete guestbook entry',
      },
      { status: 500 }
    )
  }
} 