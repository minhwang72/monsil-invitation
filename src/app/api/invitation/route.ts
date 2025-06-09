import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse, Invitation } from '@/types'

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM invitation LIMIT 1')
    const invitation = (rows as Invitation[])[0]

    return NextResponse.json<ApiResponse<Invitation>>({
      success: true,
      data: invitation,
    })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch invitation',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { groom, bride, wedding_date, main_img, message } = body

    await pool.query(
      'UPDATE invitation SET groom = ?, bride = ?, wedding_date = ?, main_img = ?, message = ? WHERE id = 1',
      [groom, bride, wedding_date, main_img, message]
    )

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    })
  } catch (error) {
    console.error('Error updating invitation:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to update invitation',
      },
      { status: 500 }
    )
  }
} 