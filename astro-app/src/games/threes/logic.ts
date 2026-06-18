export type ThreesDirection = 'up' | 'down' | 'left' | 'right'

export function getThreesDailySeed(date = new Date()): number {
  const start = Date.UTC(2024, 0, 1)
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.floor((current - start) / 86400000)
}

export function canMergeThrees(first: number, second: number): boolean {
  if (first === 0 || second === 0) return false
  if (first + second === 3) return true
  return first >= 3 && first === second
}

export function slideThreesRow(
  row: number[],
  size = row.length,
): { row: number[]; score: number; moved: boolean } {
  const compact = row.filter(value => value !== 0)
  const result: number[] = []
  let score = 0

  for (let index = 0; index < compact.length; index++) {
    if (
      index + 1 < compact.length &&
      canMergeThrees(compact[index], compact[index + 1])
    ) {
      const merged = compact[index] + compact[index + 1]
      result.push(merged)
      score += merged
      index++
    } else {
      result.push(compact[index])
    }
  }

  while (result.length < size) result.push(0)

  return {
    row: result,
    score,
    moved: row.some((value, index) => value !== result[index]),
  }
}

export function moveThreesGrid(
  grid: number[][],
  direction: ThreesDirection,
): { grid: number[][]; score: number; moved: boolean } {
  const size = grid.length
  const next = grid.map(row => [...row])
  let score = 0
  let moved = false

  const applyLine = (line: number[]) => {
    const result = slideThreesRow(line, size)
    score += result.score
    moved ||= result.moved
    return result.row
  }

  if (direction === 'left' || direction === 'right') {
    for (let row = 0; row < size; row++) {
      const source = direction === 'right' ? [...next[row]].reverse() : next[row]
      const result = applyLine(source)
      next[row] = direction === 'right' ? result.reverse() : result
    }
  } else {
    for (let col = 0; col < size; col++) {
      const column = next.map(row => row[col])
      const source = direction === 'down' ? column.reverse() : column
      const result = applyLine(source)
      const finalColumn = direction === 'down' ? result.reverse() : result
      for (let row = 0; row < size; row++) next[row][col] = finalColumn[row]
    }
  }

  return { grid: next, score, moved }
}

export function canMoveThrees(grid: number[][]): boolean {
  const size = grid.length

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0) return true
      if (
        row + 1 < size &&
        canMergeThrees(grid[row][col], grid[row + 1][col])
      ) return true
      if (
        col + 1 < size &&
        canMergeThrees(grid[row][col], grid[row][col + 1])
      ) return true
    }
  }

  return false
}

export function moveAndSpawnThreesTile(
  grid: number[][],
  direction: ThreesDirection,
  nextTile: number,
  random = Math.random,
): { grid: number[][]; score: number; moved: boolean; spawned: boolean } {
  const result = moveThreesGrid(grid, direction)
  if (!result.moved) return { ...result, spawned: false }

  const next = result.grid.map(row => [...row])
  const emptyCells: [number, number][] = []
  next.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
    if (value === 0) emptyCells.push([rowIndex, colIndex])
  }))
  if (emptyCells.length === 0) return { ...result, grid: next, spawned: false }

  const [row, col] = emptyCells[Math.floor(random() * emptyCells.length)]
  next[row][col] = nextTile
  return { ...result, grid: next, spawned: true }
}
