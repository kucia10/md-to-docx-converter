# IPC Channels

## 요약
- **책임**: IPC 채널 상수 정의 및 타입 안전성 보장
- **주요 사용자/호출자**: Main Process (핸들러), Preload Script (API 노출), Renderer Process (호출)
- **핵심 엔트리포인트**: `IPC_CHANNELS` 객체

## 아키텍처 내 위치
- **레이어**: Main Process / IPC Communication Layer
- **상위 의존**: 없음 (순수 상수 정의)
- **하위 의존**: Preload Script, Main Process Handlers
- **런타임 플로우에서의 역할**: 채널 이름의 단일 진실 원천 (Single Source of Truth)

## 퍼블릭 인터페이스

### IPC_CHANNELS
모든 IPC 채널 상수 객체

**타입**: `const IPC_CHANNELS` (as const)

**채널 목록**:

#### 파일 작업 (File Operations)
| 채널 | 값 | 설명 |
|--------|-----|------|
| `OPEN_FILE_DIALOG` | `'open-file-dialog'` | 파일 선택 다이얼로그 |
| `SAVE_FILE_DIALOG` | `'save-file-dialog'` | 저장 다이얼로그 |
| `READ_FILE` | `'read-file'` | 파일 내용 읽기 |
| `OPEN_DIRECTORY_DIALOG` | `'open-directory-dialog'` | 디렉터리 선택 다이얼로그 |

#### 변환 작업 (Conversion Operations)
| 채널 | 값 | 설명 |
|--------|-----|------|
| `START_CONVERSION` | `'start-conversion'` | 단일 파일 변환 시작 |
| `START_BATCH_CONVERSION` | `'start-batch-conversion'` | 배치 변환 시작 |
| `START_MERGE_CONVERSION` | `'start-merge-conversion'` | 병합 변환 시작 |
| `CANCEL_CONVERSION` | `'cancel-conversion'` | 변환 취소 |
| `CONVERSION_PROGRESS` | `'conversion-progress'` | 단일 변환 진행률 이벤트 |
| `CONVERSION_COMPLETE` | `'conversion-complete'` | 단일 변환 완료 이벤트 |
| `CONVERSION_ERROR` | `'conversion-error'` | 변환 오류 이벤트 |
| `BATCH_CONVERSION_PROGRESS` | `'batch-conversion-progress'` | 배치 변환 진행률 이벤트 |
| `BATCH_CONVERSION_COMPLETE` | `'batch-conversion-complete'` | 배치 변환 완료 이벤트 |
| `MERGE_CONVERSION_PROGRESS` | `'merge-conversion-progress'` | 병합 변환 진행률 이벤트 |
| `MERGE_CONVERSION_COMPLETE` | `'merge-conversion-complete'` | 병합 변환 완료 이벤트 |

#### 앱 작업 (App Operations)
| 채널 | 값 | 설명 |
|--------|-----|------|
| `GET_APP_VERSION` | `'get-app-version'` | 앱 버전 조회 |
| `QUIT_APP` | `'quit-app'` | 앱 종료 |

### IpcChannel
채널 값의 유니온 타입

**타입**:
```typescript
export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]
```

**사용 예시**:
```typescript
// 채널 값 타입 검증
function registerHandler(channel: IpcChannel, handler: () => void) {
  ipcMain.handle(channel, handler)
}
```

## 내부 동작

### 채널 명명 규칙
- **요청 채널**: `kebab-case`, 동사-명사 형태 (`open-file-dialog`, `start-conversion`)
- **이벤트 채널**: `kebab-case`, 명사-명사 형태 (`conversion-progress`, `conversion-complete`)

### const Assertion
```typescript
export const IPC_CHANNELS = {
  // ...
} as const
```

**목적**: 
- TypeScript가 리터럴 타입으로 추론하도록 함
- `IpcChannel` 타입에서 모든 채널 값의 유니온을 안전하게 추출

## 데이터/모델

**관련 타입**: [`src/renderer/types/index.ts`](../../../src/renderer/types/index.ts:96-115) - `ElectronAPI` 인터페이스

## 설정/환경변수
없음

## 의존성
- **내부 모듈**: 없음
- **외부 라이브러리/서비스**: 없음

## 테스트
- **관련 테스트**: 없음 (순수 상수 정의)
- **커버리지/갭**: N/A

## 운영/관찰가능성
- **로그**: 사용자 정의 로그 없음
- **메트릭/트레이싱**: 없음
- **알람 포인트**: 없음

## 사용 예시

### Main Process에서 import
```typescript
import { IPC_CHANNELS } from './ipc/channels'
import { ipcMain } from 'electron'

// 핸들러 등록
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
  // 파일 다이얼로그 표시 로직
})
```

### Preload Script에서 import
```typescript
import { IPC_CHANNELS } from '../main/ipc/channels'
import { ipcRenderer } from 'electron'

// API 노출
const electronAPI = {
  openFileDialog: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE_DIALOG),
  startConversion: (input, output, options) => 
    ipcRenderer.invoke(IPC_CHANNELS.START_CONVERSION, { input, output, options }),
}
```

## 중요 규칙

### 하드코딩 금지
❌ **잘못된 사용**:
```typescript
ipcMain.handle('open-file-dialog', handler)
```

✅ **올바른 사용**:
```typescript
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, handler)
```

### 타입 안전성
```typescript
// TypeScript가 채널 이름의 오타를 감지
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, handler)
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Error: Property 'OPEN_FILE_DIALOG' does not exist on type...
```

## 관련 문서

- [IPC Handlers](handlers.md) - 채널 핸들러 구현
- [Preload Script](../preload/index.md) - Context Bridge
- [API/인터페이스](../../04-API-Interface.md) - API 상세

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 1.0 | 초기 문서 작성 |