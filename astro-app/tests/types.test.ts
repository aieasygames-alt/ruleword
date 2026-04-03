import { describe, it, expect } from 'vitest'
import type { GameConfig, GameCategory, SEOMeta, Guide } from '../src/types'

describe('Type Definitions', () => {
  describe('GameConfig', () => {
    it('should accept valid game configuration', () => {
      const config: GameConfig = {
        slug: 'wordle',
        id: 'wordle',
        name: 'Wordle',
        nameZh: 'Wordle',
        icon: '🔤',
        desc: 'Guess the word',
        descZh: '猜单词',
        category: 'word',
        color: 'from-green-500 to-green-600',
        featured: true
      }

      expect(config.slug).toBe('wordle')
      expect(config.category).toBe('word')
      expect(config.featured).toBe(true)
    })

    it('should allow optional featured field', () => {
      const config: GameConfig = {
        slug: 'sudoku',
        id: 'sudoku',
        name: 'Sudoku',
        nameZh: '数独',
        icon: '🧩',
        desc: 'Number puzzle',
        descZh: '数字谜题',
        category: 'logic',
        color: 'from-blue-500 to-blue-600'
      }

      expect(config.featured).toBeUndefined()
    })
  })

  describe('GameCategory', () => {
    it('should accept all valid categories', () => {
      const categories: GameCategory[] = [
        'word', 'logic', 'strategy', 'arcade', 'memory', 'skill', 'puzzle'
      ]

      expect(categories).toHaveLength(7)
      expect(categories).toContain('word')
      expect(categories).toContain('logic')
      expect(categories).toContain('strategy')
    })
  })

  describe('SEOMeta', () => {
    it('should accept valid SEO metadata', () => {
      const seo: SEOMeta = {
        title: 'Wordle Online Free - Play Daily Word Puzzle Game',
        description: 'Play Wordle free online. Guess the 5-letter word in 6 tries.',
        keywords: ['wordle', 'word game', 'puzzle'],
        ogImage: '/images/wordle.png'
      }

      expect(seo.title).toContain('Wordle')
      expect(seo.keywords).toHaveLength(3)
    })

    it('should allow optional fields', () => {
      const seo: SEOMeta = {
        title: 'Sudoku',
        description: 'Play Sudoku online'
      }

      expect(seo.keywords).toBeUndefined()
      expect(seo.ogImage).toBeUndefined()
    })
  })

  describe('Guide', () => {
    it('should accept valid guide configuration', () => {
      const guide: Guide = {
        slug: 'wordle-guide',
        title: 'How to Play Wordle',
        titleZh: '如何玩Wordle',
        gameSlug: 'wordle',
        content: {
          en: {
            overview: 'Wordle is a word puzzle game...',
            howToPlay: ['Guess the word', 'Use color hints'],
            tips: ['Start with common letters'],
            faq: [{ question: 'What do colors mean?', answer: 'Green is correct' }]
          },
          zh: {
            overview: 'Wordle是一个单词谜题游戏...',
            howToPlay: ['猜单词', '使用颜色提示'],
            tips: ['从常见字母开始'],
            faq: [{ question: '颜色代表什么？', answer: '绿色表示正确' }]
          }
        }
      }

      expect(guide.slug).toBe('wordle-guide')
      expect(guide.content.en.tips).toHaveLength(1)
    })
  })
})
