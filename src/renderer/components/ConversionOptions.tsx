import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ConversionOptions as ConversionOptionsType } from '../types'

interface ConversionOptionsProps {
  options: ConversionOptionsType
  onOptionsChange: (options: ConversionOptionsType) => void
}

export const ConversionOptions: React.FC<ConversionOptionsProps> = ({ options, onOptionsChange }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)

  const updateOption = <K extends keyof ConversionOptionsType>(
    key: K,
    value: ConversionOptionsType[K]
  ) => {
    onOptionsChange({ ...options, [key]: value })
  }

  const fontFamilies = [
    'Arial',
    'Times New Roman',
    'Calibri',
    'Helvetica',
    'Georgia',
    'Verdana',
    'Cambria',
  ]

  // Set default values if not set
  React.useEffect(() => {
    const hasDefaults = options.fontFamily && options.fontSize && options.lineHeight &&
                      options.marginTop && options.marginBottom && options.marginLeft &&
                      options.marginRight && options.orientation
    
    if (!hasDefaults) {
      onOptionsChange({
        ...options,
        fontFamily: options.fontFamily || 'Georgia',
        fontSize: options.fontSize || 14,
        lineHeight: options.lineHeight || 1.5,
        marginTop: options.marginTop || 2.54,
        marginBottom: options.marginBottom || 2.54,
        marginLeft: options.marginLeft || 3.18,
        marginRight: options.marginRight || 3.18,
        orientation: options.orientation || 'portrait',
        generateToc: options.generateToc ?? true,
        referenceStyle: options.referenceStyle || 'chicago',
      })
    }
  }, [options, onOptionsChange])

  const referenceStyles = [
    { value: 'apa', label: 'APA' },
    { value: 'mla', label: 'MLA' },
    { value: 'chicago', label: 'Chicago' },
    { value: 'harvard', label: 'Harvard' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('conversionOptions.title')}</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Document Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
              {t('conversionOptions.documentSettings')}
            </h3>

            {/* Font Family */}
            <div>
              <label className="form-label">{t('conversionOptions.font')}</label>
              <select
                value={options.fontFamily}
                onChange={(e) => updateOption('fontFamily', e.target.value)}
                className="form-input"
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="form-label">{t('conversionOptions.fontSize')}</label>
              <input
                type="number"
                min="8"
                max="72"
                value={options.fontSize}
                onChange={(e) => updateOption('fontSize', parseInt(e.target.value))}
                className="form-input"
              />
            </div>

            {/* Line Height */}
            <div>
              <label className="form-label">{t('conversionOptions.lineHeight')}</label>
              <input
                type="number"
                min="0.5"
                max="3.0"
                step="0.1"
                value={options.lineHeight}
                onChange={(e) => updateOption('lineHeight', parseFloat(e.target.value))}
                className="form-input"
              />
            </div>

            {/* Orientation */}
            <div>
              <label className="form-label">{t('conversionOptions.pageOrientation')}</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="portrait"
                    checked={options.orientation === 'portrait'}
                    onChange={(e) => updateOption('orientation', e.target.value as 'portrait' | 'landscape')}
                    className="mr-2"
                  />
                  {t('conversionOptions.portrait')}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="landscape"
                    checked={options.orientation === 'landscape'}
                    onChange={(e) => updateOption('orientation', e.target.value as 'portrait' | 'landscape')}
                    className="mr-2"
                  />
                  {t('conversionOptions.landscape')}
                </label>
              </div>
            </div>
          </div>

          {/* Page Margins */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
              {t('conversionOptions.pageMargins')}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">{t('conversionOptions.top')}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={options.marginTop}
                  onChange={(e) => updateOption('marginTop', parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">{t('conversionOptions.bottom')}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={options.marginBottom}
                  onChange={(e) => updateOption('marginBottom', parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">{t('conversionOptions.left')}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={options.marginLeft}
                  onChange={(e) => updateOption('marginLeft', parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">{t('conversionOptions.right')}</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={options.marginRight}
                  onChange={(e) => updateOption('marginRight', parseFloat(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 pb-2">
              {t('conversionOptions.advancedOptions')}
            </h3>

            {/* Generate Table of Contents */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="generate-toc"
                checked={options.generateToc}
                onChange={(e) => updateOption('generateToc', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="generate-toc" className="text-sm text-gray-700 dark:text-gray-300">
                {t('conversionOptions.generateToc')}
              </label>
              <span className="text-xs text-gray-500 ml-2">{t('conversionOptions.defaultValueEnabled')}</span>
            </div>

            {/* Reference Style */}
            <div>
              <label className="form-label">{t('conversionOptions.referenceStyle')}</label>
              <select
                value={options.referenceStyle}
                onChange={(e) => updateOption('referenceStyle', e.target.value as any)}
                className="form-input"
              >
                {referenceStyles.map(style => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                    {style.value === 'chicago' && ` (${t('conversionOptions.defaultValue')})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Handling */}
            <div>
              <label className="form-label">{t('conversionOptions.imageHandling')}</label>
              <select
                value={options.imageHandling}
                onChange={(e) => updateOption('imageHandling', e.target.value as any)}
                className="form-input"
              >
                <option value="embed">{t('conversionOptions.embed')}</option>
                <option value="link">{t('conversionOptions.link')}</option>
              </select>
            </div>

            {/* Code Block Style */}
            <div>
              <label className="form-label">{t('conversionOptions.codeBlockStyle')}</label>
              <select
                value={options.codeBlockStyle}
                onChange={(e) => updateOption('codeBlockStyle', e.target.value as any)}
                className="form-input"
              >
                <option value="fenced">{t('conversionOptions.fenced')}</option>
                <option value="indented">{t('conversionOptions.indented')}</option>
              </select>
            </div>
          </div>

          {/* Current Options Summary */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('conversionOptions.currentSettings')}</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>{t('conversionOptions.summary', {
                font: options.fontFamily,
                size: options.fontSize,
                lineHeight: options.lineHeight,
                orientation: t(`conversionOptions.${options.orientation}`),
                top: options.marginTop,
                bottom: options.marginBottom,
                left: options.marginLeft,
                right: options.marginRight,
                toc: options.generateToc ? t('common.yes') : t('common.no'),
                ref: options.referenceStyle?.toUpperCase()
              })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}