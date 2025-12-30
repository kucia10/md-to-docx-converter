# 빌드/배포 (Build & Deploy)

## 개요

이 문서는 MD to DOCX Converter의 빌드, 패키징, 배포 절차를 설명합니다.

## 개발 환경 설정

### 사전 요구사항

| 항목 | 버전 | 설명 |
|------|------|------|
| Node.js | 18.0+ | JavaScript 런타임 |
| npm | 9.0+ | 패키지 매니저 |
| Python | 3.11+ | 변환 엔진 (개발 환경) |
| Pandoc | 3.0+ | 문서 변환 도구 (시스템 또는 bundled) |

### 의존성 설치

```bash
# 레포지토리 클론
git clone https://github.com/kucia10/md-to-docx-converter.git
cd md-to-docx-converter

# 의존성 설치
npm install

# postinstall 스크립트가 자동으로 electron-builder app-deps 설치
```

## 개발 명령어

### 개발 서버 실행

```bash
# 메인 프로세스 + 렌더러 개발 서버 동시 실행
npm run dev

# 메인 프로세스만 실행 (TypeScript 컴파일 + Electron)
npm run dev:main

# 렌더러 개발 서버만 실행 (Vite HMR, 포트 3000)
npm run dev:renderer
```

**개발 서버 설정**:
- **렌더러**: `http://localhost:3000` (Vite dev server)
- **메인 프로세스 디버깅**: `--inspect=5858` (Chrome DevTools로 디버깅 가능)
- **Node Integration**: 개발에서는 `true`, 프로덕션에서는 `false`
- **Web Security**: 개발에서는 `false` (파일 다이얼로그용)

### 테스트 실행

```bash
# 단일 테스트 실행
npm run test

# 감시 모드 (파일 변경 시 자동 재실행)
npm run test:watch

# UI 모드 (Vitest UI)
npm run test:ui
```

## 빌드 명령어

### 소스 코드 컴파일

```bash
# 메인 + 렌더러 모두 빌드
npm run build

# 메인 프로세스만 빌드 (TypeScript → CommonJS)
npm run build:main

# 렌더러만 빌드 (Vite → dist/renderer/)
npm run build:renderer
```

**빌드 결과물**:
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

### 빌드 설정

#### TypeScript 설정

**메인/Preload**: [`tsconfig.main.json`](../tsconfig.main.json)
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

**렌더러**: [`tsconfig.json`](../tsconfig.json)
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

#### Vite 설정

**파일**: [`vite.config.ts`](../vite.config.ts)

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

## 패키징 및 배포

### 전체 배포

```bash
# 모든 플랫폼 배포 (현재 OS 기준)
npm run dist

# 버전 증가 후 배포
npm run dist  # scripts/bump-version.js가 자동으로 버전 증가
```

**배포 결과물**: `release/` 디렉터리

### 플랫폼별 배포

```bash
# macOS 배포 (DMG)
npm run dist:mac

# Windows 배포 (EXE/MSI)
npm run dist:win

# Linux 배포 (AppImage)
npm run dist:linux
```

### electron-builder 설정

**파일**: [`electron-builder.yml`](../electron-builder.yml)

```yaml
appId: com.mdtodocx.converter
productName: MD to DOCX
copyright: Copyright © 2024 MD to DOCX Team
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

### 배포 결과물

#### Windows
- **형식**: NSIS 설치 프로그램 (`.exe`)
- **아키텍처**: x64, ia32
- **위치**: `release/MD to DOCX Setup 1.2.1.exe`
- **설치 옵션**:
  - `oneClick: false` - 설치 디렉터리 선택 가능
  - `allowToChangeInstallationDirectory: true`
  - `createDesktopShortcut: always`

#### macOS
- **형식**: DMG 디스크 이미지
- **아키텍처**: x64, arm64 (Universal Binary)
- **위치**: `release/MD to DOCX-1.2.1.dmg`
- **코드 서명**:
  - `hardenedRuntime: false` (개발용)
  - `gatekeeperAssess: false`
  - 엔트리틀먼트 설정 포함

#### Linux
- **형식**: AppImage
- **아키텍처**: x64
- **위치**: `release/MD to DOCX-1.2.1.AppImage`

## 버전 관리

### 자동 버전 증가

**스크립트**: [`scripts/bump-version.js`](../scripts/bump-version.js)

```bash
# 메이저 버전 업 (1.x.x → 2.0.0)
npm run version:major

