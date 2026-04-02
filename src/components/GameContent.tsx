import { useState } from 'react'

/**
 * Game content data structure for SEO-optimized game pages
 */
export type GameContentData = {
  // About section
  about: {
    en: string
    zh: string
  }
  // History/background (optional)
  history?: {
    en: string
    zh: string
  }
  // How to play section - can be array of steps or single paragraph
  howToPlay: {
    en: string | string[]
    zh: string | string[]
  }
  // Tips & Strategies
  tips: {
    en: string[]
    zh: string[]
  }
  // FAQ section
  faq: Array<{
    question: { en: string; zh: string }
    answer: { en: string; zh: string }
  }>
  // Related game IDs
  relatedGames?: string[]
}

type GameContentProps = {
  gameContent: GameContentData
  language: 'en' | 'zh'
  gameName: string
  gameNameZh: string
  isDarkMode?: boolean
  className?: string
  defaultExpanded?: boolean
}

/**
 * SEO-optimized game content component
 * Includes About, How to Play, Tips, FAQ, and Related Games sections
 * Total content aims for 800-1500 words per game page
 */
export default function GameContent({
  gameContent,
  language,
  gameName,
  gameNameZh,
  isDarkMode = true,
  className = '',
  defaultExpanded = false
}: GameContentProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    about: defaultExpanded,
    howToPlay: defaultExpanded,
    tips: defaultExpanded,
    faq: defaultExpanded
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const textClass = isDarkMode ? 'text-gray-300' : 'text-gray-600'
  const headingClass = isDarkMode ? 'text-white' : 'text-gray-900'
  const cardClass = isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'
  const borderClass = isDarkMode ? 'border-slate-700' : 'border-gray-200'

  const displayName = language === 'zh' ? gameNameZh : gameName

  const renderContent = () => (
    <div className={`space-y-6 ${className}`}>
      {/* About Section */}
      <section>
        <button
          onClick={() => toggleSection('about')}
          className={`w-full flex items-center justify-between p-4 rounded-lg ${cardClass} border ${borderClass}`}
        >
          <h2 className={`text-lg font-semibold ${headingClass}`}>
            {language === 'zh' ? `关于${gameNameZh}` : `About ${gameName}`}
          </h2>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.about ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.about && (
          <div className={`mt-3 p-4 rounded-lg ${cardClass} border ${borderClass}`}>
            <p className={textClass}>{gameContent.about[language]}</p>
            {gameContent.history && (
              <p className={`mt-3 ${textClass}`}>{gameContent.history[language]}</p>
            )}
          </div>
        )}
      </section>

      {/* How to Play Section */}
      <section>
        <button
          onClick={() => toggleSection('howToPlay')}
          className={`w-full flex items-center justify-between p-4 rounded-lg ${cardClass} border ${borderClass}`}
        >
          <h2 className={`text-lg font-semibold ${headingClass}`}>
            {language === 'zh' ? '游戏玩法' : 'How to Play'}
          </h2>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.howToPlay ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.howToPlay && (
          <div className={`mt-3 p-4 rounded-lg ${cardClass} border ${borderClass}`}>
            {Array.isArray(gameContent.howToPlay[language]) ? (
              <ol className={`list-decimal list-inside space-y-2 ${textClass}`}>
                {(gameContent.howToPlay[language] as string[]).map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className={textClass}>{gameContent.howToPlay[language]}</p>
            )}
          </div>
        )}
      </section>

      {/* Tips & Strategies Section */}
      <section>
        <button
          onClick={() => toggleSection('tips')}
          className={`w-full flex items-center justify-between p-4 rounded-lg ${cardClass} border ${borderClass}`}
        >
          <h2 className={`text-lg font-semibold ${headingClass}`}>
            {language === 'zh' ? '技巧与策略' : 'Tips & Strategies'}
          </h2>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.tips ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.tips && (
          <div className={`mt-3 p-4 rounded-lg ${cardClass} border ${borderClass}`}>
            <ul className={`list-disc list-inside space-y-2 ${textClass}`}>
              {gameContent.tips[language].map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section>
        <button
          onClick={() => toggleSection('faq')}
          className={`w-full flex items-center justify-between p-4 rounded-lg ${cardClass} border ${borderClass}`}
        >
          <h2 className={`text-lg font-semibold ${headingClass}`}>
            {language === 'zh' ? '常见问题' : 'Frequently Asked Questions'}
          </h2>
          <svg
            className={`w-5 h-5 transition-transform ${expandedSections.faq ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.faq && (
          <div className={`mt-3 space-y-3`}>
            {gameContent.faq.map((item, index) => (
              <div key={index} className={`p-4 rounded-lg ${cardClass} border ${borderClass}`}>
                <h3 className={`font-medium ${headingClass} mb-2`}>
                  {item.question[language]}
                </h3>
                <p className={textClass}>{item.answer[language]}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )

  return renderContent()
}

/**
 * Generate FAQ Schema for a game
 */
export function generateFaqSchema(
  faq: Array<{
    question: { en: string; zh: string }
    answer: { en: string; zh: string }
  }>,
  language: 'en' | 'zh'
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(item => ({
      "@type": "Question",
      "name": item.question[language],
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer[language]
      }
    }))
  }
}
