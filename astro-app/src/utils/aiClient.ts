import type { StoryNode, StoryEndingResult } from '../types'

interface GenerateParams {
  templateId: string
  currentChapter: string
  turnInChapter: number
  userChoice: string
  storyContext: Record<string, unknown>
  language: string
}

interface EndingParams {
  templateId: string
  storyContext: Record<string, unknown>
  language: string
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timer)
  }
}

function validateNodeResponse(data: unknown): StoryNode | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>

  if (typeof obj.nodeText !== 'string' || !obj.nodeText.trim()) return null
  if (!Array.isArray(obj.choices) || obj.choices.length === 0) return null

  for (const choice of obj.choices) {
    if (!choice || typeof choice.id !== 'string' || typeof choice.text !== 'string') return null
  }

  return {
    nodeText: (obj.nodeText as string).slice(0, 500),
    speaker: typeof obj.speaker === 'string' ? obj.speaker : undefined,
    emotion: typeof obj.emotion === 'string' ? obj.emotion : undefined,
    choices: (obj.choices as Array<{ id: string; text: string }>).slice(0, 4),
    isChapterEnd: !!obj.isChapterEnd,
    nextChapter: typeof obj.nextChapter === 'string' ? obj.nextChapter : undefined,
    metadataUpdate: obj.metadataUpdate && typeof obj.metadataUpdate === 'object'
      ? obj.metadataUpdate as Record<string, number>
      : undefined,
  }
}

export async function fetchStoryNode(
  params: GenerateParams,
  retry = true,
): Promise<StoryNode | null> {
  try {
    const response = await fetchWithTimeout('/api/ai/story/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      if (retry) return fetchStoryNode(params, false)
      return null
    }

    const data = await response.json()
    return validateNodeResponse(data)
  } catch {
    if (retry) {
      await new Promise(r => setTimeout(r, 1000))
      return fetchStoryNode(params, false)
    }
    return null
  }
}

export async function fetchStoryEnding(
  params: EndingParams,
  retry = true,
): Promise<StoryEndingResult | null> {
  try {
    const response = await fetchWithTimeout('/api/ai/story/ending', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      if (retry) return fetchStoryEnding(params, false)
      return null
    }

    const data = await response.json()
    if (!data || typeof data !== 'object') return null

    return {
      endingId: data.endingId || 'unknown',
      title: data.title || 'The End',
      description: data.description || '',
      summary: data.summary || '',
      shareText: data.shareText || '',
    }
  } catch {
    if (retry) {
      await new Promise(r => setTimeout(r, 1000))
      return fetchStoryEnding(params, false)
    }
    return null
  }
}

export async function checkAIHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout('/api/ai/health', { method: 'GET' }, 3000)
    return response.ok
  } catch {
    return false
  }
}
