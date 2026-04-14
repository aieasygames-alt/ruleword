import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { categories } from '../data/games'
import { gameGuides } from '../data/gameGuidesSEO'

// Featured games get higher priority
const featuredSlugs = ['wordle', 'sudoku', '2048', 'tetris', 'chess', 'pac-man', 'minesweeper', 'snake', 'nonogram', 'spelling-bee', 'connections', 'word-search', 'boggle', 'mastermind', 'chimp-test', 'stroop-test', 'aim-trainer', 'typing-test']

export const GET: APIRoute = async () => {
  // 获取所有游戏
  const games = await getCollection('games')
  const gameSlugs = games.map(entry => entry.data.slug)

  // 分类
  const categoryIds = categories.map(c => c.id)

  // 攻略页面
  const guideSlugs = Object.keys(gameGuides)

  const baseUrl = 'https://ruleword.com'
  const lastmod = new Date().toISOString().split('T')[0]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${baseUrl}/icons/og-image.png</image:loc>
      <image:title>Free Games Hub - Play 100+ Free Online Games</image:title>
    </image:image>
  </url>

  <!-- Category Pages -->
${categoryIds.map(cat => `  <url>
    <loc>${baseUrl}/category/${cat}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

  <!-- Game Pages (${gameSlugs.length} games) -->
${gameSlugs.map(slug => {
  const priority = featuredSlugs.includes(slug) ? '0.9' : '0.7'
  return `  <url>
    <loc>${baseUrl}/games/${slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
}).join('\n')}

  <!-- Game Guides Index -->
  <url>
    <loc>${baseUrl}/guides/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Game Guide Pages (${guideSlugs.length} guides) -->
${guideSlugs.map(slug => {
  const priority = featuredSlugs.includes(slug) ? '0.8' : '0.6'
  return `  <url>
    <loc>${baseUrl}/guides/${slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`
}).join('\n')}

</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
