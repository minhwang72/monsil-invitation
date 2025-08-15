'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Gallery } from '@/types'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface GallerySectionProps {
  gallery: Gallery[]
}

interface DisplayImage {
  id: number
  url: string
  isPlaceholder?: boolean
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())
  const [showAll, setShowAll] = useState(false)

  // 스크롤 애니메이션 훅들
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200 })
  const gridAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400 })
  const moreButtonAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600 })

  // 실제 갤러리 이미지가 있으면 사용하고, 없으면 12개의 기본 placeholder 이미지 생성 (더보기 기능 테스트용)
  const placeholderImages: DisplayImage[] = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    url: `/images/gallery/placeholder-${i + 1}.jpg`,
    isPlaceholder: true,
  }))

  // 갤러리 이미지만 필터링하고 order_index로 정렬 (메인 이미지 제외)
  const galleryImages = gallery ? gallery
    .filter(item => item.image_type === 'gallery')
    .sort((a, b) => {
      // order_index가 null이면 맨 뒤로
      if (a.order_index === null && b.order_index === null) return 0
      if (a.order_index === null) return 1
      if (b.order_index === null) return -1
      
      // 숫자로 정렬
      return Number(a.order_index) - Number(b.order_index)
    }) : []

  const displayImages: DisplayImage[] = galleryImages && galleryImages.length > 0 
    ? galleryImages 
    : placeholderImages

  // 표시할 이미지 개수 결정 (8개 제한 또는 모든 이미지)
  const imagesToShow = showAll ? displayImages : displayImages.slice(0, 8)
  const hasMoreImages = displayImages.length > 8

  // 이미지 로드 실패 핸들러
  const handleImageError = (imageId: number) => {
    setFailedImages(prev => new Set(prev).add(imageId))
  }

  const openModal = useCallback((index: number) => {
    setCurrentImageIndex(index)
    setIsModalOpen(true)
    // 모달 열릴 때 body 스크롤 방지
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    // 모달 닫힐 때 body 스크롤 복원
    document.body.style.overflow = 'unset'
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? displayImages.length - 1 : prev - 1
    )
  }, [displayImages.length])

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === displayImages.length - 1 ? 0 : prev + 1
    )
  }, [displayImages.length])

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

  // 배경 클릭 핸들러 (마우스 이벤트)
  const handleBackgroundClick = useCallback((e: React.MouseEvent) => {
    // 이벤트 타겟이 배경 자체인 경우에만 모달 닫기
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }, [closeModal])

  // 터치 이벤트용 배경 핸들러
  const handleBackgroundTouch = useCallback((e: React.TouchEvent) => {
    // 이벤트 타겟이 배경 자체인 경우에만 모달 닫기
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }, [closeModal])

  // 컴포넌트 언마운트 시 스크롤 복원
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    if (isModalOpen) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeModal()
        if (e.key === 'ArrowLeft') goToPrevious()
        if (e.key === 'ArrowRight') goToNext()
      }

      document.addEventListener('keydown', handleKeyPress)
      return () => {
        document.removeEventListener('keydown', handleKeyPress)
      }
    }
  }, [isModalOpen, closeModal, goToPrevious, goToNext])

  return (
    <>
      <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-0 font-sans bg-white">
        <div className="max-w-xl mx-auto text-center w-full px-4 md:px-6">
          {/* 제목 */}
          <h2 
            ref={titleAnimation.ref}
            className={`text-3xl md:text-4xl font-semibold mb-12 md:mb-16 tracking-wider text-black transition-all duration-800 ${titleAnimation.animationClass}`}
            style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
          >
            GALLERY
          </h2>

          {/* 상단 가로선 */}
          <div className="w-full h-px bg-gray-200 mb-6 md:mb-8"></div>

          {/* 갤러리 그리드 */}
          <div 
            ref={gridAnimation.ref}
            className={`grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8 transition-all duration-800 ${gridAnimation.animationClass}`}
          >
            {imagesToShow.map((item, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer transition-opacity rounded-lg overflow-hidden"
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
                    className="w-full h-full object-contain bg-gray-50"
                    onError={() => handleImageError(item.id)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 더보기/접기 버튼 */}
          {hasMoreImages && (
            <div 
              ref={moreButtonAnimation.ref}
              className={`flex justify-center mb-6 md:mb-8 transition-all duration-800 ${moreButtonAnimation.animationClass}`}
            >
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex flex-col items-center gap-2 text-gray-800 transition-colors"
              >
                <span className="text-sm font-light" style={{ fontFamily: 'SeoulNamsanL, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
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
          className="fixed inset-0 z-[9999] bg-black/80 animate-modal-fade-in"
          onClick={handleBackgroundClick}
          onTouchEnd={handleBackgroundTouch}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-[10001] text-white transition-colors p-2 touch-manipulation"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="pointer-events-none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* 데스크톱용 이전 버튼 - 왼쪽 중앙 */}
          <button
            onClick={goToPrevious}
            disabled={currentImageIndex === 0}
            className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-[10001] text-white hover:text-gray-300 transition-colors p-3 items-center justify-center bg-black bg-opacity-50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 데스크톱용 다음 버튼 - 오른쪽 중앙 */}
          <button
            onClick={goToNext}
            disabled={currentImageIndex === displayImages.length - 1}
            className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-[10001] text-white hover:text-gray-300 transition-colors p-3 items-center justify-center bg-black bg-opacity-50 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 중앙 이미지 영역 - 크기 제한 */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <div 
              className="relative max-w-[90vw] max-h-[80vh] md:max-w-[85vw] md:max-h-[75vh] pointer-events-auto animate-modal-slide-up"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={(e) => {
                onTouchEnd()
                e.stopPropagation()
              }}
            >
              {('isPlaceholder' in displayImages[currentImageIndex] && displayImages[currentImageIndex].isPlaceholder) || failedImages.has(displayImages[currentImageIndex].id) ? (
                <div className="bg-gray-100 rounded-lg flex items-center justify-center w-80 h-80 md:w-96 md:h-96">
                  <svg
                    className="w-16 h-16 md:w-24 md:h-24 text-gray-300 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      className="pointer-events-none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              ) : (
                <img
                  src={displayImages[currentImageIndex].url}
                  alt="Gallery"
                  className="max-w-[90vw] max-h-[80vh] md:max-w-[85vw] md:max-h-[75vh] object-contain rounded-lg pointer-events-none"
                  sizes="(max-width: 768px) 90vw, 85vw"
                  onError={() => handleImageError(displayImages[currentImageIndex].id)}
                />
              )}
            </div>
          </div>

          {/* 모바일용 네비게이션 바 - 연결된 검은 배경 */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-4 z-[10000]">
            <div className="flex justify-between items-center max-w-sm mx-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  goToPrevious()
                }}
                disabled={currentImageIndex === 0}
                className="text-white hover:text-gray-300 transition-colors p-2 flex items-center gap-2 touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-6 h-6 pointer-events-none"
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
                <span className="text-sm pointer-events-none">이전</span>
              </button>
              
              <div className="text-white text-sm font-sans px-4">
                {currentImageIndex + 1} / {displayImages.length}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  goToNext()
                }}
                disabled={currentImageIndex === displayImages.length - 1}
                className="text-white hover:text-gray-300 transition-colors p-2 flex items-center gap-2 touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="text-sm pointer-events-none">다음</span>
                <svg
                  className="w-6 h-6 pointer-events-none"
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