'use client'

import { useState, useEffect, useRef } from 'react'

export default function BlessingSection() {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionTop = rect.top
      const sectionHeight = rect.height

      // 섹션이 화면에 들어오기 시작할 때부터 계산
      const startPoint = windowHeight - 100
      const endPoint = -sectionHeight + 200

      if (sectionTop <= startPoint && sectionTop >= endPoint) {
        // 스크롤 진행률 계산 (0 ~ 1)
        const progress = Math.max(0, Math.min(1, (startPoint - sectionTop) / (startPoint - endPoint)))
        
        // 9개 라인을 스크롤 진행률에 따라 순차적으로 표시
        const totalLines = 9
        const linesToShow = Math.floor(progress * (totalLines + 1))
        
        const newVisibleLines = Array.from({ length: linesToShow }, (_, i) => i)
        setVisibleLines(newVisibleLines)
      } else if (sectionTop > startPoint) {
        // 섹션이 아직 화면에 오지 않았을 때
        setVisibleLines([])
      } else if (sectionTop < endPoint) {
        // 섹션이 완전히 지나갔을 때는 모든 라인 표시
        setVisibleLines([0, 1, 2, 3, 4, 5, 6, 7, 8])
      }
    }

    // 초기 상태 확인
    handleScroll()

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  const lineClass = (index: number) => {
    const baseClass = "text-base font-normal text-gray-600 leading-relaxed transition-all duration-300"
    const isVisible = visibleLines.includes(index)
    return `${baseClass} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`
  }

  return (
    <section ref={sectionRef} className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-gray-50/50">
      <div className="max-w-xl mx-auto text-center w-full px-8">
        {/* 상단 가로선 */}
        <div className="w-full h-px bg-gray-200 mb-8"></div>

        {/* 메시지 내용 */}
        <div className="space-y-6 mb-8">
          {/* 첫 번째 문단 */}
          <div className="space-y-4">
            <p className={lineClass(0)}>
              하나님께서 인도하신 만남 속에서
            </p>
            <p className={lineClass(1)}>
              서로의 존재에 감사하며
            </p>
            <p className={lineClass(2)}>
              가장 진실한 사랑으로 하나 되고자 합니다.
            </p>
          </div>

          {/* 두 번째 문단 */}
          <div className="space-y-4">
            <p className={lineClass(3)}>
              따스한 축복 아래, 새로운 시작을 앞두고
            </p>
            <p className={lineClass(4)}>
              저희 두 사람이 주님 안에서
            </p>
            <p className={lineClass(5)}>
              사랑과 믿음으로 가정을 이루려 합니다.
            </p>
          </div>

          {/* 세 번째 문단 */}
          <div className="space-y-4">
            <p className={lineClass(6)}>
              소중한 분들을 모시고
            </p>
            <p className={lineClass(7)}>
              그 첫걸음을 함께 나누고 싶습니다.
            </p>
            <p className={lineClass(8)}>
              축복으로 함께해 주시면 감사하겠습니다.
            </p>
          </div>
        </div>

        {/* 하단 가로선 */}
        <div className="w-full h-px bg-gray-200"></div>
      </div>
    </section>
  )
} 