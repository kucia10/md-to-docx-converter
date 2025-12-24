"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.electronAPI = void 0;
const electron_1 = require("electron");
const channels_1 = require("../main/ipc/channels");
exports.electronAPI = {
    // File operations
    openFileDialog: () => electron_1.ipcRenderer.invoke(channels_1.IPC_CHANNELS.OPEN_FILE_DIALOG),
    saveFileDialog: (defaultName) => electron_1.ipcRenderer.invoke(channels_1.IPC_CHANNELS.SAVE_FILE_DIALOG, defaultName),
    openDirectoryDialog: () => electron_1.ipcRenderer.invoke(channels_1.IPC_CHANNELS.OPEN_DIRECTORY_DIALOG),
    readFile: (filePath) => electron_1.ipcRenderer.invoke(channels_1.IPC_CHANNELS.READ_FILE, filePath),
    // Conversion operations
    startConversion: (inputPath, outputPath, options) => electron_1.ipcRenderer.invoke(channels_1.IPC_CHANNELS.START_CONVERSION, { inputPath, outputPath, options }),
    startBatchConversion: (inputFiles, outputDirectory, options) => electron_1.ipcRenderer.invoke(channels_1.IPC_CHANNELS.START_BATCH_CONVERSION, { inputFiles, outputDirectory, options }),
    cancelConversion: () => electron_1.ipcRenderer.send(channels_1.IPC_CHANNELS.CANCEL_CONVERSION),
    onConversionProgress: (callback) => electron_1.ipcRenderer.on(channels_1.IPC_CHANNELS.CONVERSION_PROGRESS, (_event, progress) => callback(progress)),
    onConversionComplete: (callback) => electron_1.ipcRenderer.on(channels_1.IPC_CHANNELS.CONVERSION_COMPLETE, (_event, result) => callback(result)),
    onConversionError: (callback) => electron_1.ipcRenderer.on(channels_1.IPC_CHANNELS.CONVERSION_ERROR, (_event, error) => callback(error)),
    onBatchConversionProgress: (callback) => electron_1.ipcRenderer.on(channels_1.IPC_CHANNELS.BATCH_CONVERSION_PROGRESS, (_event, progress) => callback(progress)),
    onBatchConversionComplete: (callback) => electron_1.ipcRenderer.on(channels_1.IPC_CHANNELS.BATCH_CONVERSION_COMPLETE, (_event, result) => callback(result)),
    // App operations
    getAppVersion: () => electron_1.ipcRenderer.invoke(channels_1.IPC_CHANNELS.GET_APP_VERSION),
    quitApp: () => electron_1.ipcRenderer.send(channels_1.IPC_CHANNELS.QUIT_APP),
    // Remove all listeners
    removeAllListeners: () => {
        electron_1.ipcRenderer.removeAllListeners(channels_1.IPC_CHANNELS.CONVERSION_PROGRESS);
        electron_1.ipcRenderer.removeAllListeners(channels_1.IPC_CHANNELS.CONVERSION_COMPLETE);
        electron_1.ipcRenderer.removeAllListeners(channels_1.IPC_CHANNELS.CONVERSION_ERROR);
        electron_1.ipcRenderer.removeAllListeners(channels_1.IPC_CHANNELS.BATCH_CONVERSION_PROGRESS);
        electron_1.ipcRenderer.removeAllListeners(channels_1.IPC_CHANNELS.BATCH_CONVERSION_COMPLETE);
    }
};
// Expose the API to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', exports.electronAPI);
