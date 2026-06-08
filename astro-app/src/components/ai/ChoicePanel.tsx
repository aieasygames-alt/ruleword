import type { StoryTheme } from '../../types'
import { getThemeConfig } from '../../utils/storyThemes'

interface ChoicePanelProps {
  choices: Array<{ id: string; text: string }>
  disabled: boolean
  onSelect: (choiceId: string) => void
  theme: StoryTheme
}

const STAGGER_CLASSES = [
  'opacity-0 animate-slide-up',
  'opacity-0 animate-slide-up-delay-1',
  'opacity-0 animate-slide-up-delay-2',
  'opacity-0 animate-slide-up-delay-3',
]

export default function ChoicePanel({ choices, disabled, onSelect, theme }: ChoicePanelProps) {
  const themeConfig = getThemeConfig(theme)

  return (
    <div className="px-4 pb-4 pt-2 space-y-2">
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice.id)}
          disabled={disabled}
          className={`
            w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-white/20
            ${disabled
              ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
              : `${themeConfig.cardBg} ${themeConfig.cardBgHover} text-slate-200 hover:text-white active:scale-[0.98] ${STAGGER_CLASSES[index] || STAGGER_CLASSES[3]}`
            }
          `}
          tabIndex={disabled ? -1 : index + 1}
          aria-label={`Choice ${index + 1}: ${choice.text}`}
        >
          <span className={`${themeConfig.accent} mr-2 text-xs font-mono`}>{index + 1}.</span>
          {choice.text}
        </button>
      ))}
      {disabled && (
        <div className="flex items-center justify-center py-2">
          <div className="flex gap-1">
            <span className={`w-2 h-2 ${themeConfig.loadingDotColor} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
            <span className={`w-2 h-2 ${themeConfig.loadingDotColor} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
            <span className={`w-2 h-2 ${themeConfig.loadingDotColor} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  )
}
