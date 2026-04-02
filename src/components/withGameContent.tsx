/**
 * Example: How to integrate GameContent component into existing game pages
 *
 * This file shows the pattern for adding SEO-optimized content to game components.
 * Copy this pattern to your game components.
 */

import { useState } from 'react'
import GameContent, { type GameContentData } from './GameContent'
import { getGameContent } from '../data/gameContent'

/**
 * Hook to get game content and handle expansion state
 * Use this in your game component
 */
export function useGameContent(gameId: string, language: 'en' | 'zh') {
  const [showContent, setShowContent] = useState(false)
  const content = getGameContent(gameId)

  return {
    content,
    showContent,
    toggleContent: () => setShowContent(!showContent),
    hasContent: !!content
  }
}

/**
 * Example integration for Sudoku component
 *
 * Add this to your game component's return statement:
 */

/*
// In your game component (e.g., Sudoku.tsx):

import { useGameContent } from './components/withGameContent'
import GameContent from './components/GameContent'
import { usePageMeta } from './hooks/usePageMeta'

// Inside the component:
const { content, showContent, toggleContent, hasContent } = useGameContent('sudoku', settings.language)

// Call usePageMeta for SEO
usePageMeta('sudoku', settings.language)

// In the JSX, add after the game board:
{hasContent && (
  <div className="mt-6 w-full max-w-md">
    <button
      onClick={toggleContent}
      className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
        settings.darkMode
          ? 'bg-slate-700 hover:bg-slate-600 text-white'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
      }`}
    >
      {showContent
        ? (settings.language === 'zh' ? '隐藏游戏指南' : 'Hide Game Guide')
        : (settings.language === 'zh' ? '显示游戏指南' : 'Show Game Guide')
      }
    </button>

    {showContent && (
      <div className="mt-4">
        <GameContent
          gameContent={content!}
          language={settings.language}
          gameName="Sudoku"
          gameNameZh="数独"
          isDarkMode={settings.darkMode}
          defaultExpanded={false}
        />
      </div>
    )}
  </div>
)}
*/

/**
 * Complete example for a minimal game page with SEO content:
 */

type MinimalGamePageProps = {
  settings: {
    darkMode: boolean
    language: 'en' | 'zh'
  }
  onBack: () => void
}

export function MinimalGamePageExample({ settings, onBack }: MinimalGamePageProps) {
  const { content, showContent, toggleContent, hasContent } = useGameContent('sudoku', settings.language)

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${
      settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      {/* Header */}
      <div className="w-full max-w-md mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-slate-700">
            ← Back
          </button>
          <h1 className="text-xl font-bold">
            {settings.language === 'zh' ? '数独' : 'Sudoku'}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Game Board Area - Your actual game component goes here */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">
          [Your Game Component Here]
        </div>
      </div>

      {/* SEO Content Section - Add after game board */}
      {hasContent && (
        <div className="mt-6 w-full max-w-md">
          <button
            onClick={toggleContent}
            className={`w-full py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
              settings.darkMode
                ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {showContent
              ? (settings.language === 'zh' ? '隐藏详细指南' : 'Hide Detailed Guide')
              : (settings.language === 'zh' ? '查看游戏规则与技巧' : 'View Rules & Tips')
            }
          </button>

          {showContent && (
            <div className="mt-4">
              <GameContent
                gameContent={content!}
                language={settings.language}
                gameName="Sudoku"
                gameNameZh="数独"
                isDarkMode={settings.darkMode}
                defaultExpanded={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MinimalGamePageExample
