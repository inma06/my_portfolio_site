# Screenshots

각 서브 폴더 이름은 `src/data/portfolio.ts` 의 프로젝트 `slug` 와 1:1 로 일치합니다.

```
public/screenshots/
├── ai-chat/         ← AI 캐릭터 채팅 서비스
├── saju/            ← 사주 서비스
├── sns-gratitude/   ← SNS 감사 일기
└── kids-shop/       ← 유아동복 쇼핑몰
```

## 추가하는 법

1. 이 폴더의 해당 슬러그 디렉터리에 이미지 파일을 넣는다. (예: `ai-chat/01.png`)
2. `src/data/portfolio.ts` 의 해당 프로젝트 `screenshots` 배열에 파일명을 적는다.
   ```ts
   { slug: "ai-chat", screenshots: ["01.png", "02.png", "03.png"], ... }
   ```
3. 빌드/HMR 시 자동으로 카드 상단에 우→좌 무한 슬라이드로 노출되고, 클릭하면 라이트박스로 크게 열린다.

## 권장 사양

- **JPG / PNG / WebP** 모두 가능. 작게 압축한 WebP 가 가장 가볍다.
- 카드 슬라이드는 **세로 128px (sm 이상 144px)** 로 자동 스케일 — 가로 폭은 원본 비율 유지.
- 라이트박스에서는 화면의 90vh / 90vw 안에서 원본 비율로 표시.
- 모바일 앱 캡쳐는 9:19 정도, 웹 캡쳐는 16:9 정도가 자연스럽다.
- 권장 파일 크기: 한 장 200KB 이하.
