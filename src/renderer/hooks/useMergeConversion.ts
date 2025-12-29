import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ConversionOptions, MergeConversionProgress, MergeConversionResult } from '../types'

export const useMergeConversion = () => {
  const { t } = useTranslation()
  const [isConverting, setIsConverting] = useState(false)
  const [mergeProgress, setMergeProgress] = useState<MergeConversionProgress | null>(null)
  const [mergeError, setMergeError] = useState<string | null>(null)
  const [mergeResult, setMergeResult] = useState<MergeConversionResult | null>(null)

  useEffect(() => {
    // Set up IPC event listeners for merge conversion
    if (window.electronAPI) {
      window.electronAPI.onMergeConversionProgress((progress: MergeConversionProgress) => {
        setMergeProgress(progress)
      })

      window.electronAPI.onMergeConversionComplete((result: MergeConversionResult) => {
        setIsConverting(false)
        setMergeProgress(null)
        setMergeResult(result)
        setMergeError(null)
      })
    }

    // Cleanup
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners()
      }
    }
  }, [])

  const startMergeConversion = useCallback(async (
    inputFiles: string[],
    outputPath: string,
    options: ConversionOptions
  ) => {
    try {
      setIsConverting(true)
      setMergeError(null)
      setMergeResult(null)
      setMergeProgress({
        currentFile: 0,
        totalFiles: inputFiles.length,
        currentFileName: '',
        percentage: 0,
        status: 'preparing'
      })

      await window.electronAPI.startMergeConversion(inputFiles, outputPath, options)
    } catch (error) {
      setIsConverting(false)
      setMergeProgress(null)
      setMergeError(error instanceof Error ? error.message : t('errors.generalConversionError'))
    }
  }, [t])

  const cancelMergeConversion = useCallback(() => {
    if (isConverting) {
      window.electronAPI.cancelConversion()
      setIsConverting(false)
      setMergeProgress(null)
      setMergeError(t('errors.mergeConversionCanceled'))
    }
  }, [isConverting, t])

  const resetMergeConversion = useCallback(() => {
    setIsConverting(false)
    setMergeProgress(null)
    setMergeError(null)
    setMergeResult(null)
  }, [])

  return {
    isConverting,
    mergeProgress,
    mergeError,
    mergeResult,
    startMergeConversion,
    cancelMergeConversion,
    resetMergeConversion,
  }
}