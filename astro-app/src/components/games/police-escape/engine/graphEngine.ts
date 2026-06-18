import type { GraphGameState, MoveResult, OriginalLevel } from './graphTypes'

const list = <T>(value: T[] | null | undefined): T[] => value ?? []

export function createGraphGame(level: OriginalLevel): GraphGameState {
  const sleepers = new Set(list(level.sleepingPoliceNodeIds))
  return {
    viktorNodeId: level.viktorNodeId,
    previousViktorNodeId: null,
    police: list(level.policeNodeIds).map(nodeId => ({
      nodeId,
      sleeping: sleepers.has(nodeId),
      stunnedTurns: 0,
    })),
    keysCollected: [],
    shields: 0,
    visitedNodeIds: [level.viktorNodeId],
    turn: 0,
    outcome: 'playing',
    message: '',
  }
}

export function exitsFor(level: OriginalLevel): number[] {
  return [level.exitNodeId, level.exitANodeId, level.exitBNodeId].filter(id => id >= 0)
}

function sameUndirectedEdge(from: number, to: number, a: number, b: number): boolean {
  return (from === a && to === b) || (from === b && to === a)
}

export function isBridgeActive(level: OriginalLevel, bridgeIndex: number, state: GraphGameState): boolean {
  const bridge = list(level.bridges)[bridgeIndex]
  if (!bridge) return false
  return state.viktorNodeId === bridge.triggerNodeId
    || state.police.some(officer => officer.nodeId === bridge.triggerNodeId)
}

export function isBridgeConnection(level: OriginalLevel, from: number, to: number): boolean {
  return list(level.bridges).some(bridge =>
    sameUndirectedEdge(from, to, bridge.triggerNodeId, bridge.otherNodeId),
  )
}

export function neighbors(level: OriginalLevel, nodeId: number, state?: GraphGameState): number[] {
  const result = new Set<number>()
  for (const edge of level.connections) {
    const bridgeIndex = list(level.bridges).findIndex(bridge =>
      sameUndirectedEdge(edge.fromNodeId, edge.toNodeId, bridge.triggerNodeId, bridge.otherNodeId),
    )
    if (bridgeIndex >= 0 && (!state || !isBridgeActive(level, bridgeIndex, state))) continue
    if (edge.fromNodeId === nodeId) result.add(edge.toNodeId)
    if (edge.toNodeId === nodeId) result.add(edge.fromNodeId)
  }
  return [...result]
}

export function isSpikeActive(level: OriginalLevel, nodeId: number, turn: number): boolean {
  if (!list(level.spikeNodeIds).includes(nodeId)) return false
  const startsOn = list(level.spikesStartingOn).includes(nodeId)
  return startsOn ? turn % 2 === 0 : turn % 2 === 1
}

export function openExits(level: OriginalLevel, turn: number): number[] {
  if (level.exitNodeId >= 0) return [level.exitNodeId]
  const dual = [level.exitANodeId, level.exitBNodeId].filter(id => id >= 0)
  if (dual.length < 2) return dual
  return [dual[turn % 2]]
}

