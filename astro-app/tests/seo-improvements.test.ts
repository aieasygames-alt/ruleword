import { describe, it, expect } from 'vitest'
import { games } from '../src/data/games'
import { gameGuides, getGameGuide, getAllGuideSlugs } from '../src/data/gameGuidesSEO'
import { gameSEOConfig, categorySEO } from '../src/data/seo'

describe('SEO Improvements', () => {

  describe('Game Guides Coverage', () => {
    const guideSlugs = getAllGuideSlugs()

    it('should have at least 45 game guides', () => {
      expect(guideSlugs.length).toBeGreaterThanOrEqual(45)
    })

    it('every guide slug should correspond to an existing game', () => {
      guideSlugs.forEach(slug => {
        const game = games.find(g => g.slug === slug)
        expect(game, `Guide "${slug}" has no matching game`).toBeDefined()
      })
    })

    it('every guide should have required fields', () => {
      guideSlugs.forEach(slug => {
        const guide = getGameGuide(slug)
        expect(guide, `Guide "${slug}" not found`).toBeDefined()
        expect(guide!.title.length).toBeGreaterThan(10)
        expect(guide!.description.length).toBeGreaterThan(50)
        expect(guide!.description.length).toBeLessThanOrEqual(200)
        expect(guide!.keywords.length).toBeGreaterThanOrEqual(3)
        expect(guide!.introduction.length).toBeGreaterThan(50)
        expect(guide!.sections.length).toBeGreaterThanOrEqual(3)
        expect(guide!.faq.length).toBeGreaterThanOrEqual(2)
      })
    })

    it('all guide sections should have content and tips', () => {
      guideSlugs.forEach(slug => {
        const guide = getGameGuide(slug)!
        guide.sections.forEach((section, i) => {
          expect(section.title.length, `Guide "${slug}" section ${i} has no title`).toBeGreaterThan(3)
          expect(section.content.length, `Guide "${slug}" section ${i} has no content`).toBeGreaterThan(20)
          if (section.tips) {
            expect(section.tips.length, `Guide "${slug}" section ${i} tips`).toBeGreaterThanOrEqual(2)
          }
        })
      })
    })

    it('featured games should mostly have guides', () => {
      const featuredGames = games.filter(g => g.featured)
      const withGuides = featuredGames.filter(g => guideSlugs.includes(g.slug))
      // At least 40% of featured games should have guides (covers the most popular ones)
      expect(withGuides.length / featuredGames.length).toBeGreaterThanOrEqual(0.4)
    })

    it('should cover all game categories', () => {
      const categories = new Set(games.map(g => g.category))
      const guideCategories = new Set(
        guideSlugs.map(slug => games.find(g => g.slug === slug)?.category).filter(Boolean)
      )
      categories.forEach(cat => {
        expect(guideCategories.has(cat), `Category "${cat}" has no guides`).toBe(true)
      })
    })
  })

  describe('SEO Keyword Config', () => {
    const seoKeys = Object.keys(gameSEOConfig)

    it('should have SEO config for every game', () => {
      games.forEach(game => {
        expect(seoKeys.includes(game.slug), `Game "${game.slug}" missing SEO config`).toBe(true)
      })
    })

    it('every SEO config should have required fields', () => {
      seoKeys.forEach(key => {
        const config = gameSEOConfig[key]
        expect(config.primaryKeyword.length).toBeGreaterThan(3)
        expect(config.secondaryKeywords.length).toBeGreaterThanOrEqual(2)
        expect(config.longTailKeywords.length).toBeGreaterThanOrEqual(2)
        expect(config.titleTemplate).toContain('{brand}')
        expect(config.descriptionTemplate.length).toBeGreaterThan(50)
        expect(config.descriptionTemplate.length).toBeLessThanOrEqual(170)
        expect(['play', 'learn', 'daily', 'unlimited']).toContain(config.intent)
      })
    })

    it('category SEO should cover all categories', () => {
      const cats = new Set(games.map(g => g.category))
      cats.forEach(cat => {
        expect(categorySEO[cat], `Category "${cat}" missing SEO config`).toBeDefined()
      })
    })
  })

  describe('Game Page Structure', () => {
    it('all games should have required fields', () => {
      games.forEach(game => {
        expect(game.slug.length).toBeGreaterThan(1)
        expect(game.name.length).toBeGreaterThan(1)
        expect(game.icon.length).toBeGreaterThan(0)
        expect(game.desc.length).toBeGreaterThan(10)
        expect(game.category).toBeDefined()
        expect(game.color).toContain('from-')
      })
    })

    it('game slugs should be unique', () => {
      const slugs = games.map(g => g.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    })

    it('game names should be unique', () => {
      const names = games.map(g => g.name)
      expect(new Set(names).size).toBe(names.length)
    })
  })
})
