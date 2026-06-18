import { cp, mkdir, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const output = join(root, 'dist')
const excluded = new Set([
  '.git',
  'build-static.mjs',
  'dist',
  'node_modules',
  'package-lock.json',
  'package.json',
])

await rm(output, { recursive: true, force: true })
await mkdir(output)

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue

  await cp(join(root, entry.name), join(output, entry.name), {
    recursive: true,
  })
}

console.log('Copied prebuilt static site to dist/')
