/**
 * 批量导入游戏数据到 Sanity CMS
 *
 * 使用方法:
 * cd /Users/robert/ruleword/sanity-studio
 * SANITY_AUTH_TOKEN="your-token" npx tsx scripts/import-games.ts
 */

import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

// Sanity 客户端配置
const client = createClient({
  projectId: '0dvqdd4m',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

// 游戏内容目录
const GAMES_DIR = path.resolve(__dirname, '../../astro-app/src/content/games')

// 本地 JSON 游戏数据格式
interface LocalGameJSON {
  id: string
  slug: string
  icon: string
  category: string
  featured?: boolean
  color: string
  en: {
    name: string
    desc: string
    description?: string
    objectives?: string
    howToPlay?: string
    rules?: {
      controls?: string
      mechanics?: string[]
      features?: string[]
    }
    tips?: string[]
    faq?: Array<{ question: string; answer: string }>
  }
  zh?: {
    name: string
    desc: string
    description?: string
    objectives?: string
    howToPlay?: string
    rules?: {
      controls?: string
      mechanics?: string[]
      features?: string[]
    }
    tips?: string[]
    faq?: Array<{ question: string; answer: string }>
  }
}

// 生成随机 key
function generateKey(): string {
  return Math.random().toString(36).substring(2, 10)
}

// 为 FAQ 数组添加 _key (对象数组需要 _key)
function addKeysToFaqArray(arr: Array<{ question: string; answer: string }> | undefined): Array<{ _key: string; question: string; answer: string }> {
  if (!arr || !Array.isArray(arr)) return []
  return arr.map(item => ({
    _key: generateKey(),
    question: item.question || '',
    answer: item.answer || '',
  }))
}

// 转换本地 JSON 为 Sanity 文档格式
function convertToSanityDoc(game: LocalGameJSON): any {
  const en = game.en
  const zh = game.zh

  return {
    _type: 'game',
    gameId: game.id,
    slug: { _type: 'slug', current: game.slug },
    title: en.name,
    titleZh: zh?.name || en.name,
    icon: game.icon,
    category: game.category,
    colorGradient: game.color,
    isFeatured: game.featured || false,
    // 描述
    description: en.description || en.desc,
    descriptionZh: zh?.description || zh?.desc || en.description || en.desc,
    // 目标
    objectives: en.objectives || '',
    objectivesZh: zh?.objectives || en.objectives || '',
    // 如何玩
    howToPlay: en.howToPlay || '',
    howToPlayZh: zh?.howToPlay || en.howToPlay || '',
    // 规则 (内嵌对象，不需要 _key)
    rules: en.rules?.controls || en.rules?.mechanics?.length || en.rules?.features?.length ? {
      controls: en.rules?.controls || '',
      controlsZh: zh?.rules?.controls || en.rules?.controls || '',
      mechanics: en.rules?.mechanics || [],
      mechanicsZh: zh?.rules?.mechanics || en.rules?.mechanics || [],
      features: en.rules?.features || [],
      featuresZh: zh?.rules?.features || en.rules?.features || [],
    } : undefined,
    // 技巧 (字符串数组，直接使用)
    tips: en.tips || [],
    tipsZh: zh?.tips || en.tips || [],
    // FAQ (对象数组需要 _key)
    faq: addKeysToFaqArray(en.faq),
    faqZh: addKeysToFaqArray(zh?.faq || en.faq),
  }
}

async function importGames() {
  console.log('🎮 开始导入游戏数据到 Sanity CMS...\n')

  // 检查目录是否存在
  if (!fs.existsSync(GAMES_DIR)) {
    console.error(`❌ 游戏目录不存在: ${GAMES_DIR}`)
    process.exit(1)
  }

  // 读取所有游戏文件
  const files = fs.readdirSync(GAMES_DIR).filter(f => f.endsWith('.json'))
  console.log(`📁 找到 ${files.length} 个游戏文件\n`)

  let successCount = 0
  let errorCount = 0
  const errors: string[] = []

  for (const file of files) {
    const filePath = path.join(GAMES_DIR, file)
    const gameSlug = file.replace('.json', '')

    try {
      // 读取游戏数据
      const content = fs.readFileSync(filePath, 'utf-8')
      const game: LocalGameJSON = JSON.parse(content)

      // 转换为 Sanity 文档
      const doc = convertToSanityDoc(game)

      // 检查是否已存在
      const existing = await client.fetch(
        `*[_type == "game" && gameId == $gameId][0]._id`,
        { gameId: game.id }
      )

      if (existing) {
        // 更新现有文档
        await client
          .patch(existing)
          .set(doc)
          .commit()
        console.log(`✅ 更新: ${game.en.name} (${game.id})`)
      } else {
        // 创建新文档
        await client.create(doc)
        console.log(`✅ 创建: ${game.en.name} (${game.id})`)
      }

      successCount++
    } catch (error: any) {
      errorCount++
      const errorMsg = `❌ 失败: ${gameSlug} - ${error.message}`
      console.log(errorMsg)
      errors.push(errorMsg)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`\n📊 导入结果:`)
  console.log(`   ✅ 成功: ${successCount}`)
  console.log(`   ❌ 失败: ${errorCount}`)

  if (errors.length > 0) {
    console.log('\n错误详情:')
    errors.forEach(e => console.log(`  ${e}`))
  }

  console.log('\n🎉 导入完成!')
}

// 运行导入
importGames().catch(console.error)
