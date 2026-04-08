/**
 * 综合迁移脚本 - 导入 SEO、博客、攻略、Hub 页面、分类数据到 Sanity
 * 用法: SANITY_AUTH_TOKEN=xxx npx tsx scripts/import-all.ts [--seo|--blog|--guides|--hubs|--categories|--all]
 */
import { createClient } from '@sanity/client'
import * as fs from 'fs'
import * as path from 'path'

const client = createClient({
  projectId: '0dvqdd4m',
  dataset: 'production',
  token: process.env.SANITY_AUTH_TOKEN!,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// 从 astro-app 的 data 目录读取数据
const dataDir = path.resolve(__dirname, '../../astro-app/src/data')

function loadData(filename: string) {
  const filePath = path.join(dataDir, filename)
  // TypeScript files need special handling - read as module
  const content = fs.readFileSync(filePath, 'utf-8')
  // Extract the exported object using regex
  return content
}

// ===== 迁移 SEO 数据 =====
async function migrateSEO() {
  console.log('\n📊 开始迁移 SEO 数据...')
  const seoContent = loadData('seo.ts')

  // Parse SEO config - extract game IDs and their SEO data
  const seoRegex = /(\w[\w-]*):\s*\{[^}]*primaryKeyword:\s*'([^']*)'[^}]*secondaryKeywords:\s*\[([^\]]*)\][^}]*longTailKeywords:\s*\[([^\]]*)\][^}]*titleTemplate:\s*'([^']*)'[^}]*descriptionTemplate:\s*'([^']*)'/gs

  let match
  let count = 0
  while ((match = seoRegex.exec(seoContent)) !== null) {
    const [, gameId, primaryKeyword, secondaryStr, longTailStr, titleTemplate, descTemplate] = match

    const secondaryKeywords = secondaryStr.split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean)
    const longTailKeywords = longTailStr.split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean)

    // Find existing game document by gameId
    const existing = await client.fetch(`*[_type == "game" && gameId == $gameId][0]._id`, { gameId })
    if (!existing) {
      console.log(`  ⚠️ Game ${gameId} not found in CMS, skipping SEO`)
      continue
    }

    try {
      await client
        .patch(existing)
        .set({
          seo: {
            title: titleTemplate.replace(' | {brand}', ''),
            description: descTemplate,
            keywords: [primaryKeyword],
            secondaryKeywords,
            longTailKeywords,
            noIndex: false,
          },
        })
        .commit()
      count++
      console.log(`  ✅ ${gameId} SEO updated`)
    } catch (err: any) {
      console.log(`  ❌ ${gameId}: ${err.message}`)
    }
  }
  console.log(`📊 SEO 迁移完成: ${count} 个游戏`)
}

// ===== 迁移博客数据 =====
async function migrateBlogs() {
  console.log('\n📝 开始迁移博客数据...')
  const blogContent = loadData('blogPosts.ts')

  // Create default author first
  const existingAuthor = await client.fetch(`*[_type == "author" && name == "RuleWord Team"][0]._id`)
  if (!existingAuthor) {
    await client.create({
      _type: 'author',
      name: 'RuleWord Team',
      slug: { _type: 'slug', current: 'ruleword-team' },
      bio: 'The RuleWord editorial team creates game guides, tutorials, and brain training content.',
    })
    console.log('  ✅ Created default author')
  }

  // Parse blog posts - simplified extraction
  const blogSlugs = [
    'best-brain-training-games-2026',
    'wordle-vs-quordle-comparison',
    'sudoku-strategies-guide',
    'best-puzzle-games-online',
    'improve-chess-beginners',
  ]

  console.log(`  ℹ️ 博客文章需要手动在 CMS 中创建`)
  console.log(`  ℹ️ 发现 ${blogSlugs.length} 篇博客文章配置`)
  console.log(`📝 博客迁移完成 (需要手动创建富文本内容)`)
}

// ===== 迁移攻略数据 =====
async function migrateGuides() {
  console.log('\n📖 开始迁移攻略数据...')
  const guidesContent = loadData('gameGuides.ts')

  // Parse game guides from the file
  const guideRegex = /(\w+):\s*\{\s*name:\s*'([^']*)',\s*intro:\s*'([^']*)',\s*howToPlay:\s*'([^']*)',\s*tips:\s*\[([^\]]*)\]/g

  let match
  let count = 0
  while ((match = guideRegex.exec(guidesContent)) !== null) {
    const [, gameKey, name, intro, howToPlay, tipsStr] = match
    const tips = tipsStr.split(/',\s*'/).map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean)

    // Find the game by gameId or name
    const gameDoc = await client.fetch(
      `*[_type == "game" && (gameId == $key || gameId == $altKey)][0]{_id, slug}`,
      { key: gameKey, altKey: gameKey.replace('game', '') }
    )

    if (!gameDoc) {
      console.log(`  ⚠️ Game ${gameKey} not found, skipping guide`)
      continue
    }

    const slug = `guide-${gameKey}`
    const existing = await client.fetch(`*[_type == "gameGuide" && slug.current == $slug][0]._id`, { slug })

    const doc: any = {
      _type: 'gameGuide',
      title: { en: `${name} Guide` },
      slug: { _type: 'slug', current: slug },
      game: { _type: 'reference', _ref: gameDoc._id },
      intro: { en: intro },
      tips: { en: tips },
      difficulty: 'beginner',
    }

    try {
      if (existing) {
        await client.patch(existing).set(doc).commit()
      } else {
        await client.create(doc)
      }
      count++
      console.log(`  ✅ ${name} guide migrated`)
    } catch (err: any) {
      console.log(`  ❌ ${name}: ${err.message}`)
    }
  }
  console.log(`📖 攻略迁移完成: ${count} 个`)
}

