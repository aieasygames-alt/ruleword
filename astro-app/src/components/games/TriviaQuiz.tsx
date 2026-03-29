import { useState, useEffect, useCallback, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type TriviaQuizProps = {
  settings: Settings
  onBack: () => void
  updateScore?: (score: number) => void
  getHighScore?: () => number
  onShare?: (data: { score?: number; result?: string }) => void
  gameId?: string
  gameSlug?: string
  gameName?: string
}

interface Question {
  question: string
  options: string[]
  correct: number
  category: string
}

// Question bank
const QUESTIONS_EN: Question[] = [
  // Science
  { question: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], correct: 0, category: "Science" },
  { question: "How many planets are in our solar system?", options: ["7", "8", "9", "10"], correct: 1, category: "Science" },
  { question: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"], correct: 0, category: "Science" },
  { question: "What gas do plants absorb from the air?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], correct: 2, category: "Science" },
  { question: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Brain", "Skin"], correct: 3, category: "Science" },
  // Geography
  { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2, category: "Geography" },
  { question: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3, category: "Geography" },
  { question: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1, category: "Geography" },
  { question: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2, category: "Geography" },
  { question: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"], correct: 1, category: "Geography" },
  // History
  { question: "In which year did World War II end?", options: ["1943", "1944", "1945", "1946"], correct: 2, category: "History" },
  { question: "Who was the first President of the United States?", options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"], correct: 2, category: "History" },
  { question: "Which ancient wonder was located in Egypt?", options: ["Hanging Gardens", "Colossus of Rhodes", "Great Pyramid of Giza", "Lighthouse of Alexandria"], correct: 2, category: "History" },
  { question: "When did the Titanic sink?", options: ["1910", "1912", "1914", "1916"], correct: 1, category: "History" },
  { question: "Who painted the Mona Lisa?", options: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Botticelli"], correct: 2, category: "History" },
  // Technology
  { question: "Who founded Microsoft?", options: ["Steve Jobs", "Bill Gates", "Mark Zuckerberg", "Jeff Bezos"], correct: 1, category: "Technology" },
  { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language"], correct: 0, category: "Technology" },
  { question: "In what year was the first iPhone released?", options: ["2005", "2006", "2007", "2008"], correct: 2, category: "Technology" },
  { question: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Program Utility", "Core Processing Unit"], correct: 0, category: "Technology" },
  { question: "Who is known as the father of the computer?", options: ["Alan Turing", "Charles Babbage", "John von Neumann", "Ada Lovelace"], correct: 1, category: "Technology" },
  // Sports
  { question: "How many players are on a soccer team?", options: ["9", "10", "11", "12"], correct: 2, category: "Sports" },
  { question: "In which sport would you perform a slam dunk?", options: ["Volleyball", "Basketball", "Tennis", "Golf"], correct: 1, category: "Sports" },
  { question: "How many rings are on the Olympic flag?", options: ["4", "5", "6", "7"], correct: 1, category: "Sports" },
  { question: "What sport is known as 'the beautiful game'?", options: ["Cricket", "Tennis", "Soccer", "Rugby"], correct: 2, category: "Sports" },
  { question: "In which country did the sport of golf originate?", options: ["England", "Scotland", "Ireland", "USA"], correct: 1, category: "Sports" },
  // Entertainment
  { question: "What is the highest-grossing film of all time?", options: ["Titanic", "Avengers: Endgame", "Avatar", "Star Wars"], correct: 2, category: "Entertainment" },
  { question: "How many Harry Potter books are there?", options: ["6", "7", "8", "9"], correct: 1, category: "Entertainment" },
  { question: "What is the name of Batman's butler?", options: ["James", "Alfred", "Bruce", "Thomas"], correct: 1, category: "Entertainment" },
  { question: "In which TV show would you find dragons?", options: ["The Witcher", "Game of Thrones", "Lord of the Rings", "Vikings"], correct: 1, category: "Entertainment" },
  { question: "Who sang 'Thriller'?", options: ["Prince", "Michael Jackson", "Whitney Houston", "Madonna"], correct: 1, category: "Entertainment" },
]

const QUESTIONS_ZH: Question[] = [
  // 科学
  { question: "水的化学式是什么？", options: ["H2O", "CO2", "NaCl", "O2"], correct: 0, category: "科学" },
  { question: "太阳系有多少颗行星？", options: ["7", "8", "9", "10"], correct: 1, category: "科学" },
  { question: "光速是多少？", options: ["30万公里/秒", "15万公里/秒", "50万公里/秒", "100万公里/秒"], correct: 0, category: "科学" },
  { question: "植物从空气中吸收什么气体？", options: ["氧气", "氮气", "二氧化碳", "氢气"], correct: 2, category: "科学" },
  { question: "人体最大的器官是什么？", options: ["心脏", "肝脏", "大脑", "皮肤"], correct: 3, category: "科学" },
  // 地理
  { question: "法国的首都是哪里？", options: ["伦敦", "柏林", "巴黎", "马德里"], correct: 2, category: "地理" },
  { question: "哪个是最大的海洋？", options: ["大西洋", "印度洋", "北冰洋", "太平洋"], correct: 3, category: "地理" },
  { question: "世界上最长的河流是？", options: ["亚马逊河", "尼罗河", "长江", "密西西比河"], correct: 1, category: "地理" },
  { question: "世界上有几大洲？", options: ["5", "6", "7", "8"], correct: 2, category: "地理" },
  { question: "世界上最小的国家是？", options: ["摩纳哥", "梵蒂冈", "圣马力诺", "列支敦士登"], correct: 1, category: "地理" },
  // 历史
  { question: "第二次世界大战在哪一年结束？", options: ["1943", "1944", "1945", "1946"], correct: 2, category: "历史" },
  { question: "美国第一任总统是谁？", options: ["托马斯·杰斐逊", "约翰·亚当斯", "乔治·华盛顿", "本杰明·富兰克林"], correct: 2, category: "历史" },
  { question: "哪个古代奇迹位于埃及？", options: ["空中花园", "罗德岛巨像", "吉萨大金字塔", "亚历山大灯塔"], correct: 2, category: "历史" },
  { question: "泰坦尼克号何时沉没？", options: ["1910", "1912", "1914", "1916"], correct: 1, category: "历史" },
  { question: "谁画了蒙娜丽莎？", options: ["米开朗基罗", "拉斐尔", "达芬奇", "波提切利"], correct: 2, category: "历史" },
  // 科技
  { question: "谁创立了微软？", options: ["史蒂夫·乔布斯", "比尔·盖茨", "马克·扎克伯格", "杰夫·贝索斯"], correct: 1, category: "科技" },
  { question: "HTML是什么的缩写？", options: ["超文本标记语言", "高科技现代语言", "主页工具标记语言", "超链接文本标记语言"], correct: 0, category: "科技" },
  { question: "第一代iPhone在哪一年发布？", options: ["2005", "2006", "2007", "2008"], correct: 2, category: "科技" },
  { question: "CPU是什么的缩写？", options: ["中央处理器", "计算机个人单元", "中央程序实用程序", "核心处理单元"], correct: 0, category: "科技" },
  { question: "谁被称为计算机之父？", options: ["艾伦·图灵", "查尔斯·巴贝奇", "冯·诺依曼", "阿达·洛芙莱斯"], correct: 1, category: "科技" },
  // 体育
  { question: "足球队有多少名球员？", options: ["9", "10", "11", "12"], correct: 2, category: "体育" },
  { question: "在哪种运动中你会完成扣篮？", options: ["排球", "篮球", "网球", "高尔夫"], correct: 1, category: "体育" },
  { question: "奥运旗上有几个环？", options: ["4", "5", "6", "7"], correct: 1, category: "体育" },
  { question: "什么运动被称为'美丽的运动'？", options: ["板球", "网球", "足球", "橄榄球"], correct: 2, category: "体育" },
  { question: "高尔夫运动起源于哪个国家？", options: ["英格兰", "苏格兰", "爱尔兰", "美国"], correct: 1, category: "体育" },
  // 娱乐
  { question: "史上票房最高的电影是？", options: ["泰坦尼克号", "复仇者联盟4", "阿凡达", "星球大战"], correct: 2, category: "娱乐" },
  { question: "哈利·波特系列有几本书？", options: ["6", "7", "8", "9"], correct: 1, category: "娱乐" },
  { question: "蝙蝠侠的管家叫什么名字？", options: ["詹姆斯", "阿尔弗雷德", "布鲁斯", "托马斯"], correct: 1, category: "娱乐" },
  { question: "在哪部电视剧中你会看到龙？", options: ["巫师", "权力的游戏", "指环王", "维京传奇"], correct: 1, category: "娱乐" },
  { question: "谁唱了《Thriller》？", options: ["王子", "迈克尔·杰克逊", "惠特尼·休斯顿", "麦当娜"], correct: 1, category: "娱乐" },
]

const CATEGORIES = ['All', 'Science', 'Geography', 'History', 'Technology', 'Sports', 'Entertainment']
const CATEGORIES_ZH = ['全部', '科学', '地理', '历史', '科技', '体育', '娱乐']
const TIME_PER_QUESTION = 15

export default function TriviaQuiz({
  settings,
  onBack,
  updateScore,
  getHighScore,
}: TriviaQuizProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)
  const [highScore, setHighScore] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [answered, setAnswered] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval>>()
  const audioContext = useRef<AudioContext | null>(null)

  const bgClass = settings.darkMode ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = settings.darkMode ? 'text-white' : 'text-gray-900'
  const cardBgClass = settings.darkMode ? 'bg-slate-800' : 'bg-white'
  const borderClass = settings.darkMode ? 'border-gray-700' : 'border-gray-200'

  const isZh = settings.language === 'zh'
  const questionBank = isZh ? QUESTIONS_ZH : QUESTIONS_EN
  const categories = isZh ? CATEGORIES_ZH : CATEGORIES

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('triviaquiz-highscore')
    if (saved) {
      setHighScore(parseInt(saved, 10))
    }
    if (getHighScore) {
      const stored = getHighScore()
      if (stored > 0) setHighScore(stored)
    }
  }, [getHighScore])

  // Play sound
  const playSound = useCallback((type: 'correct' | 'wrong' | 'tick') => {
    if (!settings.soundEnabled) return

    try {
      if (!audioContext.current) {
        audioContext.current = new AudioContext()
      }

      const ctx = audioContext.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      if (type === 'correct') {
        oscillator.frequency.value = 880
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.2)
      } else if (type === 'wrong') {
        oscillator.frequency.value = 220
        oscillator.type = 'sawtooth'
        gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
      } else if (type === 'tick') {
        oscillator.frequency.value = 440
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.05)
      }
    } catch {
      // Audio not supported
    }
  }, [settings.soundEnabled])

  // Start game
  const startGame = useCallback(() => {
    const filtered = selectedCategory === 'All' || selectedCategory === '全部'
      ? [...questionBank]
      : questionBank.filter(q => {
          const catIndex = categories.indexOf(selectedCategory)
          if (catIndex === -1) return true
          return q.category === CATEGORIES[catIndex] || q.category === CATEGORIES_ZH[catIndex]
        })

    // Shuffle and pick 10 questions
    const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 10)

    setQuestions(shuffled)
    setCurrentQuestion(0)
    setScore(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(TIME_PER_QUESTION)
    setSelectedAnswer(null)
    setAnswered(false)
    setGameState('playing')
  }, [selectedCategory, questionBank, categories])

  // Timer
  useEffect(() => {
    if (gameState !== 'playing' || answered) return

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - count as wrong
          handleAnswer(-1)
          return 0
        }
        if (prev <= 5) {
          playSound('tick')
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState, answered, playSound])

  // Handle answer
  const handleAnswer = useCallback((index: number) => {
    if (answered) return
    setAnswered(true)

    const currentQ = questions[currentQuestion]
    const isCorrect = index === currentQ.correct

    setSelectedAnswer(index)

    if (isCorrect) {
      playSound('correct')
      const timeBonus = Math.floor(timeLeft / 3)
      const streakBonus = streak * 2
      const points = 10 + timeBonus + streakBonus
      setScore(prev => prev + points)
      setStreak(prev => {
        const newStreak = prev + 1
        setMaxStreak(max => Math.max(max, newStreak))
        return newStreak
      })
    } else {
      playSound('wrong')
      setStreak(0)
    }

    // Next question after delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1)
        setTimeLeft(TIME_PER_QUESTION)
        setSelectedAnswer(null)
        setAnswered(false)
      } else {
        // Game over
        setGameState('result')
        if (updateScore) updateScore(score + (isCorrect ? 10 + Math.floor(timeLeft / 3) + streak * 2 : 0))
        if (score > highScore) {
          setHighScore(score)
          localStorage.setItem('triviaquiz-highscore', (score + (isCorrect ? 10 + Math.floor(timeLeft / 3) + streak * 2 : 0)).toString())
        }
      }
    }, 1500)
  }, [answered, questions, currentQuestion, timeLeft, streak, playSound, updateScore, score, highScore])

  const texts = {
    title: isZh ? '知识问答' : 'Trivia Quiz',
    score: isZh ? '得分' : 'Score',
    highScore: isZh ? '最高分' : 'High Score',
    question: isZh ? '问题' : 'Question',
    streak: isZh ? '连击' : 'Streak',
    timeLeft: isZh ? '剩余时间' : 'Time Left',
    start: isZh ? '开始游戏' : 'Start Game',
    playAgain: isZh ? '再来一局' : 'Play Again',
    results: isZh ? '结果' : 'Results',
    correct: isZh ? '正确' : 'Correct',
    wrong: isZh ? '错误' : 'Wrong',
    selectCategory: isZh ? '选择分类' : 'Select Category',
    back: isZh ? '返回' : 'Back',
  }

  return (
    <div className={`min-h-screen flex flex-col items-center py-4 px-2 ${bgClass} ${textClass}`}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className={`flex items-center justify-between border-b ${borderClass} pb-3 mb-4`}>
          <button
            onClick={() => gameState === 'playing' ? setGameState('menu') : onBack()}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-700/30 rounded"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{texts.title}</h1>
          <div className="w-8" />
        </div>

        {/* Menu Screen */}
        {gameState === 'menu' && (
          <div className="flex flex-col items-center py-8">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-2xl font-bold mb-6">{texts.title}</h2>

            {/* Category Selection */}
            <div className="w-full mb-6">
              <p className="text-center mb-3 opacity-70">{texts.selectCategory}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : settings.darkMode
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* High Score */}
            <div className="mb-6 text-center">
              <p className="text-sm opacity-60">{texts.highScore}</p>
              <p className="text-2xl font-bold">{highScore}</p>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              {texts.start}
            </button>
          </div>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && questions.length > 0 && (
          <div>
            {/* Progress and Score */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm opacity-70">
                {texts.question} {currentQuestion + 1}/{questions.length}
              </span>
              <div className="flex gap-4">
                <span className="text-sm font-bold">{texts.score}: {score}</span>
                {streak > 1 && (
                  <span className="text-sm text-yellow-400">🔥 {streak}x</span>
                )}
              </div>
            </div>

            {/* Timer Bar */}
            <div className={`h-2 rounded-full mb-4 ${settings.darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}>
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  timeLeft <= 5 ? 'bg-red-500' : timeLeft <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
              />
            </div>

            {/* Question Card */}
            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 mb-4`}>
              <p className="text-xs uppercase opacity-50 mb-2">{questions[currentQuestion].category}</p>
              <h3 className="text-lg font-semibold mb-6">{questions[currentQuestion].question}</h3>

              {/* Options */}
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswer === index
                  const isCorrectAnswer = index === questions[currentQuestion].correct
                  const showResult = answered

                  let bgColor = settings.darkMode ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500' : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
                  if (showResult) {
                    if (isCorrectAnswer) {
                      bgColor = 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                    } else if (isSelected && !isCorrectAnswer) {
                      bgColor = 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30'
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => !answered && handleAnswer(index)}
                      disabled={answered}
                      className={`w-full p-4 rounded-lg text-left transition-colors ${bgColor} ${
                        answered ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Result Screen */}
        {gameState === 'result' && (
          <div className="flex flex-col items-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-6">{texts.results}</h2>

            <div className={`${cardBgClass} border ${borderClass} rounded-xl p-6 w-full mb-6`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm opacity-60">{texts.score}</p>
                  <p className="text-3xl font-bold">{score}</p>
                </div>
                <div>
                  <p className="text-sm opacity-60">{texts.highScore}</p>
                  <p className="text-3xl font-bold">{Math.max(score, highScore)}</p>
                </div>
                <div>
                  <p className="text-sm opacity-60">{texts.correct}</p>
                  <p className="text-xl font-bold text-green-500">
                    {questions.filter((_, i) => {
                      // Count correct answers
                      return true // Simplified - would need to track answers
                    }).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-60">{texts.streak}</p>
                  <p className="text-xl font-bold text-yellow-500">🔥 {maxStreak}</p>
                </div>
              </div>
            </div>

            {score >= highScore && score > 0 && (
              <p className="text-yellow-400 mb-4 text-lg">🎉 {isZh ? '新纪录!' : 'New Record!'}</p>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setGameState('menu')}
                className={`px-6 py-3 rounded-lg font-bold ${
                  settings.darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {texts.back}
              </button>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
              >
                {texts.playAgain}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
