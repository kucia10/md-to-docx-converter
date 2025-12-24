import React from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FileText, X } from 'lucide-react'
import { FileItem, FileReadResult } from '../types'

interface FileUploadProps {
  selectedFiles: FileItem[]
  isDragging: boolean
  onFileSelect: (files: FileList | null, paths?: string[]) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onRemoveFile: (fileId: string) => void
  onSelectFileForPreview?: (index: number) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
  selectedFiles,
  isDragging,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onSelectFileForPreview,
}) => {
  const { t } = useTranslation()
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files)
  }

  const handleOpenFileDialog = async () => {
    console.log('[FileUpload] File dialog button clicked')
    try {
      if (window.electronAPI) {
        console.log('[FileUpload] electronAPI is available, invoking openFileDialog')
        const result = await window.electronAPI.openFileDialog()
        console.log('[FileUpload] Dialog result:', result)
        
        if (!result.canceled && result.filePaths.length > 0) {
          console.log('[FileUpload] Files selected:', result.filePaths)
          
          // Read file contents via IPC
          const fileDataList: FileReadResult[] = await Promise.all(
            result.filePaths.map(async (filePath: string) => {
              const fileData = await window.electronAPI.readFile(filePath)
              return fileData
            })
          )
          
          // Create a DataTransfer to build FileList-like structure
          const dataTransfer = new DataTransfer()
          fileDataList.forEach((fileData: FileReadResult) => {
            const blob = new Blob([fileData.content], { type: 'text/markdown' })
            const file = new File([blob], fileData.name, {
              type: 'text/markdown',
              lastModified: fileData.lastModified
            })
            dataTransfer.items.add(file)
          })
          
          onFileSelect(dataTransfer.files, result.filePaths)
        } else {
          console.log('[FileUpload] Dialog was canceled or no files selected')
        }
      } else {
        console.error('[FileUpload] electronAPI is not available')
      }
    } catch (error) {
      console.error('[FileUpload] Error opening file dialog:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('fileUpload.title')}</h2>
        <button
          onClick={handleOpenFileDialog}
          className="btn btn-primary flex items-center gap-2"
        >
          <Upload size={16} />
          {t('common.selectFile')}
        </button>
      </div>

      {/* Drop Area */}
      <div
        className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <Upload size={48} className="text-gray-400 dark:text-gray-600" />
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              {t('fileUpload.dragDropHint')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('fileUpload.supportedFormats')}
            </p>
          </div>
          <button
            onClick={handleOpenFileDialog}
            className="btn btn-secondary"
          >
            {t('common.selectFile')}
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        multiple
        accept=".md,.markdown"
        onChange={handleFileInputChange}
        className="hidden"
        id="file-input"
      />
      <label htmlFor="file-input" className="sr-only">
        {t('common.selectFile')}
      </label>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('fileUpload.selectedFiles', { count: selectedFiles.length })}
          </h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                onClick={() => {
                  const index = selectedFiles.findIndex(f => f.id === file.id)
                  if (index !== -1 && onSelectFileForPreview) {
                    onSelectFileForPreview(index)
                  }
                }}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFile(file.id)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title={t('fileUpload.removeFile')}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}