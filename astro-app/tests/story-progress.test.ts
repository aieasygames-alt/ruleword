import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildInitialStoryState,
  loadStoryProgress,
  recordStoryProgress,
} from '../src/utils/storyTemplates'
import type { StoryTemplate } from '../src/types'

const template: StoryTemplate = {
  id: 'test-story',
  slug: 'test-story',
  icon: 'T',
  templateType: 'open-adventure',
  color: 'from-blue-500 to-cyan-500',
  aiModel: 'test',
  systemPrompt: { en: 'test' },
  storySkeleton: {
    setting: 'test',
    characters: [],
    opening: 'open',
    chapters: [{ id: 'ch1', goal: 'go', minTurns: 1, maxTurns: 1, fallbackTexts: ['next'], fallbackChoices: [[{ id: 'a', text: 'A' }]] }],
    endings: [
      { id: 'good', condition: 'good', title: 'Good Ending', description: 'good' },
      { id: 'bad', condition: 'bad', title: 'Bad Ending', description: 'bad' },
    ],
    maxTotalTurns: 2,
  },
  uiConfig: { showStats: true, stats: [{ id: 'courage', label: 'Courage', icon: 'C', initialValue: 50 }], theme: 'fantasy' },
  en: { name: 'Test', desc: 'desc', description: 'description', howToPlay: 'play' },
}

describe('story progress', () => {
  beforeEach(() => localStorage.clear())

  it('loads empty progress by default', () => {
    const progress = loadStoryProgress('test-story')
    expect(progress.unlockedEndings).toEqual([])
    expect(progress.completedRuns).toBe(0)
  })

  it('normalizes older stored progress records', () => {
    vi.mocked(localStorage.getItem).mockReturnValueOnce(JSON.stringify({
      templateId: 'test-story',
      unlockedEndings: [{ id: 'good', title: 'Good Ending', unlockedAt: '2026-08-16T00:00:00.000Z' }],
    }))

    const progress = loadStoryProgress('test-story')
    expect(progress.unlockedEndings).toHaveLength(1)
    expect(progress.completedRuns).toBe(0)
    expect(progress.recordedEndingKeys).toEqual([])
    expect(progress.bestChapterIndex).toBe(0)
    expect(progress.lastPlayedAt).toBe('1970-01-01T00:00:00.000Z')
  })

  it('records best chapter and unlocked endings', () => {
    const state = {
      ...buildInitialStoryState(template),
      phase: 'ended' as const,
      currentChapterIndex: 1,
      ending: {
        endingId: 'good',
        title: 'Good Ending',
        description: 'good',
        shareText: 'share',
      },
    }

    const first = recordStoryProgress(template.id, state)
    const duplicate = recordStoryProgress(template.id, state)

    expect(first.bestChapterIndex).toBe(1)
    expect(duplicate.completedRuns).toBe(1)
    expect(duplicate.unlockedEndings).toHaveLength(1)
    expect(duplicate.unlockedEndings[0].title).toBe('Good Ending')
  })
})
