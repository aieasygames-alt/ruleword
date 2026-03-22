import { useEffect, useState, useRef } from 'react'

type AmongUsProps = {
  settings?: {
    darkMode: boolean
    soundEnabled: boolean
    language: 'en' | 'zh'
  }
  onBack?: () => void
  toggleLanguage?: () => void
  toggleTheme?: () => void
  toggleSound?: () => void
}

export default function AmongUs({ settings, onBack }: AmongUsProps) {
  const [gameMode, setGameMode] = useState<'menu' | 'mini' | 'move'>('menu')
  const containerRef = useRef<HTMLDivElement>(null)

  // Load game script when mode changes
  useEffect(() => {
    if (gameMode === 'menu') return

    // Create and load the game script
    const script = document.createElement('script')
    script.src = gameMode === 'mini' ? '/games/amongus/assets/Js/index.js' : '/games/amongus/assets/Js/amongus.js'
    script.async = true

    // Initialize game after script loads
    script.onload = () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        if (window.init) window.init()
      }
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script)
    }
  }, [gameMode])

  const goBack = () => {
    setGameMode('menu')
    // Clear game state
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }
  }

  if (gameMode === 'menu') {
    return (
      <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-500 animate-pulse">
          Among Us
        </h1>

        <img
          src="/games/amongus/assets/Image/banner.png"
          alt="Among Us"
          className="max-w-xs w-full mb-8 drop-shadow-2xl"
        />

        <div className="flex flex-col gap-4">
          <button
            onClick={() => setGameMode('mini')}
            className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            🎮 Mini Game
          </button>

          <button
            onClick={() => setGameMode('move')}
            className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            👽 Character Move
          </button>
        </div>

        <p className="mt-8 text-slate-400 text-sm text-center">
          Use Arrow Keys or WASD to move<br/>
          Click Kill/Sabotage buttons for actions
        </p>
      </div>
    )
  }

  // Mini Game Mode
  if (gameMode === 'mini') {
    return (
      <div className="w-full h-full min-h-[600px] relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <button
          onClick={goBack}
          className="absolute top-4 left-4 z-50 px-4 py-2 text-white bg-white/10 border border-white/30 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all"
        >
          ← Back to Menu
        </button>

        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-white text-xl mb-4" id="score">Score: 0</div>

          {/* Character */}
          <div id="img" className="relative" style={{ position: 'relative', left: '0px', top: '0px' }}>
            <div className="hand"></div>
            <div id="body" className="w-24 h-32 bg-red-500 rounded-3xl relative"></div>
            <div id="lleg" className="absolute bottom-0 left-2 w-8 h-12 bg-red-500 rounded-b-xl"></div>
            <div id="rleg" className="absolute bottom-0 right-2 w-8 h-12 bg-red-500 rounded-b-xl"></div>
            <div className="eye absolute top-4 right-2 w-10 h-8 bg-cyan-200 rounded-full"></div>
            <div className="line absolute top-4 right-12 w-4 h-8 bg-cyan-200 rounded-l-full"></div>
          </div>

          {/* Target character */}
          <div id="img1" className="absolute" style={{ left: '350px', top: '200px', visibility: 'visible' }}>
            <div className="w-20 h-28 bg-yellow-500 rounded-3xl"></div>
          </div>

          {/* Dead body placeholder */}
          <div id="deadimg"></div>

          {/* Sabotage overlay */}
          <div id="saboo" className="fixed inset-0 bg-red-500/50 pointer-events-none" style={{ visibility: 'hidden' }}></div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-8">
            <button
              id="kill"
              className="px-6 py-3 text-white bg-red-600 rounded-lg font-bold hover:bg-red-500 transition-colors"
            >
              🔪 Kill
            </button>
            <button
              onClick={() => {
                const sabo = document.getElementById('saboo')
                if (sabo) {
                  sabo.style.visibility = 'visible'
                  setTimeout(() => { sabo.style.visibility = 'hidden' }, 1700)
                  setTimeout(() => { sabo.style.visibility = 'visible' }, 2700)
                  setTimeout(() => { sabo.style.visibility = 'hidden' }, 3700)
                }
              }}
              className="px-6 py-3 text-white bg-orange-600 rounded-lg font-bold hover:bg-orange-500 transition-colors"
            >
              ⚡ Sabotage
            </button>
          </div>
        </div>

        <style>{`
          #img { transform-origin: center; }
          #lleg, #rleg { transition: transform 0.2s; }
        `}</style>
      </div>
    )
  }

  // Character Move Mode
  return (
    <div className="w-full h-full min-h-[600px] relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <button
        onClick={goBack}
        className="absolute top-4 left-4 z-50 px-4 py-2 text-white bg-white/10 border border-white/30 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all"
      >
        ← Back to Menu
      </button>

      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-white text-lg mb-4 text-center">
          Use Arrow Keys (⬆️⬇️⬅️➡️) to move the character!
        </div>

        {/* Character */}
        <div id="img" ref={containerRef} className="relative" style={{ position: 'relative', left: '0px', top: '0px' }}>
          <div className="hand absolute -left-4 top-12 w-6 h-10 bg-red-500 rounded-full"></div>
          <div id="body" className="w-24 h-32 bg-red-500 rounded-3xl relative">
            <div className="eye absolute top-4 right-2 w-10 h-8 bg-cyan-200 rounded-full"></div>
            <div className="line absolute top-4 right-12 w-4 h-8 bg-cyan-200 rounded-l-full"></div>
          </div>
          <div id="lleg" className="absolute bottom-0 left-2 w-8 h-12 bg-red-500 rounded-b-xl origin-top"></div>
          <div id="rleg" className="absolute bottom-0 right-2 w-8 h-12 bg-red-500 rounded-b-xl origin-top"></div>
        </div>

        <p className="mt-8 text-slate-400 text-sm">
          You will get stuck by blackhole if you go beyond the limit! 😜
        </p>

        {/* Theme buttons */}
        <div className="flex gap-4 mt-4">
          <button
            onClick={() => document.body.style.backgroundColor = 'white'}
            className="px-4 py-2 text-black bg-white rounded-lg"
          >
            Light Mode
          </button>
          <button
            onClick={() => document.body.style.backgroundColor = 'black'}
            className="px-4 py-2 text-white bg-gray-800 rounded-lg"
          >
            Dark Mode
          </button>
        </div>
      </div>

      <style>{`
        #img { transform-origin: center; }
        #lleg, #rleg { transition: transform 0.15s ease-out; }
      `}</style>

      <CharacterMoveScript />
    </div>
  )
}

// Separate component for the movement script
function CharacterMoveScript() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const img = document.getElementById('img')
      const leftLeg = document.getElementById('lleg')
      const rightLeg = document.getElementById('rleg')

      if (!img || !leftLeg || !rightLeg) return

      const currentLeft = parseInt(img.style.left) || 0
      const currentTop = parseInt(img.style.top) || 0
      const step = 10

      // Animate legs
      leftLeg.style.transform = 'rotate(20deg)'
      rightLeg.style.transform = 'rotate(-20deg)'
      setTimeout(() => {
        leftLeg.style.transform = 'rotate(0deg)'
        rightLeg.style.transform = 'rotate(0deg)'
      }, 150)

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          img.style.left = (currentLeft - step) + 'px'
          img.style.transform = 'scaleX(-1)'
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          img.style.left = (currentLeft + step) + 'px'
          img.style.transform = 'scaleX(1)'
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          img.style.top = (currentTop - step) + 'px'
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          img.style.top = (currentTop + step) + 'px'
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return null
}
