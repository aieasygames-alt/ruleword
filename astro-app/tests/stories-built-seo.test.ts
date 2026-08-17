import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { storyGenres } from '../src/data/storyGenres'

const projectRoot = path.resolve(__dirname, '..')
const distRoot = path.join(projectRoot, 'dist')

function readBuiltHtml(route: string) {
  return fs.readFileSync(path.join(distRoot, route, 'index.html'), 'utf8')
}

function extractJsonLd(html: string) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]

  return scripts.map(match => JSON.parse(match[1]))
}

function normalizeType(type: string | string[]) {
  return Array.isArray(type) ? type : [type]
}

describe('Built AI Stories SEO output', () => {
  it('renders Stories index schema, canonical, and genre links in dist HTML', () => {
    const html = readBuiltHtml('stories')
    const schemas = extractJsonLd(html)
    const collection = schemas.find(schema => schema['@type'] === 'CollectionPage')

    expect(html).toContain('<link rel="canonical" href="https://ruleword.com/stories/">')
    expect(collection).toBeDefined()
    expect(collection.mainEntity.itemListElement.length).toBeGreaterThanOrEqual(15)

    storyGenres.forEach(genre => {
      expect(html).toContain(`/stories/genre/${genre.slug}/`)
      expect(collection.hasPart).toContainEqual(expect.objectContaining({
        name: genre.label,
        url: `https://ruleword.com/stories/genre/${genre.slug}/`,
      }))
    })
  })

  it('renders story detail Game and FAQ schema in dist HTML', () => {
    const html = readBuiltHtml('stories/ai-dating-simulator')
    const schemas = extractJsonLd(html)
    const gameSchema = schemas.find(schema => normalizeType(schema['@type']).includes('Game'))
    const faqSchema = schemas.find(schema => schema['@type'] === 'FAQPage')

    expect(html).toContain('<link rel="canonical" href="https://ruleword.com/stories/ai-dating-simulator/">')
    expect(gameSchema).toBeDefined()
    expect(normalizeType(gameSchema['@type'])).toContain('WebApplication')
    expect(gameSchema.potentialAction['@type']).toBe('PlayAction')
    expect(gameSchema.hasPart.some(part => part.name.includes('endings'))).toBe(true)
    expect(faqSchema.mainEntity.length).toBeGreaterThan(0)
  })

  it('renders every story genre landing page with schema and crawlable story links', () => {
    storyGenres.forEach(genre => {
      const html = readBuiltHtml(`stories/genre/${genre.slug}`)
      const schemas = extractJsonLd(html)
      const collection = schemas.find(schema => schema['@type'] === 'CollectionPage')
      const faqSchema = schemas.find(schema => schema['@type'] === 'FAQPage')

      expect(html).toContain(`<link rel="canonical" href="https://ruleword.com/stories/genre/${genre.slug}/">`)
      expect(html).toContain('/stories/')
      expect(collection).toBeDefined()
      expect(collection.name).toContain(genre.label)
      expect(collection.mainEntity.itemListElement.length).toBeGreaterThan(0)
      expect(faqSchema.mainEntity.length).toBeGreaterThan(0)
    })
  })

  it('includes story genre URLs in the built sitemap', () => {
    const sitemap = fs.readFileSync(path.join(distRoot, 'sitemap.xml'), 'utf8')

    storyGenres.forEach(genre => {
      expect(sitemap).toContain(`<loc>https://ruleword.com/stories/genre/${genre.slug}/</loc>`)
    })
  })
})
