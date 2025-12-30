# 관찰가능성 (Observability)

## 개요

MD to DOCX Converter의 관찰가능성은 현재 기본적인 콘솔 로깅에 의존합니다. 애플리케이션은 별도의 로깅 시스템이나 메트릭 수집 시스템을 갖추지 않습니다.

## 로그 (Logging)

### Renderer Process 로그

#### 위치
- 브라우저 개발자 도구 → Console 탭
- DevTools 자동 열림: 개발 모드에서만

#### 주요 로그 포인트

| 컴포넌트/훅 | 로그 메시지 | 상황 |
|----------------|----------------|--------|
| `useFileUpload` | `Error reading file: ${file.name}, ${error}` | 파일 읽기 실패 |
| `App` | `Conversion error: ${error}` | 변환 시작 오류 |
| `App` | `Batch conversion error: ${error}` | 배치 변환 오류 |
| `App` | `Merge conversion error: ${error}` | 병합 변환 오류 |
| `App` | `Failed to fetch app version: ${error}` | 앱 버전 가져오기 실패 |
| `ResultDisplay` | `Error opening output folder: ${error}` | 폴더 열기 실패 |

#### 로그 레벨
- `console.log`: 일반 정보 (현재 미사용)
- `console.error`: 오류 상황

### Main Process 로그

#### 위치
- 개발 모드: 터미널 (VSCode 터미널)
- 프로덕션: 로그 파일 (아래 참조)

#### 주요 로그 포인트

| 모듈 | 로그 유형 | 상황 |
|--------|-----------|--------|
| `main.ts` | 앱 초기화, 윈도우 생성, 이벤트 핸들링 | 앱 시작/종료 |
| `handlers.ts` | IPC 채널 핸들링, 변환 요청/응답 | IPC 통신 |
| `converter.ts` | Python 프로세스 spawn/실행, stdout/stderr 파싱 | 변환 실행 |

### 로그 파일 위치 (프로덕션)

| 운영체제 | 경로 | 참고 |
|----------|------|------|
| Windows | `%APPDATA%\md-to-docx-converter\logs\` | - |
| macOS | `~/Library/Logs/md-to-docx-converter/` | - |
| Linux | `~/.local/share/md-to-docx-converter/logs/` | - |

> **주의**: 현재 프로젝트에는 로그 파일 생성 로직이 구현되지 않음. 프로덕션에서는 터미널 로그만 사용 가능.

## 메트릭 (Metrics)

### 현재 상태
- **메트릭 수집 시스템**: 없음
- **성능 모니터링**: 없음
- **사용량 추적**: 없음

### 추적 가능한 메트릭 (개선 가능)

| 메트릭 | 설명 | 추적 위치 (가능) |
|---------|--------|------------------|
| 변환 시간 | 단일/배치/병합 변환 소요 시간 | Main Process |
| 파일 크기 | 변환 전후 파일 크기 비교 | Main Process |
| 변환 성공률 | 성공/실패 비율 | Main Process |
| 사용자 액션 | 파일 업로드, 변환 시작 등 이벤트 | Renderer Process |
| 오류율 | 오류 발생 빈도 | 전체 |

### 진행률 메트릭

UI에서 사용자에게 피드백을 제공하는 진행률:

| 변환 유형 | 메트릭 | 범위 |
|-----------|---------|--------|
| 단일 변환 | `percentage` | 0-100% |
| 배치 변환 | `percentage`, `currentFile/totalFiles` | 0-100% |
| 병합 변환 | `percentage`, `currentFile/totalFiles` | 0-100% |

## 트레이싱 (Tracing)

### 현재 상태
- **분산 추적 시스템**: 없음
- **요청 추적**: 없음

### 추적 가능한 플로우

#### 단일 파일 변환 플로우
```
[Renderer] startConversion() 
  → [IPC] start-conversion 채널
  → [Main] IPC handler (START_CONVERSION)
  → [Main] PythonConverter.convertMarkdownToDocx()
  → [Main] spawn(python3, convert.py)
  → [Python] PandocConverter.convert()
  → [Python] subprocess.run(pandoc)
  → [Python] stdout(JSON) → Main
  → [Main] IPC event (conversion-complete)
  → [IPC] conversion-complete 채널
  → [Renderer] onConversionComplete()
```

### 추적 개선 가능성

| 기능 | 현재 상태 | 개선 방안 |
|--------|-----------|-----------|
| 요청 ID 추적 | 없음 | 각 변환에 고유 ID 부여 |
| 스팬 추적 | 부분적 | 전체 스팬 표시 (correlation ID) |
| 타이밍 추적 | 없음 | 각 단계별 소요 시간 로깅 |
| 분산 추적 (OpenTelemetry) | 없음 | OpenTelemetry 도입 |

## 알람 (Alerting)

### 현재 상태
- **알람 시스템**: 없음
- **알림 서비스**: 없음

### 사용자에게 표시되는 알람 (UI)

| 상황 | UI 표시 | 타입 |
|--------|----------|------|
| 변환 성공 | 체크 아이콘 + 성공 메시지 | [`ResultDisplay`](../03-Module-Reference/renderer/components/ResultDisplay.md) |
| 변환 실패 | 경고 아이콘 + 에러 메시지 | [`ResultDisplay`](../03-Module-Reference/renderer/components/ResultDisplay.md) |
| 파일 읽기 실패 | 콘솔 에러 로그 | [`useFileUpload`](../03-Module-Reference/renderer/hooks/useFileUpload.md) |
| 진행률 업데이트 | 진행 바 + 퍼센트 | [`ProgressBar`](../03-Module-Reference/renderer/components/ProgressBar.md) |
| 예상 시간 | 남은 시간 (초) | [`ProgressBar`](../03-Module-Reference/renderer/components/ProgressBar.md) |

## 디버깅 (Debugging)

### 개발자 도구

#### Renderer Process
- **DevTools**: 개발 모드에서 자동 열림
- **React DevTools**: 크롬 확장 프로그램 (필요 시 설치)
- **콘솔**: `console.log()`, `console.error()` 출력 확인

#### Main Process
- **VSCode 디버거**: 개발 모드에서 `--inspect=5858`로 연결
- **터미널**: `npm run dev` 실행 시 콘솔 출력 확인

### 디버깅 명령어

```bash
# 메인 + 렌더러 동시 실행
npm run dev

# 메인 프로세스만 실행
npm run dev:main

# 렌더러 개발 서버만 실행
npm run dev:renderer
```

## 개선 필요 사항

### 로깅 개선
- [ ] 구조화된 로그 포맷 도입 (JSON)
- [ ] 로그 레벨 시스템 (debug, info, warn, error)
- [ ] 로그 파일 생성 및 관리 (파일 순환)
- [ ] 사용자 액션 로깅

### 메트릭 개선
- [ ] 변환 시간 측정
- [ ] 파일 크기 추적
- [ ] 성공/실패 통계
- [ ] 성능 모니터링 (메모리, CPU)

### 트레이싱 개선
- [ ] 요청 ID (correlation ID) 도입
- [ ] 전체 플로우 추적
- [ ] 타이밍 측정 (각 단계별)

### 알람 개선
- [ ] 오류 리포팅 (Sentry 등)
- [ ] 진단 정보 자동 수집
- [ ] 알림 서비스 통합

## 관련 문서
- [아키텍처](../02-Architecture.md) - 시스템 구조 및 통신 플로우
- [빌드/배포](../07-Build-Deploy.md) - 개발/프로덕션 환경

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 1.0 | 관찰가능성 문서 초기 작성 |