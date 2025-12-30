# types (TypeScript 타입 정의)

## 요약
- **책임**: 애플리케이션 전체 TypeScript 타입 정의
- **주요 사용자/호출자**: 전체 renderer 프로세스 코드
- **핵심 엔트리포인트**: `export interface` 타입 정의들

## 아키텍처 내 위치
- **레이어**: Renderer Process - Type Definitions Layer
- **상위/하위 의존**:
  - 의존: 없음 (순수 타입 정의)
  - 사용: 전체 renderer 코드
- **런타임 플로우에서의 역할**: 타입 체크, 인텔리센스 지원

## 타입 정의 목록

### FileItem
파일 업로드 시 생성되는 파일 정보.

```typescript
export interface FileItem {
  id: string          // 고유 식별자 (랜덤 문자열)
  name: string        // 파일명
  path: string        // 파일 경로 (Electron에서 제공)
  size: number        // 파일 크기 (bytes)
  lastModified: number // 마지막 수정 시간 (timestamp)
  content?: string    // 파일 내용 (UTF-8 텍스트)
}
```

### ConversionOptions
변환 옵션 설정.

```typescript
export interface ConversionOptions {
  fontSize?: number                            // 폰트 크기 (pt), 기본 12
  fontFamily?: string                          // 폰트 패밀리, 기본 'Arial'
  lineHeight?: number                           // 줄 간격, 기본 1.5
  marginTop?: number                           // 상단 여백 (cm), 기본 2.54
  marginBottom?: number                        // 하단 여백 (cm), 기본 2.54
  marginLeft?: number                           // 좌측 여백 (cm), 기본 3.18
  marginRight?: number                          // 우측 여백 (cm), 기본 3.18
  orientation?: 'portrait' | 'landscape'      // 페이지 방향
  generateToc?: boolean                        // 목차 생성 여부
  referenceStyle?: 'apa' | 'mla' | 'chicago' | 'harvard'  // 참고문헌 스타일
  imageHandling?: 'embed' | 'link'           // 이미지 처리 방식
  codeBlockStyle?: 'fenced' | 'indented'     // 코드 블록 스타일
}
```

### ConversionProgress
단일 파일 변환 진행률 정보.

```typescript
export interface ConversionProgress {
  currentFile: number        // 현재 파일 인덱스 (항상 0)
  totalFiles: number         // 전체 파일 수 (항상 1)
  currentFileName: string    // 현재 파일명
  percentage: number         // 진행률 백분율 (0-100)
  stage: 'preparing' | 'converting' | 'finalizing' | 'completed' | 'error'
}
```

### ConversionResult
단일 파일 변환 결과.

```typescript
export interface ConversionResult {
  success: boolean        // 성공 여부
  message: string         // 결과 메시지
  outputPath?: string     // 출력 파일 경로 (성공 시)
  processedFiles?: string[]  // 처리된 파일 목록 (배치에서는 사용 안 함)
  errors?: string[]       // 오류 메시지 목록 (실패 시)
}
```

### AppState
애플리케이션 전체 상태 (사용하지 않음, 참고용).

```typescript
export interface AppState {
  selectedFiles: FileItem[]                        // 선택된 파일 목록
  currentFileIndex: number                          // 현재 파일 인덱스
  previewContent: string                             // 미리보기 내용
  conversionOptions: ConversionOptions                 // 변환 옵션
  isConverting: boolean                             // 변환 중 여부
  conversionProgress: ConversionProgress | null        // 변환 진행률
  conversionError: string | null                   // 변환 오류
  conversionResult: ConversionResult | null          // 변환 결과
  isDragging: boolean                               // 드래그 중 여부
}
```

### FileReadResult
파일 읽기 결과 (Electron IPC 응답).

```typescript
export interface FileReadResult {
  name: string          // 파일명
  path: string          // 파일 경로
  content: string       // 파일 내용
  size: number          // 파일 크기
  lastModified: number  // 마지막 수정 시간
}
```

### BatchConversionProgress
배치 변환 진행률 정보.

```typescript
export interface BatchConversionProgress {
  currentFile: number                     // 현재 파일 인덱스
  totalFiles: number                      // 전체 파일 수
  currentFileName: string                 // 현재 파일명
  percentage: number                      // 전체 진행률 (0-100)
  status: 'converting' | 'completed' | 'error'
  processedFiles: string[]                // 성공적으로 처리된 파일 목록
  errors: Array<{ fileName: string; error: string }>  // 발생한 오류 목록
}
```

