import { useState, useCallback, useEffect } from 'react'

// 麻将牌类型定义
type TileType = {
  id: string
  suit: 'wan' | 'tong' | 'tiao' | 'feng' | 'jian'
  value: number       // 1-9 for suits, 1-4 for winds, 1-3 for dragons
  top: string         // 上方显示
  bottom: string      // 下方显示
  suitColor: string   // 花色颜色
}

// 万子 (Characters) - 红色
const WAN: TileType[] = [
  { id: 'w1', suit: 'wan', value: 1, top: '一', bottom: '万', suitColor: '#C41E3A' },
  { id: 'w2', suit: 'wan', value: 2, top: '二', bottom: '万', suitColor: '#C41E3A' },
  { id: 'w3', suit: 'wan', value: 3, top: '三', bottom: '万', suitColor: '#C41E3A' },
  { id: 'w4', suit: 'wan', value: 4, top: '四', bottom: '万', suitColor: '#C41E3A' },
  { id: 'w5', suit: 'wan', value: 5, top: '五', bottom: '万', suitColor: '#C41E3A' },
  { id: 'w6', suit: 'wan', value: 6, top: '六', bottom: '万', suitColor: '#C41E3A' },
  { id: 'w7', suit: 'wan', value: 7, top: '七', bottom: '万', suitColor: '#C41E3A' },
  { id: 'w8', suit: 'wan', value: 8, top: '八', bottom: '万', suitColor: '#C41E3A' },
  { id: 'w9', suit: 'wan', value: 9, top: '九', bottom: '万', suitColor: '#C41E3A' },
]

// 筒子 (Dots) - 蓝色
const TONG: TileType[] = [
  { id: 't1', suit: 'tong', value: 1, top: '一', bottom: '筒', suitColor: '#1E40AF' },
  { id: 't2', suit: 'tong', value: 2, top: '二', bottom: '筒', suitColor: '#1E40AF' },
  { id: 't3', suit: 'tong', value: 3, top: '三', bottom: '筒', suitColor: '#1E40AF' },
  { id: 't4', suit: 'tong', value: 4, top: '四', bottom: '筒', suitColor: '#1E40AF' },
  { id: 't5', suit: 'tong', value: 5, top: '五', bottom: '筒', suitColor: '#1E40AF' },
  { id: 't6', suit: 'tong', value: 6, top: '六', bottom: '筒', suitColor: '#1E40AF' },
  { id: 't7', suit: 'tong', value: 7, top: '七', bottom: '筒', suitColor: '#1E40AF' },
  { id: 't8', suit: 'tong', value: 8, top: '八', bottom: '筒', suitColor: '#1E40AF' },
  { id: 't9', suit: 'tong', value: 9, top: '九', bottom: '筒', suitColor: '#1E40AF' },
]

// 条子 (Bamboo) - 绿色
const TIAO: TileType[] = [
  { id: 'b1', suit: 'tiao', value: 1, top: '一', bottom: '条', suitColor: '#166534' },
  { id: 'b2', suit: 'tiao', value: 2, top: '二', bottom: '条', suitColor: '#166534' },
  { id: 'b3', suit: 'tiao', value: 3, top: '三', bottom: '条', suitColor: '#166534' },
  { id: 'b4', suit: 'tiao', value: 4, top: '四', bottom: '条', suitColor: '#166534' },
  { id: 'b5', suit: 'tiao', value: 5, top: '五', bottom: '条', suitColor: '#166534' },
  { id: 'b6', suit: 'tiao', value: 6, top: '六', bottom: '条', suitColor: '#166534' },
  { id: 'b7', suit: 'tiao', value: 7, top: '七', bottom: '条', suitColor: '#166534' },
  { id: 'b8', suit: 'tiao', value: 8, top: '八', bottom: '条', suitColor: '#166534' },
  { id: 'b9', suit: 'tiao', value: 9, top: '九', bottom: '条', suitColor: '#166534' },
]

// 风牌 (Winds) - 黑色
const FENG: TileType[] = [
  { id: 'f1', suit: 'feng', value: 1, top: '東', bottom: '风', suitColor: '#1F2937' },
  { id: 'f2', suit: 'feng', value: 2, top: '南', bottom: '风', suitColor: '#1F2937' },
  { id: 'f3', suit: 'feng', value: 3, top: '西', bottom: '风', suitColor: '#1F2937' },
  { id: 'f4', suit: 'feng', value: 4, top: '北', bottom: '风', suitColor: '#1F2937' },
]

