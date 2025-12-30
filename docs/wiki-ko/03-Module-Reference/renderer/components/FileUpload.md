# FileUpload Component

## 요약
- 책임: 파일 선택, 드래그 앤 드롭, 파일 순서 관리 UI 제공
- 주요 사용자/호출자: [`App.tsx`](../../../src/renderer/App.tsx:1)
- 핵심 엔트리포인트: [`FileUpload`](../../../src/renderer/components/FileUpload.tsx:22) 컴포넌트

## 아키텍처 내 위치
- 레이어: Renderer Layer (UI Component)
- 상위/하위 의존:
  - 상위: [`App.tsx`](../../../src/renderer/App.tsx:1)
  - 하위: [`useFileUpload`](../hooks/useFileUpload.md) 훅, [`window.electronAPI`](../../../src/preload/index.ts:4)
- 런타임 플로우에서의 역할: 사용자 파일 입력 UI와 파일 관리 기능

## 퍼블릭 인터페이스

### FileUploadProps
```typescript
interface FileUploadProps {
  selectedFiles: FileItem[]
  isDragging: boolean
  isCombinedPreview?: boolean
  onFileSelect: (files: FileList | null, paths?: string[]) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onRemoveFile: (fileId: string) => void
  onSelectFileForPreview?: (index: number) => void
  onMoveFileUp?: (fileId: string) => void
  onMoveFileDown?: (fileId: string) => void
  onReorderFiles?: (sourceIndex: number, destinationIndex: number) => void
}
```

#### selectedFiles
- 시그니처: `FileItem[]`
- 설명: 선택된 파일들의 배열

#### isDragging
- 시그니처: `boolean`
- 설명: 드래그 오버 상태

#### isCombinedPreview
- 시그니처: `boolean` (기본값: `false`)
- 설명: 결합 미리보기 모드 여부 (`true`인 경우 파일 추가 UI 숨김)

#### onFileSelect
- 시그니처: `(files: FileList | null, paths?: string[]) => void`
- 설명: 파일 선택 시 호출되는 콜백

#### onDragOver
- 시그니처: `(e: React.DragEvent) => void`
- 설명: 드래그 오버 시 호출되는 콜백

#### onDragLeave
- 시그니처: `(e: React.DragEvent) => void`
- 설명: 드래그 리브 시 호출되는 콜백

#### onDrop
- 시그니처: `(e: React.DragEvent) => void`
- 설명: 드롭 시 호출되는 콜백

#### onRemoveFile
- 시그니처: `(fileId: string) => void`
- 설명: 파일 제거 시 호출되는 콜백

#### onSelectFileForPreview
- 시그니처: `(index: number) => void`
- 설명: 미리보기용 파일 선택 시 호출되는 콜백 (선택사항)

#### onMoveFileUp
- 시그니처: `(fileId: string) => void`
- 설명: 파일 위로 이동 시 호출되는 콜백 (선택사항)

#### onMoveFileDown
- 시그니처: `(fileId: string) => void`
- 설명: 파일 아래로 이동 시 호출되는 콜백 (선택사항)

#### onReorderFiles
- 시그니처: `(sourceIndex: number, destinationIndex: number) => void`
- 설명: 파일 순서 재배치 시 호출되는 콜백 (선택사항)

## 내부 동작

### 주요 플로우
1. **파일 다이얼로그 열기**: `handleOpenFileDialog()` → `electronAPI.openFileDialog()` 호출
2. **파일 읽기**: `electronAPI.readFile()`로 각 파일 내용 읽기
3. **FileList 구성**: [`DataTransfer`](../../../src/renderer/components/FileUpload.tsx:61) API로 [`FileList`](../../../src/renderer/components/FileUpload.tsx:71) 구조 생성
4. **파일 목록 표시**: `DragDropContext`로 드래그 앤 드롭 가능한 리스트 표시
5. **파일 순서 변경**: `handleDragEnd()` → `onReorderFiles()` 호출

### 핵심 규칙/알고리즘
- **파일 크기 포맷**: `formatFileSize()`로 Bytes → KB/MB/GB 변환
- **날짜 포맷**: `formatDate()`로 `toLocaleDateString('ko-KR')`로 한국어 형식 변환
- **드래그 앤 드롭**: [`@hello-pangea/dnd`](../../../src/renderer/components/FileUpload.tsx:4) 라이브러리 사용
- **Electron 파일 다이얼로그**: `isCombinedPreview`가 `true`일 경우 버튼 숨김

### 엣지케이스
- **electronAPI 미존재**: `window.electronAPI` 체크로 방어 (라인 44)
- **다이얼로그 취소**: `result.canceled` 체크로 취소 처리 (라인 49)
- **빈 파일 선택**: `result.filePaths.length === 0` 체크로 방어

## 데이터/모델
- 모델/DTO: `FileItem`, `FileReadResult` ([`types/index.ts`](../../../src/renderer/types/index.ts:1))
- 스키마/테이블: 없음
- 직렬화 포맷: 없음 (메모리 상태만 관리)

## 설정/환경변수
- 없음

## 의존성
- 내부 모듈: 
  - [`src/renderer/types/index.ts`](../../../src/renderer/types/index.ts:1) (`FileItem`, `FileReadResult` 타입)
  - [`src/preload/index.ts`](../../../src/preload/index.ts:1) (`electronAPI`)
- 외부 라이브러리/서비스: 
  - React
  - `react-i18next`
  - `@hello-pangea/dnd` (Drag & Drop)
  - `lucide-react` (아이콘)

## 테스트
- 관련 테스트: 불명 (추가 확인 필요)
- 커버리지/갑: 드래그 앤 드롭, 파일 다이얼로그 통합 테스트 부재

## 운영/관찰가능성
- 로그: 
  - `console.log('[FileUpload] File dialog button clicked')`
  - `console.log('[FileUpload] electronAPI is available, invoking openFileDialog')`
  - `console.log('[FileUpload] Dialog result:', result)`
  - `console.error('[FileUpload] electronAPI is not available')`
  - `console.error('[FileUpload] Error opening file dialog:', error)`
- 메트릭/트레이싱: 없음
- 알람 포인트: 없음

## 관련 문서
- [useFileUpload Hook](../hooks/useFileUpload.md)
- [Preload Module](../../preload/index.md)