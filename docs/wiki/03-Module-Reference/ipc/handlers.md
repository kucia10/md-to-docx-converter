# IPC Handlers

## Summary
- **Responsibility**: IPC channel handler implementation (file dialogs, conversion operations, app operations)
- **Main Users/Callers**: Main Process (`main.ts` → `setupIpcHandlers()`), Renderer Process (via Preload)
- **Key Entry Point**: `setupIpcHandlers()`

## Location in Architecture
- **Layer**: Main Process / IPC Communication Layer
- **Upstream Dependencies**: [`main.ts`](../main-process/main.md) (caller), [`channels.ts`](channels.md) (import)
- **Downstream Dependencies**: [`python/converter.ts`](../main-process/python-converter.md)
- **Role in Runtime Flow**: Renderer → Main IPC request processing → Python conversion execution → Event transmission to Renderer

## Public Interface

### setupIpcHandlers()
Main function that registers all IPC handlers

**Signature**:
```typescript
export function setupIpcHandlers(): void
```

**Input**: None

**Output**: None (side effect: Register handlers to ipcMain)

**Errors/Exceptions**: None

**Side Effects**:
- Create and store `PythonConverter` instance
- Register all IPC channel handlers

**Example**:
```typescript
// Called in main.ts
app.whenReady().then(() => {
  createWindow()
  setupIpcHandlers()  // Called here
})
```

## Internal Behavior

### Initialization Logic

```typescript
export function setupIpcHandlers(): void {
  // Python converter initialization
  pythonConverter = new PythonConverter()
  
  // File dialog handlers
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, ...)
  ipcMain.handle(IPC_CHANNELS.SAVE_FILE_DIALOG, ...)
  ipcMain.handle(IPC_CHANNELS.OPEN_DIRECTORY_DIALOG, ...)
  
  // Conversion handlers
  ipcMain.handle(IPC_CHANNELS.START_CONVERSION, ...)
  ipcMain.handle(IPC_CHANNELS.START_BATCH_CONVERSION, ...)
  ipcMain.handle(IPC_CHANNELS.START_MERGE_CONVERSION, ...)
  
  // App handlers
  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, ...)
  ipcMain.on(IPC_CHANNELS.QUIT_APP, ...)
}
```

### Handler List

| Handler | Channel | Function | Lines |
|----------|--------|---------|--------|
| File Dialog | `OPEN_FILE_DIALOG` | Display file selection dialog | 21-55 |
| Directory Dialog | `OPEN_DIRECTORY_DIALOG` | Display directory selection dialog | 57-85 |
| Save Dialog | `SAVE_FILE_DIALOG` | Display save dialog | 87-115 |
| Read File | `READ_FILE` | Read file content | 118-135 |
| Start Conversion | `START_CONVERSION` | Single file conversion | 138-163 |
| Start Batch Conversion | `START_BATCH_CONVERSION` | Multiple files batch conversion | 166-227 |
| Start Merge Conversion | `START_MERGE_CONVERSION` | Multiple files merge conversion | 230-280 |
| Get Version | `GET_APP_VERSION` | Get app version | 283-286 |
| Quit App | `QUIT_APP` | Quit app | 289-293 |

### Key Rules/Algorithms

#### 1. macOS File Dialog Focus

```typescript
if (process.platform === 'darwin') {
  app.focus({ steal: true })
}
```

**Reason**: Prevent file dialogs from opening in background in macOS GUI apps

#### 2. Window Reference Retrieval

```typescript
function getWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0] || null
}
```

**Reason**: Set dialog's parent window for proper focus management

#### 3. Python Converter Validation

```typescript
if (!pythonConverter) {
  throw new Error('Python converter not initialized')
}
```

**Reason**: Prevent initialization errors, ensure safe conversion execution

### Edge Cases

| Situation | Handling Method |
|-----------|-----------------|
| File dialog canceled | Return `canceled: true` |
| Conversion error occurs | Send `CONVERSION_ERROR` event + throw exception |
| File fails during batch conversion | Continue, include errors in final result |
| No window available | Display default dialog instead of focused window |

## Data/Models