# 마이너 버전 업 (1.2.x → 1.3.0)
npm run version:minor

# 패치 버전 업 (1.2.1 → 1.2.2)
npm run version:patch
```

**동작**:
1. `package.json`의 `version` 필드 업데이트
2. 콘솔에 변경 로그 출력

**스크립트 로직**:
```javascript
// 버전 파싱
const [major, minor, patch] = currentVersion.split('.').map(Number);

// 증가 로직
switch (versionPart) {
  case 'major':   newVersion = `${major + 1}.0.0`; break;
  case 'minor':   newVersion = `${major}.${minor + 1}.0`; break;
  case 'patch':   newVersion = `${major}.${minor}.${patch + 1}`; break;
}

// package.json 업데이트
packageJson.version = newVersion;
```

### 버전 규칙 (Semantic Versioning)

- **메이버 (X.0.0)**: 호환되지 않는 API 변경
- **마이너 (1.X.0)**: 하위 호환되는 기능 추가
- **패치 (1.2.X)**: 하위 호환되는 버그 수정

## CI/CD (GitHub Actions)

**참고**: 현재 프로젝트에는 CI/CD 설정이 없습니다. 필요 시 다음 기능을 구현할 수 있습니다:

1. **자동 빌드**: Push/PR 시 자동 빌드
2. **릴리스 자동화**: Git 태그 시 자동 패키징 및 GitHub Release 생성
3. **테스트 실행**: 빌드 전 자동 테스트
4. **아티팩트 업로드**: 빌드 결과물을 아티팩트로 저장

**예시 GitHub Workflow**:
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

## 배포 전 체크리스트

### 빌드 전
- [ ] 모든 테스트 통과 (`npm run test`)
- [ ] 버전 번호 업데이트 (`npm run version:patch/minor/major`)
- [ ] `CHANGELOG.md` 업데이트
- [ ] 의존성 최신 버전 확인

### 빌드 후
- [ ] 패키징 파일 크기 확인
- [ ] 각 플랫폼에서 설치 테스트
- [ ] 기본 기능 테스트 (파일 업로드, 변환, 저장)
- [ ] Python/Pandoc 통합 테스트

### 릴리스
- [ ] GitHub Release 생성
- [ ] 릴리스 노트 작성
- [ ] 아카이브 업로드
- [ ] 저장소 README 업데이트

## 문제 해결

### 빌드 오류

#### TypeScript 컴파일 오류
```bash
# 타입 확인
npm run build:main

# Strict 모드 오류 해결
# tsconfig.json에서 strict: true로 설정 확인
```

#### Vite 빌드 오류
```bash
# 캐시 삭제
rm -rf node_modules/.vite
npm run build:renderer

# 디버그 모드
DEBUG=vite:* npm run build:renderer
```

### 패키징 오류

#### electron-builder 오류
```bash
# electron-builder app-deps 재설치
npm run postinstall

# Python 스크립트 경로 확인
# src/python/convert.py 존재 확인

# 리소스 파일 확인
# src/resources/ 폴더 확인
```

#### macOS 코드 서명 오류
```bash
# 엔트리틀먼트 파일 확인
cat build/entitlements.mac.plist

# 코드 서명 비활성화 (개발용)
# electron-builder.yml에서 hardenedRuntime: false
```

### 런타임 오류

#### Python 찾을 수 없음
```bash
# Python 설치 확인
python3 --version

# Python 경로 확인
which python3  # macOS/Linux
where python    # Windows

# 시스템 PATH에 Python 추가
```

#### Pandoc 찾을 수 없음
```bash
# Pandoc 설치
brew install pandoc      # macOS (Homebrew)
apt-get install pandoc  # Ubuntu
choco install pandoc     # Windows (Chocolatey)

# Pandoc 버전 확인
pandoc --version
```

## 관련 문서

- [개요](01-Overview.md) - 프로젝트 개요
- [아키텍처](02-Architecture.md) - 시스템 구조
- [설정/환경](06-Configuration.md) - 환경 설정

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2024-12-29 | 1.0 | 초기 빌드/배포 문서 작성 |