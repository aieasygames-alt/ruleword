import { useReducer, useEffect, useCallback, useRef, useState, useMemo } from 'react'
import type { StoryTemplate, StoryState, StoryAction, StoryNode, StoryEndingResult } from '../../types'
import { fetchStoryNode, fetchStoryEnding } from '../../utils/aiClient'
import { buildInitialStoryState, saveStoryState, loadStoryState, clearStoryState, getFallbackNode } from '../../utils/storyTemplates'
import { getThemeConfig } from '../../utils/storyThemes'
import StoryRenderer from './StoryRenderer'
import ChoicePanel from './ChoicePanel'
import StatsBar from './StatsBar'
import StoryEndScreen from './StoryEndScreen'

interface AIStoryGameProps {
  template: string
  settings: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh-CN' }
  onBack: () => void
  onShare?: (data: { result: string; score?: number; storyTitle?: string; storyDesc?: string; storySlug?: string }) => void
  gameId?: string
  gameSlug?: string
  gameName?: string
}

interface ChapterTransition {
  title: string
  goal: string
  index: number
}

function storyReducer(state: StoryState, action: StoryAction): StoryState {
  switch (action.type) {
    case 'START': {
      const initial = buildInitialStoryState(action.template)
      return {
        ...initial,
        phase: 'intro',
        history: [{ text: action.template.storySkeleton.opening }],
        choices: action.template.storySkeleton.chapters[0]?.fallbackChoices[0] || [],
      }
    }
    case 'MAKE_CHOICE':
      return { ...state, phase: 'loading' }
    case 'RECEIVE_NODE': {
      const node = action.node
      const newMetadata = { ...state.metadata }
      if (node.metadataUpdate) {
        for (const [key, value] of Object.entries(node.metadataUpdate)) {
          newMetadata[key] = (newMetadata[key] || 0) + value
        }
      }

      const nextChapterIndex = node.isChapterEnd && node.nextChapter
        ? state.currentChapterIndex + 1
        : state.currentChapterIndex

      const nextChapterId = node.isChapterEnd && node.nextChapter
        ? node.nextChapter
        : state.currentChapterId

      return {
        ...state,
        phase: 'playing',
        history: [
          ...state.history,
          {
            text: node.nodeText,
            speaker: node.speaker,
            emotion: node.emotion,
          },
        ],
        choices: node.choices,
        metadata: newMetadata,
        currentChapterId: nextChapterId,
        currentChapterIndex: nextChapterIndex,
        turnNumber: state.turnNumber + 1,
      }
    }
    case 'REACH_ENDING':
      return {
        ...state,
        phase: 'ended',
        ending: {
          title: action.ending.title,
          description: action.ending.description,
          shareText: action.ending.shareText,
        },
      }
    case 'ERROR':
      return { ...state, phase: 'error', error: action.error }
    case 'RESTORE':
      return { ...action.savedState, phase: action.savedState.phase === 'loading' ? 'playing' : action.savedState.phase }
    case 'RESET': {
      return { ...state, phase: 'idle', history: [], choices: [], ending: undefined, error: undefined, turnNumber: 0 }
    }
    default:
      return state
  }
}

