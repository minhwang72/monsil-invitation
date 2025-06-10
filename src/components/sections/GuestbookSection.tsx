import { useState } from 'react'
import type { Guestbook } from '@/types'

interface GuestbookSectionProps {
  guestbook: Guestbook[]
  onGuestbookUpdate: () => void
}

export default function GuestbookSection({ guestbook, onGuestbookUpdate }: GuestbookSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleWrite = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({ name: '', content: '', password: '' })
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal()
    }
  }

  const handleDeleteBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleDeleteCancel()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      showToast('이름을 입력해주세요.', 'error')
      return
    }

    if (formData.name.trim().length > 10) {
      showToast('이름은 10글자 이내로 입력해주세요.', 'error')
      return
    }

    if (!formData.content.trim()) {
      showToast('내용을 입력해주세요.', 'error')
      return
    }

    if (formData.content.trim().length > 200) {
      showToast('내용은 200글자 이내로 입력해주세요.', 'error')
      return
    }

    if (!formData.password.trim()) {
      showToast('비밀번호를 입력해주세요.', 'error')
      return
    }

    if (formData.password.length < 6) {
      showToast('비밀번호는 6자리 이상 입력해주세요.', 'error')
      return
    }

    if (formData.password.length > 12) {
      showToast('비밀번호는 12자리 이내로 입력해주세요.', 'error')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showToast('메시지가 작성되었습니다.', 'success')
        handleCloseModal()
        setTimeout(() => onGuestbookUpdate(), 1000)
      } else {
        showToast('메시지 작성에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('Error submitting message:', error)
      showToast('메시지 작성 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (id: number) => {
    setDeleteTargetId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || !deletePassword.trim()) {
      showToast('비밀번호를 입력해주세요.', 'error')
      return
    }

    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/guestbook?id=${deleteTargetId}&password=${encodeURIComponent(deletePassword)}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok && result.success) {
        showToast('메시지가 삭제되었습니다.', 'success')
        setDeleteModalOpen(false)
        setDeletePassword('')
        setDeleteTargetId(null)
        // 방명록 데이터 갱신
        setTimeout(() => onGuestbookUpdate(), 1000)
      } else {
        showToast(result.error || '삭제에 실패했습니다.', 'error')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      showToast('삭제 중 오류가 발생했습니다.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setDeletePassword('')
    setDeleteTargetId(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}. ${month}. ${day} ${hours}:${minutes}`
  }

  return (
    <>
      <section className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-gray-50/30">
        <div className="max-w-xl mx-auto text-center w-full px-8">
          {/* 제목 */}
          <h2 className="text-4xl font-light mb-16 tracking-wider text-gray-700 font-english english-text">
            GUESTBOOK
          </h2>
          
          {/* 작성 버튼 */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleWrite}
              className="flex items-center gap-2 px-4 py-2 bg-purple-300 hover:bg-purple-400 text-white rounded-lg transition-colors font-sans font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              작성
            </button>
          </div>

          {/* 방명록 리스트 */}
          <div className="space-y-4">
            {guestbook && guestbook.length > 0 ? (
              <>
                {(showAll ? guestbook : guestbook.slice(0, 6)).map((item) => (
                  <div key={item.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-lg">
                    {/* 내용과 삭제버튼 좌우 정렬 */}
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-gray-900 font-sans font-normal leading-relaxed flex-1 pr-2 text-center">{item.content}</p>
                      <div className="flex-shrink-0">
                        {/* 삭제 아이콘 - 분홍색 */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded-lg transition-colors"
                          style={{ color: '#FFCCE0' }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* 날짜와 From 이름 좌우 정렬 */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-sans">
                        <span style={{ color: '#B3D4FF' }}>From </span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <div className="text-xs text-gray-700 font-sans">
                        {formatDate(String(item.created_at))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* 더보기/줄이기 버튼 */}
                {guestbook.length > 6 && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="text-gray-500 hover:text-gray-700 font-sans text-sm transition-colors"
                    >
                      {showAll ? '줄이기' : `더보기 (+${guestbook.length - 6})`}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-lg">
                <p className="text-gray-500 font-light text-center leading-relaxed">
                  메시지가 없습니다.<br />
                  첫 메시지를 작성해주세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 모달 */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleBackgroundClick}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md font-sans">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 font-sans">메시지 작성</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-900 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 font-sans text-gray-900"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  maxLength={200}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 font-sans text-gray-900"
                  placeholder="메시지를 입력하세요"
                />
              </div>

              <div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  maxLength={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 font-sans text-gray-900"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-purple-300 hover:bg-purple-400 text-white rounded-md transition-colors disabled:opacity-50 font-sans font-medium"
                >
                  {isSubmitting ? '작성 중...' : '작성하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {toast && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[10000]">
          <div 
            className="px-4 py-2 rounded-lg font-medium animate-fade-in-out"
            style={{ 
              backgroundColor: toast.type === 'success' ? '#10b981' : '#FFCCE0',
              color: toast.type === 'success' ? 'white' : '#5A4B41'
            }}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* 삭제 모달 */}
      {deleteModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleDeleteBackgroundClick}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md font-sans">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 font-sans">메시지 삭제</h3>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-900 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleDeleteConfirm() }} className="space-y-4">
              <div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  maxLength={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 font-sans text-gray-900"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 font-sans font-medium"
                  style={{ 
                    backgroundColor: '#FFCCE0', 
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.backgroundColor = '#FFB3D1'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.backgroundColor = '#FFCCE0'
                    }
                  }}
                >
                  {isDeleting ? '삭제 중...' : '삭제하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 