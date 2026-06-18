import { describe, expect, it } from 'vitest'
import {
  SOKOBAN_LEVELS,
  countSokobanBoxesAndGoals,
  isSokobanWon,
  moveSokoban,
  parseSokobanLevel,
  solveSokobanLevel,
} from '../src/games/sokoban/logic'

describe('Sokoban rules', () => {
  it('blocks movement through walls', () => {
    const state = parseSokobanLevel(['###', '#@#', '###'])
    expect(moveSokoban(state, -1, 0)).toEqual({ state, moved: false, pushed: false })
  })

  it('pushes a box into a free target but never pulls it', () => {
    const state = parseSokobanLevel(['#####', '#@$.#', '#####'])
    const result = moveSokoban(state, 0, 1)

    expect(result.moved).toBe(true)
    expect(result.pushed).toBe(true)
    expect(result.state.board[1].join('')).toBe('# @*#')
    expect(isSokobanWon(result.state.board)).toBe(true)
  })

  it('does not push when the square behind a box is blocked', () => {
    const wall = parseSokobanLevel(['#####', '#@$##', '#####'])
    const box = parseSokobanLevel(['######', '#@$$ #', '######'])

    expect(moveSokoban(wall, 0, 1).moved).toBe(false)
    expect(moveSokoban(box, 0, 1).moved).toBe(false)
  })

  it('restores a target after a box leaves it', () => {
    const state = parseSokobanLevel(['######', '# @*.#', '######'])
    const result = moveSokoban(state, 0, 1)

    expect(result.state.board[1].join('')).toBe('#  +*#')
  })

  it('keeps box and goal counts balanced in every built-in level', () => {
    for (const level of Object.values(SOKOBAN_LEVELS)) {
      expect(countSokobanBoxesAndGoals(level)).toEqual(
        expect.objectContaining({ balanced: true }),
      )
    }
  })

  it('finds a solution for every built-in level', () => {
    for (const level of Object.values(SOKOBAN_LEVELS)) {
      expect(solveSokobanLevel(level, 100_000)).not.toBeNull()
    }
  })
})
