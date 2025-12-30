# API/인터페이스 (API/Interface)

## 개요

이 문서는 Electron IPC (Inter-Process Communication) 채널을 통해 Renderer Process와 Main Process 간의 API 인터페이스를 설명합니다.

**IPC 채널 정의**: [`src/main/ipc/channels.ts`](../src/main/ipc/channels.ts)

## IPC 통신 방식

### Request/Response Pattern (Renderer → Main)
```typescript
// Renderer (via Preload)
const result = await window.electronAPI.someMethod(params)

// Main
ipcMain.handle('some-channel', async (event, params) => {
  // 처리 로직
  return result
})
```

### Event Pattern (Main → Renderer)
```typescript
// Main
event.sender.send('some-event-channel', data)

// Renderer (via Preload)
window.electronAPI.onSomeEvent((data) => {
  // 이벤트 처리
})
```

## API 목록

### 파일 작업 API

#### openFileDialog
파일 선택 다이얼로그 표시

| 속성 | 값 |
|------|------|
| **채널** | `open-file-dialog` |
| **방향** | Renderer → Main |
| **파라미터** | 없음 |
| **반환** | `Promise<{canceled: boolean; filePaths: string[]}>` |
| **구현** | [`handlers.ts:21-55`](../src/main/ipc/handlers.ts:21-55) |

**사용 예시**:
```typescript
const result = await window.electronAPI.openFileDialog()
if (!result.canceled) {
  console.log(result.filePaths) // 선택된 파일 경로 배열
}
```

**핸들러 세부사항**:
- macOS에서는 `app.focus({ steal: true })`로 앱을 포그라운드로 가져옴
- 다중 파일 선택 지원 (`multiSelections`)
- 필터: `.md`, `.markdown`, `*` (전체)

---

#### saveFileDialog
저장 다이얼로그 표시

| 속성 | 값 |
|------|------|
| **채널** | `save-file-dialog` |
| **방향** | Renderer → Main |
| **파라미터** | `defaultName?: string` |
| **반환** | `Promise<{canceled: boolean; filePath?: string}>` |
| **구현** | [`handlers.ts:87-115`](../src/main/ipc/handlers.ts:87-115) |

**사용 예시**:
```typescript
const result = await window.electronAPI.saveFileDialog('document.docx')
if (!result.canceled && result.filePath) {
  console.log(result.filePath) // 선택된 저장 경로
}
```

**핸들러 세부사항**:
- 기본 파일명 설정 가능
- 필터: `.docx` (Word 문서)

---

#### openDirectoryDialog
디렉터리 선택 다이얼로그 표시

| 속성 | 값 |
|------|------|
| **채널** | `open-directory-dialog` |
| **방향** | Renderer → Main |
| **파라미터** | 없음 |
| **반환** | `Promise<{canceled: boolean; filePaths?: string[]}>` |
| **구현** | [`handlers.ts:57-85`](../src/main/ipc/handlers.ts:57-85) |

**사용 예시**:
```typescript
const result = await window.electronAPI.openDirectoryDialog()
if (!result.canceled && result.filePaths) {
  console.log(result.filePaths[0]) // 선택된 디렉터리 경로
}
```

---

#### readFile
파일 내용 읽기

| 속성 | 값 |
|------|------|
| **채널** | `read-file` |
| **방향** | Renderer → Main |
| **파라미터** | `filePath: string` |
| **반환** | `Promise<{name, path, content, size, lastModified}>` |
| **구현** | [`handlers.ts:118-135`](../src/main/ipc/handlers.ts:118-135) |

**사용 예시**:
```typescript
const fileData = await window.electronAPI.readFile('/path/to/file.md')
console.log(fileData.content) // 파일 내용 (UTF-8)
console.log(fileData.size)    // 파일 크기 (bytes)
console.log(fileData.name)    // 파일명
```

**반값 구조** (`FileReadResult`):
```typescript
{
  name: string,         // 파일명
  path: string,         // 파일 경로
  content: string,      // 파일 내용
  size: number,         // 파일 크기 (bytes)
  lastModified: number  // 마지막 수정 시간 (timestamp)
}
```

---

### 변환 작업 API

#### startConversion
단일 파일 변환 시작

