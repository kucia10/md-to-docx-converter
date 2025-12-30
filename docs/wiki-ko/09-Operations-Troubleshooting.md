# 운영 및 트러블슈팅 (Operations & Troubleshooting)

## 개요

MD to DOCX Converter는 데스크톱 애플리케이션으로, 운영 및 트러블슈팅에 대한 일반적인 문제와 해결 방법을 제공합니다.

## 일반적인 문제 및 해결 방법

### 1. 변환 실패

#### 문제 증상
- 변환 버튼 클릭 후 아무 반응 없음
- "변환 오류" 메시지 표시
- DOCX 파일이 생성되지 않음

#### 원인
- Pandoc이 설치되지 않음
- Python 경로가 올바르지 않음
- 입력 파일이 손상됨
- 변환 옵션에 문제 있음

#### 해결 방법
1. **Pandoc 설치 확인**:
   ```bash
   # macOS
   brew install pandoc
   
   # Windows
   # https://pandoc.org/installing.html 에서 다운로드
   
   # Linux
   sudo apt-get install pandoc
   ```

2. **Pandoc 버전 확인**:
   ```bash
   pandoc --version
   # 3.0+ 이상 필요
   ```

3. **Python 설치 확인**:
   ```bash
   python3 --version
   # 3.11+ 이상 필요
   ```

4. **개발 모드에서 로그 확인**:
   - VSCode 터미널에서 Python stdout 확인
   - JSON 파싱 오류 확인

#### 로그 확인
```
[Main] Python stdout: {"success": true, ...}
[Main] Python stderr: [Pandoc 오류 메시지]
```

### 2. macOS 파일 접근 권한 문제

#### 문제 증상
- 파일 선택 다이얼로그가 열리지 않음
- "Permission denied" 오류 발생
- 파일을 읽을 수 없음

#### 원인
- 샌드박스 설정 문제
- macOS 파일 접근 권한 제한

#### 해결 방법
1. **샌드박스 설정 확인** ([`main.ts`](../../src/main/main.ts:295)):
   ```typescript
   webPreferences: {
     sandbox: false,  // macOS 파일 다이얼로그용
     // ...
   }
   ```

2. **시스템 환경설정**:
   - macOS 시스템 환경설정 → 개인정보 보호 및 보안
   - 파일 및 폴더 권한 확인
   - "전체 디스크 접근 권한" 부여 필요할 수 있음

### 3. 미리보기 표시 안됨

#### 문제 증상
- 파일 선택 후 미리보기가 비어있음
- 특수 문자가 깨짐
- 이미지가 로드되지 않음

#### 원인
- 파일 인코딩이 UTF-8이 아님
- 이미지 경로가 올바르지 않음
- Markdown 문법 오류

#### 해결 방법
1. **파일 인코딩 확인**:
   - UTF-8로 저장된 파일인지 확인
   - 다른 인코딩인 경우 UTF-8로 변환

2. **이미지 경로 확인**:
   - 상대 경로 사용 (프로젝트 디렉터리 기준)
   - 절대 경로 사용 시 문제 발생 가능

3. **Markdown 문법 확인**:
   - [`MarkdownPreview`](../03-Module-Reference/renderer/components/MarkdownPreview.md) 컴포넌트에서 렌더링
   - `react-markdown`에서 지원하는 문법 사용

### 4. 대용량 파일 변환이 느림

#### 문제 증상
- 파일 크기가 클 때 변환이 오래 걸림
- UI가 응답하지 않음

#### 원인
- Pandoc 처리 시간
- 파일 읽기/쓰기 시간
- 대용량 이미지 포함

#### 해결 방법
1. **진행률 표시**: [`ProgressBar`](../03-Module-Reference/renderer/components/ProgressBar.md)로 진행률 확인
2. **배치 변환 사용**: 작은 파일로 나누어 변환
3. **병합 변환 대신 배치 변환**: 개별 변환이 더 빠를 수 있음

### 5. 언어 전환 안됨

#### 문제 증상
- 언어 토글 클릭 시 UI가 변경되지 않음
- 설정이 저장되지 않음

#### 원인
- `localStorage` 접근 문제
- 번역 키 누락

#### 해결 방법
1. **localStorage 확인**:
   ```javascript
   // 브라우저 DevTools 콘솔에서
   console.log(localStorage.getItem('language'))
   ```

2. **언어 리소스 확인**: [`i18n.ts`](../03-Module-Reference/renderer/i18n.ts)
   - 해당 언어 JSON 파일 존재 확인
   - 번역 키 누락 확인

3. **localStorage 초기화**:
   ```javascript
   localStorage.removeItem('language')
   ```

### 6. 테마가 올바르게 적용되지 않음

#### 문제 증상
- 다크/라이트 모드 전환 시 UI가 변경되지 않음
- 시스템 테마가 감지되지 않음

#### 원인
- DOM 클래스가 적용되지 않음
- Tailwind CSS 설정 문제

#### 해결 방법
1. **DOM 클래스 확인**:
   ```html
   <!-- DevTools Elements 탭에서 -->
   <html class="dark"> 또는 <html class="light">
   ```

2. **Tailwind 설정 확인**: [`tailwind.config.js`](../tailwind.config.js)
   ```javascript
   darkMode: 'class',  // 'media'가 아닌 'class' 사용
   ```

3. **브라우저 �시 초기화**: Hard refresh (Ctrl+Shift+R)

## 개발 환경 트러블슈팅

### 1. dev 명령어 실행 실패

#### 문제 증상
```
npm run dev
# "command not found: npx" 또는 유사한 에러
```

