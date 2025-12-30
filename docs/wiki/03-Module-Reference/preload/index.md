# Preload Module (index.ts)

## Summary
- **Responsibility**: IPC communication bridge role between Main process and Renderer process. Safely expose API to Renderer process via Electron's `contextBridge`
- **Main Users/Callers**: All components and hooks in Renderer process
- **Key Entry Point**: `electronAPI` object (lines 4-48)

## Location in Architecture
- **Layer**: Preload Layer (between Main and Renderer)
- **Upstream/Downstream Dependencies**:
  - Upstream: Main process ([`src/main/ipc/handlers.ts`](../../../src/main/ipc/handlers.ts:1))
  - Downstream: Renderer process (exposed as window.electronAPI)
- **Role in Runtime Flow**: Communication layer between Main process's IPC handlers and Renderer process's UI logic

## Public Interface

### window.electronAPI
API object accessible as `window.electronAPI` in Renderer process

#### openFileDialog()
- Signature: `() => Promise<Electron.OpenDialogReturnValue>`
- Input: None
- Output: File selection dialog result
- Errors/Exceptions: Electron dialog related errors
- Side Effect: Display dialog window (app focus on macOS)
- Example: 
```typescript
const result = await window.electronAPI.openFileDialog()
```

#### saveFileDialog()
- Signature: `(defaultName?: string) => Promise<Electron.SaveDialogReturnValue>`
- Input: `defaultName` - Default filename to save
- Output: File save dialog result
- Errors/Exceptions: Electron dialog related errors
- Side Effect: Display dialog window
- Example:
```typescript
const result = await window.electronAPI.saveFileDialog('output.docx')
```

#### openDirectoryDialog()
- Signature: `() => Promise<Electron.OpenDialogReturnValue>`
- Input: None
- Output: Directory selection dialog result
- Errors/Exceptions: Electron dialog related errors
- Side Effect: Display dialog window

#### readFile()
- Signature: `(filePath: string) => Promise<{name, path, content, size, lastModified}>`
- Input: `filePath` - File path
- Output: File metadata and content object
- Errors/Exceptions: Error on file read failure
- Side Effect: None (read only)

#### startConversion()
- Signature: `(inputPath: string, outputPath: string, options: any) => Promise<any>`
- Input: 
  - `inputPath`: Input Markdown file path
  - `outputPath`: Output DOCX file path
  - `options`: Conversion options object
- Output: Start conversion operation
- Errors/Exceptions: Conversion related errors
- Side Effect: Execute Python conversion process in background

#### startBatchConversion()
- Signature: `(inputFiles: string[], outputDirectory: string, options: any) => Promise<any>`
- Input:
  - `inputFiles`: Input file path array
  - `outputDirectory`: Output directory path
  - `options`: Conversion options object
- Output: Start batch conversion operation
- Errors/Exceptions: Batch conversion related errors
- Side Effect: Convert multiple files sequentially

#### startMergeConversion()
- Signature: `(inputFiles: string[], outputPath: string, options: any) => Promise<any>`
- Input:
  - `inputFiles`: Input file path array
  - `outputPath`: Merged output file path
  - `options`: Conversion options object
- Output: Start merge conversion operation
- Errors/Exceptions: Merge conversion related errors
- Side Effect: Merge multiple files into one and convert

#### cancelConversion()
- Signature: `() => void`
- Input: None
- Output: None
- Errors/Exceptions: None
- Side Effect: Cancel ongoing conversion operation

#### onConversionProgress()
- Signature: `(callback: (progress: any) => void) => void`
- Input: `callback` - Progress update callback function
- Output: None
- Errors/Exceptions: None
- Side Effect: Register IPC event listener

#### onConversionComplete()
- Signature: `(callback: (result: any) => void) => void`
- Input: `callback` - Completion result callback function
- Output: None
- Errors/Exceptions: None
- Side Effect: Register IPC event listener

