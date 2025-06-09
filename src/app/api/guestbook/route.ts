import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse, Guestbook } from '@/types'

export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, content, created_at FROM guestbook ORDER BY created_at DESC'
    )
    const guestbookRows = rows as Guestbook[]
    
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

    // 한국 시간으로 현재 시간 생성
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query(
      'INSERT INTO guestbook (name, password, content, created_at) VALUES (?, ?, ?, ?)',
      [name, password, content, formattedTime]
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