// 箭牌 (Dragons)
const JIAN: TileType[] = [
  { id: 'j1', suit: 'jian', value: 1, top: '中', bottom: '', suitColor: '#DC2626' },
  { id: 'j2', suit: 'jian', value: 2, top: '發', bottom: '', suitColor: '#166534' },
  { id: 'j3', suit: 'jian', value: 3, top: '白', bottom: '', suitColor: '#374151' },
]

const ALL_TILE_TYPES: TileType[] = [...WAN, ...TONG, ...TIAO, ...FENG, ...JIAN]

type Tile = {
  id: number
  tileType: TileType
  layer: number
  row: number
  col: number
  isRemoved: boolean
}

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type Props = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
}

// 检查牌是否可以被选中
const canSelect = (tile: Tile, allTiles: Tile[]): boolean => {
  if (tile.isRemoved) return false

  const hasTopTile = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer + 1 &&
    Math.abs(t.row - tile.row) < 2 &&
    Math.abs(t.col - tile.col) < 2
  )
  if (hasTopTile) return false

  const hasLeft = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer &&
    t.row === tile.row &&
    t.col === tile.col - 1
  )
  const hasRight = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer &&
    t.row === tile.row &&
    t.col === tile.col + 1
  )

  return !(hasLeft && hasRight)
}

// 生成更大的可解麻将布局 - 经典乌龟形
const generateLayout = (): Tile[] => {
  const tiles: Tile[] = []
  let id = 0

  // Layer 0 (底): 8列 x 5行 = 40 tiles
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 8; col++) {
      tiles.push({ id: id++, tileType: ALL_TILE_TYPES[0], layer: 0, row, col, isRemoved: false })
    }
  }
  // Layer 1: 6列 x 3行 = 18 tiles (居中)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      tiles.push({ id: id++, tileType: ALL_TILE_TYPES[0], layer: 1, row: row + 1, col: col + 1, isRemoved: false })
    }
  }
  // Layer 2: 4列 x 1行 = 4 tiles (居中)
  for (let col = 0; col < 4; col++) {
    tiles.push({ id: id++, tileType: ALL_TILE_TYPES[0], layer: 2, row: 2, col: col + 2, isRemoved: false })
  }
  // Layer 3: 顶冠 2 tiles
  tiles.push({ id: id++, tileType: ALL_TILE_TYPES[0], layer: 3, row: 2, col: 3, isRemoved: false })
  tiles.push({ id: id++, tileType: ALL_TILE_TYPES[0], layer: 3, row: 2, col: 4, isRemoved: false })

  const totalTiles = tiles.length // 64 tiles = 32 pairs
  const sortedTiles = [...tiles].sort((a, b) => {
    if (a.layer !== b.layer) return b.layer - a.layer
    return a.row * 10 + a.col - (b.row * 10 + b.col)
  })

  const pairsNeeded = Math.floor(totalTiles / 2)
  const types: TileType[] = []
  for (let i = 0; i < pairsNeeded; i++) {
    const type = ALL_TILE_TYPES[i % ALL_TILE_TYPES.length]
    types.push(type, type)
  }

  // Fisher-Yates shuffle
  for (let i = pairsNeeded - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[types[i * 2], types[j * 2]] = [types[j * 2], types[i * 2]]
    ;[types[i * 2 + 1], types[j * 2 + 1]] = [types[j * 2 + 1], types[i * 2 + 1]]
  }

  for (let i = 0; i < sortedTiles.length && i < types.length; i++) {
    sortedTiles[i].tileType = types[i]
  }

  return tiles
}

const TILE_W = 44
const TILE_H = 58
const GAP = 2

// 牌面花纹装饰 - 筒子的圆点图案
const DotPattern = ({ count, color }: { count: number; color: string }) => {
  const positions: [number, number][] = {
    1: [[50, 50]],
    2: [[35, 35], [65, 65]],
    3: [[35, 25], [50, 50], [65, 75]],
    4: [[35, 35], [65, 35], [35, 65], [65, 65]],
    5: [[35, 35], [65, 35], [50, 50], [35, 65], [65, 65]],
    6: [[35, 30], [65, 30], [35, 50], [65, 50], [35, 70], [65, 70]],
    7: [[35, 30], [65, 30], [50, 30], [35, 50], [65, 50], [35, 70], [65, 70]],
    8: [[30, 25], [50, 25], [70, 25], [30, 50], [70, 50], [30, 75], [50, 75], [70, 75]],
    9: [[30, 25], [50, 25], [70, 25], [30, 50], [50, 50], [70, 50], [30, 75], [50, 75], [70, 75]],
  }[count] || [[50, 50]]

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {positions.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="9" fill={color} />
      ))}
    </svg>
  )
}

