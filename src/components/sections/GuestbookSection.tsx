import { useState } from 'react'
import type { Guestbook } from '@/types'

interface GuestbookSectionProps {
  guestbook: Guestbook[]
}

export default function GuestbookSection({ guestbook }: GuestbookSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.content.trim() || !formData.password.trim()) {
      alert('모든 필드를 입력해주세요.')
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
        alert('메시지가 작성되었습니다.')
        handleCloseModal()
        // 페이지 새로고침으로 새로운 메시지 표시
        window.location.reload()
      } else {
        alert('메시지 작성에 실패했습니다.')
      }
    } catch (error) {
      console.error('Error submitting message:', error)
      alert('메시지 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (id: number) => {
    // 수정 기능 구현 예정
    console.log('수정:', id)
  }

  const handleDelete = (id: number) => {
    // 삭제 기능 구현 예정
    console.log('삭제:', id)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      <section className="w-full py-0 md:py-0 px-0">
        <div className="w-full">
          <div className="p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-score text-center mb-6 md:mb-8">MESSAGE</h2>
            
            {/* 작성 버튼 */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleWrite}
                className="flex items-center gap-2 px-4 py-2 bg-purple-300 hover:bg-purple-400 text-white rounded-lg transition-colors"
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
              {guestbook.length > 0 ? (
                guestbook.map((item) => (
                  <div key={item.id} className="p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 text-center">
                        <div className="flex justify-center items-center gap-4 mb-2">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(String(item.created_at))}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {/* 수정 아이콘 */}
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="p-1 text-gray-500 hover:text-gray-700"
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
                        </button>
                        {/* 삭제 아이콘 */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
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
                    <p className="text-gray-700 text-center">{item.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-400 mb-2">메시지가 없습니다.</p>
                  <p className="text-base text-gray-500">첫 메시지를 작성해주세요.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 모달 */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={handleBackgroundClick}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">메시지 작성</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  내용
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="메시지를 입력하세요"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 <span className="text-xs text-gray-500">(수정/삭제용)</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-purple-300 hover:bg-purple-400 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '작성 중...' : '작성하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 