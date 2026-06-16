import { useState, useCallback, useEffect, useRef } from 'react'
import { LEVELS } from './police-escape/engine/levels'
import { validatePath } from './police-escape/engine/pathValidator'
import { simulate } from './police-escape/engine/simulator'
import type { Coord, Frame, Level, Path } from './police-escape/engine/types'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type Props = {
  settings: Settings
  onBack?: () => void
  toggleLanguage?: () => void
  toggleTheme?: () => void
  toggleSound?: () => void
}

type Progress = {
  unlocked: number // highest unlocked level (1-based)
  bestSteps: Record<number, number> // levelId -> best step count
}

const PROGRESS_KEY = 'policeescape_progress'

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return { unlocked: p.unlocked ?? 1, bestSteps: p.bestSteps ?? {} }
    }
  } catch { /* empty */ }
  return { unlocked: 1, bestSteps: {} }
}

function saveProgress(p: Progress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)) } catch { /* empty */ }
}

export default function PoliceEscape({ settings }: Props) {
  const isDark = settings.darkMode
  const zh = settings.language === 'zh'

  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [view, setView] = useState<'select' | 'play'>('select')
  const [levelIdx, setLevelIdx] = useState(0)
  const level: Level = LEVELS[levelIdx]

  const [path, setPath] = useState<Path>([])
  const draggingRef = useRef(false)
  const [result, setResult] = useState<null | { outcome: 'win' | 'lose' | 'invalid'; reason?: string; frames?: Frame[] }>(null)
  const [playingFrames, setPlayingFrames] = useState<Frame[] | null>(null)
  const [frameIdx, setFrameIdx] = useState(0)
  const playTimer = useRef<number | null>(null)

  useEffect(() => () => { if (playTimer.current) window.clearTimeout(playTimer.current) }, [])

  const startLevel = useCallback((idx: number) => {
    setLevelIdx(idx)
    setPath([])
    setResult(null)
    setPlayingFrames(null)
    setFrameIdx(0)
    setView('play')
  }, [])

  const resetLevel = useCallback(() => {
    setPath([])
    setResult(null)
    setPlayingFrames(null)
    setFrameIdx(0)
    if (playTimer.current) { window.clearTimeout(playTimer.current); playTimer.current = null }
  }, [])

  const cellSize = level.size <= 7 ? 48 : level.size <= 9 ? 40 : 32

  // Drag-to-draw path. Pointer down on thief start begins; move into adjacent cell extends;
  // backtracking (moving into the previous-to-last cell) shortens.
  const cellAtPointer = (clientX: number, clientY: number): Coord | null => {
    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null
    const cellEl = el?.closest('[data-cell]') as HTMLElement | null
    if (!cellEl) return null
    const r = Number(cellEl.dataset.r)
    const c = Number(cellEl.dataset.c)
    if (Number.isNaN(r) || Number.isNaN(c)) return null
    return { r, c }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (playingFrames) return
    const cell = cellAtPointer(e.clientX, e.clientY)
    if (!cell) return
    if (cell.r !== level.thiefStart.r || cell.c !== level.thiefStart.c) return
    draggingRef.current = true
    setPath([{ ...level.thiefStart }])
    setResult(null)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    const cell = cellAtPointer(e.clientX, e.clientY)
    if (!cell) return
    setPath(prev => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      if (last.r === cell.r && last.c === cell.c) return prev
      // Backtrack?
      if (prev.length >= 2) {
        const before = prev[prev.length - 2]
        if (before.r === cell.r && before.c === cell.c) {
          return prev.slice(0, -1)
        }
      }
      // Must be orthogonally adjacent to last.
      const dist = Math.abs(last.r - cell.r) + Math.abs(last.c - cell.c)
      if (dist !== 1) return prev
      // Must not already be in path (no loops).
      if (prev.some(p => p.r === cell.r && p.c === cell.c)) return prev
      // Skip walls and unmelted ice at the entry step.
      const cellData = level.grid[cell.r][cell.c]
      if (cellData.kind === 'wall') return prev
      if (cellData.kind === 'ice' && cellData.meltAt !== undefined && prev.length < cellData.meltAt) return prev
      return [...prev, cell]
    })
  }

  const onPointerUp = () => { draggingRef.current = false }

  const onGo = () => {
    if (path.length === 0) return
    const v = validatePath(level, path)
    if (!v.valid) {
      setResult({ outcome: 'invalid', reason: v.reason })
      return
    }
    const res = simulate(level, path)
    if (res.outcome === 'invalid') {
      setResult({ outcome: 'invalid', reason: res.reason })
      return
    }
    // Animate frames.
    setPlayingFrames(res.frames)
    setFrameIdx(0)
    let i = 0
    const step = () => {
      i += 1
      setFrameIdx(i)
      if (i < res.frames.length) {
        playTimer.current = window.setTimeout(step, 280)
      } else {
        // After last frame, settle the result.
        playTimer.current = window.setTimeout(() => {
          if (res.outcome === 'win') {
            // Record best steps + unlock next.
            setProgress(prev => {
              const steps = res.frames.length
              const best = prev.bestSteps[level.id]
              const next: Progress = {
                unlocked: Math.max(prev.unlocked, Math.min(level.id + 1, LEVELS.length)),
                bestSteps: { ...prev.bestSteps, [level.id]: best === undefined ? steps : Math.min(best, steps) },
              }
              saveProgress(next)
              return next
            })
          }
          setResult({ outcome: res.outcome, reason: res.outcome === 'lose' ? res.reason : undefined, frames: res.frames })
          setPlayingFrames(null)
        }, 400)
      }
    }
    playTimer.current = window.setTimeout(step, 280)
  }

  // Currently displayed positions: during playback use frames; otherwise use the initial state.
  const displayedThief: Coord = playingFrames && frameIdx > 0 ? playingFrames[Math.min(frameIdx, playingFrames.length) - 1].thief : level.thiefStart
  const displayedPolice: Coord[] = playingFrames && frameIdx > 0 ? playingFrames[Math.min(frameIdx, playingFrames.length) - 1].police : level.police.map(p => p.start)

  const pathSet = new Set(path.map(p => `${p.r},${p.c}`))

  const cellBg = (r: number, c: number, cell: Level['grid'][number][number]) => {
    const onPath = pathSet.has(`${r},${c}`)
    if (cell.kind === 'wall') return isDark ? 'bg-slate-900 border-slate-800' : 'bg-gray-800 border-gray-700'
    if (cell.kind === 'exit') {
      const open = !level.exitToggle ? true : level.exitToggle.openSteps.includes(((playingFrames && frameIdx) || 0) % level.exitToggle.period)
      return open
        ? 'bg-green-500 border-green-700'
        : 'bg-red-500 border-red-700'
    }
    if (cell.kind === 'key') return isDark ? 'bg-amber-700 border-amber-600' : 'bg-amber-300 border-amber-500'
    if (cell.kind === 'ice') return isDark ? 'bg-cyan-900 border-cyan-800' : 'bg-cyan-200 border-cyan-400'
    if (onPath) return isDark ? 'bg-indigo-700 border-indigo-600' : 'bg-indigo-300 border-indigo-500'
    return isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-white border-gray-300 hover:bg-gray-100'
  }

  // ---- Level select view ----
  if (view === 'select') {
    return (
      <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
        <header className={`p-4 border-b ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
          <h1 className="text-xl font-bold text-center">🚔 Police Escape</h1>
          <p className={`text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            {zh ? '划线规划逃跑路线，躲开警察追捕' : 'Draw a path to escape — avoid the police'}
          </p>
        </header>
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-2xl mx-auto grid grid-cols-5 gap-3">
            {LEVELS.map((lvl, i) => {
              const locked = lvl.id > progress.unlocked
              const best = progress.bestSteps[lvl.id]
              return (
                <button
                  key={lvl.id}
                  disabled={locked}
                  onClick={() => startLevel(i)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center font-bold border-2 transition-colors ${
                    locked
                      ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                      : isDark
                        ? 'bg-slate-700 border-slate-600 hover:bg-indigo-700 text-white'
                        : 'bg-white border-gray-300 hover:bg-indigo-100 text-gray-900'
                  }`}
                >
                  <span className="text-lg">{locked ? '🔒' : lvl.id}</span>
                  {!locked && best !== undefined && (
                    <span className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{best}{zh ? '步' : ''}</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ---- Play view ----
  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <header className={`p-3 border-b flex items-center gap-3 ${isDark ? 'border-slate-700' : 'border-gray-300'}`}>
        <button onClick={() => setView('select')} className={`px-3 py-1 rounded ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          ← {zh ? '关卡' : 'Levels'}
        </button>
        <div className="flex-1 text-center">
          <div className="font-bold">{zh ? level.nameZh : level.name}</div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            {zh ? `第 ${level.id} / ${LEVELS.length} 关` : `Level ${level.id} of ${LEVELS.length}`}
          </div>
        </div>
      </header>

      {result && result.outcome === 'invalid' && (
        <div className="mx-4 mt-3 px-4 py-2 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm">
          ⚠️ {result.reason}
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div
          className="grid gap-0 touch-none select-none"
          style={{ gridTemplateColumns: `repeat(${level.size}, ${cellSize}px)` }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {level.grid.map((row, r) =>
            row.map((cell, c) => {
              const isThief = displayedThief.r === r && displayedThief.c === c
              const policeIdx = displayedPolice.findIndex(p => p.r === r && p.c === c)
              const isPolice = policeIdx >= 0
              return (
                <div
                  key={`${r}-${c}`}
                  data-cell
                  data-r={r}
                  data-c={c}
                  className={`border flex items-center justify-center ${cellBg(r, c, cell)}`}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {cell.kind === 'exit' && <span className="text-lg">🚪</span>}
                  {cell.kind === 'key' && <span className="text-lg">🔑</span>}
                  {cell.kind === 'ice' && <span className="text-xs">🧊</span>}
                  {isThief && <span className="text-lg">🥷</span>}
                  {isPolice && <span className="text-lg">👮</span>}
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className={`p-3 text-center text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
        {zh ? '从 🥷 拖到 🚪 画路径' : 'Drag from 🥷 to 🚪 to draw a path'}
        {level.requiredKeys.length > 0 && (zh ? ` · 需收集 ${level.requiredKeys.length} 把 🔑` : ` · collect ${level.requiredKeys.length} 🔑`)}
      </div>

      <div className="flex justify-center gap-3 p-3">
        <button onClick={resetLevel} className={`px-5 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
          {zh ? '重置' : 'Reset'}
        </button>
        <button
          onClick={onGo}
          disabled={path.length < 2 || !!playingFrames}
          className="px-6 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-500 disabled:bg-gray-400 text-white"
        >
          {zh ? '出发!' : 'Go!'}
        </button>
      </div>

      {result && (result.outcome === 'win' || result.outcome === 'lose') && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className={`p-6 rounded-2xl max-w-sm w-full ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold text-center ${result.outcome === 'win' ? 'text-green-500' : 'text-red-500'}`}>
              {result.outcome === 'win'
                ? (zh ? '🎉 逃脱成功!' : '🎉 Escaped!')
                : (zh ? '💥 被抓住了!' : '💥 Caught!')}
            </h2>
            {result.outcome === 'lose' && result.reason && (
              <p className={`mt-2 text-center text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{result.reason}</p>
            )}
            <div className="mt-4 flex gap-2">
              <button onClick={resetLevel} className={`flex-1 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                {zh ? '重试' : 'Retry'}
              </button>
              {result.outcome === 'win' && level.id < LEVELS.length && (
                <button onClick={() => startLevel(levelIdx + 1)} className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
                  {zh ? '下一关' : 'Next'}
                </button>
              )}
              {result.outcome === 'win' && (
                <button onClick={() => setView('select')} className={`flex-1 py-2 rounded-lg font-medium ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                  {zh ? '关卡' : 'Levels'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
