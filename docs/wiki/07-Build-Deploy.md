# Build/Deploy

## Overview

This document describes the build, packaging, and deployment procedures for MD to DOCX Converter.

## Development Environment Setup

### Prerequisites

| Item | Version | Description |
|------|---------|-------------|
| Node.js | 18.0+ | JavaScript runtime |
| npm | 9.0+ | Package manager |
| Python | 3.11+ | Conversion engine (development environment) |
| Pandoc | 3.0+ | Document conversion tool (system or bundled) |

### Dependency Installation

```bash
# Clone repository
git clone https://github.com/kucia10/md-to-docx-converter.git
cd md-to-docx-converter

# Install dependencies
npm install

# postinstall script automatically installs electron-builder app-deps
```

## Development Commands

### Development Server Execution

```bash
# Run main process + renderer dev server simultaneously
npm run dev

# Run main process only (TypeScript compilation + Electron)
npm run dev:main

# Run renderer dev server only (Vite HMR, port 3000)
npm run dev:renderer
```

**Development Server Settings**:
- **Renderer**: `http://localhost:3000` (Vite dev server)
- **Main Process Debugging**: `--inspect=5858` (debuggable with Chrome DevTools)
- **Node Integration**: `true` in development, `false` in production
- **Web Security**: `false` in development (for file dialogs)

### Test Execution

```bash
# Single test execution
npm run test

# Watch mode (auto-restart on file changes)
npm run test:watch

# UI mode (Vitest UI)
npm run test:ui
```

## Build Commands

### Source Code Compilation

```bash
# Build both main + renderer
npm run build

# Build main process only (TypeScript → CommonJS)
npm run build:main

# Build renderer only (Vite → dist/renderer/)
npm run build:renderer
```

**Build Output**:
```
dist/
├── main/              # Main process (CommonJS)
│   ├── main.js
│   ├── ipc/
│   │   ├── channels.js
│   │   └── handlers.js
│   ├── python/
│   │   └── converter.js
│   └── preload/
│       └── index.js
└── renderer/          # Renderer process (Vite)
    ├── index.html
    ├── assets/
    └── *.js
```

### Build Configuration

#### TypeScript Configuration

**Main/Preload**: [`tsconfig.main.json`](../tsconfig.main.json)
```json
{
  "target": "ES2022",
  "module": "CommonJS",
  "rootDir": "src",
  "outDir": "dist",
  "strict": true,
  "moduleResolution": "node"
}
```

**Renderer**: [`tsconfig.json`](../tsconfig.json)
```json
{
  "target": "ES2022",
  "module": "ESNext",
  "jsx": "react-jsx",
  "paths": {
    "@/*": ["src/renderer/*"]
  }
}
```

#### Vite Configuration

**File**: [`vite.config.ts`](../vite.config.ts)

```typescript
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
    },
  },
  server: {
    port: 3000,
  },
})
```

## Packaging and Deployment

### Full Deployment

```bash
# Deploy all platforms (based on current OS)
npm run dist

# Deploy after version bump
npm run dist  # scripts/bump-version.js automatically bumps version
```

**Deployment Output**: `release/` directory

### Platform-specific Deployment

```bash
# macOS deployment (DMG)
npm run dist:mac

# Windows deployment (EXE/MSI)
npm run dist:win

# Linux deployment (AppImage)
npm run dist:linux
```

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
  - dist/**/*
  - src/python/**/*
  - src/resources/**/*

extraResources:
  - from: "src/python"
    to: "python"
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
    ],
    "mac": {
      "target": [{"target": "dmg", "arch": ["x64", "arm64"]}],
      "category": "public.app-category.productivity",
      "hardenedRuntime": false,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "extendInfo": {
        "NSAppleEventsUsageDescription": "...",
        "NSDocumentsFolderUsageDescription": "...",
        "NSDownloadsFolderUsageDescription": "..."
      }
    },
    "win": {
      "target": [{"target": "nsis", "arch": ["x64", "ia32"]}]
    },
    "linux": {
      "target": [{"target": "AppImage", "arch": ["x64"]}],
      "category": "Office"
    }
  }
}
```

### Deployment Artifacts

#### Windows
- **Format**: NSIS installer (`.exe`)
- **Architecture**: x64, ia32
- **Location**: `release/MD to DOCX Setup 1.2.1.exe`
- **Installation Options**:
  - `oneClick: false` - Can select installation directory
  - `allowToChangeInstallationDirectory: true`
  - `createDesktopShortcut: always`

#### macOS
- **Format**: DMG disk image
- **Architecture**: x64, arm64 (Universal Binary)
- **Location**: `release/MD to DOCX-1.2.1.dmg`
- **Code Signing**:
  - `hardenedRuntime: false` (for development)
  - `gatekeeperAssess: false`
  - Includes entitlements settings

#### Linux
- **Format**: AppImage
- **Architecture**: x64
- **Location**: `release/MD to DOCX-1.2.1.AppImage`

## Version Management

### Automatic Version Bump

**Script**: [`scripts/bump-version.js`](../scripts/bump-version.js)

```bash
# Major version bump (1.x.x → 2.0.0)
npm run version:major

