// Cloudflare Pages Function - legacy SEO URL cleanup
// Permanently consolidates retired language paths and ?lang= duplicates.

const LEGACY_LANGS = new Set(['en', 'fr', 'de', 'es', 'ru', 'ja', 'zh-TW', 'zh-CN'])
const LEGACY_GUIDE_SLUGS = new Map([
  ['slitherlink-guide', 'slitherlink'],
  ['heyawake-guide', 'heyawake'],
  ['suguru-guide', 'suguru'],
])

export function getSeoRedirect(requestUrl: string): { location: string; language?: string } | null {
  const url = new URL(requestUrl)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const pathLanguage = pathParts[0]
  const queryLanguage = url.searchParams.get('lang')

  if (pathParts[0] === 'guides' && pathParts[1] && LEGACY_GUIDE_SLUGS.has(pathParts[1])) {
    url.pathname = `/guides/${LEGACY_GUIDE_SLUGS.get(pathParts[1])}/`
    return { location: url.toString() }
  }

  if (pathLanguage && LEGACY_LANGS.has(pathLanguage)) {
    const targetPath = `/${pathParts.slice(1).join('/')}${url.pathname.endsWith('/') || pathParts.length === 1 ? '/' : ''}`
    url.pathname = targetPath.replace(/\/+/g, '/')
    url.searchParams.delete('lang')

    return {
      location: url.toString(),
      language: pathLanguage,
    }
  }

  if (queryLanguage && LEGACY_LANGS.has(queryLanguage)) {
    url.searchParams.delete('lang')
    return {
      location: url.toString(),
      language: queryLanguage,
    }
  }

  return null
}

export const onRequest: PagesFunction = async (context) => {
  const redirect = getSeoRedirect(context.request.url)

  if (redirect) {
    const response = Response.redirect(redirect.location, 301)
    if (redirect.language) {
      response.headers.append(
      'Set-Cookie',
        `preferred-language=${redirect.language}; Path=/; Max-Age=31536000; SameSite=Lax`
      )
    }
    return response
  }

  return context.next()
}
