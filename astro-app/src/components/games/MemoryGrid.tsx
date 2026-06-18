import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  checkMemorySequenceInput,
  generateMemorySequence,
} from '../../games/memory-grid/logic'

type Props = {
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

type GameState = 'idle' | 'showing' | 'input' | 'correct' | 'wrong' | 'gameover'

export default function MemoryGrid({ settings }: Props) {
  const [sequence, setSequence] = useState<number[]>([])
  const [userInput, setUserInput] = useState<number[]>([])
  const [gameState, setGameState] = useState<GameState>('idle')
  const [level, setLevel] = useState(3)
  const [highScore, setHighScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [highlightedTile, setHighlightedTile] = useState<number | null>(null)
  const userInputRef = useRef<number[]>([])

  const isDark = settings.darkMode
  const isZh = settings.language === 'zh'

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('memorygrid_highscore')
    if (saved) setHighScore(parseInt(saved, 10))
  }, [])

  // Generate a random sequence
  // Start showing the sequence
  const startRound = useCallback((roundLevel = level) => {
    const fixture = new URLSearchParams(window.location.search).get('sequence')
    const seq = fixture
      ? fixture.split(',').map(Number).slice(0, roundLevel)
      : generateMemorySequence(roundLevel)
    setSequence(seq)
    setUserInput([])
    userInputRef.current = []
    setGameState('showing')

    // Show sequence one tile at a time
    let index = 0
    const showNext = () => {
      if (index < seq.length) {
        setHighlightedTile(seq[index])
        setTimeout(() => {
          setHighlightedTile(null)
          index++
          setTimeout(showNext, 300)
        }, 600)
      } else {
        setGameState('input')
      }
    }

    setTimeout(showNext, 500)
  }, [level])

  // Handle tile click during input phase
  const handleTileClick = useCallback((num: number) => {
    if (gameState !== 'input') return

    const newInput = [...userInputRef.current, num]
    userInputRef.current = newInput
    setUserInput(newInput)
    setHighlightedTile(num)
    setTimeout(() => setHighlightedTile(null), 200)

    // Check if the input matches so far
    const result = checkMemorySequenceInput(sequence, newInput)
    if (result === 'wrong') {
      // Wrong input
      setGameState('wrong')
      const newLives = lives - 1
      setLives(newLives)

      setTimeout(() => {
        if (newLives <= 0) {
          // Game over
          setGameState('gameover')
          if (level - 1 > highScore) {
            setHighScore(level - 1)
            localStorage.setItem('memorygrid_highscore', String(level - 1))
          }
        } else {
          // Try again
          setUserInput([])
          userInputRef.current = []
          setGameState('input')
        }
      }, 1500)
      return
    }

    // Check if sequence is complete
    if (result === 'correct') {
      setGameState('correct')

      setTimeout(() => {
        const nextLevel = level + 1
        setLevel(nextLevel)
        startRound(nextLevel)
      }, 1000)
    }
  }, [gameState, sequence, lives, level, highScore, startRound])

  // Start new game
  const startGame = useCallback(() => {
    setLevel(3)
    setLives(3)
    setUserInput([])
    userInputRef.current = []
    setSequence([])
    setGameState('idle')
  }, [])

  // Get tile color
  const getTileClass = (num: number): string => {
    const base = 'aspect-square rounded-lg text-2xl font-bold transition-all duration-200 '

    if (highlightedTile === num) {
      return base + 'bg-yellow-400 text-yellow-900 scale-110 shadow-lg shadow-yellow-500/50'
    }

    if (gameState === 'wrong' && userInput[userInput.length - 1] === num) {
      return base + 'bg-red-500 text-white'
    }

    if (gameState === 'correct') {
      return base + 'bg-green-500 text-white'
    }

    if (gameState === 'showing' || gameState === 'gameover') {
      return base + (isDark ? 'bg-slate-700 opacity-50' : 'bg-gray-200 opacity-50')
    }

    return base + (isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-800')
  }

  // Get status message
  const getStatusMessage = (): string => {
    switch (gameState) {
      case 'idle':
        return isZh ? '点击开始按钮' : 'Press Start to begin'
      case 'showing':
        return isZh ? '记住序列...' : 'Watch the sequence...'
      case 'input':
        return isZh ? `输入序列 (${userInput.length}/${sequence.length})` : `Your turn (${userInput.length}/${sequence.length})`
      case 'correct':
        return isZh ? '正确！下一关...' : 'Correct! Next level...'
      case 'wrong':
        return isZh ? '错误！' : 'Wrong!'
      case 'gameover':
        return isZh ? `游戏结束！最高等级: ${level - 1}` : `Game Over! Highest level: ${level - 1}`
      default:
        return ''
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-md w-full rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isZh ? '记忆网格' : 'Memory Grid'}
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              <span data-testid="memory-grid-state" className="sr-only">{gameState}</span>
              <span data-testid="memory-grid-sequence" className="sr-only">{sequence.join(',')}</span>
              <span data-testid="memory-grid-input" className="sr-only">{userInput.join(',')}</span>
              {getStatusMessage()}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              <span data-testid="memory-grid-level">{isZh ? '等级' : 'Level'}: {level}</span>
            </div>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {isZh ? '最高' : 'Best'}: {highScore}
            </div>
          </div>
        </div>

        {/* Lives display */}
        <div data-testid="memory-grid-lives" data-lives={lives} className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`text-2xl transition-all ${i <= lives ? 'text-red-500' : isDark ? 'text-slate-600' : 'text-gray-300'}`}
            >
              ❤️
            </div>
          ))}
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <button
              key={num}
              data-testid={`memory-grid-cell-${num}`}
              onClick={() => handleTileClick(num)}
              disabled={gameState !== 'input'}
              className={getTileClass(num)}
            >
              {num + 1}
            </button>
          ))}
        </div>

        {/* Progress bar for sequence length */}
        {gameState === 'input' && (
          <div className="mb-4">
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(userInput.length / sequence.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          {gameState === 'idle' && (
            <button
              data-testid="memory-grid-start"
              onClick={() => startRound()}
              className="flex-1 py-3 rounded-xl font-semibold transition-all bg-green-600 hover:bg-green-500 text-white"
            >
              {isZh ? '开始游戏' : 'Start Game'}
            </button>
          )}

          {(gameState === 'gameover' || gameState === 'wrong') && lives <= 0 && (
            <button
              onClick={startGame}
              className="flex-1 py-3 rounded-xl font-semibold transition-all bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isZh ? '重新开始' : 'Play Again'}
            </button>
          )}

          {gameState === 'wrong' && lives > 0 && (
            <button
              onClick={() => {
                userInputRef.current = []
                setUserInput([])
                setGameState('input')
              }}
              className="flex-1 py-3 rounded-xl font-semibold transition-all bg-amber-600 hover:bg-amber-500 text-white"
            >
              {isZh ? '重试' : 'Try Again'}
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {isZh ? '玩法' : 'How to Play'}:
          </h3>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• {isZh ? '观察高亮的格子序列' : 'Watch the highlighted tiles sequence'}</li>
            <li>• {isZh ? '按正确顺序点击格子' : 'Click the tiles in the correct order'}</li>
            <li>• {isZh ? '每过一关序列变长' : 'Sequence gets longer each level'}</li>
            <li>• {isZh ? '你有3条命' : 'You have 3 lives'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
