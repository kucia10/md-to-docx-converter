# Python Convert Script

## 요약
- **책임**: Pandoc을 통한 Markdown → DOCX 변환, 다중 파일 병합 로직
- **주요 사용자/호출자**: Main Process (via `python-converter.ts`)
- **핵심 엔트리포인트**: `main()`, `PandocConverter.convert()`, `merge_files()`

## 아키텍처 내 위치
- **레이어**: Python Integration Layer
- **상위 의존**: Main Process (`python-converter.ts`)
- **하위 의존**: Pandoc (외부 CLI 도구)
- **런타임 플로우에서의 역할**: 실제 문서 변환 수행

## 퍼블릭 인터페이스

### main()
명령줄 인자를 처리하여 변환을 실행하는 진입점 함수

**시그니처**:
```python
def main() -> None
```

**입력**: 명령줄 인자 (`argparse`)

**출력**: JSON 결과 (stdout), 종료 코드 (0 또는 1)

**에러/예외**: 변환 실패 시 `sys.exit(1)`

**부작용**:
- `print(json.dumps(result))` - JSON 결과를 stdout에 출력

**명령줄 인자**:
```bash
--merge                          # 병합 모드
--input <path>                   # 입력 파일 (복수 가능)
--output <path>                  # 출력 파일
--font-size <number>              # 폰트 크기 (pt)
--font-family <string>            # 폰트 패밀리
--line-height <number>            # 줄 간격
--margin-top <number>             # 상단 여백 (cm)
--margin-bottom <number>          # 하단 여백 (cm)
--margin-left <number>            # 좌측 여백 (cm)
--margin-right <number>           # 우측 여백 (cm)
--orientation <portrait|landscape>  # 페이지 방향
--generate-toc                   # 목차 생성
--reference-style <apa|mla|...>  # 참고문헌 스타일
--image-handling <embed|link>     # 이미지 처리
--code-block-style <fenced|indented>  # 코드 블록 스타일
```

**예시**:
```bash
# 단일 파일 변환
python convert.py --input input.md --output output.docx \
  --font-size 12 --font-family Arial

# 다중 파일 병합
python convert.py --merge \
  --input file1.md --input file2.md \
  --output merged.docx
```

---

### PandocConverter.convert()
단일 Markdown 파일을 DOCX로 변환

**시그니처**:
```python
def convert(
    self,
    input_path: str,
    output_path: str,
    options: Dict[str, Any]
) -> Dict[str, Any]
```

**입력**:
| 파라미터 | 타입 | 설명 |
|-----------|------|------|
| `input_path` | `str` | 입력 Markdown 파일 경로 |
| `output_path` | `str` | 출력 DOCX 파일 경로 |
| `options` | `Dict[str, Any]` | 변환 옵션 |

**options 구조**:
```python
{
  'fontSize': 12,              # int
  'fontFamily': 'Arial',       # str
  'lineHeight': 1.5,          # float
  'marginTop': 2.54,          # float (cm)
  'marginBottom': 2.54,       # float (cm)
  'marginLeft': 3.18,         # float (cm)
  'marginRight': 3.18,        # float (cm)
  'orientation': 'portrait',   # 'portrait' | 'landscape'
  'generateToc': True,        # bool
  'referenceStyle': 'apa',     # 'apa' | 'mla' | 'chicago' | 'harvard'
  'imageHandling': 'embed',    # 'embed' | 'link'
  'codeBlockStyle': 'fenced'   # 'fenced' | 'indented'
}
```

**출력**:
```python
{
  'success': True/False,
  'message': 'Conversion completed successfully' / 'Error message',
  'output_path': 'path/to/output.docx',
  'input_path': 'path/to/input.md'
}
```

**에러/예외**:
- 파일 존재하지 않음: `{'success': False, 'error': 'Input file not found: ...'}`
- 변환 실패: `{'success': False, 'error': 'Pandoc failed: ...'}`
- 타임아웃: `{'success': False, 'error': 'Conversion timed out after 60 seconds'}`

**부작용**:
- 출력 디렉터리 없으면 자동 생성
- Pandoc CLI 명령 실행

**예시**:
```python
converter = PandocConverter()
result = converter.convert(
  'input.md',
  'output.docx',
  {
    'fontSize': 12,
    'fontFamily': 'Arial',
    'marginTop': 2.54
  }
)
```

---

### merge_files()
다중 Markdown 파일을 단일 DOCX로 병합

