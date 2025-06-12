import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  animationDelay?: number
  disabled?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { 
    threshold = 0.1, 
    rootMargin = '0px', 
    triggerOnce = true,
    animationDelay = 0,
    disabled = false
  } = options
  
  const [isVisible, setIsVisible] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [shouldAnimate, setShouldAnimate] = useState(disabled) // disabled면 초기에 true
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // disabled 상태가 변경될 때 처리
    if (disabled) {
      setShouldAnimate(true)
      return
    }

    // disabled에서 enabled로 변경될 때 초기화
    setShouldAnimate(false)
    setHasTriggered(false)
    setIsVisible(false)

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting
        setIsVisible(isIntersecting)
        
        if (isIntersecting && (!triggerOnce || !hasTriggered)) {
          if (triggerOnce) {
            setHasTriggered(true)
          }
          
          // 애니메이션 딜레이 적용
          if (animationDelay > 0) {
            setTimeout(() => {
              setShouldAnimate(true)
            }, animationDelay)
          } else {
            setShouldAnimate(true)
          }
        } else if (!triggerOnce && !isIntersecting) {
          setShouldAnimate(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce, animationDelay, disabled])

  // 최종 애니메이션 상태 결정
  const finalShouldAnimate = disabled || (triggerOnce ? shouldAnimate : (isVisible && shouldAnimate))

  return { 
    ref, 
    isVisible, 
    shouldAnimate: finalShouldAnimate,
    animationClass: finalShouldAnimate ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'
  }
} 