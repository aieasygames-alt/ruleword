import { useState, useCallback } from 'react'
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
    window.postMessage({ type: 'navigate-back' }, '*')
  }, [])

  return (
    <>
      <AIStoryGame
        template={template}
        gameName={gameName}
        gameSlug={gameSlug}
        onShare={handleShare}
        onBack={handleBack}
        settings={{ darkMode: true, soundEnabled: true, language: 'en' }}
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
