// Multi-language support for RuleWord
export type Language = 'en' | 'fr' | 'de' | 'es' | 'ru' | 'ja' | 'zh-TW' | 'zh-CN'

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'zh-TW', name: 'Chinese Traditional', nativeName: '繁體中文' },
  { code: 'zh-CN', name: 'Chinese Simplified', nativeName: '简体中文' },
]

export const i18n: Record<Language, {
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
    nav: { home: 'Home', feedback: 'Feedback', language: 'Language' },
    home: {
      title: 'Free Online Puzzle Games',
      subtitle: 'Classic puzzles, strategy games, arcade fun. No downloads, play instantly.',
      featured: 'Featured Games', allGames: 'All Games', gamesCount: 'games', freeGames: 'Free Games',
      categories: 'Categories', copyright: '© 2026 RuleWord', aboutTitle: 'About RuleWord',
      feature1Title: '100% Free & Unlimited', feature1Desc: 'Play all games without any cost or time limits. No registration required.',
      feature2Title: 'Instant Play, No Downloads', feature2Desc: 'All games run directly in your browser. No app installation needed.',
      feature3Title: 'Play Anywhere', feature3Desc: 'Works on desktop, tablet, and mobile devices. Enjoy games on the go.',
      feature4Title: 'Brain Training', feature4Desc: 'Improve your logic, vocabulary, memory and reflexes with our puzzles.',
      feature5Title: 'Multi-Language Support', feature5Desc: 'Available in 8 languages including English, Chinese, Japanese and more.',
      feature6Title: 'Always Growing', feature6Desc: 'New games added regularly. Fresh challenges await you every week.',
      aboutDesc: 'RuleWord is your ultimate destination for free online puzzle games. We believe gaming should be simple, joyful, and accessible to everyone.',
    },
    game: { loading: 'Loading', error: 'Error', backToHome: 'Back to Home', howToPlay: 'How to Play', tips: 'Tips', viewGuide: 'View Game Guide' },
    category: { aboutCategory: 'About This Category', noGames: 'No games in this category', gamesCount: 'games' },
    footer: { copyright: '© 2026 RuleWord' },
  },
  fr: {
    nav: { home: 'Accueil', feedback: 'Commentaires', language: 'Langue' },
    home: {
      title: 'Jeux de Puzzle en Ligne Gratuits',
      subtitle: 'Puzzles classiques, jeux de stratégie, arcade. Sans téléchargement, jouez instantanément.',
      featured: 'Jeux en Vedette', allGames: 'Tous les Jeux', gamesCount: 'jeux', freeGames: 'Jeux Gratuits',
      categories: 'Catégories', copyright: '© 2026 RuleWord', aboutTitle: 'À Propos de RuleWord',
      feature1Title: '100% Gratuit et Illimité', feature1Desc: 'Jouez à tous les jeux sans aucun coût ni limite de temps.',
      feature2Title: 'Jeu Instantané, Sans Téléchargement', feature2Desc: 'Tous les jeux fonctionnent directement dans votre navigateur.',
      feature3Title: 'Jouez Partout', feature3Desc: 'Compatible ordinateur, tablette et mobile.',
      feature4Title: 'Entraînement Cérébral', feature4Desc: 'Améliorez votre logique, vocabulaire, mémoire et réflexes.',
      feature5Title: 'Support Multilingue', feature5Desc: 'Disponible en 8 langues.',
      feature6Title: 'Toujours en Croissance', feature6Desc: 'Nouveaux jeux ajoutés régulièrement.',
      aboutDesc: 'RuleWord est votre destination ultime pour les jeux de puzzle en ligne gratuits.',
    },
    game: { loading: 'Chargement', error: 'Erreur', backToHome: "Retour à l'accueil", howToPlay: 'Comment Jouer', tips: 'Conseils', viewGuide: 'Voir le Guide' },
    category: { aboutCategory: 'À Propos de Cette Catégorie', noGames: 'Aucun jeu dans cette catégorie', gamesCount: 'jeux' },
    footer: { copyright: '© 2026 RuleWord' },
  },
  de: {
    nav: { home: 'Startseite', feedback: 'Feedback', language: 'Sprache' },
    home: {
      title: 'Kostenlose Online-Puzzlespiele',
      subtitle: 'Klassische Puzzles, Strategiespiele, Arcade-Spaß. Kein Download, sofort spielen.',
      featured: 'Empfohlene Spiele', allGames: 'Alle Spiele', gamesCount: 'Spiele', freeGames: 'Kostenlose Spiele',
      categories: 'Kategorien', copyright: '© 2026 RuleWord', aboutTitle: 'Über RuleWord',
      feature1Title: '100% Kostenlos & Unbegrenzt', feature1Desc: 'Spielen Sie alle Spiele ohne Kosten oder Zeitlimits.',
      feature2Title: 'Sofort Spielen, Kein Download', feature2Desc: 'Alle Spiele laufen direkt in Ihrem Browser.',
      feature3Title: 'Überall Spielen', feature3Desc: 'Funktioniert auf Desktop, Tablet und Mobilgeräten.',
      feature4Title: 'Gehirntraining', feature4Desc: 'Verbessern Sie Logik, Wortschatz, Gedächtnis und Reflexe.',
      feature5Title: 'Mehrsprachige Unterstützung', feature5Desc: 'Verfügbar in 8 Sprachen.',
      feature6Title: 'Ständiges Wachstum', feature6Desc: 'Regelmäßig neue Spiele.',
      aboutDesc: 'RuleWord ist Ihre ultimative Anlaufstelle für kostenlose Online-Puzzlespiele.',
    },
    game: { loading: 'Laden', error: 'Fehler', backToHome: 'Zurück zur Startseite', howToPlay: 'Spielanleitung', tips: 'Tipps', viewGuide: 'Spielanleitung Anzeigen' },
    category: { aboutCategory: 'Über Diese Kategorie', noGames: 'Keine Spiele in dieser Kategorie', gamesCount: 'Spiele' },
    footer: { copyright: '© 2026 RuleWord' },
  },
  es: {
    nav: { home: 'Inicio', feedback: 'Comentarios', language: 'Idioma' },
    home: {
      title: 'Juegos de Puzzle en Línea Gratuitos',
      subtitle: 'Puzzles clásicos, juegos de estrategia, diversión arcade. Sin descargas, juega al instante.',
      featured: 'Juegos Destacados', allGames: 'Todos los Juegos', gamesCount: 'juegos', freeGames: 'Juegos Gratis',
      categories: 'Categorías', copyright: '© 2026 RuleWord', aboutTitle: 'Sobre RuleWord',
      feature1Title: '100% Gratis e Ilimitado', feature1Desc: 'Juega todos los juegos sin costo ni límites de tiempo.',
      feature2Title: 'Juego Instantáneo, Sin Descargas', feature2Desc: 'Todos los juegos funcionan directamente en tu navegador.',
      feature3Title: 'Juega en Cualquier Lugar', feature3Desc: 'Funciona en escritorio, tablet y móvil.',
      feature4Title: 'Entrenamiento Mental', feature4Desc: 'Mejora tu lógica, vocabulario, memoria y reflejos.',
      feature5Title: 'Soporte Multilingüe', feature5Desc: 'Disponible en 8 idiomas.',
      feature6Title: 'Siempre Creciendo', feature6Desc: 'Nuevos juegos añadidos regularmente.',
      aboutDesc: 'RuleWord es tu destino definitivo para juegos de puzzle en línea gratuitos.',
    },
    game: { loading: 'Cargando', error: 'Error', backToHome: 'Volver al Inicio', howToPlay: 'Cómo Jugar', tips: 'Consejos', viewGuide: 'Ver Guía del Juego' },
    category: { aboutCategory: 'Sobre Esta Categoría', noGames: 'No hay juegos en esta categoría', gamesCount: 'juegos' },
    footer: { copyright: '© 2026 RuleWord' },
  },
  ru: {
    nav: { home: 'Главная', feedback: 'Обратная связь', language: 'Язык' },
    home: {
      title: 'Бесплатные Онлайн Головоломки',
      subtitle: 'Классические головоломки, стратегии, аркады. Без загрузок, играйте мгновенно.',
      featured: 'Рекомендуемые Игры', allGames: 'Все Игры', gamesCount: 'игр', freeGames: 'Бесплатные Игры',
      categories: 'Категории', copyright: '© 2026 RuleWord', aboutTitle: 'О RuleWord',
      feature1Title: '100% Бесплатно и Безлимитно', feature1Desc: 'Играйте во все игры бесплатно и без ограничений.',
      feature2Title: 'Мгновенная Игра, Без Загрузок', feature2Desc: 'Все игры работают прямо в браузере.',
      feature3Title: 'Играйте Везде', feature3Desc: 'Работает на компьютере, планшете и телефоне.',
      feature4Title: 'Тренировка Мозга', feature4Desc: 'Улучшайте логику, словарный запас, память и рефлексы.',
      feature5Title: 'Многоязычная Поддержка', feature5Desc: 'Доступно на 8 языках.',
      feature6Title: 'Постоянное Развитие', feature6Desc: 'Новые игры добавляются регулярно.',
      aboutDesc: 'RuleWord — ваш главный центр бесплатных онлайн-головоломок.',
    },
    game: { loading: 'Загрузка', error: 'Ошибка', backToHome: 'Вернуться на главную', howToPlay: 'Как Играть', tips: 'Советы', viewGuide: 'Смотреть Руководство' },
    category: { aboutCategory: 'Об Этой Категории', noGames: 'Нет игр в этой категории', gamesCount: 'игр' },
    footer: { copyright: '© 2026 RuleWord' },
  },
  ja: {
    nav: { home: 'ホーム', feedback: 'フィードバック', language: '言語' },
    home: {
      title: '無料オンラインパズルゲーム',
      subtitle: '定番パズル、ストラテジーゲーム、アーケード。ダウンロード不要、すぐに遊べます。',
      featured: 'おすすめゲーム', allGames: 'すべてのゲーム', gamesCount: 'ゲーム', freeGames: '無料ゲーム',
      categories: 'カテゴリー', copyright: '© 2026 RuleWord', aboutTitle: 'RuleWordについて',
      feature1Title: '100%無料で無制限', feature1Desc: 'すべてのゲームを無料で制限なくプレイ。',
      feature2Title: '今すぐプレイ、ダウンロード不要', feature2Desc: 'すべてのゲームはブラウザで直接動作。',
      feature3Title: 'どこでもプレイ', feature3Desc: 'PC、タブレット、スマートフォンに対応。',
      feature4Title: '脳のトレーニング', feature4Desc: 'パズルで論理的思考、語彙力、記憶力、反射神経を向上。',
      feature5Title: '多言語対応', feature5Desc: '英語、中国語、日本語など8言語に対応。',
      feature6Title: '常に進化', feature6Desc: '定期的に新ゲームを追加。',
      aboutDesc: 'RuleWordは無料オンラインパズルゲームの究極の目的地です。',
    },
    game: { loading: '読み込み中', error: 'エラー', backToHome: 'ホームに戻る', howToPlay: '遊び方', tips: 'ヒント', viewGuide: 'ゲームガイドを見る' },
    category: { aboutCategory: 'このカテゴリーについて', noGames: 'このカテゴリーにゲームはありません', gamesCount: 'ゲーム' },
    footer: { copyright: '© 2026 RuleWord' },
  },
  'zh-TW': {
    nav: { home: '首頁', feedback: '意見反饋', language: '語言' },
    home: {
      title: '免費線上益智遊戲',
      subtitle: '經典益智、策略遊戲、街機樂趣。無需下載,即開即玩。',
      featured: '精選遊戲', allGames: '所有遊戲', gamesCount: '個遊戲', freeGames: '免費遊戲',
      categories: '遊戲分類', copyright: '© 2026 RuleWord', aboutTitle: '關於 RuleWord',
      feature1Title: '完全免費 無限暢玩', feature1Desc: '所有遊戲完全免費,無時間限制,無需註冊即可暢玩。',
      feature2Title: '即開即玩 無需下載', feature2Desc: '所有遊戲直接在瀏覽器中運行,無需安裝任何應用程式。',
      feature3Title: '隨時隨地暢玩', feature3Desc: '支援電腦、平板和手機,隨時隨地享受遊戲樂趣。',
      feature4Title: '益智健腦', feature4Desc: '透過數獨、猜詞等益智遊戲鍛鍊邏輯思維、詞彙量和記憶力。',
      feature5Title: '多語言支援', feature5Desc: '支援英語、中文、日語等8種語言。',
      feature6Title: '持續更新', feature6Desc: '定期添加新遊戲,每週都有新挑戰等你來體驗。',
      aboutDesc: 'RuleWord 是您免費線上益智遊戲的終極目的地。',
    },
    game: { loading: '載入中', error: '錯誤', backToHome: '返回首頁', howToPlay: '遊戲說明', tips: '技巧提示', viewGuide: '查看遊戲指南' },
    category: { aboutCategory: '關於此分類', noGames: '此分類暫無遊戲', gamesCount: '個遊戲' },
    footer: { copyright: '© 2026 RuleWord' },
  },
  'zh-CN': {
    nav: { home: '首页', feedback: '意见反馈', language: '语言' },
    home: {
      title: '免费在线益智游戏',
      subtitle: '经典益智、策略游戏、街机乐趣。无需下载,即开即玩。',
      featured: '精选游戏', allGames: '所有游戏', gamesCount: '款游戏', freeGames: '免费游戏',
      categories: '游戏分类', copyright: '© 2026 RuleWord', aboutTitle: '关于 RuleWord',
      feature1Title: '完全免费 无限畅玩', feature1Desc: '所有游戏完全免费,无时间限制,无需注册即可畅玩。',
      feature2Title: '即开即玩 无需下载', feature2Desc: '所有游戏直接在浏览器中运行,无需安装任何应用程序。',
      feature3Title: '随时随地畅玩', feature3Desc: '支持电脑、平板和手机,随时随地享受游戏乐趣。',
      feature4Title: '益智健脑', feature4Desc: '通过数独、猜词等益智游戏锻炼逻辑思维、词汇量和记忆力。',
      feature5Title: '多语言支持', feature5Desc: '支持英语、中文、日语等8种语言。',
      feature6Title: '持续更新', feature6Desc: '定期添加新游戏,每周都有新挑战等你来体验。',
      aboutDesc: 'RuleWord 是您免费在线益智游戏的终极目的地。',
    },
    game: { loading: '加载中', error: '错误', backToHome: '返回首页', howToPlay: '游戏说明', tips: '技巧提示', viewGuide: '查看游戏指南' },
    category: { aboutCategory: '关于此分类', noGames: '此分类暂无游戏', gamesCount: '款游戏' },
    footer: { copyright: '© 2026 RuleWord' },
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
  },
  fr: {
    word: { name: 'Jeux de Mots', desc: 'Puzzles de mots et jeux de vocabulaire' },
    logic: { name: 'Logique & Nombres', desc: 'Entraînement cérébral logique et numérique' },
    strategy: { name: 'Stratégie', desc: 'Jeux de stratégie et de plateau' },
    arcade: { name: 'Arcade', desc: 'Jeux arcade classiques pour la nostalgie' },
    memory: { name: 'Mémoire & Réflexes', desc: "Jeux d'entraînement de mémoire et réflexes" },
  },
  de: {
    word: { name: 'Wortspiele', desc: 'Worträtsel und Vokabelspiele' },
    logic: { name: 'Logik & Zahlen', desc: 'Gehirntraining mit Logik- und Zahlenrätseln' },
    strategy: { name: 'Strategie', desc: 'Strategie- und Brettspiele' },
    arcade: { name: 'Arcade', desc: 'Klassische Arcade-Spiele für Nostalgie' },
    memory: { name: 'Gedächtnis & Reflexe', desc: 'Gedächtnis- und Reflextraining' },
  },
  es: {
    word: { name: 'Juegos de Palabras', desc: 'Puzzles de palabras y juegos de vocabulario' },
    logic: { name: 'Lógica & Números', desc: 'Puzzles de lógica y números para entrenar el cerebro' },
    strategy: { name: 'Estrategia', desc: 'Juegos de estrategia y tablero' },
    arcade: { name: 'Arcade', desc: 'Juegos arcade clásicos para diversión nostálgica' },
    memory: { name: 'Memoria & Reflejos', desc: 'Juegos de entrenamiento de memoria y reflejos' },
  },
  ru: {
    word: { name: 'Словесные Игры', desc: 'Словесные головоломки и игры на словарный запас' },
    logic: { name: 'Логика & Числа', desc: 'Логические и числовые головоломки для тренировки мозга' },
    strategy: { name: 'Стратегия', desc: 'Стратегические и настольные игры' },
    arcade: { name: 'Аркада', desc: 'Классические аркадные игры для ностальгии' },
    memory: { name: 'Память & Рефлексы', desc: 'Игры для тренировки памяти и рефлексов' },
  },
  ja: {
    word: { name: 'ワードゲーム', desc: '語彙力を鍛える言葉パズル' },
    logic: { name: 'ロジック & 数字', desc: '脳トレ論理パズルと数字ゲーム' },
    strategy: { name: 'ストラテジー', desc: '戦略ボードゲーム' },
    arcade: { name: 'アーケード', desc: '懐かしいクラシックアーケードゲーム' },
    memory: { name: '記憶 & 反射神経', desc: '記憶力と反射神経トレーニング' },
  },
  'zh-TW': {
    word: { name: '文字遊戲', desc: '文字謎題和詞彙遊戲' },
    logic: { name: '數字邏輯', desc: '大腦訓練邏輯和數字謎題' },
    strategy: { name: '策略對戰', desc: '策略和棋盤遊戲' },
    arcade: { name: '經典街機', desc: '經典街機遊戲' },
    memory: { name: '記憶反應', desc: '記憶和反應訓練遊戲' },
  },
  'zh-CN': {
    word: { name: '文字游戏', desc: '文字谜题和词汇游戏' },
    logic: { name: '数字逻辑', desc: '大脑训练逻辑和数字谜题' },
    strategy: { name: '策略对战', desc: '策略和棋盘游戏' },
    arcade: { name: '经典街机', desc: '经典街机游戏' },
    memory: { name: '记忆反应', desc: '记忆和反应训练游戏' },
  },
}

