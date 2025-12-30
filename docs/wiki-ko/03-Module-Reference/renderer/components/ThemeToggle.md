# ThemeToggle

## 요약
- **책임**: 테마 전환 버튼 컴포넌트 (라이트/다크/시스템 모드)
- **주요 사용자/호출자**: [`App.tsx`](../../../../../../src/renderer/App.tsx)
- **핵심 엔트리포인트**: [`ThemeToggle`](../../../../../../src/renderer/components/ThemeToggle.tsx:4)

## 아키텍처 내 위치
- **레이어**: Renderer Process - Presentation Layer (UI Components)
- **상위/하위 의존**:
  - 의존: `@/context/ThemeContext`, `i18next`
  - 사용: 앱 헤더, 설정 패널
- **런타임 플로우에서의 역할**: 테마 버튼 클릭 → 다음 테마 순환 → 컨텍스트 업데이트 → 전체 UI 테마 변경

## 퍼블릭 인터페이스

### 반환 값
```typescript
JSX.Element  // 테마 전환 버튼
```

### 테마 순환 순서
```
light → dark → system → light → ...
```

## 내부 동작

### 주요 플로우
1. **아이콘 결정**: [`getIcon()`](../../../../../../src/renderer/components/ThemeToggle.tsx:8)
   - `light`: 해 아이콘 (SVG 원형 태양)
   - `dark`: 달 아이콘 (SVG 초승달)
   - `system`: 컴퓨터 모니터 아이콘 (SVG)

2. **레이블 결정**: [`getLabel()`](../../../../../../src/renderer/components/ThemeToggle.tsx:31)
   - `light`: `t('theme.lightMode')`
   - `dark`: `t('theme.darkMode')`
   - `system`: `t('theme.system')`

3. **테마 순환**: [`cycleTheme()`](../../../../../../src/renderer/components/ThemeToggle.tsx:42)
   - 현재 테마의 인덱스 찾기
   - 다음 테마: `(currentIndex + 1) % themes.length`
   - `setTheme(nextTheme)`로 컨텍스트 업데이트

4. **버튼 렌더링**:
   - 현재 테마 아이콘 표시
   - 테마 이름 텍스트 표시
   - 호버 효과
   - 다크 모드 지원 스타일

### 핵심 규칙/알고리즘
- **테마 배열**: `['light', 'dark', 'system']`
- **순환 로직**: `(currentIndex + 1) % length`로 순환
- **아이콘 크기**: `w-5 h-5` (20px × 20px)
- **버튼 스타일**: `flex items-center gap-2 rounded-lg`

### 테마별 아이콘 SVG

#### Light Mode
```svg
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
</svg>
```

#### Dark Mode
```svg
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
</svg>
```

#### System Mode
```svg
<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
</svg>
```

### 엣지케이스
- 테마 배열이 비어있음: 오류 발생 가능 (코드에는 항상 3개 테마가 있음)
- 초기 렌더링: 컨텍스트에서 초기 테마 값 사용

## 데이터/모델

### Theme 타입
```typescript
type Theme = 'light' | 'dark' | 'system'
```

## 설정/환경변수
- 사용하지 않음 (컨텍스트에서 상태 관리)

## 의존성

### 내부 모듈
- [`@/context/ThemeContext`](../../../../../../src/renderer/context/ThemeContext.tsx): `useTheme()` (테마 상태)

### 외부 라이브러리/서비스
- React: `React.FC`
- i18next: `useTranslation()`
- SVG: 인라인 SVG 아이콘

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 컴포넌트 테스트 필요
- 테스트 시나리오:
  - 초기 렌더링
  - 테마 순환 (light → dark → system → light)
  - 각 테마 아이콘 렌더링
  - 호버 효과
  - 다크 모드 스타일 적용
  - 툴팁 표시

## 운영/관찰가능성

### 로그
- 없음 (순수 UI 컴포넌트)

### 메트릭/트레이싱
- 없음

### 알람 포인트
- 없음

## 스타일링 (Tailwind CSS)

### 버튼
```tsx
<button className="flex items-center gap-2 px-3 py-2 rounded-lg 
  bg-gray-100 dark:bg-gray-800 
  text-gray-700 dark:text-gray-300 
  hover:bg-gray-200 dark:hover:bg-gray-700 
  transition-colors">
  {getIcon()}
  <span className="text-sm font-medium">{getLabel()}</span>
</button>
```

### 아이콘
```tsx
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
```

### 다크 모드 지원
- 배경: `bg-gray-100 dark:bg-gray-800`
- 텍스트: `text-gray-700 dark:text-gray-300`
- 호버: `hover:bg-gray-200 dark:hover:bg-gray-700`

## ThemeContext 연동

### 사용 방법
```tsx
import { useTheme } from '@/context/ThemeContext'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // ... 테마 순환 로직
}
```

### setTheme 호출
```tsx
const cycleTheme = () => {
  const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
  const currentIndex = themes.indexOf(theme)
  const nextTheme = themes[(currentIndex + 1) % themes.length]
  setTheme(nextTheme)
}
```

## i18next 키

### 테마 관련 키
| 키 | 예시 값 |
|-----|---------|
| `theme.lightMode` | Light Mode |
| `theme.darkMode` | Dark Mode |
| `theme.system` | System |
| `theme.currentTheme` | Current Theme |

## 관련 컴포넌트/훅
- [`ThemeContext`](../context/ThemeContext.md): 테마 상태 관리

## UI 레이아웃

### 버튼 구조
```
┌─────────────────────────────────┐
│  [아이콘] [테마 이름]      │
└─────────────────────────────────┘
```

### 클릭 동작
1. 사용자 버튼 클릭
2. 현재 테마에서 다음 테마로 변경
3. 아이콘과 텍스트 업데이트
4. 앱 전체 테마 변경 (ThemeContext 통해)

## 변경 이력(선택)
- v1.0: 초기 구현