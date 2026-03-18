import { useState, useCallback, useEffect, useRef } from 'react'
import { getTranslation, type Language } from '../../data/locales'
import GameGuide from './GameGuide'

const CODE_LENGTH = 4
const MAX_ATTEMPTS = 8

const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const
type Color = (typeof COLORS)[number]

const COLOR_EMOJI: Record<Color, string> = {
  red: '🔴',
  orange: '🟠',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  purple: '🟣',
}

// 每个格子的反馈状态
type CellFeedback = 'correct' | 'wrongPosition' | 'wrong'

type Feedback = {
  cells: CellFeedback[] // 每个格子的具体反馈
  green: number // 正确位置的数量
  white: number // 错误位置的数量
}

type Settings = {
  language: Language
  soundEnabled: boolean
  darkMode: boolean
}

// 简单的种子随机数生成器 (Mulberry32)
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// 生成随机密码
function generateCode(): Color[] {
  const code: Color[] = []
  for (let i = 0; i < CODE_LENGTH; i++) {
    code.push(COLORS[Math.floor(Math.random() * COLORS.length)])
  }
  return code
}

// 根据种子生成密码（用于挑战模式）
function generateCodeBySeed(seed: number): Color[] {
  const rng = mulberry32(seed)
  const code: Color[] = []
  for (let i = 0; i < CODE_LENGTH; i++) {
    code.push(COLORS[Math.floor(rng() * COLORS.length)])
  }
  return code
}

// 评估猜测，返回每个格子的详细反馈
function evaluate(guess: Color[], answer: Color[]): Feedback {
  const cells: CellFeedback[] = Array(CODE_LENGTH).fill('wrong')
  let green = 0
  let white = 0

  const answerCopy = [...answer]
  const guessCopy = [...guess]

  // First pass: find exact matches (green)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] === answerCopy[i]) {
      cells[i] = 'correct'
      green++
      answerCopy[i] = null as unknown as Color
      guessCopy[i] = null as unknown as Color
    }
  }

  // Second pass: find color matches (white) - 但要标记为错位
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] === null) continue

    const idx = answerCopy.indexOf(guessCopy[i])
    if (idx !== -1) {
      cells[i] = 'wrongPosition'
      white++
      answerCopy[idx] = null as unknown as Color
    }
  }

  return { cells, green, white }
}

// 音效
function playSound(type: 'select' | 'submit' | 'win' | 'lose', enabled: boolean) {
  if (!enabled) return
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  switch (type) {
    case 'select':
      oscillator.frequency.value = 400
      gainNode.gain.value = 0.05
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.03)
      break
    case 'submit':
      oscillator.frequency.value = 500
      gainNode.gain.value = 0.08
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.08)
      break
    case 'win':
      oscillator.frequency.value = 523
      gainNode.gain.value = 0.1
      oscillator.start()
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15)
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3)
      oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.45)
      oscillator.stop(audioContext.currentTime + 0.6)
      break
    case 'lose':
      oscillator.frequency.value = 200
      gainNode.gain.value = 0.1
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.3)
      break
  }
}

interface MastermindProps {
  settings: Settings
  onBack: () => void
}

