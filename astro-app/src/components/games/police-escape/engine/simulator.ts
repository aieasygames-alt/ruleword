// Simulator (semi real-time model). The thief walks the player's path cell-by-cell; after
// each thief move, every police takes one step along its BFS shortest path to the thief's
// new position (patrol fallback when unreachable). Collision is checked after each frame:
//   - same cell (police on thief) → lose
//   - swap (police and thief traded cells this frame) → lose
// Win: thief on an open exit cell with all required keys.
//
// Returns the full frame list so the UI can animate the playback.
//
// "step" = number of thief moves made (1-based). Ice meltAt and exit-toggle openSteps are
// evaluated against this counter.

import type { Coord, Frame, Level, Path, SimResult } from './types'
import { nextPoliceStep } from './policeAI'
import { validatePath } from './pathValidator'

export function simulate(level: Level, path: Path): SimResult {
  const v = validatePath(level, path)
  if (!v.valid) return { outcome: 'invalid', reason: v.reason }

  const frames: Frame[] = []
  let thief: Coord = { ...level.thiefStart }
  let police: Coord[] = level.police.map(p => ({ ...p.start }))
  const keysCollected = new Set<number>()
  const portals = level.portals

  // Collect key if thief starts on one.
  collectKeyAt(level, thief, keysCollected)

  if (police.some(p => p.r === thief.r && p.c === thief.c)) {
    return { outcome: 'lose', frames, loseStep: 0, reason: 'Police started on thief' }
  }

  for (let i = 1; i < path.length; i++) {
    const step = i
    const prevThief = thief
    thief = { ...path[i] }

    let portalTeleported = false
    const portalHit = findPortalAt(portals, thief)
    if (portalHit) {
      thief = pairedEnd(portalHit, thief)
      portalTeleported = true
    }

    collectKeyAt(level, thief, keysCollected)

    const oldPolice = police.map(p => ({ ...p }))
    police = police.map((p, idx) => {
      const patrol = level.police[idx]?.patrol ?? []
      return nextPoliceStep(level, p, patrol, thief, step)
    })

    const exitOpen = isExitOpen(level, step)
    frames.push({
      step,
      thief: { ...thief },
      police: police.map(p => ({ ...p })),
      keysCollected: Array.from(keysCollected).sort((a, b) => a - b),
      exitOpen,
      portalTeleported,
    })

    // Same-cell collision.
    if (police.some(p => p.r === thief.r && p.c === thief.c)) {
      return { outcome: 'lose', frames, loseStep: step, reason: 'Caught by police' }
    }
    // Swap: thief's new pos == police's old pos AND police's new pos == thief's old pos.
    for (let pi = 0; pi < police.length; pi++) {
      if (police[pi].r === prevThief.r && police[pi].c === prevThief.c &&
          oldPolice[pi].r === thief.r && oldPolice[pi].c === thief.c) {
        return { outcome: 'lose', frames, loseStep: step, reason: 'Crossed paths with police' }
      }
    }

    // Win check.
    const cell = level.grid[thief.r][thief.c]
    if (cell.kind === 'exit') {
      const hasAllKeys = level.requiredKeys.every(k => keysCollected.has(k))
      if (exitOpen && hasAllKeys) {
        return { outcome: 'win', frames, winStep: step }
      }
    }
  }

  return { outcome: 'invalid', reason: 'Path ended without a valid escape' }
}

function collectKeyAt(level: Level, pos: Coord, keys: Set<number>) {
  const cell = level.grid[pos.r]?.[pos.c]
  if (cell?.kind === 'key' && cell.keyId !== undefined) keys.add(cell.keyId)
}

function findPortalAt(portals: Level['portals'], pos: Coord) {
  return portals.find(p =>
    (p.a.r === pos.r && p.a.c === pos.c) || (p.b.r === pos.r && p.b.c === pos.c)
  )
}

function pairedEnd(portal: Level['portals'][number], pos: Coord): Coord {
  if (portal.a.r === pos.r && portal.a.c === pos.c) return { ...portal.b }
  return { ...portal.a }
}

function isExitOpen(level: Level, step: number): boolean {
  if (!level.exitToggle) return true
  const { period, openSteps } = level.exitToggle
  return openSteps.includes(step % period)
}
