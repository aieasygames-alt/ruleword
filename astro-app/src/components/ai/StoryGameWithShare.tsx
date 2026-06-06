import { useState, useCallback, useEffect } from 'react'
import AIStoryGame from './AIStoryGame'
import ShareModal from '../ShareModal'

interface StoryGameWithShareProps {
  template: string
  gameName: string
  gameSlug: string
  gameEmoji: string
}

export default function StoryGameWithShare({ template, gameName, gameSlug, gameEmoji }: StoryGameWithShareProps) {
  const [shareOpen, setShareOpen] = useState(false)
  const [language, setLanguage] = useState<'en' | 'zh-CN'>('en')

  // Read user language preference from URL or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lang = params.get('lang')
    if (lang === 'zh' || lang === 'zh-CN') {
      setLanguage('zh-CN')
    } else if (lang === 'en') {
      setLanguage('en')
    } else {
      try {
        const saved = localStorage.getItem('ruleword_settings')
        if (saved) {
          const settings = JSON.parse(saved)
          if (settings.language === 'zh' || settings.language === 'zh-CN') {
            setLanguage('zh-CN')
          }
        }
      } catch { /* use default */ }
    }
  }, [])

  const [shareData, setShareData] = useState<{
    gameName: string
    gameEmoji: string
    result?: string
    score?: number
    storyTitle?: string
    storyDesc?: string
    storySlug?: string
  }>({
    gameName,
    gameEmoji,
  })

  const handleShare = useCallback((data: { result: string; score?: number; storyTitle?: string; storyDesc?: string; storySlug?: string }) => {
    setShareData({
      gameName,
      gameEmoji,
      ...data,
    })
    setShareOpen(true)
  }, [gameName, gameEmoji])

  const handleBack = useCallback(() => {
    window.postMessage({ type: 'navigate-back' }, window.location.origin)
  }, [])

  return (
    <>
      <AIStoryGame
        template={template}
        gameName={gameName}
        gameSlug={gameSlug}
        onShare={handleShare}
        onBack={handleBack}
        settings={{ darkMode: true, soundEnabled: true, language }}
      />
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        shareData={shareData}
        darkMode={true}
      />
    </>
  )
}
