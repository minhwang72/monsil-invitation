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
    const { sourceId, targetId } = body

    if (!sourceId || !targetId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid data: sourceId and targetId are required',
        },
        { status: 400 }
      )
    }

    console.log('🔍 [DEBUG] Swapping gallery order:', { sourceId, targetId })

    // 트랜잭션 시작
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // 두 항목의 현재 order_index 조회
      const [rows] = await connection.query(
        'SELECT id, order_index FROM gallery WHERE id IN (?, ?) AND deleted_at IS NULL',
        [sourceId, targetId]
      )
      
      const items = rows as { id: number; order_index: number }[]
      if (items.length !== 2) {
        throw new Error('One or both items not found')
      }

      const [item1, item2] = items
      
      // order_index 교환
      await connection.query(
        'UPDATE gallery SET order_index = ? WHERE id = ?',
        [item2.order_index, item1.id]
      )
      await connection.query(
        'UPDATE gallery SET order_index = ? WHERE id = ?',
        [item1.order_index, item2.id]
      )

      // 트랜잭션 커밋
      await connection.commit()
      console.log('✅ [DEBUG] Gallery order swap completed')

      return NextResponse.json<ApiResponse<null>>({
        success: true,
      })
    } catch (error) {
      // 에러 발생 시 롤백
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('❌ [DEBUG] Error swapping gallery order:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to swap gallery order',
      },
      { status: 500 }
    )
  }
} 