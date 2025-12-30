# Configuration/Environment

## Overview

This document describes environment configuration, build settings, and differences between development and production environments for MD to DOCX Converter.

## Environment Variables

### NODE_ENV

| Value | Purpose | Impact |
|-------|---------|--------|
| `development` | Development environment | DevTools enabled, Node Integration enabled, Web Security disabled for file dialogs |
| `production` | Production environment | Optimization, security hardening, bundled resources |

**How to Set**:
```bash
# Development
NODE_ENV=development npm run dev

# Production (automatically set during build)
npm run dist
```

**Usage Location**:
- [`src/main/main.ts:5`](../src/main/main.ts:5) - Development environment detection
- [`src/main/python/converter.ts:21`](../src/main/python/converter.ts:21) - Python path determination

## Build Configuration

### TypeScript Configuration

#### Main/Preload Process

**File**: [`tsconfig.main.json`](../tsconfig.main.json)

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "src",
    "outDir": "dist",
    "noEmit": false,
    "esModuleInterop": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": false
  },
  "include": [
    "src/main/**/*",
    "src/preload/**/*"
  ],
  "exclude": [
    "src/renderer",
    "node_modules",
    "dist"
  ]
}
```

**Important Settings**:
- `module: CommonJS` - Node.js compatible
- `outDir: dist` - Build output location
- `rootDir: src` - Source root

#### Renderer Process

**File**: [`tsconfig.json`](../tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/renderer/*"]
    }
  },
  "include": ["src/renderer"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Important Settings**:
- `module: ESNext` - Vite bundler compatible
- `paths: "@/*": ["src/renderer/*"]` - Path alias
- `jsx: react-jsx` - New JSX transform

### Vite Configuration

**File**: [`vite.config.ts`](../vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',                    // Relative path (required for Electron)
  build: {
    outDir: 'dist/renderer',       // Build output location
    emptyOutDir: true,            // Clean before build
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),  // @/ alias
    },
  },
  server: {
    port: 3000,                   // Dev server port
  },
})
```

**Important Settings**:
- `base: './'` - Use relative paths in Electron
- `outDir: 'dist/renderer'` - Separate from Main/Preload
- `alias: '@'` - Path alias for Renderer code

### electron-builder Configuration

**File**: [`electron-builder.yml`](../electron-builder.yml)

```yaml
appId: com.mdtodocx.converter
productName: MD to DOCX
copyright: Copyright © 2025 MD to DOCX Team
electronVersion: 28.0.0

directories:
  output: release
  buildResources: resources

files:
  - dist/**/*           # Compiled code
  - src/python/**/*      # Python scripts
  - src/resources/**/*   # App resources

extraResources:
  - from: "src/python"
    to: "python"          # Copy to python folder when bundling
    filter:
      - "**/*"
```

**package.json Internal Configuration**: [`package.json:66-131`](../package.json:66-131)

```json
{
  "build": {
    "appId": "com.mdtodocx.converter",
    "productName": "MD to DOCX",
    "icon": "src/resources/icon",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "src/python/**/*",
      "src/resources/**/*"
    ],
    "extraResources": [
      {
        "from": "src/resources",
        "to": "resources"
      },
      {
        "from": "src/python",
        "to": "python"
      }
    ]
  }
}
```

## Development vs Production Differences

### Python Path

| Environment | Python Executable | Python Script | Implementation |
|-------------|------------------|---------------|----------------|
| **Development** | System `python3` (macOS/Linux) / `python` (Windows) | `src/python/convert.py` | [`converter.ts:101-118`](../src/main/python/converter.ts:101-118) |
| **Production** | System `python3` (macOS/Linux) / `python` (Windows) | `resources/python/convert.py` | [`converter.ts:101-118`](../src/main/python/converter.ts:101-118) |

**Note**: Python uses system Python in both development and production environments. Users need to have Python 3+ and Pandoc installed on their system.

**PythonConverter Class Implementation**:

