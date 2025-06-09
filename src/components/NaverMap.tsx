'use client'
import { useEffect, useRef } from 'react'

// 네이버 지도 API 타입 정의
interface NaverMapOptions {
  center: NaverLatLng;
  zoom: number;
}

interface NaverLatLng {
  lat: number;
  lng: number;
}

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: HTMLElement, options: NaverMapOptions) => unknown;
        LatLng: new (lat: number, lng: number) => NaverLatLng;
      };
    };
  }
}

export default function NaverMap() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.naver && mapRef.current) {
      const naver = window.naver
      new naver.maps.Map(mapRef.current, {
        center: new naver.maps.LatLng(37.5012743, 127.039585), // 예시: 강남역
        zoom: 16,
      })
    }
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: 240, borderRadius: 0, overflow: 'hidden' }} />
} 