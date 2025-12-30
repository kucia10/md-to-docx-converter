# useFileUpload

## Summary
- **Responsibility**: File upload management (drag-and-drop, file selector, file reordering)
- **Primary Users/Callers**: [`FileUpload.tsx`](../../../../../src/renderer/components/FileUpload.tsx), [`App.tsx`](../../../../../src/renderer/App.tsx)
- **Core Entry Point**: [`useFileUpload()`](../../../../../src/renderer/hooks/useFileUpload.ts:4)

## Architecture Position
- **Layer**: Renderer Process - Custom Hooks (UI Interaction Layer)
- **Upstream/Downstream Dependencies**:
  - Depends on: `types` ([`FileItem`](../../../../../src/renderer/types/index.ts))
  - Used by: `FileUpload` component, drag-and-drop library
- **Role in Runtime Flow**: File drag/selection → reading → `FileItem` array creation → reordering

## Public Interface

### Return Value
```typescript
{
  selectedFiles: FileItem[],       // List of selected files
  isDragging: boolean,              // Whether currently dragging
  handleFileSelect: (files: FileList | null, paths?: string[]) => Promise<void>,
  handleDragOver: (e: React.DragEvent) => void,
  handleDragLeave: (e: React.DragEvent) => void,
  handleDrop: (e: React.DragEvent) => Promise<void>,
  removeFile: (fileId: string) => void,
  moveFileUp: (fileId: string) => void,
  moveFileDown: (fileId: string) => void,
  reorderFiles: (sourceIndex: number, destinationIndex: number) => void,
  clearFiles: () => void
}
```

### handleFileSelect
- **Signature**: `handleFileSelect(files, paths?) → Promise<void>`
- **Inputs**:
  - `files`: `FileList` (HTML5 File API)
  - `paths`: (Optional) Array of file paths (provided by Electron file dialog)
- **Outputs**: None (internal state update)
- **Errors/Exceptions**: On file read failure, outputs `console.error()` (individual file errors are skipped)
- **Side Effects**: Adds new files to `selectedFiles`
- **Example**:
```typescript
// Using file selector
const { filePaths } = await window.electronAPI.openFileDialog()
await handleFileSelect(selectedFiles, filePaths)

// Using drag-and-drop (no paths)
await handleFileSelect(e.dataTransfer.files)
```

### handleDragOver
- **Signature**: `handleDragOver(e) → void`
- **Inputs**: `React.DragEvent`
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Sets `isDragging` to true

### handleDragLeave
- **Signature**: `handleDragLeave(e) → void`
- **Inputs**: `React.DragEvent`
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Sets `isDragging` to false

### handleDrop
- **Signature**: `handleDrop(e) → Promise<void>`
- **Inputs**: `React.DragEvent`
- **Outputs**: None
- **Errors/Exceptions**: On file read failure, outputs `console.error()`
- **Side Effects**: Calls `handleFileSelect()`, sets `isDragging` to false

### removeFile
- **Signature**: `removeFile(fileId) → void`
- **Inputs**: `fileId`: Unique ID of file to remove
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Removes the file from `selectedFiles`

### moveFileUp
- **Signature**: `moveFileUp(fileId) → void`
- **Inputs**: `fileId`: ID of file to move up
- **Outputs**: None
- **Errors/Exceptions**: Ignored when executed on the first file
- **Side Effects**: Moves the file one position up in the file array

### moveFileDown
- **Signature**: `moveFileDown(fileId) → void`
- **Inputs**: `fileId`: ID of file to move down
- **Outputs**: None
- **Errors/Exceptions**: Ignored when executed on the last file
- **Side Effects**: Moves the file one position down in the file array

### reorderFiles
- **Signature**: `reorderFiles(sourceIndex, destinationIndex) → void`
- **Inputs**:
  - `sourceIndex`: Original position index
  - `destinationIndex`: New position index
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Changes element positions in the file array

### clearFiles
- **Signature**: `clearFiles() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Resets `selectedFiles` to empty array

## Internal Behavior

### Main Flow
1. **File Reading**: [`readFileContent()`](../../../../../src/renderer/hooks/useFileUpload.ts:8)
   - Uses `FileReader` API
   - Reads text with UTF-8 encoding
   - Promise-based asynchronous processing

2. **FileItem Creation**: [`createFileItem()`](../../../../../src/renderer/hooks/useFileUpload.ts:23)
   - Generate unique ID: `Math.random().toString(36).substr(2, 9)`
   - Store file metadata: name, size, modification date, path, content

3. **File Selection Handling**: [`handleFileSelect()`](../../../../../src/renderer/hooks/useFileUpload.ts:35)
   - Iterate through `FileList` and read each file
   - Skip only the file that failed on read error
   - Add files with `setSelectedFiles(prev => [...prev, ...newFiles])`

4. **Drag-and-Drop**:
   - `handleDragOver()`: Call `e.preventDefault()` to allow drop, `isDragging: true`
   - `handleDrop()`: Extract files then call `handleFileSelect()`, `isDragging: false`

5. **File Reordering**:
   - `moveFileUp()`: Find index → swap with previous element (when index > 0)
   - `moveFileDown()`: Find index → swap with next element (when index < length-1)
   - `reorderFiles()`: Extract element with `splice()`, insert at new position

### Core Rules/Algorithms
- ID generation: Random string prevents collision (only valid within single session)
- File order: Important for merge conversion (files merged in order)
- Error handling: Skip individual file on read failure instead of entire failure

### Edge Cases
- Duplicate file addition: Allowed (same file can be selected multiple times)
- Large files: UI may be unresponsive until entire read completes
- Non-Markdown files: No extension check, all files selected by user are allowed
- Drop without path: Use `file.name` as `path`

## Data/Models

### FileItem
```typescript
{
  id: string,              // Unique identifier
  name: string,            // Filename
  path: string,            // File path (provided by Electron)
  size: number,            // File size (bytes)
  lastModified: number,    // Last modification time (timestamp)
  content: string          // File content (UTF-8 text)
}
```

### Drag State
```typescript
{
  isDragging: boolean       // Whether dragging (for UI styling)
}
```

## Configuration/Environment Variables
- None used (runtime only)

## Dependencies

### Internal Modules
- [`types/index.ts`](../../../../../src/renderer/types/index.ts): `FileItem`

### External Libraries/Services
- React: `useState`, `useCallback`
- HTML5 File API: `FileReader`, `FileList`
- External libraries: None (pure React hooks)

## Testing
- Related tests: `vitest` unit tests (add if needed)
- Coverage/Gaps: Currently no tests, hook unit tests needed
- Test scenarios:
  - File drag-and-drop
  - File selector usage
  - File reordering
  - File removal
  - Duplicate file addition
  - Read failure handling

## Operations/Observability

### Logging
- File read failure: `console.error('Error reading file:', file.name, error)`

### Metrics/Tracing
- None (UI state management hook)

### Alert Points
- Apply drag style in UI when `isDragging` is true
- Display empty state message when `selectedFiles.length` is 0
- Calculate progress with `selectedFiles.length` for merge conversion

## Integration with Drag-and-Drop Library
This hook is used with the `@hello-pangea/dnd` library:
- `reorderFiles()`: Called from DnD library's `onDropEnd` handler
- `moveFileUp()`, `moveFileDown()`: Reorder via button clicks

## Importance of File Order
- **Single/Batch Conversion**: Order doesn't matter (each file converted individually)
- **Merge Conversion**: Order is important (files merged in order into single DOCX)
- Filename Section Headers: On merge, each filename is added as a section header (`# {filename}`)

## Change History (Optional)
- v1.0: Initial implementation