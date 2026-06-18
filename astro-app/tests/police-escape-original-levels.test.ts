import { describe, expect, it } from 'vitest'
import { createGraphGame, isBridgeActive, moveViktor, neighbors, shortestPath } from '../src/components/games/police-escape/engine/graphEngine'
import { ORIGINAL_LEVELS } from '../src/components/games/police-escape/engine/originalLevels'
import type { OriginalLevel } from '../src/components/games/police-escape/engine/graphTypes'

describe('reverse-engineered Police Escape levels', () => {
  it('loads all 183 original configurations in source order', () => {
    expect(ORIGINAL_LEVELS).toHaveLength(183)
    expect(ORIGINAL_LEVELS.map(level => level.sourceLevel)).toEqual(
      Array.from({ length: 183 }, (_, index) => index),
    )
  })

  it('only references nodes that exist in each level', () => {
    for (const level of ORIGINAL_LEVELS) {
      const ids = new Set(level.nodes.map(node => node.id))
      expect(ids.has(level.viktorNodeId), `level ${level.sourceLevel} viktor`).toBe(true)
      for (const police of level.policeNodeIds ?? []) {
        expect(ids.has(police), `level ${level.sourceLevel} police ${police}`).toBe(true)
      }
      for (const edge of level.connections) {
        expect(ids.has(edge.fromNodeId), `level ${level.sourceLevel} edge from`).toBe(true)
        expect(ids.has(edge.toNodeId), `level ${level.sourceLevel} edge to`).toBe(true)
      }
    }
  })

  it('reconstructs level 1 as the extracted five-node graph', () => {
    const level = ORIGINAL_LEVELS[1]
    expect(level.nodes).toHaveLength(5)
    expect(level.connections).toHaveLength(4)
    expect(level.viktorNodeId).toBe(12)
    expect(level.policeNodeIds).toEqual([11])
    expect(shortestPath(level, 12, 15)).toEqual([12, 13, 14, 15])
  })

  it('moves Viktor one graph edge and advances police one shortest-path step', () => {
    const level = ORIGINAL_LEVELS[1]
    const initial = createGraphGame(level)
    const result = moveViktor(level, initial, 13)
    expect(result.valid).toBe(true)
    expect(result.state.viktorNodeId).toBe(13)
    expect(result.state.police[0].nodeId).toBe(12)
    expect(result.state.turn).toBe(1)
  })

  it('supports key collection, portals, and shields in isolated graph fixtures', () => {
    const level: OriginalLevel = {
      sourceLevel: 999,
      lengthScale: 1,
      autofit: false,
      scale: 1,
      policeNodeId: 4,
      policeNodeIds: [4],
      sleepingPoliceNodeIds: [],
      viktorNodeId: 1,
      exitNodeId: 5,
      exitANodeId: -1,
      exitBNodeId: -1,
      keyNodeIds: [2],
      stunNodeIds: [],
      iceNodes: [],
      backgroundIndex: 0,
      teleportPairs: [{ nodeA: 3, nodeB: 5 }],
      springNodeIds: [],
      spikeNodeIds: [],
      spikesStartingOn: [],
      shieldNodeIds: [2],
      movingNodes: [],
      bridges: [],
      nodes: [1, 2, 3, 4, 5].map(id => ({ id, x: id, y: 0 })),
      connections: [
        { fromNodeId: 1, toNodeId: 2, length: 1 },
        { fromNodeId: 2, toNodeId: 3, length: 1 },
        { fromNodeId: 3, toNodeId: 4, length: 1 },
        { fromNodeId: 4, toNodeId: 5, length: 1 },
      ],
    }
    const first = moveViktor(level, createGraphGame(level), 2).state
    expect(first.keysCollected).toEqual([2])
    expect(first.shields).toBe(1)
    const second = moveViktor(level, first, 3).state
    expect(second.viktorNodeId).toBe(5)
    expect(second.outcome).toBe('won')
  })

  it('exposes only directly connected nodes as legal moves', () => {
    const level = ORIGINAL_LEVELS[0]
    const state = createGraphGame(level)
    const legal = neighbors(level, state.viktorNodeId, state)
    expect(legal.length).toBeGreaterThan(0)
    expect(legal.every(id => level.nodes.some(node => node.id === id))).toBe(true)
  })

  it('treats a connection marked as a bridge as dynamically gated, not always open', () => {
    const level = ORIGINAL_LEVELS[0]
    const initial = createGraphGame(level)
    expect(level.connections.some(edge =>
      (edge.fromNodeId === 9 && edge.toNodeId === 13)
      || (edge.fromNodeId === 13 && edge.toNodeId === 9),
    )).toBe(true)
    expect(isBridgeActive(level, 0, initial)).toBe(false)
    expect(neighbors(level, 9, initial)).not.toContain(13)

    const viktorOnTrigger = { ...initial, viktorNodeId: 9 }
    expect(isBridgeActive(level, 0, viktorOnTrigger)).toBe(true)
    expect(neighbors(level, 9, viktorOnTrigger)).toContain(13)

    const policeOnTrigger = {
      ...initial,
      police: initial.police.map((officer, index) => index === 0 ? { ...officer, nodeId: 9 } : officer),
    }
    expect(isBridgeActive(level, 0, policeOnTrigger)).toBe(true)
    expect(neighbors(level, 13, policeOnTrigger)).toContain(9)
  })

  it('chooses spring destinations randomly instead of projecting along the incoming direction', () => {
    const level: OriginalLevel = {
      sourceLevel: 1000,
      lengthScale: 1,
      autofit: false,
      scale: 1,
      policeNodeId: -1,
      policeNodeIds: [],
      sleepingPoliceNodeIds: [],
      viktorNodeId: 1,
      exitNodeId: 4,
      exitANodeId: -1,
      exitBNodeId: -1,
      keyNodeIds: [],
      stunNodeIds: [],
      iceNodes: [],
      backgroundIndex: 0,
      teleportPairs: [],
      springNodeIds: [2],
      spikeNodeIds: [],
      spikesStartingOn: [],
      shieldNodeIds: [],
      movingNodes: [],
      bridges: [],
      nodes: [
        { id: 1, x: 0, y: 0 },
        { id: 2, x: 1, y: 0 },
        { id: 3, x: 2, y: 0 },
        { id: 4, x: 1, y: 1 },
      ],
      connections: [
        { fromNodeId: 1, toNodeId: 2, length: 1 },
        { fromNodeId: 2, toNodeId: 3, length: 1 },
        { fromNodeId: 2, toNodeId: 4, length: 1 },
      ],
    }

    expect(moveViktor(level, createGraphGame(level), 2, () => 0).state.viktorNodeId).toBe(3)
    expect(moveViktor(level, createGraphGame(level), 2, () => 0.999).state.viktorNodeId).toBe(4)
  })
})
