import { useState, useEffect } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import GallerySection from './GallerySection'
import type { Gallery } from '@/types'

// API 응답 캐시
interface CacheData {
  data: unknown
  timestamp: number
}

const apiCache = new Map<string, CacheData>()
const CACHE_DURATION = 5 * 60 * 1000 // 5분

// 캐시된 API 호출 함수
const fetchWithCache = async (url: string) => {
  const now = Date.now()
  const cached = apiCache.get(url)
  
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const response = await fetch(url)
  const data = await response.json()
  
  apiCache.set(url, { data, timestamp: now })
  return data
}

// 갤러리 로딩 스켈레톤
const GalleryLoading = () => (
  <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-0 font-sans bg-white">
    <div className="max-w-xl mx-auto text-center w-full px-6 md:px-8">
      {/* 제목 스켈레톤 */}
      <div className="h-10 bg-gray-200 rounded animate-pulse mb-12 md:mb-16 w-40 mx-auto"></div>
      
      {/* 상단 가로선 */}
      <div className="w-full h-px bg-gray-200 mb-6 md:mb-8"></div>
      
      {/* 갤러리 그리드 스켈레톤 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
      
      {/* 하단 가로선 */}
      <div className="w-full h-px bg-gray-200"></div>
    </div>
  </section>
)

export default function LazyGallerySection() {
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  
  const { ref, shouldLoad } = useIntersectionObserver({
    rootMargin: '200px',
    threshold: 0.1,
    triggerOnce: true
  })

  useEffect(() => {
    if (shouldLoad && !hasLoaded) {
      const fetchGallery = async () => {
        try {
          setLoading(true)
          const galleryData = await fetchWithCache('/api/gallery')
          
          if (galleryData && typeof galleryData === 'object' && 'success' in galleryData && galleryData.success) {
            setGallery((galleryData as { data: Gallery[] }).data || [])
          }
        } catch (error) {
          console.error('Error fetching gallery:', error)
          setGallery([])
        } finally {
          setLoading(false)
          setHasLoaded(true)
        }
      }

      fetchGallery()
    }
  }, [shouldLoad, hasLoaded])

  return (
    <div ref={ref}>
      {loading || !hasLoaded ? (
        <GalleryLoading />
      ) : (
        <GallerySection gallery={gallery} />
      )}
    </div>
  )
} 