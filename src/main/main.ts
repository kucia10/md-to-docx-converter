import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { setupIpcHandlers } from './ipc/handlers'

const isDev = process.env.NODE_ENV === 'development'

// Disable certificate verification in development to avoid macOS trust store errors
if (isDev) {
  app.commandLine.appendSwitch('ignore-certificate-errors')
  app.commandLine.appendSwitch('disable-features', 'CertVerifierBuiltinFeature')
  app.commandLine.appendSwitch('disable-site-isolation-trials')
}

// macOS: Ensure file dialog works properly
app.commandLine.appendSwitch('enable-file-cookies')

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  console.log('[Main] Creating main window...')
  // Create the browser window
  mainWindow = new BrowserWindow({
    height: 900,
    width: 1200,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: isDev, // Enable node integration in development
      contextIsolation: true,
      webSecurity: !isDev, // Disable web security in development for file dialogs
      sandbox: false, // Disable sandbox to allow file dialog access on macOS
    },
    titleBarStyle: 'default',
    show: false,
    icon: isDev ? join(__dirname, '../../resources/icon.png') : join(__dirname, '../resources/icon.png'), // Set window icon
  })

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('[Main] Window ready to show')
    mainWindow?.show()
  })

  // Load the app
  if (isDev) {
    console.log('[Main] Loading dev server at http://localhost:3000')
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    console.log('[Main] Loading production build')
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Initialize app before ready event to ensure proper setup
app.on('ready', () => {
  console.log('[Main] App ready event fired')
})

app.whenReady().then(() => {
  console.log('[Main] App ready, initializing...')
  
  // macOS: Ensure the app is properly activated for file dialog
  if (process.platform === 'darwin') {
    app.setAppUserModelId('com.mdtodocx.converter')
  }
  
  createWindow()
  setupIpcHandlers()
  console.log('[Main] IPC handlers setup complete')

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Security: prevent new window creation
app.on('web-contents-created', (_event: any, contents: any) => {
  contents.on('new-window', (event: any, navigationUrl: string) => {
    event.preventDefault()
    shell.openExternal(navigationUrl)
  })
})

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}