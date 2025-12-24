import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ko from './locales/ko.json'
import en from './locales/en.json'
import ja from './locales/ja.json'
import zhCN from './locales/zh-CN.json'
import zhTW from './locales/zh-TW.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import it from './locales/it.json'
import ptBR from './locales/pt-BR.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'

// Supported languages
const SUPPORTED_LANGUAGES = [
  'ko', 'en', 'ja', 'zh-CN', 'zh-TW',
  'es', 'fr', 'de', 'it', 'pt-BR', 'ru', 'ar'
]

// Get system language or fallback to Korean
const getInitialLanguage = (): string => {
  const savedLang = localStorage.getItem('language')
  if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
    return savedLang
  }
  
  const systemLang = navigator.language.split('-')[0]
  
  // Map common language codes
  const langMap: Record<string, string> = {
    'zh': 'zh-CN',
    'en': 'en',
    'ja': 'ja',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'pt': 'pt-BR',
    'ru': 'ru',
    'ar': 'ar'
  }
  
  // Check exact match
  if (SUPPORTED_LANGUAGES.includes(systemLang)) {
    return systemLang
  }
  
  // Check mapped languages
  if (langMap[systemLang]) {
    return langMap[systemLang]
  }
  
  // Fallback to Korean
  return 'ko'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en },
      ja: { translation: ja },
      'zh-CN': { translation: zhCN },
      'zh-TW': { translation: zhTW },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it },
      'pt-BR': { translation: ptBR },
      ru: { translation: ru },
      ar: { translation: ar }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false
    }
  })

export { SUPPORTED_LANGUAGES }
export default i18n