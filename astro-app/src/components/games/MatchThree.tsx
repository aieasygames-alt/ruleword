import { useState, useCallback, useEffect } from 'react'

type Gem = {
  type: number
  row: number
  col: number
  id: string
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

const GRID_SIZE = 8
const GEM_TYPES = 6
const GEM_COLORS = [
  'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30',
  'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30',
  'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30',
  'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg shadow-yellow-500/30',
  'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/30',
  'bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg shadow-pink-500/30',
]
const GEM_EMOJIS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🩷']

export default function MatchThree({ settings, onBack, toggleLanguage }: Props) {
  const [grid, setGrid] = useState<Gem[][]>([])
  const [selectedGem, setSelectedGem] = useState<Gem | null>(null)
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(30)
  const [combo, setCombo] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [gameOver, setGameOver] = useState(false)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  // 生成初始网格
  const generateGrid = useCallback((): Gem[][] => {
    const newGrid: Gem[][] = []

    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = []
      for (let col = 0; col < GRID_SIZE; col++) {
        let type: number
        // 避免初始匹配
        do {
          type = Math.floor(Math.random() * GEM_TYPES)
        } while (
          (col >= 2 && newGrid[row][col - 1]?.type === type && newGrid[row][col - 2]?.type === type) ||
          (row >= 2 && newGrid[row - 1]?.[col]?.type === type && newGrid[row - 2]?.[col]?.type === type)
        )

        newGrid[row][col] = {
          type,
          row,
          col,
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
        }
      }
    }

    return newGrid
  }, [])

  // 初始化游戏
  const initGame = useCallback(() => {
    setGrid(generateGrid())
    setScore(0)
    setMoves(30)
    setCombo(0)
    setSelectedGem(null)
    setGameOver(false)
  }, [generateGrid])

  useEffect(() => {
    initGame()
  }, [initGame])

  // 检查匹配
  const findMatches = useCallback((g: Gem[][]): Set<string> => {
    const matches = new Set<string>()

    // 水平检查
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const type = g[row][col].type
        if (type === g[row][col + 1].type && type === g[row][col + 2].type) {
          matches.add(`${row}-${col}`)
          matches.add(`${row}-${col + 1}`)
          matches.add(`${row}-${col + 2}`)
          // 延伸检查
          let extend = 3
          while (col + extend < GRID_SIZE && g[row][col + extend].type === type) {
            matches.add(`${row}-${col + extend}`)
            extend++
          }
        }
      }
    }

    // 垂直检查
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const type = g[row][col].type
        if (type === g[row + 1][col].type && type === g[row + 2][col].type) {
          matches.add(`${row}-${col}`)
          matches.add(`${row + 1}-${col}`)
          matches.add(`${row + 2}-${col}`)
          // 延伸检查
          let extend = 3
          while (row + extend < GRID_SIZE && g[row + extend][col].type === type) {
            matches.add(`${row + extend}-${col}`)
            extend++
          }
        }
      }
    }

    return matches
  }, [])

  // 交换宝石
  const swapGems = useCallback((gem1: Gem, gem2: Gem) => {
    if (isAnimating) return
    if (Math.abs(gem1.row - gem2.row) + Math.abs(gem1.col - gem2.col) !== 1) {
      setSelectedGem(null)
      return
    }

    setIsAnimating(true)
    setCombo(0)

    // 执行交换
    setGrid(prev => {
      const newGrid = prev.map(row => [...row])
      const temp = { ...newGrid[gem1.row][gem1.col] }
      newGrid[gem1.row][gem1.col] = { ...newGrid[gem2.row][gem2.col], row: gem1.row, col: gem1.col }
      newGrid[gem2.row][gem2.col] = { ...temp, row: gem2.row, col: gem2.col }
      return newGrid
    })

    // 检查是否有效交换
    setTimeout(() => {
      setGrid(prev => {
        const matches = findMatches(prev)
        if (matches.size === 0) {
          // 无效交换，换回来
          const newGrid = prev.map(row => [...row])
          const temp = { ...newGrid[gem1.row][gem1.col] }
          newGrid[gem1.row][gem1.col] = { ...newGrid[gem2.row][gem2.col], row: gem1.row, col: gem1.col }
          newGrid[gem2.row][gem2.col] = { ...temp, row: gem2.row, col: gem2.col }
          setIsAnimating(false)
          return newGrid
        }
        return prev
      })

      setMoves(m => {
        const newMoves = m - 1
        if (newMoves <= 0) {
          setGameOver(true)
        }
        return newMoves
      })

      processMatches()
    }, 300)
  }, [isAnimating, findMatches])

  // 处理匹配
  const processMatches = useCallback(() => {
    setGrid(prev => {
      const currentGrid = prev.map(row => [...row])
      let totalMatches = 0
      let currentCombo = 0

      const processOnce = (): boolean => {
        const matches = findMatches(currentGrid)
        if (matches.size === 0) return false

        currentCombo++
        totalMatches += matches.size

        // 标记匹配的宝石
        matches.forEach(key => {
          const [row, col] = key.split('-').map(Number)
          currentGrid[row][col] = { ...currentGrid[row][col], type: -1 }
        })

        // 下落
        for (let col = 0; col < GRID_SIZE; col++) {
          let emptySpaces = 0
          for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (currentGrid[row][col].type === -1) {
              emptySpaces++
            } else if (emptySpaces > 0) {
              currentGrid[row + emptySpaces][col] = {
                ...currentGrid[row][col],
                row: row + emptySpaces,
              }
              currentGrid[row][col] = { type: -1, row, col, id: `empty-${Date.now()}` }
            }
          }

          // 填充新宝石
          for (let row = 0; row < emptySpaces; row++) {
            currentGrid[row][col] = {
              type: Math.floor(Math.random() * GEM_TYPES),
              row,
              col,
              id: `new-${row}-${col}-${Date.now()}`,
            }
          }
        }

        return true
      }

      // 循环处理直到没有匹配
      while (processOnce()) {
        setCombo(currentCombo)
      }

      setScore(s => s + totalMatches * 10 * currentCombo)
      setIsAnimating(false)
      setSelectedGem(null)

      return currentGrid
    })
  }, [findMatches])

  // 点击宝石
  const handleGemClick = (gem: Gem) => {
    if (isAnimating || gameOver) return

    if (!selectedGem) {
      setSelectedGem(gem)
    } else if (selectedGem.row === gem.row && selectedGem.col === gem.col) {
      setSelectedGem(null)
    } else {
      swapGems(selectedGem, gem)
    }
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">{t('Back', '返回')}</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>💎</span>
              {t('Match-3', '三消游戏')}
            </h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 bg-slate-700 rounded text-sm"
          >
            {settings.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Stats */}
        <div className="flex justify-between mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{score}</div>
            <div className="text-sm text-slate-400">{t('Score', '得分')}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{moves}</div>
            <div className="text-sm text-slate-400">{t('Moves', '步数')}</div>
          </div>
          {combo > 1 && (
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">x{combo}</div>
              <div className="text-sm text-slate-400">{t('Combo', '连击')}</div>
            </div>
          )}
        </div>

        {/* Game Grid */}
        <div className="bg-slate-800 rounded-2xl p-3">
          <div className="grid grid-cols-8 gap-1">
            {grid.map((row, rowIndex) =>
              row.map((gem, colIndex) => (
                <button
                  key={gem.id}
                  onClick={() => handleGemClick(gem)}
                  disabled={isAnimating || gameOver}
                  className={`
                    aspect-square rounded-lg flex items-center justify-center
                    text-xl sm:text-2xl
                    transition-all duration-200
                    ${gem.type >= 0 ? GEM_COLORS[gem.type] : 'bg-slate-700'}
                    ${selectedGem?.row === rowIndex && selectedGem?.col === colIndex
                      ? 'ring-4 ring-white scale-110'
                      : 'hover:scale-105'
                    }
                    ${isAnimating ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {gem.type >= 0 && GEM_EMOJIS[gem.type]}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center mt-4 text-slate-400 text-sm">
          {t('Swap adjacent gems to match 3 or more in a row!',
            '交换相邻宝石，匹配3个或更多！')}
        </div>

        {/* New Game Button */}
        <button
          onClick={initGame}
          className="w-full mt-4 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
        >
          {t('New Game', '新游戏')}
        </button>
      </main>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">
              {t('Game Over!', '游戏结束！')}
            </h2>
            <p className="text-slate-400 mb-2">
              {t('Final Score', '最终得分')}: <span className="text-green-400 font-bold text-2xl">{score}</span>
            </p>
            <button
              onClick={initGame}
              className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold transition-colors"
            >
              {t('Play Again', '再玩一次')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
