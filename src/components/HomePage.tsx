'use client'

import { useState, useEffect, useCallback } from 'react'
import CoverSection from '@/components/sections/CoverSection'
import WeddingDateSection from '@/components/sections/WeddingDateSection'
import ContactSection from '@/components/sections/ContactSection'
import BlessingSection from '@/components/sections/BlessingSection'
import LocationSection from '@/components/sections/DetailsSection'
import HeartMoneySection from '@/components/sections/HeartMoneySection'
import LazyGallerySection from '@/components/sections/LazyGallerySection'
import LazyGuestbookSection from '@/components/sections/LazyGuestbookSection'
import Footer from '@/components/Footer'
import DevToolsBlocker from '@/components/DevToolsBlocker'
import type { Gallery } from '@/types'

export default function HomePage() {
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [mainImageUrl, setMainImageUrl] = useState<string>('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 카카오 SDK 초기화
  useEffect(() => {
    const initKakao = () => {
      try {
        if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized()) {
          const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY
          if (kakaoKey) {
            window.Kakao.init(kakaoKey)
            console.log('카카오 SDK 초기화 완료')
          } else {
            console.error('카카오 JS 키가 설정되지 않았습니다')
          }
        }
      } catch (error) {
        console.error('카카오 SDK 초기화 오류:', error)
      }
    }

    // DOM이 완전히 로드된 후 실행
    if (document.readyState === 'complete') {
      initKakao()
    } else {
      window.addEventListener('load', initKakao)
      return () => window.removeEventListener('load', initKakao)
    }
  }, [])

  // 메인 이미지 가져오기
  useEffect(() => {
    const fetchMainImage = async () => {
      try {
        // 캐시 무효화를 위한 타임스탬프 추가
        const timestamp = Date.now()
        const response = await fetch(`/api/gallery?t=${timestamp}`)
        const data = await response.json()
        if (data.success) {
          const mainImage = data.data.find((img: Gallery) => img.image_type === 'main')
          if (mainImage?.url) {
            // 상대 경로라면 절대 경로로 변환하고 타임스탬프 추가
            const imageUrl = mainImage.url.startsWith('http') 
              ? `${mainImage.url}?t=${timestamp}`
              : `https://monsil.eungming.com${mainImage.url}?t=${timestamp}`
            setMainImageUrl(imageUrl)
          } else {
            // 메인 이미지가 없으면 기본 이미지 사용
            setMainImageUrl('https://monsil.eungming.com/images/cover-image.jpg')
          }
        }
      } catch (error) {
        console.error('Error fetching main image:', error)
        // 기본 이미지 URL 설정
        setMainImageUrl('https://monsil.eungming.com/images/cover-image.jpg')
      }
    }

    fetchMainImage()
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
    try {
      if (window.Kakao && window.Kakao.isInitialized()) {
        // 최신 메인 이미지 URL 확보 (타임스탬프 포함)
        const shareImageUrl = mainImageUrl || 'https://monsil.eungming.com/images/cover-image.jpg'
        
        console.log('카카오 공유 이미지 URL:', shareImageUrl)
        
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: '황민 ♥ 이은솔 결혼합니다',
            description: '2025년 11월 8일 오후 12시 30분\n정동제일교회에서 결혼식을 올립니다.\nWe invite you to our wedding.\n여러분의 축복으로 더 아름다운 날이 되길 바랍니다.',
            imageUrl: shareImageUrl,
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
        
        console.log('카카오 공유 요청 완료')
      } else {
        console.error('카카오 SDK가 초기화되지 않았습니다')
      }
    } catch (error) {
      console.error('카카오톡 공유 오류:', error)
    }
    setShareMenuOpen(false)
  }

  // 토스트 표시 함수
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // 링크 복사
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://monsil.eungming.com')
      showToastMessage('링크가 복사되었습니다', 'success')
    } catch (err) {
      console.error('링크 복사 실패:', err)
      // 폴백: 직접 선택하여 복사
      const textArea = document.createElement('textarea')
      textArea.value = 'https://monsil.eungming.com'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToastMessage('링크가 복사되었습니다', 'success')
    }
    setShareMenuOpen(false)
  }

  // 기본 공유 (확장 메뉴 토글)
  const defaultShare = () => {
    setShareMenuOpen(!shareMenuOpen)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-sky/10 py-0 md:py-8">
      <DevToolsBlocker />
      <div className="w-full max-w-[500px] mx-auto bg-white md:rounded-2xl md:shadow-lg overflow-hidden">
        <CoverSection />
        <BlessingSection />
        
        <WeddingDateSection />
        <ContactSection />
        
        <LazyGallerySection />
        
        <LocationSection />
        <HeartMoneySection />
        
        <LazyGuestbookSection />
        
        <Footer />
      </div>

      {/* Share Button */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-3" data-share-buttons>
        {/* 카카오톡 공유 버튼 */}
        <button
          className={`bg-yellow-500 text-black p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 ${
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
          className={`bg-gray-700 text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 ${
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
          className="bg-purple-400 text-white p-3 md:p-4 rounded-full shadow-lg transition-colors"
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

      {/* 토스트 메시지 */}
      {toast && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[10000] px-4">
          <div 
            className={`px-4 py-2 rounded-lg font-medium animate-fade-in-out text-sm md:text-base ${
              toast.type === 'success' ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </main>
  )
} 