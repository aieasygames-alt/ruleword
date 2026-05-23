// Multi-language support for Free Games Hub
export type Language = 'en' | 'zh-CN'

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese Simplified', nativeName: '简体中文' },
]

export const i18n: Record<Language, {
  siteName: string
  nav: {
    home: string
    feedback: string
    language: string
  }
  home: {
    title: string
    subtitle: string
    featured: string
    allGames: string
    gamesCount: string
    freeGames: string
    categories: string
    copyright: string
    aboutTitle: string
    quickPlay: string
    quickPlayDesc: string
    browseByCategory: string
    feature1Title: string
    feature1Desc: string
    feature2Title: string
    feature2Desc: string
    feature3Title: string
    feature3Desc: string
    feature4Title: string
    feature4Desc: string
    feature5Title: string
    feature5Desc: string
    feature6Title: string
    feature6Desc: string
    aboutDesc: string
  }
  game: {
    loading: string
    error: string
    backToHome: string
    howToPlay: string
    tips: string
    viewGuide: string
    about: string
    objectives: string
    controls: string
    mechanics: string
    features: string
    faq: string
    source: string
  }
  feedback: {
    title: string
    type: string
    bugReport: string
    featureRequest: string
    gameFeedback: string
    other: string
    message: string
    messagePlaceholder: string
    email: string
    emailPlaceholder: string
    send: string
    sending: string
    success: string
    fail: string
  }
  category: {
    aboutCategory: string
    noGames: string
    gamesCount: string
  }
  footer: {
    copyright: string
  }
}> = {
  en: {
    siteName: 'Free Games Hub',
    nav: { home: 'Home', feedback: 'Feedback', language: 'Language' },
    home: {
      title: 'Play Wordle, Sudoku, 2048 Online Free',
      subtitle: '100+ puzzle, word, arcade & strategy games. No download, play instantly in browser!',
      featured: 'Featured Games', allGames: 'All Games', gamesCount: 'games', freeGames: 'Free Games',
      categories: 'Categories', copyright: '© 2026 Free Games Hub', aboutTitle: 'About Free Games Hub', quickPlay: 'Quick Play', quickPlayDesc: 'Jump right into our most popular games', browseByCategory: 'Browse by Category',
      gameGuides: 'Game Guides', viewAllGuides: 'View All Guides →',
      brainTests: 'Brain Tests & Cognitive Challenges', brainTestsDesc: 'Test your memory, reaction speed, and cognitive control with these popular brain challenges!',
      feature1Title: '100% Free & Unlimited', feature1Desc: 'Play all games without any cost or time limits. No registration required.',
      feature2Title: 'Instant Play, No Downloads', feature2Desc: 'All games run directly in your browser. No app installation needed.',
      feature3Title: 'Play Anywhere', feature3Desc: 'Works on desktop, tablet, and mobile devices. Enjoy games on the go.',
      feature4Title: 'Brain Training', feature4Desc: 'Improve your logic, vocabulary, memory and reflexes with our puzzles.',
      feature5Title: 'Multi-Language Support', feature5Desc: 'Available in English and Simplified Chinese.',
      feature6Title: 'Always Growing', feature6Desc: 'New games added regularly. Fresh challenges await you every week.',
      aboutDesc: 'Free Games Hub is your ultimate destination for free online puzzle games. With over 111 games across 7 categories, we offer something for everyone - from classic word puzzles like Wordle to brain-training logic games like Sudoku, from nostalgic arcade hits like Tetris to strategic challenges like Chess. All games are 100% free, require no downloads, and work on any device. Whether you want to improve your vocabulary, sharpen your mind, or just have fun, start playing now - no registration required!',
    },
    game: { loading: 'Loading', error: 'Error', backToHome: 'Back to Home', howToPlay: 'How to Play', tips: 'Tips', viewGuide: 'View Game Guide', about: 'About', objectives: 'Objectives', controls: 'Controls', mechanics: 'Game Mechanics', features: 'Features', faq: 'Frequently Asked Questions', source: 'Source' },
    feedback: {
      title: 'Feedback', type: 'Type', bugReport: 'Bug Report', featureRequest: 'Feature Request',
      gameFeedback: 'Game Feedback', other: 'Other', message: 'Message', messagePlaceholder: 'Describe your feedback...',
      email: 'Email (optional)', emailPlaceholder: 'For reply', send: 'Send Feedback', sending: 'Sending...',
      success: 'Thank you for your feedback!', fail: 'Failed to send feedback. Please try again.'
    },
    category: { aboutCategory: 'About This Category', noGames: 'No games in this category', gamesCount: 'games' },
    footer: { copyright: '© 2026 Free Games Hub' },
  },

  'zh-CN': {
    siteName: '免费游戏站',
    nav: { home: '首页', feedback: '意见反馈', language: '语言' },
    home: {
      title: '免费玩 Wordle, 数独, 2048 在线游戏',
      subtitle: '100+ 益智、文字、街机和策略游戏。无需下载，即开即玩！',
      featured: '精选游戏', allGames: '所有游戏', gamesCount: '款游戏', freeGames: '免费游戏',
      categories: '游戏分类', copyright: '© 2026 免费游戏站', aboutTitle: '关于免费游戏站', quickPlay: '快速游玩', quickPlayDesc: '立即体验最受欢迎的游戏', browseByCategory: '按分类浏览',
      gameGuides: '游戏攻略', viewAllGuides: '查看所有攻略 →',
      feature1Title: '完全免费 无限畅玩', feature1Desc: '所有游戏完全免费,无时间限制,无需注册即可畅玩。',
      feature2Title: '即开即玩 无需下载', feature2Desc: '所有游戏直接在浏览器中运行,无需安装任何应用程序。',
      feature3Title: '随时随地畅玩', feature3Desc: '支持电脑、平板和手机,随时随地享受游戏乐趣。',
      feature4Title: '益智健脑', feature4Desc: '通过数独、猜词等益智游戏锻炼逻辑思维、词汇量和记忆力。',
      feature5Title: '多语言支持', feature5Desc: '支持英语和简体中文两种语言。',
      feature6Title: '持续更新', feature6Desc: '定期添加新游戏,每周都有新挑战等你来体验。',
      aboutDesc: '免费游戏站是您免费在线益智游戏的终极目的地。我们提供超过 111+ 款游戏，涵盖 7 大类别 - 从经典文字谜题如 Wordle 到脑力训练逻辑游戏如数独，从怀旧街机游戏如俄罗斯方块到策略对战如象棋。所有游戏完全免费，无需下载，支持任何设备。无论您想提升词汇量、锻炼思维还是纯粹娱乐，立即开始游戏 - 无需注册！',
    },
    game: { loading: '加载中', error: '错误', backToHome: '返回首页', howToPlay: '游戏说明', tips: '技巧提示', viewGuide: '查看游戏指南', about: '关于', objectives: '目标', controls: '操作方式', mechanics: '游戏机制', features: '特色功能', faq: '常见问题', source: '来源' },
    feedback: {
      title: '意见反馈', type: '类型', bugReport: '错误报告', featureRequest: '功能请求',
      gameFeedback: '游戏反馈', other: '其他', message: '内容', messagePlaceholder: '详细描述您的意见...',
      email: '邮箱（选填）', emailPlaceholder: '用于回复', send: '发送', sending: '发送中...',
      success: '感谢您的意见反馈！', fail: '发送失败，请重试。'
    },
    category: { aboutCategory: '关于此分类', noGames: '此分类暂无游戏', gamesCount: '款游戏' },
    footer: { copyright: '© 2026 Free Games Hub' },
  },
}

