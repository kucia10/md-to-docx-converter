# Observability

## Overview

The observability of MD to DOCX Converter currently relies on basic console logging. The application does not have a separate logging system or metrics collection system.

## Logging

### Renderer Process Logs

#### Location
- Browser Developer Tools → Console tab
- DevTools Auto-open: Only in development mode

#### Major Log Points

| Component/Hook | Log Message | Situation |
|----------------|--------------|------------|
| `useFileUpload` | `Error reading file: ${file.name}, ${error}` | File read failed |
| `App` | `Conversion error: ${error}` | Conversion start error |
| `App` | `Batch conversion error: ${error}` | Batch conversion error |
| `App` | `Merge conversion error: ${error}` | Merge conversion error |
| `App` | `Failed to fetch app version: ${error}` | App version fetch failed |
| `ResultDisplay` | `Error opening output folder: ${error}` | Folder open failed |

#### Log Levels
- `console.log`: General information (currently unused)
- `console.error`: Error situations

### Main Process Logs

#### Location
- Development Mode: Terminal (VSCode terminal)
- Production: Log file (see below)

#### Major Log Points

| Module | Log Type | Situation |
|--------|-----------|------------|
| `main.ts` | App initialization, window creation, event handling | App start/quit |
| `handlers.ts` | IPC channel handling, conversion request/response | IPC communication |
| `converter.ts` | Python process spawn/execution, stdout/stderr parsing | Conversion execution |

### Log File Location (Production)

| Operating System | Path | Note |
|-----------------|------|-------|
| Windows | `%APPDATA%\md-to-docx-converter\logs\` | - |
| macOS | `~/Library/Logs/md-to-docx-converter/` | - |
| Linux | `~/.local/share/md-to-docx-converter/logs/` | - |

> **Note**: Currently, project does not have log file generation logic implemented. Only terminal logs are available in production.

## Metrics

### Current Status
- **Metrics Collection System**: None
- **Performance Monitoring**: None
- **Usage Tracking**: None

### Trackable Metrics (Improvement Possible)

| Metric | Description | Tracking Location (Possible) |
|---------|-------------|----------------------------|
| Conversion time | Single/batch/merge conversion duration | Main Process |
| File size | File size comparison before/after conversion | Main Process |
| Conversion success rate | Success/failure ratio | Main Process |
| User actions | File upload, conversion start, etc. events | Renderer Process |
| Error rate | Error occurrence frequency | Overall |

### Progress Metrics

Progress metrics displayed in UI for user feedback:

| Conversion Type | Metric | Range |
|----------------|---------|--------|
| Single Conversion | `percentage` | 0-100% |
| Batch Conversion | `percentage`, `currentFile/totalFiles` | 0-100% |
| Merge Conversion | `percentage`, `currentFile/totalFiles` | 0-100% |

## Tracing

### Current Status
- **Distributed Tracing System**: None
- **Request Tracing**: None

### Traceable Flows

#### Single File Conversion Flow
```
[Renderer] startConversion() 
  → [IPC] start-conversion channel
  → [Main] IPC handler (START_CONVERSION)
  → [Main] PythonConverter.convertMarkdownToDocx()
  → [Main] spawn(python3, convert.py)
  → [Python] PandocConverter.convert()
  → [Python] subprocess.run(pandoc)
  → [Python] stdout(JSON) → Main
  → [Main] IPC event (conversion-complete)
  → [IPC] conversion-complete channel
  → [Renderer] onConversionComplete()
```

### Tracing Improvement Possibilities

| Feature | Current Status | Improvement Method |
|----------|---------------|-------------------|
| Request ID tracing | None | Assign unique ID to each conversion |
| Span tracing | Partial | Show full spans (correlation ID) |
| Timing tracing | None | Log duration for each stage |
| Distributed tracing (OpenTelemetry) | None | Introduce OpenTelemetry |

## Alerting

### Current Status
- **Alerting System**: None
- **Notification Service**: None

### Alerts Displayed to User (UI)

| Situation | UI Display | Type |
|-----------|--------------|------|
| Conversion success | Check icon + success message | [`ResultDisplay`](../03-Module-Reference/renderer/components/ResultDisplay.md) |
| Conversion failure | Warning icon + error message | [`ResultDisplay`](../03-Module-Reference/renderer/components/ResultDisplay.md) |
| File read failed | Console error log | [`useFileUpload`](../03-Module-Reference/renderer/hooks/useFileUpload.md) |
| Progress update | Progress bar + percentage | [`ProgressBar`](../03-Module-Reference/renderer/components/ProgressBar.md) |
| Estimated time | Remaining time (seconds) | [`ProgressBar`](../03-Module-Reference/renderer/components/ProgressBar.md) |

## Debugging

### Developer Tools

#### Renderer Process
- **DevTools**: Auto-open in development mode
- **React DevTools**: Chrome extension (install if needed)
- **Console**: Check `console.log()`, `console.error()` output

#### Main Process
- **VSCode Debugger**: Auto-connect in development mode with `--inspect=5858`
- **Terminal**: Check console output when running `npm run dev`

### Debugging Commands

```bash
# Run main + renderer simultaneously
npm run dev

# Run main process only
npm run dev:main

# Run renderer dev server only
npm run dev:renderer
```

## Improvement Needs

### Logging Improvements
- [ ] Introduce structured log format (JSON)
- [ ] Log level system (debug, info, warn, error)
- [ ] Log file generation and management (file rotation)
- [ ] User action logging

### Metrics Improvements
- [ ] Measure conversion time
- [ ] Track file size
- [ ] Success/failure statistics
- [ ] Performance monitoring (memory, CPU)

### Tracing Improvements
- [ ] Introduce request ID (correlation ID)
- [ ] Full flow tracing
- [ ] Timing measurement (for each stage)

### Alerting Improvements
- [ ] Error reporting (Sentry, etc.)
- [ ] Automatic diagnostic information collection
- [ ] Notification service integration

## Related Documents
- [Architecture](../02-Architecture.md) - System structure and communication flow
- [Build/Deploy](../07-Build-Deploy.md) - Development/production environment

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-29 | 1.0 | Observability documentation initial draft created |