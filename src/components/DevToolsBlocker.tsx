'use client'

import { useEffect, useState } from 'react'

interface DevToolsBlockerProps {
  onBlock?: () => void
}

const DevToolsBlocker = ({ onBlock }: DevToolsBlockerProps) => {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    // 우클릭 방지
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setShowToast(true)
      onBlock?.()
      return false
    }

    // F12, Ctrl+Shift+I, Ctrl+U, Ctrl+Shift+C 등 키보드 단축키 방지
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        setShowToast(true)
        onBlock?.()
        return false
      }
      
      // Ctrl+Shift+I (개발자 도구)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        setShowToast(true)
        onBlock?.()
        return false
      }
      
      // Ctrl+Shift+J (콘솔)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        setShowToast(true)
        onBlock?.()
        return false
      }
      
      // Ctrl+U (소스 보기)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        setShowToast(true)
        onBlock?.()
        return false
      }
      
      // Ctrl+Shift+C (요소 검사)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        setShowToast(true)
        onBlock?.()
        return false
      }
      
      // Ctrl+Shift+E (네트워크)
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault()
        setShowToast(true)
        onBlock?.()
        return false
      }
    }

    // 개발자 도구 감지 (크기 변화 감지)
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        setShowToast(true)
        onBlock?.()
      }
    }

    // 개발자 도구 감지 (디버거 감지)
    const detectDebugger = () => {
      const startTime = performance.now()
      debugger
      const endTime = performance.now()
      
      if (endTime - startTime > 100) {
        setShowToast(true)
        onBlock?.()
      }
    }

    // 이벤트 리스너 등록
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    
    // 주기적으로 개발자 도구 감지
    const interval = setInterval(detectDevTools, 1000)
    
    // 디버거 감지 (더 정교한 방법)
    const debuggerInterval = setInterval(detectDebugger, 2000)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      clearInterval(interval)
      clearInterval(debuggerInterval)
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