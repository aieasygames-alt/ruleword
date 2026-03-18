import { useState, useMemo } from 'react'
import { VALID_WORDS } from '../../data/words'
import { IDIOMS } from '../../data/idioms'
import type { Language } from '../../data/locales'

type Props = {
  language: Language
  darkMode: boolean
  onClose: () => void
}

export default function WordList({ language, darkMode, onClose }: Props) {
  const [search, setSearch] = useState('')

  const words = useMemo(() => {
    if (language === 'zh') {
      return IDIOMS
    }
    return VALID_WORDS.sort()
  }, [language])

  const filteredWords = useMemo(() => {
    if (!search) return words
    return words.filter(word =>
      word.toLowerCase().includes(search.toLowerCase())
    )
  }, [words, search])

  const bgClass = darkMode ? 'bg-slate-800' : 'bg-white'
  const textClass = darkMode ? 'text-white' : 'text-gray-900'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-300'
  const inputBgClass = darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'

  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`modal-content ${bgClass} rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {language === 'zh' ? '成语词库' : 'Word List'}
          </h2>
          <button
            onClick={onClose}
            className={`w-8 h-8 flex items-center justify-center rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'zh' ? '搜索成语...' : 'Search words...'}
            className={`w-full px-4 py-2 rounded-lg border ${inputBgClass} ${textClass} focus:outline-none focus:ring-2 focus:ring-green-500`}
          />
        </div>

        {/* Stats */}
        <div className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {language === 'zh'
            ? `共 ${words.length} 个成语 ${search ? `，找到 ${filteredWords.length} 个` : ''}`
            : `${words.length} words total ${search ? `，${filteredWords.length} found` : ''}`
          }
        </div>

        {/* Word Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {filteredWords.map((word, index) => (
              <div
                key={`${word}-${index}`}
                className={`px-2 py-1.5 rounded text-center text-sm font-mono ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textClass} transition-colors cursor-default`}
              >
                {language === 'en' ? word.toUpperCase() : word}
              </div>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'zh' ? '未找到匹配的成语' : 'No words found'}
            </div>
          )}
        </div>

        {/* SEO Content - Hidden but crawlable */}
        <div className="sr-only">
          {language === 'en' && (
            <div>
              <h3>5 Letter Words for Wordle Game</h3>
              <p>Complete list of valid 5-letter English words used in RuleWord game. Practice these words to improve your Wordle skills.</p>
            </div>
          )}
          {language === 'zh' && (
            <div>
              <h3>四字成语大全</h3>
              <p>RuleWord游戏使用的常用四字成语列表，包含500+成语，可用于成语接龙、成语学习等。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
