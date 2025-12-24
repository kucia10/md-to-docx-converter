import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ConversionOptions, ConversionProgress, ConversionResult } from '../types'

export const useConversion = () => {
  const { t } = useTranslation()
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState<ConversionProgress | null>(null)
  const [conversionError, setConversionError] = useState<string | null>(null)
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null)

  useEffect(() => {
    // Set up IPC event listeners
    if (window.electronAPI) {
      window.electronAPI.onConversionProgress((progress: ConversionProgress) => {
        setConversionProgress(progress)
      })

      window.electronAPI.onConversionComplete((result: ConversionResult) => {
        setIsConverting(false)
        setConversionProgress(null)
        setConversionResult(result)
        setConversionError(null)
      })

      window.electronAPI.onConversionError((error: string) => {
        setIsConverting(false)
        setConversionProgress(null)
        setConversionError(error)
      })
    }

    // Cleanup
    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners()
      }
    }
  }, [])

  const startConversion = useCallback(async (
    inputPath: string,
    outputPath: string,
    options: ConversionOptions
  ) => {
    try {
      setIsConverting(true)
      setConversionError(null)
      setConversionResult(null)
      setConversionProgress({
        currentFile: 0,
        totalFiles: 1,
        currentFileName: '',
        percentage: 0,
        stage: 'preparing'
      })

      await window.electronAPI.startConversion(inputPath, outputPath, options)
    } catch (error) {
      setIsConverting(false)
      setConversionProgress(null)
      setConversionError(error instanceof Error ? error.message : t('errors.singleConversionError'))
    }
  }, [])

  const cancelConversion = useCallback(() => {
    if (isConverting) {
      window.electronAPI.cancelConversion()
      setIsConverting(false)
      setConversionProgress(null)
      setConversionError(t('errors.conversionCanceled'))
    }
  }, [isConverting])

  const resetConversion = useCallback(() => {
    setIsConverting(false)
    setConversionProgress(null)
    setConversionError(null)
    setConversionResult(null)
  }, [])

  return {
    isConverting,
    conversionProgress,
    conversionError,
    conversionResult,
    startConversion,
    cancelConversion,
    resetConversion,
  }
}