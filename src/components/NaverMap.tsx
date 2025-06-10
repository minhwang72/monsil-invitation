'use client'
import { useEffect, useRef, useState } from 'react'

// 네이버 지도 API 타입 정의
interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
}

interface NaverLatLng {
  lat: number;
  lng: number;
}

interface NaverMap {
  setCenter: (center: NaverLatLng) => void;
  setZoom: (zoom: number) => void;
}

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: NaverMapOptions) => NaverMap;
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Marker: new (options: { position: NaverLatLng; map: NaverMap }) => unknown;
      };
    };
  }
}

export default function NaverMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const initMap = () => {
      try {
        if (typeof window !== 'undefined' && window.naver && mapRef.current) {
          const naver = window.naver
          const chungdongPosition = new naver.maps.LatLng(37.56550, 126.97240) // 정동제일교회 좌표
          
          const map = new naver.maps.Map(mapRef.current, {
            center: chungdongPosition,
            zoom: 17, // 청첩장용 적절한 줌 레벨
          })

          // 정동제일교회 마커 추가
          new naver.maps.Marker({
            position: chungdongPosition,
            map: map
          })
          
          setIsLoading(false)
        } else {
          // 네이버 지도가 로드되지 않은 경우 재시도
          setTimeout(initMap, 1000)
        }
      } catch (error) {
        console.error('네이버 지도 로드 오류:', error)
        setHasError(true)
        setIsLoading(false)
      }
    }

    // 지도 초기화 시작
    const timer = setTimeout(initMap, 100)
    
    return () => clearTimeout(timer)
  }, [])

  if (hasError) {
    return (
      <div style={{ width: '100%', height: 280, borderRadius: 0, overflow: 'hidden' }} className="bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">지도를 불러올 수 없습니다</p>
          <p className="text-xs mt-1">정동제일교회</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 280, borderRadius: 0, overflow: 'hidden' }} className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-300 mx-auto mb-2"></div>
            <p className="text-sm">지도 로딩 중...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
} 