// 条子的竹节图案
const BambooPattern = ({ count, color }: { count: number; color: string }) => {
  const positions: [number, number][] = {
    1: [[50, 50]],
    2: [[38, 40], [62, 60]],
    3: [[38, 30], [50, 50], [62, 70]],
    4: [[38, 35], [62, 35], [38, 65], [62, 65]],
    5: [[38, 30], [62, 30], [50, 50], [38, 70], [62, 70]],
    6: [[35, 25], [65, 25], [35, 50], [65, 50], [35, 75], [65, 75]],
    7: [[35, 25], [65, 25], [50, 25], [35, 50], [65, 50], [35, 75], [65, 75]],
    8: [[30, 22], [50, 22], [70, 22], [30, 50], [70, 50], [30, 78], [50, 78], [70, 78]],
    9: [[30, 22], [50, 22], [70, 22], [30, 50], [50, 50], [70, 50], [30, 78], [50, 78], [70, 78]],
  }[count] || [[50, 50]]

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {positions.map(([cx, cy], i) => (
        <g key={i}>
          <rect x={cx - 4} y={cy - 14} width="8" height="28" rx="3" fill={color} />
          <line x1={cx - 3} y1={cy - 4} x2={cx + 3} y2={cy - 4} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1={cx - 3} y1={cy + 4} x2={cx + 3} y2={cy + 4} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </g>
      ))}
    </svg>
  )
}

