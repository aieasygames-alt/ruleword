import { describe, expect, it } from 'vitest'
import {
  canExtendFlowPath,
  isFlowFreeComplete,
  isFlowPathConnected,
  isOrthogonallyAdjacent,
  type FlowDot,
  type FlowPath,
} from '../src/games/flow-free/logic'

const dots: FlowDot[] = [
  { pos: { x: 0, y: 0 }, color: 'red' },
  { pos: { x: 1, y: 0 }, color: 'red' },
  { pos: { x: 0, y: 1 }, color: 'blue' },
  { pos: { x: 1, y: 1 }, color: 'blue' },
]

describe('Flow Free rules', () => {
  it('extends paths only through orthogonally adjacent cells', () => {
    expect(isOrthogonallyAdjacent({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true)
    expect(isOrthogonallyAdjacent({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(false)
  })

  it('starts and ends a completed path on matching color endpoints', () => {
    const path: FlowPath = { color: 'red', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] }
    expect(isFlowPathConnected(path, dots)).toBe(true)
  })

  it('prevents a path from crossing another color or entering its endpoint', () => {
    const red: FlowPath = { color: 'red', cells: [{ x: 0, y: 0 }] }
    const blue: FlowPath = { color: 'blue', cells: [{ x: 0, y: 1 }] }

    expect(canExtendFlowPath(red, { x: 0, y: 1 }, [blue], dots)).toBe(false)
  })

  it('requires every color to connect and every board cell to be filled', () => {
    const paths: FlowPath[] = [
      { color: 'red', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
      { color: 'blue', cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }] },
    ]
    expect(isFlowFreeComplete(paths, { size: 2, dots })).toBe(true)
    expect(isFlowFreeComplete(paths.slice(0, 1), { size: 2, dots })).toBe(false)
  })
})
