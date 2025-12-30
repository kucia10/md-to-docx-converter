# 정보 아키텍처 (Information Architecture)

## 문서 트리

```
wiki/
├── 00-IA-Information-Architecture.md (이 문서)
├── 01-Overview.md                     # 개요
├── 02-Architecture.md                 # 아키텍처
├── 03-Module-Reference/               # 모듈 레퍼런스
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
├── 04-API-Interface.md                # API/인터페이스 (IPC 채널)
├── 05-Data-Models.md                  # 데이터 모델/타입
├── 06-Configuration.md                # 설정/환경
├── 07-Build-Deploy.md                 # 빌드/배포
├── 08-Observability.md                # 관찰가능성 (로그/메트릭/트레이싱)
└── 09-Operations-Troubleshooting.md   # 운영/트러블슈팅
```

## 분석 완료 현황

| 구분 | 상태 | 비고 |
|------|------|------|
| A. 개요 | 🟢 완료 | 프로젝트 개요, 기술 스택 파악 완료 |
| B. 아키텍처 | 🟢 완료 | 3-레이어 구조, IPC 통신, Python 통합 파악 |
| C. 모듈 레퍼런스 | 🟢 완료 | 모든 주요 모듈 문서화 완료 |
| D. API/인터페이스 | 🟢 완료 | IPC 채널 정의 완료 |
| E. 데이터 | 🟢 완료 | 타입 정의 문서화 완료 |
| F. 설정/환경 | 🟢 완료 | 빌드 설정 분석 완료 |
| G. 빌드/배포 | 🟢 완료 | 빌드 스크립트, 배포 설정 파악 완료 |
| H. 관찰가능성 | 🟢 완료 | 로그, 메트릭, 트레이싱 문서화 완료 |
| I. 운영/트러블슈팅 | 🟢 완료 | FAQ, 트러블슈팅 가이드 완료 |

## A. 개요 (Overview)

### 프로젝트 개요
- **이름**: md-to-docx-converter
- **버전**: 1.2.1
- **목표**: Electron 기반 데스크톱 애플리케이션 - Markdown 파일을 DOCX로 변환
- **기술 스택**:
  - 프론트엔드: React 18.2 + TypeScript 5.3 + Tailwind CSS 3.3
  - 데스크톱: Electron 33.2
  - 변환 엔진: Python 3.11+ + Pandoc 3.0+
  - 빌드 도구: Vite 5.0 + electron-builder 24.8

### 핵심 기능
1. **파일 업로드**: 드래그앤드롭, 파일 선택기
2. **실시간 미리보기**: Markdown 렌더링
3. **변환 옵션**: 폰트, 여백, 페이지 방향 등 상세 설정
4. **배치 변환**: 다중 파일 일괄 처리
5. **병합 변환**: 여러 파일을 단일 DOCX로 병합
6. **다국어 지원**: 12개 언어 (한국어, 영어, 일본어, 중국어 간체/번체, 스페인어, 프랑스어, 독일어, 포르투갈어, 러시아어, 이탈리아어, 아랍어)
7. **테마 지원**: 다크/라이트 모드

## B. 아키텍처 (Architecture)

### 3-레이어 구조

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

### 런타임 플로우

1. **UI 상호작용**: 사용자가 파일 선택/옵션 설정
2. **IPC 호출**: Renderer → Main (via Preload)
3. **Python 프로세스 실행**: Main이 Python 스크립트 spawn
4. **Pandoc 변환**: Python이 Pandoc 호출하여 DOCX 생성
5. **결과 전달**: Main → Renderer (IPC 이벤트)

### IPC 통신 채널

| 채널 | 방향 | 목적 |
|------|------|------|
| `open-file-dialog` | Renderer → Main | 파일 선택 다이얼로그 표시 |
| `save-file-dialog` | Renderer → Main | 저장 다이얼로그 표시 |
| `open-directory-dialog` | Renderer → Main | 디렉터리 선택 다이얼로그 |
| `read-file` | Renderer → Main | 파일 내용 읽기 |
| `start-conversion` | Renderer → Main | 단일 파일 변환 시작 |
| `start-batch-conversion` | Renderer → Main | 배치 변환 시작 |
| `start-merge-conversion` | Renderer → Main | 병합 변환 시작 |
| `cancel-conversion` | Renderer → Main | 변환 취소 |
| `conversion-progress` | Main → Renderer | 변환 진행률 이벤트 |
| `conversion-complete` | Main → Renderer | 변환 완료 이벤트 |
| `conversion-error` | Main → Renderer | 변환 오류 이벤트 |
| `batch-conversion-progress` | Main → Renderer | 배치 변환 진행률 |
| `batch-conversion-complete` | Main → Renderer | 배치 변환 완료 |
| `merge-conversion-progress` | Main → Renderer | 병합 변환 진행률 |
| `merge-conversion-complete` | Main → Renderer | 병합 변환 완료 |
| `get-app-version` | Renderer → Main | 앱 버전 조회 |
| `quit-app` | Renderer → Main | 앱 종료 |

