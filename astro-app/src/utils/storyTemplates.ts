import type { StoryTemplate, StoryState, StoryNode, StoryChapter } from '../types'

export interface StoryProgress {
  templateId: string
  unlockedEndings: Array<{ id: string; title: string; unlockedAt: string }>
  completedRuns: number
  recordedEndingKeys: string[]
  bestChapterIndex: number
  lastPlayedAt: string
}

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
const PROGRESS_PREFIX = 'ruleword_story_progress_'

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

export function loadStoryProgress(templateId: string): StoryProgress {
  try {
    const saved = localStorage.getItem(`${PROGRESS_PREFIX}${templateId}`)
    if (saved) {
      const progress = JSON.parse(saved) as StoryProgress
      return {
        ...progress,
        unlockedEndings: progress.unlockedEndings ?? [],
        completedRuns: progress.completedRuns ?? 0,
        recordedEndingKeys: progress.recordedEndingKeys ?? [],
        bestChapterIndex: progress.bestChapterIndex ?? 0,
        lastPlayedAt: progress.lastPlayedAt ?? new Date(0).toISOString(),
      }
    }
  } catch {
    // ignore corrupt progress
  }

  return {
    templateId,
    unlockedEndings: [],
    completedRuns: 0,
    recordedEndingKeys: [],
    bestChapterIndex: 0,
    lastPlayedAt: new Date(0).toISOString(),
  }
}

export function saveStoryProgress(progress: StoryProgress): void {
  try {
    localStorage.setItem(`${PROGRESS_PREFIX}${progress.templateId}`, JSON.stringify(progress))
  } catch {
    // localStorage may be unavailable
  }
}

export function recordStoryProgress(templateId: string, state: StoryState): StoryProgress {
  const progress = loadStoryProgress(templateId)
  progress.lastPlayedAt = new Date().toISOString()
  progress.bestChapterIndex = Math.max(progress.bestChapterIndex, state.currentChapterIndex)

  if (state.phase === 'ended' && state.ending) {
    const endingId = state.ending.endingId || state.ending.title
    const firstHistoryText = state.history[0]?.text ?? ''
    const lastHistoryText = state.history[state.history.length - 1]?.text ?? ''
    const endingKey = `${endingId}:${state.history.length}:${state.turnNumber}:${firstHistoryText}:${lastHistoryText}`
    if (!progress.recordedEndingKeys.includes(endingKey)) {
      progress.completedRuns += 1
      progress.recordedEndingKeys.push(endingKey)
    }
    if (!progress.unlockedEndings.some(ending => ending.id === endingId)) {
      progress.unlockedEndings.push({
        id: endingId,
        title: state.ending.title,
        unlockedAt: new Date().toISOString(),
      })
    }
  }

  saveStoryProgress(progress)
  return progress
}
