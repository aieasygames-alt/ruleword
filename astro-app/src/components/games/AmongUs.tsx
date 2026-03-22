import { useState } from 'react'

type AmongUsProps = {
  onGameComplete?: (score: number) => void
}

export default function AmongUs({ onGameComplete }: AmongUsProps) {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      <div className="flex-1 relative">
        <iframe
          src="/games/amongus/index.html"
          className="w-full h-full min-h-[600px] border-0"
          title="Among Us Game"
          allow="fullscreen"
          loading="lazy"
        />
      </div>
    </div>
  )
}
