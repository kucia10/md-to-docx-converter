# main.tsx

## 요약
- **책임**: Renderer 프로세스 진입점, React 앱 마운트
- **주요 사용자/호출자**: 없음 (브라우저에서 직접 로드)
- **핵심 엔트리포인트**: [`ReactDOM.createRoot()`](../../../../../../src/renderer/main.tsx:7)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Entry Point
- **상위/하위 의존**:
  - 의존: `App`, `styles/index.css`, `i18n`
  - 사용: 없음 (애플리케이션 진입점)
- **런타임 플로우에서의 역할**: 모듈 로드 → React 루트 생성 → App 컴포넌트 마운트

## 퍼블릭 인터페이스

### 내보내기
```typescript
// 직접 내보내기 없음
```

## 내부 동작

### 주요 플로우
1. **임포트**: 필요한 모듈 로드
   - `React`: React 라이브러리
   - `ReactDOM`: React DOM 렌더러
   - `App`: 메인 앱 컴포넌트
   - `styles/index.css`: 글로벌 스타일
   - `i18n`: 다국어 설정

2. **React 루트 생성**: [`ReactDOM.createRoot()`](../../../../../../src/renderer/main.tsx:7)
   - `document.getElementById('root')`로 루트 DOM 요소 찾기
   - `createRoot()`로 렌더러 생성 (React 18+)

3. **앱 마운트**: `render()`
   - `<React.StrictMode>`로 감싼 App 컴포넌트 렌더링
   - 개발 모드에서 추가 검사 활성화

### 핵심 규칙/알고리즘
- **React.StrictMode**: 개발 시 추가 검사 (더블 렌더링, 라이프사이클 경고)
- **루트 요소**: HTML 파일에 `<div id="root"></div>`가 있어야 함
- **i18n 초기화**: `import './i18n'`으로 자동 초기화

### 엣지케이스
- 루트 요소 없음: 브라우저 콘솔 에러
- i18n 초기화 실패: 앱이 로드되지 않음

## 데이터/모델
- 사용하지 않음 (진입점 역할)

## 설정/환경변수
- 사용하지 않음

## 의존성

### 내부 모듈
- [`App.tsx`](../../../../../../src/renderer/App.tsx): 메인 앱 컴포넌트
- [`styles/index.css`](../../../../../../src/renderer/styles/index.css): 글로벌 스타일
- [`i18n.ts`](../../../../../../src/renderer/i18n.ts): 다국어 설정

### 외부 라이브러리/서비스
- React: `React`
- ReactDOM: `createRoot`, `render`
- Web API: `document.getElementById()`

## 테스트
- 관련 테스트: `vitest` 단위 테스트
- 커버리지/갭: 엔트리포인트라 테스트 불필요

## 운영/관찰가능성

### 로그
- 없음

### 메트릭/트레이싱
- 없음

### 알람 포인트
- 없음

## HTML 구조

### index.html
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD to DOCX Converter</title>
</head>
<body>
  <div id="root"></div>
  <script src="./main.tsx"></script>
</body>
</html>
```

## React StrictMode

### 기능
- 개발 시 더블 렌더링으로 사이드 이펙트 감지
- 라이프사이클 메서드 안전하지 않은 사용 경고
- 권장되지 않는 API 사용 경고
- 리액트 18+에서의 새로운 동작 테스트

### 프로덕션
- 프로덕션 빌드에서는 StrictMode가 비활성화
- 성능 영향 없음

## 관련 파일
- `index.html`: HTML 템플릿
- [`App.tsx`](./App.tsx): 메인 앱 컴포넌트
- [`vite.config.ts`](../../../../../vite.config.ts): Vite 설정

## 빌드 과정

### 개발 모드
```bash
npm run dev:renderer
# → Vite dev server: http://localhost:3000
# → HMR(Hot Module Replacement) 지원
```

### 프로덕션 빌드
```bash
npm run build:renderer
# → dist/renderer/index.html 생성
# → dist/renderer/assets/에 번들 파일 생성
```

## 변경 이력(선택)
- v1.0: 초기 구현 (React 18+ createRoot API)