export default function AIStoryGame({ template: templateJson, settings: rawSettings, onBack, onShare, gameSlug }: AIStoryGameProps) {
  const settings = rawSettings || { darkMode: true, soundEnabled: true, language: 'en' as const }
  let template: StoryTemplate
  try {
    template = JSON.parse(templateJson)
  } catch {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 items-center justify-center p-6 text-center space-y-4">
        <div className="text-4xl">😵</div>
        <p className="text-slate-400 text-sm">Failed to load story template.</p>
      </div>
    )
  }

  const theme = getThemeConfig(template.uiConfig.theme)
  const [state, dispatch] = useReducer(storyReducer, null, () => buildInitialStoryState(template))
  const typingDoneRef = useRef(true)
  const stateRef = useRef(state)
  stateRef.current = state
  const prevChapterIndexRef = useRef(state.currentChapterIndex)
  const [chapterTransition, setChapterTransition] = useState<ChapterTransition | null>(null)
  const chapterTimerRef = useRef<ReturnType<typeof setTimeout>>()

  // Progress calculation
  const totalChapters = template.storySkeleton.chapters.length
  const currentChapter = template.storySkeleton.chapters[state.currentChapterIndex]
  const turnInChapter = state.turnNumber
  const maxTurnsInChapter = currentChapter?.maxTurns || 10
  const chapterProgress = totalChapters > 1
    ? (state.currentChapterIndex + Math.min(turnInChapter / maxTurnsInChapter, 1)) / totalChapters
    : Math.min(turnInChapter / (template.storySkeleton.maxTotalTurns || 30), 1)
  const progressPercent = Math.min(Math.round(chapterProgress * 100), 100)

  useEffect(() => {
    const saved = loadStoryState(template.id)
    if (saved && saved.phase !== 'idle' && saved.history.length > 0) {
      dispatch({ type: 'RESTORE', savedState: saved })
    }
  }, [template.id])

  useEffect(() => {
    if (state.phase !== 'idle' && state.phase !== 'loading') {
      saveStoryState(template.id, state)
    }
  }, [state, template.id])

  // Detect chapter transitions
  useEffect(() => {
    if (state.currentChapterIndex > prevChapterIndexRef.current && state.currentChapterIndex < totalChapters) {
      const chapter = template.storySkeleton.chapters[state.currentChapterIndex]
      if (chapter) {
        setChapterTransition({
          title: chapter.title || `Chapter ${state.currentChapterIndex + 1}`,
          goal: chapter.goal,
          index: state.currentChapterIndex,
        })
        clearTimeout(chapterTimerRef.current)
        chapterTimerRef.current = setTimeout(() => setChapterTransition(null), 2500)
      }
    }
    prevChapterIndexRef.current = state.currentChapterIndex
    return () => clearTimeout(chapterTimerRef.current)
  }, [state.currentChapterIndex, totalChapters, template.storySkeleton.chapters])

  const handleStart = useCallback(() => {
    dispatch({ type: 'START', template })
  }, [template])

  const handleChoice = useCallback(async (choiceId: string) => {
    const currentState = stateRef.current
    dispatch({ type: 'MAKE_CHOICE', choiceId })

    const node: StoryNode | null = await fetchStoryNode({
      templateId: template.id,
      currentChapter: currentState.currentChapterId,
      turnInChapter: currentState.turnNumber,
      userChoice: choiceId,
      storyContext: {
        chapterIndex: currentState.currentChapterIndex,
        historyLength: currentState.history.length,
        metadata: currentState.metadata,
      },
      language: settings.language === 'zh-CN' ? 'zh' : 'en',
    })

    if (node) {
      dispatch({ type: 'RECEIVE_NODE', node })

      if (node.isChapterEnd && !node.nextChapter) {
        const latestState = stateRef.current
        const ending: StoryEndingResult | null = await fetchStoryEnding({
          templateId: template.id,
          storyContext: { metadata: latestState.metadata, history: latestState.history },
          language: settings.language === 'zh-CN' ? 'zh' : 'en',
        })
        if (ending) {
          dispatch({ type: 'REACH_ENDING', ending })
        }
      }
    } else {
      const fallback = getFallbackNode(template, currentState.currentChapterId, currentState.turnNumber)
      if (fallback) {
        dispatch({ type: 'RECEIVE_NODE', node: fallback })
      } else {
        dispatch({ type: 'ERROR', error: 'Failed to get story content. Please try again.' })
      }
    }
  }, [template, settings.language])

  const handleReplay = useCallback(() => {
    clearStoryState(template.id)
    dispatch({ type: 'RESET' })
  }, [template.id])

  const handleShare = useCallback(() => {
    if (onShare && state.ending) {
      onShare({
        result: state.ending.shareText || state.ending.title,
        storyTitle: state.ending.title,
        storyDesc: state.ending.description,
        storySlug: gameSlug,
      })
    }
  }, [onShare, state.ending, gameSlug])

  const handleTypingComplete = useCallback(() => {
    typingDoneRef.current = true
  }, [])

  // Keyboard shortcuts (1-4 for choices)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase !== 'playing' && state.phase !== 'intro') return
      const num = parseInt(e.key)
      if (num >= 1 && num <= state.choices.length) {
        e.preventDefault()
        handleChoice(state.choices[num - 1].id)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.phase, state.choices, handleChoice])

  // Characters for color mapping (memoized)
  const characters = useMemo(() => template.storySkeleton.characters, [template])

  // Idle screen — start button
  if (state.phase === 'idle') {
    return (
      <div className={`flex flex-col h-full ${theme.bgGradient}`}>
        <div className={`flex items-center justify-between px-4 py-3 ${theme.headerBg} border-b ${theme.headerBorder} shrink-0`}>
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Back
          </button>
          <h1 className="text-sm font-medium text-white truncate mx-4">{template.en.name}</h1>
          <div className="w-12" />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="text-6xl">{template.icon}</div>
            <h2 className="text-3xl font-bold text-white">{template.en.name}</h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed">{template.en.desc}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
              {characters.map(char => (
                <div key={char.id} className={`${theme.cardBg} rounded-xl p-3 text-center border border-slate-700/50`}>
                  <div className="text-lg font-semibold text-white">{char.name}</div>
                  {char.relationship && <div className={`text-xs ${theme.accent} mt-0.5`}>{char.relationship}</div>}
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">{char.personality.split(',')[0]}</div>
                </div>
              ))}
            </div>
            <button
              onClick={handleStart}
              className={`px-8 py-3 ${theme.primaryButton} ${theme.primaryButtonHover} text-white rounded-xl font-medium transition-colors text-lg shadow-lg ${theme.primaryShadow}`}
            >
              Start Story
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (state.phase === 'error') {
    return (
      <div className={`flex flex-col h-full ${theme.bgGradient}`}>
        <div className={`flex items-center justify-between px-4 py-3 ${theme.headerBg} border-b ${theme.headerBorder}`}>
          <button onClick={onBack} className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Back
          </button>
          <h1 className="text-sm font-medium text-white truncate mx-4">{template.en.name}</h1>
          <div className="w-12" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="text-4xl">😵</div>
          <p className="text-slate-400 text-sm">{state.error}</p>
          <button
            onClick={handleReplay}
            className={`px-6 py-2 ${theme.primaryButton} ${theme.primaryButtonHover} text-white rounded-xl text-sm transition-colors`}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Main game UI
  return (
    <div className={`flex flex-col h-full ${theme.bgGradient} relative`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${theme.headerBg} border-b ${theme.headerBorder} shrink-0 max-w-3xl mx-auto w-full`}>
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Back
        </button>
        <h1 className="text-sm font-medium text-white truncate mx-4">{template.en.name}</h1>
        <span className="text-xs text-slate-500">
          Ch.{state.currentChapterIndex + 1}/{totalChapters}
        </span>
      </div>

      {/* Progress bar */}
      {state.phase !== 'idle' && (
        <div className="h-0.5 bg-slate-800 shrink-0 max-w-3xl mx-auto w-full">
          <div
            className={`h-full bg-gradient-to-r ${template.color} transition-all duration-700 ease-out`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Stats */}
      {template.uiConfig.showStats && (
        <div className="max-w-3xl mx-auto w-full">
          <StatsBar
            stats={template.uiConfig.stats}
            metadata={state.metadata}
            theme={template.uiConfig.theme}
          />
        </div>
      )}

      {/* Story content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          <StoryRenderer
            history={state.history}
            isLatest={state.phase === 'playing'}
            characters={characters}
          />
        </div>
      </div>

      {/* Choices */}
      {(state.phase === 'playing' || state.phase === 'intro') && (
        <div className="max-w-3xl mx-auto w-full shrink-0">
          <ChoicePanel
            choices={state.choices}
            disabled={state.phase !== 'playing' && state.phase !== 'intro'}
            onSelect={handleChoice}
            theme={template.uiConfig.theme}
          />
        </div>
      )}

      {/* Loading state */}
      {state.phase === 'loading' && (
        <div className="px-4 pb-4 max-w-3xl mx-auto w-full shrink-0">
          <div className={`flex items-center gap-2 px-4 py-3 ${theme.cardBg} rounded-xl`}>
            <div className="flex gap-1">
              <span className={`w-2 h-2 ${theme.loadingDotColor} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
              <span className={`w-2 h-2 ${theme.loadingDotColor} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
              <span className={`w-2 h-2 ${theme.loadingDotColor} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-slate-400">{theme.loadingText}</span>
          </div>
        </div>
      )}

      {/* Chapter transition overlay */}
      {chapterTransition && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-fade-in cursor-pointer"
          onClick={() => {
            clearTimeout(chapterTimerRef.current)
            setChapterTransition(null)
          }}
        >
          <div className="text-center space-y-3 animate-slide-up">
            <div className={`text-sm font-medium ${theme.accent} uppercase tracking-wider`}>
              Chapter {chapterTransition.index + 1}
            </div>
            <h2 className="text-2xl font-bold text-white">{chapterTransition.title}</h2>
            <p className="text-slate-300 text-sm max-w-sm">{chapterTransition.goal}</p>
            <div className={`h-0.5 w-16 mx-auto bg-gradient-to-r ${template.color} rounded-full`} />
          </div>
        </div>
      )}

      {/* End screen overlay */}
      {state.phase === 'ended' && state.ending && (
        <StoryEndScreen
          ending={{
            endingId: '',
            title: state.ending.title,
            description: state.ending.description,
            summary: '',
            shareText: state.ending.shareText,
          }}
          metadata={state.metadata}
          stats={template.uiConfig.stats}
          themeConfig={theme}
          colorGradient={template.color}
          onShare={handleShare}
          onReplay={handleReplay}
        />
      )}
    </div>
  )
}
