# Python Convert Script

## Summary
- **Responsibility**: Markdown → DOCX conversion via Pandoc, multiple files merge logic
- **Main Users/Callers**: Main Process (via `python-converter.ts`)
- **Key Entry Points**: `main()`, `PandocConverter.convert()`, `merge_files()`

## Location in Architecture
- **Layer**: Python Integration Layer
- **Upstream Dependencies**: Main Process (`python-converter.ts`)
- **Downstream Dependencies**: Pandoc (external CLI tool)
- **Role in Runtime Flow**: Perform actual document conversion

## Public Interface

### main()
Entry point function that processes command-line arguments to execute conversion

**Signature**:
```python
def main() -> None
```

**Input**: Command-line arguments (`argparse`)

**Output**: JSON result (stdout), exit code (0 or 1)

**Errors/Exceptions**: `sys.exit(1)` on conversion failure

**Side Effects**:
- `print(json.dumps(result))` - Output JSON result to stdout

**Command-line Arguments**:
```bash
--merge                          # Merge mode
--input <path>                   # Input files (multiple allowed)
--output <path>                  # Output file
--font-size <number>              # Font size (pt)
--font-family <string>            # Font family
--line-height <number>            # Line height
--margin-top <number>             # Top margin (cm)
--margin-bottom <number>          # Bottom margin (cm)
--margin-left <number>            # Left margin (cm)
--margin-right <number>           # Right margin (cm)
--orientation <portrait|landscape>  # Page orientation
--generate-toc                   # Generate table of contents
--reference-style <apa|mla|...>  # Bibliography style
--image-handling <embed|link>     # Image handling
--code-block-style <fenced|indented>  # Code block style
```

**Examples**:
```bash
# Single file conversion
python convert.py --input input.md --output output.docx \
  --font-size 12 --font-family Arial

# Multiple files merge
python convert.py --merge \
  --input file1.md --input file2.md \
  --output merged.docx
```

---

### PandocConverter.convert()
Convert single Markdown file to DOCX

**Signature**:
```python
def convert(
    self,
    input_path: str,
    output_path: str,
    options: Dict[str, Any]
) -> Dict[str, Any]
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `input_path` | `str` | Input Markdown file path |
| `output_path` | `str` | Output DOCX file path |
| `options` | `Dict[str, Any]` | Conversion options |

**options Structure**:
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

**Output**:
```python
{
  'success': True/False,
  'message': 'Conversion completed successfully' / 'Error message',
  'output_path': 'path/to/output.docx',
  'input_path': 'path/to/input.md'
}
```

**Errors/Exceptions**:
- File not found: `{'success': False, 'error': 'Input file not found: ...'}`
- Conversion failure: `{'success': False, 'error': 'Pandoc failed: ...'}`
- Timeout: `{'success': False, 'error': 'Conversion timed out after 60 seconds'}`

**Side Effects**:
- Auto-create output directory if missing
- Execute Pandoc CLI command

**Example**:
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
Merge multiple Markdown files into single DOCX

**Signature**:
```python
def merge_files(
    input_files: List[str],
    output_path: str,
    options: Dict[str, Any]
) -> Dict[str, Any]
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `input_files` | `List[str]` | Input Markdown file path array |
| `output_path` | `str` | Output DOCX file path |
| `options` | `Dict[str, Any]` | Conversion options |

**Output**:
```python
{
  'success': True/False,
  'message': 'Merge error: ...' / 'Success',
  'error': 'Error message (if failed)'
}
```

**Errors/Exceptions**:
- File not found: `{'success': False, 'error': 'Input file not found: ...'}`
- Merge error: `{'success': False, 'error': 'Merge error: ...'}`

**Side Effects**:
- Create temporary Markdown for merging
- Delete temporary file after conversion
- Insert `\newpage` separator between files

**Example**:
```python
result = merge_files(
  ['file1.md', 'file2.md', 'file3.md'],
  'merged.docx',
  {'fontSize': 12}
)
```

---

### _build_pandoc_command()
Private method to build Pandoc CLI command

**Signature**:
```python
def _build_pandoc_command(
    self,
    input_path: str,
    output_path: str,
    options: Dict[str, Any]
) -> List[str]
```

**Input**: Same as `convert()`

**Output**: Pandoc CLI command argument array

**Example Output**:
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
Return bundled Pandoc executable file path

**Signature**:
```python
def _get_pandoc_path(self) -> str
```

**Output**:
- **Development**: `'pandoc'` (system PATH)
- **Production**: Bundled path
  - Windows: `os.path.join(os.path.dirname(sys.executable), 'bin', 'pandoc.exe')`
  - macOS/Linux: `os.path.join(os.path.dirname(sys.executable), 'bin', 'pandoc')`

## Internal Behavior

### Main Flows

#### 1. Single File Conversion Flow (convert)