| 속성 | 값 |
|------|------|
| **채널** | `start-conversion` |
| **방향** | Renderer → Main |
| **파라미터** | `{inputPath, outputPath, options}` |
| **반환** | `Promise<{success, message}>` |
| **구현** | [`handlers.ts:138-163`](../src/main/ipc/handlers.ts:138-163) |

**파라미터 구조**:
```typescript
{
  inputPath: string,               // 입력 Markdown 파일 경로
  outputPath: string,              // 출력 DOCX 파일 경로
  options: ConversionOptions       // 변환 옵션
}
```

**ConversionOptions** ([`src/renderer/types/index.ts`](../src/renderer/types/index.ts:10-23)):
```typescript
{
  fontSize?: number,               // 폰트 크기 (pt)
  fontFamily?: string,            // 폰트 패밀리
  lineHeight?: number,            // 줄 간격
  marginTop?: number,             // 상단 여백 (cm)
  marginBottom?: number,          // 하단 여백 (cm)
  marginLeft?: number,           // 좌측 여백 (cm)
  marginRight?: number,          // 우측 여백 (cm)
  orientation?: 'portrait' | 'landscape',
  generateToc?: boolean,
  referenceStyle?: 'apa' | 'mla' | 'chicago' | 'harvard',
  imageHandling?: 'embed' | 'link',
  codeBlockStyle?: 'fenced' | 'indented'
}
```

**사용 예시**:
```typescript
await window.electronAPI.startConversion(
  '/path/to/input.md',
  '/path/to/output.docx',
  {
    fontSize: 12,
    fontFamily: 'Arial',
    lineHeight: 1.5,
    marginTop: 2.54,
    orientation: 'portrait'
  }
)
```

**관련 이벤트**:
- `conversion-progress`: 변환 진행률
- `conversion-complete`: 변환 완료
- `conversion-error`: 변환 오류

---

#### startBatchConversion
배치 변환 시작

| 속성 | 값 |
|------|------|
| **채널** | `start-batch-conversion` |
| **방향** | Renderer → Main |
| **파라미터** | `{inputFiles, outputDirectory, options}` |
| **반환** | `Promise<BatchConversionResult>` |
| **구현** | [`handlers.ts:166-227`](../src/main/ipc/handlers.ts:166-227) |

**파라미터 구조**:
```typescript
{
  inputFiles: string[],           // 입력 Markdown 파일 경로 배열
  outputDirectory: string,        // 출력 디렉터리 경로
  options: ConversionOptions       // 변환 옵션
}
```

**사용 예시**:
```typescript
await window.electronAPI.startBatchConversion(
  ['/path/to/file1.md', '/path/to/file2.md'],
  '/output/directory',
  { fontSize: 12, fontFamily: 'Arial' }
)
```

**관련 이벤트**:
- `batch-conversion-progress`: 각 파일 변환 진행률
- `batch-conversion-complete`: 모든 파일 변환 완료

---

#### startMergeConversion
병합 변환 시작 (여러 파일 → 단일 DOCX)

| 속성 | 값 |
|------|------|
| **채널** | `start-merge-conversion` |
| **방향** | Renderer → Main |
| **파라미터** | `{inputFiles, outputPath, options}` |
| **반환** | `Promise<MergeConversionResult>` |
| **구현** | [`handlers.ts:230-280`](../src/main/ipc/handlers.ts:230-280) |

**파라미터 구조**:
```typescript
{
  inputFiles: string[],           // 입력 Markdown 파일 경로 배열
  outputPath: string,            // 출력 DOCX 파일 경로
  options: ConversionOptions     // 변환 옵션
}
```

**사용 예시**:
```typescript
await window.electronAPI.startMergeConversion(
  ['/path/to/file1.md', '/path/to/file2.md'],
  '/path/to/merged.docx',
  { fontSize: 12, fontFamily: 'Arial' }
)
```

**병합 동작**:
- 각 파일 사이에 페이지 구분 (`\newpage`) 삽입
- 각 파일명을 섹션 헤더로 추가
- 첫 번째 파일 헤더는 추가하지 않음

**관련 이벤트**:
- `merge-conversion-progress`: 병합 진행률
- `merge-conversion-complete`: 병합 완료

---

#### cancelConversion
변환 취소

| 속성 | 값 |
|------|------|
| **채널** | `cancel-conversion` |
| **방향** | Renderer → Main |
| **파라미터** | 없음 |
| **반환** | `void` |
| **구현** | [`converter.ts:120-125`](../src/main/python/converter.ts:120-125) |

