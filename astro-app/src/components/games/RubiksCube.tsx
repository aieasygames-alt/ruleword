import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type RubiksCubeProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
}

type Face = number[][] // 3x3 grid of colors
type Cube = {
  U: Face // Up - White
  D: Face // Down - Yellow
  F: Face // Front - Red
  B: Face // Back - Orange
  L: Face // Left - Green
  R: Face // Right - Blue
}

const COLORS = {
  0: 'white',    // White
  1: 'yellow',   // Yellow
  2: 'red',      // Red
  3: 'orange',   // Orange
  4: 'green',    // Green
  5: 'blue',     // Blue
}

const COLOR_HEX: Record<number, string> = {
  0: '#FFFFFF',   // White
  1: '#FFFF00',   // Yellow
  2: '#FF0000',   // Red
  3: '#FFA500',   // Orange
  4: '#00FF00',   // Green
  5: '#0000FF',   // Blue
}

// Create solved cube
const createSolvedCube = (): Cube => ({
  U: [[0, 0, 0], [0, 0, 0], [0, 0, 0]], // White
  D: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // Yellow
  F: [[2, 2, 2], [2, 2, 2], [2, 2, 2]], // Red
  B: [[3, 3, 3], [3, 3, 3], [3, 3, 3]], // Orange
  L: [[4, 4, 4], [4, 4, 4], [4, 4, 4]], // Green
  R: [[5, 5, 5], [5, 5, 5], [5, 5, 5]], // Blue
})

// Rotate face clockwise
const rotateFaceCW = (face: Face): Face => [
  [face[2][0], face[1][0], face[0][0]],
  [face[2][1], face[1][1], face[0][1]],
  [face[2][2], face[1][2], face[0][2]],
]

// Rotate face counter-clockwise
const rotateFaceCCW = (face: Face): Face => [
  [face[0][2], face[1][2], face[2][2]],
  [face[0][1], face[1][1], face[2][1]],
  [face[0][0], face[1][0], face[2][0]],
]

