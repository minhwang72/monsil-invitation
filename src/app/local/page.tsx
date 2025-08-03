'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface ContactPerson {
  id: number
  side: 'groom' | 'bride'
  name: string
  relationship: string
  phone?: string
  bank_name?: string
  account_number?: string
  kakaopay_link?: string
}

interface NaverMapOptions {
  center: NaverLatLng
  zoom: number
}

interface NaverLatLng {
  lat: number
  lng: number
}

interface NaverMap {
  setCenter: (center: NaverLatLng) => void
  setZoom: (zoom: number) => void
}

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMap
        LatLng: new (lat: number, lng: number) => NaverLatLng
        Marker: new (options: { position: NaverLatLng; map: NaverMap }) => unknown
      }
    }
  }
}

function GrandConventionMap() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || !window.naver) return

      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(37.147120, 128.204168),
        zoom: 16
      })

      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(37.147120, 128.204168),
        map: map
      })
    }

    if (window.naver) {
      initMap()
    } else {
      const script = document.createElement('script')
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}`
      script.onload = initMap
      document.head.appendChild(script)
    }
  }, [])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-64 md:h-80 overflow-hidden border border-gray-200"
    />
  )
}

export default function LocalPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' as 'success' | 'error' })

  const titleAnimation = useScrollAnimation()
  const introAnimation = useScrollAnimation()
  const namesAnimation = useScrollAnimation()
  const detailsAnimation = useScrollAnimation()
  const mapAnimation = useScrollAnimation()
  const heartMoneyAnimation = useScrollAnimation()

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setContacts(data.data)
        } else {
          console.error('연락처 정보를 불러오는데 실패했습니다')
          setContacts([])
        }
      } else {
        console.error('연락처 정보를 불러오는데 실패했습니다')
        setContacts([])
      }
    } catch (error) {
      console.error('연락처 정보를 불러오는데 실패했습니다:', error)
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const showToast = (message: string) => {
    setToast({ show: true, message, type: 'success' })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
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
    window.location.href = `tel:${phone}`
  }

  const handleSMS = (phone: string) => {
    window.location.href = `sms:${phone}`
  }

  const getRelationshipLabel = (relationship: string) => {
    const labels: { [key: string]: string } = {
      'father': '신랑 아버지',
      'mother': '신랑 어머니',
      'groom': '신랑',
      'bride': '신부',
      'groom_father': '신랑 아버지',
      'groom_mother': '신랑 어머니',
      'bride_father': '신부 아버지',
      'bride_mother': '신부 어머니',
      'person': '신랑'  // person도 신랑으로 표시
    }
    return labels[relationship] || relationship
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText('충청북도 제천시 청전동 450-10')
      showToast('주소가 복사되었습니다')
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

  const groomSide = contacts.filter(contact => contact.side === 'groom')
  const brideSide = contacts.filter(contact => contact.side === 'bride')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8F0FF] py-0 md:py-8">
      <div className="w-full max-w-[500px] mx-auto relative">
        {/* 청첩장 보기 버튼 - 500px 라인에서 왼쪽 정렬 */}
        <div className="absolute top-8 left-8 z-10">
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

        {/* 첫 번째 섹션 - 피로연 안내 카드 (모바일: 전체 화면, 웹: 별도 카드) */}
        <section className="w-full min-h-screen md:min-h-0 md:py-16 md:py-20 px-4 relative flex flex-col justify-center">
          <div className="max-w-xl mx-auto text-center w-full">
            {/* 통합 카드 - 제목, 문구, 이름 */}
            <div 
              ref={titleAnimation.ref}
              className={`transition-all duration-800 ${titleAnimation.animationClass}`}
            >
              <div className="border-2 border-purple-200 rounded-2xl p-10 md:p-12 shadow-lg bg-white/90 relative">
                {/* 새로운 장식 무늬 - 모든 디바이스에서 표시 */}
                {/* 상단 장식 */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200"></div>
                <div className="absolute top-4 left-4 right-4 h-1 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-full"></div>
                
                {/* 하단 장식 */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200"></div>
                <div className="absolute bottom-4 left-4 right-4 h-1 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-full"></div>
                
                {/* 좌측 장식 */}
                <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-b from-purple-200 via-pink-200 to-purple-200"></div>
                <div className="absolute top-4 bottom-4 left-4 w-1 bg-gradient-to-b from-purple-100 via-pink-100 to-purple-100 rounded-full"></div>
                
                {/* 우측 장식 */}
                <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-b from-purple-200 via-pink-200 to-purple-200"></div>
                <div className="absolute top-4 bottom-4 right-4 w-1 bg-gradient-to-b from-purple-100 via-pink-100 to-purple-100 rounded-full"></div>
                
                {/* 모서리 장식 */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full"></div>
                <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full"></div>
                <div className="absolute bottom-2 left-2 w-3 h-3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full"></div>
                
                {/* 제목 */}
                <h1 className="text-2xl md:text-3xl font-semibold mb-12 md:mb-16 tracking-wider text-black" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  신랑측 피로연 안내
                </h1>

                {/* 소개 문구 */}
                <div 
                  ref={introAnimation.ref}
                  className={`mb-8 md:mb-10 transition-all duration-800 ${introAnimation.animationClass}`}
                >
                  <p className="text-lg md:text-xl font-extralight tracking-wide text-gray-600 leading-relaxed" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    거리가 멀어 예식에 참석하시기<br />
                    어려운 분들을 위해 혼례에 앞서<br />
                    피로연 자리를 마련하였습니다.
                  </p>
                  <p className="text-lg md:text-xl font-extralight tracking-wide text-gray-600 leading-relaxed mt-4" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    귀한 발걸음으로<br />
                    두사람의 앞날을 축복하여 주시면<br />
                    더 큰 기쁨과 격려가 되겠습니다.
                  </p>
                </div>

                {/* 신랑신부 이름 */}
                <div 
                  ref={namesAnimation.ref}
                  className={`transition-all duration-800 ${namesAnimation.animationClass}`}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-gray-700 text-lg font-extralight tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>신랑</span>
                    <svg 
                      className="w-5 h-5 text-pink-300"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-gray-700 text-lg font-extralight tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>신부</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center items-center gap-4 mb-2">
                      <span className="text-2xl md:text-3xl font-extralight tracking-wide text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        황민
                      </span>
                      <span className="text-lg text-gray-500">·</span>
                      <span className="text-2xl md:text-3xl font-extralight tracking-wide text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                        이은솔
                      </span>
                    </div>
                    <p className="text-base text-gray-600 font-extralight tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      황현기 · 박인숙 배상
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 스크롤 안내 - 카드 아래 공간에 표시 */}
            <div className="mt-8 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-6 h-10 border-2 border-purple-300 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-purple-300 rounded-full mt-2 animate-bounce"></div>
                </div>
                                            <p className="text-xs text-purple-500 font-extralight tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                              아래로 스크롤
                            </p>
              </div>
            </div>
          </div>
        </section>

        {/* 하얀 배경 컨테이너 - 하단 섹션들을 감싸는 배경 */}
        <div className="bg-white md:rounded-2xl md:shadow-lg overflow-hidden">
          {/* 상세 정보 섹션 - 원래 청첩장 스타일 */}
          <section className="w-full py-16 md:py-20 px-0 font-sans bg-blue-50/30">
            <div className="max-w-xl mx-auto text-center w-full px-0">
              {/* 제목 */}
              <h2 
                ref={detailsAnimation.ref}
                className={`text-3xl md:text-4xl font-semibold mb-12 md:mb-16 tracking-wider text-black px-4 md:px-8 transition-all duration-800 ${detailsAnimation.animationClass}`}
                style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
              >
                오시는길
              </h2>

              {/* 지도 - 그랜드컨벤션 지도 */}
              <div 
                ref={mapAnimation.ref}
                className={`mb-6 md:mb-8 px-0 transition-all duration-800 ${mapAnimation.animationClass}`}
              >
                <GrandConventionMap />
              </div>

              {/* 주소 정보 */}
              <div className="px-4 md:px-8">
                <div className="space-y-0">
                  {/* 주소 */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>주소</div>
                        <div className="text-base font-medium text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>충청북도 제천시 청전동 450-10</div>
                      </div>
                    </div>
                    <button
                      onClick={handleCopyAddress}
                      className="text-blue-500 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      aria-label="주소 복사"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>

                  {/* 일시 */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>일시</div>
                        <div className="text-base font-medium text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>2025년 11월 1일 (토) 오후 6시</div>
                      </div>
                    </div>
                  </div>

                  {/* 장소 */}
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <div className="text-left">
                        <div className="text-sm text-gray-600" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>장소</div>
                        <div className="text-base font-medium text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>더 그랜드컨벤션 연회장</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 마음전하실 곳 섹션 - HeartMoneySection과 ContactSection 참고한 하이브리드 */}
          <section className="w-full py-16 md:py-20 px-4 font-sans bg-purple-50/30">
            <div className="max-w-xl mx-auto">
              {/* 제목 */}
              <h2 
                ref={heartMoneyAnimation.ref}
                className={`text-xl md:text-2xl font-semibold mb-8 tracking-wider text-black text-center transition-all duration-800 ${heartMoneyAnimation.animationClass}`}
                style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
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
                              <div className="text-xs text-purple-600 mb-1 font-medium" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                                {getRelationshipLabel(contact.relationship)}
                              </div>
                            )}
                            <div className="text-base md:text-lg font-medium text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                              {contact.name}
                            </div>
                          </div>
                          
                          {/* 연락처 버튼들 */}
                          {contact.phone && contact.phone.trim() && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => contact.phone && handleCall(contact.phone)}
                                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-black font-medium shadow-sm bg-blue-300 text-sm hover:bg-blue-400 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>전화</span>
                              </button>
                              <button
                                onClick={() => contact.phone && handleSMS(contact.phone)}
                                className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-black font-medium shadow-sm bg-pink-300 text-sm hover:bg-pink-400 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>문자</span>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* 계좌정보 */}
                        {contact.bank_name && contact.account_number && (
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100/50">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                              <div className="text-left flex-1 mb-3 md:mb-0">
                                <div className="text-sm text-gray-800 mb-1 font-medium" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{contact.bank_name}</div>
                                <div className="text-sm font-mono text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{contact.account_number}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => contact.account_number && copyAccountNumber(contact.account_number, contact.name)}
                                  className="text-purple-500 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50"
                                  aria-label={`${contact.name} 계좌번호 복사`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                {contact.kakaopay_link && (
                                  <button
                                    onClick={() => contact.kakaopay_link && openKakaoPay(contact.kakaopay_link)}
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
                    <p className="text-gray-500 text-sm md:text-base" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                      등록된 연락처가 없습니다
                    </p>
                  </div>
                )}
              </div>

              {/* 신부측 연락처 및 계좌정보 */}
              {!loading && brideSide.length > 0 && (
                <div className="space-y-6 mt-8">
                  {brideSide.map((contact) => (
                    <div key={contact.id} className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-xl p-6 md:p-8 shadow-lg border border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <div className="text-left mb-4 md:mb-0">
                          {getRelationshipLabel(contact.relationship) && (
                            <div className="text-xs text-purple-600 mb-1 font-medium" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                              {getRelationshipLabel(contact.relationship)}
                            </div>
                          )}
                          <div className="text-base md:text-lg font-medium text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                            {contact.name}
                          </div>
                        </div>
                        
                        {/* 연락처 버튼들 */}
                        {contact.phone && contact.phone.trim() && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => contact.phone && handleCall(contact.phone)}
                              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-black font-medium shadow-sm bg-blue-300 text-sm hover:bg-blue-400 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>전화</span>
                            </button>
                            <button
                              onClick={() => contact.phone && handleSMS(contact.phone)}
                              className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-black font-medium shadow-sm bg-pink-300 text-sm hover:bg-pink-400 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>문자</span>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* 계좌정보 */}
                      {contact.bank_name && contact.account_number && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-pink-100/50">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="text-left flex-1 mb-3 md:mb-0">
                              <div className="text-sm text-gray-800 mb-1 font-medium" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{contact.bank_name}</div>
                              <div className="text-sm font-mono text-gray-800" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>{contact.account_number}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => contact.account_number && copyAccountNumber(contact.account_number, contact.name)}
                                className="text-purple-500 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50"
                                aria-label={`${contact.name} 계좌번호 복사`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              {contact.kakaopay_link && (
                                <button
                                  onClick={() => contact.kakaopay_link && openKakaoPay(contact.kakaopay_link)}
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
              )}
            </div>
          </section>

          {/* 푸터 */}
          <footer className="w-full py-8 md:py-12 px-4 bg-pink-50/30">
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