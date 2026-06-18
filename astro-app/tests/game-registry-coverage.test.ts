import { describe, expect, it } from 'vitest'
import { games } from '../src/data/games'

describe('game registry coverage', () => {
  it('keeps every registered game slug unique', () => {
    const slugs = games.map(game => game.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('includes the GSC priority games in the canonical registry', () => {
    const slugs = new Set(games.map(game => game.slug))
    const priorityGames = [
      'shakashaka',
      'threes',
      'crosswordle',
      '2048',
      'flow-free',
      'memory-matrix',
      'memory-grid',
      'sokoban',
      '15-puzzle',
      'minesweeper',
      'chinese-chess',
    ]

    priorityGames.forEach(slug => expect(slugs.has(slug), slug).toBe(true))
  })
})
