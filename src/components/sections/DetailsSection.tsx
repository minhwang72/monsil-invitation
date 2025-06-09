import NaverMap from '../NaverMap'

export default function DetailsSection() {
  return (
    <section id="details" className="w-full py-0 md:py-0 px-0">
      <div className="w-full">
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-score text-center mb-6 md:mb-8">Wedding Details</h2>
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">예식 일시</h3>
              <p className="text-sm md:text-base">2024년 11월 8일 오후 12시 30분</p>
            </div>
            <div className="text-center">
              <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">예식 장소</h3>
              <p className="text-sm md:text-base">정동제일교회</p>
              <p className="text-xs md:text-sm text-gray-600">서울시 중구 정동길 46</p>
            </div>
          </div>
        </div>
        <NaverMap />
      </div>
    </section>
  )
} 