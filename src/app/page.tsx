import { Metadata } from 'next'
import type { Gallery } from '@/types'
import HomePage from '@/components/HomePage'

// 동적 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  let imageUrl = 'https://monsil.eungming.com/images/cover-image.jpg'
  
  try {
    // 캐시 무효화를 위한 타임스탬프 추가
    const timestamp = Date.now()
    
    // 서버 사이드에서는 내부 API 호출 사용 (SSL 인증서 문제 회피)
    const baseUrl = process.env.INTERNAL_API_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'http://localhost:1108'  // Docker 내부에서는 HTTP 사용
        : 'http://localhost:3000')  // 개발 환경
      
    const response = await fetch(`${baseUrl}/api/gallery?t=${timestamp}`, {
      cache: 'no-store',
      next: { revalidate: 0 } // ISR 캐시도 무효화
    })
    
    if (response.ok) {
      const data = await response.json()
      
      if (data.success) {
        const mainImage = data.data.find((img: Gallery) => img.image_type === 'main')
        if (mainImage?.url) {
          // URL이 상대 경로인 경우 절대 경로로 변환하고 타임스탬프 추가
          imageUrl = mainImage.url.startsWith('http') 
            ? `${mainImage.url}?t=${timestamp}`
            : `https://monsil.eungming.com${mainImage.url}?t=${timestamp}`
        }
      }
    }
  } catch (error) {
    console.error('Error fetching main image for metadata:', error)
    // SSL 오류가 발생해도 기본 이미지로 계속 진행
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
      'og:updated_time': new Date().toISOString(), // 메타데이터 갱신 시간
    }
  }
}

export default function Home() {
  return <HomePage />
}
