'use client'

import { useEffect, useState } from 'react'

interface DevToolsBlockerProps {
  onBlock?: () => void
}

const DevToolsBlocker = ({ onBlock }: DevToolsBlockerProps) => {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    // F12 키만 감지하여 토스트 표시
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        setShowToast(true)
        onBlock?.()
        return false
      }
    }

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onBlock])

  // 토스트 자동 숨김
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [showToast])

  if (!showToast) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="font-medium">개발자 도구 접근이 제한되었습니다</span>
      </div>
    </div>
  )
}

export default DevToolsBlocker 