# API/Interface

## Overview

This document describes the API interface between the Renderer Process and Main Process through Electron IPC (Inter-Process Communication) channels.

**IPC Channel Definitions**: [`src/main/ipc/channels.ts`](../src/main/ipc/channels.ts)

## IPC Communication Methods

### Request/Response Pattern (Renderer → Main)
```typescript
// Renderer (via Preload)
const result = await window.electronAPI.someMethod(params)

// Main
ipcMain.handle('some-channel', async (event, params) => {
  // Processing logic
  return result
})
```

### Event Pattern (Main → Renderer)
```typescript
// Main
event.sender.send('some-event-channel', data)

// Renderer (via Preload)
window.electronAPI.onSomeEvent((data) => {
  // Event handling
})
```

## API List

### File Operation APIs

#### openFileDialog
Show file selection dialog

| Property | Value |
|----------|-------|
| **Channel** | `open-file-dialog` |
| **Direction** | Renderer → Main |
| **Parameters** | None |
| **Returns** | `Promise<{canceled: boolean; filePaths: string[]}>` |
| **Implementation** | [`handlers.ts:21-55`](../src/main/ipc/handlers.ts:21-55) |

**Usage Example**:
```typescript
const result = await window.electronAPI.openFileDialog()
if (!result.canceled) {
  console.log(result.filePaths) // Selected file path array
}
```

**Handler Details**:
- On macOS, brings app to foreground with `app.focus({ steal: true })`
- Supports multiple file selection (`multiSelections`)
- Filters: `.md`, `.markdown`, `*` (all)

---

#### saveFileDialog
Show save dialog

| Property | Value |
|----------|-------|
| **Channel** | `save-file-dialog` |
| **Direction** | Renderer → Main |
| **Parameters** | `defaultName?: string` |
| **Returns** | `Promise<{canceled: boolean; filePath?: string}>` |
| **Implementation** | [`handlers.ts:87-115`](../src/main/ipc/handlers.ts:87-115) |

**Usage Example**:
```typescript
const result = await window.electronAPI.saveFileDialog('document.docx')
if (!result.canceled && result.filePath) {
  console.log(result.filePath) // Selected save path
}
```

**Handler Details**:
- Can set default filename
- Filter: `.docx` (Word document)

---

#### openDirectoryDialog
Show directory selection dialog

| Property | Value |
|----------|-------|
| **Channel** | `open-directory-dialog` |
| **Direction** | Renderer → Main |
| **Parameters** | None |
| **Returns** | `Promise<{canceled: boolean; filePaths?: string[]}>` |
| **Implementation** | [`handlers.ts:57-85`](../src/main/ipc/handlers.ts:57-85) |

**Usage Example**:
```typescript
const result = await window.electronAPI.openDirectoryDialog()
if (!result.canceled && result.filePaths) {
  console.log(result.filePaths[0]) // Selected directory path
}
```

---

#### readFile
Read file content

| Property | Value |
|----------|-------|
| **Channel** | `read-file` |
| **Direction** | Renderer → Main |
| **Parameters** | `filePath: string` |
| **Returns** | `Promise<{name, path, content, size, lastModified}>` |
| **Implementation** | [`handlers.ts:118-135`](../src/main/ipc/handlers.ts:118-135) |

**Usage Example**:
```typescript
const fileData = await window.electronAPI.readFile('/path/to/file.md')
console.log(fileData.content) // File content (UTF-8)
console.log(fileData.size)    // File size (bytes)
console.log(fileData.name)    // Filename
```

**Return Structure** (`FileReadResult`):
```typescript
{
  name: string,         // Filename
  path: string,         // File path
  content: string,      // File content
  size: number,         // File size (bytes)
  lastModified: number  // Last modified time (timestamp)
}
```

---

### Conversion Operation APIs

#### startConversion
Start single file conversion

| Property | Value |
|----------|-------|
| **Channel** | `start-conversion` |
| **Direction** | Renderer → Main |
| **Parameters** | `{inputPath, outputPath, options}` |
| **Returns** | `Promise<{success, message}>` |
| **Implementation** | [`handlers.ts:138-163`](../src/main/ipc/handlers.ts:138-163) |