// Category i18n for category pages
export const categoryI18n: Record<Language, Record<string, { name: string; desc: string }>> = {
  en: {
    word: { name: 'Word Games', desc: 'Word puzzles and vocabulary games for language learners' },
    logic: { name: 'Logic & Numbers', desc: 'Brain training logic and number puzzles' },
    strategy: { name: 'Strategy', desc: 'Strategy and board games to challenge your mind' },
    arcade: { name: 'Arcade', desc: 'Classic arcade games for nostalgic fun' },
    memory: { name: 'Memory & Reflex', desc: 'Memory and reflex training games' },
    skill: { name: 'Skill Games', desc: 'Test and improve your skills' },
    puzzle: { name: 'Puzzle', desc: 'Relaxing puzzle and matching games' },
  },

  'zh-CN': {
    word: { name: '文字游戏', desc: '文字谜题和词汇游戏' },
    logic: { name: '数字逻辑', desc: '大脑训练逻辑和数字谜题' },
    strategy: { name: '策略对战', desc: '策略和棋盘游戏' },
    arcade: { name: '经典街机', desc: '经典街机游戏' },
    memory: { name: '记忆反应', desc: '记忆和反应训练游戏' },
    skill: { name: '技能挑战', desc: '测试和提升你的能力' },
    puzzle: { name: '拼图消除', desc: '轻松的拼图和配对游戏' },
  },
}

