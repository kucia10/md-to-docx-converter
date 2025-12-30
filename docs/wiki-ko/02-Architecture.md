# 아키텍처 (Architecture)

## 개요

MD to DOCX Converter는 **Electron 3-프로세스 아키텍처**를 따릅니다: Renderer Process, Preload Script, Main Process. Main Process는 Python 프로세스를 스폰하여 Pandoc을 사용하여 실제 문서 변환을 수행합니다.

## 시스템 구성도

```
┌─────────────────────────────────────────────────────────────────┐
│                     Renderer Process                           │
│  (React 18.2 + TypeScript 5.3 + Tailwind CSS 3.3)            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 UI Components                         │   │
│  │  - FileUpload, ConversionOptions, ProgressBar         │   │
│  │  - MarkdownPreview, ResultDisplay, ThemeToggle        │   │
│  │  - LanguageToggle                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Custom Hooks (State Management)            │   │
│  │  - useConversion (단일 변환)                         │   │
│  │  - useBatchConversion (배치 변환)                    │   │
│  │  - useMergeConversion (병합 변환)                    │   │
│  │  - useFileUpload (파일 관리)                         │   │
│  │  - usePreview (미리보기 관리)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Context Providers                         │   │
│  │  - ThemeProvider (다크/라이트 테마)                │   │
│  │  - i18next Provider (다국어)                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│              IPC Call (invoke)                              │
│                 window.electronAPI                          │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Preload Script                           │
│  (contextBridge)                                             │
│                                                               │
│  window.electronAPI = {                                       │
│    openFileDialog, saveFileDialog,                             │
│    startConversion, startBatchConversion,                     │
│    onConversionProgress, onConversionComplete, ...             │
│  }                                                            │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Main Process                             │
│  (Electron + Node.js)                                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              IPC Handlers                           │   │
│  │  - FILE: open/save dialogs, read-file             │   │
│  │  - CONVERSION: start-conversion, batch, merge      │   │
│  │  - APP: get-app-version, quit-app                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Python Bridge                          │   │
│  │  PythonConverter.convertMarkdownToDocx()            │   │
│  │  PythonConverter.mergeFilesToDocx()                │   │
│  │    → spawn(python3, convert.py, args)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│              IPC Event (send)                                │
│        conversion-progress, conversion-complete               │
└─────────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Python Process                              │
│  (Python 3.11+ + Pandoc 3.0+)                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              convert.py                               │   │
│  │  - PandocConverter class                           │   │
│  │  - convert() 메서드: 단일 파일 변환               │   │
│  │  - merge_files() 함수: 다중 파일 병합             │   │
│  │  - _build_pandoc_command(): Pandoc CLI 명령 생성   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│              subprocess.run(pandoc, ...)                        │
└─────────────────────────────────────────────────────────────────┘
```

## 레이어 설명

### 1. Renderer Process (UI Layer)

**위치**: [`src/renderer/`](../src/renderer/)

**책임**:
- 사용자 인터페이스 렌더링
- 사용자 상호작용 처리
- 상태 관리 (React Hooks, Context)
- IPC 호출 (via Preload)

**주요 컴포넌트**:
- [`App.tsx`](../src/renderer/App.tsx) - 메인 앱 컴포넌트
- [`FileUpload.tsx`](../src/renderer/components/FileUpload.tsx) - 파일 업로드 (드래그앤드롭)
- [`ConversionOptions.tsx`](../src/renderer/components/ConversionOptions.tsx) - 변환 옵션 UI
- [`ProgressBar.tsx`](../src/renderer/components/ProgressBar.tsx) - 진행률 표시
- [`ResultDisplay.tsx`](../src/renderer/components/ResultDisplay.tsx) - 결과 표시
- [`MarkdownPreview.tsx`](../src/renderer/components/MarkdownPreview.tsx) - Markdown 렌더링

**주요 훅**:
- [`useConversion.ts`](../src/renderer/hooks/useConversion.ts) - 단일 파일 변환 상태
- [`useBatchConversion.ts`](../src/renderer/hooks/useBatchConversion.ts) - 배치 변환 상태
- [`useMergeConversion.ts`](../src/renderer/hooks/useMergeConversion.ts) - 병합 변환 상태
- [`useFileUpload.ts`](../src/renderer/hooks/useFileUpload.ts) - 파일 업로드 관리
- [`usePreview.ts`](../src/renderer/hooks/usePreview.ts) - 미리보기 관리

### 2. Preload Script (Context Bridge Layer)

**위치**: [`src/preload/index.ts`](../src/preload/index.ts)

**책임**:
- Renderer ↔ Main 간 IPC 통신 브릿지
- `contextBridge.exposeInMainWorld()`로 안전한 API 노출
- Node Integration 없이도 Main 기능 접근 허용

