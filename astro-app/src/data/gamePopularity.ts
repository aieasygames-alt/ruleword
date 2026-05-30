// Game popularity data for social proof signals
// Play counts are curated estimates representing "total plays since launch"
// Badges highlight trending/popular games on homepage and game pages

export interface GamePopularity {
  playCount: string        // Human-readable play count: "2.5M+", "850K+", "125K+"
  badge?: 'trending' | 'popular' | 'new' | 'editors-choice'
  numericCount: number     // Raw number for sorting
}

// Tier 1: Flagship games (1M+ plays)
const tier1: Record<string, GamePopularity> = {
  wordle: { playCount: '3.2M+', numericCount: 3200000, badge: 'trending' },
  sudoku: { playCount: '2.8M+', numericCount: 2800000, badge: 'popular' },
  '2048': { playCount: '2.5M+', numericCount: 2500000, badge: 'trending' },
  tetris: { playCount: '2.1M+', numericCount: 2100000, badge: 'popular' },
  chess: { playCount: '1.8M+', numericCount: 1800000, badge: 'popular' },
  'pac-man': { playCount: '1.5M+', numericCount: 1500000 },
  minesweeper: { playCount: '1.3M+', numericCount: 1300000 },
  solitaire: { playCount: '1.6M+', numericCount: 1600000, badge: 'popular' },
  crossword: { playCount: '1.1M+', numericCount: 1100000 },
  'spelling-bee': { playCount: '1.2M+', numericCount: 1200000 },
  memory: { playCount: '1.4M+', numericCount: 1400000 },
  snake: { playCount: '1.1M+', numericCount: 1100000 },
  'flappy-bird': { playCount: '1.3M+', numericCount: 1300000, badge: 'popular' },
  'word-search': { playCount: '1.0M+', numericCount: 1000000 },
  nonogram: { playCount: '1.0M+', numericCount: 1000000 },
}

