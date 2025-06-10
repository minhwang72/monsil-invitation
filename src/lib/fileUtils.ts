import { mkdir, unlink, access } from 'fs/promises'
import { join } from 'path'

export const UPLOAD_BASE_DIR = join(process.cwd(), 'public', 'uploads')

export async function ensureUploadDir(dateString: string): Promise<string> {
  const datePath = join(UPLOAD_BASE_DIR, dateString)
  
  try {
    await mkdir(datePath, { recursive: true })
  } catch (error) {
    // Directory might already exist, that's okay
    console.log('Directory creation info:', error)
  }
  
  return datePath
}

export async function deletePhysicalFile(filename: string): Promise<void> {
  if (!filename) return
  
  const fullPath = join(UPLOAD_BASE_DIR, filename)
  
  try {
    await access(fullPath)
    await unlink(fullPath)
    console.log(`File deleted: ${fullPath}`)
  } catch (error) {
    // File might not exist, that's okay
    console.log(`File deletion info: ${fullPath}`, error)
  }
}

export function generateFilename(originalName: string, forceJpeg: boolean = false): string {
  const timestamp = Date.now()
  const originalExt = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  
  // HEIC나 HEIF 파일이거나 강제 JPEG 변환이 요청된 경우 JPEG로 변환
  if (forceJpeg || ['heic', 'heif'].includes(originalExt)) {
    return `${timestamp}.jpg`
  }
  
  return `${timestamp}.${originalExt}`
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
} 