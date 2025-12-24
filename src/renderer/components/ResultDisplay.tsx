import React from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, AlertCircle, Download, X, FolderOpen } from 'lucide-react'
import { ConversionResult } from '../types'

interface ResultDisplayProps {
  result: ConversionResult
  onClose: () => void
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onClose }) => {
  const { t } = useTranslation()
  const { success, message, outputPath, processedFiles, errors } = result

  const handleOpenOutputFolder = async () => {
    if (outputPath && window.electronAPI) {
      try {
        // Show the output file in file manager
        const result = await window.electronAPI.saveFileDialog()
        if (!result.canceled && result.filePath) {
          // In a real implementation, you would open the folder containing the file
          console.log('Output folder would be opened:', result.filePath)
        }
      } catch (error) {
        console.error('Error opening output folder:', error)
      }
    }
  }

  const handleDownloadFile = () => {
    if (outputPath) {
      // Create a download link for the converted file
      const link = document.createElement('a')
      link.href = `file://${outputPath}`
      link.download = outputPath.split('/').pop() || 'converted.docx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('resultDisplay.title')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Icon and Message */}
          <div className="flex items-center space-x-3 mb-6">
            {success ? (
              <CheckCircle size={24} className="text-green-500 dark:text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle size={24} className="text-red-500 dark:text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-medium ${
                success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {success ? t('resultDisplay.conversionSuccess') : t('resultDisplay.conversionFailed')}
              </h3>
              <p className={`text-sm mt-1 ${
                success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {message}
              </p>
            </div>
          </div>

          {/* Success Details */}
          {success && processedFiles && processedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('resultDisplay.processedFiles')}
                </h4>
                <ul className="space-y-1">
                  {processedFiles.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {file}
                    </li>
                  ))}
                </ul>
              </div>

              {outputPath && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        {t('resultDisplay.outputFile')}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        {outputPath.split('/').pop()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleOpenOutputFolder}
                        className="btn btn-secondary flex items-center space-x-1"
                        title={t('common.openFolder')}
                      >
                        <FolderOpen size={16} />
                        <span>{t('common.folder')}</span>
                      </button>
                      <button
                        onClick={handleDownloadFile}
                        className="btn btn-primary flex items-center space-x-1"
                        title={t('common.download')}
                      >
                        <Download size={16} />
                        <span>{t('common.download')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Details */}
          {!success && errors && errors.length > 0 && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  {t('resultDisplay.errorDetails')}
                </h4>
                <ul className="space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700 dark:text-red-300">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}