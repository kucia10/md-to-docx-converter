# 개요 (Overview)

## 프로젝트 개요

**MD to DOCX Converter**는 Electron 기반 데스크톱 애플리케이션으로, Markdown 파일을 Microsoft Word 문서(DOCX)로 변환하는 기능을 제공합니다.

- **이름**: md-to-docx-converter
- **버전**: 1.2.1
- **라이선스**: MIT
- **저장소**: https://github.com/kucia10/md-to-docx-converter
- **설정 파일**: [`package.json`](../package.json)

## 목표

Markdown 파일 작성자들이 문서를 Word 형식으로 변환할 때 겪는 다음 문제들을 해결합니다:

1. 복잡한 변환 도구 없이 간단하게 변환
2. 다양한 서식 옵션(폰트, 여백, 페이지 설정) 지원
3. 다중 파일 일괄 처리 및 병합 기능
4. 실시간 미리보기로 변환 전 내용 확인
5. 다국어 UI 지원으로 전 세계 사용자 접근성 확보

## 핵심 기능

### 1. 파일 업로드
- **드래그앤드롭**: 파일을 애플리케이션으로 드래그하여 업로드
- **파일 선택기**: 버튼 클릭으로 파일 탐색 및 선택
- **다중 파일 지원**: 여러 Markdown 파일 동시 선택
- **파일 순서 조정**: 드래그 앤 드롭으로 파일 순서 변경 (병합 시 중요)
- **지원 형식**: `.md`, `.markdown`

### 2. 실시간 미리보기
- **단일 파일 미리보기**: 선택된 파일 내용 렌더링
- **병합 미리보기**: 여러 파일을 하나로 합쳐서 미리보기
- **파일 간 전환**: 드롭다운으로 파일 선택 및 미리보기

### 3. 변환 옵션

#### 문서 설정
- **폰트 패밀리**: Arial, Times New Roman, Calibri, Helvetica, Georgia, Verdana, Cambria
- **폰트 크기**: 8pt ~ 72pt (기본 12pt)
- **줄 간격**: 0.5 ~ 3.0 (기본 1.5)
- **페이지 방향**: 세로(portrait) / 가로(landscape)

#### 페이지 여백 (cm 단위)
- 상단, 하단: 0 ~ 10cm (기본 2.54cm)
- 좌측, 우측: 0 ~ 10cm (기본 3.18cm)

#### 고급 옵션
- **목차 생성**: 자동 목차 생성 여부 (기본 활성화)
- **참고문헌 스타일**: APA, MLA, Chicago, Harvard
- **이미지 처리**: 임베드(embed) / 링크(link)
- **코드 블록 스타일**: Fenced / Indented

### 4. 변환 모드

#### 단일 파일 변환
- 선택한 Markdown 파일 하나를 DOCX로 변환

#### 배치 변환
- 여러 Markdown 파일을 개별 DOCX 파일로 일괄 변환
- 선택한 디렉터리에 모두 저장

#### 병합 변환
- 여러 Markdown 파일을 **단일 DOCX**로 병합
- 파일 사이에 페이지 구분 삽입
- 각 파일명을 섹션 헤더로 추가

### 5. 다국어 지원 (12개 언어)
- 한국어 (ko)
- 영어 (en)
- 일본어 (ja)
- 중국어 간체 (zh-CN)
- 중국어 번체 (zh-TW)
- 스페인어 (es)
- 프랑스어 (fr)
- 독일어 (de)
- 이탈리아어 (it)
- 포르투갈어 (pt-BR)
- 러시아어 (ru)
- 아랍어 (ar)

### 6. 테마 지원
- **라이트 모드**: 밝은 테마
- **다크 모드**: 어두운 테마
- **시스템 모드**: OS 테마 따르기

## 기술 스택

### 프론트엔드 (Renderer Process)
- **React 18.2**: UI 라이브러리
- **TypeScript 5.3**: 정적 타입 언어
- **Tailwind CSS 3.3**: CSS 프레임워크
- **React Router 7.11**: 라우팅
- **i18next 25.7**: 다국어 지원
- **react-markdown 9.0**: Markdown 렌더링
- **react-dropzone 14.2**: 파일 드래그앤드롭
- **lucide-react 0.294**: 아이콘 라이브러리
- **@hello-pangea/dnd 18.0**: 드래그앤드롭 라이브러리

### 백엔드 (Main Process)
- **Electron 33.2**: 데스크톱 애플리케이션 프레임워크
- **Node.js**: JavaScript 런타임

### 변환 엔진
- **Python 3.11+**: 스크립팅 언어
- **Pandoc 3.0+**: 문서 변환 도구

### 빌드 도구
- **Vite 5.0**: 빠른 빌드 도구 (렌더러)
- **TypeScript Compiler**: Main/Preload 빌드
- **electron-builder 24.8**: 앱 패키징

### 테스트 도구
- **Vitest 1.6**: 단위 테스트 프레임워크
- **happy-dom 12.10**: DOM 시뮬레이션

## 시스템 요구사항

### 최소 요구사항
- **운영체제**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **메모리**: 4GB RAM 이상
- **저장 공간**: 500MB 이상의 여유 공간
- **Python**: 3.11 이상 (개발 환경)
- **Pandoc**: 3.0 이상 (시스템 설치 또는 bundled)

