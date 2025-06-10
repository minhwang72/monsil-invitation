import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import pool from '@/lib/db'
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const imageType = formData.get('image_type') as string || 'gallery'

    if (!file) {
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

    // Create directory structure
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const date = new Date().toISOString().split('T')[0]
    const datePath = join(uploadDir, date)

    try {
      await mkdir(datePath, { recursive: true })
    } catch {
      // Directory might already exist
    }

    // Generate filename
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const filename = `${timestamp}.${fileExt}`
    const filepath = join(datePath, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Handle main image type - replace existing main image
    if (imageType === 'main') {
      const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
      const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
      
      // Soft delete existing main image
      await pool.query(
        'UPDATE gallery SET deleted_at = ? WHERE image_type = "main" AND deleted_at IS NULL',
        [formattedTime]
      )
    }

    // Save to database
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query(
      'INSERT INTO gallery (filename, image_type, created_at) VALUES (?, ?, ?)',
      [`${date}/${filename}`, imageType, formattedTime]
    )

    return NextResponse.json<ApiResponse<{ filename: string }>>({
      success: true,
      data: { filename: `${date}/${filename}` },
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to upload file',
      },
      { status: 500 }
    )
  }
} 