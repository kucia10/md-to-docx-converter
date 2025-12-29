import { useState, useCallback, useEffect } from 'react'
import { FileItem } from '../types'

export const usePreview = (selectedFiles: FileItem[]) => {
  const [previewContent, setPreviewContent] = useState('')
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [isCombinedPreview, setIsCombinedPreview] = useState(false)

  useEffect(() => {
    if (isCombinedPreview) {
      // Combined preview mode: concatenate all file contents
      const combinedContent = selectedFiles.map((file, index) => {
        const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove file extension
        const content = file.content || ''
        return index > 0 
          ? `\n\n---\n\n# ${fileName}\n\n${content}`
          : content
      }).join('\n\n')
      setPreviewContent(combinedContent)
    } else {
      // Single file preview mode
      if (selectedFiles.length > 0 && selectedFileIndex >= 0 && selectedFileIndex < selectedFiles.length) {
        const currentFile = selectedFiles[selectedFileIndex]
        setPreviewContent(currentFile.content || '')
      } else {
        setPreviewContent('')
      }
    }
  }, [selectedFiles, selectedFileIndex, isCombinedPreview])

  // Focus on last added file when new files are added via file dialog
  useEffect(() => {
    if (selectedFiles.length > 0 && !isCombinedPreview) {
      setSelectedFileIndex(selectedFiles.length - 1)
    }
  }, [selectedFiles.length, isCombinedPreview])

  const selectFileForPreview = useCallback((index: number) => {
    if (index >= 0 && index < selectedFiles.length) {
      setSelectedFileIndex(index)
    }
  }, [selectedFiles.length])

  const toggleCombinedPreview = useCallback(() => {
    setIsCombinedPreview(prev => !prev)
  }, [])

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
    isCombinedPreview,
    selectFileForPreview,
    toggleCombinedPreview,
    selectNextFile,
    selectPreviousFile,
    getCurrentFile,
  }
}