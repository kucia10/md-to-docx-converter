# usePreview

## 요약
- **책임**: Markdown 미리보기 관리 (단일 파일/병합 파일 모드, 파일 전환)
- **주요 사용자/호출자**: [`MarkdownPreview.tsx`](../../../../../../src/renderer/components/MarkdownPreview.tsx), [`App.tsx`](../../../../../../src/renderer/App.tsx)
- **핵심 엔트리포인트**: [`usePreview(selectedFiles)`](../../../../../../src/renderer/hooks/usePreview.ts:4)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Custom Hooks (Presentation Layer)
- **상위/하위 의존**:
  - 의존: `types` ([`FileItem`](../../../../../../src/renderer/types/index.ts))
  - 사용: `MarkdownPreview` 컴포넌트, 파일 전환 UI 컨트롤
- **런타임 플로우에서의 역할**: 파일 선택 → 내용 렌더링 → 미리보기 모드 전환

## 퍼블릭 인터페이스

### 반환 값
```typescript
{
  previewContent: string,           // 현재 미리보기 내용
  selectedFileIndex: number,         // 선택된 파일 인덱스
  isCombinedPreview: boolean,       // 병합 미리보기 모드 여부
  selectFileForPreview: (index: number) => void,
  toggleCombinedPreview: () => void,
  selectNextFile: () => void,
  selectPreviousFile: () => void,
  getCurrentFile: () => FileItem | null
}
```

### selectFileForPreview
- **시그니처**: `selectFileForPreview(index) → void`
- **입력**: `index`: 미리보기할 파일의 인덱스
- **출력**: 없음 (내부 상태 업데이트)
- **에러/예외**: 범위 벗어난 인덱스 무시
- **부작용**: `selectedFileIndex` 업데이트, `previewContent` 변경
- **예시**:
```typescript
// 첫 번째 파일 미리보기
selectFileForPreview(0)

// 다음 파일 미리보기
selectFileForPreview(selectedFileIndex + 1)
```

### toggleCombinedPreview
- **시그니처**: `toggleCombinedPreview() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 없음
- **부작용**: `isCombinedPreview` 토글, `previewContent` 재계산

### selectNextFile
- **시그니처**: `selectNextFile() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 마지막 파일에서 실행 시 무시됨
- **부작용**: `selectedFileIndex` + 1

### selectPreviousFile
- **시그니처**: `selectPreviousFile() → void`
- **입력**: 없음
- **출력**: 없음
- **에러/예외**: 첫 번째 파일에서 실행 시 무시됨
- **부작용**: `selectedFileIndex` - 1

### getCurrentFile
- **시그니처**: `getCurrentFile() → FileItem | null`
- **입력**: 없음
- **출력**: 현재 선택된 `FileItem` 또는 `null`
- **에러/예외**: 없음
- **부작용**: 없음 (순수 getter)

## 내부 동작

### 주요 플로우
1. **미리보기 내용 계산**: [`useEffect`](../../../../../../src/renderer/hooks/usePreview.ts:9)
   - `isCombinedPreview`가 true: 모든 파일 병합 내용 생성
   - `isCombinedPreview`가 false: 단일 파일 내용

2. **병합 미리보기 내용 생성**:
   - 각 파일 사이에 `\n\n---\n\n# {filename}\n\n` 구분자 삽입
   - 파일 확장자 제거: `file.name.replace(/\.[^/.]+$/, '')`
   - 첫 번째 파일은 구분자 없이 시작

3. **마지막 파일 자동 선택**: [`useEffect`](../../../../../../src/renderer/hooks/usePreview.ts:32)
   - `selectedFiles.length` 변경 시 자동으로 마지막 파일 선택
   - 단일 파일 모드(`!isCombinedPreview`)에서만 동작

4. **파일 전환**:
   - 인덱스 범위 검증 (0 ≤ index < `selectedFiles.length`)
   - `previewContent`는 `useEffect`에서 자동 업데이트

