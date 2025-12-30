# Architecture

## Overview

MD to DOCX Converter follows the **Electron 3-process architecture**: Renderer Process, Preload Script, Main Process. The Main Process spawns a Python process to perform actual document conversion using Pandoc.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Renderer Process                           │
│  (React 18.2 + TypeScript 5.3 + Tailwind CSS 3.3)            │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 UI Components                         │   │
│  │  - FileUpload, ConversionOptions, ProgressBar         │   │
│  │  - MarkdownPreview, ResultDisplay, ThemeToggle        │   │
│  │  - LanguageToggle                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Custom Hooks (State Management)            │   │
│  │  - useConversion (single conversion)                 │   │
│  │  - useBatchConversion (batch conversion)             │   │
│  │  - useMergeConversion (merge conversion)             │   │
│  │  - useFileUpload (file management)                   │   │
│  │  - usePreview (preview management)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Context Providers                         │   │
│  │  - ThemeProvider (dark/light theme)                  │   │
│  │  - i18next Provider (multi-language)                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│              IPC Call (invoke)                              │
│                 window.electronAPI                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Preload Script                           │
│  (contextBridge)                                             │
│                                                               │
│  window.electronAPI = {                                       │
│    openFileDialog, saveFileDialog,                             │
│    startConversion, startBatchConversion,                     │
│    onConversionProgress, onConversionComplete, ...             │
│  }                                                            │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Main Process                             │
│  (Electron + Node.js)                                        │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              IPC Handlers                           │   │
│  │  - FILE: open/save dialogs, read-file             │   │
│  │  - CONVERSION: start-conversion, batch, merge      │   │
│  │  - APP: get-app-version, quit-app                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Python Bridge                          │   │
│  │  PythonConverter.convertMarkdownToDocx()            │   │
│  │  PythonConverter.mergeFilesToDocx()                │   │
│  │    → spawn(python3, convert.py, args)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│              IPC Event (send)                                │
│        conversion-progress, conversion-complete               │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                  Python Process                              │
│  (Python 3.11+ + Pandoc 3.0+)                              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              convert.py                               │   │
│  │  - PandocConverter class                           │   │
│  │  - convert() method: single file conversion         │   │
│  │  - merge_files() function: multi-file merge         │   │
│  │  - _build_pandoc_command(): Pandoc CLI command gen  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│              subprocess.run(pandoc, ...)                        │
└─────────────────────────────────────────────────────────────────┘
```

## Layer Description

### 1. Renderer Process (UI Layer)

**Location**: [`src/renderer/`](../src/renderer/)

**Responsibilities**:
- User interface rendering
- User interaction handling
- State management (React Hooks, Context)
- IPC calls (via Preload)

**Major Components**:
- [`App.tsx`](../src/renderer/App.tsx) - Main app component
- [`FileUpload.tsx`](../src/renderer/components/FileUpload.tsx) - File upload (drag & drop)
- [`ConversionOptions.tsx`](../src/renderer/components/ConversionOptions.tsx) - Conversion options UI
- [`ProgressBar.tsx`](../src/renderer/components/ProgressBar.tsx) - Progress display
- [`ResultDisplay.tsx`](../src/renderer/components/ResultDisplay.tsx) - Result display
- [`MarkdownPreview.tsx`](../src/renderer/components/MarkdownPreview.tsx) - Markdown rendering

**Major Hooks**:
- [`useConversion.ts`](../src/renderer/hooks/useConversion.ts) - Single file conversion state
- [`useBatchConversion.ts`](../src/renderer/hooks/useBatchConversion.ts) - Batch conversion state
- [`useMergeConversion.ts`](../src/renderer/hooks/useMergeConversion.ts) - Merge conversion state
- [`useFileUpload.ts`](../src/renderer/hooks/useFileUpload.ts) - File upload management
- [`usePreview.ts`](../src/renderer/hooks/usePreview.ts) - Preview management

### 2. Preload Script (Context Bridge Layer)

**Location**: [`src/preload/index.ts`](../src/preload/index.ts)

**Responsibilities**:
- IPC communication bridge between Renderer ↔ Main
- Safe API exposure via `contextBridge.exposeInMainWorld()`
- Allow Main functionality access without Node Integration

**Exposed API**:
```typescript
window.electronAPI = {
  // File operations
  openFileDialog, saveFileDialog, openDirectoryDialog, readFile,
  
  // Conversion operations
  startConversion, startBatchConversion, startMergeConversion, cancelConversion,
  onConversionProgress, onConversionComplete, onConversionError,
  onBatchConversionProgress, onBatchConversionComplete,
  onMergeConversionProgress, onMergeConversionComplete,
  
  // App operations
  getAppVersion, quitApp, removeAllListeners
}
```

### 3. Main Process (Backend Layer)

**Location**: [`src/main/`](../src/main/)

**Responsibilities**:
- Electron app lifecycle management
- Window creation and management
- IPC channel handler implementation
- Python process execution and management

**Major Modules**:
- [`main.ts`](../src/main/main.ts) - App entry point, window creation
- [`ipc/channels.ts`](../src/main/ipc/channels.ts) - IPC channel constant definitions
- [`ipc/handlers.ts`](../src/main/ipc/handlers.ts) - IPC handler implementation
- [`python/converter.ts`](../src/main/python/converter.ts) - Python bridge class

### 4. Python Integration Layer

**Location**: 
- [`src/main/python/converter.ts`](../src/main/python/converter.ts) - TypeScript bridge
- [`src/python/convert.py`](../src/python/convert.py) - Python conversion script

**Responsibilities**:
- Python process `spawn()` and management
- Pandoc CLI command execution
- Pass conversion results to Main as JSON

## Runtime Flow

### Single File Conversion Flow

```
1. User: Select file and set conversion options
   ↓
