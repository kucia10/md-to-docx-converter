import { useTranslation } from 'react-i18next'
import { Languages, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { SUPPORTED_LANGUAGES } from '../i18n'

const LANGUAGE_LABELS: Record<string, string> = {
  'ko': '한국어',
  'en': 'English',
  'ja': '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'es': 'Español',
  'fr': 'Français',
  'de': 'Deutsch',
  'it': 'Italiano',
  'pt-BR': 'Português',
  'ru': 'Русский',
  'ar': 'العربية'
}

export function LanguageToggle() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
    setIsOpen(false)
  }

  const getCurrentLabel = () => {
    return LANGUAGE_LABELS[i18n.language] || i18n.language
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Languages size={18} />
        <span className="text-sm font-medium">{getCurrentLabel()}</span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => changeLanguage(lang)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between
                ${i18n.language === lang
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
            >
              <span>{LANGUAGE_LABELS[lang]}</span>
              {i18n.language === lang && <span className="text-primary-600 dark:text-primary-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}