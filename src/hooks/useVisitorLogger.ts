// src/hooks/useVisitorLogger.ts
import { useEffect } from 'react';

export function useVisitorLogger() {
  useEffect(() => {
    const logVisitor = async () => {
      try {
        // 1. IP와 상세 위치 정보를 동시에 주는 무료 API 호출
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        
        // 데이터에서 필요한 알맹이 추출
        const ip = geoData.ip;                 // IP 주소
        const city = geoData.city;             // 도시 (예: Seoul, Wonju)
        const country = geoData.country_name;  // 국가 (예: South Korea)
        
        // "도시, 국가" 형태로 지역 문자열 합치기
        const location = `${city}, ${country}`;
        
        // 현재 날짜와 시간 구하기
        const timestamp = new Date().toLocaleString('ko-KR');

        // 구글 폼 제출용 주소
        const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdv61aKukw3RZxzhZA6UMdeAeSzu7whjfhTyXmyWRB-bKzExg/formResponse';
        
        // 데이터 매핑하기
        const formData = new FormData();
        formData.append('entry.1027969608', ip);        // IP 칸
        formData.append('entry.555898826', timestamp);  // TIME 칸
        formData.append('entry.1025902643', location);   // LOCATION 칸

        // 구글 설문지 서버로 전송
        await fetch(GOOGLE_FORM_URL, {
          method: 'POST',
          mode: 'no-cors', 
          body: formData
        });
      } catch (error) {
        console.error('방문 로그 전송 실패:', error);
      }
    };

    logVisitor();
  }, []);
}