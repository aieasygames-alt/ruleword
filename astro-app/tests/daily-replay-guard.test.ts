import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const componentsRoot = path.resolve(__dirname, '../src/components/games')
const completedDailyGames = [
  'FifteenPuzzle.tsx',
  'LightsOut.tsx',
]

const repeatableDailyScoreChases = ['WhackAMole.tsx', 'BrickBreaker.tsx', 'SimonSays.tsx']

describe('daily replay guards', () => {
  it('keeps replay controls out of completed daily result screens', () => {
    for (const fileName of completedDailyGames) {
      const source = fs.readFileSync(path.join(componentsRoot, fileName), 'utf8')
      expect(source).toContain("gameMode !== 'daily' && <button")
      expect(source).toContain("onClick={() => startGame('practice')}")
    }
  })

  it('allows daily score chases to retry the same seeded challenge', () => {
    for (const fileName of repeatableDailyScoreChases) {
      const source = fs.readFileSync(path.join(componentsRoot, fileName), 'utf8')
      const gameKey = fileName.replace('.tsx', '').toLowerCase()
      expect(source).not.toContain(`localStorage.setItem('${gameKey}-daily-date'`)
      expect(source).toContain("startGame(gameMode === 'daily' ? 'daily' : 'practice')")
    }
  })
})
