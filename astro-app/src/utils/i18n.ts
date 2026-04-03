// i18n routing utilities
import { languages, defaultLang } from '../../astro.config.mjs'

export type Lang = keyof typeof languages

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/')
  if (lang in languages) return lang as Lang
  return defaultLang
}

export function useTranslatedPath(lang: Lang) {
  return function translatePath(path: string, l: Lang = lang) {
    // Remove leading slash and any existing language prefix
    const cleanPath = path.replace(/^\//, '').replace(/^(en|fr|de|es|ru|ja|zh-TW|zh-CN)\//, '')

    // Don't prefix default language
    if (l === defaultLang) {
      return `/${cleanPath}`
    }

    return `/${l}/${cleanPath}`
  }
}

export function getLocalizedUrl(path: string, lang: Lang): string {
  const cleanPath = path.replace(/^\//, '').replace(/^(en|fr|de|es|ru|ja|zh-TW|zh-CN)\//, '')

  // Add trailing slash if not present
  const normalizedPath = cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`

  if (lang === defaultLang) {
    return `/${normalizedPath}`
  }

  return `/${lang}/${normalizedPath}`
}

export function getAlternateLocales(path: string): { lang: Lang; url: string }[] {
  const cleanPath = path.replace(/^\//, '').replace(/^(en|fr|de|es|ru|ja|zh-TW|zh-CN)\//, '')

  return Object.keys(languages).map((lang) => ({
    lang: lang as Lang,
    url: lang === defaultLang
      ? `/${cleanPath}`
      : `/${lang}/${cleanPath}`
  }))
}

export function getLanguageFromCookie(cookieHeader: string | null): Lang {
  if (!cookieHeader) return defaultLang

  const match = cookieHeader.match(/preferred-language=([^;]+)/)
  if (match && match[1] in languages) {
    return match[1] as Lang
  }

  return defaultLang
}

// Route mapping for redirects
export function getNewUrl(oldUrl: string, lang: Lang): string {
  // Convert ?lang=zh to /zh/ structure
  const url = new URL(oldUrl, 'https://ruleword.com')
  const langParam = url.searchParams.get('lang')

  if (langParam && langParam in languages) {
    url.searchParams.delete('lang')
    const path = url.pathname
    const query = url.search

    if (langParam === defaultLang) {
      return `${path}${query}`
    }

    return `/${langParam}${path}${query}`
  }

  return oldUrl
}
