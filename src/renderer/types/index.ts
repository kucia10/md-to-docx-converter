export interface FileItem {
  id: string
  name: string
  path: string
  size: number
  lastModified: number
  content?: string
}

export interface ConversionOptions {
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  orientation?: 'portrait' | 'landscape'
  generateToc?: boolean
  referenceStyle?: 'apa' | 'mla' | 'chicago' | 'harvard'
  imageHandling?: 'embed' | 'link'
  codeBlockStyle?: 'fenced' | 'indented'
}

export interface ConversionProgress {
  currentFile: number
  totalFiles: number
  currentFileName: string
  percentage: number
  stage: 'preparing' | 'converting' | 'finalizing' | 'completed' | 'error'
}

export interface ConversionResult {
  success: boolean
  message: string
  outputPath?: string
  processedFiles?: string[]
  errors?: string[]
}

export interface AppState {
  selectedFiles: FileItem[]
  currentFileIndex: number
  previewContent: string
  conversionOptions: ConversionOptions
  isConverting: boolean
  conversionProgress: ConversionProgress | null
  conversionError: string | null
  conversionResult: ConversionResult | null
  isDragging: boolean
}

export interface FileReadResult {
  name: string
  path: string
  content: string
  size: number
  lastModified: number
}

export interface BatchConversionProgress {
  currentFile: number
  totalFiles: number
  currentFileName: string
  percentage: number
  status: 'converting' | 'completed' | 'error'
  processedFiles: string[]
  errors: Array<{ fileName: string; error: string }>
}

export interface BatchConversionResult {
  success: boolean
  message: string
  outputDirectory?: string
  totalFiles: number
  processedFiles: number
  errors: Array<{ fileName: string; error: string }>
}

export interface MergeConversionProgress {
  currentFile: number
  totalFiles: number
  currentFileName: string
  percentage: number
  status: 'preparing' | 'merging' | 'converting' | 'completed' | 'error'
}

export interface MergeConversionResult {
  success: boolean
  message: string
  outputPath?: string
  totalFiles: number
  error?: string
}

export interface ElectronAPI {
  openFileDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>
  saveFileDialog: (defaultName?: string) => Promise<{ canceled: boolean; filePath?: string }>
  openDirectoryDialog: () => Promise<{ canceled: boolean; filePaths?: string[] }>
  readFile: (filePath: string) => Promise<FileReadResult>
  startConversion: (inputPath: string, outputPath: string, options: ConversionOptions) => Promise<any>
  startBatchConversion: (inputFiles: string[], outputDirectory: string, options: ConversionOptions) => Promise<any>
  startMergeConversion: (inputFiles: string[], outputPath: string, options: ConversionOptions) => Promise<any>
  cancelConversion: () => void
  onConversionProgress: (callback: (progress: ConversionProgress) => void) => void
  onConversionComplete: (callback: (result: ConversionResult) => void) => void
  onConversionError: (callback: (error: string) => void) => void
  onBatchConversionProgress: (callback: (progress: BatchConversionProgress) => void) => void
  onBatchConversionComplete: (callback: (result: BatchConversionResult) => void) => void
  onMergeConversionProgress: (callback: (progress: MergeConversionProgress) => void) => void
  onMergeConversionComplete: (callback: (result: MergeConversionResult) => void) => void
  getAppVersion: () => Promise<string>
  quitApp: () => void
  removeAllListeners: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}