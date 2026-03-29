import { useState, useCallback, useEffect, useRef } from 'react'

// 英文单词列表
const ENGLISH_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it',
  'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this',
  'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or',
  'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so',
  'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
  'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than',
  'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'great',
]

// 中文词汇列表
const CHINESE_WORDS = [
  '的', '是', '在', '了', '和', '有', '我', '不', '人', '都',
  '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你',
  '会', '着', '没有', '看', '好', '自己', '这', '那', '里', '为',
  '什么', '他', '她', '它', '们', '这个', '可以', '没', '来', '能',
  '就', '时候', '知道', '想', '做', '把', '给', '让', '用', '对',
  '还', '过', '得', '说', '走', '去', '看', '来', '天', '地',
]

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type Props = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
}

type TestState = 'idle' | 'running' | 'finished'

const DURATION_OPTIONS = [15, 30, 60]

export default function TypingTest({ settings, onBack, toggleLanguage }: Props) {
  const [duration, setDuration] = useState(30)
  const [testLanguage, setTestLanguage] = useState<'en' | 'zh'>('en')
  const [words, setWords] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [correctChars, setCorrectChars] = useState(0)
  const [incorrectChars, setIncorrectChars] = useState(0)
  const [state, setState] = useState<TestState>('idle')
  const [timeLeft, setTimeLeft] = useState(30)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)

  const inputRef = useRef<HTMLInputElement>(null)

  // 生成单词
  const generateWords = useCallback(() => {
    const wordList = testLanguage === 'en' ? ENGLISH_WORDS : CHINESE_WORDS
    const count = testLanguage === 'en' ? 100 : 150
    const generated: string[] = []
    for (let i = 0; i < count; i++) {
      generated.push(wordList[Math.floor(Math.random() * wordList.length)])
    }
    setWords(generated)
  }, [testLanguage])

  useEffect(() => {
    generateWords()
  }, [generateWords])

  // 计时器
  useEffect(() => {
    if (state !== 'running') return

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setState('finished')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state])

  // 计算 WPM
  useEffect(() => {
    if (state === 'finished') {
      const elapsed = duration - timeLeft
      if (elapsed > 0) {
        const minutes = elapsed / 60
        const wordCount = correctChars / 5 // 标准：5字符=1词
        setWpm(Math.round(wordCount / minutes))
        const total = correctChars + incorrectChars
        setAccuracy(total > 0 ? Math.round((correctChars / total) * 100) : 100)
      }
    }
  }, [state, timeLeft, duration, correctChars, incorrectChars])

  // 开始测试
  const startTest = () => {
    generateWords()
    setCurrentIndex(0)
    setInput('')
    setCorrectChars(0)
    setIncorrectChars(0)
    setTimeLeft(duration)
    setWpm(0)
    setAccuracy(100)
    setState('running')
    inputRef.current?.focus()
  }

  // 处理输入
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (state !== 'running') return

    const value = e.target.value
    const currentWord = words[currentIndex]

    if (testLanguage === 'en') {
      // 英文：按空格跳到下一个词
      if (value.endsWith(' ')) {
        const typedWord = value.trim()
        const chars = typedWord.split('')
        const targetChars = currentWord.split('')

        let correct = 0
        let incorrect = 0

        chars.forEach((char, i) => {
          if (char === targetChars[i]) {
            correct++
          } else {
            incorrect++
          }
        })

        setCorrectChars(prev => prev + correct)
        setIncorrectChars(prev => prev + incorrect + Math.max(0, targetChars.length - chars.length))

        setCurrentIndex(prev => prev + 1)
        setInput('')
      } else {
        setInput(value)
      }
    } else {
      // 中文：按回车或达到字数跳到下一个词
      if (value.length >= currentWord.length) {
        const chars = value.split('')
        const targetChars = currentWord.split('')

        let correct = 0
        let incorrect = 0

        chars.forEach((char, i) => {
          if (char === targetChars[i]) {
            correct++
          } else {
            incorrect++
          }
        })

        setCorrectChars(prev => prev + correct)
        setIncorrectChars(prev => prev + incorrect)
        setCurrentIndex(prev => prev + 1)
        setInput('')
      } else {
        setInput(value)
      }
    }
  }

  // 键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (state === 'idle' && e.key === 'Enter') {
      startTest()
    }
    if (state === 'finished' && e.key === 'Enter') {
      startTest()
    }
  }

  // 渲染单词
  const renderWords = () => {
    const displayWords = words.slice(currentIndex, currentIndex + 30)

    return displayWords.map((word, wordIndex) => {
      const isCurrentWord = wordIndex === 0
      const chars = word.split('')

      return (
        <span
          key={currentIndex + wordIndex}
          className={`inline-block mr-2 ${isCurrentWord ? 'bg-slate-700/50 rounded px-1' : ''}`}
        >
          {chars.map((char, charIndex) => {
            let className = 'text-slate-500'

            if (isCurrentWord && input.length > charIndex) {
              className = input[charIndex] === char ? 'text-green-400' : 'text-red-400'
            } else if (isCurrentWord) {
              className = 'text-white'
            }

            return (
              <span key={charIndex} className={className}>
                {char}
              </span>
            )
          })}
        </span>
      )
    })
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">{settings.language === 'zh' ? '返回' : 'Back'}</span>
            </button>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>⌨️</span>
              {settings.language === 'zh' ? '打字测试' : 'Typing Test'}
            </h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 bg-slate-700 rounded text-sm"
          >
            {settings.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Settings */}
        {state === 'idle' && (
          <div className="text-center mb-8">
            <div className="mb-6">
              <p className="text-slate-400 mb-3">{settings.language === 'zh' ? '测试时长' : 'Test Duration'}</p>
              <div className="flex justify-center gap-2">
                {DURATION_OPTIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      duration === d
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-slate-400 mb-3">{settings.language === 'zh' ? '测试语言' : 'Test Language'}</p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setTestLanguage('en')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    testLanguage === 'en'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setTestLanguage('zh')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    testLanguage === 'zh'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 hover:bg-slate-600'
                  }`}
                >
                  中文
                </button>
              </div>
            </div>

            <button
              onClick={startTest}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition-colors"
            >
              {settings.language === 'zh' ? '开始测试' : 'Start Test'}
            </button>
            <p className="text-slate-500 text-sm mt-2">
              {settings.language === 'zh' ? '按 Enter 开始' : 'Press Enter to start'}
            </p>
          </div>
        )}

        {/* Test Area */}
        {state === 'running' && (
          <>
            {/* Timer */}
            <div className="text-center mb-6">
              <span className="text-5xl font-mono font-bold text-blue-400">
                {timeLeft}
              </span>
            </div>

            {/* Words */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 mb-6 font-mono text-xl leading-relaxed min-h-[200px] shadow-2xl shadow-slate-900/50 ring-1 ring-slate-700">
              {renderWords()}
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-slate-700 border-2 border-slate-600 rounded-xl px-4 py-3 text-xl font-mono focus:outline-none focus:border-blue-500"
              placeholder={testLanguage === 'en' ? 'Type here...' : '在此输入...'}
            />

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6 text-slate-400">
              <span>{settings.language === 'zh' ? '单词' : 'Words'}: {currentIndex}</span>
              <span>{settings.language === 'zh' ? '正确' : 'Correct'}: {correctChars}</span>
              <span>{settings.language === 'zh' ? '错误' : 'Errors'}: {incorrectChars}</span>
            </div>
          </>
        )}

        {/* Results */}
        {state === 'finished' && (
          <div className="text-center">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 mb-6 shadow-2xl shadow-slate-900/50 ring-1 ring-slate-700">
              <h2 className="text-2xl font-bold mb-6">
                {settings.language === 'zh' ? '测试结果' : 'Test Results'}
              </h2>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-700 rounded-xl p-6">
                  <div className="text-5xl font-bold text-green-400">{wpm}</div>
                  <div className="text-slate-400 mt-2">WPM</div>
                </div>
                <div className="bg-slate-700 rounded-xl p-6">
                  <div className="text-5xl font-bold text-blue-400">{accuracy}%</div>
                  <div className="text-slate-400 mt-2">
                    {settings.language === 'zh' ? '准确率' : 'Accuracy'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-slate-400">
                <div>
                  <div className="text-2xl font-bold text-white">{duration - timeLeft}s</div>
                  <div className="text-sm">{settings.language === 'zh' ? '用时' : 'Time'}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{currentIndex}</div>
                  <div className="text-sm">{settings.language === 'zh' ? '单词' : 'Words'}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{correctChars}</div>
                  <div className="text-sm">{settings.language === 'zh' ? '字符' : 'Chars'}</div>
                </div>
              </div>
            </div>

            <button
              onClick={startTest}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-lg transition-colors"
            >
              {settings.language === 'zh' ? '再测一次' : 'Try Again'}
            </button>
            <p className="text-slate-500 text-sm mt-2">
              {settings.language === 'zh' ? '按 Enter 重新开始' : 'Press Enter to restart'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
