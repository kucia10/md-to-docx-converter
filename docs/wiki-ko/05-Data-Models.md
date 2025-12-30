# 데이터 모델 (Data Models)

## 개요
이 문서는 [`src/renderer/types/index.ts`](../../src/renderer/types/index.ts)에 정의된 TypeScript 타입과 데이터 모델을 설명합니다.

## 타입 정의

### FileItem
파일 업로드 관리를 위한 파일 정보 모델

| 속성 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | 고유 식별자 (랜덤 생성) |
| `name` | `string` | 파일명 |
| `path` | `string` | 파일 시스템 경로 |
| `size` | `number` | 파일 크기 (bytes) |
| `lastModified` | `number` | 마지막 수정 시간 (timestamp) |
| `content` | `string?` | 파일 내용 (미리보기용) |

**위치**: [`src/renderer/types/index.ts:1-8`](../../src/renderer/types/index.ts:1-8)

---

### ConversionOptions
변환 옵션 모델 (UI 설정 → Python 변환 파라미터)

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `fontSize` | `number?` | 12 | 폰트 크기 (pt) |
| `fontFamily` | `string?` | 'Arial' | 폰트 패밀리 |
| `lineHeight` | `number?` | 1.5 | 줄 간격 |
| `marginTop` | `number?` | 2.54 | 상단 여백 (cm) |
| `marginBottom` | `number?` | 2.54 | 하단 여백 (cm) |
| `marginLeft` | `number?` | 3.18 | 좌측 여백 (cm) |
| `marginRight` | `number?` | 3.18 | 우측 여백 (cm) |
| `orientation` | `'portrait' \| 'landscape'?` | 'portrait' | 페이지 방향 |
| `generateToc` | `boolean?` | true | 목차 생성 여부 |
| `referenceStyle` | `'apa' \| 'mla' \| 'chicago' \| 'harvard'?` | 'apa' | 참고문헌 스타일 |
| `imageHandling` | `'embed' \| 'link'?` | 'embed' | 이미지 처리 방식 |
| `codeBlockStyle` | `'fenced' \| 'indented'?` | 'fenced' | 코드 블록 스타일 |

**위치**: [`src/renderer/types/index.ts:10-23`](../../src/renderer/types/index.ts:10-23)

**참고**: 
- UI에서는 여백을 **cm** 단위로 저장
- Python 스크립트로 전달 시 **인치**로 변환 (÷2.54)
- Pandoc의 기본 여백: 상하 2.54cm, 좌우 3.18cm

---

### ConversionProgress
단일 파일 변환 진행률 모델

| 속성 | 타입 | 설명 |
|------|------|------|
| `currentFile` | `number` | 현재 파일 인덱스 |
| `totalFiles` | `number` | 총 파일 수 |
| `currentFileName` | `string` | 현재 파일명 |
| `percentage` | `number` | 진행률 (0-100) |
| `stage` | `'preparing' \| 'converting' \| 'finalizing' \| 'completed' \| 'error'` | 변환 단계 |

**위치**: [`src/renderer/types/index.ts:25-31`](../../src/renderer/types/index.ts:25-31)

---

### ConversionResult
단일 파일 변환 결과 모델

| 속성 | 타입 | 설명 |
|------|------|------|
| `success` | `boolean` | 변환 성공 여부 |
| `message` | `string` | 결과 메시지 |
| `outputPath` | `string?` | 출력 파일 경로 |
| `processedFiles` | `string[]?` | 처리된 파일 목록 |
| `errors` | `string[]?` | 오류 목록 |

**위치**: [`src/renderer/types/index.ts:33-39`](../../src/renderer/types/index.ts:33-39)

---

### BatchConversionProgress
배치 변환 진행률 모델

| 속성 | 타입 | 설명 |
|------|------|------|
| `currentFile` | `number` | 현재 파일 인덱스 |
| `totalFiles` | `number` | 총 파일 수 |
| `currentFileName` | `string` | 현재 파일명 |
| `percentage` | `number` | 진행률 (0-100) |
| `status` | `'converting' \| 'completed' \| 'error'` | 상태 |
| `processedFiles` | `string[]` | 처리된 파일 경로 목록 |
| `errors` | `Array<{fileName: string; error: string}>` | 오류 목록 |

**위치**: [`src/renderer/types/index.ts:61-69`](../../src/renderer/types/index.ts:61-69)

---

### BatchConversionResult
배치 변환 결과 모델

| 속성 | 타입 | 설명 |
|------|------|------|
| `success` | `boolean` | 전체 성공 여부 (오류가 없으면 true) |
| `message` | `string` | 결과 메시지 |
| `outputDirectory` | `string?` | 출력 디렉터리 경로 |
| `totalFiles` | `number` | 총 파일 수 |
| `processedFiles` | `number` | 처리된 파일 수 |
| `errors` | `Array<{fileName: string; error: string}>` | 오류 목록 |

**위치**: [`src/renderer/types/index.ts:71-78`](../../src/renderer/types/index.ts:71-78)