**노출된 API**:
```typescript
window.electronAPI = {
  // File operations
  openFileDialog, saveFileDialog, openDirectoryDialog, readFile,
  
  // Conversion operations
  startConversion, startBatchConversion, startMergeConversion, cancelConversion,
  onConversionProgress, onConversionComplete, onConversionError,
  onBatchConversionProgress, onBatchConversionComplete,
  onMergeConversionProgress, onMergeConversionComplete,
  
  // App operations
  getAppVersion, quitApp, removeAllListeners
}
```

### 3. Main Process (Backend Layer)

**위치**: [`src/main/`](../src/main/)

**책임**:
- Electron 앱 라이프사이클 관리
- 윈도우 생성 및 관리
- IPC 채널 핸들러 구현
- Python 프로세스 실행 및 관리

**주요 모듈**:
- [`main.ts`](../src/main/main.ts) - 앱 진입점, 윈도우 생성
- [`ipc/channels.ts`](../src/main/ipc/channels.ts) - IPC 채널 상수 정의
- [`ipc/handlers.ts`](../src/main/ipc/handlers.ts) - IPC 핸들러 구현
- [`python/converter.ts`](../src/main/python/converter.ts) - Python 브릿지 클래스

### 4. Python Integration Layer

**위치**: 
- [`src/main/python/converter.ts`](../src/main/python/converter.ts) - TypeScript 브릿지
- [`src/python/convert.py`](../src/python/convert.py) - Python 변환 스크립트

**책임**:
- Python 프로세스 `spawn()` 및 관리
- Pandoc CLI 명령 실행
- 변환 결과를 JSON으로 Main에 전달

## 런타임 플로우

### 단일 파일 변환 플로우

```
1. 사용자: 파일 선택 및 변환 옵션 설정
   ↓
2. Renderer: handleStartConversion() 호출
   ↓
3. Renderer: saveFileDialog() → 저장 경로 선택
   ↓
4. Renderer: startConversion(inputPath, outputPath, options)
   ↓
5. Preload: IPC invoke (start-conversion)
   ↓
6. Main: IPC handler (START_CONVERSION)
   ↓
7. Main: PythonConverter.convertMarkdownToDocx()
   ↓
8. Main: spawn(python3, convert.py --input X --output Y [options])
   ↓
9. Python: convert.py → PandocConverter.convert()
   ↓
10. Python: subprocess.run(pandoc [args]) → DOCX 생성
    ↓
11. Python: print(json.dumps(result))
    ↓
12. Main: stdout 파싱 → { success: true, ... }
    ↓
13. Main: IPC event (conversion-complete)
    ↓
14. Renderer: onConversionComplete() → 상태 업데이트
    ↓
15. Renderer: ResultDisplay 컴포넌트에 결과 표시
```

### 배치 변환 플로우

```
1. 사용자: 다중 파일 선택 및 변환 시작
   ↓
2. Renderer: startBatchConversion()
   ↓
3. Main: PythonConverter 루프로 각 파일 변환
   ↓
4. Main: 각 파일 변환마다 batch-conversion-progress 이벤트 전송
   ↓
5. Python: 각 파일 개별 변환 (convert.py)
   ↓
6. Main: 모든 파일 완료 시 batch-conversion-complete 이벤트
   ↓
7. Renderer: 배치 결과 표시 (성공/실패 파일 목록)
```

### 병합 변환 플로우

```
1. 사용자: 다중 파일 선택 및 병합 변환 시작
   ↓
2. Renderer: startMergeConversion()
   ↓
3. Main: PythonConverter.mergeFilesToDocx()
   ↓
4. Main: spawn(python3, convert.py --merge --input X --input Y --output Z)
   ↓
5. Python: merge_files() 함수 실행
   ↓
6. Python: 각 파일 읽고 merged_content 생성 (구분자: ---, \newpage)
   ↓
7. Python: 임시 Markdown 파일 생성
   ↓
8. Python: Pandoc으로 임시 파일을 DOCX로 변환
    ↓
9. Python: 임시 파일 삭제
    ↓
10. Main: merge-conversion-complete 이벤트
    ↓
11. Renderer: 병합 결과 표시
```

## IPC 통신 채널

### Request Channels (Renderer → Main)

