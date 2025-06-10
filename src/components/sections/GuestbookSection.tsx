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
    
    // 비밀번호 필드의 경우 한글 입력 방지 (영문자, 숫자, 특수문자만 허용)
    if (name === 'password') {
      const filteredValue = value.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '')
      setFormData(prev => ({
        ...prev,
        [name]: filteredValue
      }))
      return
    }
    
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
        onGuestbookUpdate()
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
        // 방명록 데이터 갱신 - 서버 처리 완료를 위한 충분한 지연 후 실행
        setTimeout(() => {
          onGuestbookUpdate()
        }, 500)
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
      <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-0 font-sans bg-gray-50/30">
        <div className="max-w-xl mx-auto text-center w-full px-6 md:px-8">
          {/* 제목 */}
          <h2 className="text-3xl md:text-4xl font-light mb-12 md:mb-16 tracking-wider text-gray-700 font-english english-text">
            GUESTBOOK
          </h2>
          
          {/* 작성 버튼 */}
          <div className="flex justify-end mb-4 md:mb-6">
            <button
              onClick={handleWrite}
              className="flex items-center gap-2 px-4 py-2 bg-purple-300 hover:bg-purple-400 text-white rounded-lg transition-colors font-sans font-medium text-sm md:text-base"
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
          <div className="space-y-4 md:space-y-6 text-left">
            {guestbook && guestbook.length > 0 ? (
              <>
                {(showAll ? guestbook : guestbook.slice(0, 3)).map((item) => (
                  <div key={item.id} className="bg-white/80 p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                      <div className="text-gray-700 leading-relaxed text-sm md:text-base whitespace-pre-wrap flex-1 pr-4">
                        {item.content}
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-pink-300 hover:text-pink-400 transition-colors p-1 flex-shrink-0"
                        aria-label="메시지 삭제"
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
                    <div className="flex justify-between items-end">
                      <div className="text-sm md:text-base">
                        <span className="text-sky-400 font-medium">From.</span>
                        <span className="text-gray-800 font-medium ml-1">{item.name}</span>
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">{formatDate(String(item.created_at))}</div>
                    </div>
                  </div>
                ))}
                
                {/* 더보기 버튼 */}
                {guestbook.length > 3 && (
                  <div className="flex justify-center mt-6 md:mt-8">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors font-sans"
                    >
                      <span className="text-sm font-light">
                        {showAll ? '접기' : '더보기'}
                      </span>
                      <svg
                        className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 md:py-16 text-gray-500">
                <p className="text-sm md:text-base">아직 작성된 메시지가 없습니다.</p>
                <p className="text-xs md:text-sm mt-2">첫 번째 축하 메시지를 남겨보세요!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 작성 모달 */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleBackgroundClick}
        >
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md font-sans max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-medium text-gray-900 font-sans">메시지 작성</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-sm md:text-base"
                  placeholder="이름을 입력해주세요 (최대 10글자)"
                />
              </div>

              <div>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent resize-none text-sm md:text-base"
                  placeholder="축하 메시지를 입력해주세요 (최대 200글자)"
                />
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {formData.content.length}/200
                </div>
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent text-sm md:text-base"
                  placeholder="비밀번호를 입력해주세요 (6~12자리)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-2 px-4 text-sm md:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 text-sm md:text-base bg-purple-300 hover:bg-purple-400 disabled:bg-purple-200 text-white rounded-md transition-colors"
                >
                  {isSubmitting ? '작성 중...' : '작성하기'}
                </button>
              </div>
            </form>
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
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-sm font-sans">
            <div className="mb-4">
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">메시지 삭제</h3>
              <p className="text-sm text-gray-600">삭제하려면 비밀번호를 입력해주세요.</p>
            </div>

            <div className="mb-4">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-sm md:text-base"
                placeholder="비밀번호 입력"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 py-2 px-4 text-sm md:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2 px-4 text-sm md:text-base bg-pink-300 hover:bg-pink-400 disabled:bg-pink-200 text-white rounded-md transition-colors"
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 메시지 */}
      {toast && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-[10000] px-4">
          <div 
            className={`px-4 py-2 rounded-lg font-medium animate-fade-in-out text-sm md:text-base ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </>
  )
} 