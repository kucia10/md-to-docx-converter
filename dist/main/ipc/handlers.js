"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupIpcHandlers = setupIpcHandlers;
const electron_1 = require("electron");
const channels_1 = require("./channels");
const converter_1 = require("../python/converter");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let pythonConverter = null;
// Helper function to get the main window without circular dependency
function getWindow() {
    return electron_1.BrowserWindow.getFocusedWindow() || electron_1.BrowserWindow.getAllWindows()[0] || null;
}
function setupIpcHandlers() {
    console.log('[IPC] Setting up IPC handlers...');
    // Initialize Python converter
    pythonConverter = new converter_1.PythonConverter();
    console.log('[IPC] Python converter initialized');
    // File dialog handlers
    electron_1.ipcMain.handle(channels_1.IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
        console.log('[IPC] OPEN_FILE_DIALOG invoked');
        try {
            // macOS: Bring app to foreground before showing dialog
            if (process.platform === 'darwin') {
                electron_1.app.focus({ steal: true });
            }
            const win = getWindow();
            console.log('[IPC] Window for dialog:', win ? 'exists' : 'null');
            // Show dialog with parent window for proper focus handling
            const dialogOptions = {
                properties: ['openFile', 'multiSelections'],
                filters: [
                    { name: 'Markdown Files', extensions: ['md', 'markdown'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            };
            let result;
            if (win) {
                result = await electron_1.dialog.showOpenDialog(win, dialogOptions);
            }
            else {
                result = await electron_1.dialog.showOpenDialog(dialogOptions);
            }
            console.log('[IPC] File dialog result:', result);
            return result;
        }
        catch (error) {
            console.error('[IPC] Error showing file dialog:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle(channels_1.IPC_CHANNELS.OPEN_DIRECTORY_DIALOG, async () => {
        console.log('[IPC] OPEN_DIRECTORY_DIALOG invoked');
        try {
            // macOS: Bring app to foreground before showing dialog
            if (process.platform === 'darwin') {
                electron_1.app.focus({ steal: true });
            }
            const win = getWindow();
            const dialogOptions = {
                properties: ['openDirectory']
            };
            let result;
            if (win) {
                result = await electron_1.dialog.showOpenDialog(win, dialogOptions);
            }
            else {
                result = await electron_1.dialog.showOpenDialog(dialogOptions);
            }
            console.log('[IPC] Directory dialog result:', result);
            return result;
        }
        catch (error) {
            console.error('[IPC] Error showing directory dialog:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle(channels_1.IPC_CHANNELS.SAVE_FILE_DIALOG, async (_event, defaultName) => {
        try {
            // macOS: Bring app to foreground before showing dialog
            if (process.platform === 'darwin') {
                electron_1.app.focus({ steal: true });
            }
            const win = getWindow();
            const dialogOptions = {
                filters: [
                    { name: 'Word Document', extensions: ['docx'] }
                ],
                defaultPath: defaultName || 'converted.docx'
            };
            let result;
            if (win) {
                result = await electron_1.dialog.showSaveDialog(win, dialogOptions);
            }
            else {
                result = await electron_1.dialog.showSaveDialog(dialogOptions);
            }
            return result;
        }
        catch (error) {
            console.error('[IPC] Error showing save dialog:', error);
            throw error;
        }
    });
    // File read handler
    electron_1.ipcMain.handle(channels_1.IPC_CHANNELS.READ_FILE, async (_event, filePath) => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const stats = fs.statSync(filePath);
            const fileName = path.basename(filePath);
            return {
                name: fileName,
                path: filePath,
                content: content,
                size: stats.size,
                lastModified: stats.mtimeMs
            };
        }
        catch (error) {
            console.error('[IPC] Error reading file:', error);
            throw error;
        }
    });
    // Conversion handlers
    electron_1.ipcMain.handle(channels_1.IPC_CHANNELS.START_CONVERSION, async (_event, { inputPath, outputPath, options }) => {
        if (!pythonConverter) {
            throw new Error('Python converter not initialized');
        }
        try {
            const result = await pythonConverter.convertMarkdownToDocx(inputPath, outputPath, options);
            // Send completion event
            _event.sender.send(channels_1.IPC_CHANNELS.CONVERSION_COMPLETE, {
                success: true,
                message: 'Conversion completed successfully',
                outputPath: outputPath
            });
            return result;
        }
        catch (error) {
            console.error('Conversion error:', error);
            _event.sender.send(channels_1.IPC_CHANNELS.CONVERSION_ERROR, error instanceof Error ? error.message : '변환 중 오류가 발생했습니다');
            throw error;
        }
    });
    // Batch conversion handler
    electron_1.ipcMain.handle(channels_1.IPC_CHANNELS.START_BATCH_CONVERSION, async (event, { inputFiles, outputDirectory, options }) => {
        if (!pythonConverter) {
            throw new Error('Python converter not initialized');
        }
        console.log('[Batch Conversion] Starting batch conversion with', inputFiles.length, 'files');
        const totalFiles = inputFiles.length;
        const processedFiles = [];
        const errors = [];
        for (let i = 0; i < totalFiles; i++) {
            const inputFile = inputFiles[i];
            const fileName = path.basename(inputFile);
            const baseName = fileName.replace(/\.[^/.]+$/, '');
            const outputPath = path.join(outputDirectory, `${baseName}.docx`);
            console.log(`[Batch Conversion] Converting ${i + 1}/${totalFiles}: ${fileName}`);
            // Send progress update
            event.sender.send(channels_1.IPC_CHANNELS.BATCH_CONVERSION_PROGRESS, {
                currentFile: i + 1,
                totalFiles,
                currentFileName: fileName,
                percentage: Math.round(((i + 1) / totalFiles) * 100),
                status: 'converting',
                processedFiles,
                errors
            });
            try {
                await pythonConverter.convertMarkdownToDocx(inputFile, outputPath, options);
                processedFiles.push(outputPath);
                console.log(`[Batch Conversion] Successfully converted: ${fileName}`);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`[Batch Conversion] Error converting ${fileName}:`, errorMessage);
                errors.push({ fileName, error: errorMessage });
            }
        }
        // Send completion result
        const result = {
            success: errors.length === 0,
            message: errors.length === 0
                ? '모든 파일 변환이 완료되었습니다'
                : `${processedFiles.length}개 파일 변환 완료, ${errors.length}개 파일 실패`,
            outputDirectory,
            totalFiles,
            processedFiles: processedFiles.length,
            errors
        };
        event.sender.send(channels_1.IPC_CHANNELS.BATCH_CONVERSION_COMPLETE, result);
        console.log('[Batch Conversion] Batch conversion completed:', result);
        return result;
    });
    // App info handlers
    electron_1.ipcMain.handle(channels_1.IPC_CHANNELS.GET_APP_VERSION, () => {
        // Electron's app.getVersion() automatically reads from package.json
        return 'v' + electron_1.app.getVersion();
    });
    // Cleanup on quit
    electron_1.ipcMain.on(channels_1.IPC_CHANNELS.QUIT_APP, () => {
        if (pythonConverter) {
            pythonConverter.cleanup();
        }
    });
}
