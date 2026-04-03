import { defineMiddleware } from 'astro:middleware'
import { getLanguageFromCookie, type Lang } from './utils/i18n'

const validLangs = ['en', 'fr', 'de', 'es', 'ru', 'ja', 'zh-TW', 'zh-CN']
const defaultLang = 'en'

export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url

  // Handle ?lang= parameter redirects (old URL format to new /lang/ prefix)
  const langParam = url.searchParams.get('lang')
  if (langParam && validLangs.includes(langParam)) {
    url.searchParams.delete('lang')

    // Set cookie for future visits
    context.cookies.set('preferred-language', langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax'
    })

    // Redirect to language-prefixed URL if not default
    if (langParam !== defaultLang) {
      const newPath = `/${langParam}${url.pathname}`
      return context.redirect(newPath + url.search, 301)
    }

    return context.redirect(url.pathname + url.search, 301)
  }

  // Check for language prefix in URL
  const pathParts = url.pathname.split('/').filter(Boolean)
  const firstSegment = pathParts[0]

  if (firstSegment && validLangs.includes(firstSegment)) {
    context.locals.lang = firstSegment as Lang
  } else {
    // Try cookie first, then default
    const cookieLang = getLanguageFromCookie(context.request.headers.get('cookie'))
    context.locals.lang = cookieLang || defaultLang
  }

  return next()
})

// Declare locals type
declare global {
  namespace App {
    interface Locals {
      lang: Lang
    }
  }
}
