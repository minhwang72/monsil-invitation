'use client'

import { useEffect } from 'react'

interface DevToolsBlockerProps {
  onBlock?: () => void
}

const DevToolsBlocker = ({ onBlock }: DevToolsBlockerProps) => {
  useEffect(() => {
    // F12 키 차단
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault()
        onBlock?.()
        return false
      }
    }

    // 마우스 우클릭 차단
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      onBlock?.()
      return false
    }

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [onBlock])

  return null
}

export default DevToolsBlocker 