export function moveViktor(
  level: OriginalLevel,
  current: GraphGameState,
  destination: number,
  random: () => number = Math.random,
): MoveResult {
  if (current.outcome !== 'playing') return { state: current, valid: false, teleported: false, sprung: false }
  if (!neighbors(level, current.viktorNodeId, current).includes(destination)) {
    return {
      state: { ...current, message: 'That node is not connected.' },
      valid: false,
      teleported: false,
      sprung: false,
    }
  }

  const turn = current.turn + 1
  let viktorNodeId = destination
  let teleported = false
  let sprung = false

  const portal = list(level.teleportPairs).find(pair => pair.nodeA === viktorNodeId || pair.nodeB === viktorNodeId)
  if (portal) {
    viktorNodeId = portal.nodeA === viktorNodeId ? portal.nodeB : portal.nodeA
    teleported = true
  }

  if (list(level.springNodeIds).includes(viktorNodeId)) {
    const springTarget = chooseSpringTarget(level, current.viktorNodeId, viktorNodeId, current, random)
    if (springTarget !== null) {
      viktorNodeId = springTarget
      sprung = true
    }
  }

  const keys = new Set(current.keysCollected)
  if (list(level.keyNodeIds).includes(viktorNodeId)) keys.add(viktorNodeId)
  let shields = current.shields + (list(level.shieldNodeIds).includes(viktorNodeId) && !current.visitedNodeIds.includes(viktorNodeId) ? 1 : 0)
  const visited = [...new Set([...current.visitedNodeIds, viktorNodeId])]

  if (isSpikeActive(level, viktorNodeId, turn)) {
    if (shields > 0) shields--
    else {
      return {
        valid: true, teleported, sprung,
        state: {
          ...current,
          previousViktorNodeId: current.viktorNodeId,
          viktorNodeId,
          keysCollected: [...keys],
          shields,
          visitedNodeIds: visited,
          turn,
          outcome: 'lost',
          message: 'The spikes were active.',
        },
      }
    }
  }

  const draft: GraphGameState = {
    ...current,
    previousViktorNodeId: current.viktorNodeId,
    viktorNodeId,
    keysCollected: [...keys],
    shields,
    visitedNodeIds: visited,
    turn,
    message: teleported ? 'Portal jump!' : sprung ? 'Spring launch!' : '',
  }

  const allKeys = list(level.keyNodeIds).every(id => keys.has(id))
  if (openExits(level, turn).includes(viktorNodeId) && allKeys) {
    return { valid: true, teleported, sprung, state: { ...draft, outcome: 'won', message: 'Escaped!' } }
  }

  const police = draft.police.map(officer => {
    if (officer.stunnedTurns > 0) return { ...officer, stunnedTurns: officer.stunnedTurns - 1 }
    if (officer.sleeping) {
      const distance = shortestPath(level, officer.nodeId, viktorNodeId, draft)?.length ?? Infinity
      const shouldWake = keys.size > 0 || distance <= 3
      if (!shouldWake) return officer
    }
    const path = shortestPath(level, officer.nodeId, viktorNodeId, draft)
    return { ...officer, sleeping: false, nodeId: path && path.length > 1 ? path[1] : officer.nodeId }
  })

  const caught = police.some(officer => officer.nodeId === viktorNodeId)
  if (caught) {
    if (shields > 0) {
      return {
        valid: true, teleported, sprung,
        state: { ...draft, police, shields: shields - 1, message: 'Shield absorbed the capture.' },
      }
    }
    return {
      valid: true, teleported, sprung,
      state: { ...draft, police, outcome: 'lost', message: 'Caught by police.' },
    }
  }

  return { valid: true, teleported, sprung, state: { ...draft, police } }
}

export function shortestPath(
  level: OriginalLevel,
  from: number,
  to: number,
  state?: GraphGameState,
): number[] | null {
  if (from === to) return [from]
  const queue = [from]
  const previous = new Map<number, number>()
  const seen = new Set([from])
  while (queue.length) {
    const current = queue.shift()!
    for (const next of neighbors(level, current, state)) {
      if (seen.has(next)) continue
      seen.add(next)
      previous.set(next, current)
      if (next === to) {
        const path = [to]
        let cursor = to
        while (cursor !== from) {
          cursor = previous.get(cursor)!
          path.unshift(cursor)
        }
        return path
      }
      queue.push(next)
    }
  }
  return null
}

function chooseSpringTarget(
  level: OriginalLevel,
  previousId: number,
  springId: number,
  state: GraphGameState,
  random: () => number,
): number | null {
  const candidates = neighbors(level, springId, state).filter(id => id !== previousId)
  if (candidates.length === 0) return null
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length))
  return candidates[index]
}
