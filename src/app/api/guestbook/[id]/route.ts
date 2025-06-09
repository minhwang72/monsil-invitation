import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'
import type { RowDataPacket } from 'mysql2'

function getIdFromRequest(request: NextRequest) {
  const url = new URL(request.url)
  const paths = url.pathname.split('/')
  return parseInt(paths[paths.length - 1])
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, content } = body
    const id = getIdFromRequest(request)

    // Verify password
    const [rows] = await pool.query(
      'SELECT id FROM guestbook WHERE id = ? AND password = ?',
      [id, password]
    )
    const resultRows = Array.isArray(rows) ? rows as RowDataPacket[] : []
    if (!resultRows.length) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid password',
        },
        { status: 401 }
      )
    }

    // Update content
    await pool.query('UPDATE guestbook SET content = ? WHERE id = ?', [
      content,
      id,
    ])

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error updating guestbook entry:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to update guestbook entry',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const password = searchParams.get('password')
    const id = getIdFromRequest(request)

    if (!password) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Password is required',
        },
        { status: 400 }
      )
    }

    // Verify password
    const [rows] = await pool.query(
      'SELECT id FROM guestbook WHERE id = ? AND password = ?',
      [id, password]
    )
    const resultRows = Array.isArray(rows) ? rows as RowDataPacket[] : []
    if (!resultRows.length) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid password',
        },
        { status: 401 }
      )
    }

    // Delete entry
    await pool.query('DELETE FROM guestbook WHERE id = ?', [id])

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting guestbook entry:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to delete guestbook entry',
      },
      { status: 500 }
    )
  }
} 