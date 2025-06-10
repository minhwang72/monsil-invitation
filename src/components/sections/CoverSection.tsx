'use client'

import { useState, useEffect } from 'react'

export default function CoverSection() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [showSvg, setShowSvg] = useState(false)

  useEffect(() => {
    // 커버 이미지 API 호출
    const fetchCoverImage = async () => {
      try {
        const response = await fetch('/api/cover-image')
        const data = await response.json()
        
        if (data.success && data.data?.url) {
          setImageUrl(data.data.url)
        }
      } catch (error) {
        console.error('Error fetching cover image:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoverImage()

    // SVG 애니메이션 시작 (자연스럽게)
    const timer = requestAnimationFrame(() => {
      setShowSvg(true)
    })

    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <section className="w-full min-h-screen flex flex-col justify-center py-8 md:py-12 px-6 md:px-10 font-sans">
      <div className="flex flex-col my-auto" style={{minHeight: '70vh'}}>
        {/* 이름 좌우 정렬 */}
        <div className="flex justify-center mb-4 md:mb-4">
          <div className="w-full max-w-sm flex justify-between items-center">
            <h1 className="text-base md:text-lg font-sans font-normal text-gray-900">황민</h1>
            
            {/* 장식 SVG */}
            <div className="w-32 md:w-36 h-auto">
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
                        strokeDasharray: 800,
                        strokeDashoffset: showSvg ? 0 : 800,
                        transition: 'stroke-dashoffset 4s ease-out'
                      }}
                    />
                  </g>
                </g>
              </svg>
            </div>
            
            <h1 className="text-base md:text-lg font-sans font-normal text-gray-900">이은솔</h1>
          </div>
        </div>

        {/* 사진 영역 (더 세로로 늘림) */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="w-full max-w-sm aspect-[3/4]">
            <div className="relative w-full h-full rounded-2xl shadow-lg overflow-hidden">
              {isLoading ? (
                <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              ) : imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Wedding Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 날짜와 시간 */}
        <div className="text-center mb-3 md:mb-4">
          <p className="text-base md:text-lg font-sans font-normal text-gray-900">
            2025. 11. 08. 12:30 PM
          </p>
        </div>

        {/* 장소 */}
        <div className="text-center">
          <p className="text-base md:text-lg font-sans font-normal text-gray-900">
            정동제일교회 본당
          </p>
        </div>
      </div>
    </section>
  )
} 