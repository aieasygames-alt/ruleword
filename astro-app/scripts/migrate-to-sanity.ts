#!/usr/bin/env node
/**
 * Sanity 数据迁移脚本
 *
 * 将 src/content/games/*.json 中的游戏数据迁移到 Sanity CMS
 *
 * 使用方法:
 * 1. 复制 .env.example 为 .env
 * 2. 填入 Sanity Project ID 和 Token
 * 3. 运行: pnpm cms:migrate:sanity
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

// 加载 .env 文件
config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env') })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const PROJECT_ID = process.env.SANITY_PROJECT_ID!
const DATASET = process.env.SANITY_DATASET || 'production'
const API_TOKEN = process.env.SANITY_API_TOKEN!

// Sanity API 端点
const API_BASE = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`

// 语言映射
const LOCALES = ['en', 'zh', 'zh-TW', 'fr', 'de', 'es', 'ru', 'ja']

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
 * 创建 Sanity 文档
 */
async function createDocument(doc: any): Promise<any> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({
      mutations: [
        {
          create: doc,
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create document: ${error}`)
  }

  return response.json()
}

/**
 * 检查文档是否已存在
 */
async function documentExists(gameId: string): Promise<boolean> {
  const queryUrl = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/query/${DATASET}?query=*[_type == "game" && gameId == "${gameId}"]`

  const response = await fetch(queryUrl, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  })

  if (!response.ok) return false

  const data = await response.json()
  return data.result?.length > 0
}

/**
 * 主迁移函数
 */
async function migrate() {
  if (!PROJECT_ID || !API_TOKEN) {
    console.error('❌ 错误: 请设置 SANITY_PROJECT_ID 和 SANITY_API_TOKEN 环境变量')
    process.exit(1)
  }

  console.log('🚀 开始迁移游戏数据到 Sanity...\n')
  console.log(`   Project ID: ${PROJECT_ID}`)
  console.log(`   Dataset: ${DATASET}\n`)

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
      const exists = await documentExists(gameData.id)
      if (exists) {
        console.log(`   ⏭️  已存在，跳过`)
        skipCount++
        continue
      }

      // 构建 Sanity 文档
      const doc = {
        _type: 'game',
        gameId: gameData.id,
        slug: {
          _type: 'slug',
          current: gameData.slug,
        },
        title: gameData.en?.name || '',
        icon: gameData.icon || '',
        category: gameData.category,
        colorGradient: gameData.color || 'from-gray-600 to-gray-800',
        isFeatured: gameData.featured || false,
        description: gameData.en?.desc || '',
        howToPlay: gameData.en?.howToPlay || '',
        tips: gameData.en?.tips?.join('\n') || '',
        // 中文内容 (需要配置多语言插件)
        // title_zh: gameData.zh?.name,
        // description_zh: gameData.zh?.desc,
        // howToPlay_zh: gameData.zh?.howToPlay,
        // tips_zh: gameData.zh?.tips?.join('\n'),
      }

      // 创建文档
      await createDocument(doc)
      console.log(`   ✅ 创建成功`)
      successCount++

      // 添加小延迟避免 API 限流
      await new Promise((resolve) => setTimeout(resolve, 100))
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
