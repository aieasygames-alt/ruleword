import { useState } from 'react'

type ShareData = {
  gameName: string
  gameEmoji: string
  score?: number
  time?: string
  attempts?: number
  result?: string // 用于 Wordle 类的方块符号
  level?: string // 关卡信息
}

type Props = {
  isOpen: boolean
  onClose: () => void
  shareData: ShareData
  darkMode?: boolean
}

export default function ShareModal({ isOpen, onClose, shareData, darkMode = true }: Props) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // 生成分享文本
  const generateShareText = () => {
    const { gameName, gameEmoji, score, time, attempts, result, level } = shareData

    let text = `${gameEmoji} ${gameName}\n`

    // 添加方块符号（Wordle 风格）
    if (result) {
      text += `\n${result}\n`
    }

    // 添加成绩信息
    if (level) {
      text += `📍 ${level}\n`
    }
    if (score !== undefined) {
      text += `🏆 Score: ${score}\n`
    }
    if (time) {
      text += `⏱️ Time: ${time}\n`
    }
    if (attempts !== undefined) {
      text += `🎯 Attempts: ${attempts}\n`
    }

    text += `\n🔗 Play at: https://ruleword.com`

    return text
  }

  // 复制到剪贴板
  const handleCopy = async () => {
    const text = generateShareText()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 分享到 Twitter
  const handleTwitterShare = () => {
    const text = encodeURIComponent(generateShareText())
    const url = `https://twitter.com/intent/tweet?text=${text}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  // 分享到 Facebook
  const handleFacebookShare = () => {
    const url = encodeURIComponent('https://ruleword.com')
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  // 分享到 WhatsApp
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText())
    const url = `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  // 分享到 Reddit
  const handleRedditShare = () => {
    const text = encodeURIComponent(generateShareText())
    const url = `https://reddit.com/submit?url=${encodeURIComponent('https://ruleword.com')}&title=${text}`
    window.open(url, '_blank', 'width=600,height=400')
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            📢 Share Your Score
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className={`p-6 ${darkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
          <div className={`font-mono text-sm whitespace-pre-wrap ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            {generateShareText()}
          </div>
        </div>

        {/* Copy Button */}
        <div className="p-6">
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : `${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-900'}`
            }`}
          >
            {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className={`px-6 pb-6`}>
          <p className={`text-sm font-medium mb-3 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Or share directly to:
          </p>
          <div className="grid grid-cols-4 gap-3">
            {/* Twitter */}
            <button
              onClick={handleTwitterShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#1DA1F2] hover:bg-[#1a8cd8] transition-colors text-white"
              title="Share on Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-xs font-medium">X</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#4267B2] hover:bg-[#365899] transition-colors text-white"
              title="Share on Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-xs font-medium">Facebook</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] transition-colors text-white"
              title="Share on WhatsApp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-xs font-medium">WhatsApp</span>
            </button>

            {/* Reddit */}
            <button
              onClick={handleRedditShare}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#FF4500] hover:bg-[#e03d00] transition-colors text-white"
              title="Share on Reddit"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
              </svg>
              <span className="text-xs font-medium">Reddit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
