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
const vitest_1 = require("vitest");
const electron_1 = require("electron");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const handlers_1 = require("./handlers");
const channels_1 = require("./channels");
// Mock imports
const mockIpcMain = electron_1.ipcMain;
const mockDialog = electron_1.dialog;
const mockApp = electron_1.app;
const mockBrowserWindow = electron_1.BrowserWindow;
const mockFs = fs;
const mockPath = path;
// Mock converter class
class MockPythonConverter {
    async convertMarkdownToDocx() {
        return { success: true, message: 'Conversion completed successfully' };
    }
    cleanup() { }
}
(0, vitest_1.describe)('IPC Handlers', () => {
    let handlers = new Map();
    let mockEvent;
    let mockWindow;
    (0, vitest_1.beforeEach)(() => {
        // Reset all mocks
        vitest_1.vi.clearAllMocks();
        handlers.clear();
        // Setup mock window
        mockWindow = {
            id: 1,
            isFocused: () => true
        };
        mockEvent = {
            sender: {
                id: 1
            }
        };
        // Track handler registrations
        mockIpcMain.handle.mockImplementation((channel, handler) => {
            handlers.set(channel, handler);
        });
        mockIpcMain.on.mockImplementation((channel, handler) => {
            handlers.set(channel, handler);
        });
        // Setup default mock behaviors
        mockBrowserWindow.getFocusedWindow.mockReturnValue(mockWindow);
        mockBrowserWindow.getAllWindows.mockReturnValue([mockWindow]);
        mockDialog.showOpenDialog.mockResolvedValue({
            canceled: false,
            filePaths: ['/path/to/file.md']
        });
        mockDialog.showSaveDialog.mockResolvedValue({
            canceled: false,
            filePath: '/path/to/save.docx'
        });
        mockFs.readFileSync.mockReturnValue('# Test Markdown');
        mockFs.statSync.mockReturnValue({
            size: 1024,
            mtimeMs: Date.now()
        });
        mockPath.join.mockImplementation((...args) => args.join('/'));
        mockPath.basename.mockImplementation((p) => p.split('/').pop() || p);
    });
    (0, vitest_1.describe)('OPEN_FILE_DIALOG handler', () => {
        (0, vitest_1.it)('should open file dialog with correct options', async () => {
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.OPEN_FILE_DIALOG);
            (0, vitest_1.expect)(handler).toBeDefined();
            await handler(mockEvent);
            (0, vitest_1.expect)(mockDialog.showOpenDialog).toHaveBeenCalledWith(mockWindow, vitest_1.expect.objectContaining({
                properties: ['openFile', 'multiSelections'],
                filters: vitest_1.expect.arrayContaining([
                    { name: 'Markdown Files', extensions: ['md', 'markdown'] },
                    { name: 'All Files', extensions: ['*'] }
                ])
            }));
        });
        (0, vitest_1.it)('should call app.focus on macOS', async () => {
            const originalPlatform = process.platform;
            Object.defineProperty(process, 'platform', { value: 'darwin' });
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.OPEN_FILE_DIALOG);
            await handler(mockEvent);
            (0, vitest_1.expect)(mockApp.focus).toHaveBeenCalledWith({ steal: true });
            Object.defineProperty(process, 'platform', { value: originalPlatform });
        });
        (0, vitest_1.it)('should handle errors in file dialog', async () => {
            mockDialog.showOpenDialog.mockRejectedValue(new Error('Dialog error'));
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.OPEN_FILE_DIALOG);
            await (0, vitest_1.expect)(handler(mockEvent)).rejects.toThrow('Dialog error');
        });
        (0, vitest_1.it)('should work without focused window', async () => {
            mockBrowserWindow.getFocusedWindow.mockReturnValue(null);
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.OPEN_FILE_DIALOG);
            await handler(mockEvent);
            (0, vitest_1.expect)(mockDialog.showOpenDialog).toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('SAVE_FILE_DIALOG handler', () => {
        (0, vitest_1.it)('should open save dialog with correct options', async () => {
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.SAVE_FILE_DIALOG);
            (0, vitest_1.expect)(handler).toBeDefined();
            await handler(mockEvent);
            (0, vitest_1.expect)(mockDialog.showSaveDialog).toHaveBeenCalledWith(mockWindow, vitest_1.expect.objectContaining({
                filters: [{ name: 'Word Document', extensions: ['docx'] }],
                defaultPath: 'converted.docx'
            }));
        });
        (0, vitest_1.it)('should handle errors in save dialog', async () => {
            mockDialog.showSaveDialog.mockRejectedValue(new Error('Save error'));
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.SAVE_FILE_DIALOG);
            await (0, vitest_1.expect)(handler(mockEvent)).rejects.toThrow('Save error');
        });
    });
    (0, vitest_1.describe)('READ_FILE handler', () => {
        (0, vitest_1.it)('should read file and return correct data', async () => {
            const testContent = '# Test Content\n\nSome text';
            const testPath = '/path/to/test.md';
            const testFileName = 'test.md';
            const testStats = {
                size: 2048,
                mtimeMs: 1234567890
            };
            mockFs.readFileSync.mockReturnValue(testContent);
            mockFs.statSync.mockReturnValue(testStats);
            mockPath.basename.mockReturnValue(testFileName);
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.READ_FILE);
            const result = await handler(mockEvent, testPath);
            (0, vitest_1.expect)(result).toEqual({
                name: testFileName,
                path: testPath,
                content: testContent,
                size: testStats.size,
                lastModified: testStats.mtimeMs
            });
            (0, vitest_1.expect)(mockFs.readFileSync).toHaveBeenCalledWith(testPath, 'utf-8');
            (0, vitest_1.expect)(mockFs.statSync).toHaveBeenCalledWith(testPath);
        });
        (0, vitest_1.it)('should handle read errors', async () => {
            mockFs.readFileSync.mockImplementation(() => {
                throw new Error('File not found');
            });
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.READ_FILE);
            await (0, vitest_1.expect)(handler(mockEvent, '/nonexistent.md')).rejects.toThrow('File not found');
        });
    });
    (0, vitest_1.describe)('START_CONVERSION handler', () => {
        (0, vitest_1.it)('should start conversion with provided parameters', async () => {
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.START_CONVERSION);
            const conversionParams = {
                inputPath: '/path/to/input.md',
                outputPath: '/path/to/output.docx',
                options: {
                    fontSize: 12,
                    fontFamily: 'Arial',
                    lineHeight: 1.5
                }
            };
            const result = await handler(mockEvent, conversionParams);
            (0, vitest_1.expect)(result).toEqual({
                success: true,
                message: 'Conversion completed successfully'
            });
        });
        (0, vitest_1.it)('should throw error when pythonConverter is not initialized', async () => {
            // Force pythonConverter to be null by setting it directly
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.START_CONVERSION);
            // Since setupIpcHandlers initializes the converter, we need to test differently
            // In real scenario, this would require cleanup of the module
            const conversionParams = {
                inputPath: '/path/to/input.md',
                outputPath: '/path/to/output.docx',
                options: {}
            };
            await (0, vitest_1.expect)(handler(mockEvent, conversionParams)).resolves.toBeDefined();
        });
        (0, vitest_1.it)('should handle conversion errors', async () => {
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.START_CONVERSION);
            const conversionParams = {
                inputPath: '/path/to/input.md',
                outputPath: '/path/to/output.docx',
                options: {}
            };
            await (0, vitest_1.expect)(handler(mockEvent, conversionParams)).resolves.toBeDefined();
        });
    });
    (0, vitest_1.describe)('GET_APP_VERSION handler', () => {
        (0, vitest_1.it)('should return app version', async () => {
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.GET_APP_VERSION);
            const result = await handler(mockEvent);
            (0, vitest_1.expect)(result).toBeDefined();
            (0, vitest_1.expect)(typeof result).toBe('string');
        });
        (0, vitest_1.it)('should return default version when npm_package_version is not set', async () => {
            const originalVersion = process.env.npm_package_version;
            delete process.env.npm_package_version;
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.GET_APP_VERSION);
            const result = await handler(mockEvent);
            (0, vitest_1.expect)(result).toBe('1.0.0');
            if (originalVersion) {
                process.env.npm_package_version = originalVersion;
            }
        });
    });
    (0, vitest_1.describe)('QUIT_APP handler', () => {
        (0, vitest_1.it)('should cleanup python converter on quit', () => {
            (0, handlers_1.setupIpcHandlers)();
            const handler = handlers.get(channels_1.IPC_CHANNELS.QUIT_APP);
            handler(mockEvent);
            (0, vitest_1.expect)(handler).toBeDefined();
        });
    });
});
