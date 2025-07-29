'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function BlessingSection() {
  // 스크롤 애니메이션 훅들
  const firstParagraphAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 200 })
  const secondParagraphAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 500 })

  return (
    <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-0 font-sans bg-gray-50/50">
      <div className="max-w-xl mx-auto text-center w-full px-6 md:px-8">
        {/* 메시지 내용 */}
        <div className="space-y-6 md:space-y-8 mb-8">
          {/* 첫 번째 문단 */}
          <div 
            ref={firstParagraphAnimation.ref}
            className={`space-y-3 md:space-y-4 transition-all duration-800 ${firstParagraphAnimation.animationClass}`}
          >
            <p className="text-sm md:text-base font-semibold text-gray-600 leading-relaxed" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              하나님께서 인도하신 만남 속에서
            </p>
            <p className="text-sm md:text-base font-semibold text-gray-600 leading-relaxed" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              서로의 존재에 감사하며
            </p>
            <p className="text-sm md:text-base font-semibold text-gray-600 leading-relaxed" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              가장 진실한 사랑으로 하나 되고자 합니다.
            </p>
          </div>

          {/* 세 번째 문단 */}
          <div 
            ref={secondParagraphAnimation.ref}
            className={`space-y-3 md:space-y-4 transition-all duration-800 ${secondParagraphAnimation.animationClass}`}
          >
            <p className="text-sm md:text-base font-semibold text-gray-600 leading-relaxed" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              소중한 분들을 모시고
            </p>
            <p className="text-sm md:text-base font-semibold text-gray-600 leading-relaxed" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              그 첫걸음을 함께 나누고 싶습니다.
            </p>
            <p className="text-sm md:text-base font-semibold text-gray-600 leading-relaxed" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              축복으로 함께해 주시면 감사하겠습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 