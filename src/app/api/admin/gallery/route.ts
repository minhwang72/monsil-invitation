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

    console.log('🔍 [DEBUG] Reordering gallery with IDs:', reorderedIds)

    // First, check if order_index column exists, if not add it
    try {
      await pool.query(`
        ALTER TABLE gallery 
        ADD COLUMN order_index INT DEFAULT 0
      `)
      console.log('✅ [DEBUG] order_index column added')
    } catch (error: unknown) {
      const mysqlError = error as { code?: string; message?: string }
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ [DEBUG] order_index column already exists')
      } else {
        console.warn('⚠️ [DEBUG] Could not add order_index column:', mysqlError.message || 'Unknown error')
      }
    }

    // Update order_index for each item
    for (let i = 0; i < reorderedIds.length; i++) {
      const newOrder = i + 1 // Start from 1
      console.log(`🔍 [DEBUG] Setting order_index ${newOrder} for ID ${reorderedIds[i]}`)
      await pool.query(
        'UPDATE gallery SET order_index = ? WHERE id = ? AND deleted_at IS NULL',
        [newOrder, reorderedIds[i]]
      )
    }

    console.log('✅ [DEBUG] Gallery reordering completed')

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('❌ [DEBUG] Error reordering gallery:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to reorder gallery',
      },
      { status: 500 }
    )
  }
} 