# useConversion

## Summary
- **Responsibility**: Single file conversion state management and IPC communication
- **Primary Users/Callers**: [`App.tsx`](../../../../../../src/renderer/App.tsx), conversion components
- **Core Entry Point**: [`useConversion()`](../../../../../../src/renderer/hooks/useConversion.ts:5)

## Architecture Position
- **Layer**: Renderer Process - Custom Hooks (State Management Layer)
- **Upstream/Downstream Dependencies**:
  - Depends on: `types` ([`ConversionOptions`](../../../../../../src/renderer/types/index.ts)), `window.electronAPI`
  - Used by: React components (single conversion mode)
- **Role in Runtime Flow**: Single file conversion start → progress tracking → completion/error handling

## Public Interface

### Return Value
```typescript
{
  isConverting: boolean,           // Whether conversion is in progress
  conversionProgress: ConversionProgress | null,  // Progress information
  conversionError: string | null,  // Error message
  conversionResult: ConversionResult | null,  // Conversion result
  startConversion: (inputPath: string, outputPath: string, options: ConversionOptions) => Promise<void>,
  cancelConversion: () => void,
  resetConversion: () => void
}
```

### startConversion
- **Signature**: `startConversion(inputPath, outputPath, options) → Promise<void>`
- **Inputs**:
  - `inputPath`: Path to the Markdown file to convert
  - `outputPath`: Path for the resulting DOCX file
  - `options`: [`ConversionOptions`](../../../../../../src/renderer/types/index.ts) (font, margins, page settings, etc.)
- **Outputs**: None (async execution)
- **Errors/Exceptions**: On IPC communication failure, stores error message in `conversionError`
- **Side Effects**: Sets `isConverting` to true, makes IPC call
- **Example**:
```typescript
await startConversion('/path/to/file.md', '/path/to/output.docx', {
  fontFamily: 'Arial',
  fontSize: 12,
  marginTop: 2.54,
  // ... other options
})
```

### cancelConversion
- **Signature**: `cancelConversion() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Calls conversion cancel IPC, resets state

### resetConversion
- **Signature**: `resetConversion() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Resets all state

## Internal Behavior

### Main Flow
1. **Initialization**: Register IPC event listeners via `useEffect`
   - [`onConversionProgress`](../../../../../../src/renderer/hooks/useConversion.ts:15): Receives progress updates
   - [`onConversionComplete`](../../../../../../src/renderer/hooks/useConversion.ts:19): Receives completion
   - [`onConversionError`](../../../../../../src/renderer/hooks/useConversion.ts:26): Receives errors

2. **Start Conversion**: Call `startConversion()`
   - Initialize state (`isConverting: true`, set initial progress)
   - IPC invoke (`start-conversion` channel)
   - Send to Main Process

3. **Progress Update**: Receive `conversion-progress` event from Main Process
   - Update state with `setConversionProgress()`

4. **Completion/Error Handling**: Receive completion/error event from Main Process
   - Completion: `setConversionResult()`, `isConverting: false`
   - Error: `setConversionError()`, `isConverting: false`

5. **Cleanup**: Call `removeAllListeners()` on component unmount

### Core Rules/Algorithms
- Initial progress: `{ currentFile: 0, totalFiles: 1, currentFileName: '', percentage: 0, stage: 'preparing' }`
- On error, use i18next translation: `t('errors.singleConversionError')`

### Edge Cases
- Calling `startConversion()` again during conversion: Cancel previous conversion then start new one
- IPC connection failure: Display error message
- File read failure: Handled by Main Process, error event sent

## Data/Models

### ConversionProgress
```typescript
{
  currentFile: number,      // Index of currently processing file
  totalFiles: number,       // Total file count (always 1 for single conversion)
  currentFileName: string,   // Current filename
  percentage: number,       // Progress percentage (0-100)
  stage: 'preparing' | 'converting' | 'finalizing'
}
```

### ConversionResult
```typescript
{
  success: boolean,
  outputPath?: string,
  error?: string
}
```

## Configuration/Environment Variables
- None used (runtime only)

## Dependencies

### Internal Modules
- [`types/index.ts`](../../../../../../src/renderer/types/index.ts): `ConversionOptions`, `ConversionProgress`, `ConversionResult`

### External Libraries/Services
- React: `useState`, `useCallback`, `useEffect`
- i18next: `useTranslation()`
- Electron: `window.electronAPI` (exposed by preload script)

## Testing
- Related tests: `vitest` unit tests (add if needed)
- Coverage/Gaps: Currently no tests, hook unit tests needed

## Operations/Observability

### Logging
- File read failure: `console.error('Error reading file:', file.name, error)`

### Metrics/Tracing
- No conversion time tracking (performed by Main Process)
- Provides user feedback via progress percentage

### Alert Points
- Display error in UI when `conversionError` is not null
- Show loading state when `isConverting` is true

## Related IPC Channels
- Request: `start-conversion`, `cancel-conversion`
- Event: `conversion-progress`, `conversion-complete`, `conversion-error`

## Change History (Optional)
- v1.0: Initial implementation