#### onConversionError()
- Signature: `(callback: (error: any) => void) => void`
- Input: `callback` - Error callback function
- Output: None
- Errors/Exceptions: None
- Side Effect: Register IPC event listener

#### onBatchConversionProgress()
- Signature: `(callback: (progress: any) => void) => void`
- Input: `callback` - Batch conversion progress callback
- Output: None
- Side Effect: Register IPC event listener

#### onBatchConversionComplete()
- Signature: `(callback: (result: any) => void) => void`
- Input: `callback` - Batch conversion complete callback
- Output: None
- Side Effect: Register IPC event listener

#### onMergeConversionProgress()
- Signature: `(callback: (progress: any) => void) => void`
- Input: `callback` - Merge conversion progress callback
- Output: None
- Side Effect: Register IPC event listener

#### onMergeConversionComplete()
- Signature: `(callback: (result: any) => void) => void`
- Input: `callback` - Merge conversion complete callback
- Output: None
- Side Effect: Register IPC event listener

#### getAppVersion()
- Signature: `() => Promise<string>`
- Input: None
- Output: App version string (e.g., "v1.0.0")
- Errors/Exceptions: None
- Side Effect: None

#### quitApp()
- Signature: `() => void`
- Input: None
- Output: None
- Errors/Exceptions: None
- Side Effect: Quit app, clean up Python process

#### removeAllListeners()
- Signature: `() => void`
- Input: None
- Output: None
- Errors/Exceptions: None
- Side Effect: Remove all IPC event listeners (prevent memory leaks)

## Internal Behavior

### Main Flows
1. **Initialization**: Preload script loaded by Main process ([`src/main/main.ts:26`](../../../src/main/main.ts:26))
2. **API Exposure**: Expose [`electronAPI`](../../../src/preload/index.ts:51) via `contextBridge.exposeInMainWorld()`
3. **IPC Communication**: Pass calls from Renderer → Preload → Main process
4. **Event Reception**: Pass events from Main → Preload → Renderer

### Key Rules/Algorithms
- **IPC Channel Consistency**: Only use channel constants defined in [`src/main/ipc/channels.ts`](../../../src/main/ipc/channels.ts:1)
- **Event Listener Cleanup**: Must call `removeAllListeners()` on component unmount
- **Security**: Use `contextBridge` to restrict Node.js access

### Edge Cases
- **macOS File Dialog**: `app.focus({ steal: true })` in [`handlers.ts`](../../../src/main/ipc/handlers.ts:1) handles focus
- **Listener Leaks**: Memory leak possible if not cleaned up in components

## Data/Models
- Models/DTOs: 
  - `ConversionProgress`: `{ currentFile, totalFiles, currentFileName, percentage, stage/status }`
  - `ConversionResult`: `{ success, message, outputPath }`
  - `BatchConversionResult`: `{ success, processedCount, errorCount, processedFiles, errors }`
  - `MergeConversionResult`: `{ success, outputPath, inputFileCount }`
- Schema/Tables: None
- Serialization Format: JSON (IPC communication)

## Configuration/Environment Variables
- Environment Dependencies: Electron [`contextBridge`](../../../src/preload/index.ts:51) API
- IPC Channels: Constants defined in [`src/main/ipc/channels.ts`](../../../src/main/ipc/channels.ts:1)

## Dependencies
- Internal Modules: [`src/main/ipc/channels.ts`](../../../src/main/ipc/channels.ts:1)
- External Libraries/Services: 
  - `electron`: `contextBridge`, `ipcRenderer`

## Testing
- Related Tests: None (needs confirmation)
- Coverage/Gaps: IPC communication testing missing

## Operations/Observability
- Logging: None (IPC logs handled in handlers.ts)
- Metrics/Tracing: None
- Alert Points: None

## Related Documents
- [IPC Channels](../ipc/channels.md)
- [IPC Handlers](../ipc/handlers.md)
- [Main Process](../main-process/main.md)