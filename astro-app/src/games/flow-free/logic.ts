export type FlowPosition = { x: number; y: number }
export type FlowDot = { pos: FlowPosition; color: string }
export type FlowPath = { color: string; cells: FlowPosition[] }
export type FlowLevel = { size: number; dots: FlowDot[] }

function samePosition(first: FlowPosition, second: FlowPosition): boolean {
  return first.x === second.x && first.y === second.y
}

export function isOrthogonallyAdjacent(
  first: FlowPosition,
  second: FlowPosition,
): boolean {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y) === 1
}

export function isFlowPathConnected(path: FlowPath, dots: FlowDot[]): boolean {
  if (path.cells.length < 2) return false
  const endpoints = dots.filter(dot => dot.color === path.color)
  if (endpoints.length !== 2) return false
  const first = path.cells[0]
  const last = path.cells[path.cells.length - 1]
  return endpoints.some(dot => samePosition(dot.pos, first)) &&
    endpoints.some(dot => samePosition(dot.pos, last)) &&
    !samePosition(first, last)
}

export function canExtendFlowPath(
  path: FlowPath,
  next: FlowPosition,
  completedPaths: FlowPath[],
  dots: FlowDot[],
): boolean {
  const last = path.cells[path.cells.length - 1]
  if (!last || !isOrthogonallyAdjacent(last, next)) return false
  if (completedPaths.some(other => other.cells.some(cell => samePosition(cell, next)))) {
    return false
  }
  const dot = dots.find(candidate => samePosition(candidate.pos, next))
  return !dot || dot.color === path.color
}

export function isFlowFreeComplete(
  paths: FlowPath[],
  level: FlowLevel,
): boolean {
  const colors = new Set(level.dots.map(dot => dot.color))
  if (paths.length !== colors.size) return false
  if (!paths.every(path => isFlowPathConnected(path, level.dots))) return false

  const occupied = new Set<string>()
  for (const path of paths) {
    for (const cell of path.cells) {
      const key = `${cell.x},${cell.y}`
      if (occupied.has(key)) return false
      occupied.add(key)
    }
  }
  return occupied.size === level.size * level.size
}
