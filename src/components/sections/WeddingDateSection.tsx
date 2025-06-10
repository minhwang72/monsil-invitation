export default function WeddingDateSection() {
  // 2025년 11월 달력 생성
  const year = 2025
  const month = 10 // JavaScript Date에서 11월은 10
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = 일요일, 6 = 토요일

  // 달력 배열 생성
  const calendarDays = []
  
  // 첫 주의 빈 칸들
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // 실제 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = (startingDayOfWeek + day - 1) % 7
    calendarDays.push({
      day,
      dayOfWeek,
      isWeddingDay: day === 8
    })
  }

  const getDayClass = (dayInfo: { day: number; dayOfWeek: number; isWeddingDay: boolean } | null) => {
    if (!dayInfo) return "invisible"
    
    const baseClass = "flex items-center justify-center w-14 h-14 text-lg font-medium transition-all duration-300"
    
    if (dayInfo.isWeddingDay) {
      // 결혼 당일 (8일) - 기본 스타일 (라벤더 원은 별도로 렌더링)
      return `${baseClass} text-gray-600 relative`
    } else if (dayInfo.dayOfWeek === 0) {
      // 일요일 - 연분홍 (더 연하게)
      return `${baseClass} font-semibold text-pink-300`
    } else if (dayInfo.dayOfWeek === 6) {
      // 토요일 - 베이비블루 (더 연하게)
      return `${baseClass} font-semibold text-blue-300`
    } else {
      // 평일 - 회색
      return `${baseClass} text-gray-600`
    }
  }

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  return (
    <section className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-gray-50/50">
      <div className="max-w-xl mx-auto text-center w-full px-8">
        {/* 제목 */}
        <h2 className="text-4xl font-light mb-16 tracking-wider text-gray-700 font-english english-text">
          WEDDING DATE
        </h2>

        {/* 상단 가로선 */}
        <div className="w-full h-px bg-gray-200 mb-8"></div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {weekDays.map((day) => (
            <div key={day} className="text-sm font-medium text-gray-500 text-center py-3 font-english english-text">
              {day}
            </div>
          ))}
        </div>

        {/* 달력 */}
        <div className="grid grid-cols-7 gap-3">
          {calendarDays.map((dayInfo, dayIndex) => (
            <div key={dayIndex} className={getDayClass(dayInfo)}>
              {dayInfo?.isWeddingDay ? (
                <>
                  {/* 작은 라벤더 원 배경 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-purple-300 rounded-full shadow-sm"></div>
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

        {/* 하단 가로선 */}
        <div className="w-full h-px bg-gray-200 mt-8 mb-10"></div>

        {/* 날짜 및 시간 정보 */}
        <div className="space-y-3">
          <p className="text-lg font-medium text-gray-700">
            2025년 11월 8일 토요일 | 오후 12시 30분
          </p>
          <p className="text-base font-normal text-gray-500 font-english english-text">
            Saturday, November 8, 2025 | PM 12:30
          </p>
        </div>
      </div>
    </section>
  )
} 