**Related Types**:
- [`ConversionOptions`](../../../src/renderer/types/index.ts:10-23) - Conversion options
- [`BatchConversionProgress`](../../../src/renderer/types/index.ts:61-69) - Batch progress
- [`BatchConversionResult`](../../../src/renderer/types/index.ts:71-78) - Batch result
- [`MergeConversionProgress`](../../../src/renderer/types/index.ts:80-86) - Merge progress
- [`MergeConversionResult`](../../../src/renderer/types/index.ts:88-94) - Merge result

## Configuration/Environment Variables
None

## Dependencies

### Internal Modules
- [`channels.ts`](channels.md) - IPC channel constants
- [`python/converter.ts`](../main-process/python-converter.md) - Python bridge class

### External Libraries/Services
- `electron` - `ipcMain`, `dialog`, `app`, `BrowserWindow`
- `fs` - File system operations
- `path` - Path manipulation

## Testing
- **Related Tests**: None (currently)
- **Coverage/Gaps**: Main Process handler testing needed

## Operations/Observability

### Logging
```typescript
console.log('[IPC] Setting up IPC handlers...')
console.log('[IPC] OPEN_FILE_DIALOG invoked')
console.log('[IPC] Python converter initialized')
```

**Log Levels**: Info (basic operations), Error (errors)

## Detailed Handler Description

### File Dialog Handlers

#### OPEN_FILE_DIALOG
```typescript
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
  // macOS focus handling
  if (process.platform === 'darwin') {
    app.focus({ steal: true })
  }
  
  const win = getWindow()
  const dialogOptions: Electron.OpenDialogOptions = {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }
  
  return await dialog.showOpenDialog(win || dialog, dialogOptions)
})
```

### Conversion Handlers

#### START_CONVERSION
```typescript
ipcMain.handle(IPC_CHANNELS.START_CONVERSION, async (_event, { inputPath, outputPath, options }) => {
  const result = await pythonConverter.convertMarkdownToDocx(inputPath, outputPath, options)
  
  _event.sender.send(IPC_CHANNELS.CONVERSION_COMPLETE, {
    success: true,
    message: 'Conversion completed successfully',
    outputPath
  })
  
  return result
})
```

#### START_BATCH_CONVERSION
```typescript
ipcMain.handle(IPC_CHANNELS.START_BATCH_CONVERSION, async (event, { inputFiles, outputDirectory, options }) => {
  for (let i = 0; i < inputFiles.length; i++) {
    const inputFile = inputFiles[i]
    const outputPath = path.join(outputDirectory, `${baseName}.docx`)
    
    // Send progress event
    event.sender.send(IPC_CHANNELS.BATCH_CONVERSION_PROGRESS, {
      currentFile: i + 1,
      totalFiles: inputFiles.length,
      percentage: Math.round(((i + 1) / inputFiles.length) * 100)
    })
    
    try {
      await pythonConverter.convertMarkdownToDocx(inputFile, outputPath, options)
      processedFiles.push(outputPath)
    } catch (error) {
      errors.push({ fileName, error: errorMessage })
    }
  }
  
  // Send completion event
  event.sender.send(IPC_CHANNELS.BATCH_CONVERSION_COMPLETE, { ...result })
})
```

#### START_MERGE_CONVERSION
```typescript
ipcMain.handle(IPC_CHANNELS.START_MERGE_CONVERSION, async (event, { inputFiles, outputPath, options }) => {
  await pythonConverter.mergeFilesToDocx(inputFiles, outputPath, options)
  
  event.sender.send(IPC_CHANNELS.MERGE_CONVERSION_COMPLETE, {
    success: true,
    message: `${totalFiles} files merged into single DOCX`,
    outputPath
  })
})
```

### App Handlers

#### QUIT_APP
```typescript
ipcMain.on(IPC_CHANNELS.QUIT_APP, () => {
  if (pythonConverter) {
    pythonConverter.cleanup()  // Python process cleanup
  }
})
```

## Related Documents

- [IPC Channels](channels.md) - Channel definitions
- [Python Converter](../main-process/python-converter.md) - Python bridge
- [API/Interface](../../04-API-Interface.md) - API details

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-29 | 1.0 | Initial documentation created |