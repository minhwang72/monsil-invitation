import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

// 어드민용 게스트북 응답 타입 (deleted_at 포함)
interface AdminGuestbookResponse {
  id: number
  name: string
  content: string
  created_at: string // 포맷된 문자열
  deleted_at?: string | null
}

export async function GET(request: Request) {
  try {
    // Check admin session
    const sessionToken = request.headers.get('cookie')?.match(/admin_session=([^;]+)/)?.[1]

    if (!sessionToken || !sessionToken.startsWith('admin_')) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // 어드민용: 모든 방명록 조회 (삭제된 것 포함)
    const [rows] = await pool.query(
      'SELECT id, name, content, created_at, deleted_at FROM guestbook ORDER BY created_at DESC LIMIT 50'
    )
    const guestbookRows = rows as Array<{
      id: number
      name: string
      content: string
      created_at: string
      deleted_at: string | null
    }>
    
    // DB에서 가져온 시간을 원하는 형식으로 포맷팅
    const formattedGuestbook: AdminGuestbookResponse[] = guestbookRows.map(row => {
      // MySQL DATETIME을 Date 객체로 변환
      const dbDate = new Date(row.created_at)
      
      // 한국 시간 형식으로 포맷팅 (YYYY. MM. DD HH:mm)
      const year = dbDate.getFullYear()
      const month = String(dbDate.getMonth() + 1).padStart(2, '0')
      const day = String(dbDate.getDate()).padStart(2, '0')
      const hours = String(dbDate.getHours()).padStart(2, '0')
      const minutes = String(dbDate.getMinutes()).padStart(2, '0')
      const formattedDate = `${year}. ${month}. ${day} ${hours}:${minutes}`
      
      return {
        id: row.id,
        name: row.name,
        content: row.content,
        created_at: formattedDate,
        deleted_at: row.deleted_at ? String(row.deleted_at) : null
      }
    })
    
    const response = NextResponse.json<ApiResponse<AdminGuestbookResponse[]>>({
      success: true,
      data: formattedGuestbook,
    })

    // 캐싱 헤더 제거 - 관리자 수정사항이 바로 반영되도록
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching admin guestbook:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Failed to fetch guestbook',
      },
      { status: 500 }
    )
  }
} 