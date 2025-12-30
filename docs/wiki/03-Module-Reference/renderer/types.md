# types (TypeScript Type Definitions)

## Summary
- **Responsibility**: TypeScript type definitions for the entire application
- **Main Users/Callers**: All renderer process code
- **Key Entry Point**: `export interface` type definitions

## Architecture Position
- **Layer**: Renderer Process - Type Definitions Layer
- **Upstream/Downstream Dependencies**:
  - Depends on: None (pure type definitions)
  - Used by: All renderer code
- **Role in Runtime Flow**: Type checking, IDE IntelliSense support

## Type Definitions List

### FileItem
File information created during file upload.

```typescript
export interface FileItem {
  id: string          // Unique identifier (random string)
  name: string        // File name
  path: string        // File path (provided by Electron)
  size: number        // File size (bytes)
  lastModified: number // Last modified time (timestamp)
  content?: string    // File content (UTF-8 text)
}
```

### ConversionOptions
Conversion options configuration.

```typescript
export interface ConversionOptions {
  fontSize?: number                            // Font size (pt), default 12
  fontFamily?: string                          // Font family, default 'Arial'
  lineHeight?: number                           // Line height, default 1.5
  marginTop?: number                           // Top margin (cm), default 2.54
  marginBottom?: number                        // Bottom margin (cm), default 2.54
  marginLeft?: number                           // Left margin (cm), default 3.18
  marginRight?: number                          // Right margin (cm), default 3.18
  orientation?: 'portrait' | 'landscape'      // Page orientation
  generateToc?: boolean                        // Generate table of contents
  referenceStyle?: 'apa' | 'mla' | 'chicago' | 'harvard'  // Reference style
  imageHandling?: 'embed' | 'link'           // Image handling method
  codeBlockStyle?: 'fenced' | 'indented'     // Code block style
}
```

### ConversionProgress
Single file conversion progress information.

```typescript
export interface ConversionProgress {
  currentFile: number        // Current file index (always 0)
  totalFiles: number         // Total file count (always 1)
  currentFileName: string    // Current file name
  percentage: number         // Progress percentage (0-100)
  stage: 'preparing' | 'converting' | 'finalizing' | 'completed' | 'error'
}
```

### ConversionResult
Single file conversion result.

```typescript
export interface ConversionResult {
  success: boolean        // Success status
  message: string         // Result message
  outputPath?: string     // Output file path (on success)
  processedFiles?: string[]  // List of processed files (not used in batch)
  errors?: string[]       // List of error messages (on failure)
}
```

### AppState
Global application state (not used, for reference only).

```typescript
export interface AppState {
  selectedFiles: FileItem[]                        // Selected file list
  currentFileIndex: number                          // Current file index
  previewContent: string                             // Preview content
  conversionOptions: ConversionOptions                 // Conversion options
  isConverting: boolean                             // Converting status
  conversionProgress: ConversionProgress | null        // Conversion progress
  conversionError: string | null                   // Conversion error
  conversionResult: ConversionResult | null          // Conversion result
  isDragging: boolean                               // Dragging status
}
```

### FileReadResult
File read result (Electron IPC response).

```typescript
export interface FileReadResult {
  name: string          // File name
  path: string          // File path
  content: string       // File content
  size: number          // File size
  lastModified: number  // Last modified time
}
```

### BatchConversionProgress
Batch conversion progress information.

```typescript
export interface BatchConversionProgress {
  currentFile: number                     // Current file index
  totalFiles: number                      // Total file count
  currentFileName: string                 // Current file name
  percentage: number                      // Overall progress (0-100)
  status: 'converting' | 'completed' | 'error'
  processedFiles: string[]                // List of successfully processed files
  errors: Array<{ fileName: string; error: string }>  // List of occurred errors
}
```

### BatchConversionResult
Batch conversion result.

```typescript
export interface BatchConversionResult {
  success: boolean                           // Success status (true on partial success)
  message: string                            // Result message
  outputDirectory?: string                   // Output directory path
  totalFiles: number                         // Total file count
  processedFiles: number                     // Successfully processed file count
  errors: Array<{ fileName: string; error: string }>  // List of failed files
}
```

### MergeConversionProgress
Merge conversion progress information.

```typescript
export interface MergeConversionProgress {
  currentFile: number        // Current file index
  totalFiles: number         // Total file count
  currentFileName: string    // Current file name
  percentage: number         // Overall progress (0-100)
  status: 'preparing' | 'merging' | 'converting' | 'completed' | 'error'
}
```

### MergeConversionResult
Merge conversion result.

```typescript
export interface MergeConversionResult {
  success: boolean        // Success status
  message: string         // Result message
  outputPath?: string     // Output file path (on success)
  totalFiles: number      // Number of merged files
  error?: string          // Error message (on failure)
}
```

### ElectronAPI
API types exposed by Electron Preload.

```typescript
export interface ElectronAPI {
  // File Operations
  openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>
  saveFileDialog: (defaultName?: string) => Promise<{ canceled: boolean; filePath?: string }>
  openDirectoryDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>
  readFile: (filePath: string) => Promise<FileReadResult>
  
  // Conversion Operations
  startConversion: (inputPath: string, outputPath: string, options: ConversionOptions) => Promise<any>
  startBatchConversion: (inputFiles: string[], outputDirectory: string, options: ConversionOptions) => Promise<any>
  startMergeConversion: (inputFiles: string[], outputPath: string, options: ConversionOptions) => Promise<any>
  cancelConversion: () => void
  
  // Event Listeners
  onConversionProgress: (callback: (progress: ConversionProgress) => void) => void
  onConversionComplete: (callback: (result: ConversionResult) => void) => void
  onConversionError: (callback: (error: string) => void) => void
  onBatchConversionProgress: (callback: (progress: BatchConversionProgress) => void) => void
  onBatchConversionComplete: (callback: (result: BatchConversionResult) => void) => void
  onMergeConversionProgress: (callback: (progress: MergeConversionProgress) => void) => void
  onMergeConversionComplete: (callback: (result: MergeConversionResult) => void) => void
  
  // App Operations
  getAppVersion: () => Promise<string>
  quitApp: () => void
  removeAllListeners: () => void
}
```

## Type Usage Guide

### ConversionOptions Defaults
```typescript
const defaultOptions: ConversionOptions = {
  fontSize: 12,
  fontFamily: 'Arial',
  lineHeight: 1.5,
  marginTop: 2.54,
  marginBottom: 2.54,
  marginLeft: 3.18,
  marginRight: 3.18,
  orientation: 'portrait',
  generateToc: true,
  referenceStyle: 'apa',
  imageHandling: 'embed',
  codeBlockStyle: 'fenced'
}
```

### Stage Type Comparison
| Stage | ConversionProgress | BatchConversionProgress | MergeConversionProgress |
|-------|-------------------|----------------------|------------------------|
| Preparing | `preparing` | - | `preparing` |
| Converting | `converting` | `converting` | `converting` |
| Merging | - | - | `merging` |
| Finalizing | `finalizing` | - | - |
| Completed | `completed` | `completed` | `completed` |
| Error | `error` | `error` | `error` |

### Margin Units
- In UI: **cm** (centimeters)
- For Pandoc: **inch** (divide by 2.54)

## Related Files
- [`../main/ipc/handlers.ts`](../../main/ipc/handlers.md): IPC handlers
- [`../preload/index.ts`](../../preload/index.md): Preload script

## Change History
- v1.0: Initial type definitions