# Python Converter

## 요약
- **책임**: Python 프로세스 실행 및 관리, Pandoc을 통한 Markdown → DOCX 변환
- **주요 사용자/호출자**: IPC Handlers, Python Script (`convert.py`)
- **핵심 엔트리포인트**: `PythonConverter` 클래스 (`convertMarkdownToDocx()`, `mergeFilesToDocx()`)

## 아키텍처 내 위치
- **레이어**: Main Process / Python Integration Layer
- **상위 의존**: IPC Handlers
- **하위 의존**: Python Script (`convert.py`), Pandoc (외부)
- **런타임 플로우에서의 역할**: Main → Python IPC 요청 → Pandoc 실행 → 결과 반환

## 퍼블릭 인터페이스

### PythonConverter 클래스
Python 변환 작업을 위한 메인 클래스

#### 생성자
**시그니처**:
```typescript
constructor()
```

**입력**: 없음

**출력**: 없음

**초기화 로직**:
```typescript
this.isDev = process.env.NODE_ENV === 'development'
```

#### convertMarkdownToDocx
단일 Markdown 파일을 DOCX로 변환

**시그니처**:
```typescript
async convertMarkdownToDocx(
  inputPath: string,
  outputPath: string,
  options: ConversionOptions = {}
): Promise<{ success: boolean; message: string }>
```

**입력**:
| 파라미터 | 타입 | 설명 |
|-----------|------|------|
| `inputPath` | `string` | 입력 Markdown 파일 경로 |
| `outputPath` | `string` | 출력 DOCX 파일 경로 |
| `options` | `ConversionOptions` | 변환 옵션 (폰트, 여백 등) |

**ConversionOptions**:
```typescript
interface ConversionOptions {
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  orientation?: 'portrait' | 'landscape'
  generateToc?: boolean
}
```

**출력**:
```typescript
{
  success: boolean,    // 변환 성공 여부
  message: string      // 결과 메시지
}
```

**에러/예외**: 
- 변환 실패 시 `Error` throw
- Python 프로세스 오류 시 `Error` throw

**부작용**:
- Python 프로세스 `spawn()` 및 실행
- stdout/stderr 캡처
- 변환 완료 후 프로세스 정리

**예시**:
```typescript
const converter = new PythonConverter()
const result = await converter.convertMarkdownToDocx(
  '/path/to/input.md',
  '/path/to/output.docx',
  {
    fontSize: 12,
    fontFamily: 'Arial',
    marginTop: 2.54,
    orientation: 'portrait'
  }
)
console.log(result.message)  // "Conversion completed successfully"
```

#### mergeFilesToDocx
다중 Markdown 파일을 단일 DOCX로 병합

**시그니처**:
```typescript
async mergeFilesToDocx(
  inputFiles: string[],
  outputPath: string,
  options: ConversionOptions = {}
): Promise<{ success: boolean; message: string }>
```

**입력**:
| 파라미터 | 타입 | 설명 |
|-----------|------|------|
| `inputFiles` | `string[]` | 입력 Markdown 파일 경로 배열 |
| `outputPath` | `string` | 출력 DOCX 파일 경로 |
| `options` | `ConversionOptions` | 변환 옵션 |

**출력**:
```typescript
{
  success: boolean,
  message: string
}
```

**에러/예외**: 변환 실패 시 `Error` throw

**부작용**:
- Python 프로세스 `--merge` 모드로 실행
- 파일 병합 후 단일 DOCX 생성

**예시**:
```typescript
const converter = new PythonConverter()
const result = await converter.mergeFilesToDocx(
  ['/path/to/file1.md', '/path/to/file2.md'],
  '/path/to/merged.docx',
  { fontSize: 12 }
)
```

#### cancelConversion
진행 중인 변환 취소

**시그니처**:
```typescript
cancelConversion(): void
```

**입력**: 없음

**출력**: 없음

**에러/예외**: 없음

**부작용**:
- Python 프로세스 `kill()` 호출
- `pythonProcess` 참조 `null`로 설정

**예시**:
```typescript
converter.cancelConversion()
```

#### cleanup
리소스 정리 (앱 종료 시 호출)

**시그니처**:
```typescript
cleanup(): void
```

**입력**: 없음

**출력**: 없음

**에러/예외**: 없음

**부작용**: `cancelConversion()` 호출

## 내부 동작

### 주요 플로우

#### 1. 변환 플로우 (convertMarkdownToDocx)

