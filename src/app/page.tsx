'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Gallery, Guestbook } from '@/types'
import CoverSection from '@/components/sections/CoverSection'
import WeddingDateSection from '@/components/sections/WeddingDateSection'
import ContactSection from '@/components/sections/ContactSection'
import BlessingSection from '@/components/sections/BlessingSection'
import DetailsSection from '@/components/sections/DetailsSection'
import GallerySection from '@/components/sections/GallerySection'
import GuestbookSection from '@/components/sections/GuestbookSection'
import Footer from '@/components/Footer'

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

// 간단한 로딩 컴포넌트
const SimpleLoading = ({ type }: { type: 'gallery' | 'guestbook' }) => {
  if (type === 'gallery') {
    return (
      <section className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-white">
        <div className="max-w-xl mx-auto text-center w-full px-4">
          {/* 제목 스켈레톤 */}
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-16 w-40 mx-auto"></div>
          
          {/* 상단 가로선 */}
          <div className="w-full h-px bg-gray-200 mb-8"></div>
          
          {/* 갤러리 그리드 스켈레톤 */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse"></div>
            ))}
          </div>
          
          {/* 하단 가로선 */}
          <div className="w-full h-px bg-gray-200"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full py-0 md:py-0 px-0 font-sans bg-gray-50">
      <div className="w-full">
        <div className="p-6 md:p-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-6 md:mb-8 w-32 mx-auto"></div>
          <div className="flex justify-end mb-6">
            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 pr-2 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [guestbook, setGuestbook] = useState<Guestbook[]>([])
  const [loading, setLoading] = useState({
    gallery: true,
    guestbook: true,
    initial: true
  })

  // 방명록 데이터만 다시 가져오는 함수 (캐시 무시)
  const fetchGuestbook = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, guestbook: true }))
      // 캐시를 무시하고 최신 데이터 가져오기
      apiCache.delete('/api/guestbook')
      const guestbookData = await fetchWithCache('/api/guestbook')
      
      if (guestbookData && typeof guestbookData === 'object' && 'success' in guestbookData && guestbookData.success) {
        setGuestbook((guestbookData as { data: Guestbook[] }).data || [])
      }
    } catch (error) {
      console.error('Error fetching guestbook:', error)
      setGuestbook([])
    } finally {
      setLoading(prev => ({ ...prev, guestbook: false }))
    }
  }, [])

  useEffect(() => {
    // 초기 데이터 로딩
    const fetchInitialData = async () => {
      try {
        // 갤러리와 방명록을 병렬로 가져오기
        const [galleryData, guestbookData] = await Promise.all([
          fetchWithCache('/api/gallery').catch(err => {
            console.error('Gallery fetch error:', err)
            return { success: false, data: [] }
          }),
          fetchWithCache('/api/guestbook').catch(err => {
            console.error('Guestbook fetch error:', err)
            return { success: false, data: [] }
          })
        ])

        if (galleryData && typeof galleryData === 'object' && 'success' in galleryData && galleryData.success) {
          setGallery((galleryData as { data: Gallery[] }).data || [])
        }
        setLoading(prev => ({ ...prev, gallery: false }))

        if (guestbookData && typeof guestbookData === 'object' && 'success' in guestbookData && guestbookData.success) {
          setGuestbook((guestbookData as { data: Guestbook[] }).data || [])
        }
        setLoading(prev => ({ ...prev, guestbook: false }))

      } catch (error) {
        console.error('Error fetching initial data:', error)
        setGallery([])
        setGuestbook([])
      } finally {
        setLoading(prev => ({ ...prev, initial: false }))
      }
    }

    fetchInitialData()
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-sky/10 py-0 md:py-8">
      <div className="w-full max-w-[500px] mx-auto bg-white md:rounded-2xl md:shadow-lg overflow-hidden">
        <CoverSection />
        <WeddingDateSection />
        <ContactSection />
        
        {loading.gallery ? (
          <SimpleLoading type="gallery" />
        ) : (
          <GallerySection gallery={gallery} />
        )}
        
        <DetailsSection />
        <BlessingSection />
        
        {loading.guestbook ? (
          <SimpleLoading type="guestbook" />
        ) : (
          <GuestbookSection guestbook={guestbook} onGuestbookUpdate={fetchGuestbook} />
        )}
        
        <Footer />
      </div>

      {/* Share Button */}
      <button
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-purple-300 hover:bg-purple-400 text-white p-3 md:p-4 rounded-full shadow-lg transition-colors"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: '모바일 청첩장',
              text: '황민 ♥ 이은솔의 결혼식에 초대합니다.',
              url: window.location.href,
            })
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 md:h-6 md:w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>
    </main>
  )
}