### BatchConversionResult
배치 변환 결과.

```typescript
export interface BatchConversionResult {
  success: boolean                           // 성공 여부 (부분 성공 시 true)
  message: string                            // 결과 메시지
  outputDirectory?: string                   // 출력 디렉터리 경로
  totalFiles: number                         // 전체 파일 수
  processedFiles: number                     // 성공적으로 처리된 파일 수
  errors: Array<{ fileName: string; error: string }>  // 실패한 파일 목록
}
```

### MergeConversionProgress
병합 변환 진행률 정보.

```typescript
export interface MergeConversionProgress {
  currentFile: number        // 현재 파일 인덱스
  totalFiles: number         // 전체 파일 수
  currentFileName: string    // 현재 파일명
  percentage: number         // 전체 진행률 (0-100)
  status: 'preparing' | 'merging' | 'converting' | 'completed' | 'error'
}
```

### MergeConversionResult
병합 변환 결과.

```typescript
export interface MergeConversionResult {
  success: boolean        // 성공 여부
  message: string         // 결과 메시지
  outputPath?: string     // 출력 파일 경로 (성공 시)
  totalFiles: number      // 병합한 파일 수
  error?: string          // 오류 메시지 (실패 시)
}
```

### ElectronAPI
Electron Preload에서 노출된 API 타입.

```typescript
export interface ElectronAPI {
  // File Operations
  openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>
  saveFileDialog: (defaultName?: string) => Promise<{ canceled: boolean; filePath?: string }>
  openDirectoryDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>
  readFile: (filePath: string) => Promise<FileReadResult>
  
  // Conversion Operations
  startConversion: (inputPath: string, outputPath: string, options: ConversionOptions) => Promise<any>
  startBatchConversion: (inputFiles: string[], outputDirectory: string, options: ConversionOptions) => Promise<any>
  startMergeConversion: (inputFiles: string[], outputPath: string, options: ConversionOptions) => Promise<any>
  cancelConversion: () => void
  
  // Event Listeners
  onConversionProgress: (callback: (progress: ConversionProgress) => void) => void
  onConversionComplete: (callback: (result: ConversionResult) => void) => void
  onConversionError: (callback: (error: string) => void) => void
  onBatchConversionProgress: (callback: (progress: BatchConversionProgress) => void) => void
  onBatchConversionComplete: (callback: (result: BatchConversionResult) => void) => void
  onMergeConversionProgress: (callback: (progress: MergeConversionProgress) => void) => void
  onMergeConversionComplete: (callback: (result: MergeConversionResult) => void) => void
  
  // App Operations
  getAppVersion: () => Promise<string>
  quitApp: () => void
  removeAllListeners: () => void
}
```

## 타입 사용 가이드

### ConversionOptions 기본값
```typescript
const defaultOptions: ConversionOptions = {
  fontSize: 12,
  fontFamily: 'Arial',
  lineHeight: 1.5,
  marginTop: 2.54,
  marginBottom: 2.54,
  marginLeft: 3.18,
  marginRight: 3.18,
  orientation: 'portrait',
  generateToc: true,
  referenceStyle: 'apa',
  imageHandling: 'embed',
  codeBlockStyle: 'fenced'
}
```

### Stage 타입 비교
| 스테이지 | ConversionProgress | BatchConversionProgress | MergeConversionProgress |
|-----------|-------------------|----------------------|------------------------|
| 준비 | `preparing` | - | `preparing` |
| 변환 중 | `converting` | `converting` | `converting` |
| 병합 중 | - | - | `merging` |
| 완료 중 | `finalizing` | - | - |
| 완료 | `completed` | `completed` | `completed` |
| 오류 | `error` | `error` | `error` |

### 여백 단위
- UI에서: **cm** 단위
- Pandoc 전달: **inch** 단위 (÷ 2.54 변환)

## 관련 파일
- [`../main/ipc/handlers.ts`](../../main/ipc/handlers.md): IPC 핸들러
- [`../preload/index.ts`](../../preload/index.md): Preload 스크립트

## 변경 이력(선택)
- v1.0: 초기 타입 정의