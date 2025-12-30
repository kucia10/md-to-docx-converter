# IPC Handlers

## 요약
- **책임**: IPC 채널 핸들러 구현 (파일 다이얼로그, 변환 작업, 앱 작업)
- **주요 사용자/호출자**: Main Process (`main.ts` → `setupIpcHandlers()`), Renderer Process (via Preload)
- **핵심 엔트리포인트**: `setupIpcHandlers()`

## 아키텍처 내 위치
- **레이어**: Main Process / IPC Communication Layer
- **상위 의존**: [`main.ts`](../main-process/main.md) (호출), [`channels.ts`](channels.md) (import)
- **하위 의존**: [`python/converter.ts`](../main-process/python-converter.md)
- **런타임 플로우에서의 역할**: Renderer → Main IPC 요청 처리 → Python 변환 실행 → Renderer에 이벤트 전송

## 퍼블릭 인터페이스

### setupIpcHandlers()
모든 IPC 핸들러를 등록하는 메인 함수

**시그니처**:
```typescript
export function setupIpcHandlers(): void
```

**입력**: 없음

**출력**: 없음 (사이드 이펙트: ipcMain에 핸들러 등록)

**에러/예외**: 없음

**부작용**:
- `PythonConverter` 인스턴스 생성 및 저장
- 모든 IPC 채널 핸들러 등록

**예시**:
```typescript
// main.ts에서 호출
app.whenReady().then(() => {
  createWindow()
  setupIpcHandlers()  // 여기서 호출
})
```

## 내부 동작

### 초기화 로직

```typescript
export function setupIpcHandlers(): void {
  // Python 컨버터 초기화
  pythonConverter = new PythonConverter()
  
  // 파일 다이얼로그 핸들러
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, ...)
  ipcMain.handle(IPC_CHANNELS.SAVE_FILE_DIALOG, ...)
  ipcMain.handle(IPC_CHANNELS.OPEN_DIRECTORY_DIALOG, ...)
  
  // 변환 핸들러
  ipcMain.handle(IPC_CHANNELS.START_CONVERSION, ...)
  ipcMain.handle(IPC_CHANNELS.START_BATCH_CONVERSION, ...)
  ipcMain.handle(IPC_CHANNELS.START_MERGE_CONVERSION, ...)
  
  // 앱 핸들러
  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, ...)
  ipcMain.on(IPC_CHANNELS.QUIT_APP, ...)
}
```

### 핸들러 목록

| 핸들러 | 채널 | 기능 | 라인 |
|--------|--------|------|------|
| 파일 다이얼로그 | `OPEN_FILE_DIALOG` | 파일 선택 다이얼로그 표시 | 21-55 |
| 디렉터리 다이얼로그 | `OPEN_DIRECTORY_DIALOG` | 디렉터리 선택 다이얼로그 | 57-85 |
| 저장 다이얼로그 | `SAVE_FILE_DIALOG` | 저장 다이얼로그 표시 | 87-115 |
| 파일 읽기 | `READ_FILE` | 파일 내용 읽기 | 118-135 |
| 변환 시작 | `START_CONVERSION` | 단일 파일 변환 | 138-163 |
| 배치 변환 시작 | `START_BATCH_CONVERSION` | 다중 파일 일괄 변환 | 166-227 |
| 병합 변환 시작 | `START_MERGE_CONVERSION` | 다중 파일 병합 변환 | 230-280 |
| 버전 조회 | `GET_APP_VERSION` | 앱 버전 조회 | 283-286 |
| 앱 종료 | `QUIT_APP` | 앱 종료 | 289-293 |

### 핵심 규칙/알고리즘

#### 1. macOS 파일 다이얼로그 포커스

```typescript
if (process.platform === 'darwin') {
  app.focus({ steal: true })
}
```

**이유**: macOS GUI 앱에서 파일 다이얼로그가 백그라운드에서 열리는 것을 방지

#### 2. 윈도우 참조 가져오기

```typescript
function getWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0] || null
}
```

**이유**: 다이얼로그의 부모 윈도우를 설정하여 적절한 포커스 관리

#### 3. Python 컨버터 검증

```typescript
if (!pythonConverter) {
  throw new Error('Python converter not initialized')
}
```

**이유**: 초기화 오류 방지, 안전한 변환 실행 보장

### 엣지케이스

| 상황 | 처리 방법 |
|------|----------|
| 파일 다이얼로그 취소 | `canceled: true` 반환 |
| 변환 오류 발생 | `CONVERSION_ERROR` 이벤트 전송 + 예외 throw |
| 배치 변환 중 파일 실패 | 계속 진행, 최종 결과에 오류 포함 |
| 윈도우 없음 | 포커스 윈도우 대신 기본 다이얼로그 표시 |

