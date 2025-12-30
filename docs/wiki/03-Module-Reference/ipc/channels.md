# IPC Channels

## Summary
- **Responsibility**: IPC channel constant definitions and type safety
- **Main Users/Callers**: Main Process (handlers), Preload Script (API exposure), Renderer Process (caller)
- **Key Entry Point**: `IPC_CHANNELS` object

## Location in Architecture
- **Layer**: Main Process / IPC Communication Layer
- **Upstream Dependencies**: None (pure constant definition)
- **Downstream Dependencies**: Preload Script, Main Process Handlers
- **Role in Runtime Flow**: Single source of truth for channel names

## Public Interface

### IPC_CHANNELS
All IPC channel constant object

**Type**: `const IPC_CHANNELS` (as const)

**Channel List**:

#### File Operations
| Channel | Value | Description |
|----------|------|-------------|
| `OPEN_FILE_DIALOG` | `'open-file-dialog'` | File selection dialog |
| `SAVE_FILE_DIALOG` | `'save-file-dialog'` | Save dialog |
| `READ_FILE` | `'read-file'` | Read file content |
| `OPEN_DIRECTORY_DIALOG` | `'open-directory-dialog'` | Directory selection dialog |

#### Conversion Operations
| Channel | Value | Description |
|----------|------|-------------|
| `START_CONVERSION` | `'start-conversion'` | Start single file conversion |
| `START_BATCH_CONVERSION` | `'start-batch-conversion'` | Start batch conversion |
| `START_MERGE_CONVERSION` | `'start-merge-conversion'` | Start merge conversion |
| `CANCEL_CONVERSION` | `'cancel-conversion'` | Cancel conversion |
| `CONVERSION_PROGRESS` | `'conversion-progress'` | Single conversion progress event |
| `CONVERSION_COMPLETE` | `'conversion-complete'` | Single conversion complete event |
| `CONVERSION_ERROR` | `'conversion-error'` | Conversion error event |
| `BATCH_CONVERSION_PROGRESS` | `'batch-conversion-progress'` | Batch conversion progress event |
| `BATCH_CONVERSION_COMPLETE` | `'batch-conversion-complete'` | Batch conversion complete event |
| `MERGE_CONVERSION_PROGRESS` | `'merge-conversion-progress'` | Merge conversion progress event |
| `MERGE_CONVERSION_COMPLETE` | `'merge-conversion-complete'` | Merge conversion complete event |

#### App Operations
| Channel | Value | Description |
|----------|------|-------------|
| `GET_APP_VERSION` | `'get-app-version'` | Get app version |
| `QUIT_APP` | `'quit-app'` | Quit app |

### IpcChannel
Union type of channel values

**Type**:
```typescript
export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]
```

**Usage Example**:
```typescript
// Channel value type validation
function registerHandler(channel: IpcChannel, handler: () => void) {
  ipcMain.handle(channel, handler)
}
```

## Internal Behavior

### Channel Naming Convention
- **Request channels**: `kebab-case`, verb-noun pattern (`open-file-dialog`, `start-conversion`)
- **Event channels**: `kebab-case`, noun-verb pattern (`conversion-progress`, `conversion-complete`)

### const Assertion
```typescript
export const IPC_CHANNELS = {
  // ...
} as const
```

**Purpose**: 
- Allow TypeScript to infer literal types
- Safely extract union of all channel values in `IpcChannel` type

## Data/Models

**Related Types**: [`src/renderer/types/index.ts`](../../../src/renderer/types/index.ts:96-115) - `ElectronAPI` interface

## Configuration/Environment Variables
None

## Dependencies
- **Internal Modules**: None
- **External Libraries/Services**: None

## Testing
- **Related Tests**: None (pure constant definition)
- **Coverage/Gaps**: N/A

## Operations/Observability
- **Logging**: No custom logging
- **Metrics/Tracing**: None
- **Alert Points**: None

## Usage Examples

### Import in Main Process
```typescript
import { IPC_CHANNELS } from './ipc/channels'
import { ipcMain } from 'electron'

// Register handler
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
  // File dialog display logic
})
```

### Import in Preload Script
```typescript
import { IPC_CHANNELS } from '../main/ipc/channels'
import { ipcRenderer } from 'electron'

// API exposure
const electronAPI = {
  openFileDialog: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE_DIALOG),
  startConversion: (input, output, options) => 
    ipcRenderer.invoke(IPC_CHANNELS.START_CONVERSION, { input, output, options }),
}
```

## Important Rules

### No Hardcoding
❌ **Incorrect Usage**:
```typescript
ipcMain.handle('open-file-dialog', handler)
```

✅ **Correct Usage**:
```typescript
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, handler)
```

### Type Safety
```typescript
// TypeScript detects typos in channel names
ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, handler)
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Error: Property 'OPEN_FILE_DIALOG' does not exist on type...
```

## Related Documents

- [IPC Handlers](handlers.md) - Channel handler implementation
- [Preload Script](../preload/index.md) - Context Bridge
- [API/Interface](../../04-API-Interface.md) - API details

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2024-12-29 | 1.0 | Initial documentation created |