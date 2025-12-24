import { useState, useCallback, useEffect } from 'react'
import { FileItem } from '../types'

export const usePreview = (selectedFiles: FileItem[]) => {
  const [previewContent, setPreviewContent] = useState('')
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)

  useEffect(() => {
    // Update preview content when selected file changes
    if (selectedFiles.length > 0 && selectedFileIndex >= 0 && selectedFileIndex < selectedFiles.length) {
      const currentFile = selectedFiles[selectedFileIndex]
      setPreviewContent(currentFile.content || '')
    } else {
      setPreviewContent('')
    }
  }, [selectedFiles, selectedFileIndex])

  // Focus on the last added file when new files are added via file dialog
  useEffect(() => {
    if (selectedFiles.length > 0) {
      setSelectedFileIndex(selectedFiles.length - 1)
    }
  }, [selectedFiles.length])

  const selectFileForPreview = useCallback((index: number) => {
    if (index >= 0 && index < selectedFiles.length) {
      setSelectedFileIndex(index)
    }
  }, [selectedFiles.length])

  const selectNextFile = useCallback(() => {
    if (selectedFileIndex < selectedFiles.length - 1) {
      setSelectedFileIndex(prev => prev + 1)
    }
  }, [selectedFileIndex, selectedFiles.length])

  const selectPreviousFile = useCallback(() => {
    if (selectedFileIndex > 0) {
      setSelectedFileIndex(prev => prev - 1)
    }
  }, [selectedFileIndex])

  const getCurrentFile = useCallback(() => {
    return selectedFiles[selectedFileIndex] || null
  }, [selectedFiles, selectedFileIndex])

  return {
    previewContent,
    selectedFileIndex,
    selectFileForPreview,
    selectNextFile,
    selectPreviousFile,
    getCurrentFile,
  }
}