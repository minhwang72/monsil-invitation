export default function Footer() {
  return (
    <footer className="w-full py-8 md:py-12 px-4 bg-blue-50/50">
      <div className="max-w-md mx-auto">
        <div className="flex flex-col items-center space-y-3">
          {/* 장식용 하트 아이콘 */}
          <div className="w-6 h-6 text-purple-300 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          
          {/* 저작권 텍스트 */}
          <p className="text-xs md:text-sm text-gray-500 font-light">
            © 2025 Min Hwang. All rights reserved
          </p>

          {/* 구분선 */}
          <div className="w-12 h-px bg-blue-200/50"></div>

          {/* 추가 메시지 */}
          <p className="text-xs text-gray-500 font-light italic">
            Thank you for visiting our wedding invitation
          </p>
        </div>
      </div>
    </footer>
  )
} 