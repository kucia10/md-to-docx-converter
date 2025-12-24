import React from 'react'
import { useTranslation } from 'react-i18next'
import { X, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { ConversionProgress } from '../types'

interface ProgressBarProps {
  progress: ConversionProgress
  onCancel: () => void
}

const getStageText = (stage: ConversionProgress['stage'], t: any): string => {
  switch (stage) {
    case 'preparing':
      return t('progress.preparing')
    case 'converting':
      return t('progress.converting')
    case 'finalizing':
      return t('progress.finalizing')
    case 'completed':
      return t('progress.completed')
    case 'error':
      return t('progress.errorOccurred')
  }
}

const getStageIcon = (stage: ConversionProgress['stage']) => {
  switch (stage) {
    case 'preparing':
    case 'converting':
    case 'finalizing':
      return <Clock size={16} className="animate-spin" />
    case 'completed':
      return <CheckCircle size={16} className="text-green-500" />
    case 'error':
      return <AlertCircle size={16} className="text-red-500" />
  }
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, onCancel }) => {
  const { t } = useTranslation()
  const { currentFile, totalFiles, currentFileName, percentage, stage } = progress
  const isCompleted = stage === 'completed'
  const isError = stage === 'error'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStageIcon(stage)}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStageText(stage, t)}
          </span>
        </div>
        
        {!isCompleted && !isError && (
          <button
            onClick={onCancel}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title={t('common.cancel')}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {totalFiles > 1 ? t('progress.fileProgress', { current: currentFile, total: totalFiles }) : t('progress.progressRate')}
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {percentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted 
                ? 'bg-green-500' 
                : isError 
                  ? 'bg-red-500'
                  : 'bg-primary-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Current File Info */}
      {currentFileName && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{t('progress.currentFile')}:</span> {currentFileName}
        </div>
      )}

      {/* Detailed Status */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex justify-between">
          <span>{t('progress.stage')}:</span>
          <span className="font-medium">{getStageText(stage, t)}</span>
        </div>
        
        {totalFiles > 1 && (
          <div className="flex justify-between">
            <span>{t('progress.fileProgress', { current: currentFile, total: totalFiles }).replace(/ Files/g, '')}:</span>
            <span className="font-medium">{currentFile} / {totalFiles}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>{t('progress.overallProgress')}:</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      </div>

      {/* Time Estimation (only during conversion) */}
      {stage === 'converting' && percentage > 0 && percentage < 100 && (
        <div className="text-xs text-gray-500">
          <span>{t('progress.estimatedTime')} </span>
          <span className="font-medium">
            {t('progress.seconds', { count: Math.round((100 - percentage) * 0.5) })}
          </span>
        </div>
      )}

      {/* Completion Message */}
      {isCompleted && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {t('progress.conversionSuccess')}
            </span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              {t('progress.conversionError')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}