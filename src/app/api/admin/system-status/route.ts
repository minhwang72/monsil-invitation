import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { checkDirectoryStatus } from '@/lib/fileUtils'
import { existsSync, readdirSync } from 'fs'
import pool from '@/lib/db'
import type { ApiResponse } from '@/types'

export async function GET(request: NextRequest) {
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

    // 여러 디렉토리 상태 확인
    const directories = [
      { name: 'uploads_base', path: join(process.cwd(), 'public', 'uploads') },
      { name: 'uploads_images', path: join(process.cwd(), 'public', 'uploads', 'images') },
      { name: 'uploads_today', path: join(process.cwd(), 'public', 'uploads', new Date().toISOString().split('T')[0]) },
      { name: 'public', path: join(process.cwd(), 'public') },
      { name: 'project_root', path: process.cwd() },
    ]

    const results = []

    for (const dir of directories) {
      const status = await checkDirectoryStatus(dir.path)
      
      // 디렉토리 내 파일 목록 추가
      let files: string[] = []
      try {
        if (existsSync(dir.path)) {
          files = readdirSync(dir.path).slice(0, 10) // 최대 10개 파일만
        }
      } catch (error) {
        console.error('Error reading directory:', error)
      }
      
      results.push({
        name: dir.name,
        path: dir.path,
        files: files,
        ...status
      })
    }

    // 갤러리 DB 데이터와 파일 매칭 확인
    const galleryMismatch = []
    try {
      const [galleryRows] = await pool.query(`
        SELECT id, filename, image_type, created_at
        FROM gallery 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC
        LIMIT 20
      `)
      
      const galleryImages = galleryRows as { id: number; filename: string; image_type: string; created_at: Date }[]
      
      for (const image of galleryImages) {
        const filePath = join(process.cwd(), 'public', 'uploads', image.filename)
        const exists = existsSync(filePath)
        
        galleryMismatch.push({
          id: image.id,
          filename: image.filename,
          image_type: image.image_type,
          fileExists: exists,
          fullPath: filePath,
          url: `/uploads/${image.filename}`
        })
      }
    } catch (error) {
      console.error('Error checking gallery files:', error)
    }

    // Node.js 프로세스 정보
    const processInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        AWS_REGION: process.env.AWS_REGION,
        RAILWAY_PROJECT_ID: process.env.RAILWAY_PROJECT_ID,
      },
      uid: process.getuid ? process.getuid() : 'N/A',
      gid: process.getgid ? process.getgid() : 'N/A',
    }

    return NextResponse.json<ApiResponse<{
      directories: Array<{
        name: string;
        path: string;
        files: string[];
        exists: boolean;
        writable: boolean;
        stats?: {
          isDirectory: boolean;
          mode: number;
          size: number;
          mtime: Date;
        };
      }>;
      galleryFileCheck: Array<{
        id: number;
        filename: string;
        image_type: string;
        fileExists: boolean;
        fullPath: string;
        url: string;
      }>;
      process: {
        nodeVersion: string;
        platform: string;
        arch: string;
        cwd: string;
        env: Record<string, string | undefined>;
        uid: string | number;
        gid: string | number;
      };
      timestamp: string;
    }>>({
      success: true,
      data: {
        directories: results,
        galleryFileCheck: galleryMismatch,
        process: processInfo,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('System status check error:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: `System status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    )
  }
} 