import { describe, it, expect } from 'vitest'
import { i18n, languages, getI18n, type Language } from '../src/data/i18n'

describe('i18n', () => {
  it('should have all languages defined', () => {
    expect(languages).toBeDefined()
    expect(languages.length).toBe(8)

    const expectedLangs = ['en', 'fr', 'de', 'es', 'ru', 'ja', 'zh-TW', 'zh-CN']
    expectedLangs.forEach(lang => {
      expect(languages.some(l => l.code === lang)).toBe(true)
    })
  })

  it('each language should have required translations', () => {
    const requiredKeys = ['nav', 'home', 'game', 'footer']

    Object.entries(i18n).forEach(([lang, translations]) => {
      requiredKeys.forEach(key => {
        expect(translations, `Language ${lang} missing ${key}`).toHaveProperty(key)
      })
    })
  })

  it('nav should have required keys', () => {
    const requiredNavKeys = ['home', 'feedback', 'language']

    Object.entries(i18n).forEach(([lang, translations]) => {
      requiredNavKeys.forEach(key => {
        expect(translations.nav, `Language ${lang} nav missing ${key}`).toHaveProperty(key)
      })
    })
  })

  it('home should have required keys', () => {
    const requiredHomeKeys = ['title', 'subtitle', 'featured', 'allGames', 'gamesCount', 'freeGames']

    Object.entries(i18n).forEach(([lang, translations]) => {
      requiredHomeKeys.forEach(key => {
        expect(translations.home, `Language ${lang} home missing ${key}`).toHaveProperty(key)
      })
    })
  })

  it('game should have required keys', () => {
    const requiredGameKeys = ['loading', 'error', 'backToHome', 'howToPlay', 'tips']

    Object.entries(i18n).forEach(([lang, translations]) => {
      requiredGameKeys.forEach(key => {
        expect(translations.game, `Language ${lang} game missing ${key}`).toHaveProperty(key)
      })
    })
  })

  it('getI18n should return correct translations', () => {
    const en = getI18n('en')
    expect(en).toBeDefined()
    expect(en.nav.home).toBe('Home')

    const zhCN = getI18n('zh-CN')
    expect(zhCN).toBeDefined()
    expect(zhCN.nav.home).toBe('首页')
  })

  it('getI18n should fallback to en for invalid language', () => {
    const fallback = getI18n('invalid' as Language)
    expect(fallback).toEqual(i18n.en)
  })

  it('all translations should be non-empty strings', () => {
    const checkNotEmpty = (obj: unknown, path: string = '') => {
      if (typeof obj === 'string') {
        expect(obj.length, `Empty string at ${path}`).toBeGreaterThan(0)
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          checkNotEmpty(value, `${path}.${key}`)
        })
      }
    }

    Object.entries(i18n).forEach(([lang, translations]) => {
      checkNotEmpty(translations, lang)
    })
  })
})
