import rawLevels from '../data/original-levels.json'
import type { OriginalLevel } from './graphTypes'

const empty = <T>(value: T[] | null | undefined): T[] => value ?? []

function normalize(level: OriginalLevel): OriginalLevel {
  return {
    ...level,
    policeNodeIds: empty(level.policeNodeIds).length > 0
      ? empty(level.policeNodeIds)
      : level.policeNodeId >= 0 ? [level.policeNodeId] : [],
    sleepingPoliceNodeIds: empty(level.sleepingPoliceNodeIds),
    keyNodeIds: empty(level.keyNodeIds),
    stunNodeIds: empty(level.stunNodeIds),
    iceNodes: empty(level.iceNodes),
    teleportPairs: empty(level.teleportPairs),
    springNodeIds: empty(level.springNodeIds),
    spikeNodeIds: empty(level.spikeNodeIds),
    spikesStartingOn: empty(level.spikesStartingOn),
    shieldNodeIds: empty(level.shieldNodeIds),
    movingNodes: empty(level.movingNodes),
    bridges: empty(level.bridges),
  }
}

export const ORIGINAL_LEVELS = (rawLevels as OriginalLevel[]).map(normalize)

export function getOriginalLevel(index: number): OriginalLevel {
  return ORIGINAL_LEVELS[index] ?? ORIGINAL_LEVELS[0]
}
