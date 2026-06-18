import { describe, expect, it } from 'vitest'
import {
  generateMemoryPattern,
  getMemoryMatrixGridSize,
  isMemoryPatternMatch,
} from '../src/games/memory-matrix/logic'
import {
  checkMemorySequenceInput,
  generateMemorySequence,
} from '../src/games/memory-grid/logic'

describe('Memory Matrix rules', () => {
  it('generates unique in-range pattern cells', () => {
    const pattern = generateMemoryPattern(9, 5, (() => {
      let value = 0
      return () => (value++ % 9) / 9
    })())
    expect(new Set(pattern).size).toBe(5)
    expect(pattern.every(cell => cell >= 0 && cell < 9)).toBe(true)
  })

  it('matches selections as a set and caps grid growth', () => {
    expect(isMemoryPatternMatch([1, 2, 3], [3, 1, 2])).toBe(true)
    expect(isMemoryPatternMatch([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(getMemoryMatrixGridSize(99)).toBe(7)
  })
})

describe('Memory Grid rules', () => {
  it('generates the requested sequence length within the grid', () => {
    const sequence = generateMemorySequence(4, () => 0.99)
    expect(sequence).toEqual([8, 8, 8, 8])
  })

  it('requires ordered input and stops on the first mistake', () => {
    expect(checkMemorySequenceInput([1, 2, 3], [1])).toBe('pending')
    expect(checkMemorySequenceInput([1, 2, 3], [1, 3])).toBe('wrong')
    expect(checkMemorySequenceInput([1, 2, 3], [1, 2, 3])).toBe('correct')
  })
})
