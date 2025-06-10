import Image from 'next/image'
import type { Gallery } from '@/types'

interface GallerySectionProps {
  gallery: Gallery[]
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  return (
    <section className="w-full py-0 md:py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-score text-center mb-6 md:mb-8">Gallery</h2>
        <div className="grid grid-cols-2 gap-4">
          {gallery.map((item) => (
            <div key={item.id} className="relative aspect-square">
              <Image
                src={`/uploads/${item.filename}`}
                alt="Gallery"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 