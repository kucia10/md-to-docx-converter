# Overview

## Project Overview

**MD to DOCX Converter** is a desktop application based on Electron that provides functionality to convert Markdown files to Microsoft Word documents (DOCX).

- **Name**: md-to-docx-converter
- **Version**: 1.2.1
- **License**: MIT
- **Repository**: https://github.com/kucia10/md-to-docx-converter
- **Configuration File**: [`package.json`](../package.json)

## Goals

It solves the following problems that Markdown file authors face when converting documents to Word format:

1. Simple conversion without complex conversion tools
2. Support for various formatting options (fonts, margins, page settings)
3. Batch processing of multiple files and merging functionality
4. Preview content before conversion with real-time preview
5. Multi-language UI support for global accessibility

## Core Features

### 1. File Upload
- **Drag & Drop**: Upload files by dragging them into the application
- **File Selector**: Browse and select files by clicking a button
- **Multiple File Support**: Select multiple Markdown files at once
- **File Reordering**: Change file order via drag and drop (important for merging)
- **Supported Formats**: `.md`, `.markdown`

### 2. Real-time Preview
- **Single File Preview**: Render selected file content
- **Merge Preview**: Preview multiple files merged together
- **File Switching**: Select and preview files via dropdown

### 3. Conversion Options

#### Document Settings
- **Font Family**: Arial, Times New Roman, Calibri, Helvetica, Georgia, Verdana, Cambria
- **Font Size**: 8pt ~ 72pt (default 12pt)
- **Line Height**: 0.5 ~ 3.0 (default 1.5)
- **Page Orientation**: Portrait / Landscape

#### Page Margins (cm units)
- Top, Bottom: 0 ~ 10cm (default 2.54cm)
- Left, Right: 0 ~ 10cm (default 3.18cm)

#### Advanced Options
- **Generate Table of Contents**: Auto-generate table of contents (default enabled)
- **Reference Style**: APA, MLA, Chicago, Harvard
- **Image Handling**: Embed / Link
- **Code Block Style**: Fenced / Indented

### 4. Conversion Modes

#### Single File Conversion
- Convert one selected Markdown file to DOCX

#### Batch Conversion
- Convert multiple Markdown files to individual DOCX files in batch
- Save all to selected directory

#### Merge Conversion
- Merge multiple Markdown files into a **single DOCX**
- Insert page breaks between files
- Add each filename as section header

### 5. Multi-language Support (12 languages)
- Korean (ko)
- English (en)
- Japanese (ja)
- Chinese Simplified (zh-CN)
- Chinese Traditional (zh-TW)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt-BR)
- Russian (ru)
- Arabic (ar)

### 6. Theme Support
- **Light Mode**: Bright theme
- **Dark Mode**: Dark theme
- **System Mode**: Follow OS theme

## Tech Stack

### Frontend (Renderer Process)
- **React 18.2**: UI library
- **TypeScript 5.3**: Static type language
- **Tailwind CSS 3.3**: CSS framework
- **React Router 7.11**: Routing
- **i18next 25.7**: Multi-language support
- **react-markdown 9.0**: Markdown rendering
- **react-dropzone 14.2**: File drag and drop
- **lucide-react 0.294**: Icon library
- **@hello-pangea/dnd 18.0**: Drag and drop library

### Backend (Main Process)
- **Electron 33.2**: Desktop application framework
- **Node.js**: JavaScript runtime

### Conversion Engine
- **Python 3.11+**: Scripting language
- **Pandoc 3.0+**: Document conversion tool

### Build Tools
- **Vite 5.0**: Fast build tool (renderer)
- **TypeScript Compiler**: Main/Preload build
- **electron-builder 24.8**: App packaging

### Test Tools
- **Vitest 1.6**: Unit test framework
- **happy-dom 12.10**: DOM simulation

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Memory**: 4GB RAM or more
- **Storage**: 500MB or more free space
- **Python**: 3.11 or higher (development environment)
- **Pandoc**: 3.0 or higher (system installed or bundled)

### Recommended Specifications
- **Operating System**: Windows 11, macOS 12+, Ubuntu 20.04+
- **Memory**: 8GB RAM or more
- **Storage**: 1GB or more free space

## Architecture Overview

