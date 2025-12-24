"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMainWindow = getMainWindow;
const electron_1 = require("electron");
const path_1 = require("path");
const handlers_1 = require("./ipc/handlers");
const isDev = process.env.NODE_ENV === 'development';
// Disable certificate verification in development to avoid macOS trust store errors
if (isDev) {
    electron_1.app.commandLine.appendSwitch('ignore-certificate-errors');
    electron_1.app.commandLine.appendSwitch('disable-features', 'CertVerifierBuiltinFeature');
    electron_1.app.commandLine.appendSwitch('disable-site-isolation-trials');
}
// macOS: Ensure file dialog works properly
electron_1.app.commandLine.appendSwitch('enable-file-cookies');
let mainWindow = null;
function createWindow() {
    console.log('[Main] Creating main window...');
    // Create the browser window
    mainWindow = new electron_1.BrowserWindow({
        height: 900,
        width: 1200,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: (0, path_1.join)(__dirname, '../preload/index.js'),
            nodeIntegration: isDev, // Enable node integration in development
            contextIsolation: true,
            webSecurity: !isDev, // Disable web security in development for file dialogs
            sandbox: false, // Disable sandbox to allow file dialog access on macOS
        },
        titleBarStyle: 'default',
        show: false,
        icon: isDev ? (0, path_1.join)(__dirname, '../../resources/icon.png') : (0, path_1.join)(__dirname, '../resources/icon.png'), // Set window icon
    });
    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        console.log('[Main] Window ready to show');
        mainWindow?.show();
    });
    // Load the app
    if (isDev) {
        console.log('[Main] Loading dev server at http://localhost:3000');
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        console.log('[Main] Loading production build');
        mainWindow.loadFile((0, path_1.join)(__dirname, '../renderer/index.html'));
    }
    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Initialize app before ready event to ensure proper setup
electron_1.app.on('ready', () => {
    console.log('[Main] App ready event fired');
});
electron_1.app.whenReady().then(() => {
    console.log('[Main] App ready, initializing...');
    // macOS: Ensure the app is properly activated for file dialog
    if (process.platform === 'darwin') {
        electron_1.app.setAppUserModelId('com.mdtodocx.converter');
    }
    createWindow();
    (0, handlers_1.setupIpcHandlers)();
    console.log('[Main] IPC handlers setup complete');
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit when all windows are closed, except on macOS
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
// Security: prevent new window creation
electron_1.app.on('web-contents-created', (_event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        electron_1.shell.openExternal(navigationUrl);
    });
});
function getMainWindow() {
    return mainWindow;
}
