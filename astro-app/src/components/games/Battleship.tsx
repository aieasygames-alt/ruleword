import { useState, useCallback, useEffect } from 'react'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

type Cell = 'empty' | 'ship' | 'hit' | 'miss'

type Ship = {
  name: string
  size: number
  positions: [number, number][]
}

const SHIPS: { name: string; nameZh: string; size: number }[] = [
  { name: 'Carrier', nameZh: '航母', size: 5 },
  { name: 'Battleship', nameZh: '战舰', size: 4 },
  { name: 'Cruiser', nameZh: '巡洋舰', size: 3 },
  { name: 'Submarine', nameZh: '潜艇', size: 3 },
  { name: 'Destroyer', nameZh: '驱逐舰', size: 2 },
]

const GRID_SIZE = 10

export default function Battleship({ settings }: Props) {
  const [playerBoard, setPlayerBoard] = useState<Cell[][]>([])
  const [enemyBoard, setEnemyBoard] = useState<Cell[][]>([])
  const [playerShips, setPlayerShips] = useState<Ship[]>([])
  const [enemyShips, setEnemyShips] = useState<Ship[]>([])
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'won' | 'lost'>('setup')
  const [setupShip, setSetupShip] = useState(0)
  const [isHorizontal, setIsHorizontal] = useState(true)
  const [message, setMessage] = useState('')

  const isDark = settings.darkMode
  const lang = settings.language

  const initBoards = useCallback(() => {
    setPlayerBoard(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')))
    setEnemyBoard(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty')))
    setPlayerShips([])
    setEnemyShips([])
    setSetupShip(0)
    setGameState('setup')
    setMessage(lang === 'zh' ? '放置你的战舰' : 'Place your ships')
  }, [lang])

  useEffect(() => {
    initBoards()
  }, [initBoards])

  const placeEnemyShips = useCallback(() => {
    const board: Cell[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty'))
    const ships: Ship[] = []

    for (const shipTemplate of SHIPS) {
      let placed = false
      while (!placed) {
        const horizontal = Math.random() > 0.5
        const row = Math.floor(Math.random() * (horizontal ? GRID_SIZE : GRID_SIZE - shipTemplate.size))
        const col = Math.floor(Math.random() * (horizontal ? GRID_SIZE - shipTemplate.size : GRID_SIZE))

        const positions: [number, number][] = []
        let valid = true
        for (let i = 0; i < shipTemplate.size; i++) {
          const r = horizontal ? row : row + i
          const c = horizontal ? col + i : col
          if (board[r][c] !== 'empty') {
            valid = false
            break
          }
          positions.push([r, c])
        }

        if (valid) {
          positions.forEach(([r, c]) => board[r][c] = 'ship')
          ships.push({ name: shipTemplate.name, size: shipTemplate.size, positions })
          placed = true
        }
      }
    }

    setEnemyBoard(board)
    setEnemyShips(ships)
  }, [])

  const handleSetupClick = (row: number, col: number) => {
    if (gameState !== 'setup' || setupShip >= SHIPS.length) return

    const ship = SHIPS[setupShip]
    const positions: [number, number][] = []

    for (let i = 0; i < ship.size; i++) {
      const r = isHorizontal ? row : row + i
      const c = isHorizontal ? col + i : col
      if (r >= GRID_SIZE || c >= GRID_SIZE || playerBoard[r][c] !== 'empty') {
        setMessage(lang === 'zh' ? '无效位置' : 'Invalid position')
        return
      }
      positions.push([r, c])
    }

    const newBoard = playerBoard.map(r => [...r])
    positions.forEach(([r, c]) => newBoard[r][c] = 'ship')
    setPlayerBoard(newBoard)
    setPlayerShips(prev => [...prev, { name: ship.name, size: ship.size, positions }])
    setSetupShip(prev => prev + 1)

    if (setupShip === SHIPS.length - 1) {
      setGameState('playing')
      placeEnemyShips()
      setMessage(lang === 'zh' ? '开始攻击！' : 'Start attacking!')
    }
  }

  const handleAttack = (row: number, col: number) => {
    if (gameState !== 'playing' || enemyBoard[row][col] === 'hit' || enemyBoard[row][col] === 'miss') return

    const newEnemyBoard = enemyBoard.map(r => [...r])
    const hit = newEnemyBoard[row][col] === 'ship'
    newEnemyBoard[row][col] = hit ? 'hit' : 'miss'
    setEnemyBoard(newEnemyBoard)
    setMessage(hit ? (lang === 'zh' ? '击中！' : 'Hit!') : (lang === 'zh' ? '未中' : 'Miss'))

    // Check win
    const enemyRemaining = newEnemyBoard.flat().filter(c => c === 'ship').length
    if (enemyRemaining === 0) {
      setGameState('won')
      return
    }

    // Enemy turn
    setTimeout(() => {
      let er: number, ec: number
      do {
        er = Math.floor(Math.random() * GRID_SIZE)
        ec = Math.floor(Math.random() * GRID_SIZE)
      } while (playerBoard[er][ec] === 'hit' || playerBoard[er][ec] === 'miss')

      const newPlayerBoard = playerBoard.map(r => [...r])
      const playerHit = newPlayerBoard[er][ec] === 'ship'
      newPlayerBoard[er][ec] = playerHit ? 'hit' : 'miss'
      setPlayerBoard(newPlayerBoard)

      const playerRemaining = newPlayerBoard.flat().filter(c => c === 'ship').length
      if (playerRemaining === 0) {
        setGameState('lost')
      }
    }, 500)
  }

  const handleClick = (row: number, col: number, isPlayer: boolean) => {
    if (isPlayer) {
      handleSetupClick(row, col)
    } else {
      handleAttack(row, col)
    }
  }

  const renderBoard = (board: Cell[][], isPlayer: boolean) => (
    <div className="grid grid-cols-10 gap-0.5">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const bgColor =
            cell === 'ship' ? (isPlayer || gameState === 'won' || gameState === 'lost' ? 'bg-gray-600' : 'bg-blue-400') :
            cell === 'hit' ? 'bg-red-500' :
            cell === 'miss' ? 'bg-blue-300' :
            isDark ? 'bg-slate-600' : 'bg-blue-100'

          return (
            <button
              key={`${r}-${c}`}
              onClick={() => handleClick(r, c, isPlayer)}
              disabled={gameState !== 'setup' && gameState !== 'playing'}
              className={`w-7 h-7 sm:w-8 sm:h-8 ${bgColor} border border-gray-400 hover:opacity-80`}
            >
              {cell === 'hit' && '💥'}
              {cell === 'miss' && '·'}
            </button>
          )
        })
      )}
    </div>
  )

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-2">🚢 {lang === 'zh' ? '战舰' : 'Battleship'}</h1>
      <p className="text-sm mb-4">{message}</p>

      {gameState === 'setup' && setupShip < SHIPS.length && (
        <div className="mb-4 text-center">
          <p>{lang === 'zh' ? '放置' : 'Placing'}: {SHIPS[setupShip].nameZh} ({SHIPS[setupShip].size})</p>
          <button
            onClick={() => setIsHorizontal(!isHorizontal)}
            className={`mt-2 px-4 py-1 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}
          >
            {isHorizontal ? (lang === 'zh' ? '横向 →' : 'Horizontal →') : (lang === 'zh' ? '纵向 ↓' : 'Vertical ↓')}
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-8">
        <div className="text-center">
          <h3 className="font-bold mb-2">{lang === 'zh' ? '你的棋盘' : 'Your Board'}</h3>
          {renderBoard(playerBoard, true)}
        </div>

        {gameState === 'playing' && (
          <div className="text-center">
            <h3 className="font-bold mb-2">{lang === 'zh' ? '敌方棋盘' : 'Enemy Board'}</h3>
            {renderBoard(enemyBoard, false)}
          </div>
        )}
      </div>

      <button
        onClick={initBoards}
        className={`mt-4 px-6 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}
      >
        {lang === 'zh' ? '新游戏' : 'New Game'}
      </button>

      {(gameState === 'won' || gameState === 'lost') && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className={`p-8 rounded-2xl text-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-3xl font-bold mb-4 ${gameState === 'won' ? 'text-green-500' : 'text-red-500'}`}>
              {gameState === 'won' ? (lang === 'zh' ? '🎉 胜利！' : '🎉 You Win!') : (lang === 'zh' ? '游戏结束' : 'Game Over')}
            </h2>
            <button onClick={initBoards} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
              {lang === 'zh' ? '再来一次' : 'Play Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
