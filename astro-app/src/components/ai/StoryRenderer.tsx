import { useEffect, useRef, useMemo } from 'react'
import type { StoryHistoryEntry, StoryCharacter } from '../../types'
import { buildSpeakerColorMap, getSpeakerColor } from '../../utils/storyThemes'
import TypingEffect from './TypingEffect'

interface StoryRendererProps {
  history: StoryHistoryEntry[]
  isLatest: boolean
  characters: StoryCharacter[]
}

const emotionColors: Record<string, string> = {
  happy: 'text-yellow-300',
  sad: 'text-blue-300',
  nervous: 'text-purple-300',
  excited: 'text-pink-300',
  angry: 'text-red-300',
  neutral: 'text-slate-300',
}

const emotionEmoji: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  nervous: '😰',
  excited: '🤩',
  angry: '😤',
  neutral: '😐',
}

export default function StoryRenderer({ history, isLatest, characters }: StoryRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const nextColorIndex = useRef(0)

  const speakerColorMap = useMemo(() => {
    nextColorIndex.current = characters.length
    return buildSpeakerColorMap(characters)
  }, [characters])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history.length])

  return (
    <div ref={containerRef} className="px-4 py-6 space-y-4">
      {history.map((entry, index) => {
        const isLatestEntry = isLatest && index === history.length - 1
        const isDialogue = !!entry.speaker

        if (isDialogue && entry.speaker) {
          const colors = getSpeakerColor(entry.speaker, speakerColorMap, nextColorIndex)
          return (
            <div key={index} className="flex justify-start">
              <div className={`max-w-[85%] bg-slate-700/60 border-l-2 ${colors.border} rounded-2xl rounded-tl-sm px-4 py-3`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${colors.text}`}>{entry.speaker}</span>
                  {entry.emotion && (
                    <span className={`text-xs ${emotionColors[entry.emotion] || 'text-slate-400'}`}>
                      {emotionEmoji[entry.emotion] || ''}
                    </span>
                  )}
                </div>
                {isLatestEntry ? (
                  <TypingEffect text={entry.text} speed={20} className="text-slate-200 text-sm leading-relaxed" />
                ) : (
                  <p className="text-slate-200 text-sm leading-relaxed">{entry.text}</p>
                )}
              </div>
            </div>
          )
        }

        return (
          <div key={index} className="flex justify-center">
            <div className="max-w-[90%] text-center">
              {isLatestEntry ? (
                <TypingEffect text={entry.text} speed={15} className="text-slate-300 text-sm leading-relaxed italic" />
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed italic">{entry.text}</p>
              )}
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
