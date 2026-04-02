import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const robotsTxt = `# Allow all bots
User-agent: *
Allow: /
Crawl-delay: 1

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_astro/
Disallow: /editor

# Specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# Sitemap
Sitemap: https://ruleword.com/sitemap.xml
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
