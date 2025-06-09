import { NextResponse } from 'next/server'
import pool from '@/lib/db'

interface MySQLError extends Error {
  code?: string
}

export async function POST() {
  try {
    // guestbook 테이블에 deleted_at 컬럼 추가
    await pool.query(`
      ALTER TABLE guestbook 
      ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL
    `)

    return NextResponse.json({
      success: true,
      message: 'Migration completed: deleted_at column added to guestbook table'
    })
  } catch (error: unknown) {
    console.error('Migration error:', error)
    
    // 컬럼이 이미 존재하는 경우의 에러 처리
    const mysqlError = error as MySQLError
    if (mysqlError.code === 'ER_DUP_FIELDNAME') {
      return NextResponse.json({
        success: true,
        message: 'deleted_at column already exists'
      })
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 