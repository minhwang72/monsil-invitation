import type { Viewport } from "next";
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import "./globals.css";

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: '황민 ♥ 이은솔 결혼식에 초대합니다',
  description: '2025년 11월 8일, 정동제일교회 본당에서 열리는 황민 ♥ 이은솔의 결혼식에 초대합니다.',
  keywords: ["결혼식", "청첩장", "wedding", "invitation", "황민", "이은솔", "정동제일교회"],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="icon"
          href="/favicon.svg"
          type="image/svg+xml"
        />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <style>
          {`
            @font-face {
              font-family: 'S-CoreDream-3Light';
              src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/S-CoreDream-3Light.woff') format('woff');
              font-weight: 300;
              font-style: normal;
            }
          `}
        </style>
        <meta property="og:updated_time" content={new Date().toISOString()} />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        <script
          type="text/javascript"
          src="https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=7if040vbw7"
          defer
        />
        <script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          defer
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
