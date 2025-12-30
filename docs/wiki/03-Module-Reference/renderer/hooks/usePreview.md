# usePreview

## Summary
- **Responsibility**: Markdown preview management (single file/merge file modes, file switching)
- **Primary Users/Callers**: [`MarkdownPreview.tsx`](../../../../../src/renderer/components/MarkdownPreview.tsx), [`App.tsx`](../../../../../src/renderer/App.tsx)
- **Core Entry Point**: [`usePreview(selectedFiles)`](../../../../../src/renderer/hooks/usePreview.ts:4)

## Architecture Position
- **Layer**: Renderer Process - Custom Hooks (Presentation Layer)
- **Upstream/Downstream Dependencies**:
  - Depends on: `types` ([`FileItem`](../../../../../src/renderer/types/index.ts))
  - Used by: `MarkdownPreview` component, file switching UI controls
- **Role in Runtime Flow**: File selection → content rendering → preview mode switching

## Public Interface

### Return Value
```typescript
{
  previewContent: string,           // Current preview content
  selectedFileIndex: number,         // Selected file index
  isCombinedPreview: boolean,       // Whether in merge preview mode
  selectFileForPreview: (index: number) => void,
  toggleCombinedPreview: () => void,
  selectNextFile: () => void,
  selectPreviousFile: () => void,
  getCurrentFile: () => FileItem | null
}
```

### selectFileForPreview
- **Signature**: `selectFileForPreview(index) → void`
- **Inputs**: `index`: Index of file to preview
- **Outputs**: None (internal state update)
- **Errors/Exceptions**: Out-of-range index is ignored
- **Side Effects**: Updates `selectedFileIndex`, changes `previewContent`
- **Example**:
```typescript
// Preview first file
selectFileForPreview(0)

// Preview next file
selectFileForPreview(selectedFileIndex + 1)
```

### toggleCombinedPreview
- **Signature**: `toggleCombinedPreview() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: None
- **Side Effects**: Toggles `isCombinedPreview`, recalculates `previewContent`

### selectNextFile
- **Signature**: `selectNextFile() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: Ignored when executed on the last file
- **Side Effects**: `selectedFileIndex` + 1

### selectPreviousFile
- **Signature**: `selectPreviousFile() → void`
- **Inputs**: None
- **Outputs**: None
- **Errors/Exceptions**: Ignored when executed on the first file
- **Side Effects**: `selectedFileIndex` - 1

### getCurrentFile
- **Signature**: `getCurrentFile() → FileItem | null`
- **Inputs**: None
- **Outputs**: Currently selected `FileItem` or `null`
- **Errors/Exceptions**: None
- **Side Effects**: None (pure getter)

## Internal Behavior

### Main Flow
1. **Preview Content Calculation**: [`useEffect`](../../../../../src/renderer/hooks/usePreview.ts:9)
   - When `isCombinedPreview` is true: Generate merged content of all files
   - When `isCombinedPreview` is false: Single file content

2. **Merge Preview Content Generation**:
   - Insert `\n\n---\n\n# {filename}\n\n` separator between each file
   - Remove file extension: `file.name.replace(/\.[^/.]+$/, '')`
   - First file starts without separator

3. **Auto-Select Last File**: [`useEffect`](../../../../../src/renderer/hooks/usePreview.ts:32)
   - Automatically select the last file when `selectedFiles.length` changes
   - Only works in single file mode (`!isCombinedPreview`)

4. **File Switching**:
   - Validate index range (0 ≤ index < `selectedFiles.length`)
   - `previewContent` is automatically updated by `useEffect`

### Core Rules/Algorithms
- **Merge Separator**: `\n\n---\n\n# {filename}\n\n` (inserted between each file)
- **First File Handling**: Starts with content directly without separator
- **Index Validity**: Out-of-range indices are ignored
- **Auto Focus**: Automatically select last file when new files are added

### Edge Cases
- Empty file list: `previewContent` is empty string, `getCurrentFile()` returns null
- File content empty: Display empty string
- Single file in merge mode: Display single content without separator
- File with empty content: Display only section header

### Preview Mode Comparison
| Feature | Single File Mode | Merge File Mode |
|---------|------------------|-----------------|
| `isCombinedPreview` | false | true |
| Content | Currently selected file only | All files merged |
| File Switching | Switch via dropdown/buttons | No switching |
| Separator | None | `---` between each file |
| Section Headers | None | Add header with each filename |
| Use Cases | Verify individual files | Preview merge result |

## Data/Models

### Preview State
```typescript
{
  previewContent: string,       // Current Markdown content to render
  selectedFileIndex: number,   // Current file index in single mode
  isCombinedPreview: boolean    // true: merge mode, false: single mode
}
```

### Combined Content Format
```markdown
{file1_content}

---

# {file2_name_without_extension}

{file2_content}

---

# {file3_name_without_extension}

{file3_content}
```

## Configuration/Environment Variables
- None used (runtime only)

## Dependencies

### Internal Modules
- [`types/index.ts`](../../../../../src/renderer/types/index.ts): `FileItem`

### External Libraries/Services
- React: `useState`, `useCallback`, `useEffect`
- react-markdown: (rendered by using component)

## Testing
- Related tests: `vitest` unit tests (add if needed)
- Coverage/Gaps: Currently no tests, hook unit tests needed
- Test scenarios:
  - Single file preview
  - Merge file preview
  - File switching (next/previous)
  - Empty file list handling
  - Empty content file handling
  - Mode switching (single ↔ merge)
  - Auto focus (new file addition)

## Operations/Observability

### Logging
- None

### Metrics/Tracing
- None (UI state management hook)

### Alert Points
- `selectedFiles.length === 0`: Display "Please select a file" message
- `previewContent === ''`: Display "No content to preview" message
- `isCombinedPreview`: Display different UI controls based on mode

## Integration with MarkdownPreview Component
This hook is used by the `MarkdownPreview.tsx` component:
- `previewContent`: Rendered with `react-markdown`
- `isCombinedPreview`: Show/hide mode toggle button
- `selectNextFile`/`selectPreviousFile`: Switch files via arrow buttons
- `selectedFileIndex`: Select files via dropdown

## Relationship Between Merge Preview and Actual Merge Conversion
| Item | Merge Preview | Actual Merge Conversion |
|------|---------------|------------------------|
| Purpose | UI preview | DOCX file generation |
| Separator | `---\n\n# {filename}\n\n` | `---\n\n# {filename}\n\n` + `\newpage` |
| Pandoc Usage | None | Used |
| Page Separation | None | Separated by new page |
| Index Search | None | Supports `index_files` option |

## File Indexing (Python Side)
During merge conversion, the Python script additionally performs:
1. Adds `{#filename}` anchor at the beginning of each file
2. Generates table of contents with Pandoc `--toc` option
3. Enables navigation from table of contents to files via anchors

## Change History (Optional)
- v1.0: Initial implementation