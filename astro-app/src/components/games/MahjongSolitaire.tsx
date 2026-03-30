import { useState, useCallback, useEffect } from 'react'

// 麻将牌类型定义 - 使用清晰的文字+颜色方案
type TileType = {
  id: string
  label: string     // 显示文字
  sub: string       // 副标签（花色）
  color: string     // 主色
  bgGradient: string // 背景渐变
  textColor: string
}

// 万子 (Characters) - 红色系
const WAN: TileType[] = [
  { id: 'w1', label: '一', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
  { id: 'w2', label: '二', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
  { id: 'w3', label: '三', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
  { id: 'w4', label: '四', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
  { id: 'w5', label: '五', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
  { id: 'w6', label: '六', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
  { id: 'w7', label: '七', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
  { id: 'w8', label: '八', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
  { id: 'w9', label: '九', sub: '万', color: '#DC2626', bgGradient: 'from-red-50 to-red-100', textColor: 'text-red-700' },
]

// 筒子 (Dots/Circles) - 蓝色系
const TONG: TileType[] = [
  { id: 't1', label: '①', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
  { id: 't2', label: '②', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
  { id: 't3', label: '③', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
  { id: 't4', label: '④', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
  { id: 't5', label: '⑤', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
  { id: 't6', label: '⑥', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
  { id: 't7', label: '⑦', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
  { id: 't8', label: '⑧', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
  { id: 't9', label: '⑨', sub: '筒', color: '#2563EB', bgGradient: 'from-blue-50 to-blue-100', textColor: 'text-blue-700' },
]

// 条子 (Bamboo) - 绿色系
const TIAO: TileType[] = [
  { id: 'b1', label: '1', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
  { id: 'b2', label: '2', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
  { id: 'b3', label: '3', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
  { id: 'b4', label: '4', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
  { id: 'b5', label: '5', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
  { id: 'b6', label: '6', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
  { id: 'b7', label: '7', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
  { id: 'b8', label: '8', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
  { id: 'b9', label: '9', sub: '条', color: '#16A34A', bgGradient: 'from-green-50 to-green-100', textColor: 'text-green-700' },
]

// 风牌 (Winds) - 紫色系
const FENG: TileType[] = [
  { id: 'f1', label: '東', sub: '风', color: '#7C3AED', bgGradient: 'from-purple-50 to-purple-100', textColor: 'text-purple-700' },
  { id: 'f2', label: '南', sub: '风', color: '#7C3AED', bgGradient: 'from-purple-50 to-purple-100', textColor: 'text-purple-700' },
  { id: 'f3', label: '西', sub: '风', color: '#7C3AED', bgGradient: 'from-purple-50 to-purple-100', textColor: 'text-purple-700' },
  { id: 'f4', label: '北', sub: '风', color: '#7C3AED', bgGradient: 'from-purple-50 to-purple-100', textColor: 'text-purple-700' },
]

// 箭牌 (Dragons) - 金色/橙色系
const JIAN: TileType[] = [
  { id: 'j1', label: '中', sub: '發', color: '#EA580C', bgGradient: 'from-orange-50 to-amber-100', textColor: 'text-orange-700' },
  { id: 'j2', label: '發', sub: '财', color: '#EA580C', bgGradient: 'from-orange-50 to-amber-100', textColor: 'text-orange-700' },
  { id: 'j3', label: '白', sub: '板', color: '#EA580C', bgGradient: 'from-orange-50 to-amber-100', textColor: 'text-orange-700' },
  { id: 'j4', label: '春', sub: '夏', color: '#EA580C', bgGradient: 'from-orange-50 to-amber-100', textColor: 'text-orange-700' },
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

// 生成可解的麻将布局
const generateLayout = (): Tile[] => {
  const tiles: Tile[] = []
  let id = 0

  // 3层金字塔布局
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      tiles.push({ id: id++, tileType: ALL_TILE_TYPES[0], layer: 0, row, col, isRemoved: false })
    }
  }
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      tiles.push({ id: id++, tileType: ALL_TILE_TYPES[0], layer: 1, row: row + 1, col: col + 1, isRemoved: false })
    }
  }
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      tiles.push({ id: id++, tileType: ALL_TILE_TYPES[0], layer: 2, row: row + 2, col: col + 2, isRemoved: false })
    }
  }

  const totalTiles = tiles.length
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

const TILE_W = 52
const TILE_H = 64
const GAP_X = 4
const GAP_Y = 4

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

  // 渲染单张牌
  const renderTile = (tile: Tile) => {
    const isSelectable = canSelect(tile, tiles)
    const isSelected = selectedTile?.id === tile.id
    const isHint = hint && (hint[0].id === tile.id || hint[1].id === tile.id)
    const tt = tile.tileType

    // 牌面基础样式
    let tileClass = ''
    let tileStyle: React.CSSProperties = {
      left: tile.col * (TILE_W + GAP_X),
      top: tile.row * (TILE_H + GAP_Y),
      zIndex: tile.layer * 100 + tile.row,
    }

    if (!isSelectable) {
      // 不可选：暗灰色
      tileClass = 'opacity-50 cursor-not-allowed'
      tileStyle.background = 'linear-gradient(145deg, #64748b, #475569)'
      tileStyle.boxShadow = `inset 0 1px 2px rgba(0,0,0,0.3), ${tile.layer > 0 ? `-${tile.layer * 2}px ${tile.layer * 2}px ${4 + tile.layer * 2}px rgba(0,0,0,0.2)` : '0 2px 4px rgba(0,0,0,0.2)'}`
    } else if (isSelected) {
      // 选中：金色高亮
      tileClass = 'cursor-pointer scale-110'
      tileStyle.background = 'linear-gradient(145deg, #FDE68A, #F59E0B)'
      tileStyle.boxShadow = '0 0 12px rgba(245, 158, 11, 0.6), 0 0 24px rgba(245, 158, 11, 0.3), -2px 2px 6px rgba(0,0,0,0.2)'
      tileStyle.border = '2px solid #F59E0B'
    } else if (isHint) {
      // 提示：蓝色脉冲
      tileClass = 'cursor-pointer animate-pulse'
      tileStyle.background = 'linear-gradient(145deg, #BFDBFE, #60A5FA)'
      tileStyle.boxShadow = '0 0 8px rgba(96, 165, 250, 0.5), -2px 2px 6px rgba(0,0,0,0.2)'
      tileStyle.border = '2px solid #60A5FA'
    } else {
      // 可选：白色牌面
      tileClass = 'cursor-pointer hover:scale-105'
      tileStyle.background = 'linear-gradient(145deg, #FFFFFF, #F8FAFC)'
      tileStyle.boxShadow = `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)${tile.layer > 0 ? `, -${tile.layer * 2}px ${tile.layer * 2}px ${4 + tile.layer * 2}px rgba(0,0,0,0.15)` : ''}`
      tileStyle.border = '1px solid #E2E8F0'
    }

    return (
      <button
        key={tile.id}
        onClick={() => handleTileClick(tile)}
        disabled={!isSelectable}
        className={`absolute flex flex-col items-center justify-center rounded-lg transition-all duration-150 ${tileClass}`}
        style={{
          ...tileStyle,
          width: TILE_W,
          height: TILE_H,
        }}
      >
        {/* 牌面内容 */}
        <div className="flex flex-col items-center leading-none" style={{ color: isSelectable && !isSelected && !isHint ? tt.color : isSelectable ? '#92400E' : '#94A3B8' }}>
          <span className="font-bold" style={{ fontSize: tt.label.length > 1 ? 18 : 22, lineHeight: 1.1 }}>
            {tt.label}
          </span>
          <span className="text-[10px] font-medium mt-0.5 opacity-80">
            {tt.sub}
          </span>
        </div>

        {/* 顶部装饰线 */}
        {!isSelectable && (
          <div className="absolute top-1 left-2 right-2 h-[1px] bg-slate-400/30" />
        )}
      </button>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 计算画布尺寸
  const canvasWidth = 6 * (TILE_W + GAP_X) + 40
  const canvasHeight = 6 * (TILE_H + GAP_Y) + 40

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-emerald-950 text-white'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
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
            <div className="text-sm text-slate-400">
              ⏱ {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-slate-400">
              🎯 {moves}
            </div>
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 bg-slate-700 rounded text-sm"
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
            <span>{settings.language === 'zh' ? '剩余对数' : 'Pairs'}: {remainingPairs}</span>
          </div>
          <button
            onClick={initGame}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
          >
            {settings.language === 'zh' ? '新游戏' : 'New Game'}
          </button>
        </div>
      </div>

      {/* 图例 */}
      <div className="max-w-4xl mx-auto px-4 pb-3">
        <div className="flex flex-wrap gap-2 justify-center text-xs">
          <span className="px-2 py-1 rounded bg-red-900/40 text-red-300 border border-red-700/30">万 (Red)</span>
          <span className="px-2 py-1 rounded bg-blue-900/40 text-blue-300 border border-blue-700/30">筒 (Blue)</span>
          <span className="px-2 py-1 rounded bg-green-900/40 text-green-300 border border-green-700/30">条 (Green)</span>
          <span className="px-2 py-1 rounded bg-purple-900/40 text-purple-300 border border-purple-700/30">风 (Purple)</span>
          <span className="px-2 py-1 rounded bg-orange-900/40 text-orange-300 border border-orange-700/30">箭 (Gold)</span>
        </div>
      </div>

      {/* Game Board - 深绿色麻将桌面 */}
      <div className="flex justify-center pb-8 overflow-auto">
        <div
          className="relative rounded-2xl"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            background: 'linear-gradient(145deg, #064E3B, #065F46, #047857)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)',
            border: '3px solid #065F46',
            padding: 16,
          }}
        >
          {/* 桌面纹理 */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '8px 8px',
          }} />
          {tiles.filter(t => !t.isRemoved).map(tile => renderTile(tile))}
        </div>
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm mx-4 border border-slate-700">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-amber-400">
              {settings.language === 'zh' ? '恭喜通关！' : 'Congratulations!'}
            </h2>
            <p className="text-slate-400 mb-6">
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