**시그니처**:
```python
def merge_files(
    input_files: List[str],
    output_path: str,
    options: Dict[str, Any]
) -> Dict[str, Any]
```

**입력**:
| 파라미터 | 타입 | 설명 |
|-----------|------|------|
| `input_files` | `List[str]` | 입력 Markdown 파일 경로 배열 |
| `output_path` | `str` | 출력 DOCX 파일 경로 |
| `options` | `Dict[str, Any]` | 변환 옵션 |

**출력**:
```python
{
  'success': True/False,
  'message': 'Merge error: ...' / 'Success',
  'error': 'Error message (if failed)'
}
```

**에러/예외**:
- 파일 존재하지 않음: `{'success': False, 'error': 'Input file not found: ...'}`
- 병합 오류: `{'success': False, 'error': 'Merge error: ...'}`

**부작용**:
- 파일 병합용 임시 Markdown 생성
- 변환 후 임시 파일 삭제
- 파일 사이에 `\newpage` 구분자 삽입

**예시**:
```python
result = merge_files(
  ['file1.md', 'file2.md', 'file3.md'],
  'merged.docx',
  {'fontSize': 12}
)
```

---

### _build_pandoc_command()
Pandoc CLI 명령을 빌드하는 비공개 메서드

**시그니처**:
```python
def _build_pandoc_command(
    self,
    input_path: str,
    output_path: str,
    options: Dict[str, Any]
) -> List[str]
```

**입력**: `convert()`와 동일

**출력**: Pandoc CLI 명령 인자 배열

**예시 출력**:
```python
[
  'pandoc',
  'input.md',
  '-o',
  'output.docx',
  '--from=markdown',
  '--to=docx',
  '--standalone',
  '--variable', 'fontfamily=Georgia',
  '--variable', 'fontsize=14pt',
  '--variable', 'line-spacing=1.5',
  '--variable', 'margin-top=2.54cm',
  '--variable', 'margin-bottom=2.54cm',
  '--variable', 'margin-left=3.18cm',
  '--variable', 'margin-right=3.18cm',
  '--toc',
  '--toc-depth', '3',
  '--highlight-style', 'pygments',
  '--variable', 'documentclass=article',
  '--variable', 'papersize=A4'
]
```

---

### _get_pandoc_path()
번들링된 Pandoc 실행 파일 경로를 반환

**시그니처**:
```python
def _get_pandoc_path(self) -> str
```

**출력**:
- **개발**: `'pandoc'` (시스템 PATH)
- **프로덕션**: 번들링된 경로
  - Windows: `os.path.join(os.path.dirname(sys.executable), 'bin', 'pandoc.exe')`
  - macOS/Linux: `os.path.join(os.path.dirname(sys.executable), 'bin', 'pandoc')`

## 내부 동작

### 주요 플로우

#### 1. 단일 파일 변환 플로우 (convert)

```
1. 입력 파일 존재 검증
   ↓
2. 출력 디렉터리 없으면 생성
   ↓
3. Pandoc 명령 빌드 (_build_pandoc_command)
   ↓
4. subprocess.run()으로 Pandoc 실행 (타임아웃 60초)
   ↓
5. returncode 확인
   - 0: 성공 → {'success': True, 'message': 'Conversion completed successfully'}
   - !0: 실패 → {'success': False, 'error': 'Pandoc failed: stderr'}
   ↓
6. 결과 JSON 반환
```

#### 2. 파일 병합 플로우 (merge_files)

```
1. 모든 입력 파일 존재 검증
   ↓
2. 출력 디렉터리 없으면 생성
   ↓
3. 각 파일 순회하며 병합
   for i, input_path in enumerate(input_files):
     a. 파일 읽기 (UTF-8)
     b. 첫 파일이 아니면 파일명 헤더 추가
        f"\n\n---\n\n# {filename}\n\n"
     c. 파일 내용 추가
     d. 마지막 파일이 아니면 \newpage 구분자 추가
        "\n\n\\newpage\n\n"
   ↓
4. 임시 Markdown 파일 생성 (tempfile.NamedTemporaryFile)
   ↓
5. PandocConverter.convert()로 변환
   ↓
6. 임시 파일 삭제 (os.unlink)
   ↓
7. 결과 JSON 반환
```

### 핵심 규칙/알고리즘

#### 1. Pandoc 기본 옵션

**구현**: [`convert.py:112-152`](../../../src/python/convert.py:112-152)

