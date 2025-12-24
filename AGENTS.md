# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build & Development

- `npm run dev` - Starts both main and renderer processes concurrently
- Main process runs with `--inspect=5858` for debugging
- Renderer dev server runs on port 3000
- Main TypeScript compiles to `dist/main/` using `tsconfig.main.json`
- Renderer builds to `dist/renderer/` using Vite

## Critical Path Resolution

**Python Integration**:
- Development: Uses system `python3` via `getPythonPath()` in `src/main/python/converter.ts`
- Production: Uses bundled Python at `resources/python/python[.exe]` via `(process as any).resourcesPath`
- Python script: `src/python/convert.py` (dev) or `resources/python/convert.py` (prod)

**Important**: Never hardcode Python paths - always use the getter methods which handle dev/prod switching.

## Architecture Notes

- **IPC Channels**: All channel constants defined in `src/main/ipc/channels.ts` - import from there only
- **Sandbox**: Disabled (`sandbox: false` in main.ts) specifically for macOS file dialog access
- **Preload Script**: Exposes `window.electronAPI` to renderer process
- **Python Output**: Returns JSON via stdout, parsed in main process

## TypeScript Path Aliases (CRITICAL DIFFERENCE)

- `tsconfig.json`: `@/*` → `src/*` 
- `vite.config.ts`: `@/*` → `src/renderer/*`
- Use `@/` for renderer code, absolute paths for main/preload code

## Unit Conversions

- Margins in UI are in centimeters
- Python script converts to inches (divide by 2.54) for Pandoc

## Electron Security Settings

- Certificate verification disabled in development (lines 8-12 in main.ts)
- Context isolation enabled, node integration disabled