### 권장 사양
- **운영체제**: Windows 11, macOS 12+, Ubuntu 20.04+
- **메모리**: 8GB RAM 이상
- **저장 공간**: 1GB 이상의 여유 공간

## 아키텍처 개요

### 3-레이어 구조
```
┌─────────────────────────────────────────┐
│    Renderer Process (React UI)        │
│  - 컴포넌트, 훅, Context, i18n       │
└─────────────────────────────────────────┘
              ↓ IPC 통신
┌─────────────────────────────────────────┐
│    Preload Script                     │
│  - Context Bridge (window.electronAPI) │
└─────────────────────────────────────────┘
              ↓ IPC 통신
┌─────────────────────────────────────────┐
│    Main Process                       │
│  - 윈도우 관리, IPC 핸들러          │
│  - Python 프로세스 실행               │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│    Python + Pandoc                    │
│  - convert.py: 변환 로직             │
│  - Pandoc: 실제 문서 변환            │
└─────────────────────────────────────────┘
```

### 주요 통신 방식
- **IPC (Inter-Process Communication)**: Renderer ↔ Main ↔ Preload 간 통신
- **Python Process**: Main이 Python 스크립트를 `spawn()`으로 실행
- **Stdout/Stderr**: Python 변환 결과를 JSON으로 Main에 전달

## 프로젝트 구조

```
electron-md-to-docx/
├── src/
│   ├── main/              # Electron 메인 프로세스
│   │   ├── main.ts       # 앱 진입점, 윈도우 생성
│   │   ├── ipc/          # IPC 통신
│   │   │   ├── channels.ts     # 채널 상수 정의
│   │   │   └── handlers.ts    # IPC 핸들러 구현
│   │   └── python/       # Python 브릿지
│   │       └── converter.ts   # Python 프로세스 관리
│   ├── preload/          # Preload 스크립트
│   │   └── index.ts     # Context Bridge, API 노출
│   ├── renderer/         # React 렌더러 프로세스
│   │   ├── App.tsx      # 메인 앱 컴포넌트
│   │   ├── components/   # UI 컴포넌트
│   │   ├── hooks/       # 커스텀 훅
│   │   ├── context/      # React Context
│   │   ├── locales/     # 다국어 JSON
│   │   ├── styles/      # CSS 스타일
│   │   └── types/       # TypeScript 타입
│   ├── python/           # Python 스크립트
│   │   ├── convert.py   # 변환 메인 스크립트
│   │   ├── filters/     # Pandoc 필터
│   │   └── requirements.txt
│   └── resources/       # 앱 리소스 (아이콘 등)
├── wiki/                # 위키 문서
├── build/               # 빌드 설정
├── release/             # 빌드 결과물
├── dist/                # 컴파일된 코드
├── package.json
├── tsconfig.json
├── vite.config.ts
└── electron-builder.yml
```

## 개발/빌드/배포

### 개발 명령어
```bash
npm run dev                # 메인 + 렌더러 동시 실행
npm run dev:main           # 메인 프로세스만
npm run dev:renderer       # 렌더러 개발 서버만 (포트 3000)
npm run test               # 테스트 실행
npm run test:watch         # 테스트 감시 모드
```

### 빌드 명령어
```bash
npm run build             # 메인 + 렌더러 빌드
npm run build:main        # 메인 프로세스 빌드
npm run build:renderer    # 렌더러 빌드
```

### 배포 명령어
```bash
npm run dist              # 모든 플랫폼 배포
npm run dist:mac          # macOS 배포 (DMG)
npm run dist:win          # Windows 배포 (EXE/MSI)
npm run dist:linux        # Linux 배포 (AppImage)
```

### 버전 관리
```bash
npm run version:major      # 메이저 버전 업 (1.x.x → 2.0.0)
npm run version:minor      # 마이너 버전 업 (1.2.x → 1.3.0)
npm run version:patch      # 패치 버전 업 (1.2.1 → 1.2.2)
```

## 코딩 규칙

### TypeScript 규칙
- **Strict 모드**: 모든 파일에서 타입 명시
- **경로 별칭**: Renderer는 `@/`, Main/Preload는 절대 경로

### 파일 경로 규칙
- **Main/Preload 코드**: `src/main/...` 또는 `src/preload/...` 절대 경로 사용
- **Renderer 코드**: `@/components/...` 별칭 사용
- **Python 경로**: 항상 `getPythonPath()`, `getPythonScriptPath()` 사용 (dev/prod 자동 전환)

### 단위 변환 규칙
- **UI**: 여백을 **cm** 단위로 저장
- **Python 전달**: cm → inch 변환 (÷2.54) 후 Pandoc에 전달

### IPC 채널 규칙
- 모든 채널은 [`src/main/ipc/channels.ts`](../src/main/ipc/channels.ts)에서만 정의 및 import

## 관련 문서

- [아키텍처](02-Architecture.md) - 시스템 구조 상세
- [데이터 모델](05-Data-Models.md) - 타입 정의 및 데이터 흐름
- [API/인터페이스](04-API-Interface.md) - IPC 채널 상세
- [모듈 레퍼런스](03-Module-Reference/) - 각 모듈 상세 설명
- [빌드/배포](07-Build-Deploy.md) - 빌드 설정 및 배포 절차

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 1.0 | 초기 위키 문서 작성 |