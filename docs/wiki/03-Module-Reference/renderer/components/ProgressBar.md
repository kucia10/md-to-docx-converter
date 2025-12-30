# ProgressBar Component

## Summary
- **Responsibility**: Display conversion progress UI component
- **Main Users/Callers**: [`App.tsx`](../../src/renderer/App.tsx), conversion container components
- **Key Entry Point**: [`ProgressBar`](../../src/renderer/components/ProgressBar.tsx:39) component

## Location in Architecture
- **Layer**: Renderer Process - Presentation Layer (UI Components)
- **Upstream/Downstream Dependencies**:
  - **Dependency**: `types` ([`ConversionProgress`](../../src/renderer/types/index.ts))
  - **Used by**: Conversion screens, batch/merge conversion screens
  - **Role in Runtime Flow**: Receive IPC event → update progress state → render UI

## Public Interface

### Props
```typescript
interface ProgressBarProps {
  progress: ConversionProgress   // Progress data
  onCancel: () => void          // Cancel handler
}
```

### ConversionProgress Type
```typescript
{
  currentFile: number,       // Index of file being processed (always 0)
  totalFiles: number,        // Total number of files (always 1)
  currentFileName: string,    // Current filename
  percentage: number,        // Progress percentage (0-100)
  stage: 'preparing' | 'converting' | 'finalizing' | 'completed' | 'error'
}
```

## Internal Behavior

### Major Flows
1. **Status Text Determination**: [`getStageText()`](../../src/renderer/components/ProgressBar.tsx:11)
   - `preparing`: Preparing
   - `converting`: Converting
   - `finalizing`: Finalizing
   - `completed`: Completed
   - `error`: Error occurred

2. **Icon Determination**: [`getStageIcon()`](../../src/renderer/components/ProgressBar.tsx:26)
   - Progressing: Clock icon with spinning animation
   - Completed: Checkmark icon (green color)
   - Error: Warning icon (red color)

3. **UI Rendering**:
   - **Header**: Status text + icon + cancel button
   - **Progress Bar**: Percentage-based width + color (progress/completed/error)
   - **Current File Info**: Filename display
   - **Detail Status**: Progress stage, file progress, overall progress
   - **Estimated Time**: Show only during conversion

### Key Rules/Algorithms
- **Progress Bar Color**:
  - In Progress: `bg-primary-500` (blue)
  - Completed: `bg-green-500` (green)
  - Error: `bg-red-500` (red)
- **Cancel Button**: Show only in completed/error states (hidden during conversion)
- **Estimated Time**: `(100 - percentage) * 0.5` seconds calculated (linear estimation)
- **Multiple Files**: `totalFiles > 1` to show file progress

### Edge Cases
- `percentage = 0`: Progress bar width 0%
- `percentage = 100`: Completed state processing
- `currentFileName` missing: Hide file info section
- Single file (`totalFiles = 1`): Hide file progress percentage

## Data/Models

### Stage Values and Meanings
| Status | Icon | Color | Text |
|----------|-------|-------|------|
| Preparing | Clock + rotation | Default | Preparing |
| Converting | Clock + rotation | Blue | Converting |
| Finalizing | Clock + rotation | Default | Finalizing |
| Completed | Checkmark | Green | Completed |
| Error | Warning | Red | Error occurred |

## Configuration/Environment Variables
- None (passed via props only)

## Dependencies

### Internal Modules
- [`types/index.ts`](../../src/renderer/types/index.ts): `ConversionProgress`

### External Libraries/Services
- React: `React.FC`
- i18next: `useTranslation()`
- lucide-react: `X`, `Clock`, `CheckCircle`, `AlertCircle` (icons)
- Tailwind CSS: Styling

## Testing
- **Related Tests**: `vitest` unit tests (add if needed)
- **Coverage/Gaps**: No tests currently, component testing needed
- **Test Scenarios**:
  - All progress stages (0%, 50%, 100%)
  - Single file vs multiple files rendering difference
  - Cancel button click
  - Estimated time calculation
  - Missing current filename

## Operations/Observability

### Logging
- None (pure UI component)

### Metrics/Tracing
- None

### Alert Points
- `stage === 'error'`: Red background + warning message display
- `stage === 'completed'`: Green background + success message display
- `percentage` changes: Smooth transition via CSS `transition-all duration-300`

## Styling (Tailwind CSS)

### Common Classes
- **Container**: `space-y-4`
- **Text**: Dark mode support (`dark:text-gray-XXX`)
- **Button**: Hover effect (`hover:text-red-500`)

### Progress Bar
- **Background**: `bg-gray-200 dark:bg-gray-700 rounded-full h-2`
- **Fill**: `h-2 rounded-full transition-all duration-300`
- **Color Change**: `bg-primary-500` → `bg-green-500` / `bg-red-500`

### Status Messages
- **Success**: `bg-green-50 dark:bg-green-900/30 border-green-200`
- **Error**: `bg-red-50 dark:bg-red-900/30 border-red-200`

## Related Components
- [`ResultDisplay`](./ResultDisplay.md): Show results after completion
- [`ConversionOptions`](./ConversionOptions.md): Conversion options settings

## Changelog (Optional)
- v1.0: Initial implementation