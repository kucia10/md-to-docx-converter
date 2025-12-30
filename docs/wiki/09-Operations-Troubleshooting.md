# Operations & Troubleshooting

## Overview

MD to DOCX Converter is a desktop application, providing common issues and solutions for operations and troubleshooting.

## Common Issues and Solutions

### 1. Conversion Failed

#### Symptoms
- No response after clicking convert button
- "Conversion error" message displayed
- DOCX file not created

#### Causes
- Pandoc not installed
- Python path is incorrect
- Input file is corrupted
- Issues with conversion options

#### Solutions
1. **Check Pandoc Installation**:
    ```bash
    # macOS
    brew install pandoc
    
    # Windows
    # Download from https://pandoc.org/installing.html
    
    # Linux
    sudo apt-get install pandoc
    ```

2. **Check Pandoc Version**:
    ```bash
    pandoc --version
    # 3.0+ required
    ```

3. **Check Python Installation**:
    ```bash
    python3 --version
    # 3.11+ required
    ```

4. **Check Logs in Development Mode**:
    - Check Python stdout in VSCode terminal
    - Check for JSON parsing errors

#### Log Check
```
[Main] Python stdout: {"success": true, ...}
[Main] Python stderr: [Pandoc error message]
```

### 2. macOS File Access Permission Issues

#### Symptoms
- File selection dialog does not open
- "Permission denied" error occurs
- Cannot read file

#### Causes
- Sandbox configuration issue
- macOS file access permission restrictions

#### Solutions
1. **Check Sandbox Settings** ([`main.ts`](../src/main/main.ts:295)):
    ```typescript
    webPreferences: {
      sandbox: false,  // for macOS file dialogs
      // ...
    }
    ```

2. **System Preferences**:
    - macOS System Preferences → Privacy & Security
    - Check file and folder permissions
    - May need to grant "Full Disk Access" permission

### 3. Preview Not Displayed

#### Symptoms
- Preview is empty after file selection
- Special characters are corrupted
- Images are not loading

#### Causes
- File encoding is not UTF-8
- Image path is incorrect
- Markdown syntax error

#### Solutions
1. **Check File Encoding**:
    - Verify file is saved as UTF-8
    - Convert to UTF-8 if different encoding

2. **Check Image Path**:
    - Use relative paths (relative to project directory)
    - May have issues with absolute paths

3. **Check Markdown Syntax**:
    - Rendering in [`MarkdownPreview`](../03-Module-Reference/renderer/components/MarkdownPreview.md) component
    - Use Markdown syntax supported by `react-markdown`

### 4. Large File Conversion is Slow

#### Symptoms
- Conversion takes long time when file size is large
- UI becomes unresponsive

#### Causes
- Pandoc processing time
- File read/write time
- Large images included

#### Solutions
1. **Display Progress**: Check progress with [`ProgressBar`](../03-Module-Reference/renderer/components/ProgressBar.md)
2. **Use Batch Conversion**: Split into smaller files for conversion
3. **Batch Conversion Instead of Merge**: Individual conversions may be faster

### 5. Language Switch Not Working

#### Symptoms
- UI does not change when clicking language toggle
- Settings are not saved

#### Causes
- `localStorage` access issue
- Missing translation keys

#### Solutions
1. **Check localStorage**:
    ```javascript
    // In browser DevTools console
    console.log(localStorage.getItem('language'))
    ```

2. **Check Language Resources**: [`i18n.ts`](../03-Module-Reference/renderer/i18n.ts)
    - Check if corresponding language JSON file exists
    - Check for missing translation keys

3. **Reset localStorage**:
    ```javascript
    localStorage.removeItem('language')
    ```

### 6. Theme Not Applied Correctly

#### Symptoms
- UI does not change when switching dark/light mode
- System theme not detected

#### Causes
- DOM class not applied
- Tailwind CSS configuration issue

#### Solutions
1. **Check DOM Class**:
    ```html
    <!-- In DevTools Elements tab -->
    <html class="dark"> or <html class="light">
    ```

2. **Check Tailwind Configuration**: [`tailwind.config.js`](../tailwind.config.js)
    ```javascript
    darkMode: 'class',  // Use 'class', not 'media'
    ```

3. **Browser Cache Reset**: Hard refresh (Ctrl+Shift+R)

## Development Environment Troubleshooting

### 1. dev Command Execution Failed

#### Symptoms
```
npm run dev
# "command not found: npx" or similar error
```

#### Solutions
1. **Check Node.js Installation**:
    ```bash
    node --version  # v18+ required
    npm --version
    ```