2. Renderer: handleStartConversion() call
   ↓
3. Renderer: saveFileDialog() → select save path
   ↓
4. Renderer: startConversion(inputPath, outputPath, options)
   ↓
5. Preload: IPC invoke (start-conversion)
   ↓
6. Main: IPC handler (START_CONVERSION)
   ↓
7. Main: PythonConverter.convertMarkdownToDocx()
   ↓
8. Main: spawn(python3, convert.py --input X --output Y [options])
   ↓
9. Python: convert.py → PandocConverter.convert()
   ↓
10. Python: subprocess.run(pandoc [args]) → DOCX generation
    ↓
11. Python: print(json.dumps(result))
    ↓
12. Main: stdout parsing → { success: true, ... }
    ↓
13. Main: IPC event (conversion-complete)
    ↓
14. Renderer: onConversionComplete() → state update
    ↓
15. Renderer: Display result in ResultDisplay component
```

### Batch Conversion Flow

```
1. User: Select multiple files and start conversion
   ↓
2. Renderer: startBatchConversion()
   ↓
3. Main: PythonConverter loop to convert each file
   ↓
4. Main: Send batch-conversion-progress event for each file conversion
   ↓
5. Python: Individual file conversion (convert.py)
   ↓
6. Main: Send batch-conversion-complete event when all files complete
   ↓
7. Renderer: Display batch results (success/failed file list)
```

### Merge Conversion Flow

```
1. User: Select multiple files and start merge conversion
   ↓
2. Renderer: startMergeConversion()
   ↓
3. Main: PythonConverter.mergeFilesToDocx()
   ↓
4. Main: spawn(python3, convert.py --merge --input X --input Y --output Z)
   ↓
5. Python: Execute merge_files() function
   ↓
6. Python: Read each file and create merged_content (separator: ---, \newpage)
   ↓
7. Python: Create temporary Markdown file
   ↓
8. Python: Convert temporary file to DOCX with Pandoc
    ↓
9. Python: Delete temporary file
    ↓
10. Main: merge-conversion-complete event
    ↓