// Category descriptions for category pages
export const categoryDescriptions: Record<Language, Record<string, { title: string; desc: string }>> = {
  en: {
    word: {
      title: 'Word Games - Expand Your Vocabulary',
      desc: `Word games are perfect for language learners and vocabulary enthusiasts. Our collection includes classic word puzzles like Wordle (guess the hidden word in 6 tries), Spelling Bee (form words from given letters), Word Search (find hidden words in grids), and Text Twist (rearrange letters to form words).

**Why Play Word Games?**
• **Improve Vocabulary** - Learn new words daily while having fun
• **Enhance Spelling** - Practice correct spelling in an engaging way
• **Language Learning** - Perfect for ESL/EFL students
• **Brain Training** - Keep your mind sharp with daily word challenges

Our word games range from easy to challenging, suitable for all skill levels. Whether you have 5 minutes or an hour, you'll find a word game that fits your schedule. All games are playable instantly in your browser - no downloads or registrations required!`
    },
    logic: {
      title: 'Logic & Number Puzzles - Train Your Brain',
      desc: `Logic puzzles are excellent for developing critical thinking and problem-solving skills. Our collection features Sudoku (classic number placement), 2048 (merge tiles to reach 2048), Nonogram (reveal hidden pictures), and many more brain-teasing challenges.

**Benefits of Logic Games:**
• **Critical Thinking** - Develop analytical reasoning skills
• **Pattern Recognition** - Train your brain to see patterns
• **Math Skills** - Practice arithmetic in a fun way
• **Patience & Focus** - Improve concentration and persistence

From simple number games to complex logic challenges, we have something for every skill level. Start with easier puzzles and work your way up to expert-level brain teasers. Track your progress and beat your best times!`
    },
    strategy: {
      title: 'Strategy Games - Outsmart Your Opponent',
      desc: `Strategy games challenge you to think ahead and plan your moves carefully. Play classic board games like Chess (the ultimate test of strategy), Gomoku (five in a row), Reversi (flip your opponent's pieces), and Checkers against smart AI opponents.

**Why Strategy Games Matter:**
• **Planning Skills** - Learn to think several moves ahead
• **Decision Making** - Weigh risks and rewards
• **Adaptability** - Adjust strategies based on opponent's moves
• **Patience** - Practice careful consideration over impulse

Whether you're a beginner learning the rules or a seasoned player seeking challenge, our AI opponents adapt to your skill level. Improve your game with unlimited practice sessions!`
    },
    arcade: {
      title: 'Arcade Games - Classic Fun Reimagined',
      desc: `Relive the golden age of arcade gaming with our collection of classic titles. Play Tetris (stack blocks and clear lines), Snake (grow your snake without hitting walls), Breakout (destroy all bricks), and other nostalgic favorites.

**Arcade Game Features:**
• **Nostalgic Fun** - Games you remember from childhood
• **Simple Controls** - Easy to learn, hard to master
• **Quick Sessions** - Perfect for short breaks
• **High Score Chasing** - Beat your personal best

These timeless games offer simple yet addictive gameplay that has entertained generations. Whether you're rediscovering classics or experiencing them for the first time, enjoy instant entertainment without downloads!`
    },
    memory: {
      title: 'Memory & Reflex Games - Sharpen Your Mind',
      desc: `Memory and reflex games are designed to train your brain and improve reaction times. Challenge yourself with Pattern Memory (remember sequences), Reaction Time tests, Simon Says (follow the pattern), and number sequence games.

**Benefits of Memory Training:**
• **Short-Term Memory** - Improve information retention
• **Reaction Speed** - Faster response times
• **Concentration** - Better focus and attention
• **Cognitive Health** - Keep your brain young and active

These games are proven to enhance short-term memory and cognitive processing speed. Just 10-15 minutes daily can make a noticeable difference in your mental sharpness!`
    },
    skill: {
      title: 'Skill Games - Test Your Abilities',
      desc: `Skill games put your specific abilities to the test. Try our Typing Test to measure your WPM, Aim Trainer to improve your precision, Trivia Quiz to challenge your knowledge, and various other skill-based challenges.

**What You Can Improve:**
• **Typing Speed** - Increase your words per minute
• **Hand-Eye Coordination** - Better precision and accuracy
• **General Knowledge** - Learn facts while having fun
• **Quick Thinking** - Make decisions under time pressure

Track your progress over time and see measurable improvement. Compare your scores with friends and challenge yourself to reach new personal records!`
    },
    puzzle: {
      title: 'Puzzle Games - Relax and Solve',
      desc: `Puzzle games offer relaxing entertainment while engaging your mind. Enjoy Mahjong (match tiles to clear the board), Block Puzzle (fit pieces perfectly), Jigsaw puzzles, and various tile-matching games.

**Why Play Puzzle Games:**
• **Stress Relief** - Calming, meditative gameplay
• **Problem Solving** - Exercise your brain gently
• **Visual Thinking** - Improve spatial awareness
• **Achievement** - Satisfying completion feelings

Perfect for unwinding after a long day or keeping your mind active during breaks. No time pressure - solve at your own pace and enjoy the satisfaction of completing each puzzle!`
    },
  },

  'zh-CN': {
    word: { title: '文字游戏 - 扩展您的词汇量', desc: '文字游戏非常适合语言学习者和词汇爱好者。我们的合集包括 Wordle、Spelling Bee、Word Search 等经典文字谜题。在娱乐的同时提升词汇量和拼写能力！' },
    logic: { title: '数字逻辑 - 训练您的大脑', desc: '逻辑谜题非常适合培养批判性思维和解决问题的能力。数独、2048、数织（Nonogram）等脑力训练游戏，从入门到专家级应有尽有。' },
    strategy: { title: '策略对战 - 智胜对手', desc: '策略游戏考验您的前瞻思维和周密计划能力。国际象棋、五子棋、黑白棋等经典棋盘游戏对战智能AI。学习规划与适应策略！' },
    arcade: { title: '经典街机 - 重温黄金时代', desc: '通过我们的经典游戏合集重温街机游戏的黄金时代。俄罗斯方块、贪吃蛇、吃豆人等怀旧经典。简单却令人上瘾的游戏体验！' },
    memory: { title: '记忆反应 - 锻炼您的思维', desc: '记忆和反应游戏专为训练大脑和提高反应速度而设计。图案记忆、数字序列、反应测试，每天10-15分钟显著提升脑力！' },
    skill: { title: '技能挑战 - 测试您的能力', desc: '技能游戏测试您的特定能力。打字测试测量您的 WPM、瞄准训练器提高精准度、冷知识测验挑战知识储备。' },
    puzzle: { title: '拼图消除 - 放松解谜', desc: '拼图游戏提供放松的娱乐体验。麻将、方块拼图、拼图等配对消除游戏。在休息时刻保持大脑活跃。' },
  },
}

export function getI18n(lang: Language) {
  return i18n[lang] || i18n.en
}

export function getCategoryI18n(lang: Language) {
  return categoryI18n[lang] || categoryI18n.en
}

export function getCategoryDescription(lang: Language) {
  return categoryDescriptions[lang] || categoryDescriptions.en
}
