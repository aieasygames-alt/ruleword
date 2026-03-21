#!/usr/bin/env node
/**
 * Contentful 数据迁移脚本
 *
 * 将 src/content/games/*.json 中的游戏数据迁移到 Contentful CMS
 *
 * 使用方法:
 * 1. 复制 .env.example 为 .env
 * 2. 填入 Contentful Space ID 和 Management Token
 * 3. 运行: pnpm cms:migrate
 */

import contentfulManagement from 'contentful-management'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN!
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

// 语言映射 (本地 locale -> Contentful locale)
const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  fr: 'fr',
  de: 'de',
  es: 'es',
  ru: 'ru',
  ja: 'ja',
}

// 支持的语言列表
const SUPPORTED_LOCALES = Object.keys(LOCALE_MAP)

// 游戏 JSON 数据结构
interface GameLocaleData {
  name: string
  desc: string
  howToPlay?: string
  tips?: string[]
}

interface GameData {
  id: string
  slug: string
  icon: string
  category: string
  featured?: boolean
  color: string
  [locale: string]: GameLocaleData | string | boolean | undefined
}

/**
 * 将 tips 数组转换为换行分隔的字符串
 */
function formatTips(tips?: string[]): string {
  if (!tips || tips.length === 0) return ''
  return tips.map((tip) => `• ${tip}`).join('\n\n')
}

/**
 * 构建多语言字段
 */
function buildLocalizedField(
  gameData: GameData,
  field: keyof GameLocaleData
): Record<string, string> {
  const result: Record<string, string> = {}

  for (const locale of SUPPORTED_LOCALES) {
    const localeData = gameData[locale] as GameLocaleData | undefined
    if (localeData && localeData[field]) {
      const cfLocale = LOCALE_MAP[locale]
      if (field === 'tips') {
        result[cfLocale] = formatTips(localeData.tips)
      } else {
        result[cfLocale] = String(localeData[field])
      }
    }
  }

  return result
}

/**
 * 主迁移函数
 */
async function migrate() {
  if (!SPACE_ID || !MANAGEMENT_TOKEN) {
    console.error('❌ 错误: 请设置 CONTENTFUL_SPACE_ID 和 CONTENTFUL_MANAGEMENT_TOKEN 环境变量')
    process.exit(1)
  }

  console.log('🚀 开始迁移游戏数据到 Contentful...\n')

  // 创建 Contentful Management 客户端
  const client = contentfulManagement.createClient(
    {
      accessToken: MANAGEMENT_TOKEN,
    },
    {
      type: 'plain',
    }
  )

  const space = await client.getSpace(SPACE_ID)
  const environment = await space.getEnvironment(ENVIRONMENT)

  // 读取所有游戏 JSON 文件
  const gamesDir = path.join(__dirname, '../src/content/games')

  if (!fs.existsSync(gamesDir)) {
    console.error(`❌ 错误: 游戏目录不存在: ${gamesDir}`)
    process.exit(1)
  }

  const files = fs.readdirSync(gamesDir).filter((f) => f.endsWith('.json'))
  console.log(`📁 找到 ${files.length} 个游戏文件\n`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const file of files) {
    const filePath = path.join(gamesDir, file)

    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      const gameData: GameData = JSON.parse(content)

      console.log(`📝 处理: ${gameData.id} (${gameData.en?.name || 'Unknown'})`)

      // 检查是否已存在
      const existing = await environment.getEntries({
        content_type: 'game',
        'fields.gameId': gameData.id,
        limit: 1,
      })

      if (existing.items.length > 0) {
        console.log(`   ⏭️  已存在，跳过`)
        skipCount++
        continue
      }

      // 构建字段数据
      const fields = {
        gameId: { 'en-US': gameData.id },
        slug: { 'en-US': gameData.slug },
        title: buildLocalizedField(gameData, 'name'),
        icon: { 'en-US': gameData.icon },
        category: { 'en-US': gameData.category },
        colorGradient: { 'en-US': gameData.color },
        isFeatured: { 'en-US': gameData.featured || false },
        description: buildLocalizedField(gameData, 'desc'),
        howToPlay: buildLocalizedField(gameData, 'howToPlay'),
        tips: buildLocalizedField(gameData, 'tips'),
      }

      // 创建 Entry
      const entry = await environment.createEntry('game', { fields })

      console.log(`   ✅ 创建成功: ${entry.sys.id}`)
      successCount++

      // 添加小延迟避免 API 限流
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      errorCount++
      if (error instanceof Error) {
        console.error(`   ❌ 失败: ${error.message}`)
      } else {
        console.error(`   ❌ 失败: 未知错误`)
      }
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 迁移完成统计:')
  console.log(`   ✅ 成功: ${successCount}`)
  console.log(`   ⏭️  跳过: ${skipCount}`)
  console.log(`   ❌ 失败: ${errorCount}`)
  console.log('='.repeat(50))

  if (errorCount > 0) {
    process.exit(1)
  }
}

// 运行迁移
migrate().catch((error) => {
  console.error('💥 迁移失败:', error)
  process.exit(1)
})
