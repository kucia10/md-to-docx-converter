# main.tsx

## Summary
- **Responsibility**: Renderer process entry point, React app mount
- **Main Users/Callers**: None (loaded directly in browser)
- **Key Entry Point**: [`ReactDOM.createRoot()`](../../../../../../src/renderer/main.tsx:7)

## Location in Architecture
- **Layer**: Renderer Process - Entry Point
- **Upstream/Downstream Dependencies**:
  - **Dependencies**: `App`, `styles/index.css`, `i18n`
  - **Used by**: None (application entry point)
  - **Role in Runtime Flow**: Module loading → Create React root → Mount App component

## Public Interface

### Exports
```typescript
// No direct exports
```

## Internal Behavior

### Major Flows
1. **Imports**: Load necessary modules
   - `React`: React library
   - `ReactDOM`: React DOM renderer
   - `App`: Main app component
   - `styles/index.css`: Global styles
   - `i18n`: Multi-language configuration

2. **Create React Root**: [`ReactDOM.createRoot()`](../../../../../../src/renderer/main.tsx:7)
   - Find root DOM element with `document.getElementById('root')`
   - Create renderer with `createRoot()` (React 18+)

3. **Mount App**: `render()`
   - Render App component wrapped in `<React.StrictMode>`
   - Enable additional checks in development mode

### Key Rules/Algorithms
- **React.StrictMode**: Additional checks in development (double rendering, lifecycle method warnings)
- **Root Element**: Must have `<div id="root"></div>` in HTML file
- **i18n Initialization**: Auto-initialization with `import './i18n'`

### Edge Cases
- Root element missing: Browser console error
- i18n initialization failure: App won't load

## Data/Models
- None used (entry point role)

## Configuration/Environment Variables
- None

## Dependencies

### Internal Modules
- [`App.tsx`](../../../../../../src/renderer/App.tsx): Main app component
- [`styles/index.css`](../../../../../../src/renderer/styles/index.css): Global styles
- [`i18n.ts`](../../../../../../src/renderer/i18n.ts): Multi-language configuration

### External Libraries/Services
- React: `React`
- ReactDOM: `createRoot`, `render`
- Web API: `document.getElementById()`

## Testing
- **Related Tests**: `vitest` unit tests
- **Coverage/Gaps**: Entry point testing unnecessary

## Operations/Observability

### Logging
- None

### Metrics/Tracing
- None

### Alert Points
- None

## HTML Structure

### index.html
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MD to DOCX Converter</title>
</head>
<body>
  <div id="root"></div>
  <script src="./main.tsx"></script>
</body>
</html>
```

## React StrictMode

### Features
- Detect side effects with double rendering in development
- Warn about unsafe lifecycle method usage
- Warn about deprecated API usage
- Test new React 18+ behaviors

### Production
- StrictMode is disabled in production builds
- No performance impact

## Related Files
- `index.html`: HTML template
- [`App.tsx`](./App.tsx): Main app component
- [`vite.config.ts`](../../../../../vite.config.ts): Vite configuration

## Build Process

### Development Mode
```bash
npm run dev:renderer
# → Vite dev server: http://localhost:3000
# → HMR(Hot Module Replacement) supported
```

### Production Build
```bash
npm run build:renderer
# → Create dist/renderer/index.html
# → Create bundle files in dist/renderer/assets/
```

## Changelog (Optional)
- v1.0: Initial implementation (React 18+ createRoot API)