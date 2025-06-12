import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyPassword } from '@/lib/encryption'
import type { ApiResponse } from '@/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const testPassword = searchParams.get('password')
    const bruteforce = searchParams.get('bruteforce')

    if (!id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'ID required' },
        { status: 400 }
      )
    }

    // 해당 ID의 비밀번호 정보 확인
    const [rows] = await pool.query(
      'SELECT id, password, created_at FROM guestbook WHERE id = ? AND deleted_at IS NULL',
      [id]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Entry not found' },
        { status: 404 }
      )
    }

    const entry = rows[0] as { id: number; password: string; created_at: string }
    
    const debugInfo: {
      id: number
      created_at: string
      password_format: string
      password_length: number
      password_preview: string
      password_test?: string
      bruteforce_results?: { password: string; match: boolean }[]
    } = {
      id: entry.id,
      created_at: entry.created_at,
      password_format: entry.password.includes(':') ? 'hashed' : 'plaintext',
      password_length: entry.password.length,
      password_preview: entry.password.substring(0, 20) + '...',
    }

    // 테스트 비밀번호가 제공된 경우 검증 테스트
    if (testPassword) {
      if (entry.password.includes(':')) {
        // 해시된 비밀번호
        debugInfo.password_test = verifyPassword(testPassword, entry.password) ? 'MATCH' : 'NO_MATCH'
      } else {
        // 평문 비밀번호
        debugInfo.password_test = testPassword === entry.password ? 'MATCH' : 'NO_MATCH'
      }
    }

    // 브루트포스 모드가 활성화된 경우 일반적인 비밀번호들을 테스트
    if (bruteforce === 'true' && entry.password.includes(':')) {
      const commonPasswords = [
        'password', '123456', '12345678', 'qwerty', 'abc123',
        'password123', '123456789', 'welcome', 'admin', 'login',
        'test', 'user', '1234', '0000', '1111', '2222', '3333',
        'asdf', 'qwer', 'zxcv', 'asdf1234', 'qwer1234',
        'asdfasdf', 'qwerqwer', '1q2w3e4r', 'a1b2c3d4',
        'password1', 'password12', 'password123', 'admin123',
        'test123', 'user123', '123123', '321321', '111111',
        '222222', '333333', '444444', '555555', '666666',
        '777777', '888888', '999999', '000000', '1234567890'
      ]

      debugInfo.bruteforce_results = commonPasswords.map(pwd => ({
        password: pwd,
        match: verifyPassword(pwd, entry.password)
      })).filter(result => result.match) // 일치하는 것만 반환
    }

    return NextResponse.json<ApiResponse<typeof debugInfo>>({
      success: true,
      data: debugInfo,
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    )
  }
} 