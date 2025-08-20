'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DevToolsBlocker from '@/components/DevToolsBlocker'

export default function Home() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const [animate, setAnimate] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // 페이지 로드 시 즉시 스크롤을 맨 아래로 이동하고 고정 (애니메이션 없이)
    window.scrollTo(0, document.body.scrollHeight)
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

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
        setAnimate(true)
        setTimeout(() => setAnimate(false), 300)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    // 1초 후에 안내 문구 표시
    setTimeout(() => {
      setShowGuide(true)
    }, 1000)

    return () => {
      clearInterval(timer)
      // 컴포넌트 언마운트 시 스크롤 해제
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  const handleLetterClick = () => {
    setIsTransitioning(true)
    // 흰 종이가 중앙까지 올라온 후 페이드아웃 시작
    setTimeout(() => {
      setIsFading(true)
      // 페이드아웃 후 페이지 전환
      setTimeout(() => {
        router.push('/invitation')
      }, 1000)
    }, 1000)
  }

  return (
    <main className={`h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#E0F7FF] to-[#F5E6FF] px-4 relative overflow-hidden transition-opacity duration-1000 ${
      isFading ? 'opacity-0' : 'opacity-100'
    }`}>
      <DevToolsBlocker />
      {/* ⏱️ 카운트다운 영역 */}
      <div className="text-center mb-8 md:mb-12">
        <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
          <span className="text-gray-700 text-base md:text-lg font-semibold tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>민</span>
          <svg 
            className="w-4 h-4 md:w-5 md:h-5 text-pink-300"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-gray-700 text-base md:text-lg font-semibold tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>은솔</span>
          <span className="text-gray-600 text-base md:text-lg font-semibold tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>의 결혼까지...</span>
        </div>

        <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-md md:max-w-2xl mx-auto">
          {[
            { value: timeLeft.days, label: 'DAYS' },
            { value: timeLeft.hours, label: 'HOURS' },
            { value: timeLeft.minutes, label: 'MINS' },
            { value: timeLeft.seconds, label: 'SECS' }
          ].map(({ value, label }) => (
            <div key={label} className="relative">
              <div className={`flex flex-col items-center transition-all duration-300 ${animate ? 'animate-fade' : ''}`}>
                <div className="text-3xl md:text-5xl font-semibold text-[#9B6B9E]" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {value}
                </div>
                <div className="text-xs md:text-sm text-[#B3D4FF] mt-1 md:mt-2 tracking-wider font-semibold" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 💌 편지지 (화면 하단 고정) */}
      <div className="absolute bottom-[-10%] md:bottom-[-5%] left-0 right-0 flex justify-center">
        <div className="relative w-full max-w-[280px] md:max-w-[340px] aspect-[4/3] mx-auto">
          {/* 안내 문구 */}
          <div 
            className={`absolute -top-12 md:-top-16 left-0 right-0 text-center transition-all duration-500 ${
              showGuide ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <p className="text-black text-xs md:text-sm font-medium tracking-wide mb-1 md:mb-2" style={{ fontFamily: 'SeoulNamsanL, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              청첩장을 클릭해주세요
            </p>
            <svg 
              className="w-3 h-3 md:w-4 md:h-4 text-black mx-auto animate-bounce"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
          
          {/* 뒷면 */}
          <div
            className="absolute bottom-0 left-0 right-0 h-full bg-[#2C3E50] rounded-lg shadow-inner"
            style={{
              zIndex: 1
            }}
          />

          {/* 흰 종이 (조금 작게) */}
          <div
            className={`absolute bottom-[-120%] md:bottom-[-130%] left-[6%] right-[6%] h-[200%] md:h-[220%] bg-white rounded-md shadow-lg cursor-pointer transition-all duration-1000 ${
              isTransitioning ? 'translate-y-[-90%]' : ''
            }`}
            style={{
              zIndex: 2,
              transformOrigin: 'center bottom'
            }}
            onClick={handleLetterClick}
          >
            <div className="flex flex-col h-full">
              {/* 이름 좌우 정렬 */}
              <div className="flex justify-center items-center mt-6 md:mt-8 mb-4 md:mb-6">
                <div className="w-full max-w-sm flex justify-between items-center px-6 md:px-8">
                  <span className="text-sm md:text-base lg:text-lg font-semibold tracking-wide text-black" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    황민
                  </span>
                  
                  {/* 장식 SVG */}
                  <div className="w-24 md:w-32 lg:w-36 h-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 160 46" width="150" height="43" preserveAspectRatio="xMidYMid meet" style={{width: "100%", height: "100%", transform: "translate3d(0px, 0px, 0px)"}}>
                      <defs>
                        <clipPath id="lottie_clip_path">
                          <rect width="160" height="46" x="0" y="0"></rect>
                        </clipPath>
                      </defs>
                      <g clipPath="url(#lottie_clip_path)">
                        <g transform="matrix(1,0,0,1,80,23)" opacity="1" style={{display: "block"}}>
                          <path
                            id="decorative-path"
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            fillOpacity="0" 
                            stroke="#B3D4FF" 
                            strokeOpacity="1" 
                            strokeWidth="1.4" 
                            d=" M-57.904998779296875,0.9750000238418579 C-52.025001525878906,0.2849999964237213 -46.025001525878906,0.5350000262260437 -40.224998474121094,1.7350000143051147 C-38.17499923706055,2.1649999618530273 -36.154998779296875,2.7049999237060547 -34.14500045776367,3.2950000762939453 C-29.704999923706055,4.625 -25.344999313354492,6.224999904632568 -20.895000457763672,7.494999885559082 C-14.494999885559082,9.3149995803833 -7.675000190734863,10.444999694824219 -1.1950000524520874,8.954999923706055 C-1.1349999904632568,8.944999694824219 -1.065000057220459,8.925000190734863 -1.0049999952316284,8.914999961853027 C5.545000076293945,7.364999771118164 11.664999961853027,2.6449999809265137 13.28499984741211,-3.875 C13.725000381469727,-5.635000228881836 13.8149995803833,-7.554999828338623 13.045000076293945,-9.1850004196167 C12.274999618530273,-10.824999809265137 10.46500015258789,-12.055000305175781 8.6850004196167,-11.725000381469727 C7.505000114440918,-11.515000343322754 6.324999809265137,-10.454999923706055 5.545000076293945,-9.574999809265137 C5.114999771118164,-9.085000038146973 4.744999885559082,-8.555000305175781 4.445000171661377,-7.985000133514404 C4.304999828338623,-7.724999904632568 3.615000009536743,-6.514999866485596 3.765000104904175,-6.244999885559082 C2.2049999237060547,-8.954999923706055 -1.3949999809265137,-11.175000190734863 -4.574999809265137,-10.154999732971191 C-7.534999847412109,-9.194999694824219 -8.324999809265137,-5.085000038146973 -7.835000038146973,-2.4149999618530273 C-7.474999904632568,-0.4650000035762787 -6.565000057220459,1.3350000381469727 -5.574999809265137,3.0450000762939453 C-4.355000019073486,5.164999961853027 -2.9549999237060547,7.235000133514404 -1.1950000524520874,8.954999923706055 C-0.9150000214576721,9.234999656677246 -0.6150000095367432,9.515000343322754 -0.3050000071525574,9.774999618530273 C0.4749999940395355,10.4350004196167 1.8849999904632568,12.055000305175781 3.0450000762939453,11.4350004196167 C3.184999942779541,11.364999771118164 3.2950000762939453,11.234999656677246 3.4149999618530273,11.125 C5.775000095367432,8.625 8.975000381469727,7.164999961118164 12.175000190734863,6.045000076293945 C15.614999771118164,4.84499979019165 19.2549991607666,4.284999847412109 22.875,4.034999847412109 C30.21500015258789,3.5250000953674316 37.69499969482422,4.144999980926514 44.8650016784668,2.444999933242798 C48.44499969482422,1.5950000286102295 55.025001525878906,-0.16500000655651093 57.904998779296875,-2.4549999237060547"
                            style={{
                              transition: 'stroke-dashoffset 3s ease-in-out'
                            }}
                          />
                        </g>
                      </g>
                    </svg>
                  </div>
                  
                  <span className="text-sm md:text-base lg:text-lg font-semibold tracking-wide text-black" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    이은솔
                  </span>
                </div>
              </div>

            

              {/* 중앙 이미지 */}
              <div className="flex-1 flex justify-center items-center mt-2 md:mt-4 px-6 md:px-8">
                <img
                  src="https://monsil.eungming.com/uploads/images/main_cover.jpg"
                  alt="Cover"
                  className="w-full h-full object-cover rounded-md"
                />
              </div>

              {/* 하단 정보 영역 */}
              <div className="mt-4 md:mt-6 px-6 md:px-8">
                {/* 날짜와 시간 */}
                <div className="text-center mb-2 md:mb-3">
                                  <p className="text-sm md:text-base lg:text-lg font-semibold tracking-wide text-gray-900" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                  2025. 11. 08. 1:00 PM
                </p>
                </div>

                {/* 장소 */}
                <div className="text-center mb-4 md:mb-6">
                  <p className="text-sm md:text-base lg:text-lg font-semibold tracking-wide text-gray-900" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
                    정동제일교회 본당
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 앞면 (윗부분 잘린 형태) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[90%] bg-[#34495E] rounded-md"
            style={{
              clipPath: 'polygon(0 20%, 50% 35%, 100% 20%, 100% 100%, 0 100%)',
              zIndex: 3
            }}
          >
            <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 text-white text-xs md:text-sm font-semibold tracking-wide" style={{ fontFamily: 'MaruBuri, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              당신을 초대합니다
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade {
          0% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade {
          animation: fade 0.3s ease-out;
        }
      `}</style>
    </main>
  )
}
