import { describe, it, expect } from 'vitest'
import { games, categories } from '../src/data/games'
import { i18n, categoryI18n, type Language } from '../src/data/i18n'

const allLanguages: Language[] = ['en', 'fr', 'de', 'es', 'ru', 'ja', 'zh-TW', 'zh-CN']

describe('Homepage Quick Play', () => {
  const quickPlaySlugs = ['wordle', 'sudoku', '2048', 'tetris', 'chess', 'pac-man']

  it('should have exactly 6 quick play games', () => {
    expect(quickPlaySlugs).toHaveLength(6)
  })

  it('all quick play games must exist in the games data', () => {
    quickPlaySlugs.forEach(slug => {
      const game = games.find(g => g.slug === slug)
      expect(game, `Quick play game "${slug}" not found`).toBeDefined()
    })
  })

  it('all quick play games should be featured', () => {
    quickPlaySlugs.forEach(slug => {
      const game = games.find(g => g.slug === slug)
      expect(game!.featured, `"${slug}" should be featured`).toBe(true)
    })
  })

  it('quick play games should span multiple categories', () => {
    const cats = new Set(quickPlaySlugs.map(slug => games.find(g => g.slug === slug)!.category))
    expect(cats.size).toBeGreaterThanOrEqual(3)
  })
})

describe('Homepage Category Browsing', () => {
  const categoryList = categories.filter(c => c.id !== 'all')

  it('should have exactly 7 categories (excluding "all")', () => {
    expect(categoryList).toHaveLength(7)
  })

  it('each category should have at least one game', () => {
    categoryList.forEach(cat => {
      const count = games.filter(g => g.category === cat.id).length
      expect(count, `Category "${cat.id}" has no games`).toBeGreaterThanOrEqual(1)
    })
  })

  it('each category should have at least 3 games for preview display', () => {
    categoryList.forEach(cat => {
      const count = games.filter(g => g.category === cat.id).length
      expect(count, `Category "${cat.id}" has fewer than 3 games for preview`).toBeGreaterThanOrEqual(3)
    })
  })
})

describe('Homepage i18n - New Keys', () => {
  const newKeys = ['quickPlay', 'quickPlayDesc', 'browseByCategory'] as const

  it('all languages should have the new homepage keys', () => {
    allLanguages.forEach(lang => {
      const home = i18n[lang].home
      newKeys.forEach(key => {
        expect(home[key], `Missing "${key}" in ${lang}`).toBeDefined()
        expect(typeof home[key]).toBe('string')
        expect(home[key].length).toBeGreaterThan(0)
      })
    })
  })

  it('new keys should not be empty strings', () => {
    allLanguages.forEach(lang => {
      newKeys.forEach(key => {
        expect(i18n[lang].home[key].trim().length).toBeGreaterThan(0)
      })
    })
  })
})

describe('Category i18n completeness', () => {
  const requiredCategoryIds = ['word', 'logic', 'strategy', 'arcade', 'memory', 'skill', 'puzzle']

  it('all languages should have translations for all 7 categories', () => {
    allLanguages.forEach(lang => {
      requiredCategoryIds.forEach(catId => {
        const cat = categoryI18n[lang][catId]
        expect(cat, `Missing category "${catId}" in ${lang}`).toBeDefined()
        expect(typeof cat.name).toBe('string')
        expect(cat.name.length).toBeGreaterThan(0)
      })
    })
  })

  it('category names should differ from English in non-English languages', () => {
    const enNames = requiredCategoryIds.map(id => categoryI18n.en[id]?.name)

    allLanguages.filter(l => l !== 'en').forEach(lang => {
      requiredCategoryIds.forEach((catId, i) => {
        const name = categoryI18n[lang][catId].name
        // At least some categories should have different names in other languages
        if (['zh-CN', 'zh-TW', 'ja', 'ru'].includes(lang)) {
          expect(name).not.toBe(enNames[i])
        }
      })
    })
  })
})

describe('Game Guides (top 3)', () => {
  it('gameGuidesSEO should be importable and have entries', async () => {
    const { gameGuides } = await import('../src/data/gameGuidesSEO')
    const guides = Object.values(gameGuides)
    expect(guides.length).toBeGreaterThanOrEqual(3)
  })
})

describe('All Games section structure', () => {
  it('all games should have a category that matches a valid category id', () => {
    const validCategories = new Set(categories.map(c => c.id))
    games.forEach(game => {
      expect(validCategories.has(game.category),
        `Game "${game.slug}" has invalid category "${game.category}"`
      ).toBe(true)
    })
  })

  it('each game should have required fields for card rendering', () => {
    games.forEach(game => {
      expect(game.slug, `Game missing slug`).toBeTruthy()
      expect(game.name, `Game "${game.slug}" missing name`).toBeTruthy()
      expect(game.icon, `Game "${game.slug}" missing icon`).toBeTruthy()
      expect(game.desc, `Game "${game.slug}" missing desc`).toBeTruthy()
      expect(game.category, `Game "${game.slug}" missing category`).toBeTruthy()
      expect(game.color, `Game "${game.slug}" missing color`).toBeTruthy()
    })
  })

  it('games should have unique slugs', () => {
    const slugs = games.map(g => g.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(slugs.length)
  })
})
