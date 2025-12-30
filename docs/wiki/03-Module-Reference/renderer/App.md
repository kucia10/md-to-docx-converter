# App Component

## Summary
- **Responsibility**: Main app component (overall UI assembly, state management, event handling)
- **Main Users/Callers**: [`main.tsx`](../../../../../src/renderer/main.tsx)
- **Key Entry Point**: [`App()`](../../../../../src/renderer/App.tsx:19)

## Location in Architecture
- **Layer**: Renderer Process - Main Component (Orchestration Layer)
- **Upstream/Downstream Dependencies**:
  - **Dependencies**: `components/`, `hooks/`, `context/`, `types/`, `window.electronAPI`
  - **Used by**: None (top-level of application UI)
  - **Role in Runtime Flow**: Initialization → Assemble sub-components → Handle user actions → IPC communication

## Public Interface

### Return Value
```typescript
JSX.Element  // Entire application UI
```

### AppWrapper
```typescript
function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}
```

## Internal Behavior

### Major Flows
1. **Custom Hook Initialization**:
   - [`useFileUpload()`](../../../../../src/renderer/hooks/useFileUpload.ts): File management
   - [`useConversion()`](../../../../../src/renderer/hooks/useConversion.ts): Single file conversion
   - [`useBatchConversion()`](../../../../../src/renderer/hooks/useBatchConversion.ts): Batch file conversion
   - [`useMergeConversion()`](../../../../../src/renderer/hooks/useMergeConversion.ts): Merge file conversion
   - [`usePreview(selectedFiles)`](../../../../../src/renderer/hooks/usePreview.ts): Preview

2. **State Initialization**:
   - `appVersion`: App version (fetched from Main Process)
   - `conversionOptions`: Conversion options (font, margins, page settings, etc.)

3. **App Version Fetch**: [`useEffect`](../../../../../src/renderer/App.tsx:161)
   - `window.electronAPI.getAppVersion()` call
   - Save to state

4. **UI Structure**:
   - **Header**: Title, version, language/theme toggle
   - **Main Content**: 2 panels (left/right)
     - **Left Panel (33%)**: File upload, conversion options, conversion button, progress bar
     - **Right Panel (67%)**: Preview, result display

### Conversion Handlers

#### Single File Conversion: [`handleStartConversion()`](../../../../../src/renderer/App.tsx:89)
1. Check if file is selected
2. Generate default DOCX filename (`{basename}.docx`)
3. Show save dialog
4. Call `startConversion(file.path, outputPath, options)`

#### Batch Conversion: [`handleStartBatchConversion()`](../../../../../src/renderer/App.tsx:116)
1. Show directory selection dialog
2. Call `startBatchConversion(inputFiles, outputDirectory, options)`

#### Merge Conversion: [`handleStartMergeConversion()`](../../../../../src/renderer/App.tsx:137)
1. Generate default merged filename (`merged-files.docx`)
2. Show save dialog
3. Call `startMergeConversion(inputFiles, outputPath, options)`

### Key Rules/Algorithms
- **State Management**: Managed by custom hooks
- **Conditional Rendering**: Display different UI based on conversion state
- **File Path Handling**: Use `path` provided by Electron
- **Cancel Dialog**: Stop conversion if cancel is selected during conversion

### Edge Cases
- No file selected: Disable conversion button
- Single file: Hide batch/merge buttons
- During conversion: Disable all conversion buttons
- Dialog canceled: Don't start conversion

## Data/Models

### ConversionOptions Initial Values
```typescript
{
  fontSize: 12,              // Font size (pt)
  fontFamily: 'Arial',        // Font family
  lineHeight: 1.5,            // Line height
  marginTop: 2.54,           // Top margin (cm)
  marginBottom: 2.54,        // Bottom margin (cm)
  marginLeft: 3.18,          // Left margin (cm)
  marginRight: 3.18,         // Right margin (cm)
  orientation: 'portrait',    // Page orientation
  generateToc: true,          // Generate table of contents
  referenceStyle: 'apa',      // Bibliography style
  imageHandling: 'embed',     // Image handling
  codeBlockStyle: 'fenced'    // Code block style
}
```

### Conversion State Management
| State | Variable | Meaning |
|-------|-----------|---------|
| Single file converting | `isConverting` | `useConversion` |
| Batch file converting | `isBatchConverting` | `useBatchConversion` |
| Merge file converting | `isMergeConverting` | `useMergeConversion` |
| Index of file being converted | `selectedFileIndex` | For preview |

## Configuration/Environment Variables
- None

## Dependencies