**사용 예시**:
```typescript
window.electronAPI.cancelConversion()
```

**동작**:
- Python 프로세스 `kill()` 호출
- 진행 중인 변환 즉시 중단

---

### 이벤트 리스너 API

#### onConversionProgress
단일 변환 진행률 이벤트 수신

| 속성 | 값 |
|------|------|
| **채널** | `conversion-progress` |
| **방향** | Main → Renderer |
| **콜백 파라미터** | `ConversionProgress` |
| **구현** | [`useConversion.ts:15-17`](../src/renderer/hooks/useConversion.ts:15-17) |

**ConversionProgress 구조**:
```typescript
{
  currentFile: number,     // 현재 파일 인덱스
  totalFiles: number,      // 총 파일 수
  currentFileName: string,  // 현재 파일명
  percentage: number,      // 진행률 (0-100)
  stage: 'preparing' | 'converting' | 'finalizing' | 'completed' | 'error'
}
```

**사용 예시**:
```typescript
window.electronAPI.onConversionProgress((progress) => {
  console.log(`${progress.currentFile}/${progress.totalFiles} - ${progress.percentage}%`)
})
```

---

#### onConversionComplete
단일 변환 완료 이벤트 수신

| 속성 | 값 |
|------|------|
| **채널** | `conversion-complete` |
| **방향** | Main → Renderer |
| **콜백 파라미터** | `ConversionResult` |
| **구현** | [`useConversion.ts:19-24`](../src/renderer/hooks/useConversion.ts:19-24) |

**ConversionResult 구조**:
```typescript
{
  success: boolean,      // 성공 여부
  message: string,      // 메시지
  outputPath?: string   // 출력 파일 경로
}
```

**사용 예시**:
```typescript
window.electronAPI.onConversionComplete((result) => {
  if (result.success) {
    console.log('변환 완료:', result.outputPath)
  }
})
```

---

#### onConversionError
변환 오류 이벤트 수신

| 속성 | 값 |
|------|------|
| **채널** | `conversion-error` |
| **방향** | Main → Renderer |
| **콜백 파라미터** | `string` (오류 메시지) |
| **구현** | [`useConversion.ts:26-30`](../src/renderer/hooks/useConversion.ts:26-30) |

**사용 예시**:
```typescript
window.electronAPI.onConversionError((errorMessage) => {
  console.error('변환 오류:', errorMessage)
})
```

---

#### onBatchConversionProgress
배치 변환 진행률 이벤트 수신

| 속성 | 값 |
|------|------|
| **채널** | `batch-conversion-progress` |
| **방향** | Main → Renderer |
| **콜백 파라미터** | `BatchConversionProgress` |
| **구현** | [`useBatchConversion.ts:15-17`](../src/renderer/hooks/useBatchConversion.ts:15-17) |

**BatchConversionProgress 구조**:
```typescript
{
  currentFile: number,      // 현재 파일 인덱스
  totalFiles: number,       // 총 파일 수
  currentFileName: string,  // 현재 파일명
  percentage: number,      // 진행률 (0-100)
  status: 'converting' | 'completed' | 'error',
  processedFiles: string[], // 처리된 파일 경로 목록
  errors: Array<{fileName, error}>  // 오류 목록
}
```

---

#### onBatchConversionComplete
배치 변환 완료 이벤트 수신

| 속성 | 값 |
|------|------|
| **채널** | `batch-conversion-complete` |
| **방향** | Main → Renderer |
| **콜백 파라미터** | `BatchConversionResult` |
| **구현** | [`useBatchConversion.ts:19-24`](../src/renderer/hooks/useBatchConversion.ts:19-24) |

**BatchConversionResult 구조**:
```typescript
{
  success: boolean,                    // 전체 성공 여부
  message: string,                    // 결과 메시지
  outputDirectory?: string,            // 출력 디렉터리
  totalFiles: number,                 // 총 파일 수
  processedFiles: number,             // 처리된 파일 수
  errors: Array<{fileName, error}>    // 오류 목록
}
```

---

#### onMergeConversionProgress
병합 변환 진행률 이벤트 수신

| 속성 | 값 |
|------|------|
| **채널** | `merge-conversion-progress` |
| **방향** | Main → Renderer |
| **콜백 파라미터** | `MergeConversionProgress` |
| **구현** | [`useMergeConversion.ts:15-17`](../src/renderer/hooks/useMergeConversion.ts:15-17) |

