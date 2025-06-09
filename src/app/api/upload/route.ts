import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

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

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const date = new Date().toISOString().split('T')[0]
    const filename = `${Date.now()}-${file.name}`
    const filepath = join(uploadDir, date, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Save to database
    await pool.query(
      'INSERT INTO gallery (filename) VALUES (?)',
      [filename]
    )

    return NextResponse.json<ApiResponse<{ filename: string }>>({
      success: true,
      data: { filename },
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