### 핵심 규칙/알고리즘
- **병합 구분자**: `\n\n---\n\n# {filename}\n\n` (각 파일 사이에 삽입)
- **첫 파일 처리**: 구분자 없이 바로 내용 시작
- **인덱스 유효성**: 범위 벗어난 인덱스는 무시
- **자동 포커스**: 새 파일 추가 시 마지막 파일 자동 선택

### 엣지케이스
- 빈 파일 목록: `previewContent` 빈 문자열, `getCurrentFile()` null 반환
- 파일 내용 비어있음: 빈 문자열 표시
- 단일 파일 병합 모드: 구분자 없이 단일 내용만 표시
- 빈 내용 파일: 섹션 헤더만 표시

### 미리보기 모드 비교
| 특징 | 단일 파일 모드 | 병합 파일 모드 |
|------|----------------|----------------|
| `isCombinedPreview` | false | true |
| 내용 | 현재 선택된 파일 하나 | 모든 파일 병합 |
| 파일 전환 | 드롭다운/버튼으로 전환 | 전환 없음 |
| 구분자 | 없음 | 각 파일 사이 `---` |
| 섹션 헤더 | 없음 | 각 파일명으로 헤더 추가 |
| 사용 사례 | 개별 파일 확인 | 병합 결과 미리보기 |

## 데이터/모델

### Preview State
```typescript
{
  previewContent: string,       // 현재 렌더링할 Markdown 내용
  selectedFileIndex: number,   // 단일 모드: 현재 파일 인덱스
  isCombinedPreview: boolean    // true: 병합 모드, false: 단일 모드
}
```

### Combined Content Format
```markdown
{file1_content}

---

# {file2_name_without_extension}

{file2_content}

---

# {file3_name_without_extension}

{file3_content}
```

## 설정/환경변수
- 사용하지 않음 (런타임에만 동작)

## 의존성

### 내부 모듈
- [`types/index.ts`](../../../../../../src/renderer/types/index.ts): `FileItem`

### 외부 라이브러리/서비스
- React: `useState`, `useCallback`, `useEffect`
- react-markdown: (사용 컴포넌트에서 렌더링)

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 훅 단위 테스트 필요
- 테스트 시나리오:
  - 단일 파일 미리보기
  - 병합 파일 미리보기
  - 파일 전환 (다음/이전)
  - 빈 파일 목록 처리
  - 빈 내용 파일 처리
  - 모드 전환 (단일 ↔ 병합)
  - 자동 포커스 (새 파일 추가)

## 운영/관찰가능성

### 로그
- 없음

### 메트릭/트레이싱
- 없음 (UI 상태 관리 훅)

### 알람 포인트
- `selectedFiles.length === 0`: "파일을 선택해주세요" 메시지
- `previewContent === ''`: "미리보기할 내용이 없습니다" 메시지
- `isCombinedPreview`: 모드에 따라 다른 UI 컨트롤 표시

## MarkdownPreview 컴포넌트와의 통합
이 훅은 `MarkdownPreview.tsx` 컴포넌트에서 사용:
- `previewContent`: `react-markdown`으로 렌더링
- `isCombinedPreview`: 모드 토글 버튼 표시/숨김
- `selectNextFile`/`selectPreviousFile`: 화살표 버튼으로 파일 전환
- `selectedFileIndex`: 드롭다운으로 파일 선택

## 병합 미리보기와 실제 병합 변환의 관계
| 항목 | 병합 미리보기 | 실제 병합 변환 |
|------|---------------|----------------|
| 목적 | UI 미리보기 | DOCX 파일 생성 |
| 구분자 | `---\n\n# {filename}\n\n` | `---\n\n# {filename}\n\n` + `\newpage` |
| Pandoc 사용 | 없음 | 사용 |
| 페이지 구분 | 없음 | 새 페이지로 구분 |
| 인덱스 검색 | 없음 | `index_files` 옵션 지원 |

## 파일 인덱싱 (Python 측)
병합 변환 시 Python 스크립트는 다음을 추가로 수행:
1. 각 파일 시작 부분에 `{#filename}` 앵커 추가
2. Pandoc `--toc` 옵션으로 목차 생성
3. 앵커를 통해 목차에서 파일로 이동 가능

## 변경 이력(선택)
- v1.0: 초기 구현