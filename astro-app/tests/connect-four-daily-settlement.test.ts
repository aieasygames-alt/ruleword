import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const componentPath = path.resolve(__dirname, '../src/components/games/ConnectFour.tsx')

describe('Connect Four daily settlement', () => {
  it('records and finishes daily games regardless of which color wins', () => {
    const source = fs.readFileSync(componentPath, 'utf8')
    const winnerBlock = source.slice(source.indexOf('if (result) {'), source.indexOf('if (isBoardFull(newBoard))'))

    expect(winnerBlock).toContain("if (currentGameMode === 'daily')")
    expect(winnerBlock).toContain("localStorage.setItem('connectfour-daily-date'")
    expect(winnerBlock).toContain('onGameFinish?.({')
    expect(winnerBlock).not.toContain("if (currentTurn === 'red') {")
  })

  it('accepts the legacy daily completion key during the storage migration', () => {
    const source = fs.readFileSync(componentPath, 'utf8')
    expect(source).toContain('lastPlayed === getLegacyDailyKey()')
  })

  it('updates turn refs synchronously and disables player input for AI turns', () => {
    const source = fs.readFileSync(componentPath, 'utf8')
    expect(source).toContain('boardRef.current = newBoard')
    expect(source).toContain('currentPlayerRef.current = nextPlayer')
    expect(source).toContain("usesComputerOpponent(gameMode) && currentPlayer === 'yellow'")
  })

  it('invalidates queued AI moves when a game is reset or exited', () => {
    const source = fs.readFileSync(componentPath, 'utf8')
    expect(source).toContain('const gameGenerationRef = useRef(0)')
    expect(source).toContain('if (generation !== gameGenerationRef.current')
    expect(source.match(/gameGenerationRef\.current\+\+/g)).toHaveLength(3)
  })
})
