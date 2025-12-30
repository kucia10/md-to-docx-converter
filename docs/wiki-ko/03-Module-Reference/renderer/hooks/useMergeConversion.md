# useMergeConversion

## 요약
- **책임**: 병합 변환(다중 파일을 단일 DOCX로 병합) 상태 관리 및 IPC 통신
- **주요 사용자/호출자**: [`App.tsx`](../../../../../../src/renderer/App.tsx), 병합 변환 컴포넌트
- **핵심 엔트리포인트**: [`useMergeConversion()`](../../../../../../src/renderer/hooks/useMergeConversion.ts:5)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Custom Hooks (State Management Layer)
- **상위/하위 의존**:
  - 의존: `types` ([`ConversionOptions`](../../../../../../src/renderer/types/index.ts)), `window.electronAPI`
  - 사용: React 컴포넌트 (병합 변환 모드)
- **런타임 플로우에서의 역할**: 다중 파일 병합 시작 → 진행률 추적 → 단일 DOCX 생성 → 완료/오류 처리

## 퍼블릭 인터페이스

### 반환 값
```typescript
{
  isConverting: boolean,           // 변환 중 여부
  mergeProgress: MergeConversionProgress | null,  // 병합 진행률 정보
  mergeError: string | null,       // 오류 메시지
  mergeResult: MergeConversionResult | null,    // 병합 변환 결과
  startMergeConversion: (inputFiles: string[], outputPath: string, options: ConversionOptions) => Promise<void>,
  cancelMergeConversion: () => void,
  resetMergeConversion: () => void
}
```

### startMergeConversion
- **시그니처**: `startMergeConversion(inputFiles, outputPath, options) → Promise<void>`
- **입력**:
  - `inputFiles`: 병합할 Markdown 파일 경로 배열 (순서 중요)
  - `outputPath`: 병합 결과 DOCX 파일 경로
  - `options`: [`ConversionOptions`](../../../../../../src/renderer/types/index.ts) (공통 변환 옵션)
- **출력**: 없음 (비동기 실행)
- **에러/예외**: IPC 통신 실패 시 `mergeError`에 에러 메시지 저장
- **부작용**: `isConverting`을 true로 설정, IPC 호출
- **예시**:
```typescript
await startMergeConversion(
  ['/path/to/intro.md', '/path/to/chapter1.md', '/path/to/chapter2.md'],
  '/path/to/merged.docx',
  { fontFamily: 'Arial', fontSize: 12, marginTop: 2.54 }
)
```

### cancelMergeConversion
- **시그니처**: `cancelMergeConversion() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: 변환 취소 IPC 호출, 상태 초기화

### resetMergeConversion
- **시그니처**: `resetMergeConversion() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: 모든 상태 초기화

## 내부 동작

### 주요 플로우
1. **초기화**: `useEffect`로 IPC 이벤트 리스너 등록
   - [`onMergeConversionProgress`](../../../../../../src/renderer/hooks/useMergeConversion.ts:15): 병합 진행률 수신
   - [`onMergeConversionComplete`](../../../../../../src/renderer/hooks/useMergeConversion.ts:19): 완료 수신

2. **병합 변환 시작**: `startMergeConversion()` 호출
   - 상태 초기화 (`isConverting: true`, 초기 진행률 설정)
   - 초기 상태: `status: 'preparing'`
   - IPC invoke (`start-merge-conversion` 채널)
   - Main Process로 전달

3. **진행률 업데이트**: Main Process로부터 `merge-conversion-progress` 이벤트 수신
   - `setMergeProgress()`로 상태 업데이트
   - `status`: 'preparing' → 'merging' → 'converting'

4. **완료/오류 처리**: Main Process로부터 완료 이벤트 수신
   - `setMergeResult()`로 결과 저장
   - `isConverting: false`

5. **정리**: 컴포넌트 언마운트 시 `removeAllListeners()` 호출

### 핵심 규칙/알고리즘
- 초기 진행률: `{ currentFile: 0, totalFiles: inputFiles.length, currentFileName: '', percentage: 0, status: 'preparing' }`
- 파일 순서가 중요: 사용자가 드래그 앤 드롭으로 조정한 순서대로 병합
- 에러 발생 시 i18next 번역 사용: `t('errors.generalConversionError')`

### 병합 변환의 특별한 동작
1. **Python 측**: [`convert.py`](../../../../../../src/python/convert.py)의 `merge_files()` 함수
2. **파일 구분**: 각 파일 사이에 `---\n\n# {filename}\n\n` 구분자 삽입
3. **페이지 구분**: LaTeX `\newpage` 명령으로 각 파일을 새 페이지에서 시작
4. **임시 파일**: 병합된 Markdown을 임시 파일로 저장 후 Pandoc으로 변환
5. **정리**: 변환 후 임시 파일 삭제

### 엣지케이스
- 빈 배열 전달: Main Process에서 처리 후 오류 이벤트 전송
- 단일 파일 전달: 병합 없이 단일 변환 수행
- 파일 읽기 실패: 전체 병합 실패, 오류 이벤트 전송
- 변환 중 `startMergeConversion()` 재호출: 이전 변환 취소 후 새 변환 시작

## 데이터/모델

### MergeConversionProgress
```typescript
{
  currentFile: number,        // 현재 처리 중인 파일 인덱스
  totalFiles: number,         // 전체 파일 수
  currentFileName: string,    // 현재 파일명
  percentage: number,         // 전체 진행률 백분율 (0-100)
  status: 'preparing' | 'merging' | 'converting'
}
```

### MergeConversionResult
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
- [`types/index.ts`](../../../../../../src/renderer/types/index.ts): `ConversionOptions`, `MergeConversionProgress`, `MergeConversionResult`

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
- `currentFile` / `totalFiles`로 파일 병합 진행 상황 표시

### 알람 포인트
- `mergeError`가 null이 아닐 때 UI에 오류 표시
- `isConverting`이 true일 때 UI 로딩 상태 표시
- 'preparing' → 'merging' → 'converting' 단계별 상태 표시

## 관련 IPC 채널
- Request: `start-merge-conversion`, `cancel-conversion`
- Event: `merge-conversion-progress`, `merge-conversion-complete`

## useConversion/useBatchConversion과의 차이점
| 특징 | useConversion | useBatchConversion | useMergeConversion |
|------|---------------|---------------------|--------------------|
| 파일 수 | 단일 파일 | 다중 파일 | 다중 파일 |
| 결과 | 개별 DOCX 파일 | 개별 DOCX 파일 | 단일 DOCX 파일 |
| 파일 순서 | 해당 없음 | 해당 없음 | 중요 |
| 병합 로직 | 없음 | 없음 | Python `merge_files()` |
| 페이지 구분 | 없음 | 없음 | 새 페이지로 구분 |

## Python 병합 로직 (Backend)
병합 변환은 Python 스크립트의 [`merge_files()`](../../../../../../src/python/convert.py) 함수에서 수행:

```python
def merge_files(input_files, output_file, options):
    merged_content = []
    for i, input_file in enumerate(input_files):
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            if i > 0:
                merged_content.append('---\n')
                merged_content.append(f'# {Path(input_file).stem}\n\n')
            merged_content.append(content)
    
    # 임시 파일 생성 후 Pandoc 변환
    temp_md = create_temp_file('\n\n'.join(merged_content))
    convert(temp_md, output_file, options)
    os.remove(temp_md)
```

## 변경 이력(선택)
- v1.0: 초기 구현