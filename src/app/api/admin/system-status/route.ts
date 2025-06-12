import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { checkDirectoryStatus } from '@/lib/fileUtils'
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
      results.push({
        name: dir.name,
        path: dir.path,
        ...status
      })
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
      },
      uid: process.getuid ? process.getuid() : 'N/A',
      gid: process.getgid ? process.getgid() : 'N/A',
    }

    return NextResponse.json<ApiResponse<{
      directories: Array<{
        name: string;
        path: string;
        exists: boolean;
        writable: boolean;
        stats?: {
          isDirectory: boolean;
          mode: number;
          size: number;
          mtime: Date;
        };
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