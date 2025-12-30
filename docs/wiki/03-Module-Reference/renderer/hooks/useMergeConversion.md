# useMergeConversion

## Summary
- **Responsibility**: Merge conversion (merge multiple files into single DOCX) state management and IPC communication
- **Primary Users/Callers**: [`App.tsx`](../../../../../src/renderer/App.tsx), merge conversion components
- **Core Entry Point**: [`useMergeConversion()`](../../../../../src/renderer/hooks/useMergeConversion.ts:5)

## Architecture Position
- **Layer**: Renderer Process - Custom Hooks (State Management Layer)
- **Upstream/Downstream Dependencies**:
  - Depends on: `types` ([`ConversionOptions`](../../../../../src/renderer/types/index.ts)), `window.electronAPI`
  - Used by: React components (merge conversion mode)
- **Role in Runtime Flow**: Multiple file merge start → progress tracking → single DOCX generation → completion/error handling

## Public Interface

### Return Value
```typescript
{
  isConverting: boolean,           // Whether conversion is in progress
  mergeProgress: MergeConversionProgress | null,  // Merge progress information
  mergeError: string | null,       // Error message
  mergeResult: MergeConversionResult | null,    // Merge conversion result
  startMergeConversion: (inputFiles: string[], outputPath: string, options: ConversionOptions) => Promise<void>,
  cancelMergeConversion: () => void,
  resetMergeConversion: () => void
}
```

### startMergeConversion
- **Signature**: `startMergeConversion(inputFiles, outputPath, options) → Promise<void>`
- **Inputs**:
  - `inputFiles`: Array of Markdown file paths to merge (order is important)
  - `outputPath`: Path for the resulting merged DOCX file
  - `options`: [`ConversionOptions`](../../../../../src/renderer/types/index.ts) (common conversion options)
- **Outputs**: None (async execution)
- **Errors/Exceptions**: On IPC communication failure, stores error message in `mergeError`
- **Side Effects**: Sets `isConverting` to true, makes IPC call
- **Example**:
```typescript
await startMergeConversion(
  ['/path/to/intro.md', '/path/to/chapter1.md', '/path/to/chapter2.md'],
  '/path/to/merged.docx',
  { fontFamily: 'Arial', fontSize: 12, marginTop: 2.54 }
)
```

### cancelMergeConversion
- **Signature**: `cancelMergeConversion() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Calls conversion cancel IPC, resets state

### resetMergeConversion
- **Signature**: `resetMergeConversion() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Resets all state

## Internal Behavior

### Main Flow
1. **Initialization**: Register IPC event listeners via `useEffect`
   - [`onMergeConversionProgress`](../../../../../src/renderer/hooks/useMergeConversion.ts:15): Receives merge progress
   - [`onMergeConversionComplete`](../../../../../src/renderer/hooks/useMergeConversion.ts:19): Receives completion

2. **Start Merge Conversion**: Call `startMergeConversion()`
   - Initialize state (`isConverting: true`, set initial progress)
   - Initial state: `status: 'preparing'`
   - IPC invoke (`start-merge-conversion` channel)
   - Send to Main Process

3. **Progress Update**: Receive `merge-conversion-progress` event from Main Process
   - Update state with `setMergeProgress()`
   - `status`: 'preparing' → 'merging' → 'converting'

4. **Completion/Error Handling**: Receive completion event from Main Process
   - Store result with `setMergeResult()`
   - Set `isConverting: false`

5. **Cleanup**: Call `removeAllListeners()` on component unmount

### Core Rules/Algorithms
- Initial progress: `{ currentFile: 0, totalFiles: inputFiles.length, currentFileName: '', percentage: 0, status: 'preparing' }`
- File order is important: Files are merged in the order adjusted by user via drag-and-drop
- On error, use i18next translation: `t('errors.generalConversionError')`

### Special Behavior of Merge Conversion
1. **Python Side**: [`merge_files()`](../../../../../src/python/convert.py) function in [`convert.py`](../../../../../src/python/convert.py)
2. **File Separation**: Insert `---\n\n# {filename}\n\n` separator between each file
3. **Page Separation**: LaTeX `\newpage` command starts each file on a new page
4. **Temporary File**: Save merged Markdown as temporary file, then convert with Pandoc
5. **Cleanup**: Delete temporary file after conversion

### Edge Cases
- Empty array passed: Handled by Main Process, error event sent
- Single file passed: Perform single conversion without merging
- File read failure: Entire merge fails, error event sent
- Calling `startMergeConversion()` again during conversion: Cancel previous conversion then start new one

## Data/Models

### MergeConversionProgress
```typescript
{
  currentFile: number,        // Index of currently processing file
  totalFiles: number,         // Total file count
  currentFileName: string,    // Current filename
  percentage: number,         // Overall progress percentage (0-100)
  status: 'preparing' | 'merging' | 'converting'
}
```

### MergeConversionResult
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
- [`types/index.ts`](../../../../../src/renderer/types/index.ts): `ConversionOptions`, `MergeConversionProgress`, `MergeConversionResult`

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
- Shows file merging progress with `currentFile` / `totalFiles`

### Alert Points
- Display error in UI when `mergeError` is not null
- Show loading state when `isConverting` is true
- Show stage-by-stage status: 'preparing' → 'merging' → 'converting'

## Related IPC Channels
- Request: `start-merge-conversion`, `cancel-conversion`
- Event: `merge-conversion-progress`, `merge-conversion-complete`

## Differences from useConversion/useBatchConversion
| Feature | useConversion | useBatchConversion | useMergeConversion |
|---------|---------------|---------------------|--------------------|
| File Count | Single file | Multiple files | Multiple files |
| Result | Individual DOCX file | Individual DOCX files | Single DOCX file |
| File Order | Not applicable | Not applicable | Important |
| Merge Logic | None | None | Python `merge_files()` |
| Page Separation | None | None | Separated by new page |

## Python Merge Logic (Backend)
Merge conversion is performed by the [`merge_files()`](../../../../../src/python/convert.py) function in the Python script:

```python
def merge_files(input_files, output_file, options):
    merged_content = []
    for i, input_file in enumerate(input_files):
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
            if i > 0:
                merged_content.append('---\n')
                merged_content.append(f'# {Path(input_file).stem}\n\n')
            merged_content.append(content)
    
    # Create temporary file then convert with Pandoc
    temp_md = create_temp_file('\n\n'.join(merged_content))
    convert(temp_md, output_file, options)
    os.remove(temp_md)
```

## Change History (Optional)
- v1.0: Initial implementation