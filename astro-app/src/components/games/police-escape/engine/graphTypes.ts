export type GraphNode = {
  id: number
  x: number
  y: number
}

export type GraphConnection = {
  fromNodeId: number
  toNodeId: number
  length: number
}

export type TeleportPair = { nodeA: number; nodeB: number }
export type IceNode = { nodeId: number; counter: number }
export type Bridge = { triggerNodeId: number; otherNodeId: number }
export type MovingNode = { sourceNodeId: number; destinationNodeId: number; pivotNodeId: number }

export type OriginalLevel = {
  sourceLevel: number
  lengthScale: number
  autofit: boolean
  scale: number
  policeNodeId: number
  policeNodeIds?: number[] | null
  sleepingPoliceNodeIds?: number[] | null
  viktorNodeId: number
  exitNodeId: number
  exitANodeId: number
  exitBNodeId: number
  keyNodeIds?: number[] | null
  stunNodeIds?: number[] | null
  iceNodes?: Array<IceNode | number> | null
  backgroundIndex: number
  teleportPairs?: TeleportPair[] | null
  springNodeIds?: number[] | null
  spikeNodeIds?: number[] | null
  spikesStartingOn?: number[] | null
  shieldNodeIds?: number[] | null
  movingNodes?: MovingNode[] | null
  bridges?: Bridge[] | null
  nodes: GraphNode[]
  connections: GraphConnection[]
}

export type PoliceState = {
  nodeId: number
  sleeping: boolean
  stunnedTurns: number
}

export type GraphGameState = {
  viktorNodeId: number
  previousViktorNodeId: number | null
  police: PoliceState[]
  keysCollected: number[]
  shields: number
  visitedNodeIds: number[]
  turn: number
  outcome: 'playing' | 'won' | 'lost'
  message: string
}

export type MoveResult = {
  state: GraphGameState
  valid: boolean
  teleported: boolean
  sprung: boolean
}
