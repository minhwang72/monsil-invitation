'use client'

export default function BlessingSection() {
  return (
    <section className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-gray-50/50">
      <div className="max-w-xl mx-auto text-center w-full px-8">
        {/* 메시지 내용 */}
        <div className="space-y-6 mb-8">
          {/* 첫 번째 문단 */}
          <div className="space-y-4">
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              하나님께서 인도하신 만남 속에서
            </p>
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              서로의 존재에 감사하며
            </p>
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              가장 진실한 사랑으로 하나 되고자 합니다.
            </p>
          </div>

          {/* 두 번째 문단 */}
          <div className="space-y-4">
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              따스한 축복 아래, 새로운 시작을 앞두고
            </p>
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              저희 두 사람이 주님 안에서
            </p>
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              사랑과 믿음으로 가정을 이루려 합니다.
            </p>
          </div>

          {/* 세 번째 문단 */}
          <div className="space-y-4">
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              소중한 분들을 모시고
            </p>
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              그 첫걸음을 함께 나누고 싶습니다.
            </p>
            <p className="text-base font-normal text-gray-600 leading-relaxed">
              축복으로 함께해 주시면 감사하겠습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 