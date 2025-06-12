import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/encryption'
import type { ApiResponse, Guestbook } from '@/types'

export async function GET() {
  try {
    // 캐시 헤더와 함께 응답 최적화
    const [rows] = await pool.query(
      'SELECT id, name, content, created_at FROM guestbook WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 50'
    )
    const guestbookRows = rows as Guestbook[]
    
    // 이름과 내용은 평문으로 저장되므로 그대로 반환
    const response = NextResponse.json<ApiResponse<Guestbook[]>>({
      success: true,
      data: guestbookRows,
    })

    // 캐싱 헤더 추가 (1분 캐시)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=60')
    
    return response
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

    // 이름과 내용은 평문으로 저장, 비밀번호만 해시화
    const hashedPassword = hashPassword(password)

    // 한국 시간으로 현재 시간 생성
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query(
      'INSERT INTO guestbook (name, password, content, created_at) VALUES (?, ?, ?, ?)',
      [name, hashedPassword, content, formattedTime]
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

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const password = url.searchParams.get('password')

    if (!id || !password) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'ID와 비밀번호가 필요합니다.',
        },
        { status: 400 }
      )
    }

    // 저장된 비밀번호 확인
    const [passwordRows] = await pool.query(
      'SELECT password FROM guestbook WHERE id = ? AND deleted_at IS NULL',
      [id]
    )

    if (!Array.isArray(passwordRows) || passwordRows.length === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: '메시지를 찾을 수 없습니다.',
        },
        { status: 404 }
      )
    }

    const storedPassword = (passwordRows[0] as { password: string }).password
    
    // 비밀번호 검증 (해시된 비밀번호와 평문 비밀번호 모두 지원)
    let passwordMatch = false
    
    if (storedPassword.includes(':')) {
      // 해시된 비밀번호로 검증
      passwordMatch = verifyPassword(password, storedPassword)
    } else {
      // 평문 비밀번호로 검증 (기존 데이터 호환성)
      passwordMatch = password === storedPassword
      
      // 평문 비밀번호가 일치하면 이 기회에 해시화
      if (passwordMatch) {
        try {
          const hashedPassword = hashPassword(password)
          await pool.query(
            'UPDATE guestbook SET password = ? WHERE id = ?',
            [hashedPassword, id]
          )
          console.log(`Password hashed for guestbook entry ${id}`)
        } catch (hashError) {
          console.error('Failed to hash password during deletion:', hashError)
          // 해시화 실패해도 삭제는 진행
        }
      }
    }
    
    if (!passwordMatch) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: '비밀번호가 일치하지 않습니다.',
        },
        { status: 401 }
      )
    }

    // 한국 시간으로 현재 시간 생성하여 deleted_at에 설정
    const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000)) // UTC + 9시간
    const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')

    await pool.query(
      'UPDATE guestbook SET deleted_at = ? WHERE id = ?',
      [formattedTime, id]
    )

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting guestbook entry:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: '메시지 삭제에 실패했습니다.',
      },
      { status: 500 }
    )
  }
} 