### Internal Modules
- [`components/FileUpload`](../../../../../src/renderer/components/FileUpload.tsx): File upload UI
- [`components/MarkdownPreview`](../../../../../src/renderer/components/MarkdownPreview.tsx): Preview
- [`components/ConversionOptions`](../../../../../src/renderer/components/ConversionOptions.tsx): Options settings
- [`components/ProgressBar`](../../../../../src/renderer/components/ProgressBar.tsx): Progress bar
- [`components/ResultDisplay`](../../../../../src/renderer/components/ResultDisplay.tsx): Result display
- [`components/ThemeToggle`](../../../../../src/renderer/components/ThemeToggle.tsx): Theme toggle
- [`components/LanguageToggle`](../../../../../src/renderer/components/LanguageToggle.tsx): Language toggle
- [`hooks/useFileUpload`](../../../../../src/renderer/hooks/useFileUpload.ts): File management
- [`hooks/useConversion`](../../../../../src/renderer/hooks/useConversion.ts): Single file conversion
- [`hooks/useBatchConversion`](../../../../../src/renderer/hooks/useBatchConversion.ts): Batch file conversion
- [`hooks/useMergeConversion`](../../../../../src/renderer/hooks/useMergeConversion.ts): Merge file conversion
- [`hooks/usePreview`](../../../../../src/renderer/hooks/usePreview.ts): Preview
- [`context/ThemeContext`](../../../../../src/renderer/context/ThemeContext.tsx): Theme context
- [`types/index.ts`](../../../../../src/renderer/types/index.ts): Type definitions

### External Libraries/Services
- React: `useState`, `useEffect`
- i18next: `useTranslation()`
- lucide-react: `FolderOpen`, `FileText`, `FileSymlink` (icons)
- Electron: `window.electronAPI` (IPC communication)

## Testing
- **Related Tests**: `vitest` unit tests (add if needed)
- **Coverage/Gaps**: Currently no tests, integration testing needed
- **Test Scenarios**:
  - Initial rendering
  - UI update after file selection
  - Single file conversion flow
  - Batch file conversion flow
  - Merge file conversion flow
  - Conversion options change
  - Conversion cancel
  - Dialog cancel behavior

## Operations/Observability

### Logging
- Conversion error: `console.error('Conversion error:', error)`
- Batch conversion error: `console.error('Batch conversion error:', error)`
- Merge conversion error: `console.error('Merge conversion error:', error)`
- App version fetch failed: `console.error('Failed to fetch app version:', error)`

### Metrics/Tracing
- None

### Alert Points
- `selectedFiles.length === 0`: Disable conversion button
- `isConverting`: Disable conversion button, display progress bar
- `batchResult.success`: Success/failure message

## UI Structure

### Overall Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                 │
│  [Title + Version]        [Language] [Theme]               │
├──────────────────────────────┬──────────────────────────────────┤
│  Left Panel (33%)         │  Right Panel (67%)          │
│  ┌──────────────────────┐  │  ┌─────────────────────────┐ │
│  │  FileUpload          │  │  │ MarkdownPreview       │ │
│  │  - Drag & drop     │  │  │  - Single/Merge mode    │ │
│  │  - File list         │  │  └─────────────────────────┘ │
│  └──────────────────────┘  │  │                            │
│  ┌──────────────────────┐  │  │  ┌─────────────────────────┐ │
│  │  ConversionOptions  │  │  │  ResultDisplay         │ │
│  │  - Font settings   │  │  │  (after completion)    │ │
│  │  - Margin settings │  │  └─────────────────────────┘ │
│  │  - Page settings   │  │  │                            │
│  └──────────────────────┘  │  │                            │
│  ┌──────────────────────┐  │  │                            │
│  │  Conversion Button │  │  │                            │
│  │  - Single          │  │  │                            │
│  │  - Merge           │  │  │                            │
│  │  - Batch           │  │  │                            │
│  └──────────────────────┘  │  │                            │
│  ┌──────────────────────┐  │  │                            │
│  │  ProgressBar         │  │  │                            │
│  │  (during conversion)  │  │  │                            │
│  └──────────────────────┘  │  │                            │
└──────────────────────────────┴──────────────────────────────────┘
```

### Tailwind CSS Class Summary
- **Container**: `flex flex-col h-screen bg-gray-50 dark:bg-gray-900`
- **Header**: `bg-white dark:bg-gray-800 shadow-sm border-b`
- **Left Panel**: `w-1/3 bg-white dark:bg-gray-800 border-r flex flex-col`
- **Right Panel**: `flex-1 overflow-hidden`
- **Button**: `btn btn-primary` / `btn btn-secondary`

## IPC Channels Used

### Request Channels
- `saveFileDialog`: Select save path for conversion file
- `openDirectoryDialog`: Select output directory for batch conversion
- `getAppVersion`: Get app version

### Event Channels
- Conversion events are handled in each `useConversion` hook

## Related Components/Hooks
- [`useFileUpload`](../hooks/useFileUpload.md): File upload management
- [`useConversion`](../hooks/useConversion.md): Single file conversion management
- [`useBatchConversion`](../hooks/useBatchConversion.md): Batch file conversion management
- [`useMergeConversion`](../hooks/useMergeConversion.md): Merge file conversion management
- [`usePreview`](../hooks/usePreview.md): Preview management

## Filename Generation Rules

### Single File Conversion
```typescript
const baseName = file.name.replace(/\.[^/.]+$/, '')  // Remove extension
const defaultDocxName = `${baseName}.docx`
```

### Merge File Conversion
```typescript
const defaultDocxName = 'merged-files.docx'
```

## Changelog (Optional)
- v1.0: Initial implementation