2. **Install Dependencies**:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```

3. **Reset Vite Cache**:
    ```bash
    rm -rf .vite
    npm run dev
    ```

### 2. TypeScript Compilation Errors

#### Symptoms
```
npm run build:main
# Type 'X' is not assignable to type 'Y'
```

#### Solutions
1. **Check tsconfig**:
    - [`tsconfig.json`](../tsconfig.json): For Renderer
    - [`tsconfig.main.json`](../tsconfig.main.json): For Main/Preload

2. **Check Path Aliases**:
    - Renderer: Use `@/` alias
    - Main/Preload: Use absolute paths

3. **Check Type Definitions**: [`types/index.ts`](../03-Module-Reference/renderer/types.md)

### 3. Port Conflict (Port already in use)

#### Symptoms
```
Error: Port 3000 is already in use
```

#### Solutions
1. **Use Different Port**: [`vite.config.ts`](../vite.config.ts)
    ```typescript
    server: {
      port: 3001,  // Change to different port
    }
    ```

2. **Kill Process**:
    ```bash
    # macOS/Linux
    lsof -ti:3000 | xargs kill -9
    
    # Windows
    netstat -ano | findstr :3000
    taskkill /PID <PID> /F
    ```

### 4. Python Path Issues

#### Symptoms
```
Error: spawn python3 ENOENT
```

#### Solutions
1. **Check Python Installation**:
    ```bash
    which python3
    python3 --version
    ```

2. **No Hardcoded Paths**: [`converter.ts`](../03-Module-Reference/main-process/python-converter.md)
    - Use `getPythonPath()`
    - Use `getPythonScriptPath()`

## Production Build Troubleshooting

### 1. electron-builder Build Failed

#### Symptoms
```
npm run dist
# "Error: Application entry file not found"
```

#### Solutions
1. **Run Build First**:
    ```bash
    npm run build
    npm run dist
    ```

2. **Check electron-builder.yml**:
    - Verify [`electron-builder.yml`](../electron-builder.yml) configuration
    - Check if file paths are correct

3. **Check Icon Files**:
    - `src/resources/icon.icns` (macOS)
    - `src/resources/icon.ico` (Windows)

### 2. Deployment File Not Executing

#### Symptoms
- Installed app does not run
- Exits immediately

#### Solutions
1. **Check Logs**:
    - Windows: `%APPDATA%\md-to-docx-converter\logs\`
    - macOS: `~/Library/Logs/md-to-docx-converter/`

2. **Check Python Runtime Included**:
    - Check `resources/python/` folder
    - Check if `python` / `python.exe` executable exists

3. **Check Pandoc Included**:
    - Pandoc installation required on system
    - Or need to bundle it

## Performance Optimization

### 1. Large File Processing
- Consider stream processing (currently reads entire file)
- Process in chunks

### 2. Batch Conversion Optimization
- Parallel processing (currently sequential)
- Use worker threads

### 3. Preview Optimization
- Virtual scrolling
- Lazy loading

## Security Considerations

### 1. File Path Validation
- Validate file paths in Main Process
- Prevent path traversal attacks

### 2. IPC Communication Security
- Use `contextBridge`
- Disable Node Integration (production)

### 3. User Input Validation
- Validate conversion option ranges
- Validate file extensions

## Diagnostic Tools

### 1. Developer Tools

#### Renderer Process
- **DevTools**: F12 or Cmd+Option+I
- **React DevTools**: Install Chrome extension
- **Console**: Check logs

#### Main Process
- **VSCode Debugger**: Auto-connect in development mode
- **Terminal**: Check output when running `npm run dev`

### 2. Log Analysis

#### Renderer Logs
```javascript
// In console
console.log(localStorage.getItem('theme'))
console.log(localStorage.getItem('language'))
```

#### Main Logs
```bash
// In terminal
npm run dev  # Check standard output
```

### 3. Network Check

- **Not Required**: Offline application
- Check only when Pandoc accesses external resources

## FAQ

### Q: App freezes during conversion.
A: For large files, Pandoc processing may take time. Check progress display and if taking long, split into batch conversions.

### Q: Some text is not converted.
A: Special characters or mathematical formulas may require Pandoc filters. Check filter settings in [`convert.py`](../03-Module-Reference/python/convert.py.md).

### Q: Multi-language not displaying properly.
A: Reset browser cache and check if language settings are saved in `localStorage`.

### Q: File dialog not opening on Windows.
A: Check if sandbox setting is correct. `sandbox: false` is required.

## Related Documents
- [Observability](../08-Observability.md) - Logging and debugging
- [Architecture](../02-Architecture.md) - System structure
- [Build/Deploy](../07-Build-Deploy.md) - Build environment

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-12-29 | 1.0 | Troubleshooting documentation initial draft created |