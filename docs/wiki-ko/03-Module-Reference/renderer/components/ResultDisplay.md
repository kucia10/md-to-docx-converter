# ResultDisplay

## 요약
- **책임**: 변환 결과 표시 모달 컴포넌트 (성공/실패 메시지, 파일 다운로드, 에러 목록)
- **주요 사용자/호출자**: [`App.tsx`](../../../../../../src/renderer/App.tsx), 변환 훅들
- **핵심 엔트리포인트**: [`ResultDisplay`](../../../../../../src/renderer/components/ResultDisplay.tsx:11)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Presentation Layer (UI Components)
- **상위/하위 의존**:
  - 의존: `types` ([`ConversionResult`](../../../../../../src/renderer/types/index.ts)), `window.electronAPI`
  - 사용: 변환 완료 후 결과 표시
- **런타임 플로우에서의 역할**: 변환 완료 → 결과 모달 표시 → 사용자 액션 (다운로드/폴더 열기/닫기)

## 퍼블릭 인터페이스

### Props
```typescript
interface ResultDisplayProps {
  result: ConversionResult   // 변환 결과 데이터
  onClose: () => void       // 모달 닫기 핸들러
}
```

### ConversionResult 타입
```typescript
{
  success: boolean,           // 성공 여부
  message: string,            // 결과 메시지
  outputPath?: string,        // 출력 파일 경로 (성공 시)
  processedFiles?: string[],   // 처리된 파일 목록 (배치 변환 시)
  errors?: string[]           // 오류 메시지 목록 (실패 시)
}
```

## 내부 동작

### 주요 플로우
1. **모달 렌더링**: 고정 배경 + 중앙 정렬 모달
   - 배경: `bg-black bg-opacity-50`
   - 모달: `bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md`

2. **헤더**: 타이틀 + 닫기 버튼
   - 성공: 녹색 아이콘 (`CheckCircle`)
   - 실패: 빨간색 아이콘 (`AlertCircle`)

3. **성공 상세 정보** (`success = true`):
   - 처리된 파일 목록 (`processedFiles` 배열)
   - 출력 파일 정보 (`outputPath`)
   - **폴더 열기 버튼**: [`handleOpenOutputFolder()`](../../../../../../src/renderer/components/ResultDisplay.tsx:15)
     - 현재 구현: 파일 다이얼로그 표시 (추후 개선 필요)
   - **다운로드 버튼**: [`handleDownloadFile()`](../../../../../../src/renderer/components/ResultDisplay.tsx:30)
     - `<a>` 태그 생성 후 클릭 트리거
     - `href="file://..."` + `download` 속성

4. **실패 상세 정보** (`success = false`):
   - 오류 목록 (`errors` 배열)
   - 빨간색 배경 + 에러 메시지

5. **푸터**: 닫기 버튼

### 핵심 규칙/알고리즘
- **배경 클릭**: 닫기 버튼만 제공 (배경 클릭 시 닫기 없음)
- **다운로드 구현**: Electron에서는 `file://` 프로토콜 사용
- **폴더 열기**: 현재는 파일 다이얼로그만 표시 (실제 폴더 열기는 추가 구현 필요)

### 엣지케이스
- `outputPath` 비어있음: 다운로드/폴더 열기 버튼 숨김
- `processedFiles` 빈 배열: 처리된 파일 목록 섹션 숨김
- `errors` 빈 배열: 에러 상세 섹션 숨김

## 데이터/모델

### 결과 상태 비교
| 상태 | 아이콘 | 색상 | 표시 섹션 |
|------|--------|------|-----------|
| 성공 | `CheckCircle` | 녹색 | 메시지, 처리된 파일, 출력 파일 버튼 |
| 실패 | `AlertCircle` | 빨간색 | 메시지, 오류 목록 |

### 버튼 액션
| 버튼 | 아이콘 | 액션 |
|------|--------|------|
| 폴더 열기 | `FolderOpen` | [`handleOpenOutputFolder()`](../../../../../../src/renderer/components/ResultDisplay.tsx:15) |
| 다운로드 | `Download` | [`handleDownloadFile()`](../../../../../../src/renderer/components/ResultDisplay.tsx:30) |
| 닫기 | `X` / 닫기 | `onClose()` |

## 설정/환경변수
- 사용하지 않음 (props로만 전달)

## 의존성

### 내부 모듈
- [`types/index.ts`](../../../../../../src/renderer/types/index.ts): `ConversionResult`

### 외부 라이브러리/서비스
- React: `React.FC`
- i18next: `useTranslation()`
- lucide-react: `CheckCircle`, `AlertCircle`, `Download`, `X`, `FolderOpen`
- Electron: `window.electronAPI.saveFileDialog()` (폴더 열기)

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 컴포넌트 테스트 필요
- 테스트 시나리오:
  - 성공 상태 렌더링
  - 실패 상태 렌더링
  - 처리된 파일 목록 표시
  - 오류 목록 표시
  - 다운로드 버튼 클릭
  - 폴더 열기 버튼 클릭
  - 닫기 버튼 클릭
  - 빈 `outputPath` 처리

## 운영/관찰가능성

### 로그
- 폴더 열기 오류: `console.error('Error opening output folder:', error)`

### 메트릭/트레이싱
- 없음

### 알람 포인트
- `success = false`: 빨간색 배경 + 경고 메시지
- `success = true`: 녹색 아이콘 + 성공 메시지

## 개선 필요 사항

### 폴더 열기 기능
현재 구현 ([`handleOpenOutputFolder()`](../../../../../../src/renderer/components/ResultDisplay.tsx:15)):
```typescript
const result = await window.electronAPI.saveFileDialog()
console.log('Output folder would be opened:', result.filePath)
```

**추후 개선 사항**:
- `shell.openPath()` 사용하여 파일 탐색기에서 폴더 열기
- 파일의 상위 디렉터리 경로 추출 필요

### 다운로드 제한사항
Electron 환경에서의 다운로드:
- `file://` 프로토콜은 보안 제한이 있을 수 있음
- 대안: `electron.shell.openPath()`로 파일 직접 열기

## 스타일링 (Tailwind CSS)

### 모달 구조
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
    {/* Header, Content, Footer */}
  </div>
</div>
```

### 섹션 스타일
- **헤더**: `p-6 border-b`
- **컨텐트**: `p-6`
- **푸터**: `p-6 border-t bg-gray-50`
- **박스**: `rounded-lg p-4 bg-gray-50 / blue-50 / red-50`

### 버튼 스타일
- 닫기: `p-2 hover:bg-gray-100 rounded-md`
- 액션: `btn btn-primary` / `btn btn-secondary`

## 관련 컴포넌트
- [`ProgressBar`](./ProgressBar.md): 진행 중 UI
- [`FileUpload`](./FileUpload.md): 파일 선택 UI

## IPC 채널 연동
- `saveFileDialog`: 폴더 열기용 (현재 미사용)
- 추가 필요: `openInFolder` (파일 위치 열기)

## 변경 이력(선택)
- v1.0: 초기 구현