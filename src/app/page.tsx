import { Metadata } from 'next'
import type { Gallery } from '@/types'
import HomePage from '@/components/HomePage'

// 동적 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  let imageUrl = 'https://monsil.eungming.com/images/cover-image.jpg'
  
  try {
    const response = await fetch('https://monsil.eungming.com/api/gallery', {
      cache: 'no-store'
    })
    const data = await response.json()
    
    if (data.success) {
      const mainImage = data.data.find((img: Gallery) => img.image_type === 'main')
      if (mainImage?.url) {
        imageUrl = mainImage.url.startsWith('http') 
          ? mainImage.url 
          : `https://monsil.eungming.com${mainImage.url}`
      }
    }
  } catch (error) {
    console.error('Error fetching main image for metadata:', error)
  }

  return {
    title: "We invite you to our wedding | 황민 ♥ 이은솔 결혼합니다",
    description: "2025년 11월 8일 오후 12시 30분, 정동제일교회에서 결혼식을 올립니다. We invite you to our wedding. 여러분의 축복으로 더 아름다운 날이 되길 바랍니다.",
    keywords: ["결혼식", "청첩장", "wedding", "invitation", "황민", "이은솔", "정동제일교회"],
    openGraph: {
      title: "황민 ♥ 이은솔 결혼합니다",
      description: "2025년 11월 8일 오후 12시 30분\n정동제일교회에서 결혼식을 올립니다.\nWe invite you to our wedding.\n여러분의 축복으로 더 아름다운 날이 되길 바랍니다.",
      url: "https://monsil.eungming.com",
      siteName: "황민 ♥ 이은솔 결혼식 청첩장",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "황민 ♥ 이은솔 결혼식 청첩장",
        },
      ],
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "황민 ♥ 이은솔 결혼합니다",
      description: "2025년 11월 8일 오후 12시 30분, 정동제일교회에서 결혼식을 올립니다. We invite you to our wedding.",
      images: [imageUrl],
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    other: {
      'og:image:width': '1200',
      'og:image:height': '630',
    }
  }
}

export default function Home() {
  return <HomePage />
}
