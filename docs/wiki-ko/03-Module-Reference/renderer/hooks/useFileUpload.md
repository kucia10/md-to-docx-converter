# useFileUpload

## 요약
- **책임**: 파일 업로드 관리 (드래그앤드롭, 파일 선택기, 파일 순서 조정)
- **주요 사용자/호출자**: [`FileUpload.tsx`](../../../../../../src/renderer/components/FileUpload.tsx), [`App.tsx`](../../../../../../src/renderer/App.tsx)
- **핵심 엔트리포인트**: [`useFileUpload()`](../../../../../../src/renderer/hooks/useFileUpload.ts:4)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Custom Hooks (UI Interaction Layer)
- **상위/하위 의존**:
  - 의존: `types` ([`FileItem`](../../../../../../src/renderer/types/index.ts))
  - 사용: `FileUpload` 컴포넌트, 드래그앤드롭 라이브러리
- **런타임 플로우에서의 역할**: 파일 드래그/선택 → 읽기 → `FileItem` 배열 생성 → 순서 조정

## 퍼블릭 인터페이스

### 반환 값
```typescript
{
  selectedFiles: FileItem[],       // 선택된 파일 목록
  isDragging: boolean,              // 드래그 중 여부
  handleFileSelect: (files: FileList | null, paths?: string[]) => Promise<void>,
  handleDragOver: (e: React.DragEvent) => void,
  handleDragLeave: (e: React.DragEvent) => void,
  handleDrop: (e: React.DragEvent) => Promise<void>,
  removeFile: (fileId: string) => void,
  moveFileUp: (fileId: string) => void,
  moveFileDown: (fileId: string) => void,
  reorderFiles: (sourceIndex: number, destinationIndex: number) => void,
  clearFiles: () => void
}
```

### handleFileSelect
- **시그니처**: `handleFileSelect(files, paths?) → Promise<void>`
- **입력**:
  - `files`: `FileList` (HTML5 File API)
  - `paths`: (선택적) 파일 경로 배열 (Electron 파일 다이얼로그에서 제공)
- **출력**: 없음 (내부 상태 업데이트)
- **에러/예외**: 파일 읽기 실패 시 `console.error()` 출력 (개별 파일 오류는 건너뜀)
- **부작용**: `selectedFiles`에 새 파일 추가
- **예시**:
```typescript
// 파일 선택기 사용
const { filePaths } = await window.electronAPI.openFileDialog()
await handleFileSelect(selectedFiles, filePaths)

// 드래그앤드롭 사용 (paths 없음)
await handleFileSelect(e.dataTransfer.files)
```

### handleDragOver
- **시그니처**: `handleDragOver(e) → void`
- **입력**: `React.DragEvent`
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: `isDragging`을 true로 설정

### handleDragLeave
- **시그니처**: `handleDragLeave(e) → void`
- **입력**: `React.DragEvent`
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: `isDragging`을 false로 설정

### handleDrop
- **시그니처**: `handleDrop(e) → Promise<void>`
- **입력**: `React.DragEvent`
- **출력**: 없음
- **에러/예외**: 파일 읽기 실패 시 `console.error()` 출력
- **부작용**: `handleFileSelect()` 호출, `isDragging`을 false로 설정

### removeFile
- **시그니처**: `removeFile(fileId) → void`
- **입력**: `fileId`: 제거할 파일의 고유 ID
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: `selectedFiles`에서 해당 파일 제거

### moveFileUp
- **시그니처**: `moveFileUp(fileId) → void`
- **입력**: `fileId`: 위로 이동할 파일의 ID
- **출력**: 없음
- **에러/예외**: 첫 번째 파일에 대해 실행 시 무시됨
- **부작용**: 파일 배열에서 해당 파일을 한 칸 위로 이동

### moveFileDown
- **시그니처**: `moveFileDown(fileId) → void`
- **입력**: `fileId`: 아래로 이동할 파일의 ID
- **출력**: 없음
- **에러/예외**: 마지막 파일에 대해 실행 시 무시됨
- **부작용**: 파일 배열에서 해당 파일을 한 칸 아래로 이동

### reorderFiles
- **시그니처**: `reorderFiles(sourceIndex, destinationIndex) → void`
- **입력**:
  - `sourceIndex`: 원래 위치 인덱스
  - `destinationIndex`: 새 위치 인덱스
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: 파일 배열에서 원소 위치 변경

