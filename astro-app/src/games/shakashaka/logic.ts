export type ShakashakaTriangle = 'TL' | 'TR' | 'BL' | 'BR'

export type ShakashakaCell = {
  isBlack: boolean
  clue: number | null
  triangle: ShakashakaTriangle | null
}

export type ShakashakaCoord = [number, number]

export type ShakashakaCheckError = {
  message: string
  cells: ShakashakaCoord[]
}

const TRIANGLE_CYCLE: ShakashakaTriangle[] = ['TL', 'TR', 'BL', 'BR']

export function cycleShakashakaTriangle(cell: ShakashakaCell): ShakashakaCell {
  if (cell.isBlack) return cell
  if (cell.triangle === null) return { ...cell, triangle: 'TL' }

  const index = TRIANGLE_CYCLE.indexOf(cell.triangle)
  return {
    ...cell,
    triangle: index === TRIANGLE_CYCLE.length - 1 ? null : TRIANGLE_CYCLE[index + 1],
  }
}

export function createShakashakaGrid(
  size: number,
  clues: [number, number, number][],
): ShakashakaCell[][] {
  const grid: ShakashakaCell[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      isBlack: false,
      triangle: null,
      clue: null,
    })),
  )

  clues.forEach(([row, col, clue]) => {
    grid[row][col] = { isBlack: true, triangle: null, clue }
  })

  return grid
}

function inBounds(grid: ShakashakaCell[][], row: number, col: number): boolean {
  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length
}

export function checkShakashakaGrid(
  grid: ShakashakaCell[][],
): ShakashakaCheckError | null {
  const size = grid.length
  const filled = (cell: ShakashakaCell) => cell.isBlack || cell.triangle !== null

  for (let row = 0; row < size - 1; row++) {
    for (let col = 0; col < size - 1; col++) {
      if (
        filled(grid[row][col]) &&
        filled(grid[row + 1][col]) &&
        filled(grid[row][col + 1]) &&
        filled(grid[row + 1][col + 1])
      ) {
        return {
          message: '2×2 block of filled cells is not allowed',
          cells: [[row, col], [row + 1, col], [row, col + 1], [row + 1, col + 1]],
        }
      }
    }
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = grid[row][col]
      if (cell.clue === null) continue

      const neighbors: ShakashakaCoord[] = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ]
      const triangleCount = neighbors.filter(
        ([neighborRow, neighborCol]) =>
          inBounds(grid, neighborRow, neighborCol) &&
          grid[neighborRow][neighborCol].triangle !== null,
      ).length

      if (triangleCount !== cell.clue) {
        return {
          message: `Clue at row ${row + 1}, col ${col + 1} expects ${cell.clue} triangle${cell.clue === 1 ? '' : 's'} nearby, found ${triangleCount}`,
          cells: [[row, col]],
        }
      }
    }
  }

  const visited = grid.map(row => row.map(() => false))
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (visited[row][col] || filled(grid[row][col])) continue

      const region: ShakashakaCoord[] = []
      const queue: ShakashakaCoord[] = [[row, col]]
      visited[row][col] = true

      while (queue.length > 0) {
        const [currentRow, currentCol] = queue.shift()!
        region.push([currentRow, currentCol])

        const neighbors: ShakashakaCoord[] = [
          [currentRow - 1, currentCol],
          [currentRow + 1, currentCol],
          [currentRow, currentCol - 1],
          [currentRow, currentCol + 1],
        ]
        for (const [neighborRow, neighborCol] of neighbors) {
          if (
            !inBounds(grid, neighborRow, neighborCol) ||
            visited[neighborRow][neighborCol] ||
            filled(grid[neighborRow][neighborCol])
          ) continue

          visited[neighborRow][neighborCol] = true
          queue.push([neighborRow, neighborCol])
        }
      }

      const rows = region.map(([regionRow]) => regionRow)
      const cols = region.map(([, regionCol]) => regionCol)
      const expectedArea =
        (Math.max(...rows) - Math.min(...rows) + 1) *
        (Math.max(...cols) - Math.min(...cols) + 1)

      if (region.length !== expectedArea) {
        return {
          message: 'A white region is not a rectangle',
          cells: region,
        }
      }
    }
  }

  return null
}
