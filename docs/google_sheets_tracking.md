# Google Sheets 구매 의사 추적 설정

## 목적

전문가 모드 구매 버튼 클릭, 결제 시뮬레이션 완료, 상담 신청 클릭을 Google Sheet에 기록한다.

## 구조

```text
React
→ /.netlify/functions/track-prd-event
→ Google Apps Script Web App
→ Google Sheet
```

프론트에서 Google Apps Script URL을 직접 호출하지 않는다. URL은 `GOOGLE_SHEETS_WEBHOOK_URL` 환경변수에만 저장한다.

## Apps Script 예시

Google Sheet에서 `확장 프로그램 > Apps Script`를 열고 아래 코드를 넣는다.

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("events")
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet("events");

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "receivedAt",
      "eventName",
      "occurredAt",
      "path",
      "referrer",
      "userAgent",
      "ip",
      "country",
      "payload",
    ]);
  }

  const body = JSON.parse(e.postData.contents || "{}");
  const payload = body.payload || {};

  sheet.appendRow([
    new Date().toISOString(),
    body.eventName || "",
    payload.occurredAt || "",
    payload.path || "",
    payload.referrer || "",
    payload.userAgent || "",
    body.ip || "",
    body.country || "",
    JSON.stringify(payload),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 배포

1. Apps Script에서 `배포 > 새 배포`를 누른다.
2. 유형은 `웹 앱`을 선택한다.
3. 실행 권한은 본인 계정으로 설정한다.
4. 액세스 권한은 MVP 테스트 단계에서는 `모든 사용자`로 둔다.
5. 배포 후 Web App URL을 복사한다.
6. Netlify 환경변수에 `GOOGLE_SHEETS_WEBHOOK_URL`로 저장한다.

로컬에서는 `.env.local`에 다음처럼 추가한다.

```text
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/xxxx/exec
```

## 기록 이벤트

- `fake_checkout_started`: 전문가 모드 결제하기 클릭
- `fake_checkout_completed`: 결제 시뮬레이션 완료
- `consultation_requested`: 상담 신청 클릭