#### 해결 방법
1. **Node.js 설치 확인**:
   ```bash
   node --version  # v18+ 필요
   npm --version
   ```

2. **의존성 설치**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Vite �시 초기화**:
   ```bash
   rm -rf .vite
   npm run dev
   ```

### 2. TypeScript 컴파일 오류

#### 문제 증상
```
npm run build:main
# Type 'X' is not assignable to type 'Y'
```

#### 해결 방법
1. **tsconfig 확인**:
   - [`tsconfig.json`](../tsconfig.json): Renderer용
   - [`tsconfig.main.json`](../tsconfig.main.json): Main/Preload용

2. **경로 별칭 확인**:
   - Renderer: `@/` 별칭 사용
   - Main/Preload: 절대 경로 사용

3. **타입 정의 확인**: [`types/index.ts`](../03-Module-Reference/renderer/types.md)

### 3. 포트 충돌 (Port already in use)

#### 문제 증상
```
Error: Port 3000 is already in use
```

#### 해결 방법
1. **다른 포트 사용**: [`vite.config.ts`](../vite.config.ts)
   ```typescript
   server: {
     port: 3001,  // 다른 포트로 변경
   }
   ```

2. **프로세스 종료**:
   ```bash
   # macOS/Linux
   lsof -ti:3000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

### 4. Python 경로 문제

#### 문제 증상
```
Error: spawn python3 ENOENT
```

#### 해결 방법
1. **Python 설치 확인**:
   ```bash
   which python3
   python3 --version
   ```

2. **경로 하드코딩 금지**: [`converter.ts`](../03-Module-Reference/main-process/python-converter.md)
   - `getPythonPath()` 사용
   - `getPythonScriptPath()` 사용

## 프로덕션 빌드 트러블슈팅

### 1. electron-builder 빌드 실패

#### 문제 증상
```
npm run dist
# "Error: Application entry file not found"
```

#### 해결 방법
1. **빌드 먼저 실행**:
   ```bash
   npm run build
   npm run dist
   ```

2. **electron-builder.yml 확인**:
   - [`electron-builder.yml`](../electron-builder.yml) 설정 확인
   - 파일 경로가 올바른지 확인

3. **아이콘 파일 확인**:
   - `src/resources/icon.icns` (macOS)
   - `src/resources/icon.ico` (Windows)

### 2. 배포 파일이 실행되지 않음

#### 문제 증상
- 설치된 앱이 실행되지 않음
- 바로 종료됨

#### 해결 방법
1. **로그 확인**:
   - Windows: `%APPDATA%\md-to-docx-converter\logs\`
   - macOS: `~/Library/Logs/md-to-docx-converter/`

2. **Python 런타임 포함 확인**:
   - `resources/python/` 폴더 확인
   - `python` / `python.exe` 실행파일 존재 확인

3. **Pandoc 포함 확인**:
   - 시스템에 Pandoc 설치 필요
   - 또는 번들에 포함 필요

## 성능 최적화

### 1. 대용량 파일 처리
- 스트림 처리 고려 (현재는 전체 파일 읽기)
- 청크 단위로 처리

### 2. 배치 변환 최적화
- 병렬 처리 (현재는 순차 처리)
- 워커 스레드 사용

### 3. 미리보기 최적화
- 가상 스크롤 (Virtual Scroll)
- 레이지 로딩

## 보안 고려사항

### 1. 파일 경로 검증
- Main Process에서 파일 경로 검증
- 경로 순회 공격 (Path Traversal) 방지

### 2. IPC 통신 보안
- `contextBridge` 사용
- Node Integration 비활성화 (프로덕션)

### 3. 사용자 입력 검증
- 변환 옵션 범위 검증
- 파일 확장자 검증

## 진단 도구

### 1. 개발자 도구

#### Renderer Process
- **DevTools**: F12 또는 Cmd+Option+I
- **React DevTools**: 크롬 확장 설치
- **콘솔**: 로그 확인

#### Main Process
- **VSCode 디버거**: 개발 모드에서 자동 연결
- **터미널**: `npm run dev` 실행 시 출력 확인

### 2. 로그 분석

#### Renderer 로그
```javascript
// 콘솔에서
console.log(localStorage.getItem('theme'))
console.log(localStorage.getItem('language'))
```

#### Main 로그
```bash
# 터미널에서
npm run dev  # 표준 출력 확인
```

### 3. 네트워크 확인

- **필요 없음**: 오프라인 애플리케이션
- Pandoc가 외부 리소스에 접근할 때만 확인

## FAQ

### Q: 변환 중 앱이 멈춥니다.
A: 대용량 파일인 경우 Pandoc 처리 시간이 걸릴 수 있습니다. 진행률 표시를 확인하고 오래 걸리는 경우 배치 변환으로 나누어 처리하세요.

### Q: 일부 텍스트가 변환되지 않습니다.
A: 특수 문자나 수학 수식은 Pandoc 필터가 필요할 수 있습니다. [`convert.py`](../03-Module-Reference/python/convert.py.md)의 필터 설정을 확인하세요.

### Q: 다국어가 제대로 표시되지 않습니다.
A: 브라우저 �시를 초기화하고 언어 설정이 `localStorage`에 저장되었는지 확인하세요.

### Q: Windows에서 파일 다이얼로그가 열리지 않습니다.
A: 샌드박스 설정이 올바른지 확인하세요. `sandbox: false`가 필요합니다.

## 관련 문서
- [관찰가능성](../08-Observability.md) - 로깅 및 디버깅
- [아키텍처](../02-Architecture.md) - 시스템 구조
- [빌드/배포](../07-Build-Deploy.md) - 빌드 환경

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 1.0 | 트러블슈팅 문서 초기 작성 |