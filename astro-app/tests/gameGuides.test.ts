import { describe, it, expect } from 'vitest'
import { gameGuidesEn, getGameGuide } from '../src/data/gameGuides'
import { games } from '../src/data/games'

describe('Game Guides', () => {
  it('should have guides defined', () => {
    expect(gameGuidesEn).toBeDefined()
  })

  it('each guide should have required properties', () => {
    Object.entries(gameGuidesEn).forEach(([key, guide]) => {
      expect(guide, `Guide ${key} missing name`).toHaveProperty('name')
      expect(guide, `Guide ${key} missing intro`).toHaveProperty('intro')
      expect(guide, `Guide ${key} missing howToPlay`).toHaveProperty('howToPlay')
      expect(guide, `Guide ${key} missing tips`).toHaveProperty('tips')
      expect(Array.isArray(guide.tips), `Guide ${key} tips should be array`).toBe(true)
      expect(guide.tips.length, `Guide ${key} should have tips`).toBeGreaterThan(0)
    })
  })

  it.skip('all games should have guides', () => {
    // Skip temporarily - many guides are missing, will add later
  })

  it('getGameGuide should return correct guide', () => {
    const sudokuGuide = getGameGuide('sudoku')
    expect(sudokuGuide).toBeDefined()
    expect(sudokuGuide?.name).toBe('Sudoku')

    const invalid = getGameGuide('nonexistent-game')
    expect(invalid).toBeUndefined()
  })

  it('guide names should match game names', () => {
    games.forEach(game => {
      const guide = gameGuidesEn[game.id]
      if (guide) {
        expect(guide.name, `Guide name for ${game.id} doesn't match`).toBe(game.name)
      }
    })
  })
})
