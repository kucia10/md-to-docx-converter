# MarkdownPreview Component

## Summary
- **Responsibility**: Markdown content rendering and preview display
- **Main Users/Callers**: [`App.tsx`](../../src/renderer/App.tsx), `usePreview` hook
- **Key Entry Point**: [`MarkdownPreview`](../../src/renderer/components/MarkdownPreview.tsx:14) component

## Location in Architecture
- **Layer**: Renderer Process - Presentation Layer (UI Components)
- **Upstream/Downstream Dependencies**:
  - **Dependency**: `types` ([`ConversionOptions`](../../src/renderer/types/index.ts)), `FileItem`), `react-markdown`
  - **Used by**: Preview panel
  - **Role in Runtime Flow**: File selection → content reading → style application → Markdown rendering

## Public Interface

### Props
```typescript
interface MarkdownPreviewProps {
  content: string                          // Markdown content to render
  options: ConversionOptionsType            // Conversion options (font, line-height, etc.)
  selectedFiles?: FileItem[]               // Selected files list
  isCombinedPreview?: boolean              // Combined preview mode
  onToggleCombinedPreview?: () => void     // Combined preview toggle handler
}
```

## Internal Behavior

### Major Flows
1. **Style Calculation**: [`previewStyle`](../../src/renderer/components/MarkdownPreview.tsx:23)
   - Font family: `options.fontFamily`
   - Font size: `options.fontSize` (pt unit)
   - Line height: `options.lineHeight`

2. **Empty Content Handling**: `!content` check
   - Display "No content" message
   - Add empty line + icon for visual feedback

3. **Header Rendering**: 
   - Preview title display
   - Toggle combined mode checkbox (if multiple files selected)

4. **Markdown Rendering**: [`ReactMarkdown`](../../src/renderer/components/MarkdownPreview.tsx:67) usage
   - Use user-defined component for custom styling
   - Apply options-specific styling
   - Support dark mode styles

5. **Dark Mode Support**: `dark:` class application
   - Apply dark mode styles to text/background elements
   - Lazy load images: `loading="lazy"`

### Key Rules/Algorithms
- **Style Application**: `useMemo` to recalculate only when options change
- **Combined Mode**: `selectedFiles.length > 1` to show toggle checkbox
- **Inline Code vs Code Block**: Check for `language-` in `className` to differentiate
- **External Link Security**: `target="_blank" rel="noopener noreferrer"`
- **Image Loading**: Lazy load for performance

### Edge Cases
- `content` empty: Show empty content message
- Single file: Hide combined mode toggle checkbox
- Multiple files: Show combined mode toggle checkbox
- Inline code: Render without code block styling

## Data/Models

### Style Calculation
```typescript
const previewStyle = {
  fontFamily: options.fontFamily || 'Arial, sans-serif',
  fontSize: `${options.fontSize || 12}pt`,
  lineHeight: options.lineHeight || 1.5,
}
```

## Configuration/Environment Variables
- None (passed via props only)

## Dependencies

### Internal Modules
- [`types/index.ts`](../../src/renderer/types/index.ts): `ConversionOptions`, `FileItem`

### External Libraries/Services
- React: `React.FC`, `useMemo`
- i18next: `useTranslation()`
- react-markdown: `ReactMarkdown` (Markdown rendering engine)
- Tailwind CSS: Style application

## Testing
- **Related Tests**: `vitest` unit tests (add if needed)
- **Coverage/Gaps**: No tests currently, component testing needed
- **Test Scenarios**:
  - Empty content rendering
  - Single file preview
  - Combined preview mode
  - Different Markdown elements rendering (h1-h6, p, ul, ol, table, code, etc.)
  - Dark mode style application
  - Font/line-height options changes
  - Inline code vs code block differentiation
  - External link rendering
  - Image lazy loading

## Operations/Observability

### Logging
- None (pure UI component)

### Metrics/Tracing
- None

### Alert Points
- `!content`: Show "No content" message
- `isCombinedPreview`: Show/hide combined mode toggle checkbox

