# MarkdownPreview

## 요약
- **책임**: Markdown 내용 렌더링 및 미리보기 표시 UI
- **주요 사용자/호출자**: [`App.tsx`](../../../../../src/renderer/App.tsx), `usePreview` 훅
- **핵심 엔트리포인트**: [`MarkdownPreview`](../../../../../src/renderer/components/MarkdownPreview.tsx:14)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Presentation Layer (UI Components)
- **상위/하위 의존**:
  - 의존: `types` ([`ConversionOptions`](../../../../../src/renderer/types/index.ts), `FileItem`), `react-markdown`
  - 사용: 미리보기 패널
- **런타임 플로우에서의 역할**: 파일 선택 → 내용 렌더링 → 옵션에 따라 스타일 적용

## 퍼블릭 인터페이스

### Props
```typescript
interface MarkdownPreviewProps {
  content: string                          // 렌더링할 Markdown 내용
  options: ConversionOptionsType            // 변환 옵션 (폰트, 줄 간격 등)
  selectedFiles?: FileItem[]               // 선택된 파일 목록
  isCombinedPreview?: boolean              // 병합 미리보기 모드 여부
  onToggleCombinedPreview?: () => void     // 병합 모드 토글 핸들러
}
```

## 내부 동작

### 주요 플로우
1. **스타일 계산**: [`previewStyle`](../../../../../src/renderer/components/MarkdownPreview.tsx:23)
   - 폰트 패밀리: `options.fontFamily`
   - 폰트 크기: `options.fontSize` (pt 단위)
   - 줄 간격: `options.lineHeight`

2. **빈 내용 처리**: `!content`인 경우
   - 비어있음 메시지 표시
   - 아이콘 + 안내 문구

3. **헤더 렌더링**:
   - 미리보기 타이틀
   - 다중 파일 선택 시 병합 모드 토글 체크박스

4. **Markdown 렌더링**: [`ReactMarkdown`](../../../../../src/renderer/components/MarkdownPreview.tsx:67) 사용
   - 사용자 정의 컴포넌트로 스타일 적용
   - 옵션에 따라 스타일 동적 적용

5. **다크 모드 지원**: `dark:` 클래스로 다크 모드 스타일

### 핵심 규칙/알고리즘
- **스타일 적용**: `useMemo`로 옵션 변경 시만 재계산
- **병합 모드**: `selectedFiles.length > 1`일 때만 토글 표시
- **인라인 코드 vs 코드 블록**: `className`에 `language-` 포함 여부로 구분
- **이미지**: `loading="lazy"`로 지연 로딩

### Markdown 요소별 커스텀 스타일

| 요소 | 스타일 | 다크 모드 |
|------|--------|-----------|
| `h1` | `text-3xl font-bold mb-4 pb-2 border-b` | `dark:text-gray-100` |
| `h2` | `text-2xl font-semibold mt-6 mb-3` | `dark:text-gray-200` |
| `h3` | `text-xl font-medium mt-4 mb-2` | `dark:text-gray-200` |
| `p` | `text-gray-700 mb-4` | `dark:text-gray-300` |
| `code` (인라인) | `bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600` | `dark:bg-gray-700 dark:text-pink-400` |
| `pre` | `bg-gray-900 p-4 rounded-lg overflow-x-auto` | `dark:bg-gray-950 dark:text-gray-200` |
| `blockquote` | `border-l-4 border-gray-300 pl-4 italic` | `dark:border-gray-600 dark:text-gray-400` |
| `ul` | `mb-4 pl-6 list-disc` | - |
| `ol` | `mb-4 pl-6 list-decimal` | - |
| `li` | `mb-1` | - |
| `table` | `w-full border-collapse border mb-4` | - |
| `th` | `border px-3 py-2 bg-gray-100 font-semibold` | `dark:bg-gray-700 dark:border-gray-600` |
| `td` | `border px-3 py-2 text-left` | `dark:border-gray-600` |
| `a` | `text-primary-600 hover:text-primary-700 underline` | - |
| `img` | `max-w-full h-auto rounded-lg shadow-sm my-4` | - |
| `hr` | `border-gray-300 my-6` | `dark:border-gray-600` |

