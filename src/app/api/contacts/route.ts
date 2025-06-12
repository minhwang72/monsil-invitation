import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse, ContactPerson } from '@/types'

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT id, side, relationship, name, phone, bank_name, account_number, kakaopay_link 
      FROM contacts 
      ORDER BY side, 
        CASE relationship 
          WHEN 'person' THEN 1 
          WHEN 'father' THEN 2 
          WHEN 'mother' THEN 3 
        END
    `)
    
    const contacts = rows as ContactPerson[]
    
    const response = NextResponse.json<ApiResponse<ContactPerson[]>>({
      success: true,
      data: contacts,
    })

    // 캐싱 헤더 제거 - 관리자 수정사항이 바로 반영되도록
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { side, relationship, name, phone, bank_name, account_number, kakaopay_link } = body

    await pool.query(
      'INSERT INTO contacts (side, relationship, name, phone, bank_name, account_number, kakaopay_link) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [side, relationship, name, phone, bank_name, account_number, kakaopay_link]
    )

    return NextResponse.json<ApiResponse<null>>({
      success: true,
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