# ThemeToggle

## Summary
- **Responsibility**: Theme toggle button component (light/dark/system mode)
- **Primary User/Caller**: [`App.tsx`](../../../../../src/renderer/App.tsx)
- **Core Entry Point**: [`ThemeToggle`](../../../../../src/renderer/components/ThemeToggle.tsx:4)

## Architecture Position
- **Layer**: Renderer Process - Presentation Layer (UI Components)
- **Upstream/Downstream Dependencies**:
  - Depends on: `@/context/ThemeContext`, `i18next`
  - Used by: App header, settings panel
- **Role in Runtime Flow**: Theme button click → Next theme cycle → Context update → Entire UI theme change

## Public Interface

### Return Value
```typescript
JSX.Element  // Theme toggle button
```

### Theme Cycle Order
```
light → dark → system → light → ...
```

## Internal Behavior

### Main Flow
1. **Icon Determination**: [`getIcon()`](../../../../../src/renderer/components/ThemeToggle.tsx:8)
   - `light`: Sun icon (SVG circle sun)
   - `dark`: Moon icon (SVG crescent moon)
   - `system`: Computer monitor icon (SVG)

2. **Label Determination**: [`getLabel()`](../../../../../src/renderer/components/ThemeToggle.tsx:31)
   - `light`: `t('theme.lightMode')`
   - `dark`: `t('theme.darkMode')`
   - `system`: `t('theme.system')`

3. **Theme Cycling**: [`cycleTheme()`](../../../../../src/renderer/components/ThemeToggle.tsx:42)
   - Find current theme index
   - Next theme: `(currentIndex + 1) % themes.length`
   - Update context with `setTheme(nextTheme)`

4. **Button Rendering**:
   - Display current theme icon
   - Display theme name text
   - Hover effects
   - Dark mode supported styles

### Core Rules/Algorithms
- **Theme Array**: `['light', 'dark', 'system']`
- **Cycle Logic**: Cycle using `(currentIndex + 1) % length`
- **Icon Size**: `w-5 h-5` (20px × 20px)
- **Button Style**: `flex items-center gap-2 rounded-lg`

### Theme-Specific Icon SVG

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

### Edge Cases
- Empty theme array: Possible error (code always has 3 themes)
- Initial render: Use initial theme value from context

## Data/Models

### Theme Type
```typescript
type Theme = 'light' | 'dark' | 'system'
```

## Configuration/Environment Variables
- None used (state managed in context)

## Dependencies

### Internal Modules
- [`@/context/ThemeContext`](../../../../../src/renderer/context/ThemeContext.tsx): `useTheme()` (theme state)

### External Libraries/Services
- React: `React.FC`
- i18next: `useTranslation()`
- SVG: Inline SVG icons

## Testing
- Related Tests: `vitest` unit tests (add if needed)
- Coverage/Gaps: No current tests, component tests needed
- Test Scenarios:
  - Initial render
  - Theme cycling (light → dark → system → light)
  - Each theme icon rendering
  - Hover effects
  - Dark mode style application
  - Tooltip display

## Operations/Observability

### Logs
- None (pure UI component)

### Metrics/Tracing
- None

### Alert Points
- None

## Styling (Tailwind CSS)

### Button
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

### Icon
```tsx
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
```

### Dark Mode Support
- Background: `bg-gray-100 dark:bg-gray-800`
- Text: `text-gray-700 dark:text-gray-300`
- Hover: `hover:bg-gray-200 dark:hover:bg-gray-700`

## ThemeContext Integration

### Usage
```tsx
import { useTheme } from '@/context/ThemeContext'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // ... theme cycling logic
}
```

### setTheme Call
```tsx
const cycleTheme = () => {
  const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
  const currentIndex = themes.indexOf(theme)
  const nextTheme = themes[(currentIndex + 1) % themes.length]
  setTheme(nextTheme)
}
```

## i18next Keys

### Theme-Related Keys
| Key | Example Value |
|-----|---------------|
| `theme.lightMode` | Light Mode |
| `theme.darkMode` | Dark Mode |
| `theme.system` | System |
| `theme.currentTheme` | Current Theme |

## Related Components/Hooks
- [`ThemeContext`](../context/ThemeContext.md): Theme state management

## UI Layout

### Button Structure
```
┌─────────────────────────────────┐
│  [Icon] [Theme Name]            │
└─────────────────────────────────┘
```

### Click Behavior
1. User clicks button
2. Change from current theme to next theme
3. Update icon and text
4. Change entire app theme (via ThemeContext)

## Change History (Optional)
- v1.0: Initial implementation