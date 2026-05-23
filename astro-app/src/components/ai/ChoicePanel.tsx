interface ChoicePanelProps {
  choices: Array<{ id: string; text: string }>
  disabled: boolean
  onSelect: (choiceId: string) => void
}

export default function ChoicePanel({ choices, disabled, onSelect }: ChoicePanelProps) {
  return (
    <div className="px-4 pb-4 pt-2 space-y-2">
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice.id)}
          disabled={disabled}
          className={`
            w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pink-400/50
            ${disabled
              ? 'bg-slate-700/40 text-slate-500 cursor-not-allowed'
              : 'bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 hover:text-white active:scale-[0.98]'
            }
          `}
          tabIndex={disabled ? -1 : index + 1}
          aria-label={`Choice ${index + 1}: ${choice.text}`}
        >
          <span className="text-pink-400/60 mr-2 text-xs font-mono">{index + 1}.</span>
          {choice.text}
        </button>
      ))}
      {disabled && (
        <div className="flex items-center justify-center py-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  )
}
