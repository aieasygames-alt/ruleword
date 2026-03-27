/**
 * 自动生成 sitemap.xml
 * 确保所有游戏和分类页面都包含在内
 */

import { getCollection } from 'astro:content'
import { categories } from '../src/data/games'

async function generateSitemap() {
  // 获取所有游戏
  const games = await getCollection('games')
  const gameSlugs = games.map(entry => entry.data.slug)

  // 分类
  const categoryIds = categories.map(c => c.id)

  // 基础 URL
  const baseUrl = 'https://ruleword.com'
  const lastmod = new Date().toISOString().split('T')[0]

  // 生成 XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Category Pages -->
${categoryIds.map(cat => `  <url>
    <loc>${baseUrl}/category/${cat}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}

  <!-- Game Pages (${gameSlugs.length} games) -->
${gameSlugs.map(slug => `  <url>
    <loc>${baseUrl}/games/${slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

</urlset>`

  return xml
}

// 运行生成
generateSitemap().then(xml => {
  console.log(xml)
  console.log(`\n✅ Generated sitemap with ${gameSlugs.length} games and ${categoryIds.length} categories`)
})
