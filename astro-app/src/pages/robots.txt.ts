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

# Crawl delay to be polite
Crawl-delay: 1

# Sitemap location
Sitemap: https://ruleword.com/sitemap.xml

# Additional rules for specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
    },
  })
}
