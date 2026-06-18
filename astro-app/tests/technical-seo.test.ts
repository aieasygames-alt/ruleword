import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = path.resolve(__dirname, '..')

describe('Technical SEO safeguards', () => {
  it('uses one robots group so Googlebot inherits crawl exclusions', () => {
    const source = fs.readFileSync(path.join(projectRoot, 'src/pages/robots.txt.ts'), 'utf8')

    expect(source.match(/User-agent:/g)).toHaveLength(1)
    expect(source).toContain('Disallow: /embed/')
    expect(source).toContain('Disallow: /api/')
  })

  it('keeps non-indexable programmatic variants out of the sitemap', () => {
    const source = fs.readFileSync(path.join(projectRoot, 'src/pages/sitemap.xml.ts'), 'utf8')

    expect(source).not.toContain('difficultyVariants')
    expect(source).not.toContain('storyVariants')
  })

  it('marks programmatic variant pages noindex until gameplay is unique', () => {
    const gameVariant = fs.readFileSync(path.join(projectRoot, 'src/pages/games/[id]/[variant].astro'), 'utf8')
    const storyVariant = fs.readFileSync(path.join(projectRoot, 'src/pages/stories/[slug]/[variant].astro'), 'utf8')

    expect(gameVariant).toContain('robots="noindex, follow"')
    expect(storyVariant).toContain('robots="noindex, follow"')
  })

  it('provides static redirect fallbacks for legacy URLs', () => {
    const redirects = fs.readFileSync(path.join(projectRoot, 'public/_redirects'), 'utf8')

    expect(redirects).toContain('/zh-CN/* /:splat 301')
    expect(redirects).toContain('/fr/* /:splat 301')
    expect(redirects).toContain('/guides/heyawake-guide/ /guides/heyawake/ 301')
  })
})
