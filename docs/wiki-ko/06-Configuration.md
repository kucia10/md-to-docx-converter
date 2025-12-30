# 설정/환경 (Configuration)

## 개요

이 문서는 MD to DOCX Converter의 환경 설정, 빌드 설정, 그리고 개발/프로덕션 환경 간의 차이점을 설명합니다.

## 환경 변수

### NODE_ENV

| 값 | 용도 | 영향 |
|------|------|------|
| `development` | 개발 환경 | DevTools 활성화, Node Integration 활성화, 파일 다이얼로그용 Web Security 비활성화 |
| `production` | 프로덕션 환경 | 최적화, 보안 강화, 번들된 리소스 사용 |

**설정 방법**:
```bash
# 개발
NODE_ENV=development npm run dev

# 프로덕션 (빌드 시 자동 설정)
npm run dist
```

**사용 위치**:
- [`src/main/main.ts:5`](../src/main/main.ts:5) - 개발 환경 감지
- [`src/main/python/converter.ts:21`](../src/main/python/converter.ts:21) - Python 경로 결정

## 빌드 설정

### TypeScript 설정

#### 메인/Preload 프로세스

**파일**: [`tsconfig.main.json`](../tsconfig.main.json)

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

**중요 설정**:
- `module: CommonJS` - Node.js 호환
- `outDir: dist` - 빌드 결과물 위치
- `rootDir: src` - 소스 루트

#### 렌더러 프로세스

**파일**: [`tsconfig.json`](../tsconfig.json)

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

**중요 설정**:
- `module: ESNext` - Vite 번들러 호환
- `paths: "@/*": ["src/renderer/*"]` - 경로 별칭
- `jsx: react-jsx` - 새로운 JSX 변환

### Vite 설정

**파일**: [`vite.config.ts`](../vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',                    // 상대 경로 (Electron 필수)
  build: {
    outDir: 'dist/renderer',       // 빌드 결과물 위치
    emptyOutDir: true,            // 빌드 전 정리
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),  // @/ 별칭
    },
  },
  server: {
    port: 3000,                   // 개발 서버 포트
  },
})
```

**중요 설정**:
- `base: './'` - Electron에서는 상대 경로 사용
- `outDir: 'dist/renderer'` - Main/Preload와 분리
- `alias: '@'` - Renderer 코드에서 사용할 경로 별칭

### electron-builder 설정

**파일**: [`electron-builder.yml`](../electron-builder.yml)

```yaml
appId: com.mdtodocx.converter
productName: MD to DOCX
copyright: Copyright © 2025 MD to DOCX Team
electronVersion: 28.0.0

directories:
  output: release
  buildResources: resources

files:
  - dist/**/*           # 컴파일된 코드
  - src/python/**/*      # Python 스크립트
  - src/resources/**/*   # 앱 리소스

extraResources:
  - from: "src/python"
    to: "python"          # 번들링 시 python 폴더로 복사
    filter:
      - "**/*"
```

**package.json 내부 설정**: [`package.json:66-131`](../package.json:66-131)

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

## 개발 vs 프로덕션 차이

### Python 경로

| 환경 | Python 실행 파일 | Python 스크립트 | 구현 |
|------|-----------------|-----------------|------|
| **개발** | 시스템 `python3` (macOS/Linux) / `python` (Windows) | `src/python/convert.py` | [`converter.ts:101-118`](../src/main/python/converter.ts:101-118) |
| **프로덕션** | 시스템 `python3` (macOS/Linux) / `python` (Windows) | `resources/python/convert.py` | [`converter.ts:101-118`](../src/main/python/converter.ts:101-118) |

**참고**: 개발 및 프로덕션 환경 모두 시스템 Python을 사용합니다. 사용자는 시스템에 Python 3+와 Pandoc이 설치되어 있어야 합니다.

**PythonConverter 클래스 구현**:

```typescript
private getPythonPath(): string {
  // 개발 및 프로덕션 모두 시스템 Python 사용
  if (process.platform === 'win32') {
    return 'python';
  }
  return 'python3';
}

private getPythonScriptPath(): string {
  if (this.isDev) {
    // 개발: 프로젝트 루트의 src/python/convert.py
    return path.join(process.cwd(), 'src/python/convert.py');
  } else {
    // 프로덕션: extraResources에서 bundled 스크립트
    return path.join((process as any).resourcesPath, 'python', 'convert.py');
  }
}
```

### 렌더러 로딩

| 환경 | 로딩 방법 | URL/경로 | 구현 |
|------|------------|-----------|------|
| **개발** | HTTP | `http://localhost:3000` | [`main.ts:47-49`](../src/main/main.ts:47-49) |
| **프로덕션** | File | `dist/renderer/index.html` | [`main.ts:51-52`](../src/main/main.ts:51-52) |

```typescript
if (isDev) {
  mainWindow.loadURL('http://localhost:3000')
  mainWindow.webContents.openDevTools()
} else {
  mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}
```

### 윈도우 설정

| 설정 | 개발 | 프로덕션 | 구현 |
|------|------|----------|------|
| `nodeIntegration` | `true` | `false` | [`main.ts:29`](../src/main/main.ts:29) |
| `webSecurity` | `false` | `true` | [`main.ts:31`](../src/main/main.ts:31) |
| `DevTools` | 자동 열림 | 닫혀 있음 | [`main.ts:49`](../src/main/main.ts:49) |

```typescript
webPreferences: {
  preload: join(__dirname, '../preload/index.js'),
  nodeIntegration: isDev,      // Dev에서만 true
  contextIsolation: true,       // 항상 true
  webSecurity: !isDev,         // Dev에서만 false
  sandbox: false,               // macOS 파일 다이얼로그용
}
```

