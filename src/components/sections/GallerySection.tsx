import { useState, useEffect } from 'react'
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

  // 갤러리 이미지만 필터링 (메인 이미지 제외)
  const galleryImages = gallery ? gallery.filter(item => item.image_type === 'gallery') : []

  const displayImages: DisplayImage[] = galleryImages && galleryImages.length > 0 
    ? galleryImages 
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
    // 모달 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    // 모달 닫힐 때 body 스크롤 복원
    document.body.style.overflow = 'unset'
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

  // 컴포넌트 언마운트 시 스크롤 복원
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <>
      <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-0 font-sans bg-white">
        <div className="max-w-xl mx-auto text-center w-full px-4 md:px-6">
          {/* 제목 */}
          <h2 className="text-3xl md:text-4xl font-light mb-12 md:mb-16 tracking-wider text-gray-700 font-english english-text">
            GALLERY
          </h2>

          {/* 상단 가로선 */}
          <div className="w-full h-px bg-gray-200 mb-6 md:mb-8"></div>

          {/* 갤러리 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            {imagesToShow.map((item, index) => (
              <div 
                key={item.id} 
                className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity rounded-lg overflow-hidden"
                onClick={() => openModal(index)}
              >
                {('isPlaceholder' in item && item.isPlaceholder) || failedImages.has(item.id) ? (
                  <div className="relative aspect-square bg-gray-100 flex items-center justify-center">
                    <svg
                      className="w-8 md:w-12 h-8 md:h-12 text-gray-300"
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
                  <img
                    src={item.url}
                    alt="Gallery"
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(item.id)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 더보기/접기 버튼 */}
          {hasMoreImages && (
            <div className="flex justify-center mb-6 md:mb-8">
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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
          onClick={handleBackgroundClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors p-2"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
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

          {/* 이전 버튼 - 데스크톱에서만 표시 */}
          <button
            onClick={goToPrevious}
            className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 z-20"
          >
            <svg
              className="w-10 h-10"
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

          {/* 다음 버튼 - 데스크톱에서만 표시 */}
          <button
            onClick={goToNext}
            className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 z-20"
          >
            <svg
              className="w-10 h-10"
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
            className="relative w-full max-w-[90vw] md:max-w-4xl max-h-[80vh] md:max-h-[70vh] mx-auto flex flex-col items-center justify-center p-4 md:p-8 z-10"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex-1 flex items-center justify-center w-full">
              {('isPlaceholder' in imagesToShow[currentImageIndex] && imagesToShow[currentImageIndex].isPlaceholder) || failedImages.has(imagesToShow[currentImageIndex].id) ? (
                <div className="bg-gray-100 rounded-lg flex items-center justify-center w-80 h-80 md:w-96 md:h-96">
                  <svg
                    className="w-16 h-16 md:w-24 md:h-24 text-gray-300"
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
                <div className="relative w-full h-full max-w-[85vw] md:max-w-[800px] max-h-[70vh] md:max-h-[600px] flex items-center justify-center">
                  <img
                    src={imagesToShow[currentImageIndex].url}
                    alt="Gallery"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    sizes="(max-width: 768px) 85vw, 800px"
                    onError={() => handleImageError(imagesToShow[currentImageIndex].id)}
                  />
                </div>
              )}
            </div>

            {/* 모바일용 네비게이션 버튼들 - 이미지 아래로 이동 */}
            <div className="md:hidden flex justify-between items-center w-full max-w-sm mt-6">
              <button
                onClick={goToPrevious}
                className="text-white hover:text-gray-300 transition-colors p-3 flex items-center gap-2"
              >
                <svg
                  className="w-6 h-6"
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
                <span className="text-sm">이전</span>
              </button>
              
              <div className="text-white text-sm font-sans">
                {currentImageIndex + 1} / {imagesToShow.length}
              </div>
              
              <button
                onClick={goToNext}
                className="text-white hover:text-gray-300 transition-colors p-3 flex items-center gap-2"
              >
                <span className="text-sm">다음</span>
                <svg
                  className="w-6 h-6"
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
          </div>
        </div>
      )}
    </>
  )
} 