**Parameter Structure**:
```typescript
{
  inputPath: string,               // Input Markdown file path
  outputPath: string,              // Output DOCX file path
  options: ConversionOptions       // Conversion options
}
```

**ConversionOptions** ([`src/renderer/types/index.ts`](../src/renderer/types/index.ts:10-23)):
```typescript
{
  fontSize?: number,               // Font size (pt)
  fontFamily?: string,            // Font family
  lineHeight?: number,            // Line height
  marginTop?: number,             // Top margin (cm)
  marginBottom?: number,          // Bottom margin (cm)
  marginLeft?: number,           // Left margin (cm)
  marginRight?: number,          // Right margin (cm)
  orientation?: 'portrait' | 'landscape',
  generateToc?: boolean,
  referenceStyle?: 'apa' | 'mla' | 'chicago' | 'harvard',
  imageHandling?: 'embed' | 'link',
  codeBlockStyle?: 'fenced' | 'indented'
}
```

**Usage Example**:
```typescript
await window.electronAPI.startConversion(
  '/path/to/input.md',
  '/path/to/output.docx',
  {
    fontSize: 12,
    fontFamily: 'Arial',
    lineHeight: 1.5,
    marginTop: 2.54,
    orientation: 'portrait'
  }
)
```

**Related Events**:
- `conversion-progress`: Conversion progress
- `conversion-complete`: Conversion complete
- `conversion-error`: Conversion error

---

#### startBatchConversion
Start batch conversion

| Property | Value |
|----------|-------|
| **Channel** | `start-batch-conversion` |
| **Direction** | Renderer → Main |
| **Parameters** | `{inputFiles, outputDirectory, options}` |
| **Returns** | `Promise<BatchConversionResult>` |
| **Implementation** | [`handlers.ts:166-227`](../src/main/ipc/handlers.ts:166-227) |

**Parameter Structure**:
```typescript
{
  inputFiles: string[],           // Input Markdown file path array
  outputDirectory: string,        // Output directory path
  options: ConversionOptions       // Conversion options
}
```

**Usage Example**:
```typescript
await window.electronAPI.startBatchConversion(
  ['/path/to/file1.md', '/path/to/file2.md'],
  '/output/directory',
  { fontSize: 12, fontFamily: 'Arial' }
)
```

**Related Events**:
- `batch-conversion-progress`: Each file conversion progress
- `batch-conversion-complete`: All files conversion complete

---

#### startMergeConversion
Start merge conversion (multiple files → single DOCX)

| Property | Value |
|----------|-------|
| **Channel** | `start-merge-conversion` |
| **Direction** | Renderer → Main |
| **Parameters** | `{inputFiles, outputPath, options}` |
| **Returns** | `Promise<MergeConversionResult>` |
| **Implementation** | [`handlers.ts:230-280`](../src/main/ipc/handlers.ts:230-280) |

**Parameter Structure**:
```typescript
{
  inputFiles: string[],           // Input Markdown file path array
  outputPath: string,            // Output DOCX file path
  options: ConversionOptions     // Conversion options
}
```

**Usage Example**:
```typescript
await window.electronAPI.startMergeConversion(
  ['/path/to/file1.md', '/path/to/file2.md'],
  '/path/to/merged.docx',
  { fontSize: 12, fontFamily: 'Arial' }
)
```

**Merge Behavior**:
- Insert page break (`\newpage`) between each file
- Add each filename as section header
- Don't add header for the first file

**Related Events**:
- `merge-conversion-progress`: Merge progress
- `merge-conversion-complete`: Merge complete

---

#### cancelConversion
Cancel conversion

| Property | Value |
|----------|-------|
| **Channel** | `cancel-conversion` |
| **Direction** | Renderer → Main |
| **Parameters** | None |
| **Returns** | `void` |
| **Implementation** | [`converter.ts:120-125`](../src/main/python/converter.ts:120-125) |

**Usage Example**:
```typescript
window.electronAPI.cancelConversion()
```

