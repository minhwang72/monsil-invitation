import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyPassword, hashPassword } from '@/lib/encryption'
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

    // 저장된 비밀번호 확인
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

    const storedPassword = resultRows[0].password as string
    
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
          console.error('Failed to hash password during update:', hashError)
          // 해시화 실패해도 업데이트는 진행
        }
      }
    }
    
    if (!passwordMatch) {
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

    // 저장된 비밀번호 확인
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

    const storedPassword = resultRows[0].password as string
    
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