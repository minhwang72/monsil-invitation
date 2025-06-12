import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyPassword } from '@/lib/encryption'
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

    // 저장된 해시된 비밀번호로 검증
    const [rows] = await pool.query(
      'SELECT password FROM guestbook WHERE id = ? AND deleted_at IS NULL',
      [id]
    )
    const resultRows = Array.isArray(rows) ? rows as RowDataPacket[] : []
    if (!resultRows.length) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Entry not found',
        },
        { status: 404 }
      )
    }

    const storedHashedPassword = resultRows[0].password as string
    if (!verifyPassword(password, storedHashedPassword)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid password',
        },
        { status: 401 }
      )
    }

    // 내용은 평문으로 업데이트
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

    // 저장된 해시된 비밀번호로 검증
    const [rows] = await pool.query(
      'SELECT password FROM guestbook WHERE id = ? AND deleted_at IS NULL',
      [id]
    )
    const resultRows = Array.isArray(rows) ? rows as RowDataPacket[] : []
    if (!resultRows.length) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Entry not found',
        },
        { status: 404 }
      )
    }

    const storedHashedPassword = resultRows[0].password as string
    if (!verifyPassword(password, storedHashedPassword)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid password',
        },
        { status: 401 }
      )
    }

    // 한국 시간으로 deleted_at 설정
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query('UPDATE guestbook SET deleted_at = ? WHERE id = ?', [formattedTime, id])

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