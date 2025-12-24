export const IPC_CHANNELS = {
  // File operations
  OPEN_FILE_DIALOG: 'open-file-dialog',
  SAVE_FILE_DIALOG: 'save-file-dialog',
  READ_FILE: 'read-file',
  OPEN_DIRECTORY_DIALOG: 'open-directory-dialog',
  
  // Conversion operations
  START_CONVERSION: 'start-conversion',
  START_BATCH_CONVERSION: 'start-batch-conversion',
  CANCEL_CONVERSION: 'cancel-conversion',
  CONVERSION_PROGRESS: 'conversion-progress',
  CONVERSION_COMPLETE: 'conversion-complete',
  CONVERSION_ERROR: 'conversion-error',
  BATCH_CONVERSION_PROGRESS: 'batch-conversion-progress',
  BATCH_CONVERSION_COMPLETE: 'batch-conversion-complete',
  
  // App operations
  GET_APP_VERSION: 'get-app-version',
  QUIT_APP: 'quit-app',
} as const

export type IpcChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS]