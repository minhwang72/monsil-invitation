import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  animationDelay?: number
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { 
    threshold = 0.1, 
    rootMargin = '0px', 
    triggerOnce = true,
    animationDelay = 0
  } = options
  
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting
        setIsVisible(isIntersecting)
        
        if (isIntersecting && triggerOnce && !hasTriggered) {
          setHasTriggered(true)
          // 애니메이션 딜레이 적용
          setTimeout(() => {
            setShouldAnimate(true)
          }, animationDelay)
        } else if (!triggerOnce) {
          setShouldAnimate(isIntersecting)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce, hasTriggered, animationDelay])

  // triggerOnce가 true이면 한번 트리거된 후 계속 true 유지
  const finalShouldAnimate = triggerOnce ? (hasTriggered && shouldAnimate) : shouldAnimate

  return { 
    ref, 
    isVisible, 
    shouldAnimate: finalShouldAnimate,
    animationClass: finalShouldAnimate ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
  }
} 