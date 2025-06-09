import type { Guestbook } from '@/types'

interface GuestbookSectionProps {
  guestbook: Guestbook[]
}

export default function GuestbookSection({ guestbook }: GuestbookSectionProps) {
  return (
    <section className="w-full py-12 md:py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-score text-center mb-6 md:mb-8">방명록</h2>
        <div className="space-y-4">
          {guestbook.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-700">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 