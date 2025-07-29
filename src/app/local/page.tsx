'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// 네이버 지도 API 타입 정의
interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
}

interface NaverLatLng {
  lat: number;
  lng: number;
}

interface NaverMap {
  setCenter: (center: NaverLatLng) => void;
  setZoom: (zoom: number) => void;
}

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMap;
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Marker: new (options: { position: NaverLatLng; map: NaverMap }) => unknown;
      };
    };
  }
}

function GrandConventionMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const initMap = () => {
      try {
        if (typeof window !== 'undefined' && window.naver && mapRef.current) {
          const naver = window.naver
          const grandConventionPosition = new naver.maps.LatLng(37.147120, 128.204168) // 더 그랜드컨벤션 좌표
          
          const map = new naver.maps.Map(mapRef.current, {
            center: grandConventionPosition,
            zoom: 16, // 피로연용 적절한 줌 레벨
          })

          // 더 그랜드컨벤션 마커 추가
          new naver.maps.Marker({
            position: grandConventionPosition,
            map: map
          })
          
          setIsLoading(false)
        } else {
          // 네이버 지도가 로드되지 않은 경우 재시도
          setTimeout(initMap, 1000)
        }
      } catch (error) {
        console.error('네이버 지도 로드 오류:', error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    // 지도 초기화 시작
    const timer = setTimeout(initMap, 100)
    
    return () => clearTimeout(timer)
  }, [])

  if (hasError) {
    return (
      <div style={{ width: '100%', height: 280, borderRadius: 0, overflow: 'hidden' }} className="bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">지도를 불러올 수 없습니다</p>
          <p className="text-xs mt-1">더 그랜드컨벤션</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 280, borderRadius: 0, overflow: 'hidden' }} className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-300 mx-auto mb-2"></div>
            <p className="text-sm">지도 로딩 중...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default function LocalPage() {
  const router = useRouter()
  
  // 스크롤 애니메이션 훅들
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200 })
  const introAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400 })
  const namesAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600 })
  const detailsAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 800 })
  const mapAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 1000 })

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText('충청북도 제천시 청전동 450-10')
      alert('주소가 복사되었습니다')
    } catch (err) {
      console.error('주소 복사 실패:', err)
      const textArea = document.createElement('textarea')
      textArea.value = '충청북도 제천시 청전동 450-10'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('주소가 복사되었습니다')
    }
  }

  const handleGoToMain = () => {
    router.push('/')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#E0F7FF] to-[#F5E6FF]">
      {/* 헤더 섹션 */}
      <section className="w-full min-h-screen flex flex-col justify-center py-16 md:py-20 px-4">
        <div className="max-w-xl mx-auto text-center w-full">
          {/* 메인 페이지로 가는 버튼 - 왼쪽 정렬 */}
          <div className="mb-8 md:mb-12 text-left">
            <button
              onClick={handleGoToMain}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors group"
              style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}
            >
              <svg 
                className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              <span className="text-sm font-extralight tracking-wide">청첩장 보기</span>
            </button>
          </div>

          {/* 제목 */}
          <h1 
            ref={titleAnimation.ref}
            className={`text-3xl md:text-4xl font-light mb-8 md:mb-12 tracking-wider text-gray-700 font-english english-text transition-all duration-800 ${titleAnimation.animationClass}`}
          >
            피로연 안내
          </h1>

          {/* 소개 문구 */}
          <div 
            ref={introAnimation.ref}
            className={`mb-8 md:mb-12 transition-all duration-800 ${introAnimation.animationClass}`}
          >
            <p className="text-lg md:text-xl font-extralight tracking-wide text-gray-600 leading-relaxed" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>
              거리가 멀어 예식에 참석하시기<br />
              어려운 분들을 위해 혼례에 앞서<br />
              피로연 자리를 마련하였습니다.
            </p>
            <p className="text-lg md:text-xl font-extralight tracking-wide text-gray-600 leading-relaxed mt-4" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>
              귀한 발걸음으로<br />
              두사람의 앞날을 축복하여 주시면<br />
              더 큰 기쁨과 격려가 되겠습니다.
            </p>
          </div>

          {/* 신랑신부 이름 */}
          <div 
            ref={namesAnimation.ref}
            className={`mb-8 md:mb-12 transition-all duration-800 ${namesAnimation.animationClass}`}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-gray-700 text-lg font-extralight tracking-wide" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>신랑</span>
              <svg 
                className="w-5 h-5 text-pink-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="text-gray-700 text-lg font-extralight tracking-wide" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>신부</span>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center items-center gap-4 mb-2">
                <span className="text-2xl md:text-3xl font-extralight tracking-wide text-gray-800" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>
                  황민
                </span>
                <span className="text-lg text-gray-500">·</span>
                <span className="text-2xl md:text-3xl font-extralight tracking-wide text-gray-800" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>
                  이은솔
                </span>
              </div>
              <p className="text-base text-gray-600 font-extralight tracking-wide" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>
                황현기 · 박인숙 배상
              </p>
            </div>
          </div>

          {/* 스크롤 안내 - 다음 섹션이 있다는 것을 알려주는 미묘한 힌트 */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-30">
            <div className="flex flex-col items-center">
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 font-extralight tracking-wide" style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>
                아래로 스크롤
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 상세 정보 섹션 - 원래 청첩장 스타일 */}
      <section className="w-full min-h-screen flex flex-col justify-center py-16 md:py-20 px-0 font-sans bg-blue-50/50">
        <div className="max-w-xl mx-auto text-center w-full px-0">
          {/* 제목 */}
          <h2 
            ref={detailsAnimation.ref}
            className={`text-3xl md:text-4xl font-light mb-12 md:mb-16 tracking-wider text-gray-700 font-english english-text px-4 md:px-8 transition-all duration-800 ${detailsAnimation.animationClass}`}
          >
            DETAILS
          </h2>

          {/* 지도 - 그랜드컨벤션 지도 */}
          <div 
            ref={mapAnimation.ref}
            className={`mb-6 md:mb-8 px-0 transition-all duration-800 ${mapAnimation.animationClass}`}
          >
            <GrandConventionMap />
          </div>

          {/* 주소 정보 */}
          <div className="space-y-4 md:space-y-6 text-left px-4 md:px-8">
            {/* 주소 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-base md:text-lg font-medium text-gray-800">주 소</h3>
              </div>
              <div className="ml-7">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base pr-2">
                    충청북도 제천시 청전동 450-10
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="text-[#9B6B9E] hover:text-[#8D79E6] transition-colors text-xs font-medium flex-shrink-0"
                  >
                    복사
                  </button>
                </div>
              </div>
            </div>

            {/* 일시 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-base md:text-lg font-medium text-gray-800">일 시</h3>
              </div>
              <div className="ml-7">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  2025년 11월 1일 (토) 오후 6시
                </p>
              </div>
            </div>

            {/* 장소 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-base md:text-lg font-medium text-gray-800">장 소</h3>
              </div>
              <div className="ml-7">
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  더 그랜드컨벤션 연회장
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .font-english {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
        }
        .english-text {
          font-weight: 300;
        }
      `}</style>
    </main>
  )
} 