# Python Converter

## Summary
- **Responsibility**: Python process execution and management, Markdown → DOCX conversion via Pandoc
- **Main Users/Callers**: IPC Handlers, Python Script (`convert.py`)
- **Key Entry Point**: `PythonConverter` class (`convertMarkdownToDocx()`, `mergeFilesToDocx()`)

## Location in Architecture
- **Layer**: Main Process / Python Integration Layer
- **Upstream Dependencies**: IPC Handlers
- **Downstream Dependencies**: Python Script (`convert.py`), Pandoc (external)
- **Role in Runtime Flow**: Main → Python IPC request → Pandoc execution → Return result

## Public Interface

### PythonConverter Class
Main class for Python conversion operations

#### Constructor
**Signature**:
```typescript
constructor()
```

**Input**: None

**Output**: None

**Initialization Logic**:
```typescript
this.isDev = process.env.NODE_ENV === 'development'
```

#### convertMarkdownToDocx
Convert single Markdown file to DOCX

**Signature**:
```typescript
async convertMarkdownToDocx(
  inputPath: string,
  outputPath: string,
  options: ConversionOptions = {}
): Promise<{ success: boolean; message: string }>
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `inputPath` | `string` | Input Markdown file path |
| `outputPath` | `string` | Output DOCX file path |
| `options` | `ConversionOptions` | Conversion options (font, margins, etc.) |

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

**Output**:
```typescript
{
  success: boolean,    // Conversion success status
  message: string      // Result message
}
```

**Errors/Exceptions**: 
- Throw `Error` on conversion failure
- Throw `Error` on Python process error

**Side Effects**:
- Python process `spawn()` and execution
- Capture stdout/stderr
- Clean up process after conversion complete

**Example**:
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
Merge multiple Markdown files into single DOCX

**Signature**:
```typescript
async mergeFilesToDocx(
  inputFiles: string[],
  outputPath: string,
  options: ConversionOptions = {}
): Promise<{ success: boolean; message: string }>
```

**Input**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `inputFiles` | `string[]` | Input Markdown file path array |
| `outputPath` | `string` | Output DOCX file path |
| `options` | `ConversionOptions` | Conversion options |

**Output**:
```typescript
{
  success: boolean,
  message: string
}
```

**Errors/Exceptions**: Throw `Error` on conversion failure

**Side Effects**:
- Run Python process with `--merge` mode
- Merge files then create single DOCX

**Example**:
```typescript
const converter = new PythonConverter()
const result = await converter.mergeFilesToDocx(
  ['/path/to/file1.md', '/path/to/file2.md'],
  '/path/to/merged.docx',
  { fontSize: 12 }
)
```

#### cancelConversion
Cancel ongoing conversion

**Signature**:
```typescript
cancelConversion(): void
```

**Input**: None

**Output**: None

**Errors/Exceptions**: None

**Side Effects**:
- Call Python process `kill()`
- Set `pythonProcess` reference to `null`

**Example**:
```typescript
converter.cancelConversion()
```

#### cleanup
Resource cleanup (called on app quit)

**Signature**:
```typescript
cleanup(): void
```

**Input**: None

**Output**: None

**Errors/Exceptions**: None

**Side Effects**: Call `cancelConversion()`

## Internal Behavior

### Main Flows

#### 1. Conversion Flow (convertMarkdownToDocx)

```
1. Verify Python path and script path
   ↓
2. Build Pandoc command-line arguments
   ↓
3. Python process spawn()
   ↓
4. Register stdout/stderr event listeners
   ↓
5. Wait for process completion (on 'close')
   ↓
6. Check exit code
   - code === 0: success
   - code !== 0: failure → reject
   ↓
7. Set process reference to null
```

#### 2. Pandoc Command Construction

```typescript
const args = [
  scriptPath,              // convert.py
  '--input', inputPath,    // input file
  '--output', outputPath,   // output file
  // options
  '--font-size', '12',
  '--font-family', 'Arial',
  '--margin-top', '2.54',
  ...
]

const pythonPath = this.getPythonPath()  // 'python3' or 'python'
```

### Key Rules/Algorithms

#### 1. Development/Production Python Path Switching

**Implementation**: [`getPythonPath()`](../../../../src/main/python/converter.ts:101-108)

```typescript
private getPythonPath(): string {
  if (process.platform === 'win32') {
    return 'python';
  }
  return 'python3';
}
```

#### 2. Python Script Path Switching

**Implementation**: [`getPythonScriptPath()`](../../../../src/main/python/converter.ts:110-118)

```typescript
private getPythonScriptPath(): string {
  if (this.isDev) {
    // Development: src/python/convert.py in project root
    return path.join(process.cwd(), 'src/python/convert.py');
  } else {
    // Production: bundled script from extraResources
    return path.join((process as any).resourcesPath, 'python', 'convert.py');
  }
}
```

#### 3. Pandoc Path PATH Addition (macOS)

**Implementation**: [`converter.ts:51-66`](../../../../src/main/python/converter.ts:51-66)

```typescript
const additionalPaths = [
  '/usr/local/bin',           // Homebrew (Intel Mac)
  '/opt/homebrew/bin',        // Homebrew (Apple Silicon)
  '/usr/bin',                 // System
  '/opt/local/bin',           // MacPorts
]
const enhancedPath = [...additionalPaths, process.env.PATH].join(':')
```

**Reason**: Add common installation paths for Pandoc detection in macOS GUI apps

### Edge Cases

| Situation | Handling Method |
|-----------|-----------------|
| Python process start failure | `on('error')` event → Error throw |
| Conversion timeout | Python script handles 60 second timeout |
| Pandoc not found | Error in subprocess → stderr capture → Error throw |
| Input file doesn't exist | Validation in Python script → Return error |
| Cancellation during conversion | `cancelConversion()` → process kill() |

## Data/Models

### ConversionOptions
[See details in Data Models](../../05-Data-Models.md#conversionoptions)

## Configuration/Environment Variables

| Key | Meaning / Default Value / Impact Range |
|-----|-------------------------------------|
| `NODE_ENV` | `development` or `production` - Determines Python path |
| `PATH` | System PATH - Additional paths for Pandoc discovery |
| `PYTHONIOENCODING` | `utf-8` - Python stdout encoding |

## Dependencies

### Internal Modules
None (pure Main Process module)

### External Libraries/Services
- `child_process` - Node.js process execution (`spawn`)

### Python Dependencies

**Development Environment**:
- `python3` - System installation
- `pypandoc` - Python Pandoc wrapper

**Production Environment**:
- bundled `python[.exe]` (`resources/python/`)
- bundled `pypandoc`

## Testing
- **Related Tests**: None (currently)
- **Coverage/Gaps**: Python process spawning, Pandoc call testing needed

## Operations/Observability

### Logging
```typescript
console.log('[Converter] Python process closed with code:', code)
console.log('[Converter] stdout:', stdout)
console.log('[Converter] stderr:', stderr)
```

**Log Levels**: Info (process state), Error (conversion failure)

### Metrics/Tracing
None

### Alert Points
- Python process start failure
- Conversion timeout (60 seconds)
- Pandoc error (stderr output)

## Related Documents

- [Python Script](../../python/convert.py.md) - `convert.py` details
- [IPC Handlers](../ipc/handlers.md) - Caller
- [Data Models](../../05-Data-Models.md) - ConversionOptions type

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.0 | Initial documentation created |