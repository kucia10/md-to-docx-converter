# MD to DOCX

Electron 기반의 Markdown 파일을 DOCX로 변환하는 데스크톱 애플리케이션입니다. Python과 Pandoc을 사용하여 고품질의 문서 변환을 제공합니다.

## 기능

### 🎯 주요 기능
- **파일 업로드**: 드래그앤드롭 또는 파일 선택기 지원
- **실시간 미리보기**: Markdown 파일의 실시간 렌더링
- **다양한 변환 옵션**: 폰트, 여백, 페이지 방향 등 상세 설정
- **진행 상태 표시**: 변환 과정의 상세한 진행률 표시
- **다국어 지원**: 한국어, 영어, 일본어, 중국어 간체/번체, 스페인어, 프랑스어, 독일어, 포르투갈어, 러시아어 등 10개 언어 UI 지원
- **테마 지원**: 다크/라이트 모드 지원

### 🛠️ 변환 옵션
- **문서 설정**: 글꼴, 글자 크기, 줄 간격, 페이지 방향
- **페이지 여백**: 상하좌우 여백 개별 설정 (cm 단위)
- **고급 옵션**: 목차 생성, 참고문헌 스타일, 이미지 처리 방식

### 📱 사용자 인터페이스
- **직관적인 레이아웃**: 좌측 패널(파일/옵션) + 우측 패널(미리보기)
- **반응형 디자인**: 다양한 창 크기에서 최적화된 UI
- **다국어 전환**: 10개 언어 간 즉시 전환
- **테마 전환**: 다크/라이트 모드 전환

## 시스템 요구사항

### 최소 요구사항
- **운영체제**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **메모리**: 4GB RAM 이상
- **저장 공간**: 500MB 이상의 여유 공간

### 권장 사양
- **운영체제**: Windows 11, macOS 12+, Ubuntu 20.04+
- **메모리**: 8GB RAM 이상
- **저장 공간**: 1GB 이상의 여유 공간

## 설치 방법