```typescript
private getPythonPath(): string {
  // Always use system Python in both dev and production
  if (process.platform === 'win32') {
    return 'python';
  }
  return 'python3';
}

private getPythonScriptPath(): string {
  if (this.isDev) {
    // Development: src/python/convert.py in project root
    return path.join(process.cwd(), 'src/python/convert.py');
  } else {
    // Production: bundled script from extraResources
    return path.join((process as any).resourcesPath, 'python', 'convert.py');
  }
}
```

### Renderer Loading

| Environment | Loading Method | URL/Path | Implementation |
|-------------|----------------|-----------|----------------|
| **Development** | HTTP | `http://localhost:3000` | [`main.ts:47-49`](../src/main/main.ts:47-49) |
| **Production** | File | `dist/renderer/index.html` | [`main.ts:51-52`](../src/main/main.ts:51-52) |

```typescript
if (isDev) {
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools()
} else {
  mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}
```

### Window Settings

| Setting | Development | Production | Implementation |
|---------|-------------|------------|----------------|
| `nodeIntegration` | `true` | `false` | [`main.ts:29`](../src/main/main.ts:29) |
| `webSecurity` | `false` | `true` | [`main.ts:31`](../src/main/main.ts:31) |
| `DevTools` | Auto open | Closed | [`main.ts:49`](../src/main/main.ts:49) |

```typescript
webPreferences: {
  preload: join(__dirname, '../preload/index.js'),
  nodeIntegration: isDev,      // true only in Dev
  contextIsolation: true,       // always true
  webSecurity: !isDev,         // false only in Dev
  sandbox: false,               // for macOS file dialogs
}
```

### Certificate Verification (macOS)

In development environment, certificate verification is disabled to prevent macOS trust store errors.

```typescript
if (isDev) {
  app.commandLine.appendSwitch('ignore-certificate-errors')
  app.commandLine.appendSwitch('disable-features', 'CertVerifierBuiltinFeature')
  app.commandLine.appendSwitch('disable-site-isolation-trials')
}
```

## Pandoc Path Configuration

### macOS GUI App PATH

Additional PATH is set to find Pandoc path in Python scripts.

**Implementation**: [`converter.ts:51-66`](../src/main/python/converter.ts:51-66)

```typescript
const additionalPaths = [
  '/usr/local/bin',           // Homebrew (Intel Mac)
  '/opt/homebrew/bin',        // Homebrew (Apple Silicon)
  '/usr/bin',                 // System
  '/opt/local/bin',           // MacPorts
]
const currentPath = process.env.PATH || ''
const enhancedPath = [...additionalPaths, currentPath].join(':')

this.pythonProcess = spawn(pythonPath, args, {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    PATH: enhancedPath,
    PYTHONIOENCODING: 'utf-8',
  },
})
```

## Unit Conversion

### Margin Units

Handle unit differences between UI and Python/Pandoc.

| Layer | Unit | Conversion |
|--------|------|------------|
| UI (Renderer) | **cm** | User input (2.54cm) |
| Python Bridge | cm → inch | ÷ 2.54 (2.54cm → 1.0 inch) |
| Pandoc | **inch** | CLI parameter |

**Pandoc Command Example**:
```bash
pandoc input.md -o output.docx \
  --variable margin-top=1.0in \    # UI: 2.54cm
  --variable margin-bottom=1.0in \ # UI: 2.54cm
  --variable margin-left=1.25in \  # UI: 3.18cm
  --variable margin-right=1.25in    # UI: 3.18cm
```

**PandocConverter Implementation**: [`convert.py:129-133`](../src/python/convert.py:129-133)

```python
# Default margins (top:2.54cm, bottom:2.54cm, left:3.18cm, right:3.18cm)
cmd.extend(['--variable', 'margin-top=2.54cm'])
cmd.extend(['--variable', 'margin-bottom=2.54cm'])
cmd.extend(['--variable', 'margin-left=3.18cm'])
cmd.extend(['--variable', 'margin-right=3.18cm'])
```

## Multi-language Configuration

### Supported Languages

**File**: [`src/renderer/i18n.ts`](../src/renderer/i18n.ts)

