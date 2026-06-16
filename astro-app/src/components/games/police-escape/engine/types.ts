// Police Escape — shared engine types.
// All engine modules are pure (no React, no DOM) so they can be unit-tested directly.

export type Coord = { r: number; c: number }

// Cell kinds. Walls block movement; ice blocks until its melt threshold is reached.
// Floor is the default passable cell. Keys must be collected before exit. Portals come
// in pairs (matched by portalId); entering one end places the thief at the other end.
export type CellKind = 'floor' | 'wall' | 'ice' | 'key' | 'exit'

export type Cell = {
  kind: CellKind
  meltAt?: number
  keyId?: number
  exitId?: number
}

export type Police = {
  start: Coord
  patrol: Coord[]
}

export type Portal = {
  id: number
  a: Coord
  b: Coord
}

// Static level definition (data only).
export type Level = {
  id: number
  size: number
  grid: Cell[][]
  thiefStart: Coord
  police: Police[]
  portals: Portal[]
  exitToggle?: { period: number; openSteps: number[] }
  requiredKeys: number[]
  name: string
  nameZh: string
}

// A player-drawn path is a list of cells starting at thiefStart.
export type Path = Coord[]

// One animation frame in the real-time playback. Each frame advances the thief by one cell
// along its path AND every police by one cell. We record the post-move positions.
export type Frame = {
  step: number         // 1-based thief move count
  thief: Coord         // thief's position after this frame's move (post-teleport)
  police: Coord[]      // each police's position after this frame's move
  keysCollected: number[]
  exitOpen: boolean    // whether exit is open on this step (for the toggle mechanic)
  portalTeleported: boolean // true if the thief hit a portal this frame
}

export type SimResult =
  | { outcome: 'win'; frames: Frame[]; winStep: number }
  | { outcome: 'lose'; frames: Frame[]; loseStep: number; reason: string }
  | { outcome: 'invalid'; reason: string }

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: string }
