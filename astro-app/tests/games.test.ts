import { describe, it, expect } from 'vitest'
import { games, categories, getGameBySlug } from '../src/data/games'

describe('Games Data', () => {
  it('should have games defined', () => {
    expect(games).toBeDefined()
    expect(games.length).toBeGreaterThan(0)
  })

  it('each game should have required properties', () => {
    const requiredProps = ['slug', 'id', 'name', 'nameZh', 'icon', 'desc', 'descZh', 'category', 'color']

    games.forEach(game => {
      requiredProps.forEach(prop => {
        expect(game, `Game ${game.slug} missing property: ${prop}`).toHaveProperty(prop)
      })
    })
  })

  it('each game should have a valid category', () => {
    const validCategories = ['word', 'logic', 'strategy', 'arcade', 'memory', 'skill', 'puzzle']

    games.forEach(game => {
      expect(validCategories).toContain(game.category)
    })
  })

  it('each game should have unique slug', () => {
    const slugs = games.map(g => g.slug)
    const uniqueSlugs = new Set(slugs)
    expect(slugs.length).toBe(uniqueSlugs.size)
  })

  it('each game should have unique id', () => {
    const ids = games.map(g => g.id)
    const uniqueIds = new Set(ids)
    expect(ids.length).toBe(uniqueIds.size)
  })

  it('getGameBySlug should return correct game', () => {
    const sudoku = getGameBySlug('sudoku')
    expect(sudoku).toBeDefined()
    expect(sudoku?.name).toBe('Sudoku')

    const invalid = getGameBySlug('nonexistent-game')
    expect(invalid).toBeUndefined()
  })
})

describe('Categories Data', () => {
  it('should have categories defined', () => {
    expect(categories).toBeDefined()
    expect(categories.length).toBeGreaterThan(0)
  })

  it('each category should have required properties', () => {
    categories.forEach(cat => {
      expect(cat).toHaveProperty('id')
      expect(cat).toHaveProperty('name')
      expect(cat).toHaveProperty('nameZh')
      expect(cat).toHaveProperty('icon')
    })
  })

  it('should have "all" category', () => {
    expect(categories.some(c => c.id === 'all')).toBe(true)
  })
})
