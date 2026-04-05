// ===== CANVAS RENDERING HOOK =====
// 绘制黑色线条箭头样式（参考微信小游戏"箭了又箭")

import { useEffect, useRef, useCallback } from 'react'
import type { Arrow, NumberBlock, LevelData, Direction } from '../types'
import { DIR_DELTA, THEME_COLORS } from '../constants'

import { lightenColor } from '../utils'

interface UseCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  arrows: Arrow[]
  numberBlocks: NumberBlock[]
  levelData: LevelData | null
  darkMode: boolean
  hintArrow: number | null
  isPaused: boolean
  cellSize: number
}

export function useCanvas({
  canvasRef,
  arrows,
  numberBlocks,
  levelData,
  darkMode,
  hintArrow,
  isPaused,
  cellSize
}: UseCanvasProps) {
  const animationRef = useRef<number>(0)
  const size = cellSize || 400

  useEffect(() => {
    if (!levelData || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const canvasSize = size * levelData.gridSize
    canvas.width = canvasSize * dpr
    canvas.height = canvasSize * dpr
    canvas.style.width = `${canvasSize}px`
    canvas.style.height = `${canvasSize}px`
    ctx.scale(dpr, dpr)

    const gs = levelData.gridSize
    const cellSize = canvasSize / gs
    const dark = darkMode

    // Clear with theme background
    ctx.fillStyle = dark ? '#0f172a' : THEME_COLORS.background
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Draw grid lines
    ctx.strokeStyle = dark ? 'rgba(148,163,184,0.15)' : THEME_COLORS.gridLine
    ctx.lineWidth = 1
    for (let i = 0; i <= gs; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, canvasSize)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(canvasSize, i * cellSize)
      ctx.stroke()
    }

    // Draw walls
    ;(levelData.walls || []).forEach(w => {
      ctx.fillStyle = dark ? '#334155' : '#94a3b8'
      ctx.fillRect(w.col * cellSize + 2, w.row * cellSize + 2, cellSize - 4, cellSize - 4)
      ctx.strokeStyle = dark ? '#475569' : '#64748b'
      ctx.lineWidth = 1
      ctx.strokeRect(w.col * cellSize + 2, w.row * cellSize + 2, cellSize - 4, cellSize - 4)
    })

    // Draw number blocks
    numberBlocks.forEach(b => {
      const x = b.col * cellSize + cellSize / 2
      const y = b.row * cellSize + cellSize / 2

      ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0'
      ctx.beginPath()
      ctx.roundRect(b.col * cellSize + 4, b.row * cellSize + 4, cellSize - 8, cellSize - 8, 6)
      ctx.fill()
      ctx.strokeStyle = dark ? '#475569' : '#94a3b8'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = dark ? '#e2e8f0' : '#334155'
      ctx.font = `bold ${cellSize * 0.35}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${b.maxHits - b.hits}`, x, y)
    })

    // Draw arrows with BLACK LINE STYLE
    arrows.forEach(arrow => {
      if (arrow.isExiting && arrow.exitProgress >= 1) return

      let x = arrow.col * cellSize + cellSize / 2
      let y = arrow.row * cellSize + cellSize / 2
      let scale = 1
      let alpha = 1

      if (arrow.isExiting) {
        const dir = arrow.directions[0]
        const [dr, dc] = DIR_DELTA[dir]
        x += dc * cellSize * arrow.exitProgress * 2
        y += dr * cellSize * arrow.exitProgress * 2
        scale = 1 - arrow.exitProgress * 0.5
        alpha = 1 - arrow.exitProgress
      }

      if (arrow.isBlocked) {
        x += (Math.random() - 0.5) * 4
        y += (Math.random() - 0.5) * 4
      }

      const isHinted = hintArrow === arrow.id
      const r = cellSize * 0.35

      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x, y)
      ctx.scale(scale, scale)

      // Hint glow effect
      if (isHinted) {
        ctx.shadowColor = '#fbbf24'
        ctx.shadowBlur = 15
      }

      // Draw BLACK ARROW (like reference image)
      drawArrow(ctx, 0, 0, r, arrow.directions, dark, isHinted)

      // Hint ring
      if (isHinted) {
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, r + 4, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()
    })

    // Pause overlay
    if (isPaused) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)'
      ctx.fillRect(0, 0, canvasSize, canvasSize)
      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(isPaused ? 'PAUSED' : '', canvasSize / 2, canvasSize / 2)
    }

  }, [arrows, numberBlocks, levelData, darkMode, hintArrow, isPaused, cellSize])
  return { animationRef }
}

