'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImageBlob: Blob) => void
  onCancel: () => void
  aspectRatio?: number | null // null이면 자유 비율
  title?: string
  description?: string
  showAspectOptions?: boolean // 비율 옵션 표시 여부
}

// Canvas에서 크롭된 이미지 생성하는 헬퍼 함수
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  const maxSize = Math.max(image.width, image.height)
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

  canvas.width = safeArea
  canvas.height = safeArea

  ctx.translate(safeArea / 2, safeArea / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-safeArea / 2, -safeArea / 2)

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  )

  const data = ctx.getImageData(0, 0, safeArea, safeArea)

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
    }, 'image/jpeg', 0.85)
  })
}

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 3 / 4, // 3:4 비율 (세로가 더 긴 비율)
  title = '이미지 크롭',
  description = '드래그로 위치 조정, 마우스 휠로 줌 조정 가능합니다. 메인 이미지에 최적화된 3:4 비율로 크롭됩니다.',
  showAspectOptions = true
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropCompleteHandler = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return

    try {
      setProcessing(true)
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error('크롭 처리 중 오류:', e)
      alert('이미지 크롭 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="relative bg-gray-100 flex-1 min-h-[400px] rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            cropShape="rect"
            showGrid={true}
          />
        </div>
        
        <div className="mt-4 space-y-4">
          {/* 줌 컨트롤 */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 min-w-[40px]">줌:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 min-w-[60px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          
          {/* 안내 텍스트 */}
          <p className="text-sm text-gray-600 text-center">
            {description}
          </p>
          
          {/* 버튼들 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={processing}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleCropConfirm}
              disabled={processing}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? '처리 중...' : '크롭 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 