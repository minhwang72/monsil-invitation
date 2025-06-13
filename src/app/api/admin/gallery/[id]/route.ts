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
        'SELECT filename, image_type, order_index FROM gallery WHERE id = ? AND deleted_at IS NULL',
        [id]
      )
      const items = rows as { filename: string; image_type: string; order_index: number }[]
      
      if (items.length === 0) {
        throw new Error('Item not found')
      }

      const item = items[0]
      const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
      const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

      // 항목 삭제 처리
      await connection.query(
        'UPDATE gallery SET deleted_at = ? WHERE id = ?',
        [formattedTime, id]
      )

      // 갤러리 이미지인 경우 order_index 재정렬
      if (item.image_type === 'gallery') {
        // 삭제된 항목보다 큰 order_index를 가진 항목들의 순서를 한 칸씩 앞으로 당김
        await connection.query(
          'UPDATE gallery SET order_index = order_index - 1 WHERE image_type = "gallery" AND order_index > ? AND deleted_at IS NULL',
          [item.order_index]
        )
      }

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