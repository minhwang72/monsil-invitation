import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse, Guestbook } from '@/types'

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, content, created_at FROM guestbook ORDER BY created_at DESC'
    )
    const guestbookRows = rows as Guestbook[]
    
    console.log('Guestbook query result:', guestbookRows)
    console.log('Number of rows:', guestbookRows.length)
    
    return NextResponse.json<ApiResponse<Guestbook[]>>({
      success: true,
      data: guestbookRows,
    })
  } catch (error) {
    console.error('Error fetching guestbook:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch guestbook',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, password, content } = body

    await pool.query(
      'INSERT INTO guestbook (name, password, content) VALUES (?, ?, ?)',
      [name, password, content]
    )

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error creating guestbook entry:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to create guestbook entry',
      },
      { status: 500 }
    )
  }
} 