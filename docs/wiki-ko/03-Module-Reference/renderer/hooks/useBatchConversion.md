# useBatchConversion

## 요약
- **책임**: 배치 파일 변환(다중 파일 일괄 변환) 상태 관리 및 IPC 통신
- **주요 사용자/호출자**: [`App.tsx`](../../../../../src/renderer/App.tsx), 배치 변환 컴포넌트
- **핵심 엔트리포인트**: [`useBatchConversion()`](../../../../../src/renderer/hooks/useBatchConversion.ts:5)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Custom Hooks (State Management Layer)
- **상위/하위 의존**:
  - 의존: `types` ([`ConversionOptions`](../../../../../src/renderer/types/index.ts)), `window.electronAPI`
  - 사용: React 컴포넌트 (배치 변환 모드)
- **런타임 플로우에서의 역할**: 다중 파일 변환 시작 → 각 파일별 진행률 추적 → 완료/오류 처리

## 퍼블릭 인터페이스

### 반환 값
```typescript
{
  isConverting: boolean,           // 변환 중 여부
  batchProgress: BatchConversionProgress | null,  // 배치 진행률 정보
  batchError: string | null,       // 오류 메시지
  batchResult: BatchConversionResult | null,    // 배치 변환 결과
  startBatchConversion: (inputFiles: string[], outputDirectory: string, options: ConversionOptions) => Promise<void>,
  cancelBatchConversion: () => void,
  resetBatchConversion: () => void
}
```

### startBatchConversion
- **시그니처**: `startBatchConversion(inputFiles, outputDirectory, options) → Promise<void>`
- **입력**:
  - `inputFiles`: 변환할 Markdown 파일 경로 배열
  - `outputDirectory`: 결과 파일 저장 디렉터리 경로
  - `options`: [`ConversionOptions`](../../../../../src/renderer/types/index.ts) (공통 변환 옵션)
- **출력**: 없음 (비동기 실행)
- **에러/예외**: IPC 통신 실패 시 `batchError`에 에러 메시지 저장
- **부작용**: `isConverting`을 true로 설정, IPC 호출
- **예시**:
```typescript
await startBatchConversion(
  ['/path/to/file1.md', '/path/to/file2.md'],
  '/path/to/output/dir',
  { fontFamily: 'Arial', fontSize: 12, marginTop: 2.54 }
)
```

### cancelBatchConversion
- **시그니처**: `cancelBatchConversion() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: 변환 취소 IPC 호출, 상태 초기화

### resetBatchConversion
- **시그니처**: `resetBatchConversion() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: 모든 상태 초기화

## 내부 동작

### 주요 플로우
1. **초기화**: `useEffect`로 IPC 이벤트 리스너 등록
   - [`onBatchConversionProgress`](../../../../../src/renderer/hooks/useBatchConversion.ts:15): 배치 진행률 수신
   - [`onBatchConversionComplete`](../../../../../src/renderer/hooks/useBatchConversion.ts:19): 완료 수신

2. **배치 변환 시작**: `startBatchConversion()` 호출
   - 상태 초기화 (`isConverting: true`, 초기 진행률 설정)
   - `processedFiles` 빈 배열, `errors` 빈 배열 초기화
   - IPC invoke (`start-batch-conversion` 채널)
   - Main Process로 전달

3. **진행률 업데이트**: Main Process로부터 `batch-conversion-progress` 이벤트 수신
   - `setBatchProgress()`로 상태 업데이트
   - `processedFiles`: 성공적으로 처리된 파일 목록
   - `errors`: 처리 중 발생한 오류 목록

4. **완료/오류 처리**: Main Process로부터 완료 이벤트 수신
   - `setBatchResult()`로 결과 저장
   - `isConverting: false`

5. **정리**: 컴포넌트 언마운트 시 `removeAllListeners()` 호출

### 핵심 규칙/알고리즘
- 초기 진행률: `{ currentFile: 0, totalFiles: inputFiles.length, currentFileName: '', percentage: 0, status: 'converting', processedFiles: [], errors: [] }`
- 개별 파일 오류는 `errors` 배열에 누적하며 전체 배치 변환은 계속 진행
- 에러 발생 시 i18next 번역 사용: `t('errors.generalConversionError')`

### 엣지케이스
- 빈 배열 전달: Main Process에서 처리 후 오류 이벤트 전송
- 일부 파일 변환 실패: 나머지 파일은 계속 변환, 결과에 성공/실패 목록 포함
- 변환 중 `startBatchConversion()` 재호출: 이전 변환 취소 후 새 변환 시작

## 데이터/모델

### BatchConversionProgress
```typescript
{
  currentFile: number,        // 현재 처리 중인 파일 인덱스
  totalFiles: number,         // 전체 파일 수
  currentFileName: string,    // 현재 파일명
  percentage: number,         // 전체 진행률 백분율 (0-100)
  status: 'converting' | 'completed',
  processedFiles: string[],   // 성공적으로 처리된 파일 경로 목록
  errors: string[]            // 발생한 에러 메시지 목록
}
```

### BatchConversionResult
```typescript
{
  success: boolean,
  totalFiles: number,
  successCount: number,
  failedFiles: Array<{ path: string, error: string }>
}
```

## 설정/환경변수
- 사용하지 않음 (런타임에만 동작)

## 의존성

### 내부 모듈
- [`types/index.ts`](../../../../../src/renderer/types/index.ts): `ConversionOptions`, `BatchConversionProgress`, `BatchConversionResult`

### 외부 라이브러리/서비스
- React: `useState`, `useCallback`, `useEffect`
- i18next: `useTranslation()`
- Electron: `window.electronAPI` (Preload 스크립트에서 노출)

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 훅 단위 테스트 필요

## 운영/관찰가능성

### 로그
- 파일 읽기 실패: Main Process에서 처리 후 오류 이벤트로 전송

### 메트릭/트레이싱
- 전체 진행률 백분율로 사용자에게 피드백
- `processedFiles.length` / `totalFiles`로 완료 비율 계산 가능

### 알람 포인트
- `batchError`가 null이 아닐 때 UI에 오류 표시
- `isConverting`이 true일 때 UI 로딩 상태 표시
- 일부 파일 실패 시 `failedFiles` 목록 표시

## 관련 IPC 채널
- Request: `start-batch-conversion`, `cancel-conversion`
- Event: `batch-conversion-progress`, `batch-conversion-complete`

## useConversion과의 차이점
| 특징 | useConversion | useBatchConversion |
|------|---------------|---------------------|
| 파일 수 | 단일 파일 | 다중 파일 |
| 진행률 | 단일 파일 진행률 | 전체 진행률 + 개별 파일 진행률 |
| 결과 | 단일 파일 성공/실패 | 성공/실패 파일 목록 |
| 출력 경로 | 단일 파일 경로 | 디렉터리 경로 |

## 변경 이력(선택)
- v1.0: 초기 구현