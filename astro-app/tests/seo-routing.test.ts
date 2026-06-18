import { describe, expect, it } from 'vitest'
import { getSeoRedirect } from '../functions/_middleware'

describe('SEO URL consolidation', () => {
  it('permanently consolidates current language paths', () => {
    expect(getSeoRedirect('https://ruleword.com/zh-CN/games/sudoku/')).toEqual({
      location: 'https://ruleword.com/games/sudoku/',
      language: 'zh-CN',
    })
  })

  it('consolidates retired language paths', () => {
    expect(getSeoRedirect('https://ruleword.com/fr/guides/wordle/')).toEqual({
      location: 'https://ruleword.com/guides/wordle/',
      language: 'fr',
    })
  })

  it('removes lang parameters while preserving other parameters', () => {
    expect(getSeoRedirect('https://ruleword.com/games/sudoku/?lang=zh-CN&utm_source=test')).toEqual({
      location: 'https://ruleword.com/games/sudoku/?utm_source=test',
      language: 'zh-CN',
    })
  })

  it('redirects retired duplicate guide slugs', () => {
    expect(getSeoRedirect('https://ruleword.com/guides/heyawake-guide/')).toEqual({
      location: 'https://ruleword.com/guides/heyawake/',
    })
  })

  it('does not redirect canonical URLs', () => {
    expect(getSeoRedirect('https://ruleword.com/games/sudoku/')).toBeNull()
  })
})
