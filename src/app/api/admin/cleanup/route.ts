import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { deletePhysicalFile } from '@/lib/fileUtils'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
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

    // Get all soft-deleted gallery items older than 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const formattedYesterday = yesterday.toISOString().slice(0, 19).replace('T', ' ')

    const [deletedRows] = await pool.query(
      'SELECT id, filename FROM gallery WHERE deleted_at IS NOT NULL AND deleted_at < ?',
      [formattedYesterday]
    )
    const deletedImages = deletedRows as { id: number; filename: string }[]

    let cleanedCount = 0
    const errors: string[] = []

    // Delete physical files and database records
    for (const image of deletedImages) {
      try {
        // Delete physical file
        if (image.filename) {
          await deletePhysicalFile(image.filename)
        }
        
        // Permanently delete from database
        await pool.query('DELETE FROM gallery WHERE id = ?', [image.id])
        cleanedCount++
      } catch (error) {
        console.error(`Error cleaning up image ${image.id}:`, error)
        errors.push(`Failed to clean image ${image.id}: ${image.filename}`)
      }
    }

    return NextResponse.json<ApiResponse<{ cleaned: number; errors: string[] }>>({
      success: true,
      data: {
        cleaned: cleanedCount,
        errors
      }
    })
  } catch (error) {
    console.error('Error in cleanup process:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to perform cleanup',
      },
      { status: 500 }
    )
  }
} 