```
1. Verify input file exists
   ↓
2. Create output directory if missing
   ↓
3. Build Pandoc command (_build_pandoc_command)
   ↓
4. Execute Pandoc with subprocess.run() (timeout 60 seconds)
   ↓
5. Check returncode
   - 0: success → {'success': True, 'message': 'Conversion completed successfully'}
   - !0: failure → {'success': False, 'error': 'Pandoc failed: stderr'}
   ↓
6. Return JSON result
```

#### 2. File Merge Flow (merge_files)

```
1. Verify all input files exist
   ↓
2. Create output directory if missing
   ↓
3. Loop through each file and merge
   for i, input_path in enumerate(input_files):
      a. Read file (UTF-8)
      b. Add filename header if not first file
         f"\n\n---\n\n# {filename}\n\n"
      c. Add file content
      d. Add \newpage separator if not last file
         "\n\n\\newpage\n\n"
   ↓
4. Create temporary Markdown file (tempfile.NamedTemporaryFile)
   ↓
5. Convert with PandocConverter.convert()
   ↓
6. Delete temporary file (os.unlink)
   ↓
7. Return JSON result
```

### Key Rules/Algorithms

#### 1. Pandoc Default Options

**Implementation**: [`convert.py:112-152`](../../../src/python/convert.py:112-152)

```python
# Default font settings (Georgia, 14pt)
cmd.extend(['--variable', 'fontfamily=Georgia'])
cmd.extend(['--variable', 'fontsize=14pt'])

# Default line spacing (1.5)
cmd.extend(['--variable', 'line-spacing=1.5'])

# Default page orientation (portrait)
if options.get('orientation', 'portrait') == 'landscape':
  cmd.extend(['--variable', 'class=landscape'])

# Default margins (cm units)
cmd.extend(['--variable', 'margin-top=2.54cm'])
cmd.extend(['--variable', 'margin-bottom=2.54cm'])
cmd.extend(['--variable', 'margin-left=3.18cm'])
cmd.extend(['--variable', 'margin-right=3.18cm'])

# Table of contents generation (default enabled)
cmd.append('--toc')
cmd.extend(['--toc-depth', '3'])

# Code block highlighting
cmd.extend(['--highlight-style', 'pygments'])

# Document properties
cmd.extend(['--variable', 'documentclass=article'])
cmd.extend(['--variable', 'papersize=A4'])
```

#### 2. Bibliography Reference Style (Currently Disabled)

**Implementation**: [`convert.py:139-144`](../../../src/python/convert.py:139-144)

```python
# Bibliography style (chicago-reference.docx currently disabled)
# reference_style = options.get('referenceStyle', 'chicago')
# if reference_style and (self.script_dir / 'filters' / 'chicago-reference.docx').exists():
#     reference_doc_path = self.script_dir / 'filters' / 'chicago-reference.docx'
#     cmd.extend(['--citeproc', f'--reference-doc={reference_doc_path}'])
```

### Edge Cases

| Situation | Handling Method |
|-----------|-----------------|
| No input files | `{'success': False, 'error': 'At least one input file required'}` |
| File encoding errors | Force UTF-8, return error |
| Pandoc timeout | 60 seconds then `{'success': False, 'error': 'Conversion timed out after 60 seconds'}` |
| Output directory missing | Auto-create with `os.makedirs(output_dir, exist_ok=True)` |
| File missing during merge | `{'success': False, 'error': 'Input file not found: ...'}` |

## Data/Models

### JSON Result Format

**Success**:
```json
{
  "success": true,
  "message": "Conversion completed successfully",
  "output_path": "/path/to/output.docx",
  "input_path": "/path/to/input.md"
}
```

**Failure**:
```json
{
  "success": false,
  "error": "Pandoc failed: pandoc: ... error message ...",
  "return_code": 1
}
```

## Configuration/Environment Variables
None (passed as command-line arguments)

## Dependencies

### Internal Modules
None (single file script)

### External Libraries/Services

| Library | Purpose | Version |
|----------|---------|---------|
| `argparse` | Command-line argument parsing | Python standard |
| `sys` | System interaction (exit, frozen detection) | Python standard |
| `os` | OS interaction (path, join) | Python standard |
| `json` | JSON serialization | Python standard |
| `subprocess` | Pandoc execution | Python standard |
| `tempfile` | Temporary file creation | Python standard |
| `pathlib` | Path manipulation | Python 3.4+ |

### Pandoc Dependencies
- **Development Environment**: `pandoc` installed in system PATH
- **Production Environment**: Bundled `pandoc` executable

## Testing
- **Related Tests**: None (currently)
- **Coverage/Gaps**: Pandoc conversion logic testing needed

## Operations/Observability

### Logging
```python
# Python script outputs JSON result to stdout
print(json.dumps(result))

# Errors go to stderr
# (Pandoc stderr automatically redirected to stderr)
```

**Log Levels**: N/A (only JSON result to stdout)

### Metrics/Tracing
None

### Alert Points
- Pandoc timeout (60 seconds)
- Pandoc exit code != 0

## Related Documents

- [Python Converter (TypeScript)](../main-process/python-converter.md) - Caller
- [Data Models](../../05-Data-Models.md) - ConversionOptions type

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.0 | Initial documentation created |