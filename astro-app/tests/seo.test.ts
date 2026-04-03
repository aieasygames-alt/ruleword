import { describe, it, expect } from 'vitest'
import { gameSEOConfig, type GameSEO } from '../src/data/seo'

describe('SEO Configuration', () => {
  describe('gameSEOConfig', () => {
    it('should have SEO config for Wordle', () => {
      const config = gameSEOConfig.wordle

      expect(config).toBeDefined()
      expect(config.primaryKeyword).toBe('wordle online')
      expect(config.secondaryKeywords).toContain('wordle game')
      expect(config.intent).toBe('play')
    })

    it('should have SEO config for 2048', () => {
      const config = gameSEOConfig['2048']

      expect(config).toBeDefined()
      expect(config.primaryKeyword).toBe('2048 game')
      expect(config.titleTemplate).toContain('2048')
    })

    it('should have SEO config for Sudoku', () => {
      const config = gameSEOConfig.sudoku

      expect(config).toBeDefined()
      expect(config.primaryKeyword).toBe('sudoku online')
    })

    it('should have SEO config for Minesweeper', () => {
      const config = gameSEOConfig.minesweeper

      expect(config).toBeDefined()
      expect(config.primaryKeyword).toBe('minesweeper online')
    })

    it('should have valid title templates with {brand} placeholder', () => {
      const configs = Object.values(gameSEOConfig)

      configs.forEach((config: GameSEO) => {
        expect(config.titleTemplate).toContain('{brand}')
        expect(config.titleTemplate.length).toBeGreaterThan(20)
      })
    })

    it('should have valid description templates', () => {
      const configs = Object.values(gameSEOConfig)

      configs.forEach((config: GameSEO) => {
        expect(config.descriptionTemplate.length).toBeGreaterThan(50)
        expect(config.descriptionTemplate.length).toBeLessThan(200)
      })
    })

    it('should have at least 30 games configured', () => {
      const gameCount = Object.keys(gameSEOConfig).length

      expect(gameCount).toBeGreaterThanOrEqual(30)
    })

    it('should have valid intent values', () => {
      const validIntents = ['play', 'learn', 'daily', 'unlimited']
      const configs = Object.values(gameSEOConfig)

      configs.forEach((config: GameSEO) => {
        expect(validIntents).toContain(config.intent)
      })
    })

    it('should have secondary keywords as arrays', () => {
      const configs = Object.values(gameSEOConfig)

      configs.forEach((config: GameSEO) => {
        expect(Array.isArray(config.secondaryKeywords)).toBe(true)
        expect(config.secondaryKeywords.length).toBeGreaterThan(0)
      })
    })

    it('should have long-tail keywords as arrays', () => {
      const configs = Object.values(gameSEOConfig)

      configs.forEach((config: GameSEO) => {
        expect(Array.isArray(config.longTailKeywords)).toBe(true)
        expect(config.longTailKeywords.length).toBeGreaterThan(0)
      })
    })

    it('should have consistent game slugs', () => {
      const slugs = Object.keys(gameSEOConfig)

      slugs.forEach((slug: string) => {
        expect(slug).toMatch(/^[a-z0-9-]+$/)
      })
    })

    it('should include high-value games', () => {
      const highValueGames = ['wordle', 'sudoku', '2048', 'minesweeper', 'chess', 'tetris']

      highValueGames.forEach((game: string) => {
        expect(gameSEOConfig[game]).toBeDefined()
      })
    })

    it('should include logic puzzle games', () => {
      const logicGames = ['nonogram', 'sudoku', 'minesweeper', 'killer-sudoku', 'kakuro']

      logicGames.forEach((game: string) => {
        expect(gameSEOConfig[game] || gameSEOConfig[game.replace('-', '')]).toBeDefined()
      })
    })

    it('should include memory/brain games', () => {
      const memoryGames = ['chimp-test', 'stroop-test', 'reaction-test', 'aim-trainer']

      memoryGames.forEach((game: string) => {
        expect(gameSEOConfig[game]).toBeDefined()
      })
    })
  })

  describe('GameSEO Interface', () => {
    it('should have all required fields', () => {
      const config: GameSEO = gameSEOConfig.wordle

      expect(config).toHaveProperty('primaryKeyword')
      expect(config).toHaveProperty('secondaryKeywords')
      expect(config).toHaveProperty('longTailKeywords')
      expect(config).toHaveProperty('titleTemplate')
      expect(config).toHaveProperty('descriptionTemplate')
      expect(config).toHaveProperty('intent')
    })
  })
})
