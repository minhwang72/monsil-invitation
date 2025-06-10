import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'
import type { RowDataPacket } from 'mysql2'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Password is required',
        },
        { status: 400 }
      )
    }

    // Check if admin table exists, create if not
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin (
          id INT AUTO_INCREMENT PRIMARY KEY,
          password VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Insert default admin password if table is empty
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM admin')
      const typedRows = rows as { count: number }[]
      const count = typedRows[0].count

      if (count === 0) {
        await pool.query(
          'INSERT INTO admin (password) VALUES (?)',
          ['admin123'] // 기본 비밀번호
        )
      }
    } catch (error) {
      console.error('Error setting up admin table:', error)
    }

    // Verify password
    const [adminRows] = await pool.query(
      'SELECT id FROM admin WHERE password = ? LIMIT 1',
      [password]
    )
    const resultRows = Array.isArray(adminRows) ? adminRows as RowDataPacket[] : []
    
    if (!resultRows.length) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Invalid password',
        },
        { status: 401 }
      )
    }

    // Create session token (simple implementation)
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const response = NextResponse.json<ApiResponse<{ token: string }>>({
      success: true,
      data: { token: sessionToken }
    })

    // Set session cookie (24 hours)
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Error in admin login:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Login failed',
      },
      { status: 500 }
    )
  }
} 