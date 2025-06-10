'use client'

import { useState, useEffect } from 'react'
import type { ContactPerson } from '@/types'

export default function HeartMoneySection() {
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSides, setExpandedSides] = useState<Set<'groom' | 'bride'>>(new Set())
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

  const openKakaoPay = (link: string) => {
    window.open(link, '_blank')
  }

  const toggleSide = (side: 'groom' | 'bride') => {
    const newExpandedSides = new Set(expandedSides)
    if (newExpandedSides.has(side)) {
      newExpandedSides.delete(side)
    } else {
      newExpandedSides.add(side)
    }
    setExpandedSides(newExpandedSides)
  }

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'person': return ''
      case 'father': return '아버지'
      case 'mother': return '어머니'
      default: return ''
    }
  }

  const getSideLabel = (side: string) => {
    return side === 'groom' ? '신랑' : '신부'
  }

  const groomSide = contacts.filter(contact => contact.side === 'groom')
  const brideSide = contacts.filter(contact => contact.side === 'bride')

  if (loading) {
    return (
      <section className="w-full py-12 px-0 font-sans bg-gray-100">
        <div className="max-w-xl mx-auto text-center w-full px-8">
          {/* 제목 스켈레톤 */}
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-8 w-32 mx-auto"></div>
          
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="w-full py-12 px-0 font-sans bg-gray-100">
        <div className="max-w-xl mx-auto text-center w-full px-8">
          {/* 제목 */}
          <h2 className="text-2xl font-light mb-8 tracking-wider text-gray-700">
            마음 전하실 곳
          </h2>
          
          <div className="space-y-4">
            {/* 신랑측 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => toggleSide('groom')}
                className="w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left flex justify-between items-center border-b border-gray-100"
              >
                <span className="text-base font-medium text-gray-800">신랑측</span>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform duration-500 ${
                    expandedSides.has('groom') ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                expandedSides.has('groom') ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-4 py-4 space-y-4 bg-purple-50">
                  {groomSide.map((contact) => (
                    <div key={contact.id} className="border-b border-purple-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-left">
                          {contact.relationship === 'person' && (
                            <div className="text-xs text-gray-500 mb-1">
                              {getSideLabel(contact.side)}
                            </div>
                          )}
                          {getRelationshipLabel(contact.relationship) && (
                            <div className="text-xs text-gray-500 mb-1">
                              {getRelationshipLabel(contact.relationship)}
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-800">
                            {contact.name}
                          </div>
                        </div>
                      </div>
                      
                      {contact.bank_name && contact.account_number && (
                        <div className="bg-white rounded-lg p-3 mt-2">
                          <div className="flex justify-between items-center">
                            <div className="text-left flex-1">
                              <div className="text-xs text-gray-600 mb-1">{contact.bank_name}</div>
                              <div className="text-xs font-mono text-gray-800">{contact.account_number}</div>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={() => copyAccountNumber(contact.account_number!, contact.name)}
                                className="text-purple-400 hover:text-purple-500 transition-colors p-1"
                                aria-label={`${contact.name} 계좌번호 복사`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              {contact.kakaopay_link && (
                                <button
                                  onClick={() => openKakaoPay(contact.kakaopay_link!)}
                                  className="text-gray-800 hover:text-black transition-colors p-1"
                                  aria-label={`${contact.name} 카카오페이로 송금`}
                                >
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3C6.48 3 2 6.58 2 11.25C2 14.17 4.09 16.68 7.25 18.03C6.94 19.1 6.44 20.75 6.44 20.75C6.44 20.75 6.84 20.97 7.25 20.75C8.31 20.19 9.81 19.31 10.75 18.75C11.15 18.81 11.56 18.84 12 18.84C17.52 18.84 22 15.26 22 10.59C22 5.92 17.52 2.34 12 2.34" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 신부측 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => toggleSide('bride')}
                className="w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors text-left flex justify-between items-center border-b border-gray-100"
              >
                <span className="text-base font-medium text-gray-800">신부측</span>
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform duration-500 ${
                    expandedSides.has('bride') ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                expandedSides.has('bride') ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-4 py-4 space-y-4 bg-purple-50">
                  {brideSide.map((contact) => (
                    <div key={contact.id} className="border-b border-purple-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-left">
                          {contact.relationship === 'person' && (
                            <div className="text-xs text-gray-500 mb-1">
                              {getSideLabel(contact.side)}
                            </div>
                          )}
                          {getRelationshipLabel(contact.relationship) && (
                            <div className="text-xs text-gray-500 mb-1">
                              {getRelationshipLabel(contact.relationship)}
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-800">
                            {contact.name}
                          </div>
                        </div>
                      </div>
                      
                      {contact.bank_name && contact.account_number && (
                        <div className="bg-white rounded-lg p-3 mt-2">
                          <div className="flex justify-between items-center">
                            <div className="text-left flex-1">
                              <div className="text-xs text-gray-600 mb-1">{contact.bank_name}</div>
                              <div className="text-xs font-mono text-gray-800">{contact.account_number}</div>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={() => copyAccountNumber(contact.account_number!, contact.name)}
                                className="text-purple-400 hover:text-purple-500 transition-colors p-1"
                                aria-label={`${contact.name} 계좌번호 복사`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                              {contact.kakaopay_link && (
                                <button
                                  onClick={() => openKakaoPay(contact.kakaopay_link!)}
                                  className="text-gray-800 hover:text-black transition-colors p-1"
                                  aria-label={`${contact.name} 카카오페이로 송금`}
                                >
                                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3C6.48 3 2 6.58 2 11.25C2 14.17 4.09 16.68 7.25 18.03C6.94 19.1 6.44 20.75 6.44 20.75C6.44 20.75 6.84 20.97 7.25 20.75C8.31 20.19 9.81 19.31 10.75 18.75C11.15 18.81 11.56 18.84 12 18.84C17.52 18.84 22 15.26 22 10.59C22 5.92 17.52 2.34 12 2.34" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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