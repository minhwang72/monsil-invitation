'use client'

import { useState, useEffect } from 'react'

export default function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const weddingDate = new Date('2025-11-08T13:00:00+09:00')

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = weddingDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="w-full bg-[#E0F7FF] py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">결혼식까지 남은 시간</h2>
        <div className="grid grid-cols-4 gap-4 mb-16 max-w-md mx-auto">
          {['일', '시간', '분', '초'].map((label, i) => {
            const value = [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds][i]
            return (
              <div key={label} className="bg-white rounded-lg p-4 shadow-lg">
                <div className="text-3xl font-bold text-purple-600">{value}</div>
                <div className="text-sm text-gray-600 mt-1">{label}</div>
              </div>
            )
          })}
        </div>

        {/* ✅ 봉투 */}
        <div className="relative w-full max-w-[320px] mx-auto aspect-[4/3]">
          {/* 뒷면 (봉투 뚜껑 포함) */}
          <div
            className="absolute inset-0 bg-gray-800"
            style={{
              clipPath:
                'polygon(50% 0%, 100% 25%, 100% 100%, 0% 100%, 0% 25%)',
              zIndex: 1
            }}
          />
          {/* 중간 종이 */}
          <div
            className="absolute inset-0 bg-white"
            style={{
              clipPath: 'inset(25% 0% 0% 0%)',
              transform: 'translateY(2px)',
              zIndex: 2
            }}
          />
          {/* 앞면 (위 삼각형 오려낸 봉투) */}
          <div
            className="absolute inset-0 bg-gray-900"
            style={{
              clipPath:
                'polygon(0% 25%, 50% 50%, 100% 25%, 100% 100%, 0% 100%)',
              transform: 'translateY(4px)',
              zIndex: 3
            }}
          />
        </div>
      </div>
    </section>
  )
}
