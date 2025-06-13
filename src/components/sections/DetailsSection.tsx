'use client'

import NaverMap from '../NaverMap'
import { useState } from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function LocationSection() {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // 스크롤 애니메이션 훅들
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200 })
  const mapAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400 })
  const mapButtonsAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 500 })
  const venueInfoAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600 })
  const transportAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 800 })

  const handleNaverMap = () => {
    window.open('https://map.naver.com/p/search/정동제일교회', '_blank')
  }

  const handleTMap = () => {
    window.open('https://tmap.life/68c11ad5', '_blank')
  }

  const handleKakaoMap = () => {
    window.open('https://kko.kakao.com/HQmHIUb47V', '_blank')
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText('서울 중구 정동길 46 (정동 34-3)')
      showToastMessage('주소가 복사되었습니다')
    } catch (err) {
      console.error('주소 복사 실패:', err)
      // 폴백: 직접 선택하여 복사
      const textArea = document.createElement('textarea')
      textArea.value = '서울 중구 정동길 46 (정동 34-3)'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToastMessage('주소가 복사되었습니다')
    }
  }

  const handleCallChurch = () => {
    window.location.href = 'tel:02-753-0001'
  }

  return (
    <>
      <section className="w-full min-h-screen flex flex-col justify-center py-16 md:py-20 px-0 font-sans bg-blue-50/50">
        <div className="max-w-xl mx-auto text-center w-full px-0">
          {/* 제목 */}
          <h2 
            ref={titleAnimation.ref}
            className={`text-3xl md:text-4xl font-light mb-12 md:mb-16 tracking-wider text-gray-700 font-english english-text px-4 md:px-8 transition-all duration-800 ${titleAnimation.animationClass}`}
          >
            LOCATION
          </h2>

          {/* 지도 - 좌우 패딩 제거 */}
          <div 
            ref={mapAnimation.ref}
            className={`mb-6 md:mb-8 px-0 transition-all duration-800 ${mapAnimation.animationClass}`}
          >
            <NaverMap />
          </div>

          {/* 지도 앱 연동 버튼들 - 항상 가로 배치 */}
          <div 
            ref={mapButtonsAnimation.ref}
            className={`flex justify-center gap-2 md:gap-4 mb-6 md:mb-8 px-4 md:px-8 transition-all duration-800 ${mapButtonsAnimation.animationClass}`}
          >
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
            <button
              onClick={handleTMap}
              className="flex-1 bg-white text-black border border-gray-200 py-3 px-2 md:px-4 rounded-lg transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 min-h-[48px] hover:bg-gray-50"
            >
              <svg width="14" height="12" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[16px] md:h-[14px] flex-shrink-0">
                <path d="M12.6951 0H0.955078V3.1H12.6951V0Z" fill="url(#paint0_linear_1343_17036)"/>
                <path d="M9.55508 14H6.45508V6.24C6.45508 2.8 9.25508 0 12.6951 0H15.0451V3.1H12.6951C10.9651 3.1 9.55508 4.51 9.55508 6.24V14Z" fill="url(#paint1_linear_1343_17036)"/>
                <defs>
                  <linearGradient id="paint0_linear_1343_17036" x1="1.55508" y1="1.55" x2="7.54508" y2="1.55" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F545BA"/>
                    <stop offset="1" stopColor="#783BFF"/>
                  </linearGradient>
                  <linearGradient id="paint1_linear_1343_17036" x1="7.84508" y1="9.57" x2="14.1151" y2="-1.38" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0264FF"/>
                    <stop offset="0.12" stopColor="#0A79F2"/>
                    <stop offset="0.4" stopColor="#1AA5D6"/>
                    <stop offset="0.65" stopColor="#26C6C3"/>
                    <stop offset="0.86" stopColor="#2ED9B7"/>
                    <stop offset="1" stopColor="#31E1B3"/>
                  </linearGradient>
                </defs>
              </svg>
              티맵
            </button>
            <button
              onClick={handleKakaoMap}
              className="flex-1 bg-white text-black border border-gray-200 py-3 px-2 md:px-4 rounded-lg transition-colors text-xs md:text-sm font-medium flex items-center justify-center gap-1 md:gap-2 min-h-[48px] hover:bg-gray-50"
            >
              <svg width="14" height="14" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" className="md:w-[16px] md:h-[16px] flex-shrink-0">
                <rect width="600" height="600" rx="100" ry="100" fill="#FFCD00"/>
                <path d="M300 100C383.137 100 450 166.863 450 250C450 322.351 390.73 379.887 353.553 432.579C331.193 464.175 318.621 496.927 309.34 523.065C306.878 529.937 298.489 530.061 296.027 523.189C286.411 496.297 273.103 463.236 246.494 429.337C207.508 379.844 150 322.057 150 250C150 166.863 216.863 100 300 100ZM300 180C266.863 180 240 206.863 240 240C240 273.137 266.863 300 300 300C333.137 300 360 273.137 360 240C360 206.863 333.137 180 300 180Z" fill="#007BFF"/>
              </svg>
              <span className="hidden sm:inline">카카오맵</span>
              <span className="sm:hidden">카카오</span>
            </button>
          </div>

          {/* 주소 정보 */}
          <div 
            ref={venueInfoAnimation.ref}
            className={`space-y-4 md:space-y-6 text-left px-4 md:px-8 transition-all duration-800 ${venueInfoAnimation.animationClass}`}
          >
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
                    서울 중구 정동길 46 (정동 34-3)
                  </p>
                  <button
                    onClick={handleCopyAddress}
                    className="text-gray-700 transition-colors p-1 flex-shrink-0"
                    aria-label="주소 복사"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-700 font-medium text-sm md:text-base">정동제일교회</p>
                  <button
                    onClick={handleCallChurch}
                    className="text-blue-700 transition-colors p-1 flex-shrink-0"
                    aria-label="교회 전화걸기"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* 구분선 */}
            <div className="w-full h-px bg-blue-400"></div>
          </div>

          {/* 교통 정보 */}
          <div 
            ref={transportAnimation.ref}
            className={`space-y-4 md:space-y-6 text-left px-4 md:px-8 pt-4 md:pt-6 transition-all duration-800 ${transportAnimation.animationClass}`}
          >
            {/* 지하철 */}
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <h3 className="text-base md:text-lg font-medium text-gray-800">지하철</h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-7 text-sm md:text-base">
                1, 2호선 시청역 하차, 덕수궁 쪽 출구로 나오셔서<br />
                덕수궁 돌담길을 따라 도보 5분
              </p>
            </div>

            {/* 구분선 */}
            <div className="w-full h-px bg-blue-400"></div>

            {/* 자가용 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 6H5a2 2 0 00-2 2v6a2 2 0 002 2h2m4 0h4a2 2 0 002-2V8a2 2 0 00-2-2h-2m0 0V4a2 2 0 00-2-2H9a2 2 0 00-2 2v2m6 0V4" />
                </svg>
                <h3 className="text-base md:text-lg font-medium text-gray-800">자가</h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-7 text-sm md:text-base">
                서대문역 사거리 → 정동사거리 우회전 500m 직진<br />
                <span className="text-xs md:text-sm">*주차는 인근 배재빌딩 지하주차장을 이용해 주시길 바랍니다.</span>
              </p>
            </div>

            {/* 구분선 */}
            <div className="w-full h-px bg-blue-400"></div>

            {/* 안내사항 */}
            <div className="space-y-3">
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                ※ 교회 방침에 의하여 축하 화환은 정중히 사양합니다.
              </p>
              <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                ※ 주차공간이 협소하니, 가급적 대중교통을 이용해 주시고<br />
                &nbsp;&nbsp;&nbsp;덕수궁 돌담길의 정취를 느끼며 오시길 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </section>

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
    </>
  )
} 