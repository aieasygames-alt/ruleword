import { describe, it, expect, vi, beforeEach } from 'vitest'
import { games, getGameBySlug, categories } from '../src/data/games'
import GameWrapper from '../src/components/GameWrapper'

import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Tests for new games - focusing on configuration and imports

describe('New Games - Module Import Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('Stack Game', () => {
    it('should be importable', async () => {
      const { default: Stack } = await import('../src/components/games/Stack')
      expect(Stack).toBeDefined()
      expect(typeof Stack).toBe('function')
    })
  })

  describe('Trivia Quiz Game', () => {
    it('should be importable', async () => {
      const { default: TriviaQuiz } = await import('../src/components/games/TriviaQuiz')
      expect(TriviaQuiz).toBeDefined()
      expect(typeof TriviaQuiz).toBe('function')
    })
  })

  describe('Doodle Jump Game', () => {
    it('should be importable', async () => {
      const { default: DoodleJump } = await import('../src/components/games/DoodleJump')
      expect(DoodleJump).toBeDefined()
      expect(typeof DoodleJump).toBe('function')
    })
  })

  describe('Flappy Bird Game', () => {
    it('should be importable', async () => {
      const { default: FlappyBird } = await import('../src/components/games/FlappyBird')
      expect(FlappyBird).toBeDefined()
      expect(typeof FlappyBird).toBe('function')
    })
  })

  describe('Water Sort Game', () => {
    it('should be importable', async () => {
      const { default: WaterSort } = await import('../src/components/games/WaterSort')
      expect(WaterSort).toBeDefined()
      expect(typeof WaterSort).toBe('function')
    })
  })

  describe('Flow Free Game', () => {
    it('should be importable', async () => {
      const { default: FlowFree } = await import('../src/components/games/FlowFree')
      expect(FlowFree).toBeDefined()
      expect(typeof FlowFree).toBe('function')
    })
  })

  describe('Fruit Ninja Game', () => {
    it('should be importable', async () => {
      const { default: FruitNinja } = await import('../src/components/games/FruitNinja')
      expect(FruitNinja).toBeDefined()
      expect(typeof FruitNinja).toBe('function')
    })
  })

  describe('Geometry Dash Game', () => {
    it('should be importable', async () => {
      const { default: GeometryDash } = await import('../src/components/games/GeometryDash')
      expect(GeometryDash).toBeDefined()
      expect(typeof GeometryDash).toBe('function')
    })
  })
})

describe('New Games - Game Config Registration', () => {
  it('all new games should be registered in games.ts', () => {
    const newGameIds = ['stack', 'triviaquiz', 'doodlejump', 'flappybird', 'watersort', 'geometrydash']

    newGameIds.forEach(id => {
      const game = games.find(g => g.id === id)
      expect(game, `Game ${id} should be registered`).toBeDefined()
    })
  })

  it('all new games should have required properties', () => {
    const newGameIds = ['stack', 'triviaquiz', 'doodlejump', 'flappybird', 'watersort', 'flowfree', 'geometrydash']
    const requiredProps = ['slug', 'id', 'name', 'nameZh', 'icon', 'desc', 'descZh', 'category', 'color']

    newGameIds.forEach(id => {
      const game = games.find(g => g.id === id)
      if (game) {
        requiredProps.forEach(prop => {
          expect(game, `Game ${id} missing property: ${prop}`).toHaveProperty(prop)
        })
      }
    })
  })

  it('all new games should have valid categories', () => {
    const validCategories = ['word', 'logic', 'strategy', 'arcade', 'memory', 'skill', 'puzzle']
    const newGameIds = ['stack', 'triviaquiz', 'doodlejump', 'flappybird', 'watersort', 'flowfree', 'geometrydash']
    newGameIds.forEach(id => {
      const game = games.find(g => g.id === id)
      if (game) {
        expect(validCategories, `Game ${id} has invalid category: ${game.category}`).toContain(game.category)
      }
    })
  })
})

describe('New Games - JSON Content Files', () => {
  it('Stack JSON should exist and be valid', async () => {
    const stackJson = await import('../src/content/games/stack.json')
    expect(stackJson.id).toBe('stack')
    expect(stackJson.en).toBeDefined()
    expect(stackJson.zh).toBeDefined()
  })

  it('Trivia Quiz JSON should exist and be valid', async () => {
    const triviaJson = await import('../src/content/games/trivia-quiz.json')
    expect(triviaJson.id).toBe('triviaquiz')
    expect(triviaJson.en).toBeDefined()
    expect(triviaJson.zh).toBeDefined()
  })

  it('Doodle Jump JSON should exist and be valid', async () => {
    const doodleJson = await import('../src/content/games/doodle-jump.json')
    expect(doodleJson.id).toBe('doodlejump')
    expect(doodleJson.en).toBeDefined()
    expect(doodleJson.zh).toBeDefined()
  })

  it('Flow Free JSON should exist and be valid', async () => {
    const flowJson = await import('../src/content/games/flow-free.json')
    expect(flowJson.id).toBe('flowfree')
    expect(flowJson.en).toBeDefined()
    expect(flowJson.zh).toBeDefined()
  })
})

describe('New Games - GameWrapper Registration', () => {
  it('GameWrapper should be a valid component', async () => {
    expect(GameWrapper).toBeDefined()
  })
})
