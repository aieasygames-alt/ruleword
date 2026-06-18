import { useCallback, useMemo, useState } from 'react'
import { createGraphGame, isSpikeActive, moveViktor, neighbors, openExits } from './police-escape/engine/graphEngine'
import { ORIGINAL_LEVELS } from './police-escape/engine/originalLevels'
import type { GraphGameState, OriginalLevel } from './police-escape/engine/graphTypes'

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
  unlocked: number
  bestSteps: Record<number, number>
}

const PROGRESS_KEY = 'policeescape_graph_progress'
const CHAPTER_SIZE = 20

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw) return JSON.parse(raw) as Progress
  } catch { /* localStorage can be unavailable in private contexts */ }
  return { unlocked: 1, bestSteps: {} }
}

function saveProgress(progress: Progress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)) } catch { /* noop */ }
}

function projectLevel(level: OriginalLevel) {
  const xs = level.nodes.map(node => node.x)
  const ys = level.nodes.map(node => node.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const width = Math.max(maxX - minX, 1)
  const height = Math.max(maxY - minY, 1)
  const padding = 68
  const available = 720 - padding * 2
  const scale = Math.min(available / width, available / height)
  const drawnWidth = width * scale
  const drawnHeight = height * scale
  const offsetX = (720 - drawnWidth) / 2
  const offsetY = (720 - drawnHeight) / 2
  return new Map(level.nodes.map(node => [
    node.id,
    {
      x: offsetX + (node.x - minX) * scale,
      y: offsetY + (maxY - node.y) * scale,
    },
  ]))
}

function featureCount(level: OriginalLevel) {
  return [
    level.keyNodeIds?.length,
    level.teleportPairs?.length,
    level.springNodeIds?.length,
    level.spikeNodeIds?.length,
    level.shieldNodeIds?.length,
    level.bridges?.length,
    level.movingNodes?.length,
  ].filter(Boolean).length
}

export default function PoliceEscape({ settings }: Props) {
  const zh = settings.language === 'zh'
  const [progress, setProgress] = useState<Progress>(() => loadProgress())
  const [view, setView] = useState<'select' | 'play'>('select')
  const [levelIdx, setLevelIdx] = useState(0)
  const [chapter, setChapter] = useState(0)
  const level = ORIGINAL_LEVELS[levelIdx]
  const [game, setGame] = useState<GraphGameState>(() => createGraphGame(ORIGINAL_LEVELS[0]))
  const positions = useMemo(() => projectLevel(level), [level])
  const legalMoves = useMemo(() => new Set(neighbors(level, game.viktorNodeId, game)), [level, game])
  const openExitSet = useMemo(() => new Set(openExits(level, game.turn)), [level, game.turn])

  const startLevel = useCallback((index: number) => {
    const nextLevel = ORIGINAL_LEVELS[index]
    setLevelIdx(index)
    setGame(createGraphGame(nextLevel))
    setView('play')
  }, [])

  const resetLevel = useCallback(() => setGame(createGraphGame(level)), [level])

  const chooseNode = (nodeId: number) => {
    const result = moveViktor(level, game, nodeId)
    if (!result.valid) {
      setGame(result.state)
      return
    }
    setGame(result.state)
    if (result.state.outcome === 'won') {
      setProgress(previous => {
        const levelNumber = levelIdx + 1
        const best = previous.bestSteps[levelNumber]
        const next = {
          unlocked: Math.max(previous.unlocked, Math.min(ORIGINAL_LEVELS.length, levelNumber + 1)),
          bestSteps: {
            ...previous.bestSteps,
            [levelNumber]: best === undefined ? result.state.turn : Math.min(best, result.state.turn),
          },
        }
        saveProgress(next)
        return next
      })
    }
  }

  const chapterLevels = ORIGINAL_LEVELS.slice(chapter * CHAPTER_SIZE, (chapter + 1) * CHAPTER_SIZE)
  const chapterCount = Math.ceil(ORIGINAL_LEVELS.length / CHAPTER_SIZE)

  if (view === 'select') {
    return (
      <main className={`pe-shell ${settings.darkMode ? 'pe-dark' : ''}`}>
        <style>{styles}</style>
        <section className="pe-select">
          <div className="pe-kicker">GOOD JOB FILES / CASE 01</div>
          <h1>POLICE<br />ESCAPE</h1>
          <p>{zh ? '基于逆向配置重建的 183 个节点式追逐关卡。每一步，都让警察更近一步。' : '183 reconstructed node-chase levels. Every move brings the police one step closer.'}</p>

          <div className="pe-chapter-bar">
            <button disabled={chapter === 0} onClick={() => setChapter(value => value - 1)}>←</button>
            <div>
              <span>{zh ? '案卷' : 'CASE FILE'}</span>
              <strong>{String(chapter + 1).padStart(2, '0')} / {String(chapterCount).padStart(2, '0')}</strong>
            </div>
            <button disabled={chapter === chapterCount - 1} onClick={() => setChapter(value => value + 1)}>→</button>
          </div>

          <div className="pe-level-grid">
            {chapterLevels.map((item, localIndex) => {
              const index = chapter * CHAPTER_SIZE + localIndex
              const levelNumber = index + 1
              const locked = levelNumber > progress.unlocked
              const best = progress.bestSteps[levelNumber]
              return (
                <button
                  className={`pe-level-card ${locked ? 'locked' : ''}`}
                  disabled={locked}
                  key={item.sourceLevel}
                  onClick={() => startLevel(index)}
                >
                  <small>{locked ? 'LOCKED' : `#${String(levelNumber).padStart(3, '0')}`}</small>
                  <strong>{locked ? '⌁' : item.nodes.length}</strong>
                  <span>{locked ? (zh ? '未解锁' : 'SEALED') : `${item.connections.length} ${zh ? '条道路' : 'ROADS'}`}</span>
                  {!locked && <i>{best ? `${best} ${zh ? '步' : 'MOVES'}` : `${featureCount(item)} ${zh ? '种机关' : 'DEVICES'}`}</i>}
                </button>
              )
            })}
          </div>
        </section>
      </main>
    )
  }

  const remainingKeys = (level.keyNodeIds ?? []).filter(id => !game.keysCollected.includes(id))

  return (
    <main className={`pe-shell ${settings.darkMode ? 'pe-dark' : ''}`}>
      <style>{styles}</style>
      <section className="pe-game">
        <header className="pe-game-header">
          <button className="pe-icon-button" onClick={() => setView('select')} aria-label={zh ? '返回关卡' : 'Back to levels'}>←</button>
          <div>
            <span>{zh ? '当前案卷' : 'ACTIVE CASE'}</span>
            <strong>#{String(levelIdx + 1).padStart(3, '0')}</strong>
          </div>
          <div className="pe-turn">
            <span>{zh ? '行动' : 'MOVES'}</span>
            <strong>{String(game.turn).padStart(2, '0')}</strong>
          </div>
          <button className="pe-icon-button" onClick={resetLevel} aria-label={zh ? '重置' : 'Reset'}>↻</button>
        </header>

        <div className="pe-status-strip">
          <span>🔑 {game.keysCollected.length}/{level.keyNodeIds?.length ?? 0}</span>
          <span>🛡 {game.shields}</span>
          <span>👮 {game.police.filter(item => !item.sleeping).length}/{game.police.length}</span>
          <span>{zh ? '出口' : 'EXIT'} {remainingKeys.length ? '🔒' : '✓'}</span>
        </div>

        <div className="pe-board-wrap">
          <div className="pe-grid-lines" />
          <svg className="pe-board" viewBox="0 0 720 720" role="img" aria-label={zh ? `Police Escape 第 ${levelIdx + 1} 关` : `Police Escape level ${levelIdx + 1}`}>
            <defs>
              <filter id="soft-glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {level.connections.map((edge, index) => {
              const from = positions.get(edge.fromNodeId)!
              const to = positions.get(edge.toNodeId)!
              const reachable = edge.fromNodeId === game.viktorNodeId || edge.toNodeId === game.viktorNodeId
              return <line key={index} className={`pe-road ${reachable ? 'reachable' : ''}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
            })}

            {(level.bridges ?? []).map((bridge, index) => {
              const from = positions.get(bridge.triggerNodeId)
              const to = positions.get(bridge.otherNodeId)
              if (!from || !to) return null
              const active = game.activatedBridges.includes(index)
              return <line key={`bridge-${index}`} className={`pe-bridge ${active ? 'active' : ''}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
            })}

            {level.nodes.map(node => {
              const point = positions.get(node.id)!
              const isViktor = node.id === game.viktorNodeId
              const police = game.police.filter(item => item.nodeId === node.id)
              const isExit = [level.exitNodeId, level.exitANodeId, level.exitBNodeId].includes(node.id)
              const isOpenExit = openExitSet.has(node.id) && remainingKeys.length === 0
              const isKey = (level.keyNodeIds ?? []).includes(node.id) && !game.keysCollected.includes(node.id)
              const isPortal = (level.teleportPairs ?? []).some(pair => pair.nodeA === node.id || pair.nodeB === node.id)
              const isSpring = (level.springNodeIds ?? []).includes(node.id)
              const isShield = (level.shieldNodeIds ?? []).includes(node.id) && !game.visitedNodeIds.includes(node.id)
              const isIce = (level.iceNodes ?? []).some(item => typeof item === 'number' ? item === node.id : item.nodeId === node.id)
              const spike = isSpikeActive(level, node.id, game.turn)
              const isLegal = legalMoves.has(node.id) && game.outcome === 'playing'
              const classes = [
                'pe-node',
                isLegal ? 'legal' : '',
                isExit ? 'exit' : '',
                isOpenExit ? 'open' : '',
                isPortal ? 'portal' : '',
                spike ? 'spike-on' : '',
              ].filter(Boolean).join(' ')
              return (
                <g
                  className={classes}
                  key={node.id}
                  onClick={() => isLegal && chooseNode(node.id)}
                  role={isLegal ? 'button' : undefined}
                  aria-label={isLegal ? `${zh ? '移动到节点' : 'Move to node'} ${node.id}` : undefined}
                >
                  {isLegal && <circle className="pe-node-pulse" cx={point.x} cy={point.y} r="31" />}
                  <circle className="pe-node-ring" cx={point.x} cy={point.y} r="23" />
                  <circle className="pe-node-core" cx={point.x} cy={point.y} r="16" />
                  {isExit && <text x={point.x} y={point.y + 7}>{isOpenExit ? '🚪' : '🔒'}</text>}
                  {isKey && <text x={point.x} y={point.y + 7}>🔑</text>}
                  {isPortal && <text x={point.x} y={point.y + 7}>◎</text>}
                  {isSpring && <text x={point.x} y={point.y + 7}>↟</text>}
                  {isShield && <text x={point.x} y={point.y + 7}>◆</text>}
                  {isIce && <text x={point.x} y={point.y + 7}>❄</text>}
                  {(level.spikeNodeIds ?? []).includes(node.id) && <text x={point.x} y={point.y + 7}>{spike ? '▲' : '△'}</text>}
                  {isViktor && <text className="pe-actor" x={point.x} y={point.y + 9}>🏃</text>}
                  {police.map((officer, index) => (
                    <text className={`pe-actor police ${officer.sleeping ? 'sleeping' : ''}`} key={index} x={point.x + index * 13 - 4} y={point.y + 9}>
                      {officer.sleeping ? '💤' : '👮'}
                    </text>
                  ))}
                </g>
              )
            })}
          </svg>
        </div>

        <div className="pe-instruction">
          <div className="pe-siren" />
          <div>
            <strong>{game.outcome === 'playing' ? (zh ? '选择发光节点' : 'CHOOSE A LIT NODE') : game.outcome === 'won' ? (zh ? '逃脱成功' : 'ESCAPE CONFIRMED') : (zh ? '行动失败' : 'SUBJECT CAUGHT')}</strong>
            <span>{game.message || (zh ? '你走一步，警察沿最短路径追一步。' : 'You move once. Police follow the shortest route once.')}</span>
          </div>
        </div>

        <div className="pe-legend">
          <span>◎ {zh ? '传送' : 'PORTAL'}</span>
          <span>↟ {zh ? '弹簧' : 'SPRING'}</span>
          <span>▲ {zh ? '尖刺' : 'SPIKE'}</span>
          <span>◆ {zh ? '护盾' : 'SHIELD'}</span>
        </div>

        {game.outcome !== 'playing' && (
          <div className="pe-modal-backdrop">
            <div className={`pe-modal ${game.outcome}`}>
              <small>{game.outcome === 'won' ? 'CASE CLOSED' : 'PURSUIT ENDED'}</small>
              <h2>{game.outcome === 'won' ? (zh ? '逃脱成功' : 'YOU GOT OUT') : (zh ? '你被抓住了' : 'YOU WERE CAUGHT')}</h2>
              <p>{zh ? `本次行动 ${game.turn} 步。` : `${game.turn} moves recorded.`}</p>
              <div>
                <button onClick={resetLevel}>{zh ? '再试一次' : 'RETRY'}</button>
                {game.outcome === 'won' && levelIdx < ORIGINAL_LEVELS.length - 1 && (
                  <button className="primary" onClick={() => startLevel(levelIdx + 1)}>{zh ? '下一关' : 'NEXT CASE'}</button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

const styles = `
  .pe-shell {
    --ink: #12202a;
    --paper: #e8e2d2;
    --paper-2: #d8d0bc;
    --red: #e43f3f;
    --blue: #2c74b9;
    --lime: #d8ff43;
    --muted: #66727a;
    min-height: 100vh;
    color: var(--ink);
    background:
      radial-gradient(circle at 18% 6%, rgba(255,255,255,.72), transparent 28rem),
      repeating-linear-gradient(0deg, transparent 0 3px, rgba(18,32,42,.025) 3px 4px),
      var(--paper);
    font-family: "Arial Narrow", "Roboto Condensed", sans-serif;
  }
  .pe-dark {
    --ink: #edf4ed;
    --paper: #111b20;
    --paper-2: #1b292f;
    --muted: #9aabb0;
    background:
      radial-gradient(circle at 18% 6%, rgba(44,116,185,.2), transparent 28rem),
      repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.018) 3px 4px),
      var(--paper);
  }
  .pe-select, .pe-game { width: min(100%, 900px); min-height: 100vh; margin: 0 auto; padding: 28px 18px 44px; }
  .pe-select h1 { font-family: Impact, Haettenschweiler, sans-serif; font-size: clamp(4.4rem, 16vw, 8.8rem); line-height: .73; letter-spacing: -.04em; margin: 24px 0; transform: skewY(-2deg); }
  .pe-select h1::first-line { color: var(--blue); text-shadow: 4px 4px 0 var(--red); }
  .pe-kicker { display: inline-block; color: var(--paper); background: var(--ink); padding: 7px 11px; font-weight: 900; letter-spacing: .16em; font-size: .7rem; }
  .pe-select > p { max-width: 560px; font-family: Georgia, serif; font-size: 1rem; line-height: 1.65; color: var(--muted); }
  .pe-chapter-bar { display: flex; align-items: stretch; gap: 8px; margin: 30px 0 16px; border-top: 3px solid var(--ink); padding-top: 12px; }
  .pe-chapter-bar button, .pe-icon-button { border: 2px solid var(--ink); color: var(--ink); background: transparent; font-weight: 900; cursor: pointer; min-width: 48px; }
  .pe-chapter-bar button:disabled { opacity: .25; cursor: default; }
  .pe-chapter-bar > div { flex: 1; display: flex; justify-content: space-between; align-items: baseline; background: var(--ink); color: var(--paper); padding: 10px 14px; }
  .pe-chapter-bar span, .pe-game-header span, .pe-turn span { font-size: .64rem; letter-spacing: .15em; font-weight: 800; }
  .pe-level-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
  .pe-level-card { min-height: 112px; padding: 10px; text-align: left; border: 2px solid var(--ink); background: transparent; color: var(--ink); display: flex; flex-direction: column; cursor: pointer; transition: transform .15s ease, background .15s ease, color .15s ease; }
  .pe-level-card:hover:not(:disabled) { transform: translateY(-4px) rotate(-1deg); background: var(--lime); color: #12202a; box-shadow: 4px 4px 0 var(--ink); }
  .pe-level-card small { font-weight: 900; letter-spacing: .12em; }
  .pe-level-card strong { font-family: Impact, sans-serif; font-size: 2rem; line-height: 1; margin-top: auto; }
  .pe-level-card span { font-size: .64rem; font-weight: 800; }
  .pe-level-card i { margin-top: 4px; color: var(--muted); font-size: .58rem; font-style: normal; }
  .pe-level-card.locked { opacity: .24; cursor: not-allowed; }
  .pe-game { display: flex; flex-direction: column; }
  .pe-game-header { display: grid; grid-template-columns: 50px 1fr auto 50px; gap: 12px; align-items: stretch; border-bottom: 3px solid var(--ink); padding-bottom: 12px; }
  .pe-game-header > div { display: flex; flex-direction: column; }
  .pe-game-header strong { font-family: Impact, sans-serif; font-size: 1.8rem; line-height: 1; }
  .pe-turn { text-align: right; }
  .pe-status-strip { display: flex; flex-wrap: wrap; gap: 0; border-bottom: 1px solid var(--ink); }
  .pe-status-strip span { padding: 8px 13px; border-right: 1px solid var(--ink); font-size: .72rem; font-weight: 900; letter-spacing: .06em; }
  .pe-board-wrap { position: relative; width: min(100%, 680px); margin: 16px auto; aspect-ratio: 1; overflow: hidden; background: #17242b; border: 5px solid var(--ink); box-shadow: 9px 9px 0 rgba(18,32,42,.18); }
  .pe-grid-lines { position: absolute; inset: 0; opacity: .18; background-image: linear-gradient(#b6d3d6 1px, transparent 1px), linear-gradient(90deg, #b6d3d6 1px, transparent 1px); background-size: 36px 36px; }
  .pe-board { position: relative; width: 100%; height: 100%; touch-action: manipulation; }
  .pe-road { stroke: #718991; stroke-width: 8; stroke-linecap: round; opacity: .72; }
  .pe-road.reachable { stroke: var(--lime); opacity: .95; filter: url(#soft-glow); }
  .pe-bridge { stroke: #ffbd3e; stroke-width: 8; stroke-dasharray: 9 10; opacity: .25; }
  .pe-bridge.active { opacity: 1; }
  .pe-node { cursor: default; }
  .pe-node.legal { cursor: pointer; }
  .pe-node-ring { fill: #263b45; stroke: #b9c8c8; stroke-width: 4; }
  .pe-node-core { fill: #d7e0da; }
  .pe-node.legal .pe-node-ring { stroke: var(--lime); stroke-width: 6; }
  .pe-node.exit .pe-node-ring { stroke: #ffbd3e; }
  .pe-node.exit.open .pe-node-ring { stroke: #65db7c; filter: url(#soft-glow); }
  .pe-node.portal .pe-node-core { fill: #78d6ff; }
  .pe-node.spike-on .pe-node-core { fill: #ff6262; }
  .pe-node-pulse { fill: none; stroke: var(--lime); stroke-width: 3; opacity: .55; animation: pePulse 1.25s ease-out infinite; }
  .pe-node text { text-anchor: middle; font-size: 22px; font-weight: 900; pointer-events: none; }
  .pe-node .pe-actor { font-size: 32px; filter: drop-shadow(2px 3px 0 rgba(0,0,0,.5)); }
  .pe-node .police { font-size: 31px; }
  .pe-node .sleeping { font-size: 24px; }
  .pe-instruction { display: flex; gap: 12px; align-items: center; border: 2px solid var(--ink); padding: 11px; }
  .pe-instruction > div:last-child { display: flex; flex-direction: column; }
  .pe-instruction strong { font-size: .78rem; letter-spacing: .1em; }
  .pe-instruction span { color: var(--muted); font-family: Georgia, serif; font-size: .78rem; }
  .pe-siren { width: 34px; height: 22px; border-radius: 20px 20px 3px 3px; background: linear-gradient(90deg, var(--red) 50%, var(--blue) 50%); box-shadow: 0 0 14px var(--red); animation: peSiren .55s steps(2) infinite; }
  .pe-legend { display: flex; justify-content: center; flex-wrap: wrap; gap: 13px; padding-top: 12px; color: var(--muted); font-size: .6rem; font-weight: 900; letter-spacing: .08em; }
  .pe-modal-backdrop { position: fixed; inset: 0; z-index: 30; display: grid; place-items: center; padding: 20px; background: rgba(4,9,12,.74); backdrop-filter: blur(5px); }
  .pe-modal { width: min(100%, 410px); background: var(--paper); color: var(--ink); border: 5px solid var(--ink); padding: 28px; box-shadow: 12px 12px 0 var(--red); transform: rotate(-1deg); }
  .pe-modal.won { box-shadow: 12px 12px 0 var(--lime); }
  .pe-modal small { font-weight: 900; letter-spacing: .18em; }
  .pe-modal h2 { font-family: Impact, sans-serif; font-size: 2.7rem; line-height: .95; margin: 8px 0; }
  .pe-modal p { font-family: Georgia, serif; color: var(--muted); }
  .pe-modal > div { display: flex; gap: 8px; margin-top: 20px; }
  .pe-modal button { flex: 1; border: 2px solid var(--ink); padding: 11px; background: transparent; color: var(--ink); font-weight: 900; cursor: pointer; }
  .pe-modal button.primary { background: var(--ink); color: var(--paper); }
  @keyframes pePulse { from { r: 25; opacity: .8; } to { r: 37; opacity: 0; } }
  @keyframes peSiren { 50% { box-shadow: 0 0 14px var(--blue); filter: saturate(1.5); } }
  @media (max-width: 620px) {
    .pe-select, .pe-game { padding: 18px 10px 28px; }
    .pe-level-grid { grid-template-columns: repeat(4, 1fr); }
    .pe-level-card { min-height: 94px; }
    .pe-level-card strong { font-size: 1.55rem; }
    .pe-board-wrap { margin: 10px auto; border-width: 3px; box-shadow: 5px 5px 0 rgba(18,32,42,.18); }
  }
  @media (max-width: 390px) {
    .pe-level-grid { grid-template-columns: repeat(3, 1fr); }
    .pe-status-strip span { padding: 7px 9px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .pe-node-pulse, .pe-siren { animation: none; }
  }
`
