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
    console.log('🔍 [DEBUG] Admin session:', sessionToken)

    if (!sessionToken || !sessionToken.startsWith('admin_')) {
      console.log('❌ [DEBUG] Unauthorized access attempt')
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
    console.log('🔍 [DEBUG] Contact ID:', id)
    console.log('🔍 [DEBUG] Request body:', JSON.stringify(body, null, 2))

    const { name, phone, bank_name, account_number, kakaopay_link } = body

    // Validate required fields
    if (!name || !phone) {
      console.log('❌ [DEBUG] Missing required fields:', { name, phone })
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Name and phone are required',
        },
        { status: 400 }
      )
    }

    console.log('🔍 [DEBUG] Updating contact with values:', {
      name, phone, bank_name, account_number, kakaopay_link, id
    })

    // Update contact
    const result = await pool.query(
      'UPDATE contacts SET name = ?, phone = ?, bank_name = ?, account_number = ?, kakaopay_link = ? WHERE id = ?',
      [name, phone, bank_name || null, account_number || null, kakaopay_link || null, id]
    )
    
    console.log('🔍 [DEBUG] Update result:', result)

    // Check if contact was actually updated
    const [updatedContact] = await pool.query(
      'SELECT * FROM contacts WHERE id = ?',
      [id]
    )
    console.log('🔍 [DEBUG] Updated contact from DB:', updatedContact)

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('❌ [DEBUG] Error updating contact:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to update contact',
      },
      { status: 500 }
    )
  }
} 