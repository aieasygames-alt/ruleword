import type { StoryEndingResult } from '../../types'

interface StoryEndScreenProps {
  ending: StoryEndingResult
  onShare: () => void
  onReplay: () => void
}

export default function StoryEndScreen({ ending, onShare, onReplay }: StoryEndScreenProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full text-center space-y-4 border border-slate-700">
        <div className="text-4xl">💕</div>
        <h2 className="text-2xl font-bold text-white">{ending.title}</h2>
        <p className="text-slate-300 text-sm leading-relaxed">{ending.description}</p>
        {ending.summary && (
          <p className="text-slate-400 text-xs italic">"{ending.summary}"</p>
        )}
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onShare}
            className="w-full px-4 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Share Your Story
          </button>
          <button
            onClick={onReplay}
            className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  )
}
