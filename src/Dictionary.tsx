import { useState, useMemo } from 'react'
import { WORD_DICTIONARY, getWordsByLetter, getAllLetters, searchWords, type WordEntry } from './wordDictionary'
import { IDIOM_DICTIONARY, getIdiomsByChar, getAllFirstChars, searchIdioms, type IdiomEntry } from './idiomDictionary'
import type { Language, Settings } from './locales'

interface DictionaryProps {
  settings: Settings
  onBack: () => void
}

export default function Dictionary({ settings, onBack }: DictionaryProps) {
  const [language, setLanguage] = useState<Language>(settings.language)
  const [selectedLetter, setSelectedLetter] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const bgClass = settings.darkMode ? 'bg-gray-900' : 'bg-white'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-gray-800' : 'bg-gray-50'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'
  const inputBgClass = settings.darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
  const btnActiveClass = settings.darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
  const btnInactiveClass = settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'

  // 获取筛选后的单词/成语
  const filteredEntries = useMemo(() => {
    if (searchQuery.trim()) {
      return language === 'zh'
        ? searchIdioms(searchQuery)
        : searchWords(searchQuery)
    }
    if (selectedLetter) {
      return language === 'zh'
        ? getIdiomsByChar(selectedLetter)
        : getWordsByLetter(selectedLetter)
    }
    return language === 'zh' ? IDIOM_DICTIONARY : WORD_DICTIONARY
  }, [language, selectedLetter, searchQuery])

  // 获取所有可筛选的字母/字符
  const allFilters = useMemo(() => {
    return language === 'zh' ? getAllFirstChars() : getAllLetters()
  }, [language])

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} py-8 px-4`}>
      <div className="max-w-6xl mx-auto">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${cardBgClass} border ${borderClass} hover:opacity-80 transition-opacity`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'zh' ? '返回' : 'Back'}
          </button>
          <h1 className="text-2xl font-bold">
            {language === 'zh' ? '📖 成语词典' : '📖 Word Dictionary'}
          </h1>
          <div className="w-24" /> {/* 占位保持居中 */}
        </div>

        {/* 语言切换 */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => {
              setLanguage('en')
              setSelectedLetter('')
              setSearchQuery('')
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              language === 'en' ? btnActiveClass : btnInactiveClass
            }`}
          >
            English
          </button>
          <button
            onClick={() => {
              setLanguage('zh')
              setSelectedLetter('')
              setSearchQuery('')
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              language === 'zh' ? btnActiveClass : btnInactiveClass
            }`}
          >
            中文
          </button>
        </div>

        {/* 搜索框 */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSelectedLetter('')
            }}
            placeholder={language === 'zh' ? '搜索成语或含义...' : 'Search words or meanings...'}
            className={`w-full px-4 py-3 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* 首字母筛选 */}
        {!searchQuery && (
          <div className="mb-6">
            <h3 className={`text-sm font-medium mb-3 ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'zh' ? '按首字筛选：' : 'Filter by first letter:'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLetter('')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  !selectedLetter
                    ? 'bg-blue-500 text-white'
                    : settings.darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {language === 'zh' ? '全部' : 'All'}
              </button>
              {allFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedLetter(filter)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedLetter === filter
                      ? 'bg-blue-500 text-white'
                      : settings.darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 结果统计 */}
        <div className={`mb-4 text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {searchQuery ? (
            language === 'zh' ? (
              `找到 ${filteredEntries.length} 个成语`
            ) : (
              `${filteredEntries.length} words found`
            )
          ) : selectedLetter ? (
            language === 'zh' ? (
              `以 "${selectedLetter}" 开头的成语 (${filteredEntries.length})`
            ) : (
              `Words starting with "${selectedLetter.toUpperCase()}" (${filteredEntries.length})`
            )
          ) : (
            language === 'zh' ? (
              `共 ${filteredEntries.length} 个成语`
            ) : (
              `${filteredEntries.length} words total`
            )
          )}
        </div>

        {/* 词条列表 */}
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => (
            <div
              key={(entry as WordEntry).word || (entry as IdiomEntry).idiom}
              className={`p-4 rounded-lg border ${borderClass} ${cardBgClass} hover:shadow-lg transition-shadow`}
            >
              {'word' in entry ? (
                // 英文单词卡片
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-blue-600">
                      {entry.word}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      settings.darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {entry.category}
                    </span>
                  </div>
                  <p className={settings.darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {entry.meaning}
                  </p>
                </>
              ) : (
                // 中文成语卡片
                <>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-2xl font-bold text-blue-600">
                      {entry.idiom}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      entry.category === '褒义' ? 'bg-green-100 text-green-700' :
                      entry.category === '贬义' ? 'bg-red-100 text-red-700' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {entry.category}
                    </span>
                  </div>
                  <p className={`text-sm mb-1 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    [{entry.pinyin}]
                  </p>
                  <p className={settings.darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {entry.meaning}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>

        {/* 无结果提示 */}
        {filteredEntries.length === 0 && (
          <div className={`text-center py-12 ${settings.darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {language === 'zh' ? '未找到匹配的成语' : 'No matching words found'}
          </div>
        )}

        {/* SEO友好内容 - 仅在底部显示，不影响用户体验 */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className={`text-lg font-semibold mb-4 ${settings.darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {language === 'zh' ? '关于词库' : 'About the Dictionary'}
          </h2>
          <p className={`text-sm ${settings.darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'zh'
              ? `本词库收录了 ${IDIOM_DICTIONARY.length} 个常用成语，每个成语都配有拼音、解释和褒贬分类。支持按首字筛选和关键词搜索。`
              : `This dictionary contains ${WORD_DICTIONARY.length} common 5-letter words, each with meaning and part of speech. Filter by first letter or search by keyword.`
            }
          </p>
        </div>
      </div>
    </div>
  )
}
