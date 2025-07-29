'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useRouter } from 'next/navigation'

export default function LocalPage() {
  const router = useRouter()
  
  // 스크롤 애니메이션 훅들
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200 })
  const introAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400 })
  const namesAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600 })
  const detailsAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 800 })
  const mapAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 1000 })

  const handleNaverMap = () => {
    window.open('https://map.naver.com/p/search/더그랜드컨벤션', '_blank')
  }

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
              className="bg-[#E6E6FA]/80 backdrop-blur-sm text-gray-700 border border-[#E6E6FA] py-2 px-4 rounded-full transition-all duration-300 text-xs font-medium flex items-center gap-2 hover:bg-[#E6E6FA] hover:shadow-sm group"
              style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}
            >
              <svg 
                className="w-3 h-3 text-gray-500 group-hover:text-gray-700 transition-colors" 
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
              <span className="font-extralight tracking-wide text-xs">모바일 청첩장 보러가기</span>
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

          {/* 지도 - 좌우 패딩 제거 */}
          <div 
            ref={mapAnimation.ref}
            className={`mb-6 md:mb-8 px-0 transition-all duration-800 ${mapAnimation.animationClass}`}
          >
            <div className="w-full h-64 md:h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-500 text-sm">더 그랜드컨벤션</p>
              </div>
            </div>
          </div>

          {/* 지도 앱 연동 버튼들 */}
          <div className="flex justify-center gap-2 md:gap-4 mb-6 md:mb-8 px-4 md:px-8">
            <button
              onClick={handleNaverMap}
              className="flex-1 bg-white text-black border border-gray-200 py-3 px-2 md:px-4 rounded-lg transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 min-h-[48px] hover:bg-gray-50"
            >
              <svg width="18" height="14" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[21px] md:h-[16px] flex-shrink-0">
                <path d="M6.09879 0C2.86879 0 0.258789 2.61 0.258789 5.84C0.258789 6.18 0.298789 6.53 0.368789 6.89C0.558789 7.83 0.948789 8.71 1.49879 9.49L6.08879 16L8.73879 12.24L10.6788 9.49C11.2288 8.71 11.6188 7.83 11.8088 6.89C11.8788 6.53 11.9188 6.18 11.9188 5.84C11.9188 2.62 9.30879 0 6.07879 0L6.09879 0ZM5.35879 5.73V7.9H4.02879V3.78H5.35879L6.83879 5.95V3.78H8.16879V7.89H6.83879L5.35879 5.72V5.73Z" fill="#04C75A"/>
                <path d="M8.16832 3.77979V7.88978H6.83832L5.35832 5.72979V7.88978H4.02832V3.77979H5.35832L6.83832 5.94978V3.77979H8.16832Z" fill="#04C75A"/>
                <path d="M8.16832 3.77979V7.88978H6.83832L5.35832 5.72979V7.88978H4.02832V3.77979H5.35832L6.83832 5.94978V3.77979H8.16832Z" fill="white"/>
                <path d="M20.4086 12.2402V16.0002H6.09863L8.74863 12.2402H20.4086Z" fill="#256BFA"/>
              </svg>
              <span className="hidden sm:inline">네이버지도</span>
              <span className="sm:hidden">네이버</span>
            </button>
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