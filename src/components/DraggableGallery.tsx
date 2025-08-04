'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Gallery } from '@/types'

interface DraggableGalleryProps {
  items: Gallery[]
  onReorder: (sortedIds: number[]) => Promise<void>
  isSelectionMode?: boolean
  selectedItems?: Set<number>
  onItemClick?: (item: Gallery) => void
}

interface SortableItemProps {
  item: Gallery
  isSelectionMode?: boolean
  isSelected?: boolean
  onClick?: (item: Gallery) => void
}

const SortableItem = ({ item, isSelectionMode, isSelected, onClick }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // 선택 모드에서 전체 아이템 클릭 핸들러
  const handleItemClick = () => {
    if (isSelectionMode) {
      onClick?.(item)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-4 bg-white rounded-lg border-2 transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:shadow-md'
      } ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      } ${isSelectionMode ? 'cursor-pointer' : ''}`}
      onClick={handleItemClick}
    >
      {/* 썸네일 */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
        <img
          src={item.url}
          alt={item.description || `Gallery item ${item.id}`}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* 내용 */}
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

      {/* 선택 모드일 때 체크박스 */}
      {isSelectionMode && (
        <div className="flex-shrink-0">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${
              isSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 hover:border-blue-400'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onClick?.(item)
            }}
          >
            {isSelected && (
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* 드래그 핸들러 */}
      {!isSelectionMode && (
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors select-none"
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
          onTouchMove={(e) => {
            e.stopPropagation()
            e.preventDefault()
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          </svg>
        </div>
      )}
    </div>
  )
}

const DraggableGallery = ({ 
  items, 
  onReorder, 
  isSelectionMode = false,
  selectedItems = new Set(),
  onItemClick 
}: DraggableGalleryProps) => {
  const [mounted, setMounted] = useState(false)

  // SSR 호환성을 위한 마운트 체크
  useEffect(() => {
    setMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex(item => item.id === active.id)
      const newIndex = items.findIndex(item => item.id === over?.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      const sortedIds = newItems.map(item => item.id)

      try {
        await onReorder(sortedIds)
      } catch (error) {
        console.error('Error reordering gallery:', error)
      }
    }
  }

  // SSR 중에는 기본 리스트 렌더링
  if (!mounted) {
    return (
      <div className="space-y-3 select-none">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-gray-200"
          >
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                                       <img
               src={item.url}
               alt={item.description || `Gallery item ${item.id}`}
               className="w-full h-full object-cover"
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 select-none">
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              isSelectionMode={isSelectionMode}
              isSelected={selectedItems.has(item.id)}
              onClick={onItemClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableGallery 