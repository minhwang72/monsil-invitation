'use client'

import { useState, useEffect } from 'react'
import type { ContactPerson } from '@/types'

export default function ContactSection() {
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  const [loading, setLoading] = useState(true)

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

  const getSideLabel = (side: string) => {
    return side === 'groom' ? '신랑측' : '신부측'
  }

  const groomSide = contacts.filter(contact => contact.side === 'groom')
  const brideSide = contacts.filter(contact => contact.side === 'bride')

  if (loading) {
    return (
      <section className="w-full py-12 px-10 font-sans bg-gray-50/30">
        <div className="max-w-lg mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {[1, 2].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                {[1, 2, 3].map(j => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
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
    <section className="w-full py-12 px-10 font-sans bg-gray-50/30">
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-8">
          {/* 신랑측 */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-6 pb-2 border-b border-gray-200">
              {getSideLabel('groom')}
            </h3>
            <div className="space-y-5">
              {groomSide.map((contact) => (
                <div key={contact.id} className="text-center">
                  <div className="mb-2">
                    <div className="text-sm text-gray-600 mb-1">
                      {getRelationshipLabel(contact.relationship)}
                    </div>
                    <div className="text-base font-medium text-gray-800">
                      {contact.name}
                    </div>
                  </div>
                  {contact.phone && contact.phone.trim() && (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleCall(contact.phone)}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                        aria-label={`${contact.name}에게 전화걸기`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleSMS(contact.phone)}
                        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                        aria-label={`${contact.name}에게 문자보내기`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 신부측 */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-6 pb-2 border-b border-gray-200">
              {getSideLabel('bride')}
            </h3>
            <div className="space-y-5">
              {brideSide.map((contact) => (
                <div key={contact.id} className="text-center">
                  <div className="mb-2">
                    <div className="text-sm text-gray-600 mb-1">
                      {getRelationshipLabel(contact.relationship)}
                    </div>
                    <div className="text-base font-medium text-gray-800">
                      {contact.name}
                    </div>
                  </div>
                  {contact.phone && contact.phone.trim() && (
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleCall(contact.phone)}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                        aria-label={`${contact.name}에게 전화걸기`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleSMS(contact.phone)}
                        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                        aria-label={`${contact.name}에게 문자보내기`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 