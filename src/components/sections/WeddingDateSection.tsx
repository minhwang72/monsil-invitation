'use client'

import { useScrollAnimation } from '@/hooks/useScrollAnimation'

export default function WeddingDateSection() {
  // 스크롤 애니메이션 훅들
  const titleAnimation = useScrollAnimation({ threshold: 0.4, animationDelay: 200 })
  const calendarAnimation = useScrollAnimation({ threshold: 0.3, animationDelay: 400 })
  const dateInfoAnimation = useScrollAnimation({ threshold: 0.2, animationDelay: 600 })

  // 2025년 11월 달력 생성
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay()
  }

  const year = 2025
  const month = 11
  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfMonth = getFirstDayOfMonth(year, month)
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  // 달력 배열 생성
  const calendarDays: Array<{ day: number; isWeddingDay: boolean } | null> = []
  
  // 첫 번째 주의 빈 공간 채우기
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // 날짜 채우기
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isWeddingDay: day === 8 // 11월 8일이 결혼식 날
    })
  }

  const getDayClass = (dayInfo: { day: number; isWeddingDay: boolean } | null) => {
    if (!dayInfo) return 'h-10 md:h-12 w-full text-center flex items-center justify-center text-sm md:text-base text-gray-300'
    
    // 실제 날짜를 기반으로 요일 계산
    const actualDate = new Date(year, month - 1, dayInfo.day)
    const dayOfWeek = actualDate.getDay()
    let weekendClass = ''
    if (dayOfWeek === 6) { // 토요일 - 베이비블루
      weekendClass = 'text-sky-500'
    } else if (dayOfWeek === 0) { // 일요일 - 연핑크
      weekendClass = 'text-pink-400'
    }
    
    if (dayInfo.isWeddingDay) {
      return `h-10 md:h-12 w-full text-center flex items-center justify-center text-sm md:text-base relative ${weekendClass}`
    }
    
    return `h-10 md:h-12 w-full text-center flex items-center justify-center text-sm md:text-base text-gray-700 transition-colors rounded ${weekendClass}`
  }

  return (
    <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-0 font-sans bg-white">
      <div className="max-w-xl mx-auto text-center w-full px-6 md:px-8">
        {/* 제목 */}
        <h2 
          ref={titleAnimation.ref}
          className={`text-3xl md:text-4xl font-semibold mb-12 md:mb-16 tracking-wider text-black transition-all duration-800 ${titleAnimation.animationClass}`}
          style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}
        >
          WEDDING DATE
        </h2>

        {/* 상단 가로선 */}
        <div className="w-full h-px bg-gray-200 mb-6 md:mb-8"></div>

        {/* 달력 전체 */}
        <div 
          ref={calendarAnimation.ref}
          className={`transition-all duration-800 ${calendarAnimation.animationClass}`}
        >
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4 md:mb-6">
            {weekDays.map((day) => (
                          <div key={day} className="text-xs md:text-sm font-semibold text-black text-center py-2 md:py-3" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              {day}
            </div>
            ))}
          </div>

          {/* 달력 */}
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {calendarDays.map((dayInfo, dayIndex) => (
              <div key={dayIndex} className={getDayClass(dayInfo)}>
                {dayInfo?.isWeddingDay ? (
                  <>
                    {/* 작은 라벤더 원 배경 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 md:w-10 h-8 md:h-10 bg-purple-300 rounded-full shadow-sm"></div>
                    </div>
                    {/* 흰색 숫자 */}
                    <span className="relative z-10 text-white font-medium">
                      {dayInfo.day}
                    </span>
                  </>
                ) : (
                  dayInfo?.day || ''
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 가로선 */}
        <div className="w-full h-px bg-gray-200 mt-6 md:mt-8 mb-8 md:mb-10"></div>

        {/* 날짜 및 시간 정보 */}
        <div 
          ref={dateInfoAnimation.ref}
          className={`space-y-3 md:space-y-4 transition-all duration-800 ${dateInfoAnimation.animationClass}`}
        >
          <div className="text-base md:text-lg font-semibold text-black tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            2025년 11월 8일 토요일&nbsp;&nbsp;|&nbsp;&nbsp;오후 12시 30분
          </div>
          
          <div className="text-base md:text-lg font-semibold text-black tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
            Saturday, November 8, 2025&nbsp;&nbsp;|&nbsp;&nbsp;PM 1:00
          </div>
        </div>
      </div>
    </section>
  )
} 