### 3-Layer Structure
```
┌─────────────────────────────────────────┐
│    Renderer Process (React UI)        │
│  - Components, Hooks, Context, i18n   │
└─────────────────────────────────────────┘
               ↓ IPC Communication
┌─────────────────────────────────────────┐
│    Preload Script                     │
│  - Context Bridge (window.electronAPI) │
└─────────────────────────────────────────┘
               ↓ IPC Communication
┌─────────────────────────────────────────┐
│    Main Process                       │
│  - Window management, IPC handlers    │
│  - Python process execution           │
└─────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────┐
│    Python + Pandoc                    │
│  - convert.py: Conversion logic      │
│  - Pandoc: Actual document conversion │
└─────────────────────────────────────────┘
```

### Major Communication Methods
- **IPC (Inter-Process Communication)**: Communication between Renderer ↔ Main ↔ Preload
- **Python Process**: Main executes Python script using `spawn()`
- **Stdout/Stderr**: Python sends conversion results to Main as JSON

## Project Structure

```
electron-md-to-docx/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts       # App entry point, window creation
│   │   ├── ipc/          # IPC communication
│   │   │   ├── channels.ts     # Channel constant definitions
│   │   │   └── handlers.ts    # IPC handler implementation
│   │   └── python/       # Python bridge
│   │       └── converter.ts   # Python process management
│   ├── preload/          # Preload script
│   │   └── index.ts     # Context Bridge, API exposure
│   ├── renderer/         # React renderer process
│   │   ├── App.tsx      # Main app component
│   │   ├── components/   # UI components
│   │   ├── hooks/       # Custom hooks
│   │   ├── context/      # React Context
│   │   ├── locales/     # Multi-language JSON
│   │   ├── styles/      # CSS styles
│   │   └── types/       # TypeScript types
│   ├── python/           # Python scripts
│   │   ├── convert.py   # Main conversion script
│   │   ├── filters/     # Pandoc filters
│   │   └── requirements.txt
│   └── resources/       # App resources (icons, etc.)
├── wiki/                # Wiki documents
├── build/               # Build configuration
├── release/             # Build results
├── dist/                # Compiled code
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.yml
```

## Development/Build/Deploy

### Development Commands
```bash
npm run dev                # Run main + renderer simultaneously
npm run dev:main           # Main process only
npm run dev:renderer       # Renderer dev server only (port 3000)
npm run test               # Run tests
npm run test:watch         # Test watch mode
```

### Build Commands
```bash
npm run build             # Build main + renderer
npm run build:main        # Build main process
npm run build:renderer    # Build renderer
```

### Deploy Commands
```bash
npm run dist              # Deploy all platforms
npm run dist:mac          # macOS deployment (DMG)
npm run dist:win          # Windows deployment (EXE/MSI)
npm run dist:linux        # Linux deployment (AppImage)
```

### Version Management
```bash
npm run version:major      # Major version bump (1.x.x → 2.0.0)
npm run version:minor      # Minor version bump (1.2.x → 1.3.0)
npm run version:patch      # Patch version bump (1.2.1 → 1.2.2)
```

## Coding Rules

### TypeScript Rules
- **Strict Mode**: Explicit types in all files
- **Path Aliases**: Renderer uses `@/`, Main/Preload uses absolute paths

### File Path Rules
- **Main/Preload Code**: Use absolute paths `src/main/...` or `src/preload/...`
- **Renderer Code**: Use `@/components/...` alias
- **Python Path**: Always use `getPythonPath()`, `getPythonScriptPath()` (automatic dev/prod switching)

### Unit Conversion Rules
- **UI**: Store margins in **cm** units
- **Python Transfer**: Convert cm → inches (÷2.54) before passing to Pandoc

### IPC Channel Rules
- All channels are defined and imported only from [`src/main/ipc/channels.ts`](../../src/main/ipc/channels.ts)

## Related Documents

- [Architecture](02-Architecture.md) - Detailed system structure
- [Data Models](05-Data-Models.md) - Type definitions and data flow
- [API/Interface](04-API-Interface.md) - IPC channel details
- [Module Reference](03-Module-Reference/) - Detailed module descriptions
- [Build/Deploy](07-Build-Deploy.md) - Build configuration and deployment procedures

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.0 | Initial wiki documentation created |