**Behavior**:
- Calls Python process `kill()`
- Immediately stops ongoing conversion

---

### Event Listener APIs

#### onConversionProgress
Receive single file conversion progress event

| Property | Value |
|----------|-------|
| **Channel** | `conversion-progress` |
| **Direction** | Main → Renderer |
| **Callback Parameter** | `ConversionProgress` |
| **Implementation** | [`useConversion.ts:15-17`](../src/renderer/hooks/useConversion.ts:15-17) |

**ConversionProgress Structure**:
```typescript
{
  currentFile: number,     // Current file index
  totalFiles: number,      // Total number of files
  currentFileName: string,  // Current filename
  percentage: number,      // Progress (0-100)
  stage: 'preparing' | 'converting' | 'finalizing' | 'completed' | 'error'
}
```

**Usage Example**:
```typescript
window.electronAPI.onConversionProgress((progress) => {
  console.log(`${progress.currentFile}/${progress.totalFiles} - ${progress.percentage}%`)
})
```

---

#### onConversionComplete
Receive single file conversion complete event

| Property | Value |
|----------|-------|
| **Channel** | `conversion-complete` |
| **Direction** | Main → Renderer |
| **Callback Parameter** | `ConversionResult` |
| **Implementation** | [`useConversion.ts:19-24`](../src/renderer/hooks/useConversion.ts:19-24) |

**ConversionResult Structure**:
```typescript
{
  success: boolean,      // Success status
  message: string,      // Message
  outputPath?: string   // Output file path
}
```

**Usage Example**:
```typescript
window.electronAPI.onConversionComplete((result) => {
  if (result.success) {
    console.log('Conversion complete:', result.outputPath)
  }
})
```

---

#### onConversionError
Receive conversion error event

| Property | Value |
|----------|-------|
| **Channel** | `conversion-error` |
| **Direction** | Main → Renderer |
| **Callback Parameter** | `string` (error message) |
| **Implementation** | [`useConversion.ts:26-30`](../src/renderer/hooks/useConversion.ts:26-30) |

**Usage Example**:
```typescript
window.electronAPI.onConversionError((errorMessage) => {
  console.error('Conversion error:', errorMessage)
})
```

---

#### onBatchConversionProgress
Receive batch conversion progress event

| Property | Value |
|----------|-------|
| **Channel** | `batch-conversion-progress` |
| **Direction** | Main → Renderer |
| **Callback Parameter** | `BatchConversionProgress` |
| **Implementation** | [`useBatchConversion.ts:15-17`](../src/renderer/hooks/useBatchConversion.ts:15-17) |

**BatchConversionProgress Structure**:
```typescript
{
  currentFile: number,      // Current file index
  totalFiles: number,       // Total number of files
  currentFileName: string,  // Current filename
  percentage: number,      // Progress (0-100)
  status: 'converting' | 'completed' | 'error',
  processedFiles: string[], // Processed file path list
  errors: Array<{fileName, error}>  // Error list
}
```

---

#### onBatchConversionComplete
Receive batch conversion complete event

| Property | Value |
|----------|-------|
| **Channel** | `batch-conversion-complete` |
| **Direction** | Main → Renderer |
| **Callback Parameter** | `BatchConversionResult` |
| **Implementation** | [`useBatchConversion.ts:19-24`](../src/renderer/hooks/useBatchConversion.ts:19-24) |

**BatchConversionResult Structure**:
```typescript
{
  success: boolean,                    // Overall success status (true if no errors)
  message: string,                    // Result message
  outputDirectory?: string,            // Output directory
  totalFiles: number,                 // Total number of files
  processedFiles: number,             // Number of processed files
  errors: Array<{fileName: string; error: string}>    // Error list
}
```

---

#### onMergeConversionProgress
Receive merge conversion progress event

| Property | Value |
|----------|-------|
| **Channel** | `merge-conversion-progress` |
| **Direction** | Main → Renderer |
| **Callback Parameter** | `MergeConversionProgress` |
| **Implementation** | [`useMergeConversion.ts:15-17`](../src/renderer/hooks/useMergeConversion.ts:15-17) |

