import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { deletePhysicalFile } from '@/lib/fileUtils'
import type { ApiResponse } from '@/types'

function getIdFromRequest(request: NextRequest) {
  const url = new URL(request.url)
  const paths = url.pathname.split('/')
  return parseInt(paths[paths.length - 1])
}

export async function DELETE(request: NextRequest) {
  try {
    const id = getIdFromRequest(request)
    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid ID',
        },
        { status: 400 }
      )
    }

    // 트랜잭션 시작
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // 삭제할 항목의 정보 조회
      const [rows] = await connection.query(
        'SELECT filename, image_type, order_index FROM gallery WHERE id = ?',
        [id]
      )
      const items = rows as { filename: string; image_type: string; order_index: number }[]
      
      if (items.length === 0) {
        throw new Error('Item not found')
      }

      const item = items[0]

      // 갤러리 이미지인 경우 order_index 재정렬 (삭제 전에 수행)
      if (item.image_type === 'gallery' && item.order_index !== null) {
        // 삭제될 항목보다 큰 order_index를 가진 항목들의 순서를 한 칸씩 앞으로 당김
        await connection.query(
          'UPDATE gallery SET order_index = order_index - 1 WHERE image_type = "gallery" AND order_index > ?',
          [item.order_index]
        )
        
        console.log('🔍 [DEBUG] Reordered gallery items before deletion:', {
          deletedOrderIndex: item.order_index,
          affectedRows: (await connection.query(
            'SELECT COUNT(*) as count FROM gallery WHERE image_type = "gallery" AND order_index > ?',
            [item.order_index]
          ))[0]
        })
      }

      // 항목 실제 삭제 처리
      await connection.query(
        'DELETE FROM gallery WHERE id = ?',
        [id]
      )

      // 트랜잭션 커밋
      await connection.commit()

      // 물리적 파일 삭제
      if (item.filename) {
        await deletePhysicalFile(item.filename)
      }

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
    console.error('Error deleting gallery entry:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to delete gallery entry',
      },
      { status: 500 }
    )
  }
} 