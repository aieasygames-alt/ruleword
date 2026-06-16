// Police AI: pure function deciding each police's next cell on a given turn.
//
// Rule (per PRD): on its turn, a police tries to step along the BFS shortest path to the
// thief's CURRENT cell. If no path exists (thief walled off, or ice blocks the way), the
// police falls back to walking its patrol loop: pick the next patrol point and step toward it.
//
// If the police is already on the thief's cell, it stays (this is a loss, caught by simulator).

import type { Coord, Level } from './types'
import { bfsPath, policeBlocker } from './pathfinding'

export function nextPoliceStep(
  level: Level,
  policePos: Coord,
  policePatrol: Coord[],
  thiefPos: Coord,
  currentStep: number,
): Coord {
  // Already on thief? Don't move.
  if (policePos.r === thiefPos.r && policePos.c === thiefPos.c) return policePos

  const blocker = policeBlocker(level, currentStep)

  // 1) Try BFS to thief.
  const pathToThief = bfsPath(level, policePos, thiefPos, blocker)
  if (pathToThief && pathToThief.length >= 2) {
    return pathToThief[1]
  }

  // 2) Fallback: patrol. Walk toward the nearest patrol point (BFS), step one cell.
  //    If already on a patrol point, head to the next one in the patrol list.
  if (policePatrol.length === 0) return policePos

  // Find the patrol target: the next point in the patrol sequence after the current position,
  // or the closest patrol point if not currently on any.
  let target: Coord | null = null
  const onPatrolIdx = policePatrol.findIndex(p => p.r === policePos.r && p.c === policePos.c)
  if (onPatrolIdx >= 0) {
    target = policePatrol[(onPatrolIdx + 1) % policePatrol.length]
  } else {
    // closest by BFS
    let best: Coord | null = null
    let bestLen = Infinity
    for (const p of policePatrol) {
      const pth = bfsPath(level, policePos, p, blocker)
      if (pth && pth.length < bestLen) {
        bestLen = pth.length
        best = p
      }
    }
    target = best
  }
  if (!target) return policePos
  if (target.r === policePos.r && target.c === policePos.c) return policePos

  const pathToPatrol = bfsPath(level, policePos, target, blocker)
  if (pathToPatrol && pathToPatrol.length >= 2) return pathToPatrol[1]

  return policePos
}
