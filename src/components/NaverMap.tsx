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
        Map: new (element: HTMLElement, options: NaverMapOptions) => any;
        LatLng: new (lat: number, lng: number) => NaverLatLng;
        Marker: new (options: { position: NaverLatLng; map: any }) => any;
      };
    };
  }
}

export default function NaverMap() {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
    }
  }, [])

  return <div ref={mapRef} style={{ width: '100%', height: 280, borderRadius: 0, overflow: 'hidden' }} />
} 