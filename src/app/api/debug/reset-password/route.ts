import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { hashPassword } from '@/lib/encryption'
import type { ApiResponse } from '@/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, newPassword, adminKey } = body

    // 임시 관리자 키 확인 (보안을 위해)
    if (adminKey !== 'temp_reset_key_2024') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!id || !newPassword) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'ID and new password required' },
        { status: 400 }
      )
    }

    // 해당 방명록이 존재하는지 확인
    const [rows] = await pool.query(
      'SELECT id FROM guestbook WHERE id = ? AND deleted_at IS NULL',
      [id]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    // 새 비밀번호 해시화
    const hashedPassword = hashPassword(newPassword)

    // 비밀번호 업데이트
    await pool.query(
      'UPDATE guestbook SET password = ? WHERE id = ?',
      [hashedPassword, id]
    )

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: `Password reset for guestbook entry ${id}` },
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Password reset failed' },
      { status: 500 }
    )
  }
} 