11. Renderer: Display merge result
```

## IPC Communication Channels

### Request Channels (Renderer → Main)

| Channel | Direction | Purpose | Handler |
|---------|-----------|---------|---------|
| `open-file-dialog` | Renderer → Main | Show file selection dialog | [`handlers.ts:21-55`](../src/main/ipc/handlers.ts:21-55) |
| `save-file-dialog` | Renderer → Main | Show save dialog | [`handlers.ts:87-115`](../src/main/ipc/handlers.ts:87-115) |
| `open-directory-dialog` | Renderer → Main | Show directory selection dialog | [`handlers.ts:57-85`](../src/main/ipc/handlers.ts:57-85) |
| `read-file` | Renderer → Main | Read file content | [`handlers.ts:118-135`](../src/main/ipc/handlers.ts:118-135) |
| `start-conversion` | Renderer → Main | Start single file conversion | [`handlers.ts:138-163`](../src/main/ipc/handlers.ts:138-163) |
| `start-batch-conversion` | Renderer → Main | Start batch conversion | [`handlers.ts:166-227`](../src/main/ipc/handlers.ts:166-227) |
| `start-merge-conversion` | Renderer → Main | Start merge conversion | [`handlers.ts:230-280`](../src/main/ipc/handlers.ts:230-280) |
| `cancel-conversion` | Renderer → Main | Cancel conversion | [`converter.ts:120-125`](../src/main/python/converter.ts:120-125) |
| `get-app-version` | Renderer → Main | Get app version | [`handlers.ts:283-286`](../src/main/ipc/handlers.ts:283-286) |
| `quit-app` | Renderer → Main | Quit app | [`handlers.ts:289-293`](../src/main/ipc/handlers.ts:289-293) |

### Event Channels (Main → Renderer)

| Channel | Direction | Purpose | Listener |
|---------|-----------|---------|----------|
| `conversion-progress` | Main → Renderer | Single conversion progress | [`useConversion.ts:15-17`](../src/renderer/hooks/useConversion.ts:15-17) |
| `conversion-complete` | Main → Renderer | Single conversion complete | [`useConversion.ts:19-24`](../src/renderer/hooks/useConversion.ts:19-24) |
| `conversion-error` | Main → Renderer | Conversion error | [`useConversion.ts:26-30`](../src/renderer/hooks/useConversion.ts:26-30) |
| `batch-conversion-progress` | Main → Renderer | Batch conversion progress | [`useBatchConversion.ts:15-17`](../src/renderer/hooks/useBatchConversion.ts:15-17) |
| `batch-conversion-complete` | Main → Renderer | Batch conversion complete | [`useBatchConversion.ts:19-24`](../src/renderer/hooks/useBatchConversion.ts:19-24) |
| `merge-conversion-progress` | Main → Renderer | Merge conversion progress | [`useMergeConversion.ts:15-17`](../src/renderer/hooks/useMergeConversion.ts:15-17) |
| `merge-conversion-complete` | Main → Renderer | Merge conversion complete | [`useMergeConversion.ts:19-24`](../src/renderer/hooks/useMergeConversion.ts:19-24) |

## Development/Production Differences

| Item | Development Environment | Production Environment |
|------|------------------------|-----------------------|
| **Python path** | System `python3` (macOS/Linux) / `python` (Windows) | System `python3` (macOS/Linux) / `python` (Windows) |
| **Python script** | `src/python/convert.py` | `resources/python/convert.py` |
| **Renderer loading** | `http://localhost:3000` (Vite dev server) | `dist/renderer/index.html` |
| **Node Integration** | `true` | `false` |
| **Web Security** | `false` (for file dialogs) | `true` |
| **DevTools** | Auto open | Closed |

**Note**: Python uses system Python in both development and production. Users need to have Python 3+ and Pandoc installed on their system.

## Security Settings

### Renderer Security
```typescript
webPreferences: {
  preload: join(__dirname, '../preload/index.js'),
  nodeIntegration: isDev,      // true only in Dev
  contextIsolation: true,       // always true
  webSecurity: !isDev,         // false only in Dev
  sandbox: false,               // for macOS file dialogs
}
```

### Context Isolation
- `contextIsolation: true`: Prevent direct Node.js access from Renderer
- All Main features accessed through `window.electronAPI`

## Dependencies

### Main Process
```
main.ts
  → ipc/handlers.ts
      → ipc/channels.ts
      → python/converter.ts
```

### Preload Script
```
preload/index.ts
  → ipc/channels.ts
```

### Renderer Process
```
App.tsx
  → components/* (FileUpload, ConversionOptions, etc.)
  → hooks/* (useConversion, useBatchConversion, etc.)
  → context/ThemeContext.tsx
  → types/index.ts
```

## Related Documents

- [Overview](01-Overview.md) - Project overview and features
- [Data Models](05-Data-Models.md) - Type definitions
- [API/Interface](04-API-Interface.md) - IPC channel details
- [Module Reference](03-Module-Reference/) - Detailed module descriptions

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.0 | Initial architecture documentation created |