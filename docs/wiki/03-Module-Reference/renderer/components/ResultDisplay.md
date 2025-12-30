# ResultDisplay Component

## Summary
- **Responsibility**: Display conversion result modal (success/failure messages, file download, error list)
- **Main Users/Callers**: [`App.tsx`](../../src/renderer/App.tsx), conversion hooks
- **Key Entry Point**: [`ResultDisplay`](../../src/renderer/components/ResultDisplay.tsx:11) component

## Location in Architecture
- **Layer**: Renderer Process - Presentation Layer (UI Components)
- **Upstream/Downstream Dependencies**:
  - **Dependency**: `types` ([`ConversionResult`](../../src/renderer/types/index.ts)), `window.electronAPI`
  - **Used by**: None (display after conversion complete)
  - **Role in Runtime Flow**: Conversion complete → show result modal → user action (download/open/close folder)

## Public Interface

### Props
```typescript
interface ResultDisplayProps {
  result: ConversionResult   // Conversion result data
  onClose: () => void       // Modal close handler
}
```

### ConversionResult Type
```typescript
{
  success: boolean,           // Success status
  message: string,            // Result message
  outputPath?: string,        // Output file path (success)
  processedFiles?: string[],   // Processed files list (batch conversion)
  errors?: string[]           // Error messages list (failure)
}
```

## Internal Behavior

### Major Flows
1. **Modal Rendering**: Fixed backdrop + centered modal
   - Background: `bg-black bg-opacity-50`
   - Modal: `bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md`

2. **Header Display**: Title + close button
   - Success: Green checkmark icon (`CheckCircle`)
   - Failure: Red warning icon (`AlertCircle`)

3. **Success Details** (`success = true`):
   - Processed files list (`processedFiles` array)
   - Output file info (`outputPath`)
   - **Open Folder Button**: [`handleOpenOutputFolder()`](../../src/renderer/components/ResultDisplay.tsx:15)
     - Current implementation: Show file dialog (needs improvement to actually open folder)
     - **Download Button**: [`handleDownloadFile()`](../../src/renderer/components/ResultDisplay.tsx:30)
       - Create `<a>` tag with `href="file://..."` + `download` attribute

4. **Failure Details** (`success = false`):
   - Error list (`errors` array)
   - Red background + error message display

5. **Close Button**: Top-right X icon

### Key Rules/Algorithms
- **Background Click**: Only close button allows closing (modal container click handler)
- **File Download Implementation**: Electron `file://` protocol usage
- **Folder Opening**: Currently shows dialog only (needs improvement to `shell.openPath()`)
- **Processed Files**: Show list only for batch conversion (hide if empty array)

### Edge Cases
- `outputPath` missing: Hide download/open folder button
- `processedFiles` empty array: Hide processed files section
- `errors` empty array: Hide error section

## Data/Models

### Result State Comparison
| Status | Icon | Color | Display Section |
|---------|-------|--------|---------------|
| Success | `CheckCircle` | Green | Message, processed files, output file, buttons |
| Failure | `AlertCircle` | Red | Message, error list |

### Button Actions
| Button | Icon | Action |
|---------|-------|--------|
| Open Folder | `FolderOpen` | [`handleOpenOutputFolder()`](../../src/renderer/components/ResultDisplay.tsx:15) |
| Download | `Download` | [`handleDownloadFile()`](../../src/renderer/components/ResultDisplay.tsx:30) |
| Close | `X` / Close | `onClose()` |

## Configuration/Environment Variables
- None (passed via props only)

## Dependencies

### Internal Modules
- [`types/index.ts`](../../src/renderer/types/index.ts): `ConversionResult`

### External Libraries/Services
- React: `React.FC`
- i18next: `useTranslation()`
- lucide-react: `CheckCircle`, `AlertCircle`, `Download`, `X`, `FolderOpen` (icons)
- Electron: `window.electronAPI.saveFileDialog()` (for folder open)

## Testing
- **Related Tests**: `vitest` unit tests (add if needed)
- **Coverage/Gaps**: No tests currently, component testing needed
- **Test Scenarios**:
  - Success state modal rendering
  - Failure state modal rendering
  - Processed files list display
  - Error list display
  - Download button click
  - Open folder button click
  - Close button click
  - Empty `outputPath` handling
  - Empty `processedFiles` array handling
  - Empty `errors` array handling

## Operations/Observability

### Logging
- Folder open error: `console.error('Error opening output folder:', error)`

### Metrics/Tracing
- None

### Alert Points
- `success = false`: Red background + warning message
- `success = true`: Green checkmark + success message

## Styling (Tailwind CSS)

### Modal Container
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
    {/* Header, Content, Footer */}
  </div>
</div>
```

### Section Styles
- **Header**: `p-6 border-b`
- **Content**: `p-6`
- **Footer**: `p-6 border-t bg-gray-50 / blue-50 / red-50`

### Button Styles
- **Close**: `p-2 hover:bg-gray-100 rounded-md`
- **Action**: `btn btn-primary` / `btn btn-secondary`

## Related Components/Hooks
- [`ProgressBar`](./ProgressBar.md): Progress display during conversion
- [`FileUpload`](./FileUpload.md): File selection UI

## IPC Channel Connection
- `saveFileDialog`: Folder open for output (currently unused)

## Future Improvements

### Folder Open Functionality
Current implementation ([`handleOpenOutputFolder()`](../../src/renderer/components/ResultDisplay.tsx:15)):
```typescript
const result = await window.electronAPI.saveFileDialog()
console.log('Output folder would be opened:', result.filePath)
```

**Improvement**:
- Use `shell.openPath()` to open folder in file manager
- Extract parent directory path from `outputPath`
```typescript
// Proposed improvement
import { shell } from 'electron'

const handleOpenOutputFolder = async () => {
  const { dialog } = require('@electron/remote')
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
    shell.openPath(result.filePaths[0])
  }
}
```

### Download Limitations
- Electron `file://` protocol has security limitations
- Alternative: Use `shell.openPath()` for cross-platform file opening

## Changelog (Optional)
- v1.0: Initial implementation