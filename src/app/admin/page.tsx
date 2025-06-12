'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Gallery, Guestbook, ContactPerson } from '@/types'
import { validateAndPrepareFile } from '@/lib/clientImageUtils'
import MainImageUploader from '@/components/MainImageUploader'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop'

// 토스트 타입 정의
interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

// 토스트 컴포넌트
const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: number) => void }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg shadow-lg text-white text-sm max-w-sm ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

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
  const searchParams = useSearchParams()

  // URL 파라미터에서 username 읽어서 초기값 설정
  useEffect(() => {
    const urlUsername = searchParams.get('username')
    if (urlUsername) {
      setUsername(urlUsername)
      // 비밀번호 입력 필드에 포커스
      setTimeout(() => {
        const passwordInput = document.getElementById('password')
        if (passwordInput) {
          passwordInput.focus()
        }
      }, 100)
    }
  }, [searchParams])

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
const MainImageSection = ({ onUpdate, showToast }: { onUpdate?: () => void, showToast: (message: string, type: 'success' | 'error') => void }) => {
  const [currentImage, setCurrentImage] = useState<Gallery | null>(null)

  const fetchMainImage = useCallback(async () => {
    try {
      const res = await fetch(`/api/gallery?t=${Date.now()}`)
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

  const handleUploadSuccess = async (fileUrl: string) => {
    console.log('[DEBUG] Main image upload successful:', fileUrl)
    
    try {
      // 이미지가 성공적으로 업로드되었으므로 UI를 새로고침
      await fetchMainImage()
      if (onUpdate) onUpdate()
      showToast('메인 이미지가 업데이트되었습니다', 'success')
    } catch (error) {
      console.error('Error refreshing image data:', error)
      // 업로드는 성공했으므로 경고만 표시
      showToast('화면 새로고침에 실패했습니다', 'error')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">메인 이미지 관리</h2>
      
      <div className="space-y-6">
        {/* 현재 메인 이미지 */}
        {currentImage && currentImage.url ? (
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">현재 메인 이미지</h3>
            <div className="relative w-64 h-80 mx-auto">
              <img
                src={`${currentImage.url}?t=${Date.now()}`}
                alt="Main"
                className="w-full h-full object-cover rounded-lg"
                key={currentImage.url}
              />
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            현재 설정된 메인 이미지가 없습니다.
          </div>
        )}

        {/* 새로운 이미지 업로더 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            새 메인 이미지 업로드 (3:4 비율 크롭 지원)
          </label>
          <MainImageUploader
            onUploadSuccess={handleUploadSuccess}
            className="max-w-md mx-auto"
          />
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
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      console.log('🔍 [DEBUG] Save response:', data)

      if (data.success) {
        console.log('✅ [DEBUG] Contact saved successfully, updating local state')
        
        // 먼저 편집 모드 종료
        setEditingContact(null)
        
        // 즉시 로컬 상태 업데이트 (최신 데이터로)
        setLocalContacts(prev => 
          prev.map(contact => 
            contact.id === editingContact.id ? { ...editingContact } : contact
          )
        )
        
        // 외부 상태도 업데이트 (서버에서 최신 데이터 가져오기)
        try {
          await onUpdate()
          console.log('✅ [DEBUG] onUpdate completed successfully')
        } catch (updateError) {
          console.warn('⚠️ [DEBUG] onUpdate failed, but local state is updated:', updateError)
        }
        
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
                <h3 className="text-lg font-medium text-gray-900">
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">전화번호</label>
                  <input
                    type="text"
                    value={editingContact.phone}
                    onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">은행명</label>
                  <input
                    type="text"
                    value={editingContact.bank_name || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, bank_name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">계좌번호</label>
                  <input
                    type="text"
                    value={editingContact.account_number || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, account_number: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">카카오페이 링크</label>
                  <input
                    type="text"
                    value={editingContact.kakaopay_link || ''}
                    onChange={(e) => setEditingContact({ ...editingContact, kakaopay_link: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-purple-500 focus:border-purple-500"
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
              <div className="space-y-2 text-sm text-gray-900">
                <p><span className="font-medium text-gray-800">이름:</span> <span className="text-gray-900">{contact.name}</span></p>
                <p><span className="font-medium text-gray-800">전화:</span> <span className="text-gray-900">{contact.phone}</span></p>
                {contact.bank_name && (
                  <p><span className="font-medium text-gray-800">은행:</span> <span className="text-gray-900">{contact.bank_name}</span></p>
                )}
                {contact.account_number && (
                  <p><span className="font-medium text-gray-800">계좌:</span> <span className="text-gray-900 font-mono">{contact.account_number}</span></p>
                )}
                {contact.kakaopay_link && (
                  <p><span className="font-medium text-gray-800">카카오페이:</span> 
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

// 갤러리용 자유 비율 크롭 컴포넌트
const GalleryImageCropper = ({ 
  imageSrc, 
  onCropComplete, 
  onCancel 
}: { 
  imageSrc: string, 
  onCropComplete: (croppedImageBlob: Blob) => void, 
  onCancel: () => void 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  // Canvas에서 크롭된 이미지 생성하는 헬퍼 함수
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.setAttribute('crossOrigin', 'anonymous')
      image.src = url
    })

  const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Canvas context not available')
    }

    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
      }, 'image/jpeg', 0.85)
    })
  }

  const onCropCompleteHandler = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return

    try {
      setProcessing(true)
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      onCropComplete(croppedImage)
    } catch (e) {
      console.error('크롭 처리 중 오류:', e)
    } finally {
      setProcessing(false)
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">이미지 수정 (자유 크롭)</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="relative bg-gray-100 flex-1 min-h-[400px] rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={0} // 자유 비율을 위해 0으로 설정
            onCropChange={setCrop}
            onCropComplete={onCropCompleteHandler}
            onZoomChange={setZoom}
            cropShape="rect"
            showGrid={true}
            restrictPosition={false} // 위치 제한 해제
            cropSize={{ width: 300, height: 200 }} // 초기 크롭 영역 크기
          />
        </div>
        
        <div className="mt-4 space-y-4">
          {/* 줌 컨트롤 */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 min-w-[40px]">줌:</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 min-w-[60px]">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          
          {/* 안내 텍스트 */}
          <p className="text-sm text-gray-600 text-center">
            드래그로 위치 조정, 크롭 영역 모서리를 드래그하여 크기 조정, 마우스 휠로 줌 조정 가능합니다.
          </p>
          
          {/* 버튼들 */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={processing}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleCropConfirm}
              disabled={processing}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? '처리 중...' : '수정 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 갤러리 관리 섹션 컴포넌트
const GallerySection = ({ gallery, onUpdate, loading, showToast }: { gallery: Gallery[], onUpdate: () => void, loading: boolean, showToast: (message: string, type: 'success' | 'error') => void }) => {
  const [uploading, setUploading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())
  const [editingItem, setEditingItem] = useState<Gallery | null>(null)
  const [showCropper, setShowCropper] = useState(false)

  const galleryItems = gallery.filter(item => item.image_type === 'gallery')

  // 다중 파일 업로드
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    console.log('[DEBUG] Validating and preparing', files.length, 'files')
    
    try {
      const uploadPromises = files.map(async (file) => {
        try {
          // 클라이언트 사이드에서 각 파일 유효성 검사
          const validation = await validateAndPrepareFile(file)
          
          if (!validation.isValid) {
            return { success: false, error: validation.error || '파일 검증 실패' }
          }
          
          let fileToUpload = file
          let conversionAttempted = false
          
          // HEIC 파일인 경우 클라이언트에서 JPEG로 변환 시도 (실패시 서버에서 처리)
          if (file.name.toLowerCase().includes('.heic') || file.type === 'image/heic') {
            try {
              console.log('[DEBUG] Attempting HEIC to JPEG conversion for file:', file.name)
              conversionAttempted = true
              
              const heic2any = await import('heic2any')
              const convertedBlob = await heic2any.default({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
              }) as Blob
              
              fileToUpload = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
                type: 'image/jpeg'
              })
              console.log('[DEBUG] HEIC converted to JPEG for file:', file.name)
            } catch (heicError) {
              console.error('[DEBUG] Client HEIC conversion failed for file:', file.name, heicError)
              return { success: false, error: `${file.name}: HEIC 파일 변환에 실패했습니다` }
            }
          }
          
          // FormData로 파일 전송
          const formData = new FormData()
          formData.append('file', fileToUpload)
          formData.append('image_type', 'gallery')
          
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
          })
          const result = await res.json()
          
          // 결과에 변환 정보 추가
          if (result.success && conversionAttempted && fileToUpload === file) {
            result.serverConverted = true
          }
          
          return result
        } catch (error) {
          console.error('Error validating/uploading file:', file.name, error)
          return { success: false, error: `${file.name} 처리 실패` }
        }
      })

      const results = await Promise.all(uploadPromises)
      const successCount = results.filter(result => result.success).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        onUpdate()
        const message = failCount > 0 
          ? `${successCount}개 업로드 완료, ${failCount}개 실패`
          : `${successCount}개 이미지 업로드 완료`
        showToast(message, 'success')
      } else {
        showToast('모든 이미지 업로드 실패', 'error')
      }
    } catch (error) {
      console.error('[DEBUG] Error uploading images:', error)
      showToast('업로드 중 오류 발생', 'error')
    } finally {
      setUploading(false)
    }
  }

  // 선택된 아이템들 삭제
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return
    if (!confirm(`선택된 ${selectedItems.size}개 이미지를 삭제하시겠습니까?`)) return

    try {
      console.log('[DEBUG] Deleting selected items:', Array.from(selectedItems))
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
        const message = failCount > 0 
          ? `${successCount}개 삭제 완료, ${failCount}개 실패`
          : `${successCount}개 이미지 삭제 완료`
        showToast(message, 'success')
      } else {
        showToast('이미지 삭제 실패', 'error')
      }
    } catch (error) {
      console.error('[DEBUG] Error deleting images:', error)
      showToast('삭제 중 오류 발생', 'error')
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
        showToast('이미지 삭제 완료', 'success')
      } else {
        showToast('삭제 실패', 'error')
      }
    } catch (error) {
      console.error('[DEBUG] Error deleting image:', error)
      showToast('삭제 중 오류 발생', 'error')
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
        showToast('순서 변경 실패', 'error')
      }
    } catch (error) {
      console.error('[DEBUG] Error reordering gallery:', error)
      showToast('순서 변경 중 오류 발생', 'error')
    }
  }

  // 파일명 추출
  const getFileName = (url: string) => {
    return url.split('/').pop()?.split('.')[0] || 'Unknown'
  }

  // 수정 버튼 클릭
  const handleEditClick = (item: Gallery) => {
    setEditingItem(item)
    setShowCropper(true)
  }

  // 크롭 완료 후 업데이트
  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!editingItem) return

    setShowCropper(false)
    setUploading(true)

    try {
      // 크롭된 이미지를 File 객체로 변환
      const croppedFile = new File(
        [croppedImageBlob], 
        `edited_${editingItem.id}_${Date.now()}.jpg`,
        { type: 'image/jpeg' }
      )

      // FormData 생성
      const formData = new FormData()
      formData.append('file', croppedFile)
      formData.append('image_type', 'gallery')

      // 업로드 API 호출
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // 기존 이미지 삭제
        await fetch(`/api/admin/gallery/${editingItem.id}`, {
          method: 'DELETE',
        })
        
        onUpdate()
        showToast('이미지 수정 완료', 'success')
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('[DEBUG] Edit error:', error)
      showToast('이미지 수정 실패', 'error')
    } finally {
      setUploading(false)
      setEditingItem(null)
    }
  }

  // 크롭 취소
  const handleCropCancel = () => {
    setShowCropper(false)
    setEditingItem(null)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">갤러리 관리</h2>
      
      {/* 크롭 모달 */}
      {showCropper && editingItem && (
        <GalleryImageCropper
          imageSrc={editingItem.url}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

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
              {selectedItems.size > 1 && (
                <span className="text-xs text-amber-600">
                  수정은 1개씩만 가능합니다
                </span>
              )}
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
              onClick={() => toggleSelection(item.id)}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedItems.has(item.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* 선택 체크박스 */}
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="mr-4"
                onClick={(e) => e.stopPropagation()} // 이벤트 전파 방지
              />

              {/* 이미지 미리보기 */}
              <div className="w-16 h-16 relative mr-4">
                <img
                  src={item.url}
                  alt="Gallery"
                  className="w-full h-full object-cover rounded"
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
              <div className="flex flex-col space-y-1 mr-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0}
                  className="w-8 h-6 flex items-center justify-center text-sm font-bold text-black bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={index === galleryItems.length - 1}
                  className="w-8 h-6 flex items-center justify-center text-sm font-bold text-black bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                >
                  ↓
                </button>
              </div>

              {/* 수정 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 이벤트 전파 방지
                  handleEditClick(item);
                }}
                disabled={selectedItems.size > 1 || uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title={selectedItems.size > 1 ? "수정은 1개씩만 가능합니다" : "이미지 수정"}
              >
                수정
              </button>

              {/* 개별 삭제 버튼 */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // 이벤트 전파 방지
                  handleDeleteSingle(item.id);
                }}
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
      
      const res = await fetch(`/api/admin/guestbook/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()

      if (data.success) {
        console.log('✅ [DEBUG] Guestbook deleted successfully')
        
        // 즉시 로컬 상태에서 제거
        setLocalGuestbook(prev => prev.filter(item => item.id !== id))
        
        // 외부 상태도 업데이트 (에러가 발생해도 로컬 상태는 유지)
        try {
          await onUpdate()
          console.log('✅ [DEBUG] Guestbook onUpdate completed successfully')
        } catch (updateError) {
          console.warn('⚠️ [DEBUG] Guestbook onUpdate failed, but local state is updated:', updateError)
        }
        
        alert('방명록이 삭제되었습니다.')
      } else {
        console.log('❌ [DEBUG] Guestbook deletion failed:', data.error)
        alert(data.error || '삭제에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ [DEBUG] Error deleting guestbook:', error)
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
                  <p className="text-sm text-gray-800">
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
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-300"></div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  )
}

function AdminPageContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [guestbook, setGuestbook] = useState<Guestbook[]>([])
  const [contacts, setContacts] = useState<ContactPerson[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [loading, setLoading] = useState({
    auth: true,
    gallery: false,
    guestbook: false,
    contacts: false
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL에서 활성 탭 읽기 (기본값: 'main')
  const getActiveTabFromUrl = useCallback((): 'main' | 'contacts' | 'gallery' | 'guestbook' => {
    const tab = searchParams.get('tab')
    if (tab && ['main', 'contacts', 'gallery', 'guestbook'].includes(tab)) {
      return tab as 'main' | 'contacts' | 'gallery' | 'guestbook'
    }
    return 'main'
  }, [searchParams])
  
  const [activeTab, setActiveTab] = useState<'main' | 'contacts' | 'gallery' | 'guestbook'>(getActiveTabFromUrl())
  
  // 탭 변경 함수 (URL 업데이트 포함)
  const changeTab = (newTab: 'main' | 'contacts' | 'gallery' | 'guestbook') => {
    setActiveTab(newTab)
    // URL 업데이트 (히스토리에 추가)
    router.push(`/admin?tab=${newTab}`)
  }
  
  // URL 변경 감지하여 탭 상태 동기화
  useEffect(() => {
    const urlTab = getActiveTabFromUrl()
    if (urlTab !== activeTab) {
      setActiveTab(urlTab)
    }
  }, [searchParams, activeTab, getActiveTabFromUrl])

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
      router.push('/')
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
      const res = await fetch(`/api/gallery?t=${Date.now()}`)
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
      const res = await fetch(`/api/guestbook?t=${Date.now()}`)
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
      const res = await fetch(`/api/contacts?t=${Date.now()}`)
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

  // 토스트 관리 함수들
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    
    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
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
      {/* 토스트 컨테이너 */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

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
                onClick={() => changeTab(tab.key as 'main' | 'contacts' | 'gallery' | 'guestbook')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-700 hover:text-gray-800 hover:border-gray-300'
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
          {activeTab === 'main' && <MainImageSection onUpdate={updateGallery} showToast={showToast} />}

          {/* 연락처 관리 탭 */}
          {activeTab === 'contacts' && (
            <ContactsSection contacts={contacts} onUpdate={updateContacts} />
          )}

          {/* 갤러리 관리 탭 */}
          {activeTab === 'gallery' && (
            <GallerySection gallery={gallery} onUpdate={updateGallery} loading={loading.gallery} showToast={showToast} />
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