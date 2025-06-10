import Image from 'next/image'
import { useState } from 'react'
import type { Gallery } from '@/types'

interface GallerySectionProps {
  gallery: Gallery[]
}

type DisplayImage = Gallery | {
  id: number
  url: string
  isPlaceholder: boolean
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
  const [showAll, setShowAll] = useState(false)

  // 실제 갤러리 이미지가 있으면 사용하고, 없으면 12개의 기본 placeholder 이미지 생성 (더보기 기능 테스트용)
  const placeholderImages: DisplayImage[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    url: `/images/gallery/placeholder-${i + 1}.jpg`,
    isPlaceholder: true,
  }))

  const displayImages: DisplayImage[] = gallery && gallery.length > 0 
    ? gallery 
    : placeholderImages

  // 표시할 이미지 개수 결정 (9개 제한 또는 모든 이미지)
  const imagesToShow = showAll ? displayImages : displayImages.slice(0, 9)
  const hasMoreImages = displayImages.length > 9

  // 이미지 로드 실패 핸들러
  const handleImageError = (imageId: number) => {
    setFailedImages(prev => new Set(prev).add(imageId))
  }

  const toggleShowAll = () => {
    setShowAll(!showAll)
  }

  const openModal = (index: number) => {
    setCurrentImageIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? imagesToShow.length - 1 : prev - 1
    )
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => 
      prev === imagesToShow.length - 1 ? 0 : prev + 1
    )
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
  }

  // 터치 이벤트 핸들러
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null) // 이전 터치 종료점 초기화
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      goToNext() // 왼쪽으로 스와이프하면 다음 이미지
    }
    if (isRightSwipe) {
      goToPrevious() // 오른쪽으로 스와이프하면 이전 이미지
    }
  }

  return (
    <>
      <section className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-white">
        <div className="max-w-xl mx-auto text-center w-full px-4">
          {/* 제목 */}
          <h2 className="text-4xl font-light mb-16 tracking-wider text-gray-700 font-english english-text">
            GALLERY
          </h2>

          {/* 상단 가로선 */}
          <div className="w-full h-px bg-gray-200 mb-8"></div>

          {/* 갤러리 그리드 */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {imagesToShow.map((item, index) => (
              <div 
                key={item.id} 
                className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => openModal(index)}
              >
                {('isPlaceholder' in item && item.isPlaceholder) || failedImages.has(item.id) ? (
                  <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt="Gallery"
                    fill
                    className="object-cover"
                    onError={() => handleImageError(item.id)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 더보기/접기 버튼 */}
          {hasMoreImages && (
            <div className="flex justify-center mb-8">
              <button
                onClick={toggleShowAll}
                className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-sans"
              >
                <span className="text-sm font-light">
                  {showAll ? '접기' : '더보기'}
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* 하단 가로선 */}
          <div className="w-full h-px bg-gray-200"></div>
        </div>
      </section>

      {/* 모달 */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90"
          onClick={handleBackgroundClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2 md:p-1"
          >
            <svg
              className="w-10 h-10 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* 이전 버튼 */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 md:p-1"
          >
            <svg
              className="w-10 h-10 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* 다음 버튼 */}
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 md:p-1"
          >
            <svg
              className="w-10 h-10 md:w-8 md:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* 이미지 컨테이너 */}
          <div 
            className="relative max-w-4xl max-h-[80vh] mx-auto flex flex-col items-center justify-center p-8"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex-1 flex items-center justify-center w-full">
              {('isPlaceholder' in imagesToShow[currentImageIndex] && imagesToShow[currentImageIndex].isPlaceholder) || failedImages.has(imagesToShow[currentImageIndex].id) ? (
                <div className="bg-gray-100 rounded-lg flex items-center justify-center w-96 h-96">
                  <svg
                    className="w-24 h-24 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              ) : (
                <div className="relative w-full max-w-3xl max-h-[60vh] aspect-auto">
                  <Image
                    src={imagesToShow[currentImageIndex].url}
                    alt="Gallery"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 80vw, 70vw"
                    onError={() => handleImageError(imagesToShow[currentImageIndex].id)}
                  />
                </div>
              )}
            </div>

            {/* 이전/다음 텍스트 버튼 */}
            <div className="w-full max-w-md flex justify-between items-center mt-6 px-4">
              <button
                onClick={goToPrevious}
                className="flex items-center gap-1 text-white hover:text-gray-300 transition-colors font-sans underline underline-offset-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                이전
              </button>

              <button
                onClick={goToNext}
                className="flex items-center gap-1 text-white hover:text-gray-300 transition-colors font-sans underline underline-offset-2"
              >
                다음
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* 이미지 인덱스 표시 */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {currentImageIndex + 1} / {imagesToShow.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 