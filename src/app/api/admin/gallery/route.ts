import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

// Check admin authentication
function checkAdminAuth(request: NextRequest) {
  const sessionToken = request.cookies.get('admin_session')?.value
  return sessionToken && sessionToken.startsWith('admin_')
}

export async function PUT(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reorderedIds } = body

    if (!Array.isArray(reorderedIds)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid data: reorderedIds must be an array',
        },
        { status: 400 }
      )
    }

    // Update order using a temporary order field (using created_at as order proxy)
    // We'll update them in reverse order to maintain the desired sequence
    for (let i = 0; i < reorderedIds.length; i++) {
      const newOrder = Date.now() + i // Use timestamp + index for ordering
      await pool.query(
        'UPDATE gallery SET created_at = FROM_UNIXTIME(?) WHERE id = ? AND deleted_at IS NULL',
        [newOrder / 1000, reorderedIds[i]]
      )
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error reordering gallery:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to reorder gallery',
      },
      { status: 500 }
    )
  }
} 