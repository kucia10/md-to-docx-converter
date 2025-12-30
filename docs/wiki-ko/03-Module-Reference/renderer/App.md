# App

## 요약
- **책임**: 메인 앱 컴포넌트 (전체 UI 조립, 상태 관리, 이벤트 핸들링)
- **주요 사용자/호출자**: [`main.tsx`](../../../../../../src/renderer/main.tsx)
- **핵심 엔트리포인트**: [`App()`](../../../../../../src/renderer/App.tsx:19)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Main Component (Orchestration Layer)
- **상위/하위 의존**:
  - 의존: `components/`, `hooks/`, `context/`, `types/`, `window.electronAPI`
  - 사용: 없음 (애플리케이션 최상위 컴포넌트)
- **런타임 플로우에서의 역할**: 초기화 → 하위 컴포넌트 조립 → 사용자 액션 처리 → IPC 통신

## 퍼블릭 인터페이스

### 반환 값
```typescript
JSX.Element  // 전체 애플리케이션 UI
```

### AppWrapper
```typescript
function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}
```

## 내부 동작

### 주요 플로우
1. **커스텀 훅 초기화**:
   - [`useFileUpload()`](../../../../../../src/renderer/hooks/useFileUpload.ts): 파일 관리
   - [`useConversion()`](../../../../../../src/renderer/hooks/useConversion.ts): 단일 변환
   - [`useBatchConversion()`](../../../../../../src/renderer/hooks/useBatchConversion.ts): 배치 변환
   - [`useMergeConversion()`](../../../../../../src/renderer/hooks/useMergeConversion.ts): 병합 변환
   - [`usePreview(selectedFiles)`](../../../../../../src/renderer/hooks/usePreview.ts): 미리보기

2. **상태 초기화**:
   - `appVersion`: 앱 버전 (Main Process에서 가져옴)
   - `conversionOptions`: 변환 옵션 (폰트, 여백, 페이지 설정 등)

3. **앱 버전 가져오기**: [`useEffect`](../../../../../../src/renderer/App.tsx:161)
   - `window.electronAPI.getAppVersion()` 호출
   - 상태에 저장

4. **UI 구조**:
   - **헤더**: 타이틀, 버전, 언어/테마 토글
   - **메인 콘텐트**: 2개 패널 (좌/우)
     - **좌측 패널**: 파일 업로드, 변환 옵션, 변환 버튼, 진행률
     - **우측 패널**: 미리보기, 결과 표시

### 변환 핸들러

#### 단일 파일 변환: [`handleStartConversion()`](../../../../../../src/renderer/App.tsx:89)
1. 선택된 파일 확인
2. 기본 DOCX 파일명 생성 (`{basename}.docx`)
3. 저장 다이얼로그 표시
4. `startConversion(file.path, outputPath, options)` 호출

#### 배치 변환: [`handleStartBatchConversion()`](../../../../../../src/renderer/App.tsx:116)
1. 디렉터리 다이얼로그 표시
2. `startBatchConversion(inputFiles, outputDirectory, options)` 호출

#### 병합 변환: [`handleStartMergeConversion()`](../../../../../../src/renderer/App.tsx:137)
1. 기본 병합 파일명 생성 (`merged-files.docx`)
2. 저장 다이얼로그 표시
3. `startMergeConversion(inputFiles, outputPath, options)` 호출

### 핵심 규칙/알고리즘
- **상태 관리**: 커스텀 훅에 위임
- **조건부 렌더링**: 변환 상태에 따라 다른 UI 표시
- **파일 경로 처리**: Electron에서 제공하는 `path` 사용
- **취소 다이얼로그**: 취소 시 변환 중지

### 엣지케이스
- 선택된 파일 없음: 변환 버튼 비활성화
- 단일 파일: 배치/병합 버튼 숨김
- 변환 중: 모든 변환 버튼 비활성화
- 다이얼로그 취소: 변환 시작하지 않음

## 데이터/모델

### ConversionOptions 초기값
```typescript
{
  fontSize: 12,              // 폰트 크기 (pt)
  fontFamily: 'Arial',        // 폰트 패밀리
  lineHeight: 1.5,            // 줄 간격
  marginTop: 2.54,           // 상단 여백 (cm)
  marginBottom: 2.54,        // 하단 여백 (cm)
  marginLeft: 3.18,          // 좌측 여백 (cm)
  marginRight: 3.18,         // 우측 여백 (cm)
  orientation: 'portrait',    // 페이지 방향
  generateToc: true,          // 목차 생성
  referenceStyle: 'apa',      // 참고문헌 스타일
  imageHandling: 'embed',     // 이미지 처리
  codeBlockStyle: 'fenced'    // 코드 블록 스타일
}
```

### 변환 상태 관리
| 상태 | 변수 | 의미 |
|-------|-------|------|
| 단일 변환 중 | `isConverting` | `useConversion` |
| 배치 변환 중 | `isBatchConverting` | `useBatchConversion` |
| 병합 변환 중 | `isMergeConverting` | `useMergeConversion` |
| 변환 중인 파일 인덱스 | `selectedFileIndex` | 미리보기용 |

## 설정/환경변수
- 사용하지 않음

## 의존성

