import React from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { ConversionOptions as ConversionOptionsType, FileItem } from '../types'

interface MarkdownPreviewProps {
  content: string
  options: ConversionOptionsType
  selectedFiles?: FileItem[]
  isCombinedPreview?: boolean
  onToggleCombinedPreview?: () => void
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  options,
  selectedFiles = [],
  isCombinedPreview = false,
  onToggleCombinedPreview,
}) => {
  const { t } = useTranslation()
  // Apply styles based on options
  const previewStyle = React.useMemo(() => ({
    fontFamily: options.fontFamily || 'Arial, sans-serif',
    fontSize: `${options.fontSize || 12}pt`,
    lineHeight: options.lineHeight || 1.5,
  }), [options.fontFamily, options.fontSize, options.lineHeight])

  if (!content) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">📄</span>
          </div>
          <p>{t('preview.noFile')}</p>
          <p className="text-sm mt-1">{t('preview.selectFile')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-500 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-500">{t('common.preview')}</span>
        {selectedFiles.length > 1 && (
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={isCombinedPreview}
              onChange={onToggleCombinedPreview}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            {t('preview.combined')}
          </label>
        )}
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-400">
          <div
            className="markdown-preview max-w-4xl mx-auto py-8 px-6"
            style={previewStyle}
          >
            <ReactMarkdown
              components={{
                // Custom components for better rendering
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-200 dark:border-gray-400">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 dark:text-gray-300 mb-4" style={{ lineHeight: `${options.lineHeight}` }}>
                    {children}
                  </p>
                ),
                code: ({ className, children }) => {
                  const isInline = !className?.includes('language-')
                  if (isInline) {
                    return (
                      <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400">
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className="block bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 p-4 rounded-lg overflow-x-auto text-sm">
                      {children}
                    </code>
                  )
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 dark:text-gray-200 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 mb-4">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="mb-4 pl-6 list-disc">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-4 pl-6 list-decimal">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="mb-1">
                    {children}
                  </li>
                ),
                table: ({ children }) => (
                  <table className="w-full border-collapse border border-gray-300 mb-4">
                    {children}
                  </table>
                ),
                thead: ({ children }) => (
                  <thead>
                    {children}
                  </thead>
                ),
                tbody: ({ children }) => (
                  <tbody>
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => (
                  <tr>
                    {children}
                  </tr>
                ),
                th: ({ children }) => (
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left bg-gray-100 dark:bg-gray-700 font-semibold">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                    {children}
                  </td>
                ),
                a: ({ href, children }) => (
                  <a 
                    href={href} 
                    className="text-primary-600 hover:text-primary-700 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <img 
                    src={src} 
                    alt={alt || ''} 
                    className="max-w-full h-auto rounded-lg shadow-sm my-4"
                    loading="lazy"
                  />
                ),
                hr: () => (
                  <hr className="border-gray-300 dark:border-gray-600 my-6" />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
    </div>
  )
}