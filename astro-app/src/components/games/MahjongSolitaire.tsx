import { useState, useCallback, useEffect } from 'react'

// 麻将牌符号
const TILE_SYMBOLS = [
  '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏', // 万
  '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘', // 筒
  '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡', // 条
  '🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆', // 风牌
  '🀢', '🀣', '🀤', '🀥', '🀦', '🀧', '🀨', '🀩', // 箭牌
]

type Tile = {
  id: number
  symbol: string
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

// 检查牌是否可以被选中（左边或右边没有牌）
const canSelect = (tile: Tile, allTiles: Tile[]): boolean => {
  if (tile.isRemoved) return false

  // 检查是否被上层牌覆盖
  const hasTopTile = allTiles.some(t =>
    !t.isRemoved &&
    t.layer === tile.layer + 1 &&
    Math.abs(t.row - tile.row) < 2 &&
    Math.abs(t.col - tile.col) < 2
  )
  if (hasTopTile) return false

  // 检查左右是否都被挡住
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

  // 简化版布局 - 3层金字塔
  // 底层 6x6
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      tiles.push({ id: id++, symbol: '', layer: 0, row, col, isRemoved: false })
    }
  }
  // 中层 4x4
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      tiles.push({ id: id++, symbol: '', layer: 1, row: row + 1, col: col + 1, isRemoved: false })
    }
  }
  // 顶层 2x2
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      tiles.push({ id: id++, symbol: '', layer: 2, row: row + 2, col: col + 2, isRemoved: false })
    }
  }

  // 分配牌（确保每个符号出现偶数次）
  const totalTiles = tiles.length
  const pairsNeeded = Math.floor(totalTiles / 2)
  const symbols: string[] = []

  for (let i = 0; i < pairsNeeded; i++) {
    const symbol = TILE_SYMBOLS[i % TILE_SYMBOLS.length]
    symbols.push(symbol, symbol)
  }

  // 洗牌
  for (let i = symbols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[symbols[i], symbols[j]] = [symbols[j], symbols[i]]
  }

  // 分配给每个位置
  tiles.forEach((tile, index) => {
    tile.symbol = symbols[index] || TILE_SYMBOLS[0]
  })

  return tiles
}

export default function MahjongSolitaire({ settings, onBack, toggleLanguage }: Props) {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null)
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  // 初始化游戏
  const initGame = useCallback(() => {
    setTiles(generateLayout())
    setSelectedTile(null)
    setMoves(0)
    setGameWon(false)
    setStartTime(Date.now())
    setElapsedTime(0)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  // 更新计时器
  useEffect(() => {
    if (gameWon) return
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime, gameWon])

  // 检查是否获胜
  useEffect(() => {
    const remaining = tiles.filter(t => !t.isRemoved)
    if (remaining.length === 0 && tiles.length > 0) {
      setGameWon(true)
    }
  }, [tiles])

  // 点击牌
  const handleTileClick = (tile: Tile) => {
    if (!canSelect(tile, tiles)) return

    if (!selectedTile) {
      setSelectedTile(tile)
    } else if (selectedTile.id === tile.id) {
      setSelectedTile(null)
    } else if (selectedTile.symbol === tile.symbol) {
      // 配对成功
      setTiles(prev => prev.map(t =>
        t.id === selectedTile.id || t.id === tile.id
          ? { ...t, isRemoved: true }
          : t
      ))
      setSelectedTile(null)
      setMoves(prev => prev + 1)
    } else {
      // 配对失败
      setSelectedTile(tile)
    }
  }

  // 提示功能
  const getHint = () => {
    const selectable = tiles.filter(t => canSelect(t, tiles))
    for (const t1 of selectable) {
      for (const t2 of selectable) {
        if (t1.id !== t2.id && t1.symbol === t2.symbol) {
          return [t1, t2]
        }
      }
    }
    return null
  }

  const hint = getHint()
  const remainingPairs = Math.ceil(tiles.filter(t => !t.isRemoved).length / 2)

  // 按层渲染
  const renderLayer = (layer: number) => {
    const layerTiles = tiles.filter(t => t.layer === layer && !t.isRemoved)
    return (
      <div
        className="relative"
        style={{
          marginLeft: layer * 12,
          marginTop: layer * 12,
        }}
      >
        {layerTiles.map(tile => {
          const isSelectable = canSelect(tile, tiles)
          const isSelected = selectedTile?.id === tile.id
          const isHint = hint && (hint[0].id === tile.id || hint[1].id === tile.id)

          return (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              disabled={!isSelectable}
              className={`
                absolute w-10 h-12 flex items-center justify-center
                text-2xl rounded-lg border-2 transition-all duration-200
                ${isSelectable
                  ? isSelected
                    ? 'bg-yellow-500 border-yellow-300 scale-110 shadow-lg shadow-yellow-500/50'
                    : isHint
                    ? 'bg-blue-500 border-blue-300 animate-pulse'
                    : 'bg-white border-gray-300 hover:bg-gray-100 hover:scale-105 cursor-pointer'
                  : 'bg-gray-600 border-gray-500 opacity-50 cursor-not-allowed'
                }
              `}
              style={{
                left: tile.col * 44,
                top: tile.row * 52,
                zIndex: tile.layer * 10,
              }}
            >
              {tile.symbol}
            </button>
          )
        })}
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
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
              {settings.language === 'zh' ? '时间' : 'Time'}: {formatTime(elapsedTime)}
            </div>
            <div className="text-sm text-slate-400">
              {settings.language === 'zh' ? '步数' : 'Moves'}: {moves}
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

      {/* Game Info */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-4 text-sm">
            <span className="text-slate-400">
              {settings.language === 'zh' ? '剩余对数' : 'Remaining Pairs'}: {remainingPairs}
            </span>
          </div>
          <button
            onClick={initGame}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
          >
            {settings.language === 'zh' ? '新游戏' : 'New Game'}
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex justify-center pb-8 overflow-auto">
        <div className="relative p-8" style={{ width: 400, height: 450 }}>
          {renderLayer(0)}
          {renderLayer(1)}
          {renderLayer(2)}
        </div>
      </div>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              {settings.language === 'zh' ? '恭喜通关！' : 'Congratulations!'}
            </h2>
            <p className="text-slate-400 mb-4">
              {settings.language === 'zh'
                ? `用时 ${formatTime(elapsedTime)}，共 ${moves} 步`
                : `Time: ${formatTime(elapsedTime)}, Moves: ${moves}`}
            </p>
            <button
              onClick={initGame}
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
            >
              {settings.language === 'zh' ? '再来一局' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