**MergeConversionProgress Structure**:
```typescript
{
  currentFile: number,
  totalFiles: number,
  currentFileName: string,
  percentage: number,
  status: 'preparing' | 'merging' | 'converting' | 'completed' | 'error'
}
```

---

#### onMergeConversionComplete
Receive merge conversion complete event

| Property | Value |
|----------|-------|
| **Channel** | `merge-conversion-complete` |
| **Direction** | Main → Renderer |
| **Callback Parameter** | `MergeConversionResult` |
| **Implementation** | [`useMergeConversion.ts:19-24`](../src/renderer/hooks/useMergeConversion.ts:19-24) |

**MergeConversionResult Structure**:
```typescript
{
  success: boolean,
  message: string,
  outputPath?: string,
  totalFiles: number,
  error?: string
}
```

---

### App Operation APIs

#### getAppVersion
Get app version

| Property | Value |
|----------|-------|
| **Channel** | `get-app-version` |
| **Direction** | Renderer → Main |
| **Parameters** | None |
| **Returns** | `Promise<string>` (e.g., "v1.2.1") |
| **Implementation** | [`handlers.ts:283-286`](../src/main/ipc/handlers.ts:283-286) |

**Usage Example**:
```typescript
const version = await window.electronAPI.getAppVersion()
console.log(version) // "v1.2.1"
```

---

#### quitApp
Quit app

| Property | Value |
|----------|-------|
| **Channel** | `quit-app` |
| **Direction** | Renderer → Main |
| **Parameters** | None |
| **Returns** | `void` |
| **Implementation** | [`handlers.ts:289-293`](../src/main/ipc/handlers.ts:289-293) |

**Behavior**:
- Calls Python process `cleanup()`
- Calls `app.quit()`

---

#### removeAllListeners
Remove all IPC event listeners

| Property | Value |
|----------|-------|
| **Direction** | Renderer (internal) |
| **Parameters** | None |
| **Returns** | `void` |
| **Implementation** | [`preload/index.ts:39-47`](../src/preload/index.ts:39-47) |

**Usage Example**:
```typescript
window.electronAPI.removeAllListeners()
```

**Removed Listeners**:
- `conversion-progress`
- `conversion-complete`
- `conversion-error`
- `batch-conversion-progress`
- `batch-conversion-complete`
- `merge-conversion-progress`
- `merge-conversion-complete`

---

## IPC Channel Constants

All channel constants are defined in [`src/main/ipc/channels.ts`](../src/main/ipc/channels.ts).

```typescript
export const IPC_CHANNELS = {
  // File operations
  OPEN_FILE_DIALOG: 'open-file-dialog',
  SAVE_FILE_DIALOG: 'save-file-dialog',
  READ_FILE: 'read-file',
  OPEN_DIRECTORY_DIALOG: 'open-directory-dialog',
  
  // Conversion operations
  START_CONVERSION: 'start-conversion',
  START_BATCH_CONVERSION: 'start-batch-conversion',
  START_MERGE_CONVERSION: 'start-merge-conversion',
  CANCEL_CONVERSION: 'cancel-conversion',
  CONVERSION_PROGRESS: 'conversion-progress',
  CONVERSION_COMPLETE: 'conversion-complete',
  CONVERSION_ERROR: 'conversion-error',
  BATCH_CONVERSION_PROGRESS: 'batch-conversion-progress',
  BATCH_CONVERSION_COMPLETE: 'batch-conversion-complete',
  MERGE_CONVERSION_PROGRESS: 'merge-conversion-progress',
  MERGE_CONVERSION_COMPLETE: 'merge-conversion-complete',
  
  // App operations
  GET_APP_VERSION: 'get-app-version',
  QUIT_APP: 'quit-app',
} as const
```

**Important**: Always use `IPC_CHANNELS` constants instead of hardcoded channel strings.

## Related Documents

- [Data Models](05-Data-Models.md) - Type definitions details
- [Architecture](02-Architecture.md) - IPC communication flow
- [Module Reference - IPC Handlers](03-Module-Reference/ipc/handlers.md) - Handler implementation

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.0 | Initial API documentation created |