import type { Guestbook } from '@/types'

interface GuestbookSectionProps {
  guestbook: Guestbook[]
}

export default function GuestbookSection({ guestbook }: GuestbookSectionProps) {
  const handleWrite = () => {
    // 작성 기능 구현 예정
    console.log('작성 버튼 클릭')
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
    <section className="w-full py-0 md:py-0 px-0">
      <div className="w-full">
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-score text-center mb-6 md:mb-8">MESSAGE</h2>
          
          {/* 작성 버튼 */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleWrite}
              className="flex items-center gap-2 px-4 py-2 bg-purple-300 hover:bg-purple-400 text-gray-800 rounded-lg transition-colors"
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              작성
            </button>
          </div>

          {/* 방명록 리스트 */}
          <div className="space-y-4">
            {guestbook.length > 0 ? (
              guestbook.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 text-center">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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
                  <p className="text-gray-700">{item.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>메시지가 없습니다.</p>
                <p>첫 메시지를 작성해주세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
} 