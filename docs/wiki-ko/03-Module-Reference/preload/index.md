# Preload Module (index.ts)

## 요약
- 책임: Main 프로세스와 Renderer 프로세스 사이의 IPC 통신 브리지 역할. Electron의 `contextBridge`를 통해 안전하게 Renderer 프로세스에 API 노출
- 주요 사용자/호출자: Renderer 프로세스의 모든 컴포넌트와 훅
- 핵심 엔트리포인트: `electronAPI` 객체 (라인 4-48)

## 아키텍처 내 위치
- 레이어: Preload Layer (Main과 Renderer 사이)
- 상위/하위 의존:
  - 상위: Main 프로세스 ([`src/main/ipc/handlers.ts`](../../src/main/ipc/handlers.ts:1))
  - 하위: Renderer 프로세스 (window.electronAPI로 노출)
- 런타임 플로우에서의 역할: Main 프로세스의 IPC 핸들러와 Renderer 프로세스의 UI 로직 사이의 통신 계층

## 퍼블릭 인터페이스

### window.electronAPI
Renderer 프로세스에서 `window.electronAPI`로 접근 가능한 API 객체

#### openFileDialog()
- 시그니처: `() => Promise<Electron.OpenDialogReturnValue>`
- 입력: 없음
- 출력: 파일 선택 다이얼로그 결과
- 에러/예외: Electron 다이얼로그 관련 에러
- 부작용: 다이얼로그 창 표시 (macOS에서 앱 포커스)
- 예시: 
```typescript
const result = await window.electronAPI.openFileDialog()
```

#### saveFileDialog()
- 시그니처: `(defaultName?: string) => Promise<Electron.SaveDialogReturnValue>`
- 입력: `defaultName` - 저장할 기본 파일명
- 출력: 파일 저장 다이얼로그 결과
- 에러/예외: Electron 다이얼로그 관련 에러
- 부작용: 다이얼로그 창 표시
- 예시:
```typescript
const result = await window.electronAPI.saveFileDialog('output.docx')
```

#### openDirectoryDialog()
- 시그니처: `() => Promise<Electron.OpenDialogReturnValue>`
- 입력: 없음
- 출력: 디렉터리 선택 다이얼로그 결과
- 에러/예외: Electron 다이얼로그 관련 에러
- 부작용: 다이얼로그 창 표시

#### readFile()
- 시그니처: `(filePath: string) => Promise<{name, path, content, size, lastModified}>`
- 입력: `filePath` - 파일 경로
- 출력: 파일 메타데이터 및 내용 객체
- 에러/예외: 파일 읽기 실패 시 에러
- 부작용: 없음 (읽기 전용)

#### startConversion()
- 시그니처: `(inputPath: string, outputPath: string, options: any) => Promise<any>`
- 입력: 
  - `inputPath`: 입력 Markdown 파일 경로
  - `outputPath`: 출력 DOCX 파일 경로
  - `options`: 변환 옵션 객체
- 출력: 변환 작업 시작
- 에러/예외: 변환 관련 에러
- 부작용: 백그라운드에서 Python 변환 프로세스 실행

#### startBatchConversion()
- 시그니처: `(inputFiles: string[], outputDirectory: string, options: any) => Promise<any>`
- 입력:
  - `inputFiles`: 입력 파일 경로 배열
  - `outputDirectory`: 출력 디렉터리 경로
  - `options`: 변환 옵션 객체
- 출력: 일괄 변환 작업 시작
- 에러/예외: 일괄 변환 관련 에러
- 부작용: 여러 파일을 순차적으로 변환

#### startMergeConversion()
- 시그니처: `(inputFiles: string[], outputPath: string, options: any) => Promise<any>`
- 입력:
  - `inputFiles`: 입력 파일 경로 배열
  - `outputPath`: 병합된 출력 파일 경로
  - `options`: 변환 옵션 객체
- 출력: 병합 변환 작업 시작
- 에러/예외: 병합 변환 관련 에러
- 부작용: 여러 파일을 하나로 병합하여 변환

#### cancelConversion()
- 시그니처: `() => void`
- 입력: 없음
- 출력: 없음
- 에러/예외: 없음
- 부작용: 진행 중인 변환 작업 취소

#### onConversionProgress()
- 시그니처: `(callback: (progress: any) => void) => void`
- 입력: `callback` - 진행률 업데이트 콜백 함수
- 출력: 없음
- 에러/예외: 없음
- 부작용: IPC 이벤트 리스너 등록

#### onConversionComplete()
- 시그니처: `(callback: (result: any) => void) => void`
- 입력: `callback` - 완료 결과 콜백 함수
- 출력: 없음
- 에러/예외: 없음
- 부작용: IPC 이벤트 리스너 등록

