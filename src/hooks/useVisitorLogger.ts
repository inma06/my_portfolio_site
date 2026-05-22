import { useEffect } from 'react';

export function useVisitorLogger() {
  useEffect(() => {
    const logVisitor = async () => {
      try {
        // 1. 외부 무료 API로 방문자 IP 가져오기
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipRes.json();
        
        // 2. 현재 날짜와 시간 포맷팅
        const timestamp = new Date().toLocaleString('ko-KR');

        // 3. 위에서 가공한 구글 폼 제출용 주소
        const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdv61aKukw3RZxzhZA6UMdeAeSzu7whjfhTyXmyWRB-bKzExg/formResponse';
        
        // 4. 데이터 매핑하기
        const formData = new FormData();
        formData.append('entry.1027969608', ip);        // IP 칸에 대입
        formData.append('entry.555898826', timestamp);  // TIME 칸에 대입

        // 5. 구글 설문지 서버로 몰래 전송
        await fetch(GOOGLE_FORM_URL, {
          method: 'POST',
          mode: 'no-cors', 
          body: formData
        });

        console.log('방문 로그가 구글 시트에 기록되었습니다.');
      } catch (error) {
        console.error('방문 로그 전송 실패:', error);
      }
    };

    logVisitor();
  }, []);
}