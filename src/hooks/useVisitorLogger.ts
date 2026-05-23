// src/hooks/useVisitorLogger.ts
import { useEffect } from 'react';
import { isMobile, browserName, osName } from 'react-device-detect';

export function useVisitorLogger() {
  useEffect(() => {
    const logVisitor = async () => {
      try {
        // 1. IP 및 위치 정보 가져오기
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        
        const ip = geoData.ip;
        const location = `${geoData.city}, ${geoData.country_name}`;
        const timestamp = new Date().toLocaleString('ko-KR');

        // 2. 기기 및 브라우저 정보 조합하기 (react-device-detect 활용)
        const deviceType = isMobile ? 'Mobile' : 'PC';
        const deviceInfo = `${deviceType} (${osName} / ${browserName})`;

        // 구글 폼 제출용 주소
        const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdv61aKukw3RZxzhZA6UMdeAeSzu7whjfhTyXmyWRB-bKzExg/formResponse';
        
        // 3. 데이터 매핑하기 (모든 고유 ID 세팅 완료)
        const formData = new FormData();
        formData.append('entry.1027969608', ip);         // 1. IP 칸
        formData.append('entry.555898826', timestamp);   // 2. TIME 칸
        formData.append('entry.1025902643', location);    // 3. LOCATION 칸
        formData.append('entry.919986649', deviceInfo);   // 4. DEVICE 칸

        // 구글 설문지 서버로 전송
        await fetch(GOOGLE_FORM_URL, {
          method: 'POST',
          mode: 'no-cors', 
          body: formData
        });
      } catch (error) {
      }
    };

    logVisitor();
  }, []);
}