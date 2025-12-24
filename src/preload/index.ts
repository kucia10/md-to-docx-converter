import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../main/ipc/channels'

export const electronAPI = {
  // File operations
  openFileDialog: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE_DIALOG),
  saveFileDialog: (defaultName?: string) => ipcRenderer.invoke(IPC_CHANNELS.SAVE_FILE_DIALOG, defaultName),
  openDirectoryDialog: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_DIRECTORY_DIALOG),
  readFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.READ_FILE, filePath),
  
  // Conversion operations
  startConversion: (inputPath: string, outputPath: string, options: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.START_CONVERSION, { inputPath, outputPath, options }),
  startBatchConversion: (inputFiles: string[], outputDirectory: string, options: any) =>
    ipcRenderer.invoke(IPC_CHANNELS.START_BATCH_CONVERSION, { inputFiles, outputDirectory, options }),
  cancelConversion: () => ipcRenderer.send(IPC_CHANNELS.CANCEL_CONVERSION),
  onConversionProgress: (callback: (progress: any) => void) =>
    ipcRenderer.on(IPC_CHANNELS.CONVERSION_PROGRESS, (_event: any, progress: any) => callback(progress)),
  onConversionComplete: (callback: (result: any) => void) =>
    ipcRenderer.on(IPC_CHANNELS.CONVERSION_COMPLETE, (_event: any, result: any) => callback(result)),
  onConversionError: (callback: (error: any) => void) =>
    ipcRenderer.on(IPC_CHANNELS.CONVERSION_ERROR, (_event: any, error: any) => callback(error)),
  onBatchConversionProgress: (callback: (progress: any) => void) =>
    ipcRenderer.on(IPC_CHANNELS.BATCH_CONVERSION_PROGRESS, (_event: any, progress: any) => callback(progress)),
  onBatchConversionComplete: (callback: (result: any) => void) =>
    ipcRenderer.on(IPC_CHANNELS.BATCH_CONVERSION_COMPLETE, (_event: any, result: any) => callback(result)),
  
  // App operations
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),
  quitApp: () => ipcRenderer.send(IPC_CHANNELS.QUIT_APP),
  
  // Remove all listeners
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.CONVERSION_PROGRESS)
    ipcRenderer.removeAllListeners(IPC_CHANNELS.CONVERSION_COMPLETE)
    ipcRenderer.removeAllListeners(IPC_CHANNELS.CONVERSION_ERROR)
    ipcRenderer.removeAllListeners(IPC_CHANNELS.BATCH_CONVERSION_PROGRESS)
    ipcRenderer.removeAllListeners(IPC_CHANNELS.BATCH_CONVERSION_COMPLETE)
  }
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Type declarations for the exposed API
declare global {
  interface Window {
    electronAPI: typeof electronAPI
  }
}