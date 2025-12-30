# Information Architecture

## Document Tree

```
wiki/
├── 00-IA-Information-Architecture.md (This document)
├── 01-Overview.md                     # Overview
├── 02-Architecture.md                 # Architecture
├── 03-Module-Reference/               # Module Reference
│   ├── main-process/
│   │   └── python-converter.md
│   ├── ipc/
│   │   ├── channels.md
│   │   └── handlers.md
│   ├── preload/
│   │   └── index.md
│   ├── renderer/
│   │   ├── App.md
│   │   ├── main.tsx.md
│   │   ├── i18n.md
│   │   ├── types.md
│   │   ├── components/
│   │   │   ├── FileUpload.md
│   │   │   ├── ConversionOptions.md
│   │   │   ├── LanguageToggle.md
│   │   │   ├── ProgressBar.md
│   │   │   ├── ResultDisplay.md
│   │   │   ├── MarkdownPreview.md
│   │   │   └── ThemeToggle.md
│   │   ├── hooks/
│   │   │   ├── useConversion.md
│   │   │   ├── useBatchConversion.md
│   │   │   ├── useMergeConversion.md
│   │   │   ├── useFileUpload.md
│   │   │   └── usePreview.md
│   │   └── context/
│   │       └── ThemeContext.md
│   └── python/
│       └── convert.py.md
├── 04-API-Interface.md                # API/Interface (IPC Channels)
├── 05-Data-Models.md                  # Data Models/Types
├── 06-Configuration.md                # Configuration/Environment
├── 07-Build-Deploy.md                 # Build/Deploy
├── 08-Observability.md                # Observability (Logging/Metrics/Tracing)
└── 09-Operations-Troubleshooting.md   # Operations/Troubleshooting
```

## Analysis Status

| Section | Status | Notes |
|---------|--------|-------|
| A. Overview | 🟢 Complete | Project overview, tech stack identified |
| B. Architecture | 🟢 Complete | 3-layer structure, IPC communication, Python integration identified |
| C. Module Reference | 🟢 Complete | All major modules documented |
| D. API/Interface | 🟢 Complete | IPC channels defined |
| E. Data Models | 🟢 Complete | Type definitions documented |
| F. Configuration/Environment | 🟢 Complete | Build configuration analyzed |
| G. Build/Deploy | 🟢 Complete | Build scripts, deployment settings identified |
| H. Observability | 🟢 Complete | Logging, metrics, tracing documented |
| I. Operations/Troubleshooting | 🟢 Complete | FAQ, troubleshooting guide completed |

## A. Overview

### Project Overview
- **Name**: md-to-docx-converter
- **Version**: 1.2.1
- **Goal**: Desktop application based on Electron - Convert Markdown files to DOCX
- **Tech Stack**:
  - Frontend: React 18.2 + TypeScript 5.3 + Tailwind CSS 3.3
  - Desktop: Electron 33.2
  - Conversion Engine: Python 3.11+ + Pandoc 3.0+
  - Build Tools: Vite 5.0 + electron-builder 24.8

### Core Features
1. **File Upload**: Drag & drop, file selector
2. **Real-time Preview**: Markdown rendering
3. **Conversion Options**: Detailed settings for fonts, margins, page orientation
4. **Batch Conversion**: Process multiple files at once
5. **Merge Conversion**: Merge multiple files into a single DOCX
6. **Multi-language Support**: 12 languages (Korean, English, Japanese, Chinese Simplified/Traditional, Spanish, French, German, Portuguese, Russian, Italian, Arabic)
7. **Theme Support**: Dark/Light mode

## B. Architecture

### 3-Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                   Renderer Process                       │
│  (React UI - Components, Hooks, Context, i18n)          │
│                 src/renderer/                           │
└─────────────────────────────────────────────────────────┘
                           ↓ IPC
┌─────────────────────────────────────────────────────────┐
│                     Preload Script                       │
│  (Context Bridge - window.electronAPI)                  │
│                   src/preload/                          │
└─────────────────────────────────────────────────────────┘
                           ↓ IPC
┌─────────────────────────────────────────────────────────┐
│                     Main Process                         │
│  (Window Mgmt, IPC Handlers, Python Bridge)             │
│                 src/main/                               │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Python Integration Layer                │   │
│  │  (spawn → convert.py → Pandoc)                 │   │
│  │              src/main/python/                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Runtime Flow

1. **UI Interaction**: User selects files/sets options
2. **IPC Call**: Renderer → Main (via Preload)
3. **Python Process Execution**: Main spawns Python script
4. **Pandoc Conversion**: Python calls Pandoc to generate DOCX
5. **Result Delivery**: Main → Renderer (IPC event)

### IPC Communication Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `open-file-dialog` | Renderer → Main | Show file selection dialog |
| `save-file-dialog` | Renderer → Main | Show save dialog |
| `open-directory-dialog` | Renderer → Main | Show directory selection dialog |
| `read-file` | Renderer → Main | Read file content |
| `start-conversion` | Renderer → Main | Start single file conversion |
| `start-batch-conversion` | Renderer → Main | Start batch conversion |
| `start-merge-conversion` | Renderer → Main | Start merge conversion |
| `cancel-conversion` | Renderer → Main | Cancel conversion |
| `conversion-progress` | Main → Renderer | Conversion progress event |
| `conversion-complete` | Main → Renderer | Conversion complete event |
| `conversion-error` | Main → Renderer | Conversion error event |
| `batch-conversion-progress` | Main → Renderer | Batch conversion progress |
| `batch-conversion-complete` | Main → Renderer | Batch conversion complete |
| `merge-conversion-progress` | Main → Renderer | Merge conversion progress |
| `merge-conversion-complete` | Main → Renderer | Merge conversion complete |
| `get-app-version` | Renderer → Main | Get app version |
| `quit-app` | Renderer → Main | Quit app |

## C. Module Reference

### Main Process (src/main/)

| Module | File | Responsibility |
|--------|------|----------------|
| Main Entry | `main.ts` | App initialization, window creation, event handling |
| IPC Handlers | `ipc/handlers.ts` | IPC channel handler implementation |
| IPC Channels | `ipc/channels.ts` | IPC channel constant definitions |
| Python Converter | `python/converter.ts` | Python process management, conversion request handling |

### Preload Script (src/preload/)

| Module | File | Responsibility |
|--------|------|----------------|
| Preload | `index.ts` | Context Bridge, API exposure |

### Renderer Process (src/renderer/)

| Module | File/Folder | Responsibility |
|--------|-------------|----------------|
| App Entry | `App.tsx`, `main.tsx` | React app entry point |
| Components | `components/` | UI component collection |
| Hooks | `hooks/` | Custom hooks (conversion, file upload, preview) |
| Context | `context/` | React Context (theme) |
| Locales | `locales/` | Multi-language resource JSON |
| Types | `types/` | TypeScript type definitions |
| Styles | `styles/` | CSS/Tailwind configuration |

### Python (src/python/)

| Module | File | Responsibility |
|--------|------|----------------|
| Convert Script | `convert.py` | Pandoc conversion logic, merge logic |

## D. API/Interface

See [`04-API-Interface.md`](04-API-Interface.md) for details

## E. Data Models

See [`05-Data-Models.md`](05-Data-Models.md) for details

## F. Configuration/Environment

### Build Configuration
- **Vite**: `vite.config.ts` (dev server on port 3000)
- **TypeScript**: 
  - `tsconfig.json` (for Renderer, with `@/` alias)
  - `tsconfig.main.json` (for Main/Preload)
- **Electron Builder**: `electron-builder.yml`

### Environment Variables
- `NODE_ENV`: `development` or `production`

### Development/Production Differences
| Item | Development | Production |
|------|-------------|------------|
| Python path | System `python3` (macOS/Linux) / `python` (Windows) | System `python3` (macOS/Linux) / `python` (Windows) |
| Python executable | System `python3`/`python` | System `python3`/`python` |
| Python script | `src/python/convert.py` | `resources/python/convert.py` |
| Renderer loading | `http://localhost:3000` | `dist/renderer/index.html` |
| Node Integration | `true` | `false` |

See [`06-Configuration.md`](06-Configuration.md) for details

## G. Build/Deploy

### Development Scripts
- `npm run dev` - Run main + renderer simultaneously
- `npm run dev:main` - Main process only
- `npm run dev:renderer` - Renderer dev server only
- `npm run build` - Build
- `npm run dist` - Full platform deployment
- `npm run dist:mac` - macOS deployment
- `npm run dist:win` - Windows deployment
- `npm run dist:linux` - Linux deployment

### Build Artifacts
- **Windows**: `.exe` (NSIS installer)
- **macOS**: `.dmg` (x64, arm64 universal)
- **Linux**: `.AppImage`

### Version Management
- `npm run version:major` - Major version bump
- `npm run version:minor` - Minor version bump
- `npm run version:patch` - Patch version bump

See [`07-Build-Deploy.md`](07-Build-Deploy.md) for details

## H. Operations/Troubleshooting

See [`09-Operations-Troubleshooting.md`](09-Operations-Troubleshooting.md) for details

## I. Observability

See [`08-Observability.md`](08-Observability.md) for details

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-29 | 2.0 | All module documentation completed, observability/operations sections added, IA updated |
| 2024-12-29 | 1.0 | IA initial draft created |