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
      console.log('❌ [DEBUG] Admin authentication failed')
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sortedIds } = body

    if (!sortedIds || !Array.isArray(sortedIds) || sortedIds.length === 0) {
      console.log('❌ [DEBUG] Invalid request data:', { sortedIds })
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid data: sortedIds array is required',
        },
        { status: 400 }
      )
    }

    console.log('🔍 [DEBUG] Updating gallery order with sorted IDs:', sortedIds)

    // 트랜잭션 시작
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // 제공된 순서대로 order_index 업데이트
      console.log('🔍 [DEBUG] Updating order_index for all items...')
      
      for (let i = 0; i < sortedIds.length; i++) {
        const imageId = sortedIds[i]
        const newOrderIndex = i + 1
        
        await connection.query(
          'UPDATE gallery SET order_index = ? WHERE id = ? AND image_type = "gallery" AND deleted_at IS NULL',
          [newOrderIndex, imageId]
        )
        console.log(`✅ [DEBUG] Updated order_index for image ID ${imageId} to ${newOrderIndex}`)
      }

      // 트랜잭션 커밋
      await connection.commit()
      console.log('✅ [DEBUG] Gallery order bulk update completed')

      return NextResponse.json<ApiResponse<null>>({
        success: true,
      })
    } catch (error) {
      // 에러 발생 시 롤백
      await connection.rollback()
      console.error('❌ [DEBUG] Transaction error:', error)
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('❌ [DEBUG] Error swapping gallery order:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to swap gallery order',
      },
      { status: 500 }
    )
  }
} 