**MergeConversionProgress 구조**:
```typescript
{
  currentFile: number,
  totalFiles: number,
  currentFileName: string,
  percentage: number,
  status: 'preparing' | 'merging' | 'converting' | 'completed' | 'error'
}
```

---

#### onMergeConversionComplete
병합 변환 완료 이벤트 수신

| 속성 | 값 |
|------|------|
| **채널** | `merge-conversion-complete` |
| **방향** | Main → Renderer |
| **콜백 파라미터** | `MergeConversionResult` |
| **구현** | [`useMergeConversion.ts:19-24`](../src/renderer/hooks/useMergeConversion.ts:19-24) |

**MergeConversionResult 구조**:
```typescript
{
  success: boolean,
  message: string,
  outputPath?: string,
  totalFiles: number,
  error?: string
}
```

---

### 앱 작업 API

#### getAppVersion
앱 버전 조회

| 속성 | 값 |
|------|------|
| **채널** | `get-app-version` |
| **방향** | Renderer → Main |
| **파라미터** | 없음 |
| **반환** | `Promise<string>` (예: "v1.2.1") |
| **구현** | [`handlers.ts:283-286`](../src/main/ipc/handlers.ts:283-286) |

**사용 예시**:
```typescript
const version = await window.electronAPI.getAppVersion()
console.log(version) // "v1.2.1"
```

---

#### quitApp
앱 종료

| 속성 | 값 |
|------|------|
| **채널** | `quit-app` |
| **방향** | Renderer → Main |
| **파라미터** | 없음 |
| **반환** | `void` |
| **구현** | [`handlers.ts:289-293`](../src/main/ipc/handlers.ts:289-293) |

**동작**:
- Python 프로세스 `cleanup()` 호출
- `app.quit()` 호출

---

#### removeAllListeners
모든 IPC 이벤트 리스너 제거

| 속성 | 값 |
|------|------|
| **방향** | Renderer (내부) |
| **파라미터** | 없음 |
| **반환** | `void` |
| **구현** | [`preload/index.ts:39-47`](../src/preload/index.ts:39-47) |

**사용 예시**:
```typescript
window.electronAPI.removeAllListeners()
```

**제거되는 리스너**:
- `conversion-progress`
- `conversion-complete`
- `conversion-error`
- `batch-conversion-progress`
- `batch-conversion-complete`
- `merge-conversion-progress`
- `merge-conversion-complete`

---

## IPC 채널 상수

모든 채널 상수는 [`src/main/ipc/channels.ts`](../src/main/ipc/channels.ts)에 정의되어 있습니다.

```typescript
export const IPC_CHANNELS = {
  // File operations
  OPEN_FILE_DIALOG: 'open-file-dialog',
  SAVE_FILE_DIALOG: 'save-file-dialog',
  READ_FILE: 'read-file',
  OPEN_DIRECTORY_DIALOG: 'open-directory-dialog',
  
  // Conversion operations
  START_CONVERSION: 'start-conversion',
  START_BATCH_CONVERSION: 'start-batch-conversion',
  START_MERGE_CONVERSION: 'start-merge-conversion',
  CANCEL_CONVERSION: 'cancel-conversion',
  CONVERSION_PROGRESS: 'conversion-progress',
  CONVERSION_COMPLETE: 'conversion-complete',
  CONVERSION_ERROR: 'conversion-error',
  BATCH_CONVERSION_PROGRESS: 'batch-conversion-progress',
  BATCH_CONVERSION_COMPLETE: 'batch-conversion-complete',
  MERGE_CONVERSION_PROGRESS: 'merge-conversion-progress',
  MERGE_CONVERSION_COMPLETE: 'merge-conversion-complete',
  
  // App operations
  GET_APP_VERSION: 'get-app-version',
  QUIT_APP: 'quit-app',
} as const
```

**중요**: 하드코딩된 채널 문자열 대신 항상 `IPC_CHANNELS` 상수를 사용하세요.

## 관련 문서

- [데이터 모델](05-Data-Models.md) - 타입 정의 상세
- [아키텍처](02-Architecture.md) - IPC 통신 흐름
- [모듈 레퍼런스 - IPC Handlers](03-Module-Reference/ipc/handlers.md) - 핸들러 구현

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2024-12-29 | 1.0 | 초기 API 문서 작성 |