### 내부 모듈
- [`components/FileUpload`](../../../../../../src/renderer/components/FileUpload.tsx): 파일 업로드 UI
- [`components/MarkdownPreview`](../../../../../../src/renderer/components/MarkdownPreview.tsx): 미리보기
- [`components/ConversionOptions`](../../../../../../src/renderer/components/ConversionOptions.tsx): 옵션 설정
- [`components/ProgressBar`](../../../../../../src/renderer/components/ProgressBar.tsx): 진행률
- [`components/ResultDisplay`](../../../../../../src/renderer/components/ResultDisplay.tsx): 결과 표시
- [`components/ThemeToggle`](../../../../../../src/renderer/components/ThemeToggle.tsx): 테마 토글
- [`components/LanguageToggle`](../../../../../../src/renderer/components/LanguageToggle.tsx): 언어 토글
- [`hooks/useFileUpload`](../../../../../../src/renderer/hooks/useFileUpload.ts): 파일 관리
- [`hooks/useConversion`](../../../../../../src/renderer/hooks/useConversion.ts): 단일 변환
- [`hooks/useBatchConversion`](../../../../../../src/renderer/hooks/useBatchConversion.ts): 배치 변환
- [`hooks/useMergeConversion`](../../../../../../src/renderer/hooks/useMergeConversion.ts): 병합 변환
- [`hooks/usePreview`](../../../../../../src/renderer/hooks/usePreview.ts): 미리보기
- [`context/ThemeContext`](../../../../../../src/renderer/context/ThemeContext.tsx): 테마 컨텍스트
- [`types/index.ts`](../../../../../../src/renderer/types/index.ts): 타입 정의

### 외부 라이브러리/서비스
- React: `useState`, `useEffect`
- i18next: `useTranslation()`
- lucide-react: `FolderOpen`, `FileText`, `FileSymlink` (아이콘)
- Electron: `window.electronAPI` (IPC 통신)

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 통합 테스트 필요
- 테스트 시나리오:
  - 초기 렌더링
  - 파일 선택 후 UI 업데이트
  - 단일 변환 플로우
  - 배치 변환 플로우
  - 병합 변환 플로우
  - 변환 옵션 변경
  - 변환 취소
  - 다이얼로그 취소 시 동작

## 운영/관찰가능성

### 로그
- 변환 오류: `console.error('Conversion error:', error)`
- 배치 변환 오류: `console.error('Batch conversion error:', error)`
- 병합 변환 오류: `console.error('Merge conversion error:', error)`
- 앱 버전 가져오기 실패: `console.error('Failed to fetch app version:', error)`

### 메트릭/트레이싱
- 없음

### 알람 포인트
- `selectedFiles.length === 0`: 변환 버튼 비활성화
- `isConverting`: 변환 버튼 비활성화, 진행률 표시
- `batchResult.success`: 성공/실패 메시지

## UI 구조

### 전체 레이아웃
```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                 │
│  [타이틀 + 버전]        [언어] [테마]               │
├──────────────────────────────┬──────────────────────────────────┤
│  Left Panel (33%)         │  Right Panel (67%)          │
│  ┌──────────────────────┐  │  ┌─────────────────────────┐ │
│  │ FileUpload          │  │  │ MarkdownPreview       │ │
│  │ - 드래그앤드롭     │  │  │ - 단일/병합 모드    │ │
│  │ - 파일 목록         │  │  └─────────────────────────┘ │
│  └──────────────────────┘  │                            │
│  ┌──────────────────────┐  │  ┌─────────────────────────┐ │
│  │ ConversionOptions  │  │  │ ResultDisplay         │ │
│  │ - 폰트 설정        │  │  │ (변환 완료 시)      │ │
│  │ - 여백 설정        │  │  └─────────────────────────┘ │
│  │ - 페이지 설정       │  │                            │
│  └──────────────────────┘  │                            │
│  ┌──────────────────────┐  │                            │
│  │ 변환 버튼          │  │                            │
│  │ - 단일             │  │                            │
│  │ - 병합             │  │                            │
│  │ - 배치             │  │                            │
│  └──────────────────────┘  │                            │
│  ┌──────────────────────┐  │                            │
│  │ ProgressBar         │  │                            │
│  │ (변환 중일 때만)   │  │                            │
│  └──────────────────────┘  │                            │
└──────────────────────────────┴──────────────────────────────────┘
```

### Tailwind CSS 클래스 요약
- **컨테이너**: `flex flex-col h-screen bg-gray-50 dark:bg-gray-900`
- **헤더**: `bg-white dark:bg-gray-800 shadow-sm border-b`
- **좌측 패널**: `w-1/3 bg-white dark:bg-gray-800 border-r flex flex-col`
- **우측 패널**: `flex-1 overflow-hidden`
- **버튼**: `btn btn-primary` / `btn btn-secondary`

## IPC 채널 사용

### Request Channels
- `saveFileDialog`: 변환 파일 저장 경로 선택
- `openDirectoryDialog`: 배치 변환 출력 디렉터리 선택
- `getAppVersion`: 앱 버전 조회

### Event Channels
- 변환 이벤트는 각 `useConversion` 훅에서 처리

## 관련 컴포넌트/훅
- [`useFileUpload`](../hooks/useFileUpload.md): 파일 업로드 관리
- [`useConversion`](../hooks/useConversion.md): 단일 변환 관리
- [`useBatchConversion`](../hooks/useBatchConversion.md): 배치 변환 관리
- [`useMergeConversion`](../hooks/useMergeConversion.md): 병합 변환 관리
- [`usePreview`](../hooks/usePreview.md): 미리보기 관리

## 파일명 생성 규칙

### 단일 변환
```typescript
const baseName = file.name.replace(/\.[^/.]+$/, '')  // 확장자 제거
const defaultDocxName = `${baseName}.docx`
```

### 병합 변환
```typescript
const defaultDocxName = 'merged-files.docx'
```

## 변경 이력(선택)
- v1.0: 초기 구현