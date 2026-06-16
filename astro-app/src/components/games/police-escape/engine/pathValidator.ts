// Validate a player-drawn path against the static constraints.
//
// Rules:
//   - Path is non-empty and starts exactly at thiefStart.
//   - Each consecutive pair is orthogonally adjacent (Manhattan distance 1).
//   - No cell repeats (no loops).
//   - No wall cells, no unmelted-ice cells (ice at step i is blocked if meltAt > i).
//   - Path ends at an exit cell.
//   - All required keys are collected along the path (path includes those key cells).
//
// Note: portal handling. Entering a portal cell teleports to the paired end. We model this
// by treating portal entry as a single "step" that lands on the paired cell. The path the
// player draws therefore must include either the literal portal entry cell (we teleport) or
// go around. For validation we accept the path as-drawn (no teleport insertion); the
// simulator handles the actual teleport at runtime. This keeps the player's drawn path
// intuitive: they drag through cells, portals are surprise mechanics evaluated at Go time.

import type { Level, Path, ValidationResult } from './types'

export function validatePath(level: Level, path: Path): ValidationResult {
  if (path.length === 0) return { valid: false, reason: 'Path is empty' }

  const { size, thiefStart, requiredKeys } = level

  // Must start at thief start.
  if (path[0].r !== thiefStart.r || path[0].c !== thiefStart.c) {
    return { valid: false, reason: 'Path must start at the thief' }
  }

  // Track visited for no-repeat.
  const seen = new Set<string>()
  seen.add(`${path[0].r},${path[0].c}`)

  // Collect keys along the path.
  const keysHit = new Set<number>()

  for (let i = 0; i < path.length; i++) {
    const { r, c } = path[i]
    if (!inBounds(r, c, size)) return { valid: false, reason: `Cell (${r+1},${c+1}) out of bounds` }
    const cell = level.grid[r][c]
    if (cell.kind === 'wall') return { valid: false, reason: `Path crosses a wall at (${r+1},${c+1})` }
    if (cell.kind === 'ice' && cell.meltAt !== undefined && i < cell.meltAt) {
      return { valid: false, reason: `Path crosses an unmelted ice block at (${r+1},${c+1})` }
    }
    if (i > 0) {
      const prev = path[i - 1]
      const dist = Math.abs(prev.r - r) + Math.abs(prev.c - c)
      if (dist !== 1) {
        return { valid: false, reason: `Non-adjacent step at (${r+1},${c+1})` }
      }
      if (seen.has(`${r},${c}`)) {
        return { valid: false, reason: `Path repeats cell (${r+1},${c+1})` }
      }
      seen.add(`${r},${c}`)
    }
    if (cell.kind === 'key' && cell.keyId !== undefined) keysHit.add(cell.keyId)
  }

  // Must end at exit.
  const last = path[path.length - 1]
  const lastCell = level.grid[last.r][last.c]
  if (lastCell.kind !== 'exit') {
    return { valid: false, reason: 'Path must end at an exit' }
  }

  // All required keys collected?
  for (const k of requiredKeys) {
    if (!keysHit.has(k)) return { valid: false, reason: `Missing key ${k}` }
  }

  return { valid: true }
}

function inBounds(r: number, c: number, size: number): boolean {
  return r >= 0 && r < size && c >= 0 && c < size
}
