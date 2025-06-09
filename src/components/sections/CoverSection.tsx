import Image from 'next/image'
import Link from 'next/link'

interface CoverSectionProps {
  dDay: number
}

export default function CoverSection({ dDay }: CoverSectionProps) {
  return (
    <section className="relative w-full h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <Image
          src="/images/cover.jpg"
          alt="Wedding Cover"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl md:text-4xl font-score mb-4 text-center">황민 ♥ 이은솔</h1>
        <p className="text-lg md:text-xl mb-2 text-center">2024. 11. 08</p>
        <p className="text-base md:text-lg mb-8 text-center">D-{dDay}</p>
        <Link
          href="#details"
          className="bg-primary hover:bg-highlight text-white px-6 py-2 md:px-8 md:py-3 rounded-full transition-colors"
        >
          청첩장 보기
        </Link>
      </div>
    </section>
  )
} 