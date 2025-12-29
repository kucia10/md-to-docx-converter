import { useState, useCallback } from 'react'
import { FileItem } from '../types'

export const useFileUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file, 'utf-8')
    })
  }

  const createFileItem = async (file: File, path: string): Promise<FileItem> => {
    const content = await readFileContent(file)
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      path: path,
      size: file.size,
      lastModified: file.lastModified,
      content: content,
    }
  }

  const handleFileSelect = useCallback(async (files: FileList | null, paths?: string[]) => {
    if (!files || files.length === 0) return

    const newFiles: FileItem[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const path = paths?.[i] || file.name
      try {
        const fileItem = await createFileItem(file, path)
        newFiles.push(fileItem)
      } catch (error) {
        console.error('Error reading file:', file.name, error)
      }
    }

    setSelectedFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const removeFile = useCallback((fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId))
  }, [])

  const moveFileUp = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const index = prev.findIndex(file => file.id === fileId)
      if (index <= 0) return prev
      const newFiles = [...prev]
      ;[newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]]
      return newFiles
    })
  }, [])

  const moveFileDown = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const index = prev.findIndex(file => file.id === fileId)
      if (index === -1 || index >= prev.length - 1) return prev
      const newFiles = [...prev]
      ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
      return newFiles
    })
  }, [])

  const reorderFiles = useCallback((sourceIndex: number, destinationIndex: number) => {
    setSelectedFiles(prev => {
      if (sourceIndex === destinationIndex) return prev
      const newFiles = [...prev]
      const [removed] = newFiles.splice(sourceIndex, 1)
      newFiles.splice(destinationIndex, 0, removed)
      return newFiles
    })
  }, [])

  const clearFiles = useCallback(() => {
    setSelectedFiles([])
  }, [])

  return {
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
    clearFiles,
  }
}