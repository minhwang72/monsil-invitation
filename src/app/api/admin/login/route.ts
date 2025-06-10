import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { decryptPassword } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자명으로 admin 조회
    const [rows] = await pool.query(
      'SELECT id, username, password FROM admin WHERE username = ?',
      [username]
    )
    
    const adminRows = rows as { id: number; username: string; password: string }[]
    
    if (adminRows.length === 0) {
      return NextResponse.json(
        { success: false, message: '잘못된 사용자명 또는 비밀번호입니다.' },
        { status: 401 }
      )
    }

    const admin = adminRows[0]
    
    // 저장된 암호화된 비밀번호를 복호화해서 비교
    try {
      const decryptedPassword = decryptPassword(admin.password)
      
      if (password !== decryptedPassword) {
        return NextResponse.json(
          { success: false, message: '잘못된 사용자명 또는 비밀번호입니다.' },
          { status: 401 }
        )
      }
    } catch (error) {
      console.error('Password decryption error:', error)
      return NextResponse.json(
        { success: false, message: '로그인 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 세션 생성 (24시간)
    const sessionId = `admin_${admin.id}_${Date.now()}`
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간

    const response = NextResponse.json({
      success: true,
      message: '로그인에 성공했습니다.',
      admin: {
        id: admin.id,
        username: admin.username
      }
    })

    // httpOnly 쿠키 설정
    response.cookies.set('admin_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 