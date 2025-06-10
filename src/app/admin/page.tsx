'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { Invitation, Gallery, Guestbook } from '@/types'

export default function AdminPage() {
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [guestbook, setGuestbook] = useState<Guestbook[]>([])

  useEffect(() => {
    // Fetch data
    const fetchData = async () => {
      try {
        const [invitationRes, galleryRes, guestbookRes] =
          await Promise.all([
            fetch('/api/invitation'),
            fetch('/api/gallery'),
            fetch('/api/guestbook'),
          ])

        const [invitationData, galleryData, guestbookData] =
          await Promise.all([
            invitationRes.json(),
            galleryRes.json(),
            guestbookRes.json(),
          ])

        if (invitationData.success) setInvitation(invitationData.data)
        if (galleryData.success) setGallery(galleryData.data)
        if (guestbookData.success) setGuestbook(guestbookData.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        // Refresh gallery
        const galleryRes = await fetch('/api/gallery')
        const galleryData = await galleryRes.json()
        if (galleryData.success) setGallery(galleryData.data)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-score mb-8">관리자 페이지</h1>

      {/* Invitation Section */}
      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">초대장 정보</h2>
        {invitation && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">신랑</label>
              <input
                type="text"
                value={invitation.groom}
                onChange={(e) =>
                  setInvitation({ ...invitation, groom: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">신부</label>
              <input
                type="text"
                value={invitation.bride}
                onChange={(e) =>
                  setInvitation({ ...invitation, bride: e.target.value })
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">메시지</label>
              <textarea
                value={invitation.message}
                onChange={(e) =>
                  setInvitation({ ...invitation, message: e.target.value })
                }
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/invitation', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(invitation),
                  })
                  const data = await res.json()
                  if (data.success) alert('저장되었습니다.')
                } catch (error) {
                  console.error('Error updating invitation:', error)
                }
              }}
              className="bg-primary hover:bg-highlight text-white px-4 py-2 rounded"
            >
              저장
            </button>
          </div>
        )}
      </section>

      {/* Gallery Section */}
      <section className="mb-8">
        <h2 className="text-xl font-medium mb-4">갤러리</h2>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="mb-4"
        />
        <div className="grid grid-cols-2 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="relative aspect-square">
              <Image
                src={item.url}
                alt="Gallery"
                fill
                className="object-cover rounded"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Guestbook Section */}
      <section>
        <h2 className="text-xl font-medium mb-4">방명록</h2>
        <div className="space-y-4">
          {guestbook.map((item) => (
            <div key={item.id} className="p-4 border rounded">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={async () => {
                    const password = prompt('비밀번호를 입력하세요')
                    if (!password) return

                    try {
                      const res = await fetch(`/api/guestbook/${item.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password }),
                      })
                      const data = await res.json()
                      if (data.success) {
                        setGuestbook(guestbook.filter((g) => g.id !== item.id))
                        alert('삭제되었습니다.')
                      } else {
                        alert(data.error)
                      }
                    } catch (error) {
                      console.error('Error deleting guestbook:', error)
                    }
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
              <p className="text-gray-700">{item.content}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
} 