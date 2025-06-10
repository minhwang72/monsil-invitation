'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import type { Gallery, Guestbook, ContactPerson } from '@/types'

// 로딩 컴포넌트
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300"></div>
  </div>
)

// 로그인 컴포넌트
const LoginForm = ({ onLogin }: { onLogin: (username: string, password: string) => void }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onLogin(username, password)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            관리자 로그인
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="sr-only">
              사용자명
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm mb-3"
              placeholder="사용자명을 입력하세요"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-300 hover:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 메인 이미지 섹션 컴포넌트
const MainImageSection = ({ onUpdate }: { onUpdate?: () => void }) => {
  const [uploading, setUploading] = useState(false)
  const [currentImage, setCurrentImage] = useState<Gallery | null>(null)

  const fetchMainImage = useCallback(async () => {
    try {
      const res = await fetch('/api/gallery')
      const data = await res.json()
      if (data.success) {
        const mainImage = data.data.find((img: Gallery) => img.image_type === 'main')
        setCurrentImage(mainImage || null)
      }
    } catch (error) {
      console.error('Error fetching main image:', error)
    }
  }, [])

  useEffect(() => {
    fetchMainImage()
  }, [fetchMainImage])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('image_type', 'main')

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        // 새 이미지 정보로 업데이트
        const newImage: Gallery = {
          id: Date.now(),
          url: `/uploads/${data.data.filename}`,
          filename: data.data.filename,
          image_type: 'main',
          created_at: new Date()
        }
        setCurrentImage(newImage)
        
        // 외부 상태도 업데이트
        if (onUpdate) onUpdate()
        
        alert('메인 이미지가 업데이트되었습니다.')
      } else {
        alert(data.error || '업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">메인 이미지 관리</h2>
      
      <div className="space-y-6">
        {/* 현재 메인 이미지 */}
        {currentImage ? (
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">현재 메인 이미지</h3>
            <div className="relative w-64 h-80 mx-auto">
              <Image
                src={currentImage.url}
                alt="Main"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            현재 설정된 메인 이미지가 없습니다.
          </div>
        )}

        {/* 파일 업로드 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            새 메인 이미지 업로드
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {uploading && (
            <p className="text-sm text-purple-600 mt-2">업로드 중...</p>
          )}
        </div>
      </div>
    </div>
  )
}

// 연락처 관리 섹션 컴포넌트  
const ContactsSection = ({ contacts, onUpdate }: { contacts: ContactPerson[], onUpdate: () => void }) => {
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null)
  const [saving, setSaving] = useState(false)
  const [localContacts, setLocalContacts] = useState<ContactPerson[]>(contacts)

  // contacts prop이 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    setLocalContacts(contacts)
  }, [contacts])

  const handleEdit = (contact: ContactPerson) => {
    setEditingContact({ ...contact })
  }

  const handleSave = async () => {
    if (!editingContact) return

    console.log('🔍 [DEBUG] Saving contact:', editingContact)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingContact),
      })
      const data = await res.json()
      console.log('🔍 [DEBUG] Save response:', data)

      if (data.success) {
        console.log('✅ [DEBUG] Contact saved successfully, updating local state')
        
        // 즉시 로컬 상태 업데이트
        setLocalContacts(prev => 
          prev.map(contact => 
            contact.id === editingContact.id ? editingContact : contact
          )
        )
        
        setEditingContact(null)
        
        // 외부 상태도 업데이트
        await onUpdate()
        console.log('✅ [DEBUG] onUpdate completed')
        alert('연락처가 업데이트되었습니다.')
      } else {
        console.log('❌ [DEBUG] Save failed:', data.error)
        alert(data.error || '업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error updating contact:', error)
      alert('업데이트 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const getSideLabel = (side: string) => side === 'groom' ? '신랑' : '신부'
  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'person': return '본인'
      case 'father': return '아버지'
      case 'mother': return '어머니'
      default: return relationship
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">연락처 관리</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {localContacts.map((contact) => (
          <div key={contact.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium">
                  {getSideLabel(contact.side)} {getRelationshipLabel(contact.relationship)}
                </h3>
              </div>
              <button
                onClick={() => handleEdit(contact)}
                disabled={saving}
                className="text-purple-600 hover:text-purple-900 text-sm disabled:opacity-50"
              >
                수정
              </button>
            </div>

            {editingContact?.id === contact.id ? (
              // 수정 모드
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">이름</label>
                  <input
                    type="text"
                    value={editingContact.name}
                    onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">전화번호</label>
                  <input
                    type="text"
                    value={editingContact.phone}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">은행명</label>
                  <input
                    type="text"
                    value={editingContact.bank_name || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, bank_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">계좌번호</label>
                  <input
                    type="text"
                    value={editingContact.account_number || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, account_number: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">카카오페이 링크</label>
                  <input
                    type="text"
                    value={editingContact.kakaopay_link || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, kakaopay_link: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    onClick={() => setEditingContact(null)}
                    disabled={saving}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              // 표시 모드
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">이름:</span> {contact.name}</p>
                <p><span className="font-medium">전화:</span> {contact.phone}</p>
                {contact.bank_name && (
                  <p><span className="font-medium">은행:</span> {contact.bank_name}</p>
                )}
                {contact.account_number && (
                  <p><span className="font-medium">계좌:</span> {contact.account_number}</p>
                )}
                {contact.kakaopay_link && (
                  <p><span className="font-medium">카카오페이:</span> 
                    <a href={contact.kakaopay_link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1">
                      링크
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// 갤러리 관리 섹션 컴포넌트
const GallerySection = ({ gallery, onUpdate, loading }: { gallery: Gallery[], onUpdate: () => void, loading: boolean }) => {
  const [uploading, setUploading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  const galleryItems = gallery.filter(item => item.image_type === 'gallery')

  // 다중 파일 업로드
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    console.log('🔍 [DEBUG] Uploading', files.length, 'files')
    
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('image_type', 'gallery')

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        return res.json()
      })

      const results = await Promise.all(uploadPromises)
      const successCount = results.filter(result => result.success).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        onUpdate()
        alert(`${successCount}개 이미지가 업로드되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`)
      } else {
        alert('모든 이미지 업로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error uploading images:', error)
      alert('업로드 중 오류가 발생했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // 선택된 아이템들 삭제
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return
    if (!confirm(`선택된 ${selectedItems.size}개 이미지를 삭제하시겠습니까?`)) return

    try {
      console.log('🔍 [DEBUG] Deleting selected items:', Array.from(selectedItems))
      const deletePromises = Array.from(selectedItems).map(async (id) => {
        const res = await fetch(`/api/admin/gallery/${id}`, {
          method: 'DELETE',
        })
        return res.json()
      })

      const results = await Promise.all(deletePromises)
      const successCount = results.filter(result => result.success).length
      const failCount = results.length - successCount

      setSelectedItems(new Set())
      onUpdate()
      
      if (successCount > 0) {
        alert(`${successCount}개 이미지가 삭제되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`)
      } else {
        alert('이미지 삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error deleting images:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // 단일 아이템 삭제
  const handleDeleteSingle = async (id: number) => {
    if (!confirm('이 이미지를 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        onUpdate()
        alert('이미지가 삭제되었습니다.')
      } else {
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error deleting image:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  // 아이템 선택/해제
  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedItems.size === galleryItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(galleryItems.map(item => item.id)))
    }
  }

  // 순서 변경 (위로/아래로)
  const moveItem = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = galleryItems.findIndex(item => item.id === id)
    if (currentIndex === -1) return
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= galleryItems.length) return

    const newOrder = [...galleryItems]
    const [movedItem] = newOrder.splice(currentIndex, 1)
    newOrder.splice(newIndex, 0, movedItem)

    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorderedIds: newOrder.map(item => item.id) }),
      })
      const data = await res.json()

      if (data.success) {
        onUpdate()
      } else {
        alert(data.error || '순서 변경에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error reordering gallery:', error)
      alert('순서 변경 중 오류가 발생했습니다.')
    }
  }

  // 파일명 추출
  const getFileName = (url: string) => {
    return url.split('/').pop()?.split('.')[0] || 'Unknown'
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">갤러리 관리</h2>
      
      {/* 업로드 및 컨트롤 섹션 */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이미지 업로드 (다중 선택 가능)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultipleImageUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
          />
          {uploading && (
            <p className="text-sm text-purple-600 mt-2">업로드 중...</p>
          )}
        </div>

        {/* 선택 컨트롤 */}
        {galleryItems.length > 0 && (
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSelectAll}
                className="text-sm text-purple-600 hover:text-purple-800"
              >
                {selectedItems.size === galleryItems.length ? '전체 해제' : '전체 선택'}
              </button>
              <span className="text-sm text-gray-600">
                {selectedItems.size}개 선택됨
              </span>
            </div>
            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                선택 삭제 ({selectedItems.size}개)
              </button>
            )}
          </div>
        )}
      </div>

      {/* 갤러리 목록 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-300 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {galleryItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center p-4 border rounded-lg ${
                selectedItems.has(item.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
              }`}
            >
              {/* 선택 체크박스 */}
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="mr-4"
              />

              {/* 이미지 미리보기 */}
              <div className="w-16 h-16 relative mr-4">
                <Image
                  src={item.url}
                  alt="Gallery"
                  fill
                  className="object-cover rounded"
                />
              </div>

              {/* 파일 정보 */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {getFileName(item.url)}
                </h3>
                <p className="text-xs text-gray-500">
                  업로드: {new Date(item.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>

              {/* 순서 번호 */}
              <div className="text-sm text-gray-600 mr-4">
                #{index + 1}
              </div>

              {/* 순서 변경 버튼 */}
              <div className="flex flex-col space-y-1 mr-4">
                <button
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0}
                  className="w-8 h-6 flex items-center justify-center text-xs bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={index === galleryItems.length - 1}
                  className="w-8 h-6 flex items-center justify-center text-xs bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                >
                  ↓
                </button>
              </div>

              {/* 개별 삭제 버튼 */}
              <button
                onClick={() => handleDeleteSingle(item.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
      
      {galleryItems.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          갤러리 이미지가 없습니다.
        </div>
      )}
    </div>
  )
}

// 방명록 관리 섹션 컴포넌트
const GuestbookSection = ({ guestbook, onUpdate, loading }: { guestbook: Guestbook[], onUpdate: () => void, loading: boolean }) => {
  const [localGuestbook, setLocalGuestbook] = useState<Guestbook[]>(guestbook)

  // guestbook prop이 변경되면 로컬 상태도 업데이트
  useEffect(() => {
    setLocalGuestbook(guestbook)
  }, [guestbook])

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 방명록을 삭제하시겠습니까?')) return

    try {
      console.log('🔍 [DEBUG] Deleting guestbook:', id)
      
      // 즉시 로컬 상태에서 제거
      setLocalGuestbook(prev => prev.filter(item => item.id !== id))
      
      const res = await fetch(`/api/admin/guestbook/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        console.log('✅ [DEBUG] Guestbook deleted successfully')
        // 외부 상태도 업데이트
        await onUpdate()
        alert('방명록이 삭제되었습니다.')
      } else {
        console.log('❌ [DEBUG] Guestbook deletion failed:', data.error)
        // 실패 시 로컬 상태 복원
        setLocalGuestbook(guestbook)
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error deleting guestbook:', error)
      // 에러 시 로컬 상태 복원
      setLocalGuestbook(guestbook)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">방명록 관리</h2>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-300 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {localGuestbook.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  삭제
                </button>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
            </div>
          ))}
        </div>
      )}
      
      {localGuestbook.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          방명록이 없습니다.
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [guestbook, setGuestbook] = useState<Guestbook[]>([])
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  const [activeTab, setActiveTab] = useState<'main' | 'contacts' | 'gallery' | 'guestbook'>('main')
  const [loading, setLoading] = useState({
    auth: true,
    gallery: false,
    guestbook: false,
    contacts: false
  })

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/verify')
        const data = await res.json()
        setIsAuthenticated(data.data?.authenticated || false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(prev => ({ ...prev, auth: false }))
      }
    }

    checkAuth()
  }, [])

  // 로그인 처리
  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (data.success) {
        setIsAuthenticated(true)
      } else {
        alert(data.error || '로그인에 실패했습니다.')
      }
    } catch (error) {
      console.error('Login failed:', error)
      alert('로그인 중 오류가 발생했습니다.')
    }
  }

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // 데이터 로딩 및 개별 업데이트 함수들
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      setLoading(prev => ({ ...prev, gallery: true, guestbook: true, contacts: true }))

      const [galleryRes, guestbookRes, contactsRes] = await Promise.all([
        fetch('/api/gallery'),
        fetch('/api/guestbook'),
        fetch('/api/contacts'),
      ])

      const [galleryData, guestbookData, contactsData] = await Promise.all([
        galleryRes.json(),
        guestbookRes.json(),
        contactsRes.json(),
      ])

      if (galleryData.success) setGallery(galleryData.data)
      if (guestbookData.success) setGuestbook(guestbookData.data)
      if (contactsData.success) setContacts(contactsData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(prev => ({ ...prev, gallery: false, guestbook: false, contacts: false }))
    }
  }, [isAuthenticated])

  // 개별 섹션 업데이트 함수들
  const updateGallery = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, gallery: true }))
      const res = await fetch('/api/gallery')
      const data = await res.json()
      if (data.success) {
        setGallery(data.data)
      }
    } catch (error) {
      console.error('Error updating gallery:', error)
    } finally {
      setLoading(prev => ({ ...prev, gallery: false }))
    }
  }, [])

  const updateGuestbook = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, guestbook: true }))
      const res = await fetch('/api/guestbook')
      const data = await res.json()
      if (data.success) {
        setGuestbook(data.data)
      }
    } catch (error) {
      console.error('Error updating guestbook:', error)
    } finally {
      setLoading(prev => ({ ...prev, guestbook: false }))
    }
  }, [])

  const updateContacts = useCallback(async () => {
    try {
      console.log('🔍 [DEBUG] updateContacts called')
      setLoading(prev => ({ ...prev, contacts: true }))
      const res = await fetch('/api/contacts')
      const data = await res.json()
      console.log('🔍 [DEBUG] Contacts fetch response:', data)
      if (data.success) {
        console.log('✅ [DEBUG] Setting contacts state:', data.data)
        setContacts(data.data)
      } else {
        console.log('❌ [DEBUG] Contacts fetch failed:', data.error)
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error updating contacts:', error)
    } finally {
      setLoading(prev => ({ ...prev, contacts: false }))
      console.log('🔍 [DEBUG] updateContacts completed')
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading.auth) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'main', label: '메인 이미지' },
              { key: 'contacts', label: '연락처 관리' },
              { key: 'gallery', label: '갤러리 관리' },
              { key: 'guestbook', label: '방명록 관리' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'main' | 'contacts' | 'gallery' | 'guestbook')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 메인 이미지 관리 탭 */}
          {activeTab === 'main' && <MainImageSection onUpdate={updateGallery} />}

          {/* 연락처 관리 탭 */}
          {activeTab === 'contacts' && (
            <ContactsSection contacts={contacts} onUpdate={updateContacts} />
          )}

          {/* 갤러리 관리 탭 */}
          {activeTab === 'gallery' && (
            <GallerySection gallery={gallery} onUpdate={updateGallery} loading={loading.gallery} />
          )}

          {/* 방명록 관리 탭 */}
          {activeTab === 'guestbook' && (
            <GuestbookSection guestbook={guestbook} onUpdate={updateGuestbook} loading={loading.guestbook} />
          )}
        </div>
      </main>
    </div>
  )
} 