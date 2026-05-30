// Build-time image generator for OG images and game thumbnails
// Run: tsx scripts/generate-images.ts
// Outputs: public/og/*.png, public/thumbnails/*.png

import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PUBLIC = resolve(ROOT, 'public')

// ── Tailwind color resolver ──
const COLORS: Record<string, string> = {
  'from-amber-500': '#f59e0b', 'from-amber-600': '#d97706', 'from-amber-700': '#b45309',
  'to-amber-500': '#f59e0b', 'to-amber-600': '#d97706', 'to-amber-700': '#b45309', 'to-amber-900': '#78350f',
  'from-blue-400': '#60a5fa', 'from-blue-500': '#3b82f6', 'from-blue-600': '#2563eb',
  'to-blue-600': '#2563eb', 'to-blue-700': '#1d4ed8',
  'from-cyan-400': '#22d3ee', 'from-cyan-500': '#06b6d4', 'to-cyan-600': '#0891b2',
  'from-emerald-500': '#10b981', 'from-emerald-600': '#059669',
  'to-emerald-600': '#059669', 'to-emerald-900': '#064e3b',
  'from-fuchsia-500': '#d946ef',
  'from-gray-500': '#6b7280', 'from-gray-600': '#4b5563', 'to-gray-600': '#4b5563', 'to-gray-800': '#1f2937',
  'from-green-400': '#4ade80', 'from-green-500': '#22c55e', 'from-green-600': '#16a34a', 'to-green-600': '#16a34a',
  'from-indigo-500': '#6366f1', 'to-indigo-600': '#4f46e5', 'to-indigo-700': '#4338ca',
  'from-lime-500': '#84cc16', 'to-lime-600': '#65a30d',
  'from-orange-500': '#f97316', 'to-orange-600': '#ea580c', 'to-orange-700': '#c2410c',
  'from-pink-500': '#ec4899', 'to-pink-600': '#db2777',
  'from-purple-500': '#a855f7', 'from-purple-600': '#9333ea', 'to-purple-600': '#9333ea', 'to-purple-700': '#7e22ce',
  'from-red-500': '#ef4444', 'from-red-600': '#dc2626', 'to-red-600': '#dc2626', 'to-red-700': '#b91c1c',
  'from-rose-400': '#fb7185', 'from-rose-500': '#f43f5e', 'to-rose-600': '#e11d48', 'to-rose-700': '#be123c',
  'from-sky-500': '#0ea5e9',
  'from-slate-400': '#94a3b8', 'from-slate-500': '#64748b', 'from-slate-600': '#475569', 'from-slate-700': '#334155',
  'to-slate-600': '#475569', 'to-slate-700': '#334155', 'to-slate-800': '#1e293b',
  'from-stone-500': '#78716c',
  'from-teal-500': '#14b8a6', 'to-teal-600': '#0d9488',
  'from-violet-500': '#8b5cf6', 'to-violet-600': '#7c3aed',
  'from-yellow-400': '#facc15', 'from-yellow-500': '#eab308', 'to-yellow-600': '#ca8a04',
  'from-zinc-500': '#71717a', 'to-neutral-600': '#525252',
}

function resolveGradient(colorClass: string) {
  const parts = colorClass.split(' ').filter((s: string) => s.startsWith('from-') || s.startsWith('to-'))
  const fromClass = parts.find((s: string) => s.startsWith('from-')) || 'from-slate-700'
  const toClass = parts.find((s: string) => s.startsWith('to-')) || 'to-slate-900'
  return { from: COLORS[fromClass] || '#334155', to: COLORS[toClass] || '#0f172a' }
}