| 채널 | 방향 | 목적 | 핸들러 |
|------|------|------|--------|
| `open-file-dialog` | Renderer → Main | 파일 선택 다이얼로그 | [`handlers.ts:21-55`](../src/main/ipc/handlers.ts:21-55) |
| `save-file-dialog` | Renderer → Main | 저장 다이얼로그 | [`handlers.ts:87-115`](../src/main/ipc/handlers.ts:87-115) |
| `open-directory-dialog` | Renderer → Main | 디렉터리 선택 다이얼로그 | [`handlers.ts:57-85`](../src/main/ipc/handlers.ts:57-85) |
| `read-file` | Renderer → Main | 파일 내용 읽기 | [`handlers.ts:118-135`](../src/main/ipc/handlers.ts:118-135) |
| `start-conversion` | Renderer → Main | 단일 파일 변환 시작 | [`handlers.ts:138-163`](../src/main/ipc/handlers.ts:138-163) |
| `start-batch-conversion` | Renderer → Main | 배치 변환 시작 | [`handlers.ts:166-227`](../src/main/ipc/handlers.ts:166-227) |
| `start-merge-conversion` | Renderer → Main | 병합 변환 시작 | [`handlers.ts:230-280`](../src/main/ipc/handlers.ts:230-280) |
| `cancel-conversion` | Renderer → Main | 변환 취소 | [`converter.ts:120-125`](../src/main/python/converter.ts:120-125) |
| `get-app-version` | Renderer → Main | 앱 버전 조회 | [`handlers.ts:283-286`](../src/main/ipc/handlers.ts:283-286) |
| `quit-app` | Renderer → Main | 앱 종료 | [`handlers.ts:289-293`](../src/main/ipc/handlers.ts:289-293) |

### Event Channels (Main → Renderer)

| 채널 | 방향 | 목적 | 리스너 |
|------|------|------|--------|
| `conversion-progress` | Main → Renderer | 단일 변환 진행률 | [`useConversion.ts:15-17`](../src/renderer/hooks/useConversion.ts:15-17) |
| `conversion-complete` | Main → Renderer | 단일 변환 완료 | [`useConversion.ts:19-24`](../src/renderer/hooks/useConversion.ts:19-24) |
| `conversion-error` | Main → Renderer | 변환 오류 | [`useConversion.ts:26-30`](../src/renderer/hooks/useConversion.ts:26-30) |
| `batch-conversion-progress` | Main → Renderer | 배치 변환 진행률 | [`useBatchConversion.ts:15-17`](../src/renderer/hooks/useBatchConversion.ts:15-17) |
| `batch-conversion-complete` | Main → Renderer | 배치 변환 완료 | [`useBatchConversion.ts:19-24`](../src/renderer/hooks/useBatchConversion.ts:19-24) |
| `merge-conversion-progress` | Main → Renderer | 병합 변환 진행률 | [`useMergeConversion.ts:15-17`](../src/renderer/hooks/useMergeConversion.ts:15-17) |
| `merge-conversion-complete` | Main → Renderer | 병합 변환 완료 | [`useMergeConversion.ts:19-24`](../src/renderer/hooks/useMergeConversion.ts:19-24) |

## 개발/프로덕션 차이

| 항목 | 개발 환경 | 프로덕션 환경 |
|------|------------|----------------|
| **Python 경로** | 시스템 `python3` (macOS/Linux) / `python` (Windows) | 시스템 `python3` (macOS/Linux) / `python` (Windows) |
| **Python 스크립트** | `src/python/convert.py` | `resources/python/convert.py` |
| **렌더러 로드** | `http://localhost:3000` (Vite dev server) | `dist/renderer/index.html` |
| **Node Integration** | `true` | `false` |
| **Web Security** | `false` (파일 다이얼로그용) | `true` |
| **DevTools** | 자동 열림 | 닫혀 있음 |

**참고**: 개발 및 프로덕션 환경 모두 시스템 Python을 사용합니다. 사용자는 시스템에 Python 3+와 Pandoc이 설치되어 있어야 합니다.

## 보안 설정

### Renderer Security
```typescript
webPreferences: {
  preload: join(__dirname, '../preload/index.js'),
  nodeIntegration: isDev,      // Dev에서만 true
  contextIsolation: true,       // 항상 true
  webSecurity: !isDev,         // Dev에서만 false
  sandbox: false,               // macOS 파일 다이얼로그용
}
```

### Context Isolation
- `contextIsolation: true`: Renderer에서 직접 Node.js 접근 방지
- 모든 Main 기능은 `window.electronAPI` 통해 접근

## 의존성 관계

### Main Process
```
main.ts
  → ipc/handlers.ts
      → ipc/channels.ts
      → python/converter.ts
```

### Preload Script
```
preload/index.ts
  → ipc/channels.ts
```

### Renderer Process
```
App.tsx
  → components/* (FileUpload, ConversionOptions, etc.)
  → hooks/* (useConversion, useBatchConversion, etc.)
  → context/ThemeContext.tsx
  → types/index.ts
```

## 관련 문서

- [개요](01-Overview.md) - 프로젝트 개요 및 기능
- [데이터 모델](05-Data-Models.md) - 타입 정의
- [API/인터페이스](04-API-Interface.md) - IPC 채널 상세
- [모듈 레퍼런스](03-Module-Reference/) - 각 모듈 상세

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2024-12-29 | 1.0 | 초기 아키텍처 문서 작성 |