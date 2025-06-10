import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

function getIdFromRequest(request: NextRequest) {
  const url = new URL(request.url)
  const paths = url.pathname.split('/')
  return parseInt(paths[paths.length - 1])
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin session
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken || !sessionToken.startsWith('admin_')) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const id = getIdFromRequest(request)
    const body = await request.json()
    const { name, phone, bank_name, account_number, kakaopay_link } = body

    await pool.query(
      'UPDATE contacts SET name = ?, phone = ?, bank_name = ?, account_number = ?, kakaopay_link = ? WHERE id = ?',
      [name, phone, bank_name, account_number, kakaopay_link, id]
    )

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error updating contact:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to update contact',
      },
      { status: 500 }
    )
  }
} 