// ── Font loading ──
async function loadFont(weight: number): Promise<ArrayBuffer> {
  // Satori requires TrueType/OpenType fonts, not WOFF2
  const url = `https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.20/files/inter-latin-${weight}-normal.woff`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch font weight ${weight}: ${res.status}`)
  return res.arrayBuffer()
}

// ── SVG → PNG ──
function svgToPng(svg: string, width: number, height: number): Buffer {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } })
  const pngData = resvg.render()
  return pngData.asPng()
}

// ── OG Image templates ──
function ogGameNode(opts: { name: string; icon: string; color: string; category?: string; rating?: number; playCount?: string }) {
  const { from, to } = resolveGradient(opts.color)
  const stars = opts.rating ? '★'.repeat(Math.round(opts.rating)) + '☆'.repeat(5 - Math.round(opts.rating)) : ''
  return {
    type: 'div',
    props: {
      style: {
        width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: `linear-gradient(135deg, ${from}, ${to})`,
        padding: 60, fontFamily: 'Inter', position: 'relative', overflow: 'hidden',
      },
      children: [
        // Decorative circles
        { type: 'div', props: { style: { position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' } } },
        { type: 'div', props: { style: { position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' } } },
        // Content
        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 1 },
          children: [
            { type: 'div', props: { style: { fontSize: 120, lineHeight: 1 }, children: opts.icon } },
            { type: 'div', props: { style: { fontSize: 56, fontWeight: 700, color: '#fff', textAlign: 'center' as const, lineHeight: 1.2, maxWidth: 900 }, children: opts.name } },
            opts.category ? { type: 'div', props: { style: { fontSize: 24, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' as const, letterSpacing: 2, marginTop: -8 }, children: opts.category } } : null,
            stars ? { type: 'div', props: { style: { fontSize: 28, color: '#fbbf24', marginTop: 4 }, children: `${stars}${opts.rating ? ` ${opts.rating}` : ''}` } } : null,
            opts.playCount ? { type: 'div', props: { style: { fontSize: 18, color: 'rgba(255,255,255,0.6)', marginTop: -4 }, children: `${opts.playCount} plays` } } : null,
          ].filter(Boolean)
        }},
        // Branding
        { type: 'div', props: { style: { position: 'absolute', bottom: 30, right: 50, fontSize: 18, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1 }, children: 'Free Games Hub' } },
      ],
    },
  }
}

function ogGenericNode(opts: { title: string; subtitle?: string; icon?: string }) {
  return {
    type: 'div',
    props: {
      style: {
        width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
        padding: 60, fontFamily: 'Inter', position: 'relative', overflow: 'hidden',
      },
      children: [
        { type: 'div', props: { style: { position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(34,197,94,0.1)' } } },
        { type: 'div', props: { style: { position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(59,130,246,0.08)' } } },
        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 1 },
          children: [
            opts.icon ? { type: 'div', props: { style: { fontSize: 80, lineHeight: 1 }, children: opts.icon } } : null,
            { type: 'div', props: { style: { fontSize: 48, fontWeight: 700, color: '#fff', textAlign: 'center' as const, lineHeight: 1.2, maxWidth: 900 }, children: opts.title } },
            opts.subtitle ? { type: 'div', props: { style: { fontSize: 22, color: 'rgba(255,255,255,0.6)', marginTop: 4, maxWidth: 700, textAlign: 'center' as const }, children: opts.subtitle } } : null,
          ].filter(Boolean)
        }},
        { type: 'div', props: { style: { position: 'absolute', bottom: 30, right: 50, fontSize: 18, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 1 }, children: 'Free Games Hub' } },
      ],
    },
  }
}

function thumbnailNode(opts: { name: string; icon: string; color: string; category: string; rating?: number }) {
  const { from, to } = resolveGradient(opts.color)
  return {
    type: 'div',
    props: {
      style: {
        width: 600, height: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        background: `linear-gradient(135deg, ${from}, ${to})`,
        padding: 40, fontFamily: 'Inter', position: 'relative', overflow: 'hidden',
      },
      children: [
        { type: 'div', props: { style: { position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' } } },
        { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, zIndex: 1 },
          children: [
            { type: 'div', props: { style: { fontSize: 90, lineHeight: 1 }, children: opts.icon } },
            { type: 'div', props: { style: { fontSize: 36, fontWeight: 700, color: '#fff', textAlign: 'center' as const, lineHeight: 1.2 }, children: opts.name } },
            { type: 'div', props: { style: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' as const, letterSpacing: 2 }, children: opts.category } },
            opts.rating ? { type: 'div', props: { style: { fontSize: 20, color: '#fbbf24', marginTop: 4 }, children: `★ ${opts.rating}/5` } } : null,
          ].filter(Boolean)
        }},
      ],
    },
  }
}

// ── Ratings lookup ──
function loadRatings(): Record<string, { ratingValue: number; reviewCount: number }> {
  try {
    const content = readFileSync(resolve(ROOT, 'src/data/gameRatings.ts'), 'utf-8')
    const ratings: Record<string, { ratingValue: number; reviewCount: number }> = {}
    const regex = /(\w[\w-]*):\s*\{\s*ratingValue:\s*([\d.]+),\s*reviewCount:\s*(\d+)/g
    let match
    while ((match = regex.exec(content)) !== null) {
      ratings[match[1]] = { ratingValue: parseFloat(match[2]), reviewCount: parseInt(match[3]) }
    }
    return ratings
  } catch { return {} }
}

// ── Popularity lookup ──
function loadPopularity(): Record<string, string> {
  try {
    const content = readFileSync(resolve(ROOT, 'src/data/gamePopularity.ts'), 'utf-8')
    const pops: Record<string, string> = {}
    const regex = /(\w[\w-]*):\s*\{\s*[^}]*playCount:\s*'([^']+)'/g
    let match
    while ((match = regex.exec(content)) !== null) {
      pops[match[1]] = match[2]
    }
    return pops
  } catch { return {} }
}

// ── Category names ──
function loadCategories(): Record<string, { name: string; icon: string }> {
  try {
    const content = readFileSync(resolve(ROOT, 'src/data/categories.ts'), 'utf-8')
    const cats: Record<string, { name: string; icon: string }> = {}
    const regex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',[^}]*icon:\s*'([^']+)'/g
    let match
    while ((match = regex.exec(content)) !== null) {
      cats[match[1]] = { name: match[2], icon: match[3] }
    }
    return cats
  } catch { return {} }
}

// ── Main ──
async function main() {
  console.log('🖼️  Generating images...')

  // Create output dirs
  mkdirSync(resolve(PUBLIC, 'og'), { recursive: true })
  mkdirSync(resolve(PUBLIC, 'thumbnails'), { recursive: true })

  // Load fonts
  console.log('  Loading fonts...')
  const [fontRegular, fontBold] = await Promise.all([loadFont(400), loadFont(700)])

  // Load data
  const ratings = loadRatings()
  const popularity = loadPopularity()
  const categories = loadCategories()

  // Helper to render + save
  async function renderAndSave(node: object, path: string, w: number, h: number) {
    const svg = await satori(node as any, {
      width: w, height: h,
      fonts: [{ name: 'Inter', data: fontRegular, weight: 400, style: 'normal' }, { name: 'Inter', data: fontBold, weight: 700, style: 'normal' }],
    })
    const png = svgToPng(svg, w)
    writeFileSync(path, png)
  }

  let count = 0

  // ── Generate homepage OG ──
  console.log('  Generating homepage OG...')
  await renderAndSave(
    ogGenericNode({ title: 'Free Online Games', subtitle: '100+ games — Wordle, Sudoku, 2048, Tetris, Chess & more. No download, play instantly!', icon: '🎮' }),
    resolve(PUBLIC, 'og/home.png'), 1200, 630,
  )
  count++

  // ── Generate game OG images ──
  const gamesDir = resolve(ROOT, 'src/content/games')
  const gameFiles = (await import('fs')).readdirSync(gamesDir).filter((f: string) => f.endsWith('.json'))
  console.log(`  Generating ${gameFiles.length} game OG images...`)

  const THUMBNAIL_GAMES = new Set([
    'wordle', 'sudoku', '2048', 'tetris', 'chess', 'pac-man',
    'minesweeper', 'solitaire', 'crossword', 'spelling-bee',
    'memory-grid', 'snake', 'flappy-bird', 'word-search', 'nonogram',
    'killer-sudoku', 'connections', 'typing-test', 'mahjong', 'aim-trainer',
  ])

  for (const file of gameFiles) {
    const data = JSON.parse(readFileSync(resolve(gamesDir, file), 'utf-8'))
    const slug = data.slug
    const name = data.en?.name || slug
    const icon = data.icon || '🎮'
    const color = data.color || 'from-slate-700 to-slate-900'
    const catData = categories[data.category]

    // OG image
    await renderAndSave(
      ogGameNode({
        name, icon, color,
        category: catData?.name,
        rating: ratings[slug]?.ratingValue,
        playCount: popularity[slug],
      }),
      resolve(PUBLIC, `og/game-${slug}.png`), 1200, 630,
    )
    count++

    // Thumbnail (top 20 only)
    if (THUMBNAIL_GAMES.has(slug)) {
      await renderAndSave(
        thumbnailNode({
          name, icon, color,
          category: catData?.name || 'Game',
          rating: ratings[slug]?.ratingValue,
        }),
        resolve(PUBLIC, `thumbnails/${slug}.png`), 600, 400,
      )
      count++
    }
  }

  // ── Generate story OG images ──
  const storiesDir = resolve(ROOT, 'src/content/stories')
  const storyFiles = (await import('fs')).readdirSync(storiesDir).filter((f: string) => f.endsWith('.json'))
  console.log(`  Generating ${storyFiles.length} story OG images...`)

  for (const file of storyFiles) {
    const data = JSON.parse(readFileSync(resolve(storiesDir, file), 'utf-8'))
    const slug = data.slug
    const name = data.en?.name || slug
    const icon = data.icon || '📖'
    const color = data.color || 'from-purple-600 to-purple-800'

    await renderAndSave(
      ogGameNode({ name, icon, color, category: 'AI Interactive Story' }),
      resolve(PUBLIC, `og/story-${slug}.png`), 1200, 630,
    )
    count++
  }

  // ── Generate blog OG images ──
  console.log('  Generating blog OG images...')
  const blogContent = readFileSync(resolve(ROOT, 'src/data/blogPosts.ts'), 'utf-8')
  const blogSlugRegex = /slug:\s*'([^']+)'/g
  let blogMatch
  while ((blogMatch = blogSlugRegex.exec(blogContent)) !== null) {
    const slug = blogMatch[1]
    const titleMatch = blogContent.substring(blogMatch.index - 500, blogMatch.index).match(/title:\s*'([^']+)'/)
    const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ')
    await renderAndSave(
      ogGenericNode({ title, subtitle: 'Free Games Hub Blog', icon: '📝' }),
      resolve(PUBLIC, `og/blog-${slug}.png`), 1200, 630,
    )
    count++
  }

  // ── Generate guide OG images ──
  console.log('  Generating guide OG images...')
  const guideContent = readFileSync(resolve(ROOT, 'src/data/gameGuidesSEO.ts'), 'utf-8')
  const guideSlugRegex = /gameGuides\['([^']+)'\]/g
  let guideMatch
  while ((guideMatch = guideSlugRegex.exec(guideContent)) !== null) {
    const slug = guideMatch[1]
    // Find title near this slug
    const nearby = guideContent.substring(guideMatch.index, guideMatch.index + 200)
    const titleMatch = nearby.match(/title:\s*'([^']+)'/)
    const title = titleMatch ? titleMatch[1] : `How to Play ${slug.replace(/-/g, ' ')}`
    await renderAndSave(
      ogGenericNode({ title, subtitle: 'Complete Strategy Guide', icon: '📖' }),
      resolve(PUBLIC, `og/guide-${slug}.png`), 1200, 630,
    )
    count++
  }

  // ── Generate hub OG images ──
  console.log('  Generating hub OG images...')
  const hubContent = readFileSync(resolve(ROOT, 'src/data/hubPages.ts'), 'utf-8')
  const hubSlugRegex = /hubPages\['([^']+)'\]/g
  let hubMatch
  while ((hubMatch = hubSlugRegex.exec(hubContent)) !== null) {
    const slug = hubMatch[1]
    const nearby = hubContent.substring(hubMatch.index, hubMatch.index + 300)
    const titleMatch = nearby.match(/title:\s*'([^']+)'/)
    const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ')
    await renderAndSave(
      ogGenericNode({ title, subtitle: 'Game Collection', icon: '🎮' }),
      resolve(PUBLIC, `og/hub-${slug}.png`), 1200, 630,
    )
    count++
  }

  // ── Generate category OG images ──
  console.log('  Generating category OG images...')
  for (const [id, cat] of Object.entries(categories)) {
    if (id === 'all') continue
    await renderAndSave(
      ogGenericNode({ title: cat.name, subtitle: `Play ${cat.name} free online`, icon: cat.icon }),
      resolve(PUBLIC, `og/category-${id}.png`), 1200, 630,
    )
    count++
  }

  // ── Generate misc OG images ──
  console.log('  Generating misc OG images...')
  await renderAndSave(
    ogGenericNode({ title: 'Daily Challenge', subtitle: 'A new puzzle every day', icon: '📅' }),
    resolve(PUBLIC, 'og/daily.png'), 1200, 630,
  )
  count++
  await renderAndSave(
    ogGenericNode({ title: 'Game Stats', subtitle: 'Your gaming statistics', icon: '📊' }),
    resolve(PUBLIC, 'og/stats.png'), 1200, 630,
  )
  count++

  // ── Default OG (replaces the old generic one) ──
  await renderAndSave(
    ogGenericNode({ title: 'Free Online Games', subtitle: '100+ games to play instantly', icon: '🎮' }),
    resolve(PUBLIC, 'og/default.png'), 1200, 630,
  )
  count++

  console.log(`✅ Generated ${count} images in public/og/ and public/thumbnails/`)
}

main().catch((err) => {
  console.error('❌ Image generation failed:', err)
  process.exit(1)
})