## Markdown Element Component Styles

| Element | Style | Dark Mode |
|---------|--------|-----------|
| `h1` | `text-3xl font-bold mb-4 pb-2 border-b` | `dark:text-gray-100` |
| `h2` | `text-2xl font-semibold mt-6 mb-3` | `dark:text-gray-200` |
| `h3` | `text-xl font-medium mt-4 mb-2` | `dark:text-gray-200` |
| `p` | `text-gray-700 mb-4` | `dark:text-gray-300` |
| `code` (inline) | `bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600` | `dark:bg-gray-700 dark:text-pink-400` |
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

### Edge Cases
- `content` empty: Show "No content" message
- Single file: Hide combined mode toggle checkbox

## Data/Models

### Style Calculation
```typescript
const previewStyle = {
  fontFamily: options.fontFamily || 'Arial, sans-serif',
  fontSize: `${options.fontSize || 12}pt`,
  lineHeight: options.lineHeight || 1.5,
}
```

## Configuration/Environment Variables
- None (passed via props only)

## Dependencies

### Internal Modules
- [`types/index.ts`](../../src/renderer/types/index.ts): `ConversionOptions`, `FileItem`

### External Libraries/Services
- React: `React.FC`, `useMemo`
- i18next: `useTranslation()`
- react-markdown: `ReactMarkdown` (Markdown rendering engine)
- Tailwind CSS: Style application

## Testing
- **Related Tests**: `vitest` unit tests (add if needed)
- **Coverage/Gaps**: No tests currently, component testing needed
- **Test Scenarios**:
  - Empty content rendering
  - Single file preview
  - Combined preview mode toggle
  - Different Markdown elements rendering (h1-h6, p, ul, ol, table, code, etc.)
  - Dark mode style application
  - Font/line-height options changes
  - Inline code vs code block differentiation
  - External link rendering
  - Image lazy loading

## Operations/Observability

### Logging
- None (pure UI component)

### Metrics/Tracing
- None

### Alert Points
- `!content`: Show "No content" message
- `isCombinedPreview`: Show/hide combined mode toggle checkbox

## Styling (Tailwind CSS)

### Container Structure
```tsx
<div className="flex flex-col h-full">
  {/* Header */}
  <div className="px-6 py-3 border-b bg-gray-50">
    <span>Preview</span>
    <label>Combined mode checkbox</label>
  </div>
  
  {/* Content */}
  <div className="flex-1 overflow-y-auto bg-white">
    <div className="markdown-preview max-w-4xl mx-auto py-8 px-6">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  </div>
</div>
```

### Dark Mode Origins
- Most text elements: `dark:text-gray-XXX`
- Backgrounds: `dark:bg-gray-XXX`
- Borders: `dark:border-gray-XXX`

## react-markdown Component Usage

### Custom Rendering
```tsx
<ReactMarkdown components={{
  h1: ({ children }) => <h1 className="...">{children}</h1>,
  p: ({ children }) => <p className="...">{children}</p>,
  // ... other elements
}}>
  {content}
</ReactMarkdown>
```

### Inline Code Differentiation
```tsx
code: ({ className, children }) => {
  const isInline = !className?.includes('language-')
  return isInline ? <code className="...">{children}</code> 
                 : <code className="block-code">{children}</code>
}
```

## Related Components/Hooks
- [`usePreview`](../hooks/usePreview.md): Preview state management
- [`ConversionOptions`](./ConversionOptions.md): Conversion options settings

## Limitations
- LaTeX math expressions support: None (add `rehype-katex` if needed)
- Diagram rendering (Mermaid, PlantUML, etc.): None (add diagram plugins if needed)
- Table of contents support: Simple unordered/ordered lists only

## Future Improvements
- Add syntax highlighting with `react-syntax-highlighter`
- Add math formula rendering with `rehype-katex`
- Add diagram rendering (Mermaid, PlantUML)
- Add table of contents generation
- Add footnote support
- Add definition list support

## Changelog (Optional)
- v1.0: Initial implementation