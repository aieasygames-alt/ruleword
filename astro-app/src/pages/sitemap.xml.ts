import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { categories } from '../data/categories'
import { gameGuides } from '../data/gameGuidesSEO'
import { hubPages } from '../data/hubPages'
import { blogPosts } from '../data/blogPosts'
import { difficultyVariants } from '../data/gameVariants'

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

  // Hub pages
  const hubSlugs = Object.keys(hubPages)

  // Blog posts
  const blogSlugs = Object.keys(blogPosts)

  // Game variants
  const variants = difficultyVariants

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
      <image:loc>${baseUrl}/og/home.png</image:loc>
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

  <!-- Game Variant Pages (${variants.length} variants) -->
${variants.map(v => `  <url>
    <loc>${baseUrl}/games/${v.gameId}/${v.variant}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}

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

  <!-- Hub Pages Index -->
  <url>
    <loc>${baseUrl}/hubs/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Hub Pages (${hubSlugs.length} hubs) -->
${hubSlugs.map(slug => `  <url>
    <loc>${baseUrl}/hubs/${slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Blog Index -->
  <url>
    <loc>${baseUrl}/blog/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Blog Posts (${blogSlugs.length} posts) -->
${blogSlugs.map(slug => `  <url>
    <loc>${baseUrl}/blog/${slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}

  <!-- AI Story Pages -->
  <url>
    <loc>${baseUrl}/stories/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${(await getCollection('stories')).map(entry => `  <url>
    <loc>${baseUrl}/stories/${entry.data.slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

  <!-- Daily Challenge Page -->
  <url>
    <loc>${baseUrl}/daily/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Stats Page -->
  <url>
    <loc>${baseUrl}/stats/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>

</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