export default function RubiksCube({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: RubiksCubeProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'solved'>('menu')
  const [cube, setCube] = useState<Cube>(createSolvedCube())
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [bestTime, setBestTime] = useState(Infinity)
  const [bestMoves, setBestMoves] = useState(Infinity)

  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const isZh = settings.language === 'zh'

  useEffect(() => {
    const savedTime = localStorage.getItem('rubikscube-besttime')
    const savedMoves = localStorage.getItem('rubikscube-bestmoves')
    if (savedTime) setBestTime(parseInt(savedTime, 10))
    if (savedMoves) setBestMoves(parseInt(savedMoves, 10))
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) {
        // Use high score as inverse time (lower time = higher score)
      }
    }
  }, [getHighScore])

  const playSound = useCallback((type: 'rotate' | 'solve') => {
    if (!settings.soundEnabled) return
    try {
      if (!audioContext.current) audioContext.current = new AudioContext()
      const ctx = audioContext.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'rotate') {
        osc.frequency.value = 300 + Math.random() * 100
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
      } else if (type === 'solve') {
        osc.frequency.value = 600
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      }
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    } catch {}
  }, [settings.soundEnabled])

  // Check if cube is solved
  const isSolved = useCallback((c: Cube): boolean => {
    return Object.values(c).every(face =>
      face.every(row => row.every(cell => cell === face[1][1]))
    )
  }, [])

  // Shuffle cube
  const shuffleCube = useCallback((c: Cube, count: number = 20): Cube => {
    let shuffled = { ...c }
    const moves = ['U', 'D', 'F', 'B', 'L', 'R', "U'", "D'", "F'", "B'", "L'", "R'"]

    for (let i = 0; i < count; i++) {
      const move = moves[Math.floor(Math.random() * moves.length)]
      shuffled = performMove(shuffled, move)
    }

    return shuffled
  }, [])

  const performMove = useCallback((c: Cube, move: string): Cube => {
    const newCube = {
      U: c.U.map(row => [...row]),
      D: c.D.map(row => [...row]),
      F: c.F.map(row => [...row]),
      B: c.B.map(row => [...row]),
      L: c.L.map(row => [...row]),
      R: c.R.map(row => [...row]),
    }

    const prime = move.includes("'")
    const face = move.replace("'", "") as keyof Cube

    // Rotate the face itself
    if (face === 'U') {
      newCube.U = prime ? rotateFaceCCW(c.U) : rotateFaceCW(c.U)
      if (!prime) {
        const temp = [c.F[0][0], c.F[0][1], c.F[0][2]]
        newCube.F[0] = [c.R[0][0], c.R[0][1], c.R[0][2]]
        newCube.R[0] = [c.B[0][0], c.B[0][1], c.B[0][2]]
        newCube.B[0] = [c.L[0][0], c.L[0][1], c.L[0][2]]
        newCube.L[0] = temp
      } else {
        const temp = [c.F[0][0], c.F[0][1], c.F[0][2]]
        newCube.F[0] = [c.L[0][0], c.L[0][1], c.L[0][2]]
        newCube.L[0] = [c.B[0][0], c.B[0][1], c.B[0][2]]
        newCube.B[0] = [c.R[0][0], c.R[0][1], c.R[0][2]]
        newCube.R[0] = temp
      }
    } else if (face === 'D') {
      newCube.D = prime ? rotateFaceCCW(c.D) : rotateFaceCW(c.D)
      if (!prime) {
        const temp = [c.F[2][0], c.F[2][1], c.F[2][2]]
        newCube.F[2] = [c.L[2][0], c.L[2][1], c.L[2][2]]
        newCube.L[2] = [c.B[2][0], c.B[2][1], c.B[2][2]]
        newCube.B[2] = [c.R[2][0], c.R[2][1], c.R[2][2]]
        newCube.R[2] = temp
      } else {
        const temp = [c.F[2][0], c.F[2][1], c.F[2][2]]
        newCube.F[2] = [c.R[2][0], c.R[2][1], c.R[2][2]]
        newCube.R[2] = [c.B[2][0], c.B[2][1], c.B[2][2]]
        newCube.B[2] = [c.L[2][0], c.L[2][1], c.L[2][2]]
        newCube.L[2] = temp
      }
    } else if (face === 'F') {
      newCube.F = prime ? rotateFaceCCW(c.F) : rotateFaceCW(c.F)
      if (!prime) {
        const temp = [c.U[2][0], c.U[2][1], c.U[2][2]]
        newCube.U[2][0] = c.L[2][2]
        newCube.U[2][1] = c.L[1][2]
        newCube.U[2][2] = c.L[0][2]
        newCube.L[0][2] = c.D[0][0]
        newCube.L[1][2] = c.D[0][1]
        newCube.L[2][2] = c.D[0][2]
        newCube.D[0][0] = c.R[2][0]
        newCube.D[0][1] = c.R[1][0]
        newCube.D[0][2] = c.R[0][0]
        newCube.R[0][0] = temp[0]
        newCube.R[1][0] = temp[1]
        newCube.R[2][0] = temp[2]
      } else {
        const temp = [c.U[2][0], c.U[2][1], c.U[2][2]]
        newCube.U[2][0] = c.R[0][0]
        newCube.U[2][1] = c.R[1][0]
        newCube.U[2][2] = c.R[2][0]
        newCube.R[0][0] = c.D[0][2]
        newCube.R[1][0] = c.D[0][1]
        newCube.R[2][0] = c.D[0][0]
        newCube.D[0][0] = c.L[0][2]
        newCube.D[0][1] = c.L[1][2]
        newCube.D[0][2] = c.L[2][2]
        newCube.L[0][2] = temp[2]
        newCube.L[1][2] = temp[1]
        newCube.L[2][2] = temp[0]
      }
    } else if (face === 'B') {
      newCube.B = prime ? rotateFaceCCW(c.B) : rotateFaceCW(c.B)
      if (!prime) {
        const temp = [c.U[0][0], c.U[0][1], c.U[0][2]]
        newCube.U[0][0] = c.R[0][2]
        newCube.U[0][1] = c.R[1][2]
        newCube.U[0][2] = c.R[2][2]
        newCube.R[0][2] = c.D[2][2]
        newCube.R[1][2] = c.D[2][1]
        newCube.R[2][2] = c.D[2][0]
        newCube.D[2][0] = c.L[0][0]
        newCube.D[2][1] = c.L[1][0]
        newCube.D[2][2] = c.L[2][0]
        newCube.L[0][0] = temp[2]
        newCube.L[1][0] = temp[1]
        newCube.L[2][0] = temp[0]
      } else {
        const temp = [c.U[0][0], c.U[0][1], c.U[0][2]]
        newCube.U[0][0] = c.L[2][0]
        newCube.U[0][1] = c.L[1][0]
        newCube.U[0][2] = c.L[0][0]
        newCube.L[0][0] = c.D[2][0]
        newCube.L[1][0] = c.D[2][1]
        newCube.L[2][0] = c.D[2][2]
        newCube.D[2][0] = c.R[2][2]
        newCube.D[2][1] = c.R[1][2]
        newCube.D[2][2] = c.R[0][2]
        newCube.R[0][2] = temp[0]
        newCube.R[1][2] = temp[1]
        newCube.R[2][2] = temp[2]
      }
    } else if (face === 'L') {
      newCube.L = prime ? rotateFaceCCW(c.L) : rotateFaceCW(c.L)
      if (!prime) {
        const temp = [c.U[0][0], c.U[1][0], c.U[2][0]]
        newCube.U[0][0] = c.B[2][2]
        newCube.U[1][0] = c.B[1][2]
        newCube.U[2][0] = c.B[0][2]
        newCube.B[0][2] = c.D[2][0]
        newCube.B[1][2] = c.D[1][0]
        newCube.B[2][2] = c.D[0][0]
        newCube.D[0][0] = c.F[0][0]
        newCube.D[1][0] = c.F[1][0]
        newCube.D[2][0] = c.F[2][0]
        newCube.F[0][0] = temp[0]
        newCube.F[1][0] = temp[1]
        newCube.F[2][0] = temp[2]
      } else {
        const temp = [c.U[0][0], c.U[1][0], c.U[2][0]]
        newCube.U[0][0] = c.F[0][0]
        newCube.U[1][0] = c.F[1][0]
        newCube.U[2][0] = c.F[2][0]
        newCube.F[0][0] = c.D[0][0]
        newCube.F[1][0] = c.D[1][0]
        newCube.F[2][0] = c.D[2][0]
        newCube.D[0][0] = c.B[2][2]
        newCube.D[1][0] = c.B[1][2]
        newCube.D[2][0] = c.B[0][2]
        newCube.B[0][2] = temp[2]
        newCube.B[1][2] = temp[1]
        newCube.B[2][2] = temp[0]
      }
    } else if (face === 'R') {
      newCube.R = prime ? rotateFaceCCW(c.R) : rotateFaceCW(c.R)
      if (!prime) {
        const temp = [c.U[0][2], c.U[1][2], c.U[2][2]]
        newCube.U[0][2] = c.F[0][2]
        newCube.U[1][2] = c.F[1][2]
        newCube.U[2][2] = c.F[2][2]
        newCube.F[0][2] = c.D[0][2]
        newCube.F[1][2] = c.D[1][2]
        newCube.F[2][2] = c.D[2][2]
        newCube.D[0][2] = c.B[2][0]
        newCube.D[1][2] = c.B[1][0]
        newCube.D[2][2] = c.B[0][0]
        newCube.B[0][0] = temp[2]
        newCube.B[1][0] = temp[1]
        newCube.B[2][0] = temp[0]
      } else {
        const temp = [c.U[0][2], c.U[1][2], c.U[2][2]]
        newCube.U[0][2] = c.B[2][0]
        newCube.U[1][2] = c.B[1][0]
        newCube.U[2][2] = c.B[0][0]
        newCube.B[0][0] = c.D[2][2]
        newCube.B[1][0] = c.D[1][2]
        newCube.B[2][0] = c.D[0][2]
        newCube.D[0][2] = c.F[0][2]
        newCube.D[1][2] = c.F[1][2]
        newCube.D[2][2] = c.F[2][2]
        newCube.F[0][2] = temp[0]
        newCube.F[1][2] = temp[1]
        newCube.F[2][2] = temp[2]
      }
    }

    return newCube
  }, [])

  const handleMove = useCallback((move: string) => {
    if (gameState !== 'playing') return

    playSound('rotate')
    setCube(prev => performMove(prev, move))
    setMoves(prev => prev + 1)
  }, [gameState, playSound, performMove])

  const startGame = useCallback(() => {
    const shuffled = shuffleCube(createSolvedCube(), 20)
    setCube(shuffled)
    setMoves(0)
    setTime(0)
    setGameState('playing')
  }, [shuffleCube])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState])

  // Check for solution
  useEffect(() => {
    if (gameState === 'playing' && isSolved(cube)) {
      playSound('solve')
      if (updateScore) updateScore(1000 - moves * 10)

      if (time < bestTime || bestTime === Infinity) {
        setBestTime(time)
        localStorage.setItem('rubikscube-besttime', time.toString())
      }
      if (moves < bestMoves || bestMoves === Infinity) {
        setBestMoves(moves)
        localStorage.setItem('rubikscube-bestmoves', moves.toString())
      }

      setGameState('solved')
    }
  }, [cube, gameState, isSolved, playSound, updateScore, time, moves, bestTime, bestMoves])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderFace = (face: Face, label: string) => (
    <div className="flex flex-col items-center">
      <span className="text-xs mb-1 opacity-60 font-medium">{label}</span>
      <div className="grid grid-cols-3 gap-0.5 p-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg">
        {face.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="w-7 h-7 rounded-sm border border-gray-500/50 shadow-inner transition-transform hover:scale-105"
              style={{
                backgroundColor: COLOR_HEX[cell],
                boxShadow: cell === 0 ? 'inset 2px 2px 4px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.1)' :
                           cell === 1 ? 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.2)' :
                           cell === 2 ? 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.3)' :
                           cell === 3 ? 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.2)' :
                           cell === 4 ? 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.3)' :
                           'inset 2px 2px 4px rgba(255,255,255,0.3), inset -1px -1px 2px rgba(0,0,0,0.3)'
              }}
            />
          ))
        )}
      </div>
    </div>
  )

  const MoveButton = ({ move, label }: { move: string; label: string }) => (
    <button
      onClick={() => handleMove(move)}
      className="px-3 py-2 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-lg text-sm font-bold transition-all shadow-lg shadow-gray-900/30 hover:scale-105 active:scale-95"
    >
      {label}
    </button>
  )

  const texts = {
    title: isZh ? '魔方' : 'Rubik\'s Cube',
    moves: isZh ? '步数' : 'Moves',
    time: isZh ? '时间' : 'Time',
    best: isZh ? '最佳' : 'Best',
    start: isZh ? '开始游戏' : 'Start',
    shuffle: isZh ? '打乱' : 'Shuffle',
    solved: isZh ? '恭喜完成！' : 'Solved!',
    playAgain: isZh ? '再玩一次' : 'Play Again',
    controls: isZh ? '点击按钮旋转魔方的各个面' : 'Click buttons to rotate cube faces',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between border-b border-gray-700 pb-3 mb-4">
          <button onClick={() => gameState === 'playing' ? setGameState('menu') : onBack()} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        {gameState === 'menu' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🧊</div>
            <h2 className="text-2xl font-bold mb-4">{texts.title}</h2>
            <p className="text-sm mb-2 opacity-60">{texts.controls}</p>
            {bestMoves < Infinity && (
              <p className="text-sm mb-2">{texts.best}: {bestMoves} {isZh ? '步' : 'moves'}, {formatTime(bestTime)}</p>
            )}
            <button onClick={startGame} className="mt-4 px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
              {texts.start}
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'solved') && (
          <>
            {/* Stats */}
            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <p className="text-sm opacity-60">{texts.moves}</p>
                <p className="text-2xl font-bold">{moves}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-60">{texts.time}</p>
                <p className="text-2xl font-bold">{formatTime(time)}</p>
              </div>
            </div>

            {/* Cube display - unfolded net layout */}
            <div className="flex flex-col items-center gap-1 mb-6">
              {/* Top row: Back, Up, Front */}
              <div className="flex gap-1">
                <div className="w-24 h-24"></div> {/* Spacer */}
                {renderFace(cube.B, isZh ? '后' : 'B')}
                <div className="w-24 h-24"></div> {/* Spacer */}
              </div>

              {/* Middle row: Left, Front, Right */}
              <div className="flex gap-1">
                {renderFace(cube.L, isZh ? '左' : 'L')}
                {renderFace(cube.F, isZh ? '前' : 'F')}
                {renderFace(cube.R, isZh ? '右' : 'R')}
              </div>

              {/* Bottom row: Down */}
              <div className="flex gap-1">
                <div className="w-24 h-24"></div> {/* Spacer */}
                {renderFace(cube.D, isZh ? '下' : 'D')}
                <div className="w-24 h-24"></div> {/* Spacer */}
              </div>
            </div>

            {/* Move buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <MoveButton move="U" label="U" />
              <MoveButton move="D" label="D" />
              <MoveButton move="F" label="F" />
              <MoveButton move="B" label="B" />
              <MoveButton move="L" label="L" />
              <MoveButton move="R" label="R" />
              <MoveButton move="U'" label="U'" />
              <MoveButton move="D'" label="D'" />
              <MoveButton move="F'" label="F'" />
              <MoveButton move="B'" label="B'" />
              <MoveButton move="L'" label="L'" />
              <MoveButton move="R'" label="R'" />
            </div>

            <p className="text-xs text-center opacity-60 mb-4">
              {isZh ? "U=上, D=下, F=前, B=后, L=左, R=右. ' 表示逆时针" : "U=Up, D=Down, F=Front, B=Back, L=Left, R=Right. ' = counter-clockwise"}
            </p>

            {/* Solved overlay */}
            {gameState === 'solved' && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
                <div className={`${settings.darkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl p-8 text-center`}>
                  <div className="text-5xl mb-4">🎉</div>
                  <h2 className="text-2xl font-bold mb-4">{texts.solved}</h2>
                  <p className="text-xl mb-2">{texts.moves}: {moves}</p>
                  <p className="text-xl mb-4">{texts.time}: {formatTime(time)}</p>
                  {(moves <= bestMoves || time <= bestTime) && (
                    <p className="text-yellow-400 mb-4">🏆 {isZh ? '新纪录!' : 'New Record!'}</p>
                  )}
                  <button onClick={startGame} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                    {texts.playAgain}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