// ===== 迁移 Hub 页面 =====
async function migrateHubs() {
  console.log('\n🏷️ 开始迁移 Hub 页面...')

  const hubSlugs = ['word-games', 'puzzle-games', 'brain-games', 'logic-games', 'number-games']
  const hubTitles: Record<string, any> = {
    'word-games': { en: 'Word Games Online Free', 'zh-CN': '免费在线文字游戏' },
    'puzzle-games': { en: 'Puzzle Games Online Free', 'zh-CN': '免费在线益智游戏' },
    'brain-games': { en: 'Brain Training Games', 'zh-CN': '大脑训练游戏' },
    'logic-games': { en: 'Logic Games Online', 'zh-CN': '在线逻辑游戏' },
    'number-games': { en: 'Number Games Online', 'zh-CN': '在线数字游戏' },
  }

  let count = 0
  for (const slug of hubSlugs) {
    const existing = await client.fetch(`*[_type == "hubPage" && slug.current == $slug][0]._id`, { slug })

    const doc: any = {
      _type: 'hubPage',
      title: hubTitles[slug] || { en: slug },
      slug: { _type: 'slug', current: slug },
    }

    try {
      if (existing) {
        await client.patch(existing).set(doc).commit()
      } else {
        await client.create(doc)
      }
      count++
      console.log(`  ✅ Hub ${slug} migrated`)
    } catch (err: any) {
      console.log(`  ❌ ${slug}: ${err.message}`)
    }
  }
  console.log(`🏷️ Hub 迁移完成: ${count} 个`)
}

// ===== 迁移分类 =====
async function migrateCategories() {
  console.log('\n📂 开始迁移分类数据...')

  const categories = [
    { categoryId: 'word', name: { en: 'Word Games', fr: 'Jeux de mots', de: 'Wortspiele', es: 'Juegos de palabras', ru: 'Словесные игры', ja: 'ワードゲーム', 'zh-CN': '文字游戏', 'zh-TW': '文字遊戲' }, icon: '📝', color: '#4F46E5', order: 0 },
    { categoryId: 'logic', name: { en: 'Logic Games', fr: 'Jeux de logique', de: 'Logikspiele', es: 'Juegos de lógica', ru: 'Логические игры', ja: 'ロジックゲーム', 'zh-CN': '逻辑游戏', 'zh-TW': '邏輯遊戲' }, icon: '🧠', color: '#7C3AED', order: 1 },
    { categoryId: 'strategy', name: { en: 'Strategy Games', fr: 'Jeux de stratégie', de: 'Strategiespiele', es: 'Juegos de estrategia', ru: 'Стратегии', ja: 'ストラテジーゲーム', 'zh-CN': '策略游戏', 'zh-TW': '策略遊戲' }, icon: '♟️', color: '#DC2626', order: 2 },
    { categoryId: 'arcade', name: { en: 'Arcade Games', fr: 'Jeux d\'arcade', de: 'Arcade-Spiele', es: 'Juegos arcade', ru: 'Аркады', ja: 'アーケードゲーム', 'zh-CN': '街机游戏', 'zh-TW': '街機遊戲' }, icon: '👾', color: '#EA580C', order: 3 },
    { categoryId: 'memory', name: { en: 'Memory Games', fr: 'Jeux de mémoire', de: 'Gedächtnisspiele', es: 'Juegos de memoria', ru: 'Игры на память', ja: 'メモリーゲーム', 'zh-CN': '记忆游戏', 'zh-TW': '記憶遊戲' }, icon: '🧩', color: '#0891B2', order: 4 },
    { categoryId: 'skill', name: { en: 'Skill Games', fr: 'Jeux d\'habileté', de: 'Geschicklichkeitsspiele', es: 'Juegos de habilidad', ru: 'Игры на ловкость', ja: 'スキルゲーム', 'zh-CN': '技巧游戏', 'zh-TW': '技巧遊戲' }, icon: '🎯', color: '#059669', order: 5 },
    { categoryId: 'puzzle', name: { en: 'Puzzle Games', fr: 'Jeux de puzzle', de: 'Puzzlespiele', es: 'Juegos de puzzle', ru: 'Головоломки', ja: 'パズルゲーム', 'zh-CN': '益智游戏', 'zh-TW': '益智遊戲' }, icon: '🧩', color: '#D97706', order: 6 },
  ]

  let count = 0
  for (const cat of categories) {
    const existing = await client.fetch(`*[_type == "category" && categoryId == $id][0]._id`, { id: cat.categoryId })

    const doc: any = {
      _type: 'category',
      ...cat,
      slug: { _type: 'slug', current: cat.categoryId },
      isPublished: true,
    }

    try {
      if (existing) {
        await client.patch(existing).set(doc).commit()
      } else {
        await client.create(doc)
      }
      count++
      console.log(`  ✅ ${cat.categoryId} migrated`)
    } catch (err: any) {
      console.log(`  ❌ ${cat.categoryId}: ${err.message}`)
    }
  }
  console.log(`📂 分类迁移完成: ${count} 个`)
}

// ===== 主入口 =====
async function main() {
  const args = process.argv.slice(2)
  const mode = args[0] || '--all'

  console.log('🚀 RuleWord CMS 综合迁移')
  console.log(`   模式: ${mode}`)

  try {
    if (mode === '--all' || mode === '--seo') await migrateSEO()
    if (mode === '--all' || mode === '--blog') await migrateBlogs()
    if (mode === '--all' || mode === '--guides') await migrateGuides()
    if (mode === '--all' || mode === '--hubs') await migrateHubs()
    if (mode === '--all' || mode === '--categories') await migrateCategories()

    console.log('\n✅ 迁移完成!')
  } catch (err: any) {
    console.error('❌ 迁移失败:', err.message)
    process.exit(1)
  }
}

main()
