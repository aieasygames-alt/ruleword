import { describe, expect, it } from 'vitest'
import { buildGameCatalog, componentNameForGameId } from '../src/utils/gameCatalog'

describe('game catalog', () => {
  it('keeps dynamic loader exceptions explicit', () => {
    expect(componentNameForGameId('game2048')).toBe('Game2048')
    expect(componentNameForGameId('2048cupcakes')).toBe('Two048Cupcakes')
    expect(componentNameForGameId('simongame')).toBe('SimonSays')
  })

  it('reports missing implementations without hiding the registry entry', () => {
    const catalog = buildGameCatalog([{ id: 'game2048', slug: '2048' }, { id: 'unknown', slug: 'unknown' }], ['Game2048'])
    expect(catalog).toEqual([
      { id: 'game2048', slug: '2048', component: 'Game2048', hasComponent: true },
      { id: 'unknown', slug: 'unknown', component: 'Unknown', hasComponent: false },
    ])
  })
})
