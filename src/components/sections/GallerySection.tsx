import { useState, useEffect, useCallback } from 'react'
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
      prev === 0 ? imagesToShow.length - 1 : prev - 1
    )
  }, [imagesToShow.length])

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === imagesToShow.length - 1 ? 0 : prev + 1
    )
  }, [imagesToShow.length])

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

  // X 버튼 클릭 핸들러
  const handleCloseClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    e.preventDefault()
    closeModal()
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
          className="fixed inset-0 z-[9999] bg-black/80"
          onClick={handleBackgroundClick}
          onTouchEnd={handleBackgroundTouch}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={handleCloseClick}
            onTouchEnd={handleCloseClick}
            className="absolute top-4 right-4 z-[10001] text-white hover:text-gray-300 transition-colors p-2 touch-manipulation"
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

          {/* 이전 버튼 - 데스크톱에서만 표시 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="hidden md:block absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 z-[10001]"
          >
            <svg
              className="w-10 h-10 pointer-events-none"
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
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="hidden md:block absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 z-[10001]"
          >
            <svg
              className="w-10 h-10 pointer-events-none"
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

          {/* 중앙 이미지 영역 - 크기 제한 */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <div 
              className="relative max-w-[90vw] max-h-[80vh] md:max-w-[85vw] md:max-h-[75vh] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={(e) => {
                onTouchEnd()
                e.stopPropagation()
              }}
            >
              {('isPlaceholder' in imagesToShow[currentImageIndex] && imagesToShow[currentImageIndex].isPlaceholder) || failedImages.has(imagesToShow[currentImageIndex].id) ? (
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
                  src={imagesToShow[currentImageIndex].url}
                  alt="Gallery"
                  className="max-w-[90vw] max-h-[80vh] md:max-w-[85vw] md:max-h-[75vh] object-contain rounded-lg pointer-events-none"
                  sizes="(max-width: 768px) 90vw, 85vw"
                  onError={() => handleImageError(imagesToShow[currentImageIndex].id)}
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
                className="text-white hover:text-gray-300 transition-colors p-2 flex items-center gap-2 touch-manipulation"
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
                {currentImageIndex + 1} / {imagesToShow.length}
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
                className="text-white hover:text-gray-300 transition-colors p-2 flex items-center gap-2 touch-manipulation"
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