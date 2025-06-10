'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Gallery, Guestbook } from '@/types'
import CoverSection from '@/components/sections/CoverSection'
import WeddingDateSection from '@/components/sections/WeddingDateSection'
import ContactSection from '@/components/sections/ContactSection'
import BlessingSection from '@/components/sections/BlessingSection'
import LocationSection from '@/components/sections/DetailsSection'
import HeartMoneySection from '@/components/sections/HeartMoneySection'
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
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [loading, setLoading] = useState({
    gallery: true,
    guestbook: true,
    initial: true
  })

  // 카카오 SDK 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
      const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
      if (kakaoKey) {
        window.Kakao.init(kakaoKey)
      }
    }
  }, [])

  // 공유 메뉴 닫기 함수
  const closeShareMenu = useCallback(() => {
    setShareMenuOpen(false)
  }, [])

  // 스크롤 및 배경 클릭 이벤트 리스너
  useEffect(() => {
    if (shareMenuOpen) {
      // 스크롤 이벤트 리스너
      const handleScroll = () => {
        closeShareMenu()
      }

      // 배경 클릭 이벤트 리스너 (버블링 방지를 위해 document에 추가)
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        // 공유 버튼 영역이 아닌 곳을 클릭했을 때만 닫기
        if (!target.closest('[data-share-buttons]')) {
          closeShareMenu()
        }
      }

      // 이벤트 리스너 등록
      window.addEventListener('scroll', handleScroll, { passive: true })
      document.addEventListener('click', handleClickOutside)

      // 클린업
      return () => {
        window.removeEventListener('scroll', handleScroll)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [shareMenuOpen, closeShareMenu])

  // 카카오톡 공유하기
  const shareKakao = () => {
    if (window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '황민 ♥ 이은솔 결혼합니다',
          description: '2025년 11월 8일 오후 12시 30분\n정동제일교회에서 결혼식을 올립니다.\n여러분의 축복으로 더 아름다운 날이 되길 바랍니다.',
          imageUrl: 'https://monsil.eungming.com/images/cover-image.jpg',
          link: {
            mobileWebUrl: 'https://monsil.eungming.com',
            webUrl: 'https://monsil.eungming.com',
          },
        },
        buttons: [
          {
            title: '청첩장 보기',
            link: {
              mobileWebUrl: 'https://monsil.eungming.com',
              webUrl: 'https://monsil.eungming.com',
            },
          },
        ],
      })
    }
    setShareMenuOpen(false)
  }

  // 링크 복사
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://monsil.eungming.com')
      showToastMessage('링크가 복사되었습니다!')
    } catch (err) {
      console.error('링크 복사 실패:', err)
      // 폴백: 직접 선택하여 복사
      const textArea = document.createElement('textarea')
      textArea.value = 'https://monsil.eungming.com'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToastMessage('링크가 복사되었습니다!')
    }
    setShareMenuOpen(false)
  }

  // 기본 공유 (확장 메뉴 토글)
  const defaultShare = () => {
    setShareMenuOpen(!shareMenuOpen)
  }

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

  // 토스트 표시 함수
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-sky/10 py-0 md:py-8">
      <div className="w-full max-w-[500px] mx-auto bg-white md:rounded-2xl md:shadow-lg overflow-hidden">
        <CoverSection />
        <BlessingSection />
        
        <WeddingDateSection />
        <ContactSection />
        
        {loading.gallery ? (
          <SimpleLoading type="gallery" />
        ) : (
          <GallerySection gallery={gallery} />
        )}
        
        <LocationSection />
        <HeartMoneySection />
        
        {loading.guestbook ? (
          <SimpleLoading type="guestbook" />
        ) : (
          <GuestbookSection guestbook={guestbook} onGuestbookUpdate={fetchGuestbook} />
        )}
        
        <Footer />
      </div>

      {/* Share Button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-3" data-share-buttons>
        {/* 카카오톡 공유 버튼 */}
        <button
          className={`bg-yellow-400 hover:bg-yellow-500 text-black p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 ${
            shareMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          onClick={shareKakao}
        >
          <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.58 2 11.25C2 14.17 4.09 16.68 7.25 18.03C6.94 19.1 6.44 20.75 6.44 20.75C6.44 20.75 6.84 20.97 7.25 20.75C8.31 20.19 9.81 19.31 10.75 18.75C11.15 18.81 11.56 18.84 12 18.84C17.52 18.84 22 15.26 22 10.59C22 5.92 17.52 2.34 12 2.34" />
          </svg>
        </button>

        {/* 링크 복사 버튼 */}
        <button
          className={`bg-gray-600 hover:bg-gray-700 text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 ${
            shareMenuOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          onClick={copyLink}
        >
          <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>

        {/* 메인 공유 버튼 */}
        <button
          className="bg-purple-300 hover:bg-purple-400 text-white p-3 md:p-4 rounded-full shadow-lg transition-colors"
          onClick={defaultShare}
        >
          {shareMenuOpen ? (
            // X 아이콘 (메뉴가 열려있을 때)
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            // 공유 아이콘 (메뉴가 닫혀있을 때)
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
          )}
        </button>
      </div>

      {/* Toast 메시지 */}
      {showToast && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[10000]">
          <div 
            className="px-4 py-2 rounded-lg font-medium animate-fade-in-out"
            style={{ 
              backgroundColor: '#10b981',
              color: 'white'
            }}
          >
            {toastMessage}
          </div>
        </div>
      )}
    </main>
  )
}
