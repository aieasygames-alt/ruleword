import { useEffect, useMemo, useState } from 'react'

type StorySummary = {
  slug: string
  name: string
  icon: string
  color: string
  endings: number
  chapters: number
}

type SavedStoryState = {
  phase: string
  currentChapterIndex: number
  history: Array<{ text: string }>
}

type SavedStoryProgress = {
  unlockedEndings?: Array<{ id: string; title: string }>
  completedRuns?: number
  bestChapterIndex?: number
  lastPlayedAt?: string
}

type ProgressCard = StorySummary & {
  currentChapterIndex: number
  historyLength: number
  unlockedEndings: number
  completedRuns: number
  lastPlayedAt: string
}

interface StoriesProgressShelfProps {
  stories: StorySummary[]
}

const stateKey = (slug: string) => `ruleword_story_${slug}`
const progressKey = (slug: string) => `ruleword_story_progress_${slug}`

export default function StoriesProgressShelf({ stories }: StoriesProgressShelfProps) {
  const [cards, setCards] = useState<ProgressCard[]>([])

  useEffect(() => {
    const nextCards = stories.flatMap(story => {
      try {
        const savedStateRaw = localStorage.getItem(stateKey(story.slug))
        const progressRaw = localStorage.getItem(progressKey(story.slug))
        const savedState = savedStateRaw ? JSON.parse(savedStateRaw) as SavedStoryState : null
        const progress = progressRaw ? JSON.parse(progressRaw) as SavedStoryProgress : null
        const hasState = savedState && savedState.phase !== 'idle' && savedState.history.length > 0
        const hasProgress = progress && ((progress.unlockedEndings?.length ?? 0) > 0 || (progress.completedRuns ?? 0) > 0)
        if (!hasState && !hasProgress) return []

        return [{
          ...story,
          currentChapterIndex: savedState?.currentChapterIndex ?? progress?.bestChapterIndex ?? 0,
          historyLength: savedState?.history.length ?? 0,
          unlockedEndings: progress?.unlockedEndings?.length ?? 0,
          completedRuns: progress?.completedRuns ?? 0,
          lastPlayedAt: progress?.lastPlayedAt ?? '',
        }]
      } catch {
        return []
      }
    })

    nextCards.sort((a, b) => (b.lastPlayedAt || '').localeCompare(a.lastPlayedAt || ''))
    setCards(nextCards.slice(0, 4))
  }, [stories])

  const totalUnlocked = useMemo(() => cards.reduce((sum, card) => sum + card.unlockedEndings, 0), [cards])

  if (cards.length === 0) return null

  return (
    <section className="border-y border-slate-800 bg-slate-900/50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Continue Your Stories</h2>
            <p className="text-sm text-slate-400">Resume saved adventures and chase the endings you have not found yet.</p>
          </div>
          <div className="hidden rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-right sm:block">
            <div className="text-lg font-bold text-pink-300">{totalUnlocked}</div>
            <div className="text-xs text-slate-500">endings unlocked</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(card => (
            <a
              key={card.slug}
              href={`/stories/${card.slug}/`}
              className="group overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/70 transition-colors hover:border-pink-500/60"
            >
              <div className={`h-1 bg-gradient-to-r ${card.color}`} />
              <div className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{card.icon}</span>
                  <h3 className="line-clamp-1 font-semibold text-white group-hover:text-pink-300">{card.name}</h3>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className={`h-full bg-gradient-to-r ${card.color}`}
                    style={{ width: `${Math.min(100, ((card.currentChapterIndex + 1) / card.chapters) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Ch.{Math.min(card.currentChapterIndex + 1, card.chapters)}/{card.chapters}</span>
                  <span>{card.unlockedEndings}/{card.endings} endings</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