```python
# 기본 폰트 설정 (Georgia, 14pt)
cmd.extend(['--variable', 'fontfamily=Georgia'])
cmd.extend(['--variable', 'fontsize=14pt'])

# 기본 줄 간격 (1.5)
cmd.extend(['--variable', 'line-spacing=1.5'])

# 기본 페이지 방향 (portrait)
if options.get('orientation', 'portrait') == 'landscape':
  cmd.extend(['--variable', 'class=landscape'])

# 기본 여백 (cm 단위)
cmd.extend(['--variable', 'margin-top=2.54cm'])
cmd.extend(['--variable', 'margin-bottom=2.54cm'])
cmd.extend(['--variable', 'margin-left=3.18cm'])
cmd.extend(['--variable', 'margin-right=3.18cm'])

# 목차 생성 (기본 활성화)
cmd.append('--toc')
cmd.extend(['--toc-depth', '3'])

# 코드 블록 하이라이트
cmd.extend(['--highlight-style', 'pygments'])

# 문서 속성
cmd.extend(['--variable', 'documentclass=article'])
cmd.extend(['--variable', 'papersize=A4'])
```

#### 2. 참고문헌 스타일 (현재 비활성화)

**구현**: [`convert.py:139-144`](../../../src/python/convert.py:139-144)

```python
# 참고문헌 스타일 (chicago-reference.docx 없어서 비활성화)
# reference_style = options.get('referenceStyle', 'chicago')
# if reference_style and (self.script_dir / 'filters' / 'chicago-reference.docx').exists():
#     reference_doc_path = self.script_dir / 'filters' / 'chicago-reference.docx'
#     cmd.extend(['--citeproc', f'--reference-doc={reference_doc_path}'])
```

### 엣지케이스

| 상황 | 처리 방법 |
|------|----------|
| 입력 파일 없음 | `{'success': False, 'error': 'At least one input file required'}` |
| 파일 인코딩 오류 | UTF-8 강제 사용, 오류 반환 |
| Pandoc 타임아웃 | 60초 후 `{'success': False, 'error': 'Conversion timed out after 60 seconds'}` |
| 출력 디렉터리 없음 | `os.makedirs(output_dir, exist_ok=True)`로 자동 생성 |
| 병합 시 파일 없음 | `{'success': False, 'error': 'Input file not found: ...'}` |

## 데이터/모델

### JSON 결과 포맷

**성공**:
```json
{
  "success": true,
  "message": "Conversion completed successfully",
  "output_path": "/path/to/output.docx",
  "input_path": "/path/to/input.md"
}
```

**실패**:
```json
{
  "success": false,
  "error": "Pandoc failed: pandoc: ... error message ...",
  "return_code": 1
}
```

## 설정/환경변수
없음 (명령줄 인자로 전달됨)

## 의존성

### 내부 모듈
없음 (단일 파일 스크립트)

### 외부 라이브러리/서비스

| 라이브러리 | 목적 | 버전 |
|-----------|------|------|
| `argparse` | 명령줄 인자 파싱 | Python 표준 라이브러리 |
| `sys` | 시스템 상호작용 (exit, frozen 감지) | Python 표준 라이브러리 |
| `os` | OS 상호작용 (path, join) | Python 표준 라이브러리 |
| `json` | JSON 직렬화 | Python 표준 라이브러리 |
| `subprocess` | Pandoc 실행 | Python 표준 라이브러리 |
| `tempfile` | 임시 파일 생성 | Python 표준 라이브러리 |
| `pathlib` | 경로 조작 | Python 3.4+ |

### Pandoc 의존성
- **개발 환경**: 시스템 PATH에 `pandoc` 설치 필요
- **프로덕션 환경**: 번들링된 `pandoc` 사용

## 테스트
- **관련 테스트**: 없음 (현재)
- **커버리지/갭**: Pandoc 변환 로직 테스트 필요

## 운영/관찰가능성

### 로그
```python
# Python 스크립트는 stdout에 JSON 결과 출력
print(json.dumps(result))

# stderr에 오류 출력
# (Pandoc stderr가 자동으로 stderr로 리디렉션됨)
```

**로그 수준**: N/A (JSON 결과만 stdout에 출력)

### 메트릭/트레이싱
없음

### 알람 포인트
- Pandoc 타임아웃 (60초)
- Pandoc 종료 코드 != 0

## 관련 문서

- [Python Converter (TypeScript)](../main-process/python-converter.md) - 호출자
- [데이터 모델](../../05-Data-Models.md) - ConversionOptions 타입

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2025-12-29 | 1.0 | 초기 문서 작성 |