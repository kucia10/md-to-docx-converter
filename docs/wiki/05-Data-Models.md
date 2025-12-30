# Data Models

## Overview

This document describes TypeScript types and data models defined in [`src/renderer/types/index.ts`](../src/renderer/types/index.ts).

## Type Definitions

### FileItem

File information model for file upload management

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier (randomly generated) |
| `name` | `string` | Filename |
| `path` | `string` | File system path |
| `size` | `number` | File size (bytes) |
| `lastModified` | `number` | Last modified time (timestamp) |
| `content` | `string?` | File content (for preview) |

**Location**: [`src/renderer/types/index.ts:1-8`](../src/renderer/types/index.ts:1-8)

---

### ConversionOptions

Conversion options model (UI settings → Python conversion parameters)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fontSize` | `number?` | 12 | Font size (pt) |
| `fontFamily` | `string?` | 'Arial' | Font family |
| `lineHeight` | `number?` | 1.5 | Line height |
| `marginTop` | `number?` | 2.54 | Top margin (cm) |
| `marginBottom` | `number?` | 2.54 | Bottom margin (cm) |
| `marginLeft` | `number?` | 3.18 | Left margin (cm) |
| `marginRight` | `number?` | 3.18 | Right margin (cm) |
| `orientation` | `'portrait' \| 'landscape'?` | 'portrait' | Page orientation |
| `generateToc` | `boolean?` | true | Generate table of contents |
| `referenceStyle` | `'apa' \| 'mla' \| 'chicago' \| 'harvard'?` | 'apa' | Reference style |
| `imageHandling` | `'embed' \| 'link'?` | 'embed' | Image handling method |
| `codeBlockStyle` | `'fenced' \| 'indented'?` | 'fenced' | Code block style |

**Location**: [`src/renderer/types/index.ts:10-23`](../src/renderer/types/index.ts:10-23)

**Note**: 
- UI stores margins in **cm** units
- Convert to **inches** when passing to Python script (÷2.54)
- Pandoc default margins: top/bottom 2.54cm, left/right 3.18cm

---

### ConversionProgress

Single file conversion progress model

| Property | Type | Description |
|----------|------|-------------|
| `currentFile` | `number` | Current file index |
| `totalFiles` | `number` | Total number of files |
| `currentFileName` | `string` | Current filename |
| `percentage` | `number` | Progress (0-100) |
| `stage` | `'preparing' \| 'converting' \| 'finalizing' \| 'completed' \| 'error'` | Conversion stage |

**Location**: [`src/renderer/types/index.ts:25-31`](../src/renderer/types/index.ts:25-31)

---

### ConversionResult

Single file conversion result model

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | Conversion success status |
| `message` | `string` | Result message |
| `outputPath` | `string?` | Output file path |
| `processedFiles` | `string[]?` | Processed file list |
| `errors` | `string[]?` | Error list |

**Location**: [`src/renderer/types/index.ts:33-39`](../src/renderer/types/index.ts:33-39)

---

### BatchConversionProgress

Batch conversion progress model

| Property | Type | Description |
|----------|------|-------------|
| `currentFile` | `number` | Current file index |
| `totalFiles` | `number` | Total number of files |
| `currentFileName` | `string` | Current filename |
| `percentage` | `number` | Progress (0-100) |
| `status` | `'converting' \| 'completed' \| 'error'` | Status |
| `processedFiles` | `string[]` | Processed file path list |
| `errors` | `Array<{fileName, error}>` | Error list |

**Location**: [`src/renderer/types/index.ts:61-69`](../src/renderer/types/index.ts:61-69)

---

### BatchConversionResult

Batch conversion result model

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | Overall success status (true if no errors) |
| `message` | `string` | Result message |
| `outputDirectory` | `string?` | Output directory path |
| `totalFiles` | `number` | Total number of files |
| `processedFiles` | `number` | Number of processed files |
| `errors` | `Array<{fileName: string; error: string}>` | Error list |

**Location**: [`src/renderer/types/index.ts:71-78`](../src/renderer/types/index.ts:71-78)

---

### MergeConversionProgress

Merge conversion progress model

| Property | Type | Description |
|----------|------|-------------|
| `currentFile` | `number` | Current file index |
| `totalFiles` | `number` | Total number of files |
| `currentFileName` | `string` | Current filename |
| `percentage` | `number` | Progress (0-100) |
| `status` | `'preparing' \| 'merging' \| 'converting' \| 'completed' \| 'error'` | Status |

**Location**: [`src/renderer/types/index.ts:80-86`](../src/renderer/types/index.ts:80-86)

---

### MergeConversionResult

Merge conversion result model

| Property | Type | Description |
|----------|------|-------------|
| `success` | `boolean` | Success status |
| `message` | `string` | Result message |
| `outputPath` | `string?` | Output file path |
| `totalFiles` | `number` | Number of merged files |
| `error` | `string?` | Error message |

**Location**: [`src/renderer/types/index.ts:88-94`](../src/renderer/types/index.ts:88-94)

---

### ElectronAPI

IPC API types exposed from Preload script

#### File Operation Methods

| Method | Parameters | Return Type | Description |
|--------|-------------|--------------|-------------|
| `openFileDialog()` | - | `Promise<{canceled: boolean; filePaths: string[]}>` | File selection dialog |
| `saveFileDialog()` | `defaultName?: string` | `Promise<{canceled: boolean; filePath?: string}>` | Save dialog |
| `openDirectoryDialog()` | - | `Promise<{canceled: boolean; filePaths?: string[]}>` | Directory selection dialog |
| `readFile()` | `filePath: string` | `Promise<FileReadResult>` | Read file content |

#### Conversion Operation Methods

| Method | Parameters | Return Type | Description |
|--------|-------------|--------------|-------------|
| `startConversion()` | `inputPath, outputPath, options` | `Promise<any>` | Start single file conversion |
| `startBatchConversion()` | `inputFiles[], outputDirectory, options` | `Promise<any>` | Start batch conversion |
| `startMergeConversion()` | `inputFiles[], outputPath, options` | `Promise<any>` | Start merge conversion |
| `cancelConversion()` | - | `void` | Cancel conversion |

#### Event Listener Methods

| Method | Callback Parameter | Description |
|--------|-------------------|-------------|
| `onConversionProgress()` | `ConversionProgress` | Single conversion progress event |
| `onConversionComplete()` | `ConversionResult` | Single conversion complete event |
| `onConversionError()` | `string` | Conversion error event |
| `onBatchConversionProgress()` | `BatchConversionProgress` | Batch conversion progress event |
| `onBatchConversionComplete()` | `BatchConversionResult` | Batch conversion complete event |
| `onMergeConversionProgress()` | `MergeConversionProgress` | Merge conversion progress event |
| `onMergeConversionComplete()` | `MergeConversionResult` | Merge conversion complete event |

#### App Operation Methods

| Method | Parameters | Return Type | Description |
|--------|-------------|--------------|-------------|
| `getAppVersion()` | - | `Promise<string>` | Get app version |
| `quitApp()` | - | `void` | Quit app |
| `removeAllListeners()` | - | `void` | Remove all IPC listeners |

**Location**: [`src/renderer/types/index.ts:96-115`](../src/renderer/types/index.ts:96-115)

---

## Data Flow

### File Upload Flow
```
User file selection
  → openFileDialog (IPC)
  → readFile (IPC, for each file)
  → Create FileItem (including content)
  → Update selectedFiles state
  → Display preview with usePreview
```

### Conversion Options Flow
```
ConversionOptions UI
  → options state (App.tsx)
  → startConversion / startBatchConversion / startMergeConversion
  → IPC call (start-conversion, etc.)
  → PythonConverter (main/python/converter.ts)
  → convert.py (Python script)
```

### Progress Event Flow
```
Python conversion in progress
  → PythonConverter.process.stdout
  → IPC event (conversion-progress, etc.)
  → Renderer event listener
  → Update progress state
  → Render ProgressBar component
```

## Related Documents
- [API/Interface](04-API-Interface.md) - IPC channel details
- [Architecture](02-Architecture.md) - System structure
- [Module Reference - Hooks](03-Module-Reference/renderer/hooks/) - Custom hook usage