// Tier 2: Featured / well-known games (500K-1M plays)
const tier2: Record<string, GamePopularity> = {
  'killer-sudoku': { playCount: '850K+', numericCount: 850000 },
  '2048-cupcakes': { playCount: '920K+', numericCount: 920000 },
  connections: { playCount: '780K+', numericCount: 780000, badge: 'trending' },
  'memory-grid': { playCount: '650K+', numericCount: 650000 },
  'aim-trainer': { playCount: '580K+', numericCount: 580000 },
  'chimp-test': { playCount: '520K+', numericCount: 520000 },
  'reaction-time': { playCount: '550K+', numericCount: 550000 },
  'typing-test': { playCount: '750K+', numericCount: 750000 },
  'mahjong-solitaire': { playCount: '820K+', numericCount: 820000 },
  'mahjong-titans': { playCount: '680K+', numericCount: 680000 },
  checkers: { playCount: '620K+', numericCount: 620000 },
  reversi: { playCount: '480K+', numericCount: 480000 },
  'chinese-chess': { playCount: '550K+', numericCount: 550000 },
  'tic-tac-toe': { playCount: '900K+', numericCount: 900000 },
  'connect-four': { playCount: '720K+', numericCount: 720000 },
  hangman: { playCount: '580K+', numericCount: 580000 },
  boggle: { playCount: '450K+', numericCount: 450000 },
  'word-scramble': { playCount: '420K+', numericCount: 420000 },
  'text-twist': { playCount: '380K+', numericCount: 380000 },
  wordscapes: { playCount: '650K+', numericCount: 650000 },
  'color-match': { playCount: '490K+', numericCount: 490000 },
  'speed-math': { playCount: '410K+', numericCount: 410000 },
  'trivia-quiz': { playCount: '520K+', numericCount: 520000 },
  'simon-says': { playCount: '460K+', numericCount: 460000 },
  jigsaw: { playCount: '600K+', numericCount: 600000 },
  'bubble-shooter': { playCount: '700K+', numericCount: 700000 },
  'match-three': { playCount: '620K+', numericCount: 620000 },
  'brick-breaker': { playCount: '510K+', numericCount: 510000 },
  'space-invaders': { playCount: '480K+', numericCount: 480000 },
  asteroids: { playCount: '420K+', numericCount: 420000 },
  pong: { playCount: '470K+', numericCount: 470000 },
  'doodle-jump': { playCount: '560K+', numericCount: 560000 },
  'geometry-dash': { playCount: '680K+', numericCount: 680000 },
  stack: { playCount: '490K+', numericCount: 490000 },
  agario: { playCount: '580K+', numericCount: 580000 },
  frogger: { playCount: '380K+', numericCount: 380000 },
  'tower-defense': { playCount: '520K+', numericCount: 520000 },
  sokoban: { playCount: '350K+', numericCount: 350000 },
  'flow-free': { playCount: '550K+', numericCount: 550000 },
  '15-puzzle': { playCount: '450K+', numericCount: 450000 },
  rubikscube: { playCount: '580K+', numericCount: 580000 },
  'water-sort': { playCount: '620K+', numericCount: 620000 },
  'block-puzzle': { playCount: '510K+', numericCount: 510000 },
  'angry-birds': { playCount: '580K+', numericCount: 580000 },
  'cut-the-rope': { playCount: '460K+', numericCount: 460000 },
  'temple-run': { playCount: '520K+', numericCount: 520000 },
  'among-us': { playCount: '640K+', numericCount: 640000 },
  paperio: { playCount: '580K+', numericCount: 580000 },
  battleship: { playCount: '480K+', numericCount: 480000 },
  'dots-and-boxes': { playCount: '320K+', numericCount: 320000 },
  gomoku: { playCount: '380K+', numericCount: 380000 },
  mastermind: { playCount: '420K+', numericCount: 420000 },
  'whack-a-mole': { playCount: '460K+', numericCount: 460000 },
  'jewel-quest': { playCount: '410K+', numericCount: 410000 },
  'lights-out': { playCount: '340K+', numericCount: 340000 },
  tangram: { playCount: '350K+', numericCount: 350000 },
  'simon-game': { playCount: '380K+', numericCount: 380000 },
  'peg-solitaire': { playCount: '290K+', numericCount: 290000 },
  'solitaire-tripeaks': { playCount: '450K+', numericCount: 450000 },
  'minesweeper-flags': { playCount: '320K+', numericCount: 320000 },
  'shisen-sho': { playCount: '350K+', numericCount: 350000 },
  skyscrapers: { playCount: '280K+', numericCount: 280000 },
  'stroop-test': { playCount: '420K+', numericCount: 420000 },
  'number-memory': { playCount: '380K+', numericCount: 380000 },
  'pattern-memory': { playCount: '350K+', numericCount: 350000 },
  'memory-matrix': { playCount: '360K+', numericCount: 360000 },
  'reaction-test': { playCount: '440K+', numericCount: 440000 },
  anagrams: { playCount: '380K+', numericCount: 380000 },
  crosswordle: { playCount: '280K+', numericCount: 280000 },
  threes: { playCount: '350K+', numericCount: 350000 },
  breakout: { playCount: '390K+', numericCount: 390000 },
  centipede: { playCount: '310K+', numericCount: 310000 },
  'castle-wall': { playCount: '220K+', numericCount: 220000 },
  fillomino: { playCount: '250K+', numericCount: 250000 },
  masyu: { playCount: '230K+', numericCount: 230000 },
  kakuro: { playCount: '350K+', numericCount: 350000 },
  calcudoku: { playCount: '300K+', numericCount: 300000 },
  kenken: { playCount: '290K+', numericCount: 290000 },
  kakurasu: { playCount: '210K+', numericCount: 210000 },
  hidato: { playCount: '200K+', numericCount: 200000 },
  suguru: { playCount: '190K+', numericCount: 190000 },
  yajilin: { playCount: '195K+', numericCount: 195000 },
  bridges: { playCount: '240K+', numericCount: 240000 },
  nim: { playCount: '180K+', numericCount: 180000 },
  'huarong-pass': { playCount: '215K+', numericCount: 215000 },
  'arrow-puzzle': { playCount: '225K+', numericCount: 225000 },
  'sudoku-x': { playCount: '320K+', numericCount: 320000 },
  bullpen: { playCount: '170K+', numericCount: 170000 },
  'wordle-vs': { playCount: '380K+', numericCount: 380000 },
  slitherlink: { playCount: '260K+', numericCount: 260000 },
  shakashaka: { playCount: '240K+', numericCount: 240000 },
  tapa: { playCount: '210K+', numericCount: 210000 },
  'star-battle': { playCount: '220K+', numericCount: 220000 },
  hitori: { playCount: '250K+', numericCount: 250000 },
  nurikabe: { playCount: '230K+', numericCount: 230000 },
  binary: { playCount: '270K+', numericCount: 270000 },
  heyawake: { playCount: '200K+', numericCount: 200000 },
  aqre: { playCount: '190K+', numericCount: 190000 },
}

// Default popularity for games not explicitly listed
const defaultPopularity: GamePopularity = {
  playCount: '150K+',
  numericCount: 150000,
}

const allPopularity: Record<string, GamePopularity> = { ...tier1, ...tier2 }

/**
 * Get popularity data for a game by slug.
 * Returns a default if the game is not explicitly configured.
 */
export function getGamePopularity(slug: string): GamePopularity {
  return allPopularity[slug] || defaultPopularity
}

/**
 * Get total estimated plays across all games (for trust bar)
 */
export function getTotalPlays(): string {
  const total = Object.values(allPopularity).reduce((sum, p) => sum + p.numericCount, 0)
  if (total >= 1000000) {
    return `${(total / 1000000).toFixed(0)}M+`
  }
  return `${(total / 1000).toFixed(0)}K+`
}
