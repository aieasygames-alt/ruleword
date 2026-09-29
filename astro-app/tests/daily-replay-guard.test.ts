import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const componentsRoot = path.resolve(__dirname, '../src/components/games')
const dailyGamesWithResultScreens = [
  'FifteenPuzzle.tsx',
  'LightsOut.tsx',
  'WhackAMole.tsx',
  'SimonSays.tsx',
  'BrickBreaker.tsx',
]

describe('daily replay guards', () => {
  it('keeps replay controls out of completed daily result screens', () => {
    for (const fileName of dailyGamesWithResultScreens) {
      const source = fs.readFileSync(path.join(componentsRoot, fileName), 'utf8')
      expect(source).toContain("gameMode !== 'daily' && <button")
      expect(source).toContain("onClick={() => startGame('practice')}")
    }
  })
})