/**
 * Draw a black line arrow (matching reference image style)
 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  directions: Direction[],
  dark: boolean,
  isHinted: boolean
) {
  const arrowColor = dark ? THEME_COLORS.darkArrow : THEME_COLORS.arrow
  const strokeColor = dark ? THEME_COLORS.darkArrowStroke : THEME_COLORS.arrowStroke

  ctx.strokeStyle = strokeColor
  ctx.fillStyle = arrowColor
  ctx.lineWidth = Math.max(2, size * 0.1)

  if (directions.length === 1) {
    // Single direction arrow
    const dir = directions[0]
    drawSingleArrow(ctx, x, y, size, dir)
  } else {
    // Multi-direction: draw smaller arrows in corners
    const offset = size * 0.25
    const positions: Record<Direction, [number, number]> = {
      up: [0, -offset],
      down: [0, offset],
      left: [-offset, 0],
      right: [offset, 0],
    }
    directions.forEach(dir => {
      const [dx, dy] = positions[dir]
      drawSingleArrow(ctx, x + dx, y + dy, size * 0.5, dir)
    })
  }
}

/**
 * Draw a single direction arrow with tail
 */
function drawSingleArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  dir: Direction
) {
  // Arrow with tail design - longer and more detailed
  const totalLen = size * 0.9
  const headLen = size * 0.28
  const headWidth = size * 0.22
  const bodyWidth = size * 0.1
  const tailWidth = size * 0.15
  const tailLen = size * 0.25

  ctx.save()
  ctx.translate(cx, cy)

  // Rotate based on direction
  const rotations: Record<Direction, number> = {
    up: -Math.PI / 2,
    down: Math.PI / 2,
    left: Math.PI,
    right: 0,
  }
  ctx.rotate(rotations[dir])

  // Draw complete arrow shape with tail
  ctx.beginPath()
  // Arrow tip (right side for right-pointing default)
  ctx.moveTo(totalLen / 2, 0)
  // Arrow head - top side
  ctx.lineTo(totalLen / 2 - headLen, -headWidth)
  // Arrow head to body transition
  ctx.lineTo(totalLen / 2 - headLen, -bodyWidth)
  // Body - top side
  ctx.lineTo(-totalLen / 2 + tailLen + size * 0.05, -bodyWidth)
  // Tail flare - top side
  ctx.lineTo(-totalLen / 2 + tailLen, -tailWidth)
  // Tail end - top
  ctx.lineTo(-totalLen / 2 + size * 0.02, -tailWidth * 0.6)
  // Tail end center notch
  ctx.lineTo(-totalLen / 2 + tailLen * 0.4, 0)
  // Tail end - bottom
  ctx.lineTo(-totalLen / 2 + size * 0.02, tailWidth * 0.6)
  // Tail flare - bottom side
  ctx.lineTo(-totalLen / 2 + tailLen, tailWidth)
  // Body - bottom side
  ctx.lineTo(-totalLen / 2 + tailLen + size * 0.05, bodyWidth)
  // Arrow head to body transition
  ctx.lineTo(totalLen / 2 - headLen, bodyWidth)
  // Arrow head - bottom side
  ctx.lineTo(totalLen / 2 - headLen, headWidth)
  // Back to tip
  ctx.closePath()

  ctx.fill()
  ctx.stroke()

  ctx.restore()
}
