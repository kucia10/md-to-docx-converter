# useConversion

## 요약
- **책임**: 단일 파일 변환 상태 관리 및 IPC 통신
- **주요 사용자/호출자**: [`App.tsx`](../../../../../src/renderer/App.tsx), 변환 컴포넌트
- **핵심 엔트리포인트**: [`useConversion()`](../../../../../src/renderer/hooks/useConversion.ts:5)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Custom Hooks (State Management Layer)
- **상위/하위 의존**: 
  - 의존: `types` ([`ConversionOptions`](../../../../../src/renderer/types/index.ts)), `window.electronAPI`
  - 사용: React 컴포넌트 (단일 변환 모드)
- **런타임 플로우에서의 역할**: 단일 파일 변환 시작 → 진행률 추적 → 완료/오류 처리

## 퍼블릭 인터페이스

### 반환 값
```typescript
{
  isConverting: boolean,           // 변환 중 여부
  conversionProgress: ConversionProgress | null,  // 진행률 정보
  conversionError: string | null,  // 오류 메시지
  conversionResult: ConversionResult | null,  // 변환 결과
  startConversion: (inputPath: string, outputPath: string, options: ConversionOptions) => Promise<void>,
  cancelConversion: () => void,
  resetConversion: () => void
}
```

### startConversion
- **시그니처**: `startConversion(inputPath, outputPath, options) → Promise<void>`
- **입력**:
  - `inputPath`: 변환할 Markdown 파일 경로
  - `outputPath`: 변환 결과 DOCX 파일 경로
  - `options`: [`ConversionOptions`](../../../../../src/renderer/types/index.ts) (폰트, 여백, 페이지 설정 등)
- **출력**: 없음 (비동기 실행)
- **에러/예외**: IPC 통신 실패 시 `conversionError`에 에러 메시지 저장
- **부작용**: `isConverting`을 true로 설정, IPC 호출
- **예시**:
```typescript
await startConversion('/path/to/file.md', '/path/to/output.docx', {
  fontFamily: 'Arial',
  fontSize: 12,
  marginTop: 2.54,
  // ... 기타 옵션
})
```

### cancelConversion
- **시그니처**: `cancelConversion() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: 변환 취소 IPC 호출, 상태 초기화

### resetConversion
- **시그니처**: `resetConversion() → void`
- **입력**: 없음
- **춓력**: 없음
- **에러/예외**: 없음
- **부작용**: 모든 상태 초기화

## 내부 동작

### 주요 플로우
1. **초기화**: `useEffect`로 IPC 이벤트 리스너 등록
   - [`onConversionProgress`](../../../../../src/renderer/hooks/useConversion.ts:15): 진행률 수신
   - [`onConversionComplete`](../../../../../src/renderer/hooks/useConversion.ts:19): 완료 수신
   - [`onConversionError`](../../../../../src/renderer/hooks/useConversion.ts:26): 오류 수신

2. **변환 시작**: `startConversion()` 호출
   - 상태 초기화 (`isConverting: true`, 초기 진행률 설정)
   - IPC invoke (`start-conversion` 채널)
   - Main Process로 전달

3. **진행률 업데이트**: Main Process로부터 `conversion-progress` 이벤트 수신
   - `setConversionProgress()`로 상태 업데이트

4. **완료/오류 처리**: Main Process로부터 완료/오류 이벤트 수신
   - 완료: `setConversionResult()`, `isConverting: false`
   - 오류: `setConversionError()`, `isConverting: false`

5. **정리**: 컴포넌트 언마운트 시 `removeAllListeners()` 호출

### 핵심 규칙/알고리즘
- 초기 진행률: `{ currentFile: 0, totalFiles: 1, currentFileName: '', percentage: 0, stage: 'preparing' }`
- 에러 발생 시 i18next 번역 사용: `t('errors.singleConversionError')`

### 엣지케이스
- 변환 중 `startConversion()` 재호출: 이전 변환 취소 후 새 변환 시작
- IPC 연결 실패: 에러 메시지 표시
- 파일 읽기 실패: Main Process에서 처리 후 오류 이벤트 전송

## 데이터/모델

### ConversionProgress
```typescript
{
  currentFile: number,      // 현재 처리 중인 파일 인덱스
  totalFiles: number,       // 전체 파일 수 (단일 변환은 항상 1)
  currentFileName: string,   // 현재 파일명
  percentage: number,       // 진행률 백분율 (0-100)
  stage: 'preparing' | 'converting' | 'finalizing'
}
```

### ConversionResult
```typescript
{
  success: boolean,
  outputPath?: string,
  error?: string
}
```

## 설정/환경변수
- 사용하지 않음 (런타임에만 동작)

## 의존성

### 내부 모듈
- [`types/index.ts`](../../../../../src/renderer/types/index.ts): `ConversionOptions`, `ConversionProgress`, `ConversionResult`

### 외부 라이브러리/서비스
- React: `useState`, `useCallback`, `useEffect`
- i18next: `useTranslation()`
- Electron: `window.electronAPI` (Preload 스크립트에서 노출)

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 훅 단위 테스트 필요

## 운영/관찰가능성

### 로그
- 파일 읽기 실패: `console.error('Error reading file:', file.name, error)`

### 메트릭/트레이싱
- 변환 시간 추적 없음 (Main Process에서 수행)
- 진행률 퍼센트로 사용자에게 피드백

### 알람 포인트
- `conversionError`가 null이 아닐 때 UI에 오류 표시
- `isConverting`이 true일 때 UI 로딩 상태 표시

## 관련 IPC 채널
- Request: `start-conversion`, `cancel-conversion`
- Event: `conversion-progress`, `conversion-complete`, `conversion-error`

## 변경 이력(선택)
- v1.0: 초기 구현