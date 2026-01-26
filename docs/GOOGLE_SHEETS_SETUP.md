# Google Sheets 연동 설정 가이드

이 가이드는 MACOC 웹사이트를 Google Sheets와 연동하는 방법을 설명합니다.

## 1. Google Sheets 생성

### 1.1 새 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성
2. 이름을 `MACOC Data`로 지정

### 1.2 시트 구조
다음 시트들을 생성하세요:

#### Sheet: `Config`
설정 데이터 (Key-Value 형식)

| key | value |
|-----|-------|
| site.name | Musical Arts Competition of Orange County |
| site.shortName | MACOC |
| currentYear | 2026 |
| competition.date | Saturday, May 16, 2026 |
| competition.location | California State University, Long Beach |
| competition.registration.open | March 16, 2026 |
| competition.registration.close | April 16, 2026 |
| competition.registration.lateDeadline | April 23, 2026 |
| fees.membership.amount | 40 |
| fees.entry.amount | 50 |
| fees.lateFee.amount | 70 |
| contact.email | info@musicalartsoc.org |
| president.name | Marie Djang |

#### Sheet: `KeyDates`
주요 일정

| date | title | description | type | highlight |
|------|-------|-------------|------|-----------|
| March 16, 2026 | Registration Opens | Begin your registration process | deadline | true |
| April 16, 2026 | Regular Deadline | Last day for regular registration | deadline | true |
| April 23, 2026 | Late Deadline | Final deadline with late fee | deadline | false |
| May 16, 2026 | Competition Day | Main competition event | event | true |
| June 6, 2026 | Winners' Concert | Annual winners' performance | event | true |

#### Sheet: `Divisions`
경쟁 부문

| name | icon | description | sections | chairName | chairEmail |
|------|------|-------------|----------|-----------|------------|
| Classical Piano | 🎹 | Solo piano performance | Section 1-8 | Dr. Hyunjoo Choi | musicalartsoc@gmail.com |
| Voice | 🎤 | Classical and Musical Theater | Section 1-4 | Dr. SuJung Kim | sjsoprano1@gmail.com |
| Violin | 🎻 | Solo violin performance | Section 1-8 | Sorah Myung | strings@musicalartsoc.org |
| ... | ... | ... | ... | ... | ... |

#### Sheet: `FAQs`
자주 묻는 질문

| question | answer |
|----------|--------|
| Who can participate? | Students of MACOC member teachers... |
| How do I register? | Visit our registration page... |

#### Sheet: `History`
연혁

| year | title | description |
|------|-------|-------------|
| 1932 | Founded | Initially organized as Orange County Chapter... |
| 1940s | Competition Begins | Annual competition for piano, organ... |

#### Sheet: `Directory`
교사 명부

| year | category | name |
|------|----------|------|
| 2025 | Piano | Teacher Name 1 |
| 2025 | Piano | Teacher Name 2 |
| 2025 | Violin | Teacher Name 3 |

#### Sheet: `Winners`
수상자

| year | division | subsection | section | place | name | icon |
|------|----------|------------|---------|-------|------|------|
| 2025 | Piano | Classical Piano | Section 1 | 1st | Winner Name | 🎹 |
| 2025 | Piano | Classical Piano | Section 1 | 2nd | Runner Up | 🎹 |

### 1.3 시트 공개 설정
1. **파일** → **공유** → **웹에 게시**
2. **전체 문서** 선택
3. **CSV** 형식 선택
4. **게시** 클릭

## 2. GitHub 설정

### 2.1 Sheet ID 추가
1. Google Sheets URL에서 ID 복사:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
2. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret** 클릭
4. Name: `GOOGLE_SHEET_ID`
5. Value: 복사한 Sheet ID

### 2.2 Personal Access Token 생성 (Webhook용)
1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. **Generate new token**
3. Token name: `MACOC Sheets Webhook`
4. Repository access: `Only select repositories` → `macoc`
5. Permissions:
   - **Contents**: Read and write
   - **Metadata**: Read-only
6. **Generate token** 클릭
7. 토큰 복사해서 안전한 곳에 저장

## 3. Google Apps Script 설정

### 3.1 스크립트 추가
1. Google Sheets에서 **확장 프로그램** → **Apps Script**
2. 기존 코드를 삭제하고 아래 코드 붙여넣기:

```javascript
// GitHub 설정
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN'; // Personal Access Token
const GITHUB_OWNER = 'pillsoon';
const GITHUB_REPO = 'macoc';

// 변경 시 GitHub Action 트리거
function onEdit(e) {
  // 5초 대기 (연속 편집 무시)
  Utilities.sleep(5000);
  triggerDeploy();
}

// GitHub repository_dispatch 이벤트 발송
function triggerDeploy() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/dispatches`;

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      event_type: 'google-sheets-update',
      client_payload: {
        timestamp: new Date().toISOString()
      }
    }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const code = response.getResponseCode();

    if (code === 204) {
      Logger.log('✅ Deploy triggered successfully');
    } else {
      Logger.log('❌ Failed: ' + code + ' - ' + response.getContentText());
    }
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
  }
}

// 수동 테스트용
function testTrigger() {
  triggerDeploy();
}
```

### 3.2 토큰 설정
1. 코드에서 `YOUR_GITHUB_TOKEN`을 실제 토큰으로 교체
2. 저장 (Ctrl+S)

### 3.3 트리거 설정
1. Apps Script 왼쪽 메뉴에서 **트리거** (시계 아이콘)
2. **+ 트리거 추가**
3. 설정:
   - 실행할 함수: `onEdit`
   - 이벤트 소스: `스프레드시트에서`
   - 이벤트 유형: `편집 시`
4. **저장**

### 3.4 테스트
1. Apps Script에서 `testTrigger` 함수 실행
2. GitHub Actions 탭에서 워크플로우 실행 확인

## 4. 작동 확인

1. Google Sheets에서 데이터 수정
2. 2-3분 대기
3. https://pillsoon.github.io/macoc/ 에서 변경 확인

## 문제 해결

### 데이터가 업데이트되지 않을 때
1. GitHub Actions 탭에서 워크플로우 로그 확인
2. Google Sheets가 웹에 게시되어 있는지 확인
3. `GOOGLE_SHEET_ID` secret이 올바른지 확인

### Apps Script 오류
1. Apps Script 실행 로그 확인 (**보기** → **로그**)
2. GitHub 토큰이 유효한지 확인
3. 토큰 권한이 충분한지 확인

## 보안 참고사항

- GitHub Personal Access Token은 외부에 노출되지 않도록 주의
- Google Sheets는 공개 읽기만 허용, 편집 권한은 관리자만
- 정기적으로 토큰 갱신 권장