## C. 모듈 레퍼런스 (Module Reference)

### Main Process (src/main/)

| 모듈 | 파일 | 책임 |
|------|------|------|
| Main Entry | `main.ts` | 앱 초기화, 윈도우 생성, 이벤트 핸들링 |
| IPC Handlers | `ipc/handlers.ts` | IPC 채널 핸들러 구현 |
| IPC Channels | `ipc/channels.ts` | IPC 채널 상수 정의 |
| Python Converter | `python/converter.ts` | Python 프로세스 관리, 변환 요청 처리 |

### Preload Script (src/preload/)

| 모듈 | 파일 | 책임 |
|------|------|------|
| Preload | `index.ts` | Context Bridge, API 노출 |

### Renderer Process (src/renderer/)

| 모듈 | 파일/폴더 | 책임 |
|------|-----------|------|
| App Entry | `App.tsx`, `main.tsx` | React 앱 진입점 |
| Components | `components/` | UI 컴포넌트 집합 |
| Hooks | `hooks/` | 커스텀 훅 (변환, 파일 업로드, 미리보기) |
| Context | `context/` | React Context (테마) |
| Locales | `locales/` | 다국어 리소스 JSON |
| Types | `types/` | TypeScript 타입 정의 |
| Styles | `styles/` | CSS/Tailwind 설정 |

### Python (src/python/)

| 모듈 | 파일 | 책임 |
|------|------|------|
| Convert Script | `convert.py` | Pandoc 변환 로직, 병합 로직 |

## D. API/인터페이스 (API/Interface)

상세 내용은 [`04-API-Interface.md`](04-API-Interface.md) 참조

## E. 데이터 모델 (Data Models)

상세 내용은 [`05-Data-Models.md`](05-Data-Models.md) 참조

## F. 설정/환경 (Configuration)

### 빌드 설정
- **Vite**: `vite.config.ts` (개발 서버 3000번 포트)
- **TypeScript**: 
  - `tsconfig.json` (Renderer용, `@/` 별칭)
  - `tsconfig.main.json` (Main/Preload용)
- **Electron Builder**: `electron-builder.yml`

### 환경 변수
- `NODE_ENV`: `development` 또는 `production`

### 개발/프로덕션 차이
| 항목 | 개발 | 프로덕션 |
|------|------|----------|
| Python 경로 | 시스템 `python3` (macOS/Linux) / `python` (Windows) | 시스템 `python3` (macOS/Linux) / `python` (Windows) |
| Python 실행파일 | 시스템 `python3`/`python` | 시스템 `python3`/`python` |
| Python 스크립트 | `src/python/convert.py` | `resources/python/convert.py` |
| 렌더러 로드 | `http://localhost:3000` | `dist/renderer/index.html` |
| Node Integration | `true` | `false` |

상세 내용은 [`06-Configuration.md`](06-Configuration.md) 참조

## G. 빌드/배포 (Build & Deploy)

### 개발 스크립트
- `npm run dev` - 메인 + 렌더러 동시 실행
- `npm run dev:main` - 메인 프로세스만
- `npm run dev:renderer` - 렌더러 개발 서버만
- `npm run build` - 빌드
- `npm run dist` - 전체 플랫폼 배포
- `npm run dist:mac` - macOS 배포
- `npm run dist:win` - Windows 배포
- `npm run dist:linux` - Linux 배포

### 빌드 산출물
- **Windows**: `.exe` (NSIS 설치 프로그램)
- **macOS**: `.dmg` (x64, arm64 universal)
- **Linux**: `.AppImage`

### 버전 관리
- `npm run version:major` - 메이저 버전 업
- `npm run version:minor` - 마이너 버전 업
- `npm run version:patch` - 패치 버전 업

상세 내용은 [`07-Build-Deploy.md`](07-Build-Deploy.md) 참조

## H. 운영/트러블슈팅 (Operations & Troubleshooting)

상세 내용은 [`09-Operations-Troubleshooting.md`](09-Operations-Troubleshooting.md) 참조

## I. 관찰가능성 (Observability)

상세 내용은 [`08-Observability.md`](08-Observability.md) 참조

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 2.0 | 모든 모듈 문서화 완료, 관찰가능성/운영 섹션 추가, IA 갱신 |
| 2025-12-29 | 1.0 | IA 초기 초안 작성 |