export default function MahjongSolitaire({ settings, onBack, toggleLanguage }: Props) {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  const initGame = useCallback(() => {
    setTiles(generateLayout())
    setSelectedTile(null)
    setMoves(0)
    setGameWon(false)
    setStartTime(Date.now())
    setElapsedTime(0)
  }, [])

  useEffect(() => { initGame() }, [initGame])

  useEffect(() => {
    if (gameWon) return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, gameWon])

  useEffect(() => {
    const remaining = tiles.filter(t => !t.isRemoved)
    if (remaining.length === 0 && tiles.length > 0) {
      setGameWon(true)
    }
  }, [tiles])

  const handleTileClick = (tile: Tile) => {
    if (!canSelect(tile, tiles)) return

    if (!selectedTile) {
      setSelectedTile(tile)
    } else if (selectedTile.id === tile.id) {
      setSelectedTile(null)
    } else if (selectedTile.tileType.id === tile.tileType.id) {
      setTiles(prev => prev.map(t =>
        t.id === selectedTile.id || t.id === tile.id
          ? { ...t, isRemoved: true }
          : t
      ))
      setSelectedTile(null)
      setMoves(prev => prev + 1)
    } else {
      setSelectedTile(tile)
    }
  }

  const getHint = () => {
    const selectable = tiles.filter(t => canSelect(t, tiles))
    for (const t1 of selectable) {
      for (const t2 of selectable) {
        if (t1.id !== t2.id && t1.tileType.id === t2.tileType.id) {
          return [t1, t2]
        }
      }
    }
    return null
  }

  const hint = getHint()
  const remainingPairs = Math.ceil(tiles.filter(t => !t.isRemoved).length / 2)

  // 渲染单张牌面内容
  const renderTileFace = (tt: TileType, dimmed: boolean) => {
    const color = dimmed ? '#9CA3AF' : tt.suitColor

    if (tt.suit === 'tong') {
      // 筒子：中间圆点图案 + 底部标签
      return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="flex-1 w-full px-0.5 pt-0.5">
            <DotPattern count={tt.value} color={color} />
          </div>
          <div className="text-center leading-none pb-0.5">
            <span style={{ color, fontSize: 9, fontWeight: 700 }}>筒</span>
          </div>
        </div>
      )
    }

    if (tt.suit === 'tiao') {
      // 条子：中间竹节图案 + 底部标签
      return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="flex-1 w-full px-0.5 pt-0.5">
            <BambooPattern count={tt.value} color={color} />
          </div>
          <div className="text-center leading-none pb-0.5">
            <span style={{ color, fontSize: 9, fontWeight: 700 }}>条</span>
          </div>
        </div>
      )
    }

    if (tt.suit === 'jian' && tt.value === 1) {
      // 红中 - 特殊大字
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span style={{ color, fontSize: 30, fontWeight: 900, fontFamily: 'serif' }}>中</span>
        </div>
      )
    }

    if (tt.suit === 'jian' && tt.value === 2) {
      // 發 - 特殊大字
      return (
        <div className="w-full h-full flex items-center justify-center">
          <span style={{ color, fontSize: 26, fontWeight: 900, fontFamily: 'serif' }}>發</span>
        </div>
      )
    }

    if (tt.suit === 'jian' && tt.value === 3) {
      // 白板 - 蓝色方框
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div style={{
            width: 22, height: 30,
            border: `2.5px solid ${dimmed ? '#9CA3AF' : '#374151'}`,
            borderRadius: 2,
          }} />
        </div>
      )
    }

    if (tt.suit === 'feng') {
      // 风牌 - 大字 + 角标
      return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <span style={{ color, fontSize: 26, fontWeight: 800, fontFamily: 'serif', lineHeight: 1 }}>
            {tt.top}
          </span>
          <span style={{ color, fontSize: 8, fontWeight: 600, opacity: 0.7 }}>风</span>
        </div>
      )
    }

    // 万子 - 大数字 + 万字
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <span style={{ color, fontSize: 24, fontWeight: 800, fontFamily: 'serif', lineHeight: 1 }}>
          {tt.top}
        </span>
        <span style={{ color, fontSize: 10, fontWeight: 700, lineHeight: 1 }}>万</span>
      </div>
    )
  }

  // 渲染单张牌
  const renderTile = (tile: Tile) => {
    const isSelectable = canSelect(tile, tiles)
    const isSelected = selectedTile?.id === tile.id
    const isHint = hint && (hint[0].id === tile.id || hint[1].id === tile.id)

    const layerOffset = tile.layer * 3

    let bgStyle: React.CSSProperties
    let extraClass = ''

    if (isSelected) {
      bgStyle = {
        background: 'linear-gradient(160deg, #FFFBEB, #FDE68A)',
        border: '2px solid #D97706',
        boxShadow: `0 0 0 1px #B45309, 0 4px 12px rgba(217, 119, 6, 0.5), ${-layerOffset}px ${layerOffset}px ${3 + tile.layer * 2}px rgba(0,0,0,0.25)`,
        transform: 'scale(1.08)',
        zIndex: tile.layer * 100 + tile.row + 50,
      }
      extraClass = 'ring-2 ring-amber-400 ring-offset-1'
    } else if (isHint) {
      bgStyle = {
        background: 'linear-gradient(160deg, #EFF6FF, #BFDBFE)',
        border: '2px solid #3B82F6',
        boxShadow: `0 0 8px rgba(59, 130, 246, 0.4), ${-layerOffset}px ${layerOffset}px ${3 + tile.layer * 2}px rgba(0,0,0,0.2)`,
        zIndex: tile.layer * 100 + tile.row + 25,
      }
      extraClass = 'animate-pulse'
    } else if (isSelectable) {
      bgStyle = {
        background: 'linear-gradient(160deg, #FFFFF5, #F5F0E1)',
        border: '1.5px solid #C9B896',
        boxShadow: `0 1px 2px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8), ${-layerOffset}px ${layerOffset}px ${3 + tile.layer * 2}px rgba(0,0,0,0.18)`,
        zIndex: tile.layer * 100 + tile.row,
      }
    } else {
      // 不可选 - 变暗
      bgStyle = {
        background: 'linear-gradient(160deg, #D1D5DB, #9CA3AF)',
        border: '1.5px solid #6B7280',
        boxShadow: `inset 0 1px 3px rgba(0,0,0,0.2), ${-layerOffset}px ${layerOffset}px ${3 + tile.layer * 2}px rgba(0,0,0,0.15)`,
        zIndex: tile.layer * 100 + tile.row,
        opacity: 0.6,
      }
    }

    return (
      <button
        key={tile.id}
        onClick={() => handleTileClick(tile)}
        disabled={!isSelectable}
        className={`absolute flex items-center justify-center rounded transition-all duration-150 select-none ${isSelectable && !isSelected ? 'cursor-pointer hover:brightness-95' : ''} ${extraClass}`}
        style={{
          ...bgStyle,
          left: tile.col * (TILE_W + GAP) + tile.layer * 1,
          top: tile.row * (TILE_H + GAP) - tile.layer * 1,
          width: TILE_W,
          height: TILE_H,
        }}
      >
        {/* 牌面内框 - 模拟真实麻将牌的凹槽 */}
        <div className="absolute inset-[3px] rounded-sm border border-black/5" style={{
          background: isSelected
            ? 'linear-gradient(160deg, rgba(255,251,235,0.3), rgba(253,230,138,0.3))'
            : isHint
            ? 'linear-gradient(160deg, rgba(239,246,255,0.3), rgba(191,219,254,0.3))'
            : 'linear-gradient(160deg, rgba(255,255,255,0.5), rgba(245,240,225,0.2))',
        }}>
          {renderTileFace(tile.tileType, !isSelectable)}
        </div>
      </button>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 计算画布尺寸 - 8列5行覆盖全板
  const boardCols = 8
  const boardRows = 5
  const padding = 20
  const canvasWidth = boardCols * (TILE_W + GAP) + padding * 2
  const canvasHeight = boardRows * (TILE_H + GAP) + padding * 2 + 12 // extra for layer offset

  return (
    <div className="min-h-screen bg-emerald-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-sm border-b border-emerald-800/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">{settings.language === 'zh' ? '返回' : 'Back'}</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>🀄</span>
              {settings.language === 'zh' ? '麻将配对' : 'Mahjong Solitaire'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-emerald-400/80">
              ⏱ {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-emerald-400/80">
              🎯 {moves}
            </div>
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 bg-emerald-800 rounded text-sm"
            >
              {settings.language === 'en' ? '中文' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      {/* Info Bar */}
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-emerald-300/80">
            <span>{settings.language === 'zh' ? '剩余' : 'Pairs'}: {remainingPairs}</span>
          </div>
          <button
            onClick={initGame}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors"
          >
            {settings.language === 'zh' ? '新游戏' : 'New Game'}
          </button>
        </div>
      </div>

      {/* 图例 */}
      <div className="max-w-4xl mx-auto px-4 pb-3">
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          <span className="px-2 py-1 rounded bg-red-900/30 text-red-300 border border-red-800/30">万</span>
          <span className="px-2 py-1 rounded bg-blue-900/30 text-blue-300 border border-blue-800/30">筒</span>
          <span className="px-2 py-1 rounded bg-green-900/30 text-green-300 border border-green-800/30">条</span>
          <span className="px-2 py-1 rounded bg-gray-700/30 text-gray-300 border border-gray-600/30">风</span>
          <span className="px-2 py-1 rounded bg-amber-900/30 text-amber-300 border border-amber-800/30">中發白</span>
        </div>
      </div>

      {/* Game Board - 深绿色麻将桌面 */}
      <div className="flex justify-center pb-8 overflow-auto px-2">
        <div
          className="relative rounded-xl"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            background: 'linear-gradient(145deg, #064E3B 0%, #065F46 40%, #047857 100%)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.4), 0 0 0 3px #022c22',
            border: '2px solid #0D9488',
            padding: padding,
          }}
        >
          {/* 桌面纹理 */}
          <div className="absolute inset-0 opacity-[0.04] rounded-xl" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '6px 6px',
          }} />
          {/* 桌面边缘暗角 */}
          <div className="absolute inset-0 rounded-xl" style={{
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.3)',
          }} />
          {tiles.filter(t => !t.isRemoved).map(tile => renderTile(tile))}
        </div>
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-emerald-900 rounded-2xl p-8 text-center max-w-sm mx-4 border border-emerald-700 shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-amber-400">
              {settings.language === 'zh' ? '恭喜通关！' : 'Congratulations!'}
            </h2>
            <p className="text-emerald-300 mb-6">
              {settings.language === 'zh'
                ? `用时 ${formatTime(elapsedTime)}，共 ${moves} 步`
                : `Time: ${formatTime(elapsedTime)}, Moves: ${moves}`}
            </p>
            <button
              onClick={initGame}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors"
            >
              {settings.language === 'zh' ? '再来一局' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
