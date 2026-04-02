/**
 * Internationalization (i18n) utilities for multilingual SEO
 *
 * URL Structure Strategy:
 * - English (default): /game/sudoku
 * - Chinese: /zh/game/sudoku
 * - Japanese: /ja/game/sudoku
 * - German: /de/game/sudoku
 *
 * This follows Google's recommendations for multilingual sites
 */

export type SupportedLanguage = 'en' | 'zh' | 'ja' | 'de'

export const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  de: 'Deutsch'
}

export const languageRegions: Record<SupportedLanguage, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  ja: 'ja-JP',
  de: 'de-DE'
}

/**
 * Get the language prefix for URLs
 * English has no prefix, other languages use /{lang}/
 */
export function getLanguagePrefix(lang: SupportedLanguage): string {
  return lang === 'en' ? '' : `/${lang}`
}

/**
 * Build a localized URL path
 * Example: buildLocalizedUrl('zh', 'game', 'sudoku') => '/zh/game/sudoku'
 */
export function buildLocalizedUrl(lang: SupportedLanguage, ...segments: string[]): string {
  const prefix = getLanguagePrefix(lang)
  const path = segments.filter(Boolean).join('/')
  return prefix + (path ? `/${path}` : '')
}

/**
 * Extract language from URL path
 * Example: getLanguageFromPath('/zh/game/sudoku') => 'zh'
 */
export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const firstSegment = pathname.split('/')[1]
  if (firstSegment === 'zh' || firstSegment === 'ja' || firstSegment === 'de') {
    return firstSegment
  }
  return 'en'
}

/**
 * Generate hreflang tags for a page
 * Returns array of { lang, url } objects for all language versions
 */
export function generateHreflangTags(
  pageType: 'home' | 'game' | 'blog',
  gameId?: string,
  blogSlug?: string
): Array<{ lang: string; url: string }> {
  const baseUrl = 'https://ruleword.com'
  const languages: SupportedLanguage[] = ['en', 'zh', 'ja', 'de']

  let pathSegments: string[] = []
  if (pageType === 'game' && gameId) {
    pathSegments = ['game', gameId]
  } else if (pageType === 'blog' && blogSlug) {
    pathSegments = ['blog', blogSlug]
  }

  return languages.map(lang => ({
    lang: lang === 'en' ? 'x-default' : lang,
    url: baseUrl + buildLocalizedUrl(lang, ...pathSegments)
  }))
}

/**
 * Generate alternate language links for head
 * Call this to inject hreflang tags dynamically
 */
export function injectHreflangTags(
  pageType: 'home' | 'game' | 'blog',
  gameId?: string,
  blogSlug?: string
): void {
  if (typeof document === 'undefined') return

  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove())

  const hreflangs = generateHreflangTags(pageType, gameId, blogSlug)

  hreflangs.forEach(({ lang, url }) => {
    const link = document.createElement('link')
    link.rel = 'alternate'
    link.setAttribute('hreflang', lang)
    link.href = url
    document.head.appendChild(link)
  })
}

/**
 * Localized meta titles and descriptions for SEO
 */
export const localizedMeta = {
  home: {
    en: {
      title: 'RuleWord - 50+ Free Online Puzzle Games | No Download Required',
      description: 'Play 50+ free online puzzle games: Sudoku, Wordle, 2048, Nonogram, Minesweeper and more. No download required. Challenge your brain daily!'
    },
    zh: {
      title: 'RuleWord - 50+款免费在线益智游戏 | 无需下载',
      description: '免费在线玩50+款益智游戏：数独、猜词、2048、数织、扫雷等。无需下载，每日挑战你的大脑！'
    },
    ja: {
      title: 'RuleWord - 50以上の無料オンラインパズルゲーム | ダウンロード不要',
      description: '50以上の無料オンラインパズルゲーム：数独、Wordle、2048、ノノグラム、マインスイーパーなど。ダウンロード不要。毎日脳を鍛えよう！'
    },
    de: {
      title: 'RuleWord - 50+ Kostenlose Online-Puzzlespiele | Kein Download',
      description: 'Spielen Sie 50+ kostenlose Online-Puzzlespiele: Sudoku, Wordle, 2048, Nonogramm, Minesweeper und mehr. Kein Download erforderlich.'
    }
  }
}

/**
 * Get localized meta for current page
 */
export function getLocalizedMeta(
  pageType: 'home',
  lang: SupportedLanguage
): { title: string; description: string }
export function getLocalizedMeta(
  pageType: 'home',
  lang: SupportedLanguage
): { title: string; description: string } {
  return localizedMeta[pageType][lang] || localizedMeta[pageType].en
}

/**
 * Language selector data for UI components
 */
export const availableLanguages = Object.entries(languageNames).map(([code, name]) => ({
  code: code as SupportedLanguage,
  name,
  nativeName: name
}))