export default function Mastermind({ settings, onBack }: MastermindProps) {
  const [answer, setAnswer] = useState<Color[]>(() => generateCode())
  const [attempts, setAttempts] = useState<Color[][]>([])
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [currentGuess, setCurrentGuess] = useState<Color[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [showGameGuide, setShowGameGuide] = useState(false)
  const [copied, setCopied] = useState(false)
  const [challengeCopied, setChallengeCopied] = useState(false)
  const [challengeSeed, setChallengeSeed] = useState<number | null>(null)

  const initializedRef = useRef(false)
  const t = getTranslation(settings.language)

  const handleColorSelect = useCallback((color: Color) => {
    if (gameOver) return
    if (currentGuess.length < CODE_LENGTH) {
      setCurrentGuess([...currentGuess, color])
      playSound('select', settings.soundEnabled)
    }
  }, [currentGuess, gameOver, settings.soundEnabled])

  const handleRemove = useCallback(() => {
    if (currentGuess.length > 0) {
      setCurrentGuess(currentGuess.slice(0, -1))
      playSound('select', settings.soundEnabled)
    }
  }, [currentGuess, settings.soundEnabled])

  const handleSubmit = useCallback(() => {
    if (currentGuess.length !== CODE_LENGTH) return

    const feedback = evaluate(currentGuess, answer)
    const newAttempts = [...attempts, currentGuess]
    const newFeedbacks = [...feedbacks, feedback]

    setAttempts(newAttempts)
    setFeedbacks(newFeedbacks)
    playSound('submit', settings.soundEnabled)

    const isWin = feedback.green === CODE_LENGTH
    const isGameOver = isWin || newAttempts.length >= MAX_ATTEMPTS

    if (isWin) {
      setTimeout(() => {
        setWon(true)
        setGameOver(true)
        playSound('win', settings.soundEnabled)
      }, 300)
    } else if (isGameOver) {
      setTimeout(() => {
        setGameOver(true)
        playSound('lose', settings.soundEnabled)
      }, 300)
    }

    setCurrentGuess([])
  }, [currentGuess, answer, attempts, feedbacks, settings.soundEnabled])

  // 生成分享文本
  const generateShareText = useCallback(() => {
    const lines = [
      `🔐 Mastermind ${won ? attempts.length : 'X'}/${MAX_ATTEMPTS}`,
    ]
    feedbacks.forEach((feedback) => {
      const row = feedback.cells.map((cell) => {
        if (cell === 'correct') return '🟢'
        if (cell === 'wrongPosition') return '⚪'
        return '🔴'
      }).join('')
      lines.push(row)
    })
    return lines.join('\n')
  }, [feedbacks, won, attempts.length])

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(generateShareText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [generateShareText])

  // 生成挑战链接
  const generateChallengeLink = useCallback(() => {
    const seed = Math.floor(Math.random() * 1000000)
    const baseUrl = window.location.origin
    return `${baseUrl}?challenge=mastermind&seed=${seed}`
  }, [])

  const handleChallengeShare = useCallback(() => {
    navigator.clipboard.writeText(generateChallengeLink()).then(() => {
      setChallengeCopied(true)
      setTimeout(() => setChallengeCopied(false), 2000)
    })
  }, [generateChallengeLink])

  // 解析 URL 参数，处理挑战模式
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const challenge = params.get('challenge')
    const seed = params.get('seed')

    if (challenge === 'mastermind' && seed) {
      const seedNum = parseInt(seed, 10)
      if (!isNaN(seedNum)) {
        setChallengeSeed(seedNum)
        setAnswer(generateCodeBySeed(seedNum))
        // 清除 URL 参数
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  const newGame = useCallback(() => {
    setAnswer(generateCode())
    setAttempts([])
    setFeedbacks([])
    setCurrentGuess([])
    setGameOver(false)
    setWon(false)
    setShowAnswer(false)
  }, [])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === 'Enter') newGame()
        return
      }

      const key = e.key.toLowerCase()
      if (key === 'backspace') {
        handleRemove()
      } else if (key === 'enter') {
        handleSubmit()
      } else if (key === '1') handleColorSelect('red')
      else if (key === '2') handleColorSelect('orange')
      else if (key === '3') handleColorSelect('yellow')
      else if (key === '4') handleColorSelect('green')
      else if (key === '5') handleColorSelect('blue')
      else if (key === '6') handleColorSelect('purple')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gameOver, handleRemove, handleSubmit, handleColorSelect, newGame])

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      {/* Header */}
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{settings.language === 'zh' ? '密码破译' : 'Mastermind'}</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowGameGuide(true)}
              className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
              title={settings.language === 'zh' ? '游戏指南' : 'Game Guide'}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </button>
            <button
              onClick={newGame}
              className={`p-2 rounded-lg ${settings.darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-200'}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className={`text-center text-xs ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
          {settings.language === 'zh'
            ? '猜出4个颜色的正确组合！🟢=正确位置 ⚪=错误位置 🔴=错误'
            : 'Guess the 4-color code! 🟢=Correct ⚪=Wrong position 🔴=Wrong'}
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center mb-4">
        <div className="space-y-2">
          {/* Previous attempts */}
          {attempts.map((attempt, row) => (
            <div key={row} className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {attempt.map((color, i) => {
                  const feedback = feedbacks[row]?.cells[i]
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                          ${color === 'red' ? 'bg-red-500' : ''}
                          ${color === 'orange' ? 'bg-orange-500' : ''}
                          ${color === 'yellow' ? 'bg-yellow-500' : ''}
                          ${color === 'green' ? 'bg-green-500' : ''}
                          ${color === 'blue' ? 'bg-blue-500' : ''}
                          ${color === 'purple' ? 'bg-purple-500' : ''}
                        `}
                      >
                        {COLOR_EMOJI[color]}
                      </div>
                      {/* 状态条 */}
                      <div className="w-12 h-1.5 rounded-b-lg mt-0.5">
                        {feedback === 'correct' && (
                          <div className="w-full h-full bg-green-500 rounded-b-lg" />
                        )}
                        {feedback === 'wrongPosition' && (
                          <div className="w-full h-full bg-white border border-gray-400 rounded-b-lg" />
                        )}
                        {feedback === 'wrong' && (
                          <div className="w-full h-full bg-red-600 rounded-b-lg" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Current guess row */}
          {!gameOver && attempts.length < MAX_ATTEMPTS && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl border-2
                      ${currentGuess[i]
                        ? `${currentGuess[i] === 'red' ? 'bg-red-500' : ''}
                           ${currentGuess[i] === 'orange' ? 'bg-orange-500' : ''}
                           ${currentGuess[i] === 'yellow' ? 'bg-yellow-500' : ''}
                           ${currentGuess[i] === 'green' ? 'bg-green-500' : ''}
                           ${currentGuess[i] === 'blue' ? 'bg-blue-500' : ''}
                           ${currentGuess[i] === 'purple' ? 'bg-purple-500' : ''}`
                        : settings.darkMode ? 'border-gray-600' : 'border-gray-300'
                      }
                    `}
                  >
                    {currentGuess[i] && COLOR_EMOJI[currentGuess[i]]}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty rows */}
          {Array.from({ length: Math.max(0, MAX_ATTEMPTS - attempts.length - (gameOver ? 0 : 1)) }).map((_, row) => (
            <div key={`empty-${row}`} className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-lg border-2 ${settings.darkMode ? 'border-gray-700' : 'border-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Game Over Message */}
        {gameOver && (
          <div className={`mt-4 text-center ${cardBgClass} rounded-xl p-4`}>
            {won ? (
              <>
                <div className="text-3xl mb-2">🎉</div>
                <div className="font-bold text-green-500">
                  {settings.language === 'zh' ? '恭喜破解！' : 'Code Cracked!'}
                </div>
                <div className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {settings.language === 'zh'
                    ? `用了 ${attempts.length} 次`
                    : `${attempts.length} ${attempts.length === 1 ? 'try' : 'tries'}`}
                </div>
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">😢</div>
                <div className="font-bold text-red-500">
                  {settings.language === 'zh' ? '挑战失败' : 'Game Over'}
                </div>
                <div className="mt-2 flex justify-center gap-1">
                  {answer.map((color, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded flex items-center justify-center
                        ${color === 'red' ? 'bg-red-500' : ''}
                        ${color === 'orange' ? 'bg-orange-500' : ''}
                        ${color === 'yellow' ? 'bg-yellow-500' : ''}
                        ${color === 'green' ? 'bg-green-500' : ''}
                        ${color === 'blue' ? 'bg-blue-500' : ''}
                        ${color === 'purple' ? 'bg-purple-500' : ''}
                      `}
                    >
                      {COLOR_EMOJI[color]}
                    </div>
                  ))}
                </div>
              </>
            )}
            <button
              onClick={newGame}
              className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-white"
            >
              {settings.language === 'zh' ? '再来一局' : 'Play Again'}
            </button>
            <button
              onClick={handleShare}
              className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-white"
            >
              {copied
                ? (settings.language === 'zh' ? '已复制!' : 'Copied!')
                : (settings.language === 'zh' ? '分享战绩' : 'Share Result')}
            </button>
            <button
              onClick={handleChallengeShare}
              className="mt-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold text-white"
            >
              {challengeCopied
                ? (settings.language === 'zh' ? '链接已复制!' : 'Link copied!')
                : (settings.language === 'zh' ? '🔗 挑战好友' : '🔗 Challenge Friends')}
            </button>
          </div>
        )}
      </div>

      {/* Color Picker */}
      {!gameOver && (
        <div className={`w-full max-w-md ${cardBgClass} rounded-t-2xl p-4`}>
          <div className="flex justify-center gap-2 mb-3">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                disabled={currentGuess.length >= CODE_LENGTH}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                  transition-transform hover:scale-110 active:scale-95
                  ${color === 'red' ? 'bg-red-500' : ''}
                  ${color === 'orange' ? 'bg-orange-500' : ''}
                  ${color === 'yellow' ? 'bg-yellow-500' : ''}
                  ${color === 'green' ? 'bg-green-500' : ''}
                  ${color === 'blue' ? 'bg-blue-500' : ''}
                  ${color === 'purple' ? 'bg-purple-500' : ''}
                  ${currentGuess.length >= CODE_LENGTH ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {COLOR_EMOJI[color]}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <button
              onClick={handleRemove}
              disabled={currentGuess.length === 0}
              className={`px-4 py-2 rounded-lg font-semibold
                ${settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}
                ${currentGuess.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {settings.language === 'zh' ? '删除' : 'Delete'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={currentGuess.length !== CODE_LENGTH}
              className={`px-6 py-2 rounded-lg font-semibold text-white
                ${currentGuess.length === CODE_LENGTH ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 opacity-50 cursor-not-allowed'}
              `}
            >
              {settings.language === 'zh' ? '提交' : 'Submit'}
            </button>
          </div>

          {/* Keyboard hints */}
          <div className={`text-center text-xs ${settings.darkMode ? 'text-gray-500' : 'text-gray-400'} mt-3`}>
            {settings.language === 'zh' ? '键盘: 1-6 选颜色, Enter 提交, Backspace 删除' : 'Keys: 1-6 colors, Enter submit, Backspace delete'}
          </div>
        </div>
      )}

      {/* Game Guide */}
      {showGameGuide && (
        <GameGuide
          language={settings.language}
          darkMode={settings.darkMode}
          onClose={() => setShowGameGuide(false)}
          initialGame="mastermind"
        />
      )}
    </div>
  )
}
