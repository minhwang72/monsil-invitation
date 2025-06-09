'use client'

import { useState, useEffect } from 'react'
import type { Gallery, Guestbook } from '@/types'
import CoverSection from '@/components/sections/CoverSection'
import DetailsSection from '@/components/sections/DetailsSection'
import GallerySection from '@/components/sections/GallerySection'
import GuestbookSection from '@/components/sections/GuestbookSection'
import Footer from '@/components/Footer'

export default function Home() {
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [guestbook, setGuestbook] = useState<Guestbook[]>([])
  const [dDay, setDDay] = useState<number>(0)

  useEffect(() => {
    console.log('useEffect started - fetching data...')
    
    // Fetch data
    const fetchData = async () => {
      try {
        console.log('Making API calls...')
        
        const [galleryRes, guestbookRes] = await Promise.all([
          fetch('/api/gallery'),
          fetch('/api/guestbook'),
        ])

        console.log('API responses received:')
        console.log('Gallery response status:', galleryRes.status)
        console.log('Guestbook response status:', guestbookRes.status)

        const [galleryData, guestbookData] = await Promise.all([
          galleryRes.json(),
          guestbookRes.json(),
        ])

        console.log('=== GUESTBOOK DEBUG ===')
        console.log('Guestbook API response:', guestbookData)
        console.log('Response success:', guestbookData.success)
        console.log('Response data:', guestbookData.data)
        console.log('Data type:', typeof guestbookData.data)
        console.log('Data is array:', Array.isArray(guestbookData.data))
        if (guestbookData.data) {
          console.log('Data length:', guestbookData.data.length)
        }

        if (galleryData.success) {
          console.log('Setting gallery data...')
          setGallery(galleryData.data)
        }
        
        if (guestbookData.success) {
          console.log('Setting guestbook data:', guestbookData.data)
          setGuestbook(guestbookData.data || [])
          console.log('Guestbook state should be updated now')
        } else {
          console.error('Failed to fetch guestbook:', guestbookData.error)
          setGuestbook([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setGuestbook([])
      }
    }

    fetchData()

    // Calculate D-day
    const weddingDate = new Date('2024-11-08')
    const today = new Date()
    const diffTime = weddingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDDay(diffDays)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-sky/10 py-8">
      <div className="w-full max-w-[500px] mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <CoverSection dDay={dDay} />
        <DetailsSection />
        <GallerySection gallery={gallery} />
        <GuestbookSection guestbook={guestbook} />
        <Footer />
      </div>

      {/* Share Button */}
      <button
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-purple-300 hover:bg-purple-400 text-white p-3 md:p-4 rounded-full shadow-lg transition-colors"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: '모바일 청첩장',
              text: '황민 ♥ 이은솔의 결혼식에 초대합니다.',
              url: window.location.href,
            })
          }
        }}
      >
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
      </button>
    </main>
  )
}
