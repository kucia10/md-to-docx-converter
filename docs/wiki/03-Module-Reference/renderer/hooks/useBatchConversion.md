# useBatchConversion

## Summary
- **Responsibility**: Batch file conversion (multiple file bulk conversion) state management and IPC communication
- **Primary Users/Callers**: [`App.tsx`](../../../../../../src/renderer/App.tsx), batch conversion components
- **Core Entry Point**: [`useBatchConversion()`](../../../../../../src/renderer/hooks/useBatchConversion.ts:5)

## Architecture Position
- **Layer**: Renderer Process - Custom Hooks (State Management Layer)
- **Upstream/Downstream Dependencies**:
  - Depends on: `types` ([`ConversionOptions`](../../../../../../src/renderer/types/index.ts)), `window.electronAPI`
  - Used by: React components (batch conversion mode)
- **Role in Runtime Flow**: Multiple file conversion start → per-file progress tracking → completion/error handling

## Public Interface

### Return Value
```typescript
{
  isConverting: boolean,           // Whether conversion is in progress
  batchProgress: BatchConversionProgress | null,  // Batch progress information
  batchError: string | null,       // Error message
  batchResult: BatchConversionResult | null,    // Batch conversion result
  startBatchConversion: (inputFiles: string[], outputDirectory: string, options: ConversionOptions) => Promise<void>,
  cancelBatchConversion: () => void,
  resetBatchConversion: () => void
}
```

### startBatchConversion
- **Signature**: `startBatchConversion(inputFiles, outputDirectory, options) → Promise<void>`
- **Inputs**:
  - `inputFiles`: Array of Markdown file paths to convert
  - `outputDirectory`: Path to directory for saving result files
  - `options`: [`ConversionOptions`](../../../../../../src/renderer/types/index.ts) (common conversion options)
- **Outputs**: None (async execution)
- **Errors/Exceptions**: On IPC communication failure, stores error message in `batchError`
- **Side Effects**: Sets `isConverting` to true, makes IPC call
- **Example**:
```typescript
await startBatchConversion(
  ['/path/to/file1.md', '/path/to/file2.md'],
  '/path/to/output/dir',
  { fontFamily: 'Arial', fontSize: 12, marginTop: 2.54 }
)
```

### cancelBatchConversion
- **Signature**: `cancelBatchConversion() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Calls conversion cancel IPC, resets state

### resetBatchConversion
- **Signature**: `resetBatchConversion() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Resets all state

## Internal Behavior

### Main Flow
1. **Initialization**: Register IPC event listeners via `useEffect`
   - [`onBatchConversionProgress`](../../../../../../src/renderer/hooks/useBatchConversion.ts:15): Receives batch progress
   - [`onBatchConversionComplete`](../../../../../../src/renderer/hooks/useBatchConversion.ts:19): Receives completion

2. **Start Batch Conversion**: Call `startBatchConversion()`
   - Initialize state (`isConverting: true`, set initial progress)
   - Initialize `processedFiles` empty array, `errors` empty array
   - IPC invoke (`start-batch-conversion` channel)
   - Send to Main Process

3. **Progress Update**: Receive `batch-conversion-progress` event from Main Process
   - Update state with `setBatchProgress()`
   - `processedFiles`: List of successfully processed files
   - `errors`: List of errors that occurred during processing

4. **Completion/Error Handling**: Receive completion event from Main Process
   - Store result with `setBatchResult()`
   - Set `isConverting: false`

5. **Cleanup**: Call `removeAllListeners()` on component unmount

### Core Rules/Algorithms
- Initial progress: `{ currentFile: 0, totalFiles: inputFiles.length, currentFileName: '', percentage: 0, status: 'converting', processedFiles: [], errors: [] }`
- Individual file errors are accumulated in the `errors` array while the entire batch conversion continues
- On error, use i18next translation: `t('errors.generalConversionError')`

### Edge Cases
- Empty array passed: Handled by Main Process, error event sent
- Some files fail conversion: Continue converting remaining files, result includes success/failure list
- Calling `startBatchConversion()` again during conversion: Cancel previous conversion then start new one

## Data/Models

### BatchConversionProgress
```typescript
{
  currentFile: number,        // Index of currently processing file
  totalFiles: number,         // Total file count
  currentFileName: string,    // Current filename
  percentage: number,         // Overall progress percentage (0-100)
  status: 'converting' | 'completed',
  processedFiles: string[],   // List of successfully processed file paths
  errors: string[]            // List of error messages that occurred
}
```

### BatchConversionResult
```typescript
{
  success: boolean,
  totalFiles: number,
  successCount: number,
  failedFiles: Array<{ path: string, error: string }>
}
```

## Configuration/Environment Variables
- None used (runtime only)

## Dependencies

### Internal Modules
- [`types/index.ts`](../../../../../../src/renderer/types/index.ts): `ConversionOptions`, `BatchConversionProgress`, `BatchConversionResult`

### External Libraries/Services
- React: `useState`, `useCallback`, `useEffect`
- i18next: `useTranslation()`
- Electron: `window.electronAPI` (exposed by preload script)

## Testing
- Related tests: `vitest` unit tests (add if needed)
- Coverage/Gaps: Currently no tests, hook unit tests needed

## Operations/Observability

### Logging
- File read failure: Handled by Main Process, sent as error event

### Metrics/Tracing
- Provides user feedback via overall progress percentage
- Completion ratio can be calculated with `processedFiles.length` / `totalFiles`

### Alert Points
- Display error in UI when `batchError` is not null
- Show loading state when `isConverting` is true
- Display `failedFiles` list when some files fail

## Related IPC Channels
- Request: `start-batch-conversion`, `cancel-conversion`
- Event: `batch-conversion-progress`, `batch-conversion-complete`

## Differences from useConversion
| Feature | useConversion | useBatchConversion |
|---------|---------------|---------------------|
| File Count | Single file | Multiple files |
| Progress | Single file progress | Overall progress + per-file progress |
| Result | Single file success/failure | Success/failure file list |
| Output Path | Single file path | Directory path |

## Change History (Optional)
- v1.0: Initial implementation