import { useState, useEffect, useRef } from 'react'

interface TypingEffectProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
}

export default function TypingEffect({ text, speed = 30, onComplete, className = '' }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayedText(text)
      setIsComplete(true)
      onComplete?.()
      return
    }

    setDisplayedText('')
    setIsComplete(false)
    indexRef.current = 0

    const timer = setInterval(() => {
      indexRef.current++
      if (indexRef.current >= text.length) {
        setDisplayedText(text)
        setIsComplete(true)
        clearInterval(timer)
        onComplete?.()
      } else {
        setDisplayedText(text.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
      )}
    </span>
  )
}
