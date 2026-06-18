export type Direction2048 = 'up' | 'down' | 'left' | 'right'

export function slide2048Row(row: number[]): { row: number[]; score: number } {
  const compact = row.filter(value => value !== 0)
  const result: number[] = []
  let score = 0

  for (let index = 0; index < compact.length; index++) {
    if (index + 1 < compact.length && compact[index] === compact[index + 1]) {
      const merged = compact[index] * 2
      result.push(merged)
      score += merged
      index++
    } else {
      result.push(compact[index])
    }
  }

  while (result.length < row.length) result.push(0)
  return { row: result, score }
}

function rotateClockwise(grid: number[][]): number[][] {
  const size = grid.length
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => grid[size - 1 - col][row]),
  )
}

function rotateGrid(grid: number[][], times: number): number[][] {
  let result = grid.map(row => [...row])
  for (let turn = 0; turn < times; turn++) result = rotateClockwise(result)
  return result
}

export function move2048Grid(
  grid: number[][],
  direction: Direction2048,
): { grid: number[][]; score: number; moved: boolean } {
  const rotations: Record<Direction2048, number> = {
    left: 0,
    up: 3,
    right: 2,
    down: 1,
  }
  const turns = rotations[direction]
  const oriented = rotateGrid(grid, turns)
  let score = 0
  const movedGrid = oriented.map(row => {
    const result = slide2048Row(row)
    score += result.score
    return result.row
  })
  const restored = rotateGrid(movedGrid, (4 - turns) % 4)
  const moved = grid.some((row, rowIndex) =>
    row.some((value, colIndex) => value !== restored[rowIndex][colIndex]),
  )

  return { grid: restored, score, moved }
}

export function hasWon2048(grid: number[][]): boolean {
  return grid.some(row => row.some(value => value >= 2048))
}

export function canMove2048(grid: number[][]): boolean {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const value = grid[row][col]
      if (value === 0) return true
      if (col + 1 < grid[row].length && value === grid[row][col + 1]) return true
      if (row + 1 < grid.length && value === grid[row + 1][col]) return true
    }
  }

  return false
}