```
1. Python 경로 및 스크립트 경로 확인
   ↓
2. Pandoc 명령줄 인자 빌드
   ↓
3. Python 프로세스 spawn()
   ↓
4. stdout/stderr 이벤트 리스너 등록
   ↓
5. 프로세스 완료 대기 (on 'close')
   ↓
6. 종료 코드 확인
   - code === 0: 성공
   - code !== 0: 실패 → reject
   ↓
7. 프로세스 참조 null로 설정
```

#### 2. Pandoc 명령 구성

```typescript
const args = [
  scriptPath,              // convert.py
  '--input', inputPath,    // 입력 파일
  '--output', outputPath,   // 출력 파일
  // 옵션들
  '--font-size', '12',
  '--font-family', 'Arial',
  '--margin-top', '2.54',
  ...
]

const pythonPath = this.getPythonPath()  // 'python3' or 'python'
```

### 핵심 규칙/알고리즘

#### 1. 개발/프로덕션 Python 경로 전환

**구현**: [`getPythonPath()`](../../../src/main/python/converter.ts:101-108)

```typescript
private getPythonPath(): string {
  if (process.platform === 'win32') {
    return 'python';
  }
  return 'python3';
}
```

#### 2. Python 스크립트 경로 전환

**구현**: [`getPythonScriptPath()`](../../../src/main/python/converter.ts:110-118)

```typescript
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

#### 3. Pandoc 경로 PATH 추가 (macOS)

**구현**: [`converter.ts:51-66`](../../../src/main/python/converter.ts:51-66)

```typescript
const additionalPaths = [
  '/usr/local/bin',           // Homebrew (Intel Mac)
  '/opt/homebrew/bin',        // Homebrew (Apple Silicon)
  '/usr/bin',                 // System
  '/opt/local/bin',           // MacPorts
]
const enhancedPath = [...additionalPaths, process.env.PATH].join(':')
```

**이유**: macOS GUI 앱에서 Pandoc 찾기 위해 일반적인 설치 경로 추가

### 엣지케이스

| 상황 | 처리 방법 |
|------|----------|
| Python 프로세스 시작 실패 | `on('error')` 이벤트 → Error throw |
| 변환 타임아웃 | Python 스크립트에서 60초 타임아웃 처리 |
| Pandoc 찾을 수 없음 | subprocess에서 오류 → stderr 캡처 → Error throw |
| 입력 파일 존재하지 않음 | Python 스크립트에서 검증 → 에러 반환 |
| 변환 중간 취소 | `cancelConversion()` → 프로세스 kill() |

## 데이터/모델

### ConversionOptions
[자세한 내용은 Data Models 참조](../../05-Data-Models.md#conversionoptions)

## 설정/환경변수

| 키 | 의미 / 기본값 / 영향 범위 |
|-----|----------------------------|
| `NODE_ENV` | `development` 또는 `production` - Python 경로 결정 |
| `PATH` | 시스템 PATH - Pandoc 찾기 위한 추가 경로 |
| `PYTHONIOENCODING` | `utf-8` - Python stdout 인코딩 |

## 의존성

### 내부 모듈
없음 (순수 Main Process 모듈)

### 외부 라이브러리/서비스
- `child_process` - Node.js 프로세스 실행 (`spawn`)
- `path` - 경로 조작

### Python 의존성
**개발 환경**:
- `python3` (시스템 설치)
- `pypandoc` (Python Pandoc 래퍼)

**프로덕션 환경**:
- bundled `python[.exe]` (`resources/python/`)
- bundled `pypandoc`

## 테스트
- **관련 테스트**: 없음 (현재)
- **커버리지/갭**: Python 프로세스 스폰, Pandoc 호출 테스트 필요

## 운영/관찰가능성

### 로그
```typescript
console.log('[Converter] Python process closed with code:', code)
console.log('[Converter] stdout:', stdout)
console.log('[Converter] stderr:', stderr)
```

**로그 수준**: Info (프로세스 상태), Error (변환 실패)

### 메트릭/트레이싱
없음

### 알람 포인트
- Python 프로세스 시작 실패
- 변환 타임아웃 (60초)
- Pandoc 오류 (stderr 출력)

## 관련 문서

- [Python Script](../../python/convert.py.md) - `convert.py` 상세
- [IPC Handlers](../ipc/handlers.md) - 호출자
- [데이터 모델](../../05-Data-Models.md) - ConversionOptions 타입

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 1.0 | 초기 문서 작성 |