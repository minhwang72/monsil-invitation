import React from 'react'

interface GlobalLoadingProps {
  isLoading: boolean
  message?: string
}

export default function GlobalLoading({ isLoading, message = 'LOADING' }: GlobalLoadingProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[10000]">
      <div className="bg-white rounded-lg px-8 py-6 shadow-xl flex flex-col items-center space-y-4">
        <div className="text-lg font-medium text-gray-800">
          {message}
        </div>
        
        {/* 점점점 애니메이션 */}
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
} 