import React from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, FileText, X, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { FileItem, FileReadResult } from '../types'

interface FileUploadProps {
  selectedFiles: FileItem[]
  isDragging: boolean
  isCombinedPreview?: boolean
  onFileSelect: (files: FileList | null, paths?: string[]) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onRemoveFile: (fileId: string) => void
  onSelectFileForPreview?: (index: number) => void
  onMoveFileUp?: (fileId: string) => void
  onMoveFileDown?: (fileId: string) => void
  onReorderFiles?: (sourceIndex: number, destinationIndex: number) => void
}

export const FileUpload: React.FC<FileUploadProps> = ({
  selectedFiles,
  isDragging,
  isCombinedPreview = false,
  onFileSelect,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onSelectFileForPreview,
  onMoveFileUp,
  onMoveFileDown,
  onReorderFiles,
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onReorderFiles) return
    
    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index
    
    onReorderFiles(sourceIndex, destinationIndex)
  }

  return (
    <div className="space-y-4">
     
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('fileUpload.title')}</h2>
        {!isCombinedPreview && (
          <button
            onClick={handleOpenFileDialog}
            className="btn btn-primary flex items-center gap-2"
          >
            <Upload size={16} />
            {t('common.selectFile')}
          </button>
        )}
      </div>

      {/* Drop Area - Hide when combined preview is active */}
      <div
        className={`${!isCombinedPreview ? '' : 'hidden'} file-upload-area ${isDragging ? 'dragging' : ''}`}
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('fileUpload.selectedFiles', { count: selectedFiles.length })}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('fileUpload.dragToReorder')}
            </span>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="file-list">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`max-h-64 overflow-y-auto space-y-2 ${snapshot.isDraggingOver ? 'bg-gray-50 dark:bg-gray-700/50 rounded-lg' : ''}`}
                >
                  {selectedFiles.map((file, index) => (
                    <Draggable
                      key={file.id}
                      draggableId={file.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors group ${
                            snapshot.isDragging ? 'ring-2 ring-primary-500 shadow-lg' : ''
                          }`}
                          onClick={() => {
                            if (!snapshot.isDragging && onSelectFileForPreview) {
                              onSelectFileForPreview(index)
                            }
                          }}
                        >
                          <GripVertical size={16} className="text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0" />
                          <div className="flex items-center space-x-3 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
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
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (onMoveFileUp) onMoveFileUp(file.id)
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title={t('fileUpload.moveUp')}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (onMoveFileDown) onMoveFileDown(file.id)
                              }}
                              disabled={index === selectedFiles.length - 1}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title={t('fileUpload.moveDown')}
                            >
                              <ChevronDown size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveFile(file.id)
                              }}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                              title={t('fileUpload.removeFile')}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}
    </div>
  )
}