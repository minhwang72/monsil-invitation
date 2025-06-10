'use client'

import { useState, useEffect } from 'react'
import type { ContactPerson } from '@/types'

export default function HeartMoneySection() {
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSide, setExpandedSide] = useState<'groom' | 'bride' | null>(null)
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false })

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contacts')
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
    setToast({ message, show: true })
    setTimeout(() => setToast({ message: '', show: false }), 3000)
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

  const openKakaoPay = () => {
    // 카카오페이 앱으로 이동 (모바일에서는 앱이 열리고, 데스크톱에서는 웹 버전으로)
    const kakaoPayUrl = 'https://qr.kakaopay.com/'
    window.open(kakaoPayUrl, '_blank')
  }

  const toggleSide = (side: 'groom' | 'bride') => {
    setExpandedSide(expandedSide === side ? null : side)
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
      <section className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-white">
        <div className="max-w-xl mx-auto text-center w-full px-8">
          {/* 제목 스켈레톤 */}
          <div className="h-10 bg-gray-200 rounded animate-pulse mb-16 w-48 mx-auto"></div>
          
          <div className="space-y-6">
            {[1, 2].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-white">
        <div className="max-w-xl mx-auto text-center w-full px-8">
          {/* 제목 */}
          <h2 className="text-4xl font-light mb-16 tracking-wider text-gray-700">
            마음 전하실 곳
          </h2>
          
          <div className="space-y-6">
            {/* 신랑측 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSide('groom')}
                className="w-full px-6 py-4 bg-purple-50 hover:bg-purple-100 transition-colors text-left flex justify-between items-center"
              >
                <span className="text-lg font-medium text-gray-800">신랑측</span>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedSide === 'groom' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSide === 'groom' && (
                <div className="px-6 py-4 space-y-4 bg-white">
                  {groomSide.map((contact) => (
                    <div key={contact.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {getRelationshipLabel(contact.relationship) && (
                            <div className="text-xs text-gray-500 mb-1">
                              {getRelationshipLabel(contact.relationship)}
                            </div>
                          )}
                          <div className="text-base font-medium text-gray-800">
                            {contact.name}
                          </div>
                        </div>
                      </div>
                      
                      {contact.bank_name && contact.account_number && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-gray-600">{contact.bank_name}</div>
                              <div className="text-sm font-mono text-gray-800">{contact.account_number}</div>
                            </div>
                            <button
                              onClick={() => copyAccountNumber(contact.account_number!, contact.name)}
                              className="text-purple-300 hover:text-purple-400 transition-colors p-2"
                              aria-label={`${contact.name} 계좌번호 복사`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 신부측 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSide('bride')}
                className="w-full px-6 py-4 bg-purple-50 hover:bg-purple-100 transition-colors text-left flex justify-between items-center"
              >
                <span className="text-lg font-medium text-gray-800">신부측</span>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    expandedSide === 'bride' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSide === 'bride' && (
                <div className="px-6 py-4 space-y-4 bg-white">
                  {brideSide.map((contact) => (
                    <div key={contact.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {getRelationshipLabel(contact.relationship) && (
                            <div className="text-xs text-gray-500 mb-1">
                              {getRelationshipLabel(contact.relationship)}
                            </div>
                          )}
                          <div className="text-base font-medium text-gray-800">
                            {contact.name}
                          </div>
                        </div>
                      </div>
                      
                      {contact.bank_name && contact.account_number && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-gray-600">{contact.bank_name}</div>
                              <div className="text-sm font-mono text-gray-800">{contact.account_number}</div>
                            </div>
                            <button
                              onClick={() => copyAccountNumber(contact.account_number!, contact.name)}
                              className="text-purple-300 hover:text-purple-400 transition-colors p-2"
                              aria-label={`${contact.name} 계좌번호 복사`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 카카오페이 버튼 */}
          <div className="mt-8">
            <button
              onClick={openKakaoPay}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-4 rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.48 3 2 6.58 2 11.25C2 14.17 4.09 16.68 7.25 18.03C6.94 19.1 6.44 20.75 6.44 20.75C6.44 20.75 6.84 20.97 7.25 20.75C8.31 20.19 9.81 19.31 10.75 18.75C11.15 18.81 11.56 18.84 12 18.84C17.52 18.84 22 15.26 22 10.59C22 5.92 17.52 2.34 12 2.34" />
              </svg>
              카카오페이로 송금하기
            </button>
          </div>
        </div>
      </section>

      {/* 토스트 메시지 */}
      {toast.show && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[10000]">
          <div 
            className="px-4 py-2 rounded-lg font-medium animate-fade-in-out"
            style={{ 
              backgroundColor: '#10b981',
              color: 'white'
            }}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  )
} 