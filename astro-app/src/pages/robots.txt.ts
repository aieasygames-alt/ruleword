import type { APIRoute } from 'astro'

export const GET: APIRoute = async () => {
  const robotsTxt = `# Allow all bots
User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /api/
Disallow: /admin/
Disallow: /_astro/
Disallow: /editor

# Disallow embed pages (noindex, avoid crawl waste)
Disallow: /embed/

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
