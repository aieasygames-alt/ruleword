export function generateMemoryPattern(
  totalCells: number,
  patternSize: number,
  random: () => number = Math.random,
): number[] {
  const cells = new Set<number>()
  while (cells.size < Math.min(totalCells, patternSize)) {
    cells.add(Math.floor(random() * totalCells))
  }
  return [...cells]
}

export function isMemoryPatternMatch(pattern: number[], guess: number[]): boolean {
  return pattern.length === guess.length && pattern.every(cell => guess.includes(cell))
}

export function getMemoryMatrixGridSize(level: number): number {
  return Math.min(7, Math.floor(3 + level / 3))
}
