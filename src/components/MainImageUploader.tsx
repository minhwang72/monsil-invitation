'use client'

import { useState, useRef, useCallback } from 'react'
import ImageCropper from './ImageCropper'

interface MainImageUploaderProps {
  onUploadSuccess: (fileUrl: string) => void
  className?: string
  disabled?: boolean
}

export default function MainImageUploader({
  onUploadSuccess,
  className = "",
  disabled = false
}: MainImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 파일 선택 처리
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    
    // 파일 크기 체크 (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError('파일 크기는 10MB 이하여야 합니다.')
      return
    }

    // 이미지 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있습니다.')
      return
    }

    // HEIC 파일 거부
    const isHeicFile = file.name.toLowerCase().includes('.heic') || file.type === 'image/heic'
    if (isHeicFile) {
      setError('HEIC 이미지는 지원되지 않습니다. JPG 또는 PNG로 업로드해 주세요.')
      return
    }

    setSelectedFile(file)
    
    // 이미지 미리보기 URL 생성
    const imageUrl = URL.createObjectURL(file)
    setOriginalImageUrl(imageUrl)
    setShowCropper(true)
  }, [])

  // 크롭 완료 후 업로드
  const handleCropComplete = useCallback(async (croppedImageBlob: Blob) => {
    if (!selectedFile) return

    setUploading(true)
    setShowCropper(false)
    
    try {
      // 크롭된 이미지를 File 객체로 변환
      const croppedFile = new File(
        [croppedImageBlob], 
        selectedFile.name.replace(/\.[^/.]+$/, '') + '_cropped.jpg',
        { type: 'image/jpeg' }
      )

      // FormData 생성
      const formData = new FormData()
      formData.append('file', croppedFile)
      formData.append('targetId', 'main_cover')

      // 업로드 API 호출
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success && result.data?.fileUrl) {
        // 브라우저 캐싱 방지를 위해 타임스탬프 추가
        const timestampedUrl = `${result.data.fileUrl}?t=${Date.now()}`
        
        // 미리보기 업데이트
        setPreview(timestampedUrl)
        onUploadSuccess(result.data.fileUrl) // 원본 URL을 콜백으로 전달
        
        // 3초 후 미리보기 정리 (혼란 방지)
        setTimeout(() => {
          setPreview(null)
        }, 3000)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : '업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
      // 정리
      if (originalImageUrl) {
        URL.revokeObjectURL(originalImageUrl)
        setOriginalImageUrl(null)
      }
      setSelectedFile(null)
    }
  }, [selectedFile, originalImageUrl, onUploadSuccess])

  // 크롭 취소
  const handleCropCancel = useCallback(() => {
    setShowCropper(false)
    if (originalImageUrl) {
      URL.revokeObjectURL(originalImageUrl)
      setOriginalImageUrl(null)
    }
    setSelectedFile(null)
    
    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [originalImageUrl])

  // 파일 선택 버튼 클릭
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* 파일 선택 버튼 */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={disabled || uploading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? '업로드 중...' : '메인 이미지 선택'}
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            JPG, PNG, WebP 지원 (최대 10MB)<br/>
            업로드 후 3:4 비율로 크롭할 수 있습니다
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 업로드 진행 상태 */}
        {uploading && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <p className="text-sm text-blue-600">이미지 업로드 중...</p>
            </div>
          </div>
        )}

        {/* 미리보기 */}
        {preview && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">업로드된 이미지:</p>
            <div className="relative w-48 h-64 mx-auto">
              <img
                src={preview}
                alt="Uploaded preview"
                className="w-full h-full object-cover rounded-lg border"
              />
            </div>
          </div>
        )}
      </div>

      {/* 이미지 크롭 모달 */}
      {showCropper && originalImageUrl && (
        <ImageCropper
          imageSrc={originalImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={3 / 4} // 3:4 비율
        />
      )}
    </div>
  )
} 