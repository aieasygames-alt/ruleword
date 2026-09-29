import { readdir } from 'node:fs/promises'
import { basename, join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const contentDirectory = join(root, 'src/content/games')
const componentDirectory = join(root, 'src/components/games')

const overrides: Record<string, string> = {
  '2048cupcakes': 'two048cupcakes',
  simongame: 'simonsays',
  reactiontime: 'reactiontest',
}

function componentName(gameId: string) {
  return overrides[gameId] || gameId
}

const [contentFiles, componentFiles] = await Promise.all([
  readdir(contentDirectory),
  readdir(componentDirectory),
])
const components = new Set(componentFiles.filter(file => file.endsWith('.tsx')).map(file => basename(file, '.tsx').toLowerCase()))
const entries = await Promise.all(contentFiles.filter(file => file.endsWith('.json')).map(async file => {
  const content = await import(join(contentDirectory, file), { with: { type: 'json' } })
  return { file, id: content.default.id as string, slug: content.default.slug as string }
}))

const missing = entries.filter(entry => !components.has(componentName(entry.id)))
if (missing.length) {
  console.error('Games with no dynamic component:')
  for (const entry of missing) console.error(`- ${entry.slug} (${entry.id}) -> ${componentName(entry.id)}.tsx`)
  process.exitCode = 1
} else {
  console.log(`Game catalog audit passed: ${entries.length} content entries map to components.`)
}
