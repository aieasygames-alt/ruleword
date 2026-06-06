import { useReducer, useEffect, useCallback, useRef } from 'react'
import type { StoryTemplate, StoryState, StoryAction, StoryNode, StoryEndingResult } from '../../types'
import { fetchStoryNode, fetchStoryEnding } from '../../utils/aiClient'
import { buildInitialStoryState, saveStoryState, loadStoryState, clearStoryState, getFallbackNode } from '../../utils/storyTemplates'
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
  const template: StoryTemplate = JSON.parse(templateJson)
  const [state, dispatch] = useReducer(storyReducer, null, () => buildInitialStoryState(template))
  const typingDoneRef = useRef(true)

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

  const handleStart = useCallback(() => {
    dispatch({ type: 'START', template })
  }, [template])

  const handleChoice = useCallback(async (choiceId: string) => {
    dispatch({ type: 'MAKE_CHOICE', choiceId })

    const node: StoryNode | null = await fetchStoryNode({
      templateId: template.id,
      currentChapter: state.currentChapterId,
      turnInChapter: state.turnNumber,
      userChoice: choiceId,
      storyContext: {
        chapterIndex: state.currentChapterIndex,
        historyLength: state.history.length,
        metadata: state.metadata,
      },
      language: settings.language === 'zh-CN' ? 'zh' : 'en',
    })

    if (node) {
      dispatch({ type: 'RECEIVE_NODE', node })

      if (node.isChapterEnd && !node.nextChapter) {
        const ending: StoryEndingResult | null = await fetchStoryEnding({
          templateId: template.id,
          storyContext: { metadata: state.metadata, history: state.history },
          language: settings.language === 'zh-CN' ? 'zh' : 'en',
        })
        if (ending) {
          dispatch({ type: 'REACH_ENDING', ending })
        }
      }
    } else {
      const fallback = getFallbackNode(template, state.currentChapterId, state.turnNumber)
      if (fallback) {
        dispatch({ type: 'RECEIVE_NODE', node: fallback })
      } else {
        dispatch({ type: 'ERROR', error: 'Failed to get story content. Please try again.' })
      }
    }
  }, [template, state, settings.language])

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

  // Idle screen — start button
  if (state.phase === 'idle') {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700 shrink-0">
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
              {template.storySkeleton.characters.map(char => (
                <div key={char.id} className="bg-slate-800/60 rounded-xl p-3 text-center border border-slate-700/50">
                  <div className="text-lg font-semibold text-white">{char.name}</div>
                  <div className="text-xs text-pink-400 mt-0.5">{char.relationship}</div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">{char.personality.split(',')[0]}</div>
                </div>
              ))}
            </div>
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl font-medium transition-colors text-lg shadow-lg shadow-pink-500/20"
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
      <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
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
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Main game UI
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700 shrink-0 max-w-3xl mx-auto w-full">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Back
        </button>
        <h1 className="text-sm font-medium text-white truncate mx-4">{template.en.name}</h1>
        <span className="text-xs text-slate-500">
          Ch.{state.currentChapterIndex + 1}/{template.storySkeleton.chapters.length}
        </span>
      </div>

      {/* Stats */}
      {template.uiConfig.showStats && (
        <div className="max-w-3xl mx-auto w-full">
          <StatsBar stats={template.uiConfig.stats} metadata={state.metadata} />
        </div>
      )}

      {/* Story content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full">
          <StoryRenderer history={state.history} isLatest={state.phase === 'playing'} />
        </div>
      </div>

      {/* Choices */}
      {(state.phase === 'playing' || state.phase === 'intro') && (
        <div className="max-w-3xl mx-auto w-full shrink-0">
          <ChoicePanel
            choices={state.choices}
            disabled={state.phase !== 'playing' && state.phase !== 'intro'}
            onSelect={handleChoice}
          />
        </div>
      )}

      {/* Loading state */}
      {state.phase === 'loading' && (
        <div className="px-4 pb-4 max-w-3xl mx-auto w-full shrink-0">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-700/40 rounded-xl">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-slate-400">Thinking...</span>
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
          onShare={handleShare}
          onReplay={handleReplay}
        />
      )}
    </div>
  )
}