### clearFiles
- **시그니처**: `clearFiles() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: `selectedFiles`를 빈 배열로 초기화

## 내부 동작

### 주요 플로우
1. **파일 읽기**: [`readFileContent()`](../../../../../../src/renderer/hooks/useFileUpload.ts:8)
   - `FileReader` API 사용
   - UTF-8 인코딩으로 텍스트 읽기
   - Promise 기반 비동기 처리

2. **FileItem 생성**: [`createFileItem()`](../../../../../../src/renderer/hooks/useFileUpload.ts:23)
   - 고유 ID 생성: `Math.random().toString(36).substr(2, 9)`
   - 파일 메타데이터 저장: 이름, 크기, 수정일, 경로, 내용

3. **파일 선택 처리**: [`handleFileSelect()`](../../../../../../src/renderer/hooks/useFileUpload.ts:35)
   - `FileList` 순회하며 각 파일 읽기
   - 읽기 실패 시 해당 파일만 건너뜀
   - `setSelectedFiles(prev => [...prev, ...newFiles])`로 추가

4. **드래그앤드롭**:
   - `handleDragOver()`: `e.preventDefault()` 호출로 드롭 허용, `isDragging: true`
   - `handleDrop()`: 파일 추출 후 `handleFileSelect()` 호출, `isDragging: false`

5. **파일 순서 조정**:
   - `moveFileUp()`: 인덱스 찾기 → 이전 요소와 swap (인덱스 > 0)
   - `moveFileDown()`: 인덱스 찾기 → 다음 요소와 swap (인덱스 < length-1)
   - `reorderFiles()`: `splice()`로 원소 추출 후 새 위치에 삽입

### 핵심 규칙/알고리즘
- ID 생성: 랜덤 문자열로 충돌 방지 (단일 세션 내에서만 유지)
- 파일 순서: 병합 변환 시 중요 (파일 순서대로 병합)
- 에러 처리: 개별 파일 읽기 실패 시 전체 실패가 아닌 건너뜀

### 엣지케이스
- 중복 파일 추가: 허용됨 (같은 파일 여러 번 선택 가능)
- 대용량 파일: 전체 읽기가 완료될 때까지 UI 응답 없을 수 있음
- 비-Markdown 파일: 확장자 검사 없음, 사용자가 선택하는 파일 모두 허용
- 경로 없는 드롭: `path`로 `file.name` 사용

## 데이터/모델

### FileItem
```typescript
{
  id: string,              // 고유 식별자
  name: string,            // 파일명
  path: string,            // 파일 경로 (Electron에서 제공)
  size: number,            // 파일 크기 (bytes)
  lastModified: number,    // 마지막 수정 시간 (timestamp)
  content: string          // 파일 내용 (UTF-8 텍스트)
}
```

### Drag State
```typescript
{
  isDragging: boolean       // 드래그 중 여부 (UI 스타일링용)
}
```

## 설정/환경변수
- 사용하지 않음 (런타임에만 동작)

## 의존성

### 내부 모듈
- [`types/index.ts`](../../../../../../src/renderer/types/index.ts): `FileItem`

### 외부 라이브러리/서비스
- React: `useState`, `useCallback`
- HTML5 File API: `FileReader`, `FileList`
- 외부 라이브러리: 없음 (순수 React 훅)

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 훅 단위 테스트 필요
- 테스트 시나리오:
  - 파일 드래그앤드롭
  - 파일 선택기 사용
  - 파일 순서 조정
  - 파일 제거
  - 중복 파일 추가
  - 읽기 실패 처리

## 운영/관찰가능성

### 로그
- 파일 읽기 실패: `console.error('Error reading file:', file.name, error)`

### 메트릭/트레이싱
- 없음 (UI 상태 관리 훅)

### 알람 포인트
- `isDragging`이 true일 때 UI에 드래그 스타일 적용
- `selectedFiles.length`가 0일 때 빈 상태 메시지 표시
- 병합 변환 시 `selectedFiles.length`로 진행률 계산

## 드래그앤드롭 라이브러리와의 통합
이 훅은 `@hello-pangea/dnd` 라이브러리와 함께 사용됨:
- `reorderFiles()`: DnD 라이브러리의 `onDropEnd` 핸들러에서 호출
- `moveFileUp()`, `moveFileDown()`: 버튼 클릭으로 순서 조정

## 파일 순서의 중요성
- **단일/배치 변환**: 순서 상관없음 (각 파일 개별 변환)
- **병합 변환**: 순서가 중요 (파일 순서대로 단일 DOCX에 병합)
- 파일명 섹션 헤더: 병합 시 각 파일명이 섹션 헤더(`# {filename}`)로 추가됨

## 변경 이력(선택)
- v1.0: 초기 구현