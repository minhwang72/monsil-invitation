import { ReactNode } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface LazySectionProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  rootMargin?: string
  threshold?: number
}

export default function LazySection({ 
  children, 
  fallback, 
  className = '',
  rootMargin = '100px',
  threshold = 0.1
}: LazySectionProps) {
  const { ref, shouldLoad } = useIntersectionObserver({
    rootMargin,
    threshold,
    triggerOnce: true
  })

  return (
    <div ref={ref} className={className}>
      {shouldLoad ? children : fallback}
    </div>
  )
} 