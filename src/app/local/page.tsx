'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { ContactPerson } from '@/types'

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
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; show: boolean; type: 'success' | 'error' }>({ message: '', show: false, type: 'success' })
  
  // 스크롤 애니메이션 훅들
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200 })
  const introAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400 })
  const namesAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600 })
  const detailsAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 800 })
  const mapAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 1000 })
  const heartMoneyAnimation = useScrollAnimation({ threshold: 0.1, animationDelay: 1200 })

  // 연락처 데이터 가져오기
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const timestamp = Date.now()
        const response = await fetch(`/api/contacts?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        const data = await response.json()
        
        if (data.success) {
          setContacts(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching contacts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [])

  const showToast = (message: string) => {
    setToast({ message, show: true, type: 'success' })
    setTimeout(() => setToast({ message: '', show: false, type: 'success' }), 3000)
  }

  const copyAccountNumber = async (accountNumber: string, name: string) => {
    // 숫자만 추출
    const numbersOnly = accountNumber.replace(/[^0-9]/g, '')
    
    try {
      await navigator.clipboard.writeText(numbersOnly)
      showToast(`${name}님 계좌번호가 복사되었습니다`)
    } catch (err) {
      console.error('계좌번호 복사 실패:', err)
      // 폴백: 직접 선택하여 복사
      const textArea = document.createElement('textarea')
      textArea.value = numbersOnly
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showToast(`${name}님 계좌번호가 복사되었습니다`)
    }
  }

  const openKakaoPay = (link: string) => {
    window.open(link, '_blank')
  }

  const handleCall = (phone: string) => {
    if (phone && phone.trim()) {
      window.location.href = `tel:${phone}`
    }
  }

  const handleSMS = (phone: string) => {
    if (phone && phone.trim()) {
      window.location.href = `sms:${phone}`
    }
  }

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'person': return ''
      case 'father': return '아버지'
      case 'mother': return '어머니'
      default: return ''
    }
  }

  const groomSide = contacts.filter(contact => contact.side === 'groom')

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E0F7FF] via-[#F5E6FF] to-[#F0F8FF] py-0 md:py-8">
                        <div className="w-full max-w-[500px] mx-auto bg-gradient-to-b from-white via-blue-50/30 to-purple-50/30 md:rounded-2xl md:shadow-lg overflow-hidden">
        {/* 헤더 섹션 */}
        <section className="w-full min-h-screen flex flex-col justify-center py-16 md:py-20 px-4 relative">
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
                    <section className="w-full py-16 md:py-20 px-0 font-sans bg-gradient-to-br from-purple-50/70 via-blue-50/70 to-pink-50/70">
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

                            {/* 마음전하실 곳 섹션 - HeartMoneySection과 ContactSection 참고한 하이브리드 */}
                    <section className="w-full py-16 md:py-20 px-4 font-sans bg-gradient-to-br from-blue-50/70 via-pink-50/70 to-purple-50/70">
          <div className="max-w-xl mx-auto">
            {/* 제목 */}
            <h2 
              ref={heartMoneyAnimation.ref}
              className={`text-xl md:text-2xl font-light mb-8 tracking-wider text-gray-700 text-center transition-all duration-800 ${heartMoneyAnimation.animationClass}`}
            >
              마음 전하실 곳
            </h2>

            {/* 신랑측 연락처 및 계좌정보 */}
            <div className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : groomSide.length > 0 ? (
                <div className="space-y-6">
                  {groomSide.map((contact) => (
                    <div key={contact.id} className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 md:p-8 shadow-lg border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div className="text-left mb-4 md:mb-0">
                          {getRelationshipLabel(contact.relationship) && (
                            <div className="text-xs text-purple-600 mb-1 font-medium">
                              {getRelationshipLabel(contact.relationship)}
                            </div>
                          )}
                          <div className="text-base md:text-lg font-medium text-gray-800">
                            {contact.name}
                          </div>
                        </div>
                        
                        {/* 연락처 버튼들 */}
                        {contact.phone && contact.phone.trim() && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCall(contact.phone)}
                              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white font-medium shadow-sm bg-blue-300 text-sm hover:bg-blue-400 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              전화
                            </button>
                            <button
                              onClick={() => handleSMS(contact.phone)}
                              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white font-medium shadow-sm bg-pink-300 text-sm hover:bg-pink-400 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              문자
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* 계좌정보 */}
                      {contact.bank_name && contact.account_number && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100/50">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="text-left flex-1 mb-3 md:mb-0">
                              <div className="text-sm text-gray-800 mb-1 font-medium">{contact.bank_name}</div>
                              <div className="text-sm font-mono text-gray-800">{contact.account_number}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyAccountNumber(contact.account_number!, contact.name)}
                                className="text-purple-500 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50"
                                aria-label={`${contact.name} 계좌번호 복사`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              {contact.kakaopay_link && (
                                <button
                                  onClick={() => openKakaoPay(contact.kakaopay_link!)}
                                  className="text-pink-500 hover:text-pink-600 transition-colors p-2 rounded-lg hover:bg-pink-50"
                                  aria-label={`${contact.name} 카카오페이로 송금`}
                                >
                                  <div className="w-5 h-5 bg-yellow-400 rounded flex items-center justify-center">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="black">
                                      <path d="M12 3C6.48 3 2 6.58 2 11.25C2 14.17 4.09 16.68 7.25 18.03C6.94 19.1 6.44 20.75 6.44 20.75C6.44 20.75 6.84 20.97 7.25 20.75C8.31 20.19 9.81 19.31 10.75 18.75C11.15 18.81 11.56 18.84 12 18.84C17.52 18.84 22 15.26 22 10.59C22 5.92 17.52 2.34 12 2.34" />
                                    </svg>
                                  </div>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm md:text-base">
                    등록된 연락처가 없습니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

                            {/* 푸터 */}
                    <footer className="w-full py-8 md:py-12 px-4 bg-gradient-to-br from-pink-50/70 via-purple-50/70 to-blue-50/70">
          <div className="max-w-md mx-auto">
            <div className="flex flex-col items-center space-y-3">
              {/* 장식용 하트 아이콘 */}
              <div className="w-6 h-6 text-purple-300 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              
              {/* 저작권 텍스트 */}
              <p className="text-xs md:text-sm text-gray-500 font-light">
                © 2025 Min Hwang. All rights reserved
              </p>

              {/* 구분선 */}
              <div className="w-12 h-px bg-blue-200/50"></div>

              {/* 추가 메시지 */}
              <p className="text-xs text-gray-500 font-light italic">
                Thank you for visiting our wedding invitation
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* 토스트 메시지 */}
      {toast.show && (
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

      <style jsx global>{`
        .font-english {
          font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif;
        }
        .english-text {
          font-weight: 300;
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          50% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out;
        }
      `}</style>
    </main>
  )
} 