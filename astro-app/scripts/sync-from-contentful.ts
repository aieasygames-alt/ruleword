#!/usr/bin/env node
/**
 * Contentful 数据同步脚本
 *
 * 从 Contentful CMS 同步游戏数据到本地 JSON 文件
 * 用于备份或离线开发
 *
 * 使用方法:
 * pnpm cms:sync
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置
const SPACE_ID = process.env.CONTENTFUL_SPACE_ID!
const DELIVERY_TOKEN = process.env.CONTENTFUL_DELIVERY_TOKEN!
const ENVIRONMENT = process.env.CONTENTFUL_ENVIRONMENT || 'master'

// Contentful API 端点
const API_BASE = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/${ENVIRONMENT}`

/**
 * 获取所有游戏条目
 */
async function fetchAllGames(): Promise<any[]> {
  const url = `${API_BASE}/entries?content_type=game&limit=1000`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${DELIVERY_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.items
}

/**
 * 将 Contentful 条目转换为本地 JSON 格式
 */
function convertToLocalFormat(entry: any): any {
  const fields = entry.fields

  // 基础字段
  const result: any = {
    id: fields.gameId,
    slug: fields.slug,
    icon: fields.icon || '',
    category: fields.category,
    featured: fields.isFeatured || false,
    color: fields.colorGradient || 'from-gray-600 to-gray-800',
  }

  // 多语言内容
  // 假设 Contentful 返回的是默认 locale (en-US)
  result.en = {
    name: fields.title || '',
    desc: fields.description || '',
    howToPlay: fields.howToPlay || '',
    tips: fields.tips
      ? fields.tips.split('\n\n').map((t: string) => t.replace('• ', ''))
      : [],
  }

  // 如果有中文内容
  if (fields.title_zh || fields.description_zh) {
    result.zh = {
      name: fields.title_zh || fields.title || '',
      desc: fields.description_zh || fields.description || '',
      howToPlay: fields.howToPlay_zh || fields.howToPlay || '',
      tips: fields.tips_zh
        ? fields.tips_zh.split('\n\n').map((t: string) => t.replace('• ', ''))
        : result.en.tips,
    }
  }

  return result
}

/**
 * 主同步函数
 */
async function sync() {
  if (!SPACE_ID || !DELIVERY_TOKEN) {
    console.error('❌ 错误: 请设置 CONTENTFUL_SPACE_ID 和 CONTENTFUL_DELIVERY_TOKEN 环境变量')
    process.exit(1)
  }

  console.log('🔄 开始从 Contentful 同步游戏数据...\n')

  try {
    // 获取所有游戏
    const entries = await fetchAllGames()
    console.log(`📥 获取到 ${entries.length} 个游戏\n`)

    // 确保目标目录存在
    const gamesDir = path.join(__dirname, '../src/content/games')
    if (!fs.existsSync(gamesDir)) {
      fs.mkdirSync(gamesDir, { recursive: true })
    }

    let successCount = 0
    let skipCount = 0

    for (const entry of entries) {
      const gameData = convertToLocalFormat(entry)
      const filePath = path.join(gamesDir, `${gameData.slug}.json`)

      // 检查文件是否已存在
      if (fs.existsSync(filePath)) {
        const existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        if (JSON.stringify(existingData) === JSON.stringify(gameData)) {
          console.log(`   ⏭️  ${gameData.id}: 无变化，跳过`)
          skipCount++
          continue
        }
      }

      // 写入文件
      fs.writeFileSync(filePath, JSON.stringify(gameData, null, 2) + '\n', 'utf-8')
      console.log(`   ✅ ${gameData.id}: 已同步`)
      successCount++
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 同步完成统计:')
    console.log(`   ✅ 更新: ${successCount}`)
    console.log(`   ⏭️  跳过: ${skipCount}`)
    console.log('='.repeat(50))
  } catch (error) {
    console.error('💥 同步失败:', error)
    process.exit(1)
  }
}

// 运行同步
sync()
