# LanguageToggle Component

## Summary
- **Responsibility**: Application language change UI (dropdown)
- **Main Users/Callers**: [`App.tsx`](../../../src/renderer/App.tsx)
- **Key Entry Point**: [`LanguageToggle`](../../../src/renderer/components/LanguageToggle.tsx:21) component

## Location in Architecture
- **Layer**: Renderer Process - UI Component
- **Upstream/Downstream Dependencies**:
  - **Upstream**: [`App.tsx`](../../../src/renderer/App.tsx)
  - **Downstream**: [`i18n.ts`](../../../src/renderer/i18n.ts) (`SUPPORTED_LANGUAGES`), `react-i18next`
- **Role in Runtime Flow**: User language selection → i18n language change → Update UI

## Public Interface

### LanguageToggle
- **Type**: `() => JSX.Element`
- **Description**: Language change dropdown button component

## Internal Behavior

### Major Flows
1. **Dropdown Toggle**: Click button to show/hide dropdown
2. **Language Change**: Click language option to change language
3. **Close on Select**: Close dropdown when language selected

### Key Rules/Algorithms
- **Current Language Highlight**: Highlight currently selected language
- **Native Language Names**: Display native language names (한국어, English, 日本語, etc.)
- **Dropdown Auto Close**: Close after selection
- **RTL Language Support**: Arabic (`ar`) is RTL language

- **Supported Languages**:
  - Korean (ko)
  - English (en)
  - Japanese (ja)
  - Simplified Chinese (zh-CN)
  - Traditional Chinese (zh-TW)
  - Spanish (es)
  - French (fr)
  - German (de)
  - Italian (it)
  - Portuguese (pt-BR)
  - Russian (ru)
  - Arabic (ar)

- **Native Language Names**:
  - 한국어 (ko)
  - English (en)
  - 日本語 (ja)
  - 简体中文 (zh-CN)
  - 繁體中文 (zh-TW)
  - Español (es)
  - Français (fr)
  - Deutsch (de)
  - Italiano (it)
  - Português (pt-BR)
  - Русский (ru)
  - العربية (ar)

### Edge Cases
- **Outside Click**: Close dropdown when clicking outside
- **Missing Translation Key**: Display key itself (i18next default behavior)

## Data/Models

- No models/DTOs
- Schema/Tables: None
- Serialization Format: None (LocalStorage string)

## Configuration/Environment Variables
- **LocalStorage Key**: `'language'` (save selected language)
- **Supported Languages**: [`SUPPORTED_LANGUAGES`](../../../src/renderer/i18n.ts) constant

## Dependencies

### Internal Modules
- [`src/renderer/i18n.ts`](../../../src/renderer/i18n.ts): `SUPPORTED_LANGUAGES`, `changeLanguage()`

### External Libraries/Services
- React: `useState`, `useEffect`, `useRef`
- i18next: `useTranslation()`, `i18n.changeLanguage()`
- lucide-react: `Languages` (icon)

## Testing
- **Related Tests**: `vitest` unit tests (add if needed)
- **Coverage/Gaps**: No tests currently, component testing needed
- **Test Scenarios**:
  - Initial rendering (default language)
  - Dropdown open/close
  - Language selection
  - Language change (i18n.changeLanguage() call)
  - Language persistence (localStorage)
  - Outside click close
  - Missing translation key

## Operations/Observability

### Logging
- None (pure UI component)

### Metrics/Tracing
- None

### Alert Points
- None

## Dropdown Structure

### Layout
```tsx
<div className="relative">
  {/* Button */}
  <button>Language (Native Name) <Languages icon className="ml-2" /></button>
  
  {/* Dropdown Menu */}
  {isOpen && (
    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
      {supportedLanguages.map(lang => (
        <button
          key={lang}
          onClick={() => changeLanguage(lang)}
          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
            currentLanguage === lang ? 'bg-primary-50 text-white' : ''
          }`}
        >
          <span className={currentLanguage === lang ? 'font-semibold' : ''}>
            {LANGUAGE_LABELS[lang]}
          </span>
          {currentLanguage === lang && <Check className="ml-2 h-4 w-4" />}
        </button>
      ))}
    </div>
  )}
</div>
```

### Tailwind CSS Classes
- **Container**: `relative`
- **Button**: `flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700`
- **Dropdown Menu**: `absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`
- **Option Button**: `w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700`
- **Selected**: `bg-primary-50 text-white font-semibold`
- **Check Icon**: `ml-2 h-4 w-4`

## Related Documents
- [i18n Configuration](../i18n.md)
- [Data Models](../../05-Data-Models.md)
- [App](../App.md) - Main app component

## Changelog (Optional)
- v1.0: Initial implementation (12 languages supported)