### 자동 설치 (권장)
1. [Releases](https://github.com/kucia10/md-to-docx-converter/releases) 페이지에서 최신 버전 다운로드
2. 운영체제에 맞는 설치 파일 실행:
   - Windows: `.exe` 또는 `.msi` 파일
   - macOS: `.dmg` 파일
   - Linux: `.AppImage` 파일

### 수동 설치
1. 소스 코드를 클론합니다:
   ```bash
   git clone https://github.com/kucia10/md-to-docx-converter.git
   cd md-to-docx-converter
   ```

2. 의존성을 설치합니다:
   ```bash
   npm install
   ```

3. 개발 서버를 실행합니다:
   ```bash
   npm run dev
   ```

4. 배포용 빌드를 생성합니다:
   ```bash
   npm run dist
   ```

## 사용 방법

### 1. 파일 선택
- **드래그앤드롭**: Markdown 파일을 애플리케이션으로 드래그
- **파일 선택기**: '파일 선택' 버튼 클릭하여 파일 탐색
- **지원 형식**: `.md`, `.markdown` 파일

### 2. 미리보기 확인
- 선택된 파일의 내용이 우측 패널에 실시간으로 표시됩니다
- 여러 파일 선택 시 드롭다운으로 파일 전환 가능

### 3. 변환 옵션 설정
- **기본 설정**: 글꼴(Arial), 크기(12pt), 줄 간격(1.5)
- **페이지 설정**: 여백, 방향 등 문서 형식 지정
- **고급 옵션**: 목차, 참고문헌 등 전문가용 설정

### 4. 변환 실행
- '변환 시작' 버튼 클릭
- 진행 상태 표시창에서 진행률 확인
- 완료 시 결과 알림 및 파일 저장 위치 표시

## 개발

### 개발 환경 설정
1. 개발 의존성 설치:
   ```bash
   npm install
   ```

2. 개발 서버 시작:
   ```bash
   npm run dev
   ```

3. 번들링:
   ```bash
   npm run build
   ```

4. 패키지 생성:
   ```bash
   npm run dist          # 모든 플랫폼
   npm run dist:mac      # macOS 전용
   npm run dist:win      # Windows 전용
   npm run dist:linux    # Linux 전용
   ```

### 프로젝트 구조
```
electron-md-to-docx/
├── src/
│   ├── main/              # Electron 메인 프로세스
│   │   ├── main.ts
│   │   ├── ipc/         # IPC 통신 채널 및 핸들러
│   │   │   ├── channels.ts
│   │   │   └── handlers.ts
│   │   └── python/       # Python 브릿지
│   │       └── converter.ts
│   ├── preload/          # Preload 스크립트
│   │   └── index.ts
│   ├── renderer/          # React 렌더러 프로세스
│   │   ├── components/   # React 컴포넌트
│   │   ├── context/      # React Context (Theme 등)
│   │   ├── hooks/        # React 훅
│   │   ├── locales/      # 다국어 리소스
│   │   ├── styles/       # CSS 스타일
│   │   └── types/        # TypeScript 타입 정의
│   ├── python/           # Python 변환 스크립트
│   │   └── convert.py
│   └── resources/        # 애플리케이션 리소스
├── build/                # 빌드 설정
│   └── entitlements.mac.plist
├── release/              # 빌드 결과물
├── dist/                 # 컴파일된 코드
└── package.json
```

### 기술 스택
- **프론트엔드**: React 18.2, TypeScript 5.3, Tailwind CSS 3.3
- **백엔드**: Electron 33.2, Node.js
- **변환 엔진**: Python 3.11+, Pandoc 3.0+
- **빌드 도구**: Vite 5.0, electron-builder 24.8
- **라이브러리**: 
  - `react-dropzone` - 드래그앤드롭 파일 업로드
  - `react-markdown` - Markdown 렌더링
  - `i18next` - 다국어 지원
  - `lucide-react` - 아이콘 라이브러리

### 개발 스크립트
- `npm run dev` - 메인 프로세스와 렌더러 개발 서버 동시 실행
- `npm run dev:main` - 메인 프로세스 개발 (TypeScript 컴파일 + Electron)
- `npm run dev:renderer` - 렌더러 개발 서버 (Vite HMR)
- `npm run build` - 메인과 렌더러 모두 빌드
- `npm run test` - 테스트 실행
- `npm run test:watch` - 테스트 감시 모드

## 문제 해결

### 일반적인 문제

#### 변환 실패
- **원인**: Pandoc 경로 문제 또는 파일 권한
- **해결**: 
  1. 애플리케이션 재시작
  2. 출력 폴더의 쓰기 권한 확인
  3. 입력 파일이 유효한 Markdown인지 확인

#### 미리보기 표시 안됨
- **원인**: 파일 인코딩 문제
- **해결**: UTF-8로 인코딩된 Markdown 파일 사용

#### 애플리케이션 시작 실패
- **원인**: 시스템 호환성 문제
- **해결**:
  1. 최신 버전으로 업데이트
  2. 시스템 요구사항 확인
  3. 로그 파일 확인

#### macOS 파일 접근 권한 문제
- **원인**: 샌드박스 설정으로 인한 파일 접근 제한
- **해결**:
  1. 시스템 환경설정에서 애플리케이션에 파일 접근 권한 부여
  2. 문서/다운로드 폴더 접근 권한 확인

### 로그 위치
- **Windows**: `%APPDATA%/md-to-docx-converter/logs/`
- **macOS**: `~/Library/Logs/md-to-docx-converter/`
- **Linux**: `~/.local/share/md-to-docx-converter/logs/`

## 기여

### 기여 방법
1. 이슈 리포트: [Issues](https://github.com/kucia10/md-to-docx-converter/issues)
2. 기능 제안: [Discussions](https://github.com/kucia10/md-to-docx-converter/discussions)
3. 풀 리퀘스트: [Pull Requests](https://github.com/kucia10/md-to-docx-converter/pulls)

### 개발 가이드라인
1. Fork 저장소
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 커밋 (`git commit -m 'Add amazing feature'`)
4. 푸시 (`git push origin feature/amazing-feature`)
5. 풀 리퀘스트 생성

### 코딩 규칙
- **TypeScript**: Strict 모드 사용, 타입 명시
- **파일 경로**: 
  - Main/Preload 코드는 절대 경로 사용 (`src/main/...`)
  - Renderer 코드는 `@/` 별칭 사용 (`@/components/...`)
- **Python 경로**: 항상 `getPythonPath()` 및 `getPythonScriptPath()` 사용
- **IPC 채널**: `src/main/ipc/channels.ts`에서만 정의 및 import
- **단위 변환**: UI는 cm 단위, Python으로 전달 시 인치 변환 (÷2.54)

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 감사의 말씀

- [Electron](https://electronjs.org/) - 크로스플랫폼 데스크톱 애플리케이션 프레임워크
- [React](https://reactjs.org/) - 사용자 인터페이스 라이브러리
- [Pandoc](https://pandoc.org/) - 문서 변환 도구
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Lucide](https://lucide.dev/) - 아이콘 라이브러리
- [Vite](https://vitejs.dev/) - 빠른 빌드 도구

## 연락처

- **이메일**: bluesky.kucia10@gmail.com
- **GitHub**: https://github.com/kucia10/md-to-docx-converter
- **문서**: https://kucia10.github.io/md-to-docx-converter

---

**MD to DOCX Converter** - Markdown을 Word 문서로 간단하게 변환하세요 🚀