# Minor version bump (1.2.x → 1.3.0)
npm run version:minor

# Patch version bump (1.2.1 → 1.2.2)
npm run version:patch
```

**Behavior**:
1. Update `package.json` `version` field
2. Output changelog to console

**Script Logic**:
```javascript
// Version parsing
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Bump logic
switch (versionPart) {
  case 'major':   newVersion = `${major + 1}.0.0`; break;
  case 'minor':   newVersion = `${major}.${minor + 1}.0`; break;
  case 'patch':   newVersion = `${major}.${minor}.${patch + 1}`; break;
}

// Update package.json
packageJson.version = newVersion;
```

### Version Rules (Semantic Versioning)

- **Major (X.0.0)**: Incompatible API changes
- **Minor (1.X.0)**: Backward-compatible feature additions
- **Patch (1.2.X)**: Backward-compatible bug fixes

## CI/CD (GitHub Actions)

**Note**: Currently, the project does not have CI/CD configuration. If needed, the following features can be implemented:

1. **Auto Build**: Automatic build on Push/PR
2. **Release Automation**: Automatic packaging and GitHub Release creation on Git tag
3. **Test Execution**: Automatic tests before build
4. **Artifact Upload**: Store build outputs as artifacts

**Example GitHub Workflow**:
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build
      - run: npm run dist
      
      - uses: actions/upload-artifact@v3
        with:
          name: dist-${{ matrix.os }}
          path: release/*
```

## Pre-deployment Checklist

### Before Build
- [ ] All tests pass (`npm run test`)
- [ ] Version number updated (`npm run version:patch/minor/major`)
- [ ] `CHANGELOG.md` updated
- [ ] Check dependencies for latest versions

### After Build
- [ ] Check package file size
- [ ] Installation test on each platform
- [ ] Basic functionality test (file upload, conversion, save)
- [ ] Python/Pandoc integration test

### Release
- [ ] Create GitHub Release
- [ ] Write release notes
- [ ] Upload archives
- [ ] Update repository README

## Troubleshooting

### Build Errors

#### TypeScript Compilation Errors
```bash
# Type check
npm run build:main

# Resolve Strict mode errors
# Check strict: true setting in tsconfig.json
```

#### Vite Build Errors
```bash
# Clear cache
rm -rf node_modules/.vite
npm run build:renderer

# Debug mode
DEBUG=vite:* npm run build:renderer
```

### Packaging Errors

#### electron-builder Errors
```bash
# Reinstall electron-builder app-deps
npm run postinstall

# Check Python script path
# Verify src/python/convert.py exists

# Check resource files
# Verify src/resources/ folder exists
```

#### macOS Code Signing Errors
```bash
# Check entitlements file
cat build/entitlements.mac.plist

# Disable code signing (for development)
# hardenedRuntime: false in electron-builder.yml
```

### Runtime Errors

#### Python Not Found
```bash
# Check Python installation
python3 --version

# Check Python path
which python3  # macOS/Linux
where python    # Windows

# Add Python to system PATH
```

#### Pandoc Not Found
```bash
# Install Pandoc
brew install pandoc      # macOS (Homebrew)
apt-get install pandoc  # Ubuntu
choco install pandoc     # Windows (Chocolatey)

# Check Pandoc version
pandoc --version
```

## Related Documents

- [Overview](01-Overview.md) - Project overview
- [Architecture](02-Architecture.md) - System structure
- [Configuration/Environment](06-Configuration.md) - Environment configuration

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.0 | Initial build/deploy documentation created |