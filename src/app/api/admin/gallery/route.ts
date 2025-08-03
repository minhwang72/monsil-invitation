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
    const { sourceId, targetId } = body

    if (!sourceId || !targetId) {
      console.log('❌ [DEBUG] Invalid request data:', { sourceId, targetId })
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
      
      const items = rows as { id: number; order_index: number | null }[]
      console.log('🔍 [DEBUG] Found items:', items)
      
      if (items.length !== 2) {
        throw new Error(`One or both items not found. Found ${items.length} items`)
      }

      const [item1, item2] = items
      
      // order_index가 NULL인 경우 처리
      if (item1.order_index === null || item2.order_index === null) {
        console.log('⚠️ [DEBUG] Found items with NULL order_index, updating them first')
        
        // 모든 갤러리 이미지를 created_at 순서로 조회하여 order_index 설정
        const [allGalleryRows] = await connection.query(`
          SELECT id FROM gallery 
          WHERE image_type = 'gallery' AND deleted_at IS NULL 
          ORDER BY created_at ASC
        `)
        const allGalleryImages = allGalleryRows as { id: number }[]
        
        // 각 이미지에 순서대로 order_index 설정 (1부터 시작)
        for (let i = 0; i < allGalleryImages.length; i++) {
          await connection.query(
            'UPDATE gallery SET order_index = ? WHERE id = ?',
            [i + 1, allGalleryImages[i].id]
          )
        }
        
        // 다시 두 항목 조회
        const [updatedRows] = await connection.query(
          'SELECT id, order_index FROM gallery WHERE id IN (?, ?) AND deleted_at IS NULL',
          [sourceId, targetId]
        )
        const updatedItems = updatedRows as { id: number; order_index: number }[]
        
        if (updatedItems.length !== 2) {
          throw new Error('Failed to update order_index for items')
        }
        
        const [updatedItem1, updatedItem2] = updatedItems
        console.log('🔍 [DEBUG] Updated items:', { 
          item1: { id: updatedItem1.id, order_index: updatedItem1.order_index },
          item2: { id: updatedItem2.id, order_index: updatedItem2.order_index }
        })
        
        // order_index 교환
        await connection.query(
          'UPDATE gallery SET order_index = ? WHERE id = ?',
          [updatedItem2.order_index, updatedItem1.id]
        )
        await connection.query(
          'UPDATE gallery SET order_index = ? WHERE id = ?',
          [updatedItem1.order_index, updatedItem2.id]
        )
      } else {
        console.log('🔍 [DEBUG] Swapping order_index:', { 
          item1: { id: item1.id, order_index: item1.order_index },
          item2: { id: item2.id, order_index: item2.order_index }
        })
        
        // order_index 교환
        await connection.query(
          'UPDATE gallery SET order_index = ? WHERE id = ?',
          [item2.order_index, item1.id]
        )
        await connection.query(
          'UPDATE gallery SET order_index = ? WHERE id = ?',
          [item1.order_index, item2.id]
        )
      }

      // 트랜잭션 커밋
      await connection.commit()
      console.log('✅ [DEBUG] Gallery order swap completed')

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