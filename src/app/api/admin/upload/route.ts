import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import pool from '@/lib/db'
import { ensureUploadDir, generateFilename, getTodayDateString, deletePhysicalFile } from '@/lib/fileUtils'
import type { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 [DEBUG] Upload request started')
    
    // Check admin session
    const sessionToken = request.cookies.get('admin_session')?.value
    console.log('🔍 [DEBUG] Admin session:', sessionToken)

    if (!sessionToken || !sessionToken.startsWith('admin_')) {
      console.log('❌ [DEBUG] Unauthorized upload attempt')
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const imageType = formData.get('image_type') as string || 'gallery'
    
    console.log('🔍 [DEBUG] File info:', {
      name: file?.name,
      size: file?.size,
      type: file?.type,
      imageType
    })

    if (!file) {
      console.log('❌ [DEBUG] No file provided in upload')
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'No file uploaded',
        },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('🔍 [DEBUG] File converted to buffer, size:', buffer.length)

    // Generate paths and filename
    const dateString = getTodayDateString()
    const datePath = await ensureUploadDir(dateString)
    const filename = generateFilename(file.name)
    const filepath = join(datePath, filename)
    const dbFilename = `${dateString}/${filename}`
    
    console.log('🔍 [DEBUG] File paths:', {
      dateString,
      datePath,
      filename,
      filepath,
      dbFilename
    })

    // Handle main image type - soft delete existing main image and remove physical files
    if (imageType === 'main') {
      console.log('🔍 [DEBUG] Processing main image upload - deleting existing')
      const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
      const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
      
      // Get existing main images to delete physical files
      const [existingRows] = await pool.query(
        'SELECT filename FROM gallery WHERE image_type = "main" AND deleted_at IS NULL'
      )
      const existingImages = existingRows as { filename: string }[]
      console.log('🔍 [DEBUG] Existing main images to delete:', existingImages)
      
      // Soft delete existing main images
      await pool.query(
        'UPDATE gallery SET deleted_at = ? WHERE image_type = "main" AND deleted_at IS NULL',
        [formattedTime]
      )
      
      // Delete physical files
      for (const image of existingImages) {
        await deletePhysicalFile(image.filename)
        console.log('🔍 [DEBUG] Deleted physical file:', image.filename)
      }
    }

    // Save new file
    console.log('🔍 [DEBUG] Saving new file to:', filepath)
    await writeFile(filepath, buffer)
    console.log('✅ [DEBUG] File saved successfully')

    // Save to database
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
    
    console.log('🔍 [DEBUG] Inserting to database:', {
      dbFilename,
      imageType,
      formattedTime
    })

    const insertResult = await pool.query(
      'INSERT INTO gallery (filename, image_type, created_at) VALUES (?, ?, ?)',
      [dbFilename, imageType, formattedTime]
    )
    
    console.log('✅ [DEBUG] Database insert result:', insertResult)

    return NextResponse.json<ApiResponse<{ filename: string }>>({
      success: true,
      data: { filename: dbFilename },
    })
  } catch (error) {
    console.error('❌ [DEBUG] Error uploading file:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to upload file',
      },
      { status: 500 }
    )
  }
} 