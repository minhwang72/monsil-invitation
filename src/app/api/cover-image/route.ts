import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function GET() {
  try {
    // 메인 이미지 조회 (삭제되지 않은 것 중 가장 최근 것)
    const [rows] = await pool.query(`
      SELECT filename 
      FROM gallery 
      WHERE image_type = 'main' 
        AND deleted_at IS NULL 
        AND filename IS NOT NULL
      ORDER BY created_at DESC 
      LIMIT 1
    `)
    
    const result = rows as { filename: string }[]
    
    if (result.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'No cover image found',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse<{ url: string }>>({
      success: true,
      data: { url: `/uploads/${result[0].filename}` },
    })
  } catch (error) {
    console.error('Error fetching cover image:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch cover image',
      },
      { status: 500 }
    )
  }
} 