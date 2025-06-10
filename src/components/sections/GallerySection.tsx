import Image from 'next/image'
import type { Gallery } from '@/types'

interface GallerySectionProps {
  gallery: Gallery[]
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  return (
    <section className="w-full h-screen flex flex-col justify-center px-0 font-sans bg-white">
      <div className="max-w-xl mx-auto text-center w-full px-8">
        {/* 제목 */}
        <h2 className="text-4xl font-light mb-16 tracking-wider text-gray-700 font-english english-text">
          GALLERY
        </h2>

        {/* 상단 가로선 */}
        <div className="w-full h-px bg-gray-200 mb-8"></div>

        {/* 갤러리 그리드 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {gallery.length > 0 ? (
            gallery.map((item) => (
              <div key={item.id} className="relative aspect-square">
                <Image
                  src={`/uploads/${item.filename}`}
                  alt="Gallery"
                  fill
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            // 기본 이미지 플레이스홀더
            [...Array(6)].map((_, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            ))
          )}
        </div>

        {/* 하단 가로선 */}
        <div className="w-full h-px bg-gray-200"></div>
      </div>
    </section>
  )
} 