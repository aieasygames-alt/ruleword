/**
 * 迁移脚本: 将 games.ts 数据转换为 CMS JSON 格式
 *
 * 使用方法:
 *   node scripts/migrate-to-cms.mjs
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// 动态导入游戏数据
async function migrateGames() {
  // 导入游戏配置
  const gamesModule = await import('../src/data/games.ts')
  const games = gamesModule.games

  // 导入游戏指南
  const guidesModule = await import('../src/data/gameGuides.ts')
  const getGameGuide = guidesModule.getGameGuide

  const outputDir = join(__dirname, '..', 'src', 'content', 'games')

  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  games.forEach((game: any) => {
    const guideEn = getGameGuide(game.id, 'en')
    const guideZh = getGameGuide(game.id, 'zh-CN')

    const newGame = {
      id: game.id,
      slug: game.slug,
      icon: game.icon,
      category: game.category,
      featured: game.featured,
      color: game.color,
      en: {
        name: game.name,
        desc: game.desc,
        howToPlay: guideEn?.howToPlay || '',
        tips: guideEn?.tips || [],
      },
      zh: {
        name: game.nameZh,
        desc: game.descZh,
        howToPlay: guideZh?.howToPlay || guideEn?.howToPlay || '',
        tips: guideZh?.tips || guideEn?.tips || [],
      },
    }

    const outputPath = join(outputDir, `${game.slug}.json`)
    writeFileSync(outputPath, JSON.stringify(newGame, null, 2), 'utf-8')
    console.log(`✅ Created: ${game.slug}.json`)
  })

  console.log(`\n🎉 Migration complete! ${games.length} games migrated.`)
  console.log(`📁 Output: ${outputDir}`)
}

// 运行迁移
migrateGames().catch(console.error)
