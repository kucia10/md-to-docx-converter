import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ConversionOptions, BatchConversionProgress, BatchConversionResult } from '../types'

export const useBatchConversion = () => {
  const { t } = useTranslation()
  const [isConverting, setIsConverting] = useState(false)
  const [batchProgress, setBatchProgress] = useState<BatchConversionProgress | null>(null)
  const [batchError, setBatchError] = useState<string | null>(null)
  const [batchResult, setBatchResult] = useState<BatchConversionResult | null>(null)

  useEffect(() => {
    // Set up IPC event listeners for batch conversion
    if (window.electronAPI) {
      window.electronAPI.onBatchConversionProgress((progress: BatchConversionProgress) => {
        setBatchProgress(progress)
      })

      window.electronAPI.onBatchConversionComplete((result: BatchConversionResult) => {
        setIsConverting(false)
        setBatchProgress(null)
        setBatchResult(result)
        setBatchError(null)
      })
    }

    // Cleanup
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners()
      }
    }
  }, [])

  const startBatchConversion = useCallback(async (
    inputFiles: string[],
    outputDirectory: string,
    options: ConversionOptions
  ) => {
    try {
      setIsConverting(true)
      setBatchError(null)
      setBatchResult(null)
      setBatchProgress({
        currentFile: 0,
        totalFiles: inputFiles.length,
        currentFileName: '',
        percentage: 0,
        status: 'converting',
        processedFiles: [],
        errors: []
      })

      await window.electronAPI.startBatchConversion(inputFiles, outputDirectory, options)
    } catch (error) {
      setIsConverting(false)
      setBatchProgress(null)
      setBatchError(error instanceof Error ? error.message : t('errors.generalConversionError'))
    }
  }, [])

  const cancelBatchConversion = useCallback(() => {
    if (isConverting) {
      window.electronAPI.cancelConversion()
      setIsConverting(false)
      setBatchProgress(null)
      setBatchError(t('errors.batchConversionCanceled'))
    }
  }, [isConverting])

  const resetBatchConversion = useCallback(() => {
    setIsConverting(false)
    setBatchProgress(null)
    setBatchError(null)
    setBatchResult(null)
  }, [])

  return {
    isConverting,
    batchProgress,
    batchError,
    batchResult,
    startBatchConversion,
    cancelBatchConversion,
    resetBatchConversion,
  }
}