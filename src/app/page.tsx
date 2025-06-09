'use client'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Cover Section */}
      <section className="relative w-full h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/cover.jpg"
            alt="Wedding Cover"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
          <h1 className="text-3xl md:text-4xl font-score mb-4 text-center">김철수 ♥ 이영희</h1>
          <p className="text-lg md:text-xl mb-8 text-center">2024. 05. 20</p>
          <Link
            href="#details"
            className="bg-primary hover:bg-highlight text-white px-6 py-2 md:px-8 md:py-3 rounded-full transition-colors"
          >
            청첩장 보기
          </Link>
        </div>
      </section>

      {/* Details Section */}
      <section id="details" className="w-full py-12 md:py-16 px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl md:text-2xl font-score text-center mb-6 md:mb-8">Wedding Details</h2>
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">예식 일시</h3>
              <p className="text-sm md:text-base">2024년 5월 20일 오후 1시</p>
            </div>
            <div className="text-center">
              <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">예식 장소</h3>
              <p className="text-sm md:text-base">그랜드 웨딩홀</p>
              <p className="text-xs md:text-sm text-gray-600">서울시 강남구 테헤란로 123</p>
            </div>
          </div>
        </div>
      </section>

      {/* Share Button */}
      <button
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-primary hover:bg-highlight text-white p-3 md:p-4 rounded-full shadow-lg transition-colors"
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: '모바일 청첩장',
              text: '김철수 ♥ 이영희의 결혼식에 초대합니다.',
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