### 엣지케이스
- `content` 빈 문자열: 비어있음 메시지 표시
- 단일 파일: 병합 모드 토글 숨김
- 인라인 코드: `className`에 `language-`가 없으면 인라인으로 처리
- 외부 링크: `target="_blank" rel="noopener noreferrer"` 보안 설정

## 데이터/모델

### 스타일 계산
```typescript
const previewStyle = {
  fontFamily: options.fontFamily || 'Arial, sans-serif',
  fontSize: `${options.fontSize || 12}pt`,
  lineHeight: options.lineHeight || 1.5,
}
```

## 설정/환경변수
- 사용하지 않음 (props로만 전달)

## 의존성

### 내부 모듈
- [`types/index.ts`](../../../../../src/renderer/types/index.ts): `ConversionOptions`, `FileItem`

### 외부 라이브러리/서비스
- React: `React.FC`, `useMemo`
- i18next: `useTranslation()`
- react-markdown: `ReactMarkdown` (Markdown 렌더링 엔진)
- Tailwind CSS: 스타일링

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 컴포넌트 테스트 필요
- 테스트 시나리오:
  - 빈 내용 렌더링
  - 단일 파일 미리보기
  - 병합 모드 토글
  - 다양한 Markdown 요소 렌더링 (h1-h6, p, ul, ol, table, code 등)
  - 다크 모드 스타일 적용
  - 폰트/줄 간격 옵션 변경
  - 인라인 코드 vs 코드 블록 구분
  - 외부 링크 클릭
  - 이미지 렌더링

## 운영/관찰가능성

### 로그
- 없음 (순수 UI 컴포넌트)

### 메트릭/트레이싱
- 없음

### 알람 포인트
- `!content`: 비어있음 메시지 표시
- `isCombinedPreview`: 체크박스 표시/숨김

## 스타일링 (Tailwind CSS)

### 컨테이너 구조
```tsx
<div className="flex flex-col h-full">
  {/* Header */}
  <div className="px-6 py-3 border-b bg-gray-50">
    <span>미리보기</span>
    <label>병합 모드 체크박스</label>
  </div>
  
  {/* Content */}
  <div className="flex-1 overflow-y-auto bg-white">
    <div className="markdown-preview max-w-4xl mx-auto py-8 px-6">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  </div>
</div>
```

### 다크 모드 지원
- 대부분의 텍스트 요소: `dark:text-gray-XXX`
- 배경: `dark:bg-gray-XXX`
- 경계선: `dark:border-gray-XXX`

## react-markdown 컴포넌트 사용

### 커스텀 렌더링
`components` prop을 사용하여 각 요소를 커스터마이징:
```tsx
<ReactMarkdown components={{
  h1: ({ children }) => <h1 className="...">{children}</h1>,
  p: ({ children }) => <p className="...">{children}</p>,
  // ... 기타 요소
}}>
  {content}
</ReactMarkdown>
```

### 인라인 코드 식별
```tsx
code: ({ className, children }) => {
  const isInline = !className?.includes('language-')
  return isInline ? <code className="...">{children}</code> 
                : <code className="block-code">{children}</code>
}
```

## 관련 컴포넌트/훅
- [`usePreview`](../hooks/usePreview.md): 미리보기 상태 관리
- [`ConversionOptions`](./ConversionOptions.md): 변환 옵션 설정

## 제한사항
- 수학 수식 (LaTeX) 지원 없음
- 다이어그램 (Mermaid, PlantUML 등) 지원 없음
- 테마 구문 강조 없음 (단순 코드 블록)

## 향후 개선 가능성
- `react-syntax-highlighter`로 코드 하이라이팅 추가
- `rehype-katex`로 수학 수식 렌더링
- `remark-gfm`으로 GitHub Flavored Markdown 확장
- Mermaid 다이어그램 지원

## 변경 이력(선택)
- v1.0: 초기 구현