import type { APIRoute } from 'astro'
import fs from 'fs'
import path from 'path'

// GET handler - explicitly return 405 Method Not Allowed
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    success: false,
    error: 'Method Not Allowed. Use POST to save game data.'
  }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  })
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const game = await request.json()

    // 验证必需字段
    if (!game.slug || !game.en?.name) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 构建文件路径
    const filePath = path.join(process.cwd(), 'src', 'content', 'games', `${game.slug}.json`)

    // 读取现有文件以保留其他字段
    let existingData = {}
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      existingData = JSON.parse(content)
    }

    // 合并数据
    const updatedData = {
      ...existingData,
      en: {
        ...existingData.en,
        name: game.en.name,
        desc: game.en.desc,
        howToPlay: game.en.howToPlay,
        tips: game.en.tips
      },
      ...(game.zh && game.zh.name ? {
        zh: {
          ...(existingData.zh || {}),
          name: game.zh.name,
          desc: game.zh.desc,
          howToPlay: game.zh.howToPlay,
          tips: game.zh.tips
        }
      } : {})
    }

    // 写入文件
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), 'utf-8')

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