// Category descriptions for category pages
export const categoryDescriptions: Record<Language, Record<string, { title: string; desc: string }>> = {
  en: {
    word: {
      title: 'Word Games - Expand Your Vocabulary',
      desc: 'Word games are perfect for language learners and vocabulary enthusiasts. Our collection includes classic word puzzles like Wordle, These games help improve your spelling, expand your vocabulary, and sharpen your language skills while having fun.'
    },
    logic: {
      title: 'Logic & Number Puzzles - Train Your Brain',
      desc: 'Logic puzzles are excellent for developing critical thinking and problem-solving skills. Our collection features Sudoku, Nonogram, From simple number games to complex logic challenges, there is something for every skill level.'
    },
    strategy: {
      title: 'Strategy Games - Outsmart Your Opponent',
      desc: 'Strategy games challenge you to think ahead and plan your moves carefully. Play classic board games like Chess, Gomoku, and Reversi against AI opponents. These games teach valuable lessons about planning and adapting strategies.'
    },
    arcade: {
      title: 'Arcade Games - Classic Fun Reimagined',
      desc: 'Relive the golden age of arcade gaming with our collection of classic titles. Play Tetris, Pac-Man, Snake, and other nostalgic favorites. These timeless games offer simple yet addictive gameplay.'
    },
    memory: {
      title: 'Memory & Reflex Games - Sharpen Your Mind',
      desc: 'Memory and reflex games are designed to train your brain and improve reaction times. Challenge yourself with pattern memory, number sequences, and quick-reflex tests. These games are proven to enhance short-term memory and cognitive processing speed.'
    },
  },
  fr: {
    word: { title: 'Jeux de Mots - Enrichissez Votre Vocabulaire', desc: 'Les jeux de mots sont parfaits pour les apprenants de langues. Notre collection comprend des puzzles classiques comme Wordle.' },
    logic: { title: 'Puzzles Logiques & Numériques - Entraînez Votre Cerveau', desc: 'Les puzzles logiques sont excellents pour développer la pensée critique.' },
    strategy: { title: 'Jeux de Stratégie - Surpassez Votre Adversaire', desc: 'Les jeux de stratégie vous défient à penser à l\'avance.' },
    arcade: { title: 'Jeux Arcade - Divertissement Classique Réinventé', desc: 'Revivez l\'âge d\'or des jeux arcade.' },
    memory: { title: 'Jeux de Mémoire & Réflexes - Aiguisez Votre Esprit', desc: 'Les jeux de mémoire et de réflexes sont conçus pour entraîner votre cerveau.' },
  },
  de: {
    word: { title: 'Wortspiele - Erweitern Sie Ihren Wortschatz', desc: 'Wortspiele sind perfekt für Sprachenlerner.' },
    logic: { title: 'Logik- & Zahlenrätsel - Trainieren Sie Ihr Gehirn', desc: 'Logikrätsel sind hervorragend zur Entwicklung von kritischem Denken.' },
    strategy: { title: 'Strategiespiele - Überlisten Sie Ihren Gegner', desc: 'Strategiespiele fordern Sie heraus, vorauszudenken.' },
    arcade: { title: 'Arcade-Spiele - Klassischer Spaß Neu Erlebt', desc: 'Erleben Sie das goldene Zeitalter der Arcade-Spiele.' },
    memory: { title: 'Gedächtnis- & Reflexspiele - Schärfen Sie Ihren Verstand', desc: 'Gedächtnis- und Reflexspiele sind darauf ausgelegt, Ihr Gehirn zu trainieren.' },
  },
  es: {
    word: { title: 'Juegos de Palabras - Expande Tu Vocabulario', desc: 'Los juegos de palabras son perfectos para estudiantes de idiomas.' },
    logic: { title: 'Puzzles de Lógica & Números - Entrena Tu Cerebro', desc: 'Los puzzles de lógica son excelentes para desarrollar el pensamiento crítico.' },
    strategy: { title: 'Juegos de Estrategia - Supera a Tu Oponente', desc: 'Los juegos de estrategia te desafían a pensar adelante.' },
    arcade: { title: 'Juegos Arcade - Diversión Clásica Reinventada', desc: 'Revive la edad de oro de los juegos arcade.' },
    memory: { title: 'Juegos de Memoria & Reflejos - Agudiza Tu Mente', desc: 'Los juegos de memoria y reflejos están diseñados para entrenar tu cerebro.' },
  },
  ru: {
    word: { title: 'Словесные Игры - Расширяйте Словарный Запас', desc: 'Словесные игры идеально подходят для изучающих языки.' },
    logic: { title: 'Логические & Числовые Головоломки - Тренируйте Мозг', desc: 'Логические головоломки отлично подходят для развития критического мышления.' },
    strategy: { title: 'Стратегические Игры - Перехитрите Соперника', desc: 'Стратегические игры заставляют вас думать наперёд.' },
    arcade: { title: 'Аркадные Игры - Классическое Развлечение', desc: 'Заново переживите золотой век аркадных игр.' },
    memory: { title: 'Игры на Память & Рефлексы - Острите Ум', desc: 'Игры на память и рефлексы разработаны для тренировки мозга.' },
  },
  ja: {
    word: { title: 'ワードゲーム - 語彙力を拡張', desc: 'ワードゲームは言語学習者と語彙愛好家に最適です。' },
    logic: { title: 'ロジック & 数字パズル - 脳を鍛える', desc: 'ロジックパズルは批判的思考と問題解決能力の発達に最適です。' },
    strategy: { title: 'ストラテジーゲーム - 対戦相手を出し抜く', desc: 'ストラテジーゲームは先を読んで慎重に手を計画することを求めます。' },
    arcade: { title: 'アーケードゲーム - クラシックの楽しさ', desc: 'クラシックタイトルのコレクションでアーケードゲームの黄金時代を追体験しましょう。' },
    memory: { title: '記憶 & 反射神経ゲーム - 脳を鋭くする', desc: '記憶と反射神経のゲームは脳を鍛え、反応時間を向上させるように設計されています。' },
  },
  'zh-TW': {
    word: { title: '文字遊戲 - 擴展您的詞彙量', desc: '文字遊戲非常適合語言學習者和詞彙愛好者。' },
    logic: { title: '數字邏輯 - 訓練您的大腦', desc: '邏輯謎題非常適合培養批判性思維和解決問題的能力。' },
    strategy: { title: '策略對戰 - 智勝對手', desc: '策略遊戲考驗您的前瞻思維和周密計劃能力。' },
    arcade: { title: '經典街機 - 重溫黃金時代', desc: '透過我們的經典遊戲合集重溫街機遊戲的黃金時代。' },
    memory: { title: '記憶反應 - 鍛鍊您的思維', desc: '記憶和反應遊戲專為訓練大腦和提高反應速度而設計。' },
  },
  'zh-CN': {
    word: { title: '文字游戏 - 扩展您的词汇量', desc: '文字游戏非常适合语言学习者和词汇爱好者。' },
    logic: { title: '数字逻辑 - 训练您的大脑', desc: '逻辑谜题非常适合培养批判性思维和解决问题的能力。' },
    strategy: { title: '策略对战 - 智胜对手', desc: '策略游戏考验您的前瞻思维和周密计划能力。' },
    arcade: { title: '经典街机 - 重温黄金时代', desc: '通过我们的经典游戏合集重温街机游戏的黄金时代。' },
    memory: { title: '记忆反应 - 锻炼您的思维', desc: '记忆和反应游戏专为训练大脑和提高反应速度而设计。' },
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
