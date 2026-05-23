import type { StoryTemplate, StoryState, StoryNode, StoryChapter } from '../types'

export function getFallbackNode(
  template: StoryTemplate,
  chapterId: string,
  turnInChapter: number,
): StoryNode | null {
  const chapter = template.storySkeleton.chapters.find(c => c.id === chapterId)
  if (!chapter) return null

  const textIndex = Math.min(turnInChapter, chapter.fallbackTexts.length - 1)
  const choiceIndex = Math.min(turnInChapter, chapter.fallbackChoices.length - 1)

  const text = chapter.fallbackTexts[textIndex] || template.storySkeleton.opening
  const choices = chapter.fallbackChoices[choiceIndex] || [{ id: 'continue', text: 'Continue...' }]

  const isLastTurn = turnInChapter >= chapter.minTurns - 1
  const chapterIndex = template.storySkeleton.chapters.findIndex(c => c.id === chapterId)
  const nextChapter = template.storySkeleton.chapters[chapterIndex + 1]

  return {
    nodeText: text,
    choices,
    isChapterEnd: isLastTurn,
    nextChapter: isLastTurn && nextChapter ? nextChapter.id : undefined,
    emotion: 'neutral',
  }
}

export function buildInitialStoryState(template: StoryTemplate): StoryState {
  const initialMetadata: Record<string, number> = {}
  for (const stat of template.uiConfig.stats) {
    initialMetadata[stat.id] = stat.initialValue
  }

  const firstChapter = template.storySkeleton.chapters[0]

  return {
    phase: 'idle',
    currentChapterId: firstChapter?.id || 'ch1',
    currentChapterIndex: 0,
    turnNumber: 0,
    history: [],
    choices: [],
    metadata: initialMetadata,
  }
}

export function getChapterByIndex(template: StoryTemplate, index: number): StoryChapter | null {
  return template.storySkeleton.chapters[index] || null
}

export function isStoryComplete(template: StoryTemplate, state: StoryState): boolean {
  const lastChapterIndex = template.storySkeleton.chapters.length - 1
  return state.currentChapterIndex >= lastChapterIndex && state.turnNumber >= template.storySkeleton.maxTotalTurns
}

const STORAGE_PREFIX = 'ruleword_story_'

export function saveStoryState(templateId: string, state: StoryState): void {
  try {
    const key = `${STORAGE_PREFIX}${templateId}`
    localStorage.setItem(key, JSON.stringify(state))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function loadStoryState(templateId: string): StoryState | null {
  try {
    const key = `${STORAGE_PREFIX}${templateId}`
    const saved = localStorage.getItem(key)
    if (!saved) return null
    return JSON.parse(saved) as StoryState
  } catch {
    return null
  }
}

export function clearStoryState(templateId: string): void {
  try {
    const key = `${STORAGE_PREFIX}${templateId}`
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
