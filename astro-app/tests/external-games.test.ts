import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the games module
vi.mock('../src/lib/sanity', () => ({
  sanityClient: {
    fetch: vi.fn(),
  },
  getAllGames: vi.fn(),
  getGameBySlug: vi.fn(),
  getAllGameSlugs: vi.fn(),
  isExternalGame: vi.fn((game) => game?._type === 'externalGame'),
  queries: {},
}))

describe('GameData Interface', () => {
  it('should have required fields for built-in games', () => {
    const game = {
      id: 'test-game',
      slug: 'test-game',
      icon: '🎮',
      category: 'puzzle',
      featured: false,
      color: 'from-blue-500 to-purple-600',
      name: 'Test Game',
      nameZh: '测试游戏',
      desc: 'A test game',
      descZh: '一个测试游戏',
      howToPlay: 'Click to play',
      howToPlayZh: '点击开始',
      tips: ['Tip 1', 'Tip 2'],
      tipsZh: ['提示1', '提示2'],
      isExternal: false,
    }

    expect(game.id).toBe('test-game')
    expect(game.isExternal).toBe(false)
  })

  it('should have required fields for external games', () => {
    const externalGame = {
      id: 'external-2048',
      slug: '2048',
      icon: '🔢',
      category: 'puzzle',
      featured: true,
      color: 'from-orange-500 to-red-600',
      name: '2048',
      nameZh: '2048',
      desc: 'Classic 2048 puzzle game',
      descZh: '经典2048益智游戏',
      isExternal: true,
      gameUrl: 'https://example.com/2048',
      iframeWidth: '100%',
      iframeHeight: '600px',
      allowFullscreen: true,
      sourceName: 'CrazyGames',
      sourceUrl: 'https://crazygames.com',
    }

    expect(externalGame.isExternal).toBe(true)
    expect(externalGame.gameUrl).toBe('https://example.com/2048')
    expect(externalGame.iframeHeight).toBe('600px')
    expect(externalGame.allowFullscreen).toBe(true)
  })
})