#### onConversionError()
- 시그니처: `(callback: (error: any) => void) => void`
- 입력: `callback` - 에러 콜백 함수
- 출력: 없음
- 에러/예외: 없음
- 부작용: IPC 이벤트 리스너 등록

#### onBatchConversionProgress()
- 시그니처: `(callback: (progress: any) => void) => void`
- 입력: `callback` - 일괄 변환 진행률 콜백
- 출력: 없음
- 부작용: IPC 이벤트 리스너 등록

#### onBatchConversionComplete()
- 시그니처: `(callback: (result: any) => void) => void`
- 입력: `callback` - 일괄 변환 완료 콜백
- 출력: 없음
- 부작용: IPC 이벤트 리스너 등록

#### onMergeConversionProgress()
- 시그니처: `(callback: (progress: any) => void) => void`
- 입력: `callback` - 병합 변환 진행률 콜백
- 출력: 없음
- 부작용: IPC 이벤트 리스너 등록

#### onMergeConversionComplete()
- 시그니처: `(callback: (result: any) => void) => void`
- 입력: `callback` - 병합 변환 완료 콜백
- 출력: 없음
- 부작용: IPC 이벤트 리스너 등록

#### getAppVersion()
- 시그니처: `() => Promise<string>`
- 입력: 없음
- 출력: 앱 버전 문자열 (예: "v1.0.0")
- 에러/예외: 없음
- 부작용: 없음

#### quitApp()
- 시그니처: `() => void`
- 입력: 없음
- 출력: 없음
- 에러/예외: 없음
- 부작용: 앱 종료, Python 프로세스 정리

#### removeAllListeners()
- 시그니처: `() => void`
- 입력: 없음
- 출력: 없음
- 에러/예외: 없음
- 부작용: 모든 IPC 이벤트 리스너 제거 (메모리 누수 방지)

## 내부 동작

### 주요 플로우
1. **초기화**: Main 프로세스에서 preload 스크립트 로드 ([`src/main/main.ts:26`](../../src/main/main.ts:26))
2. **API 노출**: `contextBridge.exposeInMainWorld()`로 [`electronAPI`](../../src/preload/index.ts:51) 노출
3. **IPC 통신**: Renderer → Preload → Main 프로세스로 호출 전달
4. **이벤트 수신**: Main → Preload → Renderer로 이벤트 전달

### 핵심 규칙/알고리즘
- **IPC 채널 일관성**: [`src/main/ipc/channels.ts`](../../src/main/ipc/channels.ts:1)에서 정의된 채널 상수만 사용
- **이벤트 리스너 정리**: 컴포넌트 언마운트 시 `removeAllListeners()` 호출 필수
- **보안**: `contextBridge` 사용으로 Node.js 접근 제한

### 엣지케이스
- **macOS 파일 다이얼로그**: [`handlers.ts`](../../src/main/ipc/handlers.ts:1)에서 `app.focus({ steal: true })`로 포커스 처리
- **리스너 누수**: 컴포넌트에서 정리하지 않으면 메모리 누수 발생 가능

## 데이터/모델
- 모델/DTO: 
  - `ConversionProgress`: `{ currentFile, totalFiles, currentFileName, percentage, stage/status }`
  - `ConversionResult`: `{ success, message, outputPath }`
  - `BatchConversionResult`: `{ success, processedCount, errorCount, processedFiles, errors }`
  - `MergeConversionResult`: `{ success, outputPath, inputFileCount }`
- 스키마/테이블: 없음
- 직렬화 포맷: JSON (IPC 통신)

## 설정/환경변수
- 환경 의존성: Electron [`contextBridge`](../../src/preload/index.ts:51) API
- IPC 채널: [`src/main/ipc/channels.ts`](../../src/main/ipc/channels.ts:1)에 정의된 상수들

## 의존성
- 내부 모듈: [`src/main/ipc/channels.ts`](../../src/main/ipc/channels.ts:1)
- 외부 라이브러리/서비스: 
  - `electron`: `contextBridge`, `ipcRenderer`

## 테스트
- 관련 테스트: 불명 (추가 확인 필요)
- 커버리지/갭: IPC 통신 테스트 부재

## 운영/관찰가능성
- 로그: 없음 (IPC 로그는 handlers.ts에서 처리)
- 메트릭/트레이싱: 없음
- 알람 포인트: 없음

## 관련 문서
- [IPC Channels](../ipc/channels.md)
- [IPC Handlers](../ipc/handlers.md)
- [Main Process](../main-process/main.md)