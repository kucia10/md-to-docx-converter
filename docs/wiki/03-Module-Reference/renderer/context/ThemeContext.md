# ThemeContext

## Summary
- **Responsibility**: Application theme state management (light/dark/system mode)
- **Main Users/Callers**: [`App.tsx`](../../../../../../src/renderer/App.tsx), `ThemeToggle` component
- **Key Entry Points**: [`ThemeProvider`](../../../../../../src/renderer/context/ThemeContext.tsx:13), [`useTheme`](../../../../../../src/renderer/context/ThemeContext.tsx:69)

## Location in Architecture
- **Layer**: Renderer Process - State Management Layer (React Context)
- **Upstream/Downstream Dependencies**:
  - **Dependencies**: React (`createContext`, `useContext`, `useState`, `useEffect`), `localStorage`
  - **Used by**: Entire application (global theme state)
  - **Role in Runtime Flow**: Theme change → DOM class update → entire UI theme change

## Public Interface

### Theme Type
```typescript
type Theme = 'light' | 'dark' | 'system'
```

### ThemeContextType
```typescript
interface ThemeContextType {
  theme: Theme              // Configured theme
  setTheme: (theme: Theme) => void  // Theme setter function
  effectiveTheme: 'light' | 'dark'  // Actually applied theme
}
```

### ThemeProvider Props
```typescript
{
  children: ReactNode   // Child components
}
```

### useTheme Hook Return Value
```typescript
{
  theme: Theme,
  setTheme: (theme: Theme) => void,
  effectiveTheme: 'light' | 'dark'
}
```

## Internal Behavior

### Major Flows
1. **Initialization**: [`ThemeProvider`](../../../../../../src/renderer/context/ThemeContext.tsx:13)
   - Read saved theme from `localStorage.getItem('theme')`
   - If missing, default to `'system'`

2. **Theme Application**: [`useEffect`](../../../../../../src/renderer/context/ThemeContext.tsx:20)
   - Add/remove class to `document.documentElement`
   - `root.classList.remove('light', 'dark')` to remove existing classes
   - `root.classList.add(themeValue)` to add new class

3. **System Theme Detection**:
   - Detect OS theme with `window.matchMedia('(prefers-color-scheme: dark)')`
   - Listen to theme changes with `mediaQuery.addEventListener('change', handleChange)`
   - Auto-update only when theme is `'system'`

4. **Theme Change**: [`setTheme`](../../../../../../src/renderer/context/ThemeContext.tsx:57)
   - Update state with `setThemeState(newTheme)`
   - Save to `localStorage.setItem('theme', newTheme)`

5. **useTheme Hook**: [`useTheme()`](../../../../../../src/renderer/context/ThemeContext.tsx:69)
   - Read context value with `useContext(ThemeContext)`
   - Throw error if `undefined`

### Key Rules/Algorithms
- **Theme Determination Logic**:
   - `theme === 'light'`: Applied theme `'light'`
   - `theme === 'dark'`: Applied theme `'dark'`
   - `theme === 'system'`: Follow OS theme (`prefers-color-scheme: dark` check)

- **DOM Class Management**:
   - Always remove existing classes before adding new class
   - Apply classes only to root element (`document.documentElement`)

- **Event Listener Cleanup**:
   - Call `mediaQuery.removeEventListener('change')` in `useEffect` cleanup function

### Edge Cases
- Invalid value in `localStorage`: Use `'system'` as default
- System theme not detected: Default to light mode
- `useTheme` used outside Provider: Error occurs

## Data/Models

### Theme Value Comparison
| Theme | `theme` | `effectiveTheme` | DOM Class |
|---------|---------|------------------|-------------|
| Light | `'light'` | `'light'` | `light` |
| Dark | `'dark'` | `'dark'` | `dark` |
| System (Light) | `'system'` | `'light'` | `light` |
| System (Dark) | `'system'` | `'dark'` | `dark` |

### LocalStorage Key
- `theme`: Saved theme value (`'light'` | `'dark'` | `'system'`)

## Configuration/Environment Variables
- `localStorage.theme`: Save user theme preference

## Dependencies

### Internal Modules
- None

### External Libraries/Services
- React: `createContext`, `useContext`, `useState`, `useEffect`, `ReactNode`
- Web API: `localStorage`, `window.matchMedia`, `document.documentElement`

## Testing
- **Related Tests**: `vitest` unit tests (add if needed)
- **Coverage/Gaps**: Currently no tests, context/hook testing needed
- **Test Scenarios**:
  - Initial rendering (no localStorage)
  - Restore theme from localStorage
  - Theme change (light → dark → system)
  - System theme change detection
  - DOM class application verification
  - useTheme hook usage (inside/outside Provider)

## Operations/Observability

### Logging
- None (React context)

### Metrics/Tracing
- None

### Alert Points
- `useTheme` used outside Provider: Display error message

## Dark Mode Implementation Method

### Tailwind CSS Based
```css
/* index.css or include in Tailwind configuration */
.dark {
  color-scheme: dark;
}
```

### Dark Mode Class Application
```typescript
// Add DOM class in ThemeContext
document.documentElement.classList.add('dark')  // Enable dark mode
document.documentElement.classList.remove('dark')  // Light mode
```

### Usage in Components
```tsx
<div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  {/* Style changes based on dark mode */}
</div>
```

## System Theme Detection

### CSS Media Query
```css
@media (prefers-color-scheme: dark) {
  /* Dark system theme */
}

@media (prefers-color-scheme: light) {
  /* Light system theme */
}
```

### JavaScript Detection
```typescript
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
```

### Change Detection
```typescript
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
mediaQuery.addEventListener('change', (e) => {
  const isDark = e.matches
  // Update theme
})
```

## Related Components/Hooks
- [`ThemeToggle`](../components/ThemeToggle.md): Theme toggle button

## Usage Examples

### Provider Wrapping in App Component
```tsx
import { ThemeProvider } from '@/context/ThemeContext'
 
function App() {
  return (
    <ThemeProvider>
      {/* Application components */}
    </ThemeProvider>
  )
}
```

### Using useTheme Hook in Components
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

## Changelog (Optional)
- v1.0: Initial implementation