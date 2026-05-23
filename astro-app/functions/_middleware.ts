// Cloudflare Pages Function - Language redirect middleware
// Replaces 888 static redirect pages with a single edge function
// /:lang/ → / (language homepage)
// /:lang/games/:slug/ → /games/:slug/ (language game page)
// /:lang/stories/:slug/ → /stories/:slug/ (language story page)

const VALID_LANGS = new Set(['en', 'zh-CN'])

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url)
  const pathParts = url.pathname.split('/').filter(Boolean)

  if (pathParts.length === 0) return context.next()

  const lang = pathParts[0]
  if (!VALID_LANGS.has(lang)) return context.next()

  // /:lang/ → redirect to homepage
  if (pathParts.length === 1) {
    const response = Response.redirect(new URL('/', url.origin).toString(), 302)
    response.headers.append(
      'Set-Cookie',
      `preferred-language=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`
    )
    return response
  }

  // /:lang/games/:slug/ → redirect to game page
  if (pathParts.length >= 3 && pathParts[1] === 'games') {
    const slug = pathParts[2]
    const redirectUrl = new URL(`/games/${slug}/`, url.origin)
    const response = Response.redirect(redirectUrl.toString(), 302)
    response.headers.append(
      'Set-Cookie',
      `preferred-language=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`
    )
    return response
  }

  // /:lang/stories/:slug/ → redirect to story page
  if (pathParts.length >= 3 && pathParts[1] === 'stories') {
    const slug = pathParts[2]
    const redirectUrl = new URL(`/stories/${slug}/`, url.origin)
    const response = Response.redirect(redirectUrl.toString(), 302)
    response.headers.append(
      'Set-Cookie',
      `preferred-language=${lang}; Path=/; Max-Age=31536000; SameSite=Lax`
    )
    return response
  }

  return context.next()
}
