export type GameCatalogEntry = {
  id: string
  slug: string
  component: string
  hasComponent: boolean
}

const ID_OVERRIDES: Record<string, string> = {
  game2048: 'Game2048',
  '2048cupcakes': 'Two048Cupcakes',
  simongame: 'SimonSays',
  reactiontime: 'ReactionTest',
}

export function componentNameForGameId(gameId: string) {
  return ID_OVERRIDES[gameId] || gameId
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

export function buildGameCatalog(
  games: Array<Pick<GameCatalogEntry, 'id' | 'slug'>>,
  componentNames: Iterable<string>,
): GameCatalogEntry[] {
  const components = new Set(componentNames)
  return games.map(game => {
    const component = componentNameForGameId(game.id)
    return { ...game, component, hasComponent: components.has(component) }
  })
}