```typescript
const SUPPORTED_LANGUAGES = [
  'ko', 'en', 'ja', 'zh-CN', 'zh-TW',
  'es', 'fr', 'de', 'it', 'pt-BR', 'ru', 'ar'
]
```

### Initial Language Determination

```typescript
const getInitialLanguage = (): string => {
  const savedLang = localStorage.getItem('language')
  if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
    return savedLang
  }
  
  const systemLang = navigator.language.split('-')[0]
  
  const langMap: Record<string, string> = {
    'zh': 'zh-CN',
    'en': 'en',
    'ja': 'ja',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'pt': 'pt-BR',
    'ru': 'ru',
    'ar': 'ar'
  }
  
  if (SUPPORTED_LANGUAGES.includes(systemLang)) {
    return systemLang
  }
  
  if (langMap[systemLang]) {
    return langMap[systemLang]
  }
  
  return 'ko'  // default
}
```

### Language Files

**Location**: [`src/renderer/locales/`](../src/renderer/locales/)

```
locales/
├── ar.json      # Arabic
├── de.json      # German
├── en.json      # English
├── es.json      # Spanish
├── fr.json      # French
├── it.json      # Italian
├── ja.json      # Japanese
├── ko.json      # Korean (default)
├── pt-BR.json   # Portuguese (Brazil)
├── ru.json      # Russian
├── zh-CN.json   # Chinese Simplified
└── zh-TW.json   # Chinese Traditional
```

## Theme Configuration

### Theme Type

**File**: [`src/renderer/context/ThemeContext.tsx`](../src/renderer/context/ThemeContext.tsx)

```typescript
type Theme = 'light' | 'dark' | 'system'
```

### Theme Storage

```typescript
const [theme, setThemeState] = useState<Theme>(() => {
  const saved = localStorage.getItem('theme') as Theme | null
  return saved || 'system'
})
```

### System Theme Detection

```typescript
const updateTheme = () => {
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    applyTheme(systemTheme)
  } else {
    applyTheme(theme)
  }
}
```

### Theme Application

```typescript
const applyTheme = (themeValue: 'light' | 'dark') => {
  root.classList.remove('light', 'dark')
  root.classList.add(themeValue)
  setEffectiveTheme(themeValue)
}
```

## Log Location

### Default Log Path

| OS | Path |
|----|------|
| Windows | `%APPDATA%/md-to-docx-converter/logs/` |
| macOS | `~/Library/Logs/md-to-docx-converter/` |
| Linux | `~/.local/share/md-to-docx-converter/logs/` |

### Log Levels

**Main Process**:
```typescript
console.log('[Main] Creating main window...')
console.log('[IPC] OPEN_FILE_DIALOG invoked')
```

**Python Process**:
```python
# Python script outputs JSON result to stdout
print(json.dumps(result))

# Errors go to stderr
sys.stderr.write(f'Error: {error_message}')
```

## macOS Permissions Configuration

### Sandbox Configuration

**File**: [`src/main/main.ts:32`](../src/main/main.ts:32)

```typescript
webPreferences: {
  sandbox: false,  // for macOS file dialog access
}
```

### Entitlements (entitlements.mac.plist)

**Note**: Currently, there is no `build/entitlements.mac.plist` file in the project. If needed, the following permissions can be added:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
</dict>
</plist>
```

### Info.plist Extension

**package.json**: [`package.json:94-98`](../package.json:94-98)

```json
"extendInfo": {
  "NSAppleEventsUsageDescription": "This app needs access to Apple Events to handle file operations.",
  "NSDocumentsFolderUsageDescription": "This app needs access to documents to convert files.",
  "NSDownloadsFolderUsageDescription": "This app needs access to downloads to convert files."
}
```

## Related Documents

- [Architecture](02-Architecture.md) - Development/production differences details
- [Build/Deploy](07-Build-Deploy.md) - Build configuration details
- [Data Models](05-Data-Models.md) - Configuration option types

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.0 | Initial configuration/environment documentation created |