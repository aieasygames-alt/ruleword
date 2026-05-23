// Cloudflare Pages Function - AI Story Generation API
// Returns AI-generated story content or mock data when AI is unavailable

interface StoryGenerateRequest {
  templateId: string
  currentChapter: string
  turnInChapter: number
  userChoice: string
  storyContext: Record<string, unknown>
  language: string
}

interface StoryEndingRequest {
  templateId: string
  storyContext: Record<string, unknown>
  language: string
}

export async function onRequestPost(context: {
  request: Request
  env: Record<string, string>
}) {
  const { request, env } = context
  const url = new URL(request.url)

  // Route: POST /api/ai/story/generate
  if (url.pathname.endsWith('/generate')) {
    return handleGenerate(request, env)
  }

  // Route: POST /api/ai/story/ending
  if (url.pathname.endsWith('/ending')) {
    return handleEnding(request, env)
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function handleGenerate(request: Request, env: Record<string, string>) {
  let body: StoryGenerateRequest
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!body.templateId || !body.language) {
    return new Response(JSON.stringify({ error: 'templateId and language are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // If AI credentials are available, try Workers AI first
  if (env.CF_ACCOUNT_ID && env.CF_API_TOKEN) {
    try {
      const aiResponse = await callWorkersAI(env, body)
      if (aiResponse) {
        return new Response(JSON.stringify(aiResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch {
      // Fall through to mock
    }
  }

  // Mock mode: return preset story data
  const { getMockStoryNode } = await import('./_shared')
  const mockNode = getMockStoryNode(
    body.templateId,
    body.currentChapter || 'ch1',
    body.turnInChapter || 0,
    body.userChoice || '',
    body.language,
  )

  return new Response(JSON.stringify(mockNode), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function handleEnding(request: Request, env: Record<string, string>) {
  let body: StoryEndingRequest
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!body.templateId) {
    return new Response(JSON.stringify({ error: 'templateId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // If AI credentials are available, try Workers AI first
  if (env.CF_ACCOUNT_ID && env.CF_API_TOKEN) {
    try {
      const aiResponse = await callWorkersAIEnding(env, body)
      if (aiResponse) {
        return new Response(JSON.stringify(aiResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch {
      // Fall through to mock
    }
  }

  // Mock mode
  const { getMockEnding } = await import('./_shared')
  const mockEnding = getMockEnding(body.templateId, body.storyContext, body.language || 'en')

  return new Response(JSON.stringify(mockEnding), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function callWorkersAI(
  env: Record<string, string>,
  body: StoryGenerateRequest,
): Promise<unknown | null> {
  const systemPrompt = `You are an interactive dating simulator narrator. Write in second person. Be engaging and emotionally resonant. Return ONLY valid JSON with: nodeText (string, max 300 chars), speaker (character name or omit), emotion (happy/sad/nervous/excited/angry/neutral), choices (array of 3 objects with id and text, max 60 chars each), isChapterEnd (boolean), metadataUpdate (object like {"affection-alex": 10}). Keep all content family-friendly.`

  const userPrompt = `Template: ${body.templateId}
Chapter: ${body.currentChapter}
Turn: ${body.turnInChapter}
User's last choice: ${body.userChoice}
Story context: ${JSON.stringify(body.storyContext).slice(0, 500)}
Language: ${body.language}

Generate the next story node as JSON.`

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    },
  )

  if (!response.ok) return null

  const data = await response.json() as { result?: { response?: string } }
  if (!data.result?.response) return null

  const { validateStoryResponse } = await import('./_shared')
  try {
    const raw = JSON.parse(data.result.response)
    return validateStoryResponse(raw)
  } catch {
    return null
  }
}

async function callWorkersAIEnding(
  env: Record<string, string>,
  body: StoryEndingRequest,
): Promise<unknown | null> {
  const systemPrompt = `You are a dating simulator narrator. Generate a story ending as JSON with: endingId (string), title (string), description (string, max 300 chars), summary (string, max 200 chars), shareText (string). Keep content family-friendly.`

  const userPrompt = `Template: ${body.templateId}
Story context: ${JSON.stringify(body.storyContext).slice(0, 800)}
Language: ${body.language}

Generate the story ending as JSON.`

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    },
  )

  if (!response.ok) return null

  const data = await response.json() as { result?: { response?: string } }
  if (!data.result?.response) return null

  try {
    return JSON.parse(data.result.response)
  } catch {
    return null
  }
}
