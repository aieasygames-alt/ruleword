// Cloudflare Pages Function - AI API Health Check

export const onRequestGet: PagesFunction = async (context) => {
  const { env } = context

  const hasCredentials = !!(env.CF_ACCOUNT_ID && env.CF_API_TOKEN)

  return new Response(JSON.stringify({
    status: 'ok',
    mode: hasCredentials ? 'ai' : 'mock',
    model: '@cf/meta/llama-3.1-8b-instruct',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
