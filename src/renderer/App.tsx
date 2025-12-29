import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FileUpload } from './components/FileUpload'
import { MarkdownPreview } from './components/MarkdownPreview'
import { ConversionOptions } from './components/ConversionOptions'
import { ProgressBar } from './components/ProgressBar'
import { ResultDisplay } from './components/ResultDisplay'
import { ThemeToggle } from './components/ThemeToggle'
import { LanguageToggle } from './components/LanguageToggle'
import { ThemeProvider } from './context/ThemeContext'
import { useFileUpload } from './hooks/useFileUpload'
import { useConversion } from './hooks/useConversion'
import { useBatchConversion } from './hooks/useBatchConversion'
import { useMergeConversion } from './hooks/useMergeConversion'
import { usePreview } from './hooks/usePreview'
import { ConversionOptions as ConversionOptionsType } from './types'
import { FolderOpen, FileText, FileSymlink } from 'lucide-react'

function App() {
  const { t } = useTranslation()
  const {
    selectedFiles,
    isDragging,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    moveFileUp,
    moveFileDown,
    reorderFiles,
  } = useFileUpload()

  const {
    isConverting,
    conversionProgress,
    conversionError,
    conversionResult,
    startConversion,
    cancelConversion,
    resetConversion,
  } = useConversion()

  const {
    isConverting: isBatchConverting,
    batchProgress,
    batchError,
    batchResult,
    startBatchConversion,
    cancelBatchConversion,
    resetBatchConversion,
  } = useBatchConversion()

  const {
    isConverting: isMergeConverting,
    mergeProgress,
    mergeError,
    mergeResult,
    startMergeConversion,
    cancelMergeConversion,
    resetMergeConversion,
  } = useMergeConversion()

  const {
    previewContent,
    selectedFileIndex,
    isCombinedPreview,
    selectFileForPreview,
    toggleCombinedPreview,
  } = usePreview(selectedFiles)

  const [appVersion, setAppVersion] = useState('v1.2.0')

  const [conversionOptions, setConversionOptions] = useState<ConversionOptionsType>({
    fontSize: 12,
    fontFamily: 'Arial',
    lineHeight: 1.5,
    marginTop: 2.54,
    marginBottom: 2.54,
    marginLeft: 3.18,
    marginRight: 3.18,
    orientation: 'portrait',
    generateToc: true,
    referenceStyle: 'apa',
    imageHandling: 'embed',
    codeBlockStyle: 'fenced',
  })

  const handleStartConversion = async () => {
    if (selectedFiles.length === 0) {
      return
    }

    const file = selectedFiles[selectedFileIndex]
    if (!file) {
      return
    }

    try {
      // Generate default docx filename from md filename
      const baseName = file.name.replace(/\.[^/.]+$/, '') // Remove file extension
      const defaultDocxName = `${baseName}.docx`

      // Get output path from save dialog
      const result = await window.electronAPI.saveFileDialog(defaultDocxName)
      if (result.canceled || !result.filePath) {
        return
      }

      await startConversion(file.path || '', result.filePath, conversionOptions)
    } catch (error) {
      console.error('Conversion error:', error)
    }
  }

  const handleStartBatchConversion = async () => {
    if (selectedFiles.length === 0) {
      return
    }

    try {
      // Get output directory from directory dialog
      const result = await window.electronAPI.openDirectoryDialog()
      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return
      }

      const outputDirectory = result.filePaths[0]
      const inputFiles = selectedFiles.map(f => f.path || '').filter(p => p)

      await startBatchConversion(inputFiles, outputDirectory, conversionOptions)
    } catch (error) {
      console.error('Batch conversion error:', error)
    }
  }

  const handleStartMergeConversion = async () => {
    if (selectedFiles.length === 0) {
      return
    }

    try {
      // Generate default docx filename
      const defaultDocxName = 'merged-files.docx'

      // Get output path from save dialog
      const result = await window.electronAPI.saveFileDialog(defaultDocxName)
      if (result.canceled || !result.filePath) {
        return
      }

      const inputFiles = selectedFiles.map(f => f.path || '').filter(p => p)

      await startMergeConversion(inputFiles, result.filePath, conversionOptions)
    } catch (error) {
      console.error('Merge conversion error:', error)
    }
  }

  // Fetch app version from Electron main process
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await window.electronAPI.getAppVersion()
        setAppVersion(version)
      } catch (error) {
        console.error('Failed to fetch app version:', error)
      }
    }
    fetchVersion()
  }, [])

  // App constants
  const APP_TITLE = 'MD to DOCX'

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {APP_TITLE}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('subtitle')}
              </p>
              <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                {appVersion}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - File Upload and Options */}
        <div className="w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-500 flex flex-col">
          {/* File Upload Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <FileUpload
              selectedFiles={selectedFiles}
              isDragging={isDragging}
              isCombinedPreview={isCombinedPreview}
              onFileSelect={handleFileSelect}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onRemoveFile={removeFile}
              onSelectFileForPreview={selectFileForPreview}
              onMoveFileUp={moveFileUp}
              onMoveFileDown={moveFileDown}
              onReorderFiles={reorderFiles}
            />
          </div>

          {/* Conversion Options */}
          <div className="flex-1 p-6 overflow-y-auto">
            <ConversionOptions
              options={conversionOptions}
              onOptionsChange={setConversionOptions}
            />
          </div>

          {/* Conversion Buttons */}
          {selectedFiles.length > 0 && !isBatchConverting && !isMergeConverting && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
              <button
                onClick={handleStartConversion}
                disabled={isConverting}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                {isConverting ? t('common.converting') : t('buttons.convertToDocx')}
              </button>
              {selectedFiles.length > 1 && (
                <>
                  <button
                    onClick={handleStartMergeConversion}
                    disabled={isConverting}
                    className="w-full btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <FileSymlink size={16} />
                    {t('mergeConversion.mergeButton', { count: selectedFiles.length })}
                  </button>
                  <button
                    onClick={handleStartBatchConversion}
                    disabled={isConverting}
                    className="w-full btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <FolderOpen size={16} />
                    {t('batchConversion.batchConvertButton', { count: selectedFiles.length })}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Single Progress Section */}
          {isConverting && conversionProgress && !isBatchConverting && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <ProgressBar
                progress={conversionProgress}
                onCancel={cancelConversion}
              />
            </div>
          )}

          {/* Batch Progress Section */}
          {isBatchConverting && batchProgress && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <FileText size={16} />
                    {t('batchConversion.inProgress')}
                  </h3>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    {batchProgress.currentFile}/{batchProgress.totalFiles}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${batchProgress.percentage}%` }}
                  ></div>
                </div>

                {/* Current File */}
                <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  {t('batchConversion.currentFile')}: {batchProgress.currentFileName || t('progress.preparing')}
                </div>

                {/* Cancel Button */}
                <button
                  onClick={cancelBatchConversion}
                  className="w-full text-xs bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 py-2 rounded-md transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Merge Progress Section */}
          {isMergeConverting && mergeProgress && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                    <FileSymlink size={16} />
                    {t('mergeConversion.inProgress')}
                  </h3>
                  <span className="text-xs text-purple-600 dark:text-purple-400">
                    {mergeProgress.percentage}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-2 mb-3">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${mergeProgress.percentage}%` }}
                  ></div>
                </div>

                {/* Status */}
                <div className="text-xs text-purple-700 dark:text-purple-300 mb-2">
                  {t('mergeConversion.status')}: {mergeProgress.status}
                </div>

                {/* Cancel Button */}
                <button
                  onClick={cancelMergeConversion}
                  className="w-full text-xs bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 text-purple-800 dark:text-purple-200 py-2 rounded-md transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {conversionError && !isBatchConverting && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('errors.conversionError')}
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {conversionError}
                </p>
              </div>
            </div>
          )}

          {/* Batch Error Display */}
          {batchError && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('errors.batchConversionError')}
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {batchError}
                </p>
                <button
                  onClick={resetBatchConversion}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          )}

          {/* Merge Error Display */}
          {mergeError && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('errors.mergeConversionError')}
                </h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                  {mergeError}
                </p>
                <button
                  onClick={resetMergeConversion}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-500">
          {/* Preview Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t('common.preview')}
              </h2>
              {selectedFiles.length > 0 && !isCombinedPreview && (
                <select
                  value={selectedFileIndex}
                  onChange={(e) => selectFileForPreview(Number(e.target.value))}
                  className="block w-48 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {selectedFiles.map((file, index) => (
                    <option key={index} value={index}>
                      {file.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Preview Content */}
          <div className="flex-1 overflow-hidden">
            <MarkdownPreview
              content={previewContent}
              options={conversionOptions}
              selectedFiles={selectedFiles}
              isCombinedPreview={isCombinedPreview}
              onToggleCombinedPreview={toggleCombinedPreview}
            />
          </div>
        </div>
      </main>

      {/* Single Conversion Result Display */}
      {conversionResult && !isBatchConverting && (
        <ResultDisplay
          result={conversionResult}
          onClose={resetConversion}
        />
      )}

      {/* Batch Conversion Result Display */}
      {batchResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  batchResult.success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  <FileText className={batchResult.success ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'} size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {batchResult.success ? '일괄 변환 완료' : '일괄 변환 부분 완료'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {batchResult.message}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">총 파일:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{batchResult.totalFiles}개</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">변환 완료:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{batchResult.processedFiles}개</span>
                </div>
                {batchResult.errors.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">실패:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{batchResult.errors.length}개</span>
                  </div>
                )}
              </div>

              {batchResult.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">실패한 파일:</h4>
                  <ul className="space-y-1">
                    {batchResult.errors.map((error, index) => (
                      <li key={index} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded">
                        {error.fileName}: {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={resetBatchConversion}
                className="w-full btn btn-primary"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Conversion Result Display */}
      {mergeResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  mergeResult.success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  <FileSymlink className={mergeResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {mergeResult.success ? t('mergeConversion.success') : t('mergeConversion.failed')}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mergeResult.message}
                  </p>
                </div>
              </div>

              {mergeResult.success && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">병합 파일:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{mergeResult.totalFiles}개</span>
                  </div>
                </div>
              )}

              <button
                onClick={resetMergeConversion}
                className="w-full btn btn-primary"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

export default AppWrapper
