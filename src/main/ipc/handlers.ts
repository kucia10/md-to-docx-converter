import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import { IPC_CHANNELS } from './channels'
import { PythonConverter } from '../python/converter'
import * as fs from 'fs'
import * as path from 'path'

let pythonConverter: PythonConverter | null = null

// Helper function to get the main window without circular dependency
function getWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0] || null
}

export function setupIpcHandlers(): void {
  console.log('[IPC] Setting up IPC handlers...')
  // Initialize Python converter
  pythonConverter = new PythonConverter()
  console.log('[IPC] Python converter initialized')

  // File dialog handlers
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
    console.log('[IPC] OPEN_FILE_DIALOG invoked')
    
    try {
      // macOS: Bring app to foreground before showing dialog
      if (process.platform === 'darwin') {
        app.focus({ steal: true })
      }
      
      const win = getWindow()
      console.log('[IPC] Window for dialog:', win ? 'exists' : 'null')
      
      // Show dialog with parent window for proper focus handling
      const dialogOptions: Electron.OpenDialogOptions = {
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Markdown Files', extensions: ['md', 'markdown'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }
      
      let result
      if (win) {
        result = await dialog.showOpenDialog(win, dialogOptions)
      } else {
        result = await dialog.showOpenDialog(dialogOptions)
      }
      
      console.log('[IPC] File dialog result:', result)
      return result
    } catch (error) {
      console.error('[IPC] Error showing file dialog:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.OPEN_DIRECTORY_DIALOG, async () => {
    console.log('[IPC] OPEN_DIRECTORY_DIALOG invoked')
    
    try {
      // macOS: Bring app to foreground before showing dialog
      if (process.platform === 'darwin') {
        app.focus({ steal: true })
      }
      
      const win = getWindow()
      
      const dialogOptions: Electron.OpenDialogOptions = {
        properties: ['openDirectory']
      }
      
      let result
      if (win) {
        result = await dialog.showOpenDialog(win, dialogOptions)
      } else {
        result = await dialog.showOpenDialog(dialogOptions)
      }
      
      console.log('[IPC] Directory dialog result:', result)
      return result
    } catch (error) {
      console.error('[IPC] Error showing directory dialog:', error)
      throw error
    }
  })

  ipcMain.handle(IPC_CHANNELS.SAVE_FILE_DIALOG, async (_event: any, defaultName?: string) => {
    try {
      // macOS: Bring app to foreground before showing dialog
      if (process.platform === 'darwin') {
        app.focus({ steal: true })
      }
      
      const win = getWindow()
      
      const dialogOptions: Electron.SaveDialogOptions = {
        filters: [
          { name: 'Word Document', extensions: ['docx'] }
        ],
        defaultPath: defaultName || 'converted.docx'
      }
      
      let result
      if (win) {
        result = await dialog.showSaveDialog(win, dialogOptions)
      } else {
        result = await dialog.showSaveDialog(dialogOptions)
      }
      
      return result
    } catch (error) {
      console.error('[IPC] Error showing save dialog:', error)
      throw error
    }
  })

  // File read handler
  ipcMain.handle(IPC_CHANNELS.READ_FILE, async (_event: any, filePath: string) => {
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const stats = fs.statSync(filePath)
      const fileName = path.basename(filePath)
      
      return {
        name: fileName,
        path: filePath,
        content: content,
        size: stats.size,
        lastModified: stats.mtimeMs
      }
    } catch (error) {
      console.error('[IPC] Error reading file:', error)
      throw error
    }
  })

  // Conversion handlers
  ipcMain.handle(IPC_CHANNELS.START_CONVERSION, async (_event: any, { inputPath, outputPath, options }: {
    inputPath: string;
    outputPath: string;
    options: any
  }) => {
    if (!pythonConverter) {
      throw new Error('Python converter not initialized')
    }

    try {
      const result = await pythonConverter.convertMarkdownToDocx(inputPath, outputPath, options)
      
      // Send completion event
      _event.sender.send(IPC_CHANNELS.CONVERSION_COMPLETE, {
        success: true,
        message: 'Conversion completed successfully',
        outputPath: outputPath
      })
      
      return result
    } catch (error) {
      console.error('Conversion error:', error)
      _event.sender.send(IPC_CHANNELS.CONVERSION_ERROR, error instanceof Error ? error.message : '변환 중 오류가 발생했습니다')
      throw error
    }
  })

  // Batch conversion handler
  ipcMain.handle(IPC_CHANNELS.START_BATCH_CONVERSION, async (event: any, { inputFiles, outputDirectory, options }: {
    inputFiles: string[];
    outputDirectory: string;
    options: any
  }) => {
    if (!pythonConverter) {
      throw new Error('Python converter not initialized')
    }

    console.log('[Batch Conversion] Starting batch conversion with', inputFiles.length, 'files')
    
    const totalFiles = inputFiles.length
    const processedFiles: string[] = []
    const errors: Array<{ fileName: string; error: string }> = []
    
    for (let i = 0; i < totalFiles; i++) {
      const inputFile = inputFiles[i]
      const fileName = path.basename(inputFile)
      const baseName = fileName.replace(/\.[^/.]+$/, '')
      const outputPath = path.join(outputDirectory, `${baseName}.docx`)
      
      console.log(`[Batch Conversion] Converting ${i + 1}/${totalFiles}: ${fileName}`)
      
      // Send progress update
      event.sender.send(IPC_CHANNELS.BATCH_CONVERSION_PROGRESS, {
        currentFile: i + 1,
        totalFiles,
        currentFileName: fileName,
        percentage: Math.round(((i + 1) / totalFiles) * 100),
        status: 'converting',
        processedFiles,
        errors
      })
      
      try {
        await pythonConverter.convertMarkdownToDocx(inputFile, outputPath, options)
        processedFiles.push(outputPath)
        console.log(`[Batch Conversion] Successfully converted: ${fileName}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[Batch Conversion] Error converting ${fileName}:`, errorMessage)
        errors.push({ fileName, error: errorMessage })
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
    }
    
    event.sender.send(IPC_CHANNELS.BATCH_CONVERSION_COMPLETE, result)
    
    console.log('[Batch Conversion] Batch conversion completed:', result)
    return result
  })

  // Merge conversion handler - multiple files to single DOCX
  ipcMain.handle(IPC_CHANNELS.START_MERGE_CONVERSION, async (event: any, { inputFiles, outputPath, options }: {
    inputFiles: string[];
    outputPath: string;
    options: any
  }) => {
    if (!pythonConverter) {
      throw new Error('Python converter not initialized')
    }

    console.log('[Merge Conversion] Starting merge conversion with', inputFiles.length, 'files')
    
    const totalFiles = inputFiles.length
    
    // Send initial progress
    event.sender.send(IPC_CHANNELS.MERGE_CONVERSION_PROGRESS, {
      currentFile: 0,
      totalFiles,
      currentFileName: '',
      percentage: 0,
      status: 'preparing'
    })
    
    try {
      await pythonConverter.mergeFilesToDocx(inputFiles, outputPath, options)
      
      // Send completion result
      const result = {
        success: true,
        message: `${totalFiles}개 파일이 하나의 DOCX로 병합되었습니다`,
        outputPath,
        totalFiles
      }
      
      event.sender.send(IPC_CHANNELS.MERGE_CONVERSION_COMPLETE, result)
      
      console.log('[Merge Conversion] Merge conversion completed:', result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('[Merge Conversion] Error:', errorMessage)
      
      const errorResult = {
        success: false,
        message: '병합 변환 중 오류가 발생했습니다',
        error: errorMessage
      }
      
      event.sender.send(IPC_CHANNELS.MERGE_CONVERSION_COMPLETE, errorResult)
      throw error
    }
  })

  // App info handlers
  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => {
    // Electron's app.getVersion() automatically reads from package.json
    return 'v' + app.getVersion()
  })

  // Cleanup on quit
  ipcMain.on(IPC_CHANNELS.QUIT_APP, () => {
    if (pythonConverter) {
      pythonConverter.cleanup()
    }
  })
}