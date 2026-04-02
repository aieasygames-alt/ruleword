import { getSeoH1 } from '../utils/seo'

type GameHeaderProps = {
  gameName: string
  gameNameZh: string
  language: 'en' | 'zh'
  icon?: string
  onBack?: () => void
  showBackButton?: boolean
  rightContent?: React.ReactNode
  className?: string
}

/**
 * SEO-optimized game page header component
 * H1 is formatted as "Play [Game] Online Free" for SEO
 */
export default function GameHeader({
  gameName,
  gameNameZh,
  language,
  icon,
  onBack,
  showBackButton = true,
  rightContent,
  className = ''
}: GameHeaderProps) {
  const seoTitle = getSeoH1(gameName, gameNameZh, language)

  return (
    <div className={`flex items-center justify-between border-b border-gray-700 pb-3 mb-4 ${className}`}>
      {/* Left side - Back button */}
      <div className="flex items-center gap-2">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded"
            title={language === 'zh' ? '返回菜单' : 'Back to menu'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Center - SEO-optimized H1 */}
      <h1 className="text-lg font-bold tracking-wider flex items-center gap-2">
        {icon && <span className="text-xl">{icon}</span>}
        <span className="sr-only">{seoTitle}</span>
        <span aria-hidden="true">{language === 'zh' ? gameNameZh : gameName}</span>
      </h1>

      {/* Right side - Additional content */}
      <div className="flex items-center gap-2">
        {rightContent}
      </div>
    </div>
  )
}

/**
 * Hook to get SEO-friendly page title for game pages
 * Use this in conjunction with usePageMeta
 */
export function useSeoGameTitle(
  gameId: string,
  gameName: string,
  gameNameZh: string,
  language: 'en' | 'zh'
): string {
  return getSeoH1(gameName, gameNameZh, language)
}
