import { useMemo } from 'react'

interface DayRecord {
  date: string // YYYY-MM-DD
  completed: boolean
  won: boolean
  guesses: number
  gameType: 'wordle' | 'mastermind'
}

interface CalendarProps {
  records: DayRecord[]
  streak: number
  maxStreak: number
  language: 'en' | 'zh'
  darkMode: boolean
  onClose: () => void
}

const CALENDAR_KEY = 'ruleword_calendar'

export function saveCalendarRecord(record: DayRecord): void {
  const records = loadCalendarRecords()
  const existing = records.findIndex(r => r.date === record.date && r.gameType === record.gameType)
  if (existing >= 0) {
    records[existing] = record
  } else {
    records.push(record)
  }
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(records))
}

export function loadCalendarRecords(): DayRecord[] {
  try {
    const data = localStorage.getItem(CALENDAR_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {}
  return []
}

export function Calendar({ records, streak, maxStreak, language, darkMode, onClose }: CalendarProps) {
  const last14Days = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const record = records.find(r => r.date === dateStr)
      days.push({
        date: dateStr,
        dayOfMonth: date.getDate(),
        dayName: date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' }),
        record,
      })
    }
    return days
  }, [records, language])

  const bgClass = darkMode ? 'bg-slate-800' : 'bg-white'
  const textClass = darkMode ? 'text-white' : 'text-gray-900'
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`${bgClass} rounded-2xl p-6 max-w-sm w-full`} onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-center mb-4">
          {language === 'zh' ? '📅 每日记录' : '📅 Daily Calendar'}
        </h2>

        {/* Streak info */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">🔥 {streak}</div>
            <div className="text-xs text-gray-400">{language === 'zh' ? '当前连胜' : 'Current Streak'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">👑 {maxStreak}</div>
            <div className="text-xs text-gray-400">{language === 'zh' ? '最高连胜' : 'Max Streak'}</div>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day names */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-xs text-center text-gray-500 py-1">{d}</div>
          ))}
          {/* Days */}
          {last14Days.map((day, i) => {
            let bgColor = darkMode ? 'bg-gray-700' : 'bg-gray-200'
            let icon = ''

            if (day.record) {
              if (day.record.won) {
                bgColor = 'bg-green-500'
                icon = '✓'
              } else {
                bgColor = 'bg-red-500/70'
                icon = '✗'
              }
            }

            return (
              <div
                key={i}
                className={`w-10 h-10 flex flex-col items-center justify-center rounded text-xs font-medium ${bgColor} ${textClass}`}
                title={day.date}
              >
                <span>{day.dayOfMonth}</span>
                {icon && <span className="text-xs">{icon}</span>}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs mb-4">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>{language === 'zh' ? '获胜' : 'Won'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500/70 rounded" />
            <span>{language === 'zh' ? '失败' : 'Lost'}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-4 h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded`} />
            <span>{language === 'zh' ? '未玩' : 'Not played'}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          {language === 'zh' ? '关闭' : 'Close'}
        </button>
      </div>
    </div>
  )
}