---

### MergeConversionProgress
병합 변환 진행률 모델

| 속성 | 타입 | 설명 |
|------|------|------|
| `currentFile` | `number` | 현재 파일 인덱스 |
| `totalFiles` | `number` | 총 파일 수 |
| `currentFileName` | `string` | 현재 파일명 |
| `percentage` | `number` | 진행률 (0-100) |
| `status` | `'preparing' \| 'merging' \| 'converting' \| 'completed' \| 'error'` | 상태 |

**위치**: [`src/renderer/types/index.ts:80-86`](../../src/renderer/types/index.ts:80-86)

---

### MergeConversionResult
병합 변환 결과 모델

| 속성 | 타입 | 설명 |
|------|------|------|
| `success` | `boolean` | 성공 여부 |
| `message` | `string` | 결과 메시지 |
| `outputPath` | `string?` | 출력 파일 경로 |
| `totalFiles` | `number` | 병합된 파일 수 |
| `error` | `string?` | 오류 메시지 |

**위치**: [`src/renderer/types/index.ts:88-94`](../../src/renderer/types/index.ts:88-94)

---

### ElectronAPI
Preload 스크립트에서 노출된 IPC API 타입

#### 파일 작업 메서드

| 메서드 | 파라미터 | 반환 타입 | 설명 |
|--------|----------|-----------|------|
| `openFileDialog()` | - | `Promise<{canceled: boolean; filePaths: string[]}>` | 파일 선택 다이얼로그 |
| `saveFileDialog()` | `defaultName?: string` | `Promise<{canceled: boolean; filePath?: string}>` | 저장 다이얼로그 |
| `openDirectoryDialog()` | - | `Promise<{canceled: boolean; filePaths?: string[]}>` | 디렉터리 선택 다이얼로그 |
| `readFile()` | `filePath: string` | `Promise<FileReadResult>` | 파일 내용 읽기 |

#### 변환 작업 메서드

| 메서드 | 파라미터 | 반환 타입 | 설명 |
|--------|----------|-----------|------|
| `startConversion()` | `inputPath, outputPath, options` | `Promise<any>` | 단일 파일 변환 시작 |
| `startBatchConversion()` | `inputFiles[], outputDirectory, options` | `Promise<any>` | 배치 변환 시작 |
| `startMergeConversion()` | `inputFiles[], outputPath, options` | `Promise<any>` | 병합 변환 시작 |
| `cancelConversion()` | - | `void` | 변환 취소 |

#### 이벤트 리스너 메서드

| 메서드 | 콜백 파라미터 | 설명 |
|--------|---------------|------|
| `onConversionProgress()` | `ConversionProgress` | 단일 변환 진행률 이벤트 |
| `onConversionComplete()` | `ConversionResult` | 단일 변환 완료 이벤트 |
| `onConversionError()` | `string` | 변환 오류 이벤트 |
| `onBatchConversionProgress()` | `BatchConversionProgress` | 배치 변환 진행률 이벤트 |
| `onBatchConversionComplete()` | `BatchConversionResult` | 배치 변환 완료 이벤트 |
| `onMergeConversionProgress()` | `MergeConversionProgress` | 병합 변환 진행률 이벤트 |
| `onMergeConversionComplete()` | `MergeConversionResult` | 병합 변환 완료 이벤트 |

#### 앱 작업 메서드

| 메서드 | 파라미터 | 반환 타입 | 설명 |
|--------|----------|-----------|------|
| `getAppVersion()` | - | `Promise<string>` | 앱 버전 조회 |
| `quitApp()` | - | `void` | 앱 종료 |
| `removeAllListeners()` | - | `void` | 모든 IPC 리스너 제거 |

**위치**: [`src/renderer/types/index.ts:96-115`](../../src/renderer/types/index.ts:96-115)

---

## 데이터 흐름

### 파일 업로드 흐름
```
사용자 파일 선택 
  → openFileDialog (IPC)
  → readFile (IPC, 각 파일당)
  → FileItem 생성 (content 포함)
  → selectedFiles 상태 업데이트
  → usePreview로 미리보기 표시
```

### 변환 옵션 흐름
```
ConversionOptions UI
  → options 상태 (App.tsx)
  → startConversion / startBatchConversion / startMergeConversion
  → IPC 호출 (start-conversion 등)
  → PythonConverter (main/python/converter.ts)
  → convert.py (Python 스크립트)
```

### 진행률 이벤트 흐름
```
Python 변환 진행
  → PythonConverter.process.stdout
  → IPC 이벤트 (conversion-progress 등)
  → Renderer 이벤트 리스너
  → 진행률 상태 업데이트
  → ProgressBar 컴포넌트 렌더링
```

## 관련 문서
- [API/인터페이스](04-API-Interface.md) - IPC 채널 상세
- [아키텍처](02-Architecture.md) - 시스템 구조
- [모듈 레퍼런스 - Hooks](03-Module-Reference/renderer/hooks/) - 커스텀 훅 사용 방법