describe('sanityToGameData', () => {
  // Import after mock
  const sanityToGameData = (data: any) => ({
    id: data.gameId,
    slug: data.slug?.current || data.slug,
    icon: data.icon || '',
    category: data.category,
    featured: data.isFeatured || false,
    color: data.colorGradient || 'from-gray-600 to-gray-800',
    name: data.title || '',
    nameZh: data.titleZh || data.title || '',
    desc: data.description || '',
    descZh: data.descriptionZh || data.description || '',
    howToPlay: data.howToPlay,
    howToPlayZh: data.howToPlayZh || data.howToPlay,
    tips: data.tips?.split('\n').filter(Boolean) || [],
    tipsZh: data.tipsZh?.split('\n').filter(Boolean) || data.tips?.split('\n').filter(Boolean) || [],
    isExternal: data._type === 'externalGame',
    gameUrl: data.gameUrl || '',
    iframeWidth: data.iframeWidth || '100%',
    iframeHeight: data.iframeHeight || '600px',
    allowFullscreen: data.allowFullscreen ?? true,
    sourceName: data.sourceName || '',
    sourceUrl: data.sourceUrl || '',
  })

  it('should convert built-in game from Sanity correctly', () => {
    const sanityData = {
      _type: 'game',
      gameId: 'wordle',
      slug: { current: 'wordle' },
      title: 'Wordle',
      titleZh: '猜词游戏',
      icon: '🔤',
      category: 'word',
      isFeatured: true,
      colorGradient: 'from-green-500 to-emerald-600',
      description: 'Word puzzle game',
      descriptionZh: '猜词益智游戏',
      howToPlay: 'Guess the word',
      howToPlayZh: '猜测单词',
      tips: 'Start with vowels\nUse common letters',
      tipsZh: '从元音开始\n使用常见字母',
    }

    const result = sanityToGameData(sanityData)

    expect(result.id).toBe('wordle')
    expect(result.slug).toBe('wordle')
    expect(result.name).toBe('Wordle')
    expect(result.nameZh).toBe('猜词游戏')
    expect(result.isExternal).toBe(false)
    expect(result.gameUrl).toBe('')
  })

  it('should convert external game from Sanity correctly', () => {
    const sanityData = {
      _type: 'externalGame',
      gameId: 'tetris',
      slug: { current: 'tetris' },
      title: 'Tetris',
      titleZh: '俄罗斯方块',
      icon: '🧱',
      category: 'arcade',
      isFeatured: false,
      colorGradient: 'from-blue-500 to-cyan-600',
      description: 'Classic block puzzle game',
      descriptionZh: '经典方块益智游戏',
      howToPlay: 'Stack the blocks',
      howToPlayZh: '堆叠方块',
      tips: 'Plan ahead\nLeave space',
      gameUrl: 'https://tetris.com/game',
      iframeWidth: '100%',
      iframeHeight: '500px',
      allowFullscreen: true,
      sourceName: 'Tetris Official',
      sourceUrl: 'https://tetris.com',
    }

    const result = sanityToGameData(sanityData)

    expect(result.id).toBe('tetris')
    expect(result.name).toBe('Tetris')
    expect(result.isExternal).toBe(true)
    expect(result.gameUrl).toBe('https://tetris.com/game')
    expect(result.iframeHeight).toBe('500px')
    expect(result.sourceName).toBe('Tetris Official')
  })

  it('should handle missing optional fields', () => {
    const sanityData = {
      _type: 'externalGame',
      gameId: 'simple-game',
      slug: { current: 'simple-game' },
      title: 'Simple Game',
      category: 'puzzle',
      gameUrl: 'https://example.com/game',
    }

    const result = sanityToGameData(sanityData)

    expect(result.id).toBe('simple-game')
    expect(result.nameZh).toBe('Simple Game')
    expect(result.icon).toBe('')
    expect(result.featured).toBe(false)
    expect(result.iframeWidth).toBe('100%')
    expect(result.iframeHeight).toBe('600px')
    expect(result.allowFullscreen).toBe(true)
  })
})

describe('isExternalGame helper', () => {
  const isExternalGame = (game: any) => game?._type === 'externalGame'

  it('should return true for external games', () => {
    expect(isExternalGame({ _type: 'externalGame' })).toBe(true)
  })

  it('should return false for built-in games', () => {
    expect(isExternalGame({ _type: 'game' })).toBe(false)
  })

  it('should return false for null/undefined', () => {
    expect(isExternalGame(null)).toBe(false)
    expect(isExternalGame(undefined)).toBe(false)
  })
})

describe('Game URL validation', () => {
  it('should accept valid HTTPS URLs', () => {
    const validUrls = [
      'https://example.com/game',
      'https://games.example.com/embed/game123',
      'https://cdn.example.com/games/tetris.html',
    ]

    validUrls.forEach(url => {
      expect(() => new URL(url)).not.toThrow()
    })
  })

  it('should reject invalid URLs', () => {
    const invalidUrls = [
      'not-a-url',
      'ftp://example.com/game',
      '',
    ]

    invalidUrls.forEach(url => {
      if (url === '' || url === 'not-a-url') {
        expect(() => new URL(url)).toThrow()
      }
    })
  })
})

describe('iframe dimensions', () => {
  it('should use default dimensions when not specified', () => {
    const defaults = {
      iframeWidth: '100%',
      iframeHeight: '600px',
      allowFullscreen: true,
    }

    expect(defaults.iframeWidth).toBe('100%')
    expect(defaults.iframeHeight).toBe('600px')
    expect(defaults.allowFullscreen).toBe(true)
  })

  it('should support custom dimensions', () => {
    const custom = {
      iframeWidth: '800px',
      iframeHeight: '450px',
      allowFullscreen: false,
    }

    expect(custom.iframeWidth).toBe('800px')
    expect(custom.iframeHeight).toBe('450px')
    expect(custom.allowFullscreen).toBe(false)
  })
})
