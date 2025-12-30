# ThemeContext

## 요약
- **책임**: 애플리케이션 테마 상태 관리 (라이트/다크/시스템 모드)
- **주요 사용자/호출자**: [`App.tsx`](../../../../../../src/renderer/App.tsx), `ThemeToggle` 컴포넌트
- **핵심 엔트리포인트**: [`ThemeProvider`](../../../../../../src/renderer/context/ThemeContext.tsx:13), [`useTheme`](../../../../../../src/renderer/context/ThemeContext.tsx:69)

## 아키텍처 내 위치
- **레이어**: Renderer Process - State Management Layer (React Context)
- **상위/하위 의존**:
  - 의존: React (`createContext`, `useContext`, `useState`, `useEffect`), `localStorage`
  - 사용: 전체 애플리케이션 (전역 테마 상태)
- **런타임 플로우에서의 역할**: 테마 변경 → DOM 클래스 업데이트 → 전체 UI 테마 변경

## 퍼블릭 인터페이스

### Theme 타입
```typescript
type Theme = 'light' | 'dark' | 'system'
```

### ThemeContextType
```typescript
interface ThemeContextType {
  theme: Theme              // 설정된 테마
  setTheme: (theme: Theme) => void  // 테마 설정 함수
  effectiveTheme: 'light' | 'dark'  // 실제 적용된 테마
}
```

### ThemeProvider Props
```typescript
{
  children: ReactNode   // 자식 컴포넌트
}
```

### useTheme 훅 반환값
```typescript
{
  theme: Theme,
  setTheme: (theme: Theme) => void,
  effectiveTheme: 'light' | 'dark'
}
```

## 내부 동작

### 주요 플로우
1. **초기화**: [`ThemeProvider`](../../../../../../src/renderer/context/ThemeContext.tsx:13)
   - `localStorage.getItem('theme')`로 저장된 테마 읽기
   - 없으면 기본값 `'system'`

2. **테마 적용**: [`useEffect`](../../../../../../src/renderer/context/ThemeContext.tsx:20)
   - `document.documentElement`에 클래스 추가/제거
   - `root.classList.remove('light', 'dark')`로 기존 클래스 제거
   - `root.classList.add(themeValue)`로 새 클래스 추가

3. **시스템 테마 감지**:
   - `window.matchMedia('(prefers-color-scheme: dark)')`로 OS 테마 감지
   - `mediaQuery.addEventListener('change', handleChange)`로 테마 변경 감지
   - 테마가 `'system'`일 때만 자동 업데이트

4. **테마 변경**: [`setTheme`](../../../../../../src/renderer/context/ThemeContext.tsx:57)
   - `setThemeState(newTheme)`로 상태 업데이트
   - `localStorage.setItem('theme', newTheme)`로 저장

5. **useTheme 훅**: [`useTheme()`](../../../../../../src/renderer/context/ThemeContext.tsx:69)
   - `useContext(ThemeContext)`로 컨텍스트 값 읽기
   - `undefined`면 에러 던짐

### 핵심 규칙/알고리즘
- **테마 결정 로직**:
  - `theme === 'light'`: 적용 테마 `'light'`
  - `theme === 'dark'`: 적용 테마 `'dark'`
  - `theme === 'system'`: OS 테마에 따름 (`prefers-color-scheme: dark` 여부)

- **DOM 클래스 관리**:
  - 항상 기존 클래스 제거 후 새 클래스 추가
  - 루트 요소(`document.documentElement`)에만 클래스 적용

- **이벤트 리스너 정리**:
  - `useEffect` cleanup 함수로 `mediaQuery.removeEventListener('change')` 호출

### 엣지케이스
- `localStorage`에 잘못된 값: `'system'` 기본값 사용
- 시스템 테마가 감지되지 않음: 라이트 모드 기본
- `useTheme`를 Provider 밖에서 사용: 에러 발생

## 데이터/모델

### Theme 값 비교
| 테마 | `theme` | `effectiveTheme` | DOM 클래스 |
|-------|---------|------------------|-------------|
| 라이트 | `'light'` | `'light'` | `light` |
| 다크 | `'dark'` | `'dark'` | `dark` |
| 시스템(라이트) | `'system'` | `'light'` | `light` |
| 시스템(다크) | `'system'` | `'dark'` | `dark` |

### LocalStorage Key
- `theme`: 저장된 테마 값 (`'light'` | `'dark'` | `'system'`)

## 설정/환경변수
- `localStorage.theme`: 사용자 테마 선호도 저장

## 의존성

### 내부 모듈
- 없음

### 외부 라이브러리/서비스
- React: `createContext`, `useContext`, `useState`, `useEffect`, `ReactNode`
- Web API: `localStorage`, `window.matchMedia`, `document.documentElement`

## 테스트
- 관련 테스트: `vitest` 단위 테스트 (필요 시 추가)
- 커버리지/갭: 현재 테스트 없음, 컨텍스트/훅 테스트 필요
- 테스트 시나리오:
  - 초기 렌더링 (localStorage 없음)
  - localStorage에서 테마 복원
  - 테마 변경 (light → dark → system)
  - 시스템 테마 변경 감지
  - DOM 클래스 적용 확인
  - useTheme 훅 사용 (Provider 내/외)

## 운영/관찰가능성

### 로그
- 없음 (React 컨텍스트)

### 메트릭/트레이싱
- 없음

### 알람 포인트
- `useTheme`를 Provider 밖에서 사용: 에러 메시지 표시

## 다크 모드 구현 방식

### Tailwind CSS 기반
```css
/* index.css 또는 Tailwind 설정에 포함 */
.dark {
  color-scheme: dark;
}
```

### 다크 모드 클래스 적용
```typescript
// ThemeContext에서 DOM 클래스 추가
document.documentElement.classList.add('dark')  // 다크 모드 활성화
document.documentElement.classList.remove('dark')  // 라이트 모드
```

### 컴포넌트에서 사용
```tsx
<div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  {/* 다크 모드에 따라 스타일 변경 */}
</div>
```

## 시스템 테마 감지

### CSS Media Query
```css
@media (prefers-color-scheme: dark) {
  /* 다크 시스템 테마 */
}

@media (prefers-color-scheme: light) {
  /* 라이트 시스템 테마 */
}
```

### JavaScript 감지
```typescript
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
```

### 변경 감지
```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', (e) => {
  const isDark = e.matches
  // 테마 업데이트
})
```

## 관련 컴포넌트/훅
- [`ThemeToggle`](../components/ThemeToggle.md): 테마 전환 버튼

## 사용 예시

### App 컴포넌트에서 Provider 래핑
```tsx
import { ThemeProvider } from '@/context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      {/* 애플리케이션 컴포넌트들 */}
    </ThemeProvider>
  )
}
```

### 컴포넌트에서 useTheme 사용
```tsx
import { useTheme } from '@/context/ThemeContext'

function MyComponent() {
  const { theme, setTheme, effectiveTheme } = useTheme()
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Effective theme: {effectiveTheme}</p>
      <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </div>
  )
}
```

## 변경 이력(선택)
- v1.0: 초기 구현