### 인증서 검증 (macOS)

**개발 환경**에서는 macOS 신뢰 저장소 오류를 방지하기 위해 인증서 검증을 비활성화합니다.

```typescript
if (isDev) {
  app.commandLine.appendSwitch('ignore-certificate-errors')
  app.commandLine.appendSwitch('disable-features', 'CertVerifierBuiltinFeature')
  app.commandLine.appendSwitch('disable-site-isolation-trials')
}
```

## Pandoc 경로 설정

### macOS GUI 앱 PATH

Python 스크립트에서 Pandoc 경로를 찾기 위해 추가 PATH를 설정합니다.

**구현**: [`converter.ts:51-66`](../src/main/python/converter.ts:51-66)

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

## 단위 변환

### 여백 단위

UI와 Python/Pandoc 간의 단위 차이를 처리합니다.

| 레이어 | 단위 | 변환 |
|--------|------|------|
| UI (Renderer) | **cm** | 사용자 입력 (2.54cm) |
| Python Bridge | cm → inch | ÷ 2.54 (2.54cm → 1.0 inch) |
| Pandoc | **inch** | CLI 파라미터 |

**Pandoc 명령 예시**:
```bash
pandoc input.md -o output.docx \
  --variable margin-top=1.0in \    # UI: 2.54cm
  --variable margin-bottom=1.0in \ # UI: 2.54cm
  --variable margin-left=1.25in \  # UI: 3.18cm
  --variable margin-right=1.25in    # UI: 3.18cm
```

**PandocConverter 구현**: [`convert.py:129-133`](../src/python/convert.py:129-133)

```python
# Default margins (top:2.54cm, bottom:2.54cm, left:3.18cm, right:3.18cm)
cmd.extend(['--variable', 'margin-top=2.54cm'])
cmd.extend(['--variable', 'margin-bottom=2.54cm'])
cmd.extend(['--variable', 'margin-left=3.18cm'])
cmd.extend(['--variable', 'margin-right=3.18cm'])
```

## 다국어 설정

### 지원 언어

**파일**: [`src/renderer/i18n.ts`](../src/renderer/i18n.ts)

```typescript
const SUPPORTED_LANGUAGES = [
  'ko', 'en', 'ja', 'zh-CN', 'zh-TW',
  'es', 'fr', 'de', 'it', 'pt-BR', 'ru', 'ar'
]
```

### 초기 언어 결정

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
  
  return 'ko'  // 기본값
}
```

### 언어 파일

**위치**: [`src/renderer/locales/`](../src/renderer/locales/)

```
locales/
├── ar.json      # 아랍어
├── de.json      # 독일어
├── en.json      # 영어
├── es.json      # 스페인어
├── fr.json      # 프랑스어
├── it.json      # 이탈리아어
├── ja.json      # 일본어
├── ko.json      # 한국어 (기본값)
├── pt-BR.json   # 포르투갈어 (브라질)
├── ru.json      # 러시아어
├── zh-CN.json   # 중국어 간체
└── zh-TW.json   # 중국어 번체
```

## 테마 설정

### 테마 타입

**파일**: [`src/renderer/context/ThemeContext.tsx`](../src/renderer/context/ThemeContext.tsx)

```typescript
type Theme = 'light' | 'dark' | 'system'
```

### 테마 저장소

```typescript
const [theme, setThemeState] = useState<Theme>(() => {
  const saved = localStorage.getItem('theme') as Theme | null
  return saved || 'system'
})
```

### 시스템 테마 감지

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

### 테마 적용

```typescript
const applyTheme = (themeValue: 'light' | 'dark') => {
  root.classList.remove('light', 'dark')
  root.classList.add(themeValue)
  setEffectiveTheme(themeValue)
}
```

## 로그 위치

### 기본 로그 경로

| OS | 경로 |
|----|------|
| Windows | `%APPDATA%/md-to-docx-converter/logs/` |
| macOS | `~/Library/Logs/md-to-docx-converter/` |
| Linux | `~/.local/share/md-to-docx-converter/logs/` |

### 로그 수준

**Main Process**:
```typescript
console.log('[Main] Creating main window...')
console.log('[IPC] OPEN_FILE_DIALOG invoked')
```

**Python Process**:
```python
# Python 스크립트는 JSON 결과를 stdout에 출력
print(json.dumps(result))

# 오류는 stderr
sys.stderr.write(f'Error: {error_message}')
```

## macOS 권한 설정

### 샌드박스 설정

**파일**: [`src/main/main.ts:32`](../src/main/main.ts:32)

```typescript
webPreferences: {
  sandbox: false,  // macOS 파일 다이얼로그 접근용
}
```

### 엔트리틀먼트 (entitlements.mac.plist)

**참고**: 현재 프로젝트에는 `build/entitlements.mac.plist` 파일이 없습니다. 필요 시 다음 권한을 추가할 수 있습니다:

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

### Info.plist 확장

**package.json**: [`package.json:94-98`](../package.json:94-98)

```json
"extendInfo": {
  "NSAppleEventsUsageDescription": "This app needs access to Apple Events to handle file operations.",
  "NSDocumentsFolderUsageDescription": "This app needs access to documents to convert files.",
  "NSDownloadsFolderUsageDescription": "This app needs access to downloads to convert files."
}
```

## 관련 문서

- [아키텍처](02-Architecture.md) - 개발/프로덕션 차이 상세
- [빌드/배포](07-Build-Deploy.md) - 빌드 설정 상세
- [데이터 모델](05-Data-Models.md) - 설정 옵션 타입

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 1.0 | 초기 설정/환경 문서 작성 |