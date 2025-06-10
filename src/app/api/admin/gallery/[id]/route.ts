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

    // Get filename before deleting
    const [existingRows] = await pool.query(
      'SELECT filename FROM gallery WHERE id = ? AND deleted_at IS NULL',
      [id]
    )
    const existingImages = existingRows as { filename: string }[]

    if (existingImages.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Gallery item not found',
        },
        { status: 404 }
      )
    }

    // Soft delete gallery item
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query(
      'UPDATE gallery SET deleted_at = ? WHERE id = ?',
      [formattedTime, id]
    )

    // Delete physical file
    if (existingImages[0].filename) {
      await deletePhysicalFile(existingImages[0].filename)
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to delete gallery item',
      },
      { status: 500 }
    )
  }
} 