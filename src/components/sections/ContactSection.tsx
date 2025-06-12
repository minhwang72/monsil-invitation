'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ContactPerson } from '@/types'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function ContactSection() {
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  const [loading, setLoading] = useState(true)

  // 스크롤 애니메이션 훅들 - 로딩 중일 때는 비활성화
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200, disabled: loading })
  const groomAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400, disabled: loading })
  const brideAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600, disabled: loading })

  const fetchContacts = useCallback(async () => {
    try {
      // Cache busting을 위한 timestamp 추가
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
  }, [])

  useEffect(() => {
    fetchContacts()
    
    // 30초마다 자동 리프레시
    const interval = setInterval(() => {
      fetchContacts()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchContacts])

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
  const brideSide = contacts.filter(contact => contact.side === 'bride')

  if (loading) {
    return (
      <section className="w-full flex flex-col justify-center py-8 md:py-12 px-6 md:px-10 font-sans bg-blue-50/50">
        <div className="max-w-xl mx-auto text-center w-full">
          {/* 제목 스켈레톤 */}
          <div className="h-10 md:h-12 bg-gray-200 rounded animate-pulse mb-8 md:mb-12 w-32 mx-auto"></div>
          
          <div className="max-w-md mx-auto space-y-6 md:space-y-8">
            {[1, 2].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-6 md:h-8 bg-gray-200 rounded-full animate-pulse w-16 md:w-20 mx-auto"></div>
                <div className="h-px bg-gray-200 animate-pulse"></div>
                {[1, 2, 3].map(j => (
                  <div key={j} className="space-y-3">
                    <div className="h-3 md:h-4 bg-gray-200 rounded animate-pulse w-12 md:w-16"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 md:h-5 bg-gray-200 rounded animate-pulse w-16 md:w-20"></div>
                      <div className="flex gap-3">
                        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full flex flex-col justify-center py-8 md:py-12 px-6 md:px-10 font-sans bg-blue-50/50">
      <div className="max-w-xl mx-auto text-center w-full">
        {/* 제목 */}
        <h2 
          ref={titleAnimation.ref}
          className={`text-3xl md:text-4xl font-light mb-8 md:mb-12 tracking-wider text-gray-700 font-english english-text transition-all duration-800 ${titleAnimation.animationClass}`}
        >
          CONTACT
        </h2>
        
        <div className="max-w-md mx-auto space-y-6 md:space-y-8">
          {/* 신랑측 */}
          <div 
            ref={groomAnimation.ref}
            className={`space-y-4 transition-all duration-800 ${groomAnimation.animationClass}`}
          >
            <div className="text-center">
              <span className="inline-block bg-purple-300 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium">
                신랑
              </span>
            </div>
            <div className="w-full h-px bg-gray-200"></div>
            <div className="space-y-3 md:space-y-4">
              {groomSide.map((contact) => (
                <div key={contact.id}>
                  {getRelationshipLabel(contact.relationship) && (
                    <div className="text-xs text-gray-500 mb-1 text-left">
                      {getRelationshipLabel(contact.relationship)}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="text-sm md:text-base font-medium text-gray-800">
                      {contact.name}
                    </div>
                    {contact.phone && contact.phone.trim() && (
                      <div className="flex gap-2 md:gap-3">
                        <button
                          onClick={() => handleCall(contact.phone)}
                          className="text-pink-400 transition-colors p-1"
                          aria-label={`${contact.name}에게 전화걸기`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSMS(contact.phone)}
                          className="text-blue-400 transition-colors p-1"
                          aria-label={`${contact.name}에게 문자보내기`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 신부측 */}
          <div 
            ref={brideAnimation.ref}
            className={`space-y-4 transition-all duration-800 ${brideAnimation.animationClass}`}
          >
            <div className="text-center">
              <span className="inline-block bg-purple-300 text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium">
                신부
              </span>
            </div>
            <div className="w-full h-px bg-gray-200"></div>
            <div className="space-y-3 md:space-y-4">
              {brideSide.map((contact) => (
                <div key={contact.id}>
                  {getRelationshipLabel(contact.relationship) && (
                    <div className="text-xs text-gray-500 mb-1 text-left">
                      {getRelationshipLabel(contact.relationship)}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="text-sm md:text-base font-medium text-gray-800">
                      {contact.name}
                    </div>
                    {contact.phone && contact.phone.trim() && (
                      <div className="flex gap-2 md:gap-3">
                        <button
                          onClick={() => handleCall(contact.phone)}
                          className="text-pink-400 transition-colors p-1"
                          aria-label={`${contact.name}에게 전화걸기`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.129-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleSMS(contact.phone)}
                          className="text-blue-400 transition-colors p-1"
                          aria-label={`${contact.name}에게 문자보내기`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 