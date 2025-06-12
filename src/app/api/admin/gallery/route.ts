import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'
import { join } from 'path'

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

    // Get current filenames for renaming
    const [galleryRows] = await pool.query(
      'SELECT id, filename FROM gallery WHERE id IN (?) AND deleted_at IS NULL',
      [reorderedIds]
    )
    const galleryItems = galleryRows as { id: number; filename: string }[]
    
    console.log('🔍 [DEBUG] Current gallery items:', galleryItems)

    // Update order_index and filename for each item
    for (let i = 0; i < reorderedIds.length; i++) {
      const newOrder = i + 1 // Start from 1
      const itemId = reorderedIds[i]
      const currentItem = galleryItems.find(item => item.id === itemId)
      
      if (currentItem) {
        // Generate new filename: gallery_(순서번호).jpg
        const newFilename = `gallery_${newOrder}.jpg`
        const newDbPath = `images/${newFilename}`
        const currentFilename = currentItem.filename
        
        // Rename physical file if filename changed
        if (currentFilename !== newDbPath) {
          try {
            const oldFilePath = join(process.cwd(), 'public', 'uploads', currentFilename)
            const newFilePath = join(process.cwd(), 'public', 'uploads', newDbPath)
            
            await import('fs/promises').then(fs => fs.rename(oldFilePath, newFilePath))
            console.log(`✅ [DEBUG] Renamed file: ${currentFilename} -> ${newDbPath}`)
          } catch (renameError) {
            console.warn(`⚠️ [DEBUG] Failed to rename file: ${currentFilename}`, renameError)
          }
        }
        
        // Update database with new order and filename
        console.log(`🔍 [DEBUG] Updating ID ${itemId}: order=${newOrder}, filename=${newDbPath}`)
        await pool.query(
          'UPDATE gallery SET order_index = ?, filename = ? WHERE id = ? AND deleted_at IS NULL',
          [newOrder, newDbPath, itemId]
        )
      }
    }

    console.log('✅ [DEBUG] Gallery reordering and renaming completed')

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