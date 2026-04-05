// ===== TYPE DEFINITIONS =====

// Use explicit export type for better Vite compatibility
export type Direction = 'up' | 'down' | 'left' | 'right'

// Path segment type - each segment is one grid cell
export type SegmentType = 'head' | 'body' | 'tail'

// Path segment - each segment occupies one grid cell
export interface PathSegment {
  row: number
  col: number
  type: SegmentType  // head: arrow head showing direction, body: connecting line, tail: tail end
}

export interface Arrow {
  id: number
  row: number  // Head position
  col: number
  direction: Direction  // Single direction
  segments: PathSegment[]  // Path segments from head to tail
  colorIndex: number  // Color index for this arrow
  isExiting: boolean
  isBlocked: boolean
  exitProgress: number
  blockedTimer: number
}

export interface NumberBlock {
  row: number
  col: number
  hits: number
  maxHits: number
}

export interface Wall {
  row: number
  col: number
}

export interface IceBlock {
  row: number
  col: number
  frozenArrows: number[]
  thawTurns: number
}

export interface Teleporter {
  id: number
  row: number
  col: number
  pairId: number
}

export interface LevelData {
  id: number
  name: string
  nameZh: string
  gridSize: number
  arrows: { row: number; col: number; direction: Direction; segments: PathSegment[]; colorIndex: number }[]
  numberBlocks?: { row: number; col: number; maxHits: number }[]
  walls?: { row: number; col: number }[]
  iceBlocks?: { row: number; col: number }[]
  teleporters?: { row: number; col: number; pairId: number }[]
  maxMistakes: number
  chapter: number
  algorithm?: string
  timeLimit?: number
}

export interface SavedProgress {
  completedLevels: number[]
  stars: Record<number, number>
  dailyCompleted?: string
  bestTimes?: Record<number, number>
}

export type AlgoType = 'basic' | 'aztec' | 'snake' | 'spaghetti' | 'loopy' | 'country'

// Positioned arrow with path segments
export interface PositionedArrow {
  row: number
  col: number
  direction: Direction
  segments: PathSegment[]
  colorIndex: number
}

export interface Settings {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

export interface ArrowPuzzleProps {
  settings: Settings
  onBack: () => void
}
