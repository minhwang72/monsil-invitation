'use client'

import { useState, useEffect, useRef } from 'react'
import type { Gallery } from '@/types'

interface SelectableGalleryProps {
  items: Gallery[]
  onReorder: (sortedIds: number[]) => Promise<void>
  isSelectionMode?: boolean
  selectedItems?: Set<number>
  onItemClick?: (item: Gallery) => void
}

export default function SelectableGallery({ 
  items, 
  onReorder, 
  isSelectionMode = false,
  selectedItems = new Set(),
  onItemClick 
}: SelectableGalleryProps) {
  const [mounted, setMounted] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Gallery | null>(null)
  const [movingItem, setMovingItem] = useState<number | null>(null)
  const selectedItemRef = useRef<HTMLDivElement>(null)

  // SSR 호환성을 위한 마운트 체크
  useEffect(() => {
    setMounted(true)
  }, [])

  // 선택된 아이템이 변경될 때 자동 스크롤
  useEffect(() => {
    if (selectedItem && selectedItemRef.current) {
      setTimeout(() => {
        selectedItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
    }
  }, [selectedItem])

  // 아이템 선택 핸들러
  const handleItemSelect = (item: Gallery) => {
    if (isSelectionMode) {
      // 선택 모드에서는 기존 로직 사용
      onItemClick?.(item)
      return
    }

    // 위치 변경 모드에서는 단일 선택
    if (selectedItem?.id === item.id) {
      // 같은 아이템 클릭 시 선택 해제
      setSelectedItem(null)
    } else {
      // 다른 아이템 선택
      setSelectedItem(item)
    }
  }

  // 위로 이동
  const moveUp = async () => {
    if (!selectedItem) return

    const currentIndex = items.findIndex(i => i.id === selectedItem.id)
    if (currentIndex <= 0) return // 이미 맨 위

    setMovingItem(selectedItem.id)
    
    try {
      const newItems = [...items]
      const temp = newItems[currentIndex]
      newItems[currentIndex] = newItems[currentIndex - 1]
      newItems[currentIndex - 1] = temp

      const sortedIds = newItems.map(i => i.id)
      await onReorder(sortedIds)
      
      // 선택된 아이템 업데이트 (순서가 바뀌었으므로)
      setSelectedItem(newItems[currentIndex - 1])
    } catch (error) {
      console.error('Error moving item up:', error)
    } finally {
      setMovingItem(null)
    }
  }

  // 아래로 이동
  const moveDown = async () => {
    if (!selectedItem) return

    const currentIndex = items.findIndex(i => i.id === selectedItem.id)
    if (currentIndex >= items.length - 1) return // 이미 맨 아래

    setMovingItem(selectedItem.id)
    
    try {
      const newItems = [...items]
      const temp = newItems[currentIndex]
      newItems[currentIndex] = newItems[currentIndex + 1]
      newItems[currentIndex + 1] = temp

      const sortedIds = newItems.map(i => i.id)
      await onReorder(sortedIds)
      
      // 선택된 아이템 업데이트 (순서가 바뀌었으므로)
      setSelectedItem(newItems[currentIndex + 1])
    } catch (error) {
      console.error('Error moving item down:', error)
    } finally {
      setMovingItem(null)
    }
  }

  // 선택 해제
  const clearSelection = () => {
    setSelectedItem(null)
  }

  // SSR 중에는 기본 리스트 렌더링
  if (!mounted) {
    return (
      <div className="space-y-3 select-none touch-manipulation">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-gray-200"
          >
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
              <img
                src={item.url}
                alt={item.description || `Gallery item ${item.id}`}
                className="w-full h-full object-contain bg-gray-50"
                draggable={false}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-600 mb-1">
                순서: {item.order_index !== null ? item.order_index : 'N/A'}
              </div>
              {item.description && (
                <div className="text-sm text-gray-800 truncate">
                  {item.description}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative pb-20">
      {/* 안내 메시지 */}
      {!isSelectionMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>순서 변경 방법:</strong> 사진을 클릭하여 선택한 후, 하단의 위/아래 버튼을 사용하여 순서를 변경하세요.
          </p>
        </div>
      )}

      {/* 갤러리 리스트 */}
      <div className="space-y-3 select-none touch-manipulation">
        {items.map((item, index) => {
          const isSelected = selectedItem?.id === item.id
          const isInSelectionMode = isSelectionMode && selectedItems.has(item.id)
          const isMoving = movingItem === item.id
          const canMoveUp = index > 0
          const canMoveDown = index < items.length - 1
          
          return (
            <div
              key={item.id}
              ref={isSelected ? selectedItemRef : null}
              className={`flex items-center gap-4 p-4 bg-white rounded-lg border-2 transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                  : isInSelectionMode
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${isMoving ? 'opacity-75' : ''}`}
            >
              {/* 순서 번호 */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {item.order_index !== null ? item.order_index : '?'}
                </span>
              </div>

              {/* 썸네일 */}
              <div 
                className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => handleItemSelect(item)}
              >
                <img
                  src={item.url}
                  alt={item.description || `Gallery item ${item.id}`}
                  className="w-full h-full object-contain bg-gray-50"
                  draggable={false}
                />
              </div>

              {/* 내용 */}
              <div 
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => handleItemSelect(item)}
              >
                {item.description && (
                  <div className="text-sm text-gray-800 truncate mb-1">
                    {item.description}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                {isSelected && !isSelectionMode && (
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    선택됨 - 하단 버튼으로 순서 변경
                  </div>
                )}
              </div>

              {/* 선택 표시 */}
              {isSelected && !isSelectionMode && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* 선택 모드 체크박스 */}
              {isSelectionMode && (
                <div className="flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
                      isInSelectionMode
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      e.preventDefault()
                      onItemClick?.(item)
                    }}
                  >
                    {isInSelectionMode && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 이동 중 로딩 표시 */}
      {movingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-700">순서 변경 중...</span>
            </div>
          </div>
        </div>
      )}

      {/* 하단 고정 순서 변경 버튼 (선택된 아이템이 있을 때만) */}
      {selectedItem && !isSelectionMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {/* 선택된 아이템 정보 */}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.description || `Selected item`}
                    className="w-full h-full object-contain bg-gray-50"
                    draggable={false}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    순서 {selectedItem.order_index}
                  </div>
                  <div className="text-xs text-gray-500">
                    선택됨
                  </div>
                </div>
              </div>

              {/* 이동 버튼들 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={moveUp}
                  disabled={items.findIndex(item => item.id === selectedItem.id) <= 0 || movingItem !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">위로</span>
                </button>

                <button
                  onClick={moveDown}
                  disabled={items.findIndex(item => item.id === selectedItem.id) >= items.length - 1 || movingItem !== null}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">아래로</span>
                </button>

                <button
                  onClick={clearSelection}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">취소</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 