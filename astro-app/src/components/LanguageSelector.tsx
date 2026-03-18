import { useState, useEffect } from 'react'
import { languages, type Language } from '../data/i18n'

type LanguageSelectorProps = {
  currentLang: Language
  onLanguageChange: (lang: Language) => void
}

export default function LanguageSelector({ currentLang, onLanguageChange }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

  const handleSelect = (lang: Language) => {
    onLanguageChange(lang)
    setIsOpen(false)
    // Update URL with new language
    const url = new URL(window.location.href)
    url.searchParams.set('lang', lang)
    window.history.replaceState({}, '', url.toString())
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
        aria-label="Select language"
      >
        <span className="text-lg">🌐</span>
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl z-20 py-1 border border-slate-700">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center justify-between ${
                  currentLang === lang.code ? 'text-green-400' : 'text-slate-300'
                }`}
              >
                <span>{lang.nativeName}</span>
                {currentLang === lang.code && (
                  <span className="text-green-400">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