## 데이터/모델

**관련 타입**:
- [`ConversionOptions`](../../../src/renderer/types/index.ts:10-23) - 변환 옵션
- [`BatchConversionProgress`](../../../src/renderer/types/index.ts:61-69) - 배치 진행률
- [`BatchConversionResult`](../../../src/renderer/types/index.ts:71-78) - 배치 결과
- [`MergeConversionProgress`](../../../src/renderer/types/index.ts:80-86) - 병합 진행률
- [`MergeConversionResult`](../../../src/renderer/types/index.ts:88-94) - 병합 결과

## 설정/환경변수
없음

## 의존성

### 내부 모듈
- [`channels.ts`](channels.md) - IPC 채널 상수
- [`python/converter.ts`](../main-process/python-converter.md) - Python 브릿지 클래스

### 외부 라이브러리/서비스
- `electron` - `ipcMain`, `dialog`, `app`, `BrowserWindow`
- `fs` - 파일 시스템 작업
- `path` - 경로 조작

## 테스트
- **관련 테스트**: 없음 (현재)
- **커버리지/갭**: Main Process 핸들러 테스트 필요

## 운영/관찰가능성

### 로그
```typescript
console.log('[IPC] Setting up IPC handlers...')
console.log('[IPC] OPEN_FILE_DIALOG invoked')
console.log('[IPC] Python converter initialized')
```

**로그 수준**: Info (기본 작업), Error (오류)

## 상세 핸들러 설명

### 파일 다이얼로그 핸들러

#### OPEN_FILE_DIALOG
```typescript
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
  // macOS 포커스 처리
  if (process.platform === 'darwin') {
    app.focus({ steal: true })
  }
  
  const win = getWindow()
  const dialogOptions: Electron.OpenDialogOptions = {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }
  
  return await dialog.showOpenDialog(win || dialog, dialogOptions)
})
```

### 변환 핸들러

#### START_CONVERSION
```typescript
ipcMain.handle(IPC_CHANNELS.START_CONVERSION, async (_event, { inputPath, outputPath, options }) => {
  const result = await pythonConverter.convertMarkdownToDocx(inputPath, outputPath, options)
  
  _event.sender.send(IPC_CHANNELS.CONVERSION_COMPLETE, {
    success: true,
    message: 'Conversion completed successfully',
    outputPath
  })
  
  return result
})
```

#### START_BATCH_CONVERSION
```typescript
ipcMain.handle(IPC_CHANNELS.START_BATCH_CONVERSION, async (event, { inputFiles, outputDirectory, options }) => {
  for (let i = 0; i < inputFiles.length; i++) {
    const inputFile = inputFiles[i]
    const outputPath = path.join(outputDirectory, `${baseName}.docx`)
    
    // 진행률 이벤트 전송
    event.sender.send(IPC_CHANNELS.BATCH_CONVERSION_PROGRESS, {
      currentFile: i + 1,
      totalFiles: inputFiles.length,
      percentage: Math.round(((i + 1) / inputFiles.length) * 100)
    })
    
    try {
      await pythonConverter.convertMarkdownToDocx(inputFile, outputPath, options)
      processedFiles.push(outputPath)
    } catch (error) {
      errors.push({ fileName, error: errorMessage })
    }
  }
  
  // 완료 이벤트 전송
  event.sender.send(IPC_CHANNELS.BATCH_CONVERSION_COMPLETE, { ...result })
})
```

#### START_MERGE_CONVERSION
```typescript
ipcMain.handle(IPC_CHANNELS.START_MERGE_CONVERSION, async (event, { inputFiles, outputPath, options }) => {
  await pythonConverter.mergeFilesToDocx(inputFiles, outputPath, options)
  
  event.sender.send(IPC_CHANNELS.MERGE_CONVERSION_COMPLETE, {
    success: true,
    message: `${totalFiles}개 파일이 하나의 DOCX로 병합되었습니다`,
    outputPath
  })
})
```

### 앱 핸들러

#### QUIT_APP
```typescript
ipcMain.on(IPC_CHANNELS.QUIT_APP, () => {
  if (pythonConverter) {
    pythonConverter.cleanup()  // Python 프로세스 정리
  }
})
```

## 관련 문서

- [IPC Channels](channels.md) - 채널 정의
- [Python Converter](../main-process/python-converter.md) - Python 브릿지
- [API/인터페이스](../../04-API-Interface.md) - API 상세

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 1.0 | 초기 문서 작성 |