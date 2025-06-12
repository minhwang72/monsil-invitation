import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse, ContactPerson } from '@/types'

function checkAdminAuth(request: NextRequest): boolean {
  const sessionToken = request.cookies.get('admin_session')?.value
  return !!(sessionToken && sessionToken.startsWith('admin_'))
}

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    )
  }

  try {
    const [rows] = await pool.query('SELECT * FROM contacts ORDER BY side, relationship')
    return NextResponse.json<ApiResponse<ContactPerson[]>>({
      success: true,
      data: rows as ContactPerson[],
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch contacts',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { side, relationship, name, phone, bank_name, account_number, kakaopay_link } = body

    // 입력 유효성 검사
    if (!side || !relationship || !name.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Side, relationship, and name are required',
        },
        { status: 400 }
      )
    }

    // 연락처 추가
    const [result] = await pool.query(
      'INSERT INTO contacts (side, relationship, name, phone, bank_name, account_number, kakaopay_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [side, relationship, name, phone || '', bank_name || null, account_number || null, kakaopay_link || null]
    )

    const insertResult = result as { insertId: number }

    return NextResponse.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id: insertResult.insertId },
    })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to create contact',
      },
      { status: 500 }
    )
  }
} 