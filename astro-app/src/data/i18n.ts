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
      aboutDesc: 'RuleWord is your ultimate destination for free online puzzle games. With over 103+ games across 7 categories, we offer something for everyone - from classic word puzzles like Wordle to brain-training logic games like Sudoku, from nostalgic arcade hits like Tetris to strategic challenges like Chess. All games are 100% free, require no downloads, and work on any device. Whether you want to improve your vocabulary, sharpen your mind, or just have fun, start playing now - no registration required!',
    },
    game: { loading: 'Loading', error: 'Error', backToHome: 'Back to Home', howToPlay: 'How to Play', tips: 'Tips', viewGuide: 'View Game Guide', about: 'About', objectives: 'Objectives', controls: 'Controls', mechanics: 'Game Mechanics', features: 'Features', faq: 'Frequently Asked Questions', source: 'Source' },
    feedback: {
      title: 'Feedback', type: 'Type', bugReport: 'Bug Report', featureRequest: 'Feature Request',
      gameFeedback: 'Game Feedback', other: 'Other', message: 'Message', messagePlaceholder: 'Describe your feedback...',
      email: 'Email (optional)', emailPlaceholder: 'For reply', send: 'Send Feedback', sending: 'Sending...',
      success: 'Thank you for your feedback!', fail: 'Failed to send feedback. Please try again.'
    },
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
      aboutDesc: 'RuleWord est votre destination ultime pour les jeux de puzzle en ligne gratuits. Avec plus de 103 jeux dans 7 catégories, nous offrons quelque chose pour tout le monde - des puzzles de mots classiques comme Wordle aux jeux de logique comme Sudoku, des succès arcade nostalgiques comme Tetris aux défis stratégiques comme les Échecs. Tous les jeux sont 100% gratuits, sans téléchargement et fonctionnent sur tous les appareils. Jouez maintenant - aucune inscription requise!',
    },
    game: { loading: 'Chargement', error: 'Erreur', backToHome: "Retour à l'accueil", howToPlay: 'Comment Jouer', tips: 'Conseils', viewGuide: 'Voir le Guide', about: 'À Propos', objectives: 'Objectifs', controls: 'Contrôles', mechanics: 'Mécaniques de Jeu', features: 'Fonctionnalités', faq: 'Questions Fréquentes', source: 'Source' },
    feedback: {
      title: 'Commentaires', type: 'Type', bugReport: 'Rapport de Bug', featureRequest: 'Demande de Fonctionnalité',
      gameFeedback: 'Retour sur le Jeu', other: 'Autre', message: 'Message', messagePlaceholder: 'Décrivez vos commentaires...',
      email: 'Email (optionnel)', emailPlaceholder: 'Pour répondre', send: 'Envoyer', sending: 'Envoi...',
      success: 'Merci pour vos commentaires!', fail: 'Échec de l\'envoi. Veuillez réessayer.'
    },
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
      aboutDesc: 'RuleWord ist Ihre ultimative Anlaufstelle für kostenlose Online-Puzzlespiele. Mit über 103+ Spielen in 7 Kategorien bieten wir für jeden etwas - von klassischen Worträtseln wie Wordle bis zu Logikspielen wie Sudoku, von nostalgischen Arcade-Hits wie Tetris bis zu strategischen Herausforderungen wie Schach. Alle Spiele sind 100% kostenlos, erfordern keine Downloads und funktionieren auf jedem Gerät. Jetzt spielen - keine Registrierung erforderlich!',
    },
    game: { loading: 'Laden', error: 'Fehler', backToHome: 'Zurück zur Startseite', howToPlay: 'Spielanleitung', tips: 'Tipps', viewGuide: 'Spielanleitung Anzeigen', about: 'Über', objectives: 'Ziele', controls: 'Steuerung', mechanics: 'Spielmechanik', features: 'Funktionen', faq: 'Häufig Gestellte Fragen', source: 'Quelle' },
    feedback: {
      title: 'Feedback', type: 'Typ', bugReport: 'Fehlerbericht', featureRequest: 'Funktionswunsch',
      gameFeedback: 'Spiel-Feedback', other: 'Sonstiges', message: 'Nachricht', messagePlaceholder: 'Beschreiben Sie Ihr Feedback...',
      email: 'E-Mail (optional)', emailPlaceholder: 'Für Antwort', send: 'Senden', sending: 'Senden...',
      success: 'Vielen Dank für Ihr Feedback!', fail: 'Senden fehlgeschlagen. Bitte versuchen Sie es erneut.'
    },
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
      aboutDesc: 'RuleWord es tu destino definitivo para juegos de puzzle en línea gratuitos. Con más de 103+ juegos en 7 categorías, ofrecemos algo para todos - desde rompecabezas de palabras clásicos como Wordle hasta juegos de lógica como Sudoku, desde éxitos arcade nostálgicos como Tetris hasta desafíos estratégicos como Ajedrez. Todos los juegos son 100% gratuitos, no requieren descarga y funcionan en cualquier dispositivo. ¡Juega ahora - sin registro requerido!',
    },
    game: { loading: 'Cargando', error: 'Error', backToHome: 'Volver al Inicio', howToPlay: 'Cómo Jugar', tips: 'Consejos', viewGuide: 'Ver Guía del Juego', about: 'Acerca de', objectives: 'Objetivos', controls: 'Controles', mechanics: 'Mecánicas del Juego', features: 'Características', faq: 'Preguntas Frecuentes', source: 'Fuente' },
    feedback: {
      title: 'Comentarios', type: 'Tipo', bugReport: 'Informe de Error', featureRequest: 'Solicitud de Función',
      gameFeedback: 'Comentarios del Juego', other: 'Otro', message: 'Mensaje', messagePlaceholder: 'Describe tus comentarios...',
      email: 'Email (opcional)', emailPlaceholder: 'Para responder', send: 'Enviar', sending: 'Enviando...',
      success: '¡Gracias por tus comentarios!', fail: 'Error al enviar. Por favor, inténtalo de nuevo.'
    },
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
      aboutDesc: 'RuleWord — ваш главный центр бесплатных онлайн-головоломок. С более чем 103+ играми в 7 категориях мы предлагаем что-то для каждого - от классических словесных головоломок как Wordle до логических игр как Судоку, от ностальгических аркад как Тетрис до стратегических вызовов как Шахматы. Все игры полностью бесплатны, не требуют загрузки и работают на любом устройстве. Играйте сейчас - регистрация не требуется!',
    },
    game: { loading: 'Загрузка', error: 'Ошибка', backToHome: 'Вернуться на главную', howToPlay: 'Как Играть', tips: 'Советы', viewGuide: 'Смотреть Руководство', about: 'О Игре', objectives: 'Цели', controls: 'Управление', mechanics: 'Механика Игры', features: 'Особенности', faq: 'Часто Задаваемые Вопросы', source: 'Источник' },
    feedback: {
      title: 'Обратная связь', type: 'Тип', bugReport: 'Сообщение об ошибке', featureRequest: 'Запрос функции',
      gameFeedback: 'Отзыв об игре', other: 'Другое', message: 'Сообщение', messagePlaceholder: 'Опишите ваш отзыв...',
      email: 'Email (опционально)', emailPlaceholder: 'Для ответа', send: 'Отправить', sending: 'Отправка...',
      success: 'Спасибо за ваш отзыв!', fail: 'Не удалось отправить. Попробуйте снова.'
    },
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
      aboutDesc: 'RuleWordは無料オンラインパズルゲームの究極の目的地です。7つのカテゴリーで103以上のゲームを提供し、Wordleのような古典的なワードパズルから数独のようなロジックゲーム、テトリスのような懐かしいアーケードからチェスのような戦略的チャレンジまで、すべての人に何かを提供します。すべてのゲームは100%無料で、ダウンロード不要、どのデバイスでも動作します。今すぐプレイ - 登録不要！',
    },
    game: { loading: '読み込み中', error: 'エラー', backToHome: 'ホームに戻る', howToPlay: '遊び方', tips: 'ヒント', viewGuide: 'ゲームガイドを見る', about: '概要', objectives: '目標', controls: '操作方法', mechanics: 'ゲームメカニクス', features: '機能', faq: 'よくある質問', source: 'ソース' },
    feedback: {
      title: 'フィードバック', type: '種類', bugReport: 'バグ報告', featureRequest: '機能リクエスト',
      gameFeedback: 'ゲームの感想', other: 'その他', message: 'メッセージ', messagePlaceholder: 'フィードバックを詳しくご記入ください...',
      email: 'メール（任意）', emailPlaceholder: '返信が必要な場合', send: '送信', sending: '送信中...',
      success: 'フィードバックありがとうございます！', fail: '送信に失敗しました。もう一度お試しください。'
    },
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
      aboutDesc: 'RuleWord 是您免費線上益智遊戲的終極目的地。我們提供超過 103+ 款遊戲，涵蓋 7 大類別 - 從經典文字謎題如 Wordle 到腦力訓練邏輯遊戲如數獨，從懷舊街機遊戲如俄羅斯方塊到策略對戰如象棋。所有遊戲完全免費，無需下載，支援任何裝置。無論您想提升詞彙量、鍛鍊思維還是純粹娛樂，立即開始遊戲 - 無需註冊！',
    },
    game: { loading: '載入中', error: '錯誤', backToHome: '返回首頁', howToPlay: '遊戲說明', tips: '技巧提示', viewGuide: '查看遊戲指南', about: '關於', objectives: '目標', controls: '操作方式', mechanics: '遊戲機制', features: '特色功能', faq: '常見問題', source: '來源' },
    feedback: {
      title: '意見反饋', type: '類型', bugReport: '錯誤報告', featureRequest: '功能請求',
      gameFeedback: '遊戲反饋', other: '其他', message: '訊息', messagePlaceholder: '詳細描述您的意見...',
      email: '電子郵件（選填）', emailPlaceholder: '用於回覆', send: '發送', sending: '發送中...',
      success: '感謝您的意見反饋！', fail: '發送失敗，請重試。'
    },
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
      aboutDesc: 'RuleWord 是您免费在线益智游戏的终极目的地。我们提供超过 103+ 款游戏，涵盖 7 大类别 - 从经典文字谜题如 Wordle 到脑力训练逻辑游戏如数独，从怀旧街机游戏如俄罗斯方块到策略对战如象棋。所有游戏完全免费，无需下载，支持任何设备。无论您想提升词汇量、锻炼思维还是纯粹娱乐，立即开始游戏 - 无需注册！',
    },
    game: { loading: '加载中', error: '错误', backToHome: '返回首页', howToPlay: '游戏说明', tips: '技巧提示', viewGuide: '查看游戏指南', about: '关于', objectives: '目标', controls: '操作方式', mechanics: '游戏机制', features: '特色功能', faq: '常见问题', source: '来源' },
    feedback: {
      title: '意见反馈', type: '类型', bugReport: '错误报告', featureRequest: '功能请求',
      gameFeedback: '游戏反馈', other: '其他', message: '内容', messagePlaceholder: '详细描述您的意见...',
      email: '邮箱（选填）', emailPlaceholder: '用于回复', send: '发送', sending: '发送中...',
      success: '感谢您的意见反馈！', fail: '发送失败，请重试。'
    },
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
  fr: {
    word: { title: 'Jeux de Mots - Enrichissez Votre Vocabulaire', desc: 'Les jeux de mots sont parfaits pour les apprenants de langues et les passionnés de vocabulaire. Notre collection comprend Wordle, Spelling Bee, Word Search et plus. Améliorez votre orthographe et votre vocabulaire tout en vous amusant!' },
    logic: { title: 'Puzzles Logiques & Numériques - Entraînez Votre Cerveau', desc: 'Les puzzles logiques sont excellents pour développer la pensée critique. Notre collection comprend Sudoku, 2048, Nonogram et plus. Du niveau débutant à expert, il y en a pour tous les niveaux.' },
    strategy: { title: 'Jeux de Stratégie - Surpassez Votre Adversaire', desc: 'Les jeux de stratégie vous défient à penser à l\'avance. Jouez aux échecs, Gomoku, Reversi et plus contre des adversaires IA. Apprenez à planifier et adapter vos stratégies.' },
    arcade: { title: 'Jeux Arcade - Divertissement Classique Réinventé', desc: 'Revivez l\'âge d\'or des jeux arcade avec notre collection de titres classiques. Jouez à Tetris, Snake, Pac-Man et d\'autres favoris nostalgiques.' },
    memory: { title: 'Jeux de Mémoire & Réflexes - Aiguisez Votre Esprit', desc: 'Les jeux de mémoire et de réflexes sont conçus pour entraîner votre cerveau. Défiez-vous avec des tests de mémoire de motifs, des séquences de nombres et des tests de réflexes.' },
    skill: { title: 'Jeux de Compétence - Testez Vos Capacités', desc: 'Les jeux de compétence mettent vos capacités à l\'épreuve. Test de frappe, Entraîneur de visée, Quiz culture et plus.' },
    puzzle: { title: 'Jeux de Puzzle - Détendez-vous et Résolvez', desc: 'Les jeux de puzzle offrent un divertissement relaxant. Mahjong, Block Puzzle, puzzles et plus.' },
  },
  de: {
    word: { title: 'Wortspiele - Erweitern Sie Ihren Wortschatz', desc: 'Wortspiele sind perfekt für Sprachenlerner und Wortschatz-Enthusiasten. Unsere Sammlung umfasst Wordle, Spelling Bee, Wortsuche und mehr. Verbessern Sie Rechtschreibung und Wortschatz beim Spielen!' },
    logic: { title: 'Logik- & Zahlenrätsel - Trainieren Sie Ihr Gehirn', desc: 'Logikrätsel sind hervorragend zur Entwicklung von kritischem Denken. Unsere Sammlung bietet Sudoku, 2048, Nonogram und mehr. Von Anfänger bis Experte - für jedes Niveau.' },
    strategy: { title: 'Strategiespiele - Überlisten Sie Ihren Gegner', desc: 'Strategiespiele fordern Sie heraus, vorauszudenken. Spielen Sie Schach, Gomoku, Reversi und mehr gegen KI-Gegner.' },
    arcade: { title: 'Arcade-Spiele - Klassischer Spaß Neu Erlebt', desc: 'Erleben Sie das goldene Zeitalter der Arcade-Spiele. Spielen Sie Tetris, Snake, Pac-Man und andere nostalgische Klassiker.' },
    memory: { title: 'Gedächtnis- & Reflexspiele - Schärfen Sie Ihren Verstand', desc: 'Gedächtnis- und Reflexspiele sind darauf ausgelegt, Ihr Gehirn zu trainieren. Fordern Sie sich mit Mustergedächtnis und Reaktionstests.' },
    skill: { title: 'Geschicklichkeitsspiele - Testen Sie Ihre Fähigkeiten', desc: 'Geschicklichkeitsspiele testen Ihre spezifischen Fähigkeiten. Tipptest, Zieltrainer, Quiz und mehr.' },
    puzzle: { title: 'Puzzlespiele - Entspannen und Lösen', desc: 'Puzzlespiele bieten entspannende Unterhaltung. Mahjong, Block Puzzle, Puzzles und mehr.' },
  },
  es: {
    word: { title: 'Juegos de Palabras - Expande Tu Vocabulario', desc: 'Los juegos de palabras son perfectos para estudiantes de idiomas. Nuestra colección incluye Wordle, Spelling Bee, Búsqueda de Palabras y más. ¡Mejora tu vocabulario mientras te diviertes!' },
    logic: { title: 'Puzzles de Lógica & Números - Entrena Tu Cerebro', desc: 'Los puzzles de lógica son excelentes para desarrollar el pensamiento crítico. Sudoku, 2048, Nonogram y más desafíos mentales para todos los niveles.' },
    strategy: { title: 'Juegos de Estrategia - Supera a Tu Oponente', desc: 'Los juegos de estrategia te desafían a pensar adelante. Ajedrez, Gomoku, Reversi y más juegos de tablero clásicos contra IA inteligente.' },
    arcade: { title: 'Juegos Arcade - Diversión Clásica Reinventada', desc: 'Revive la edad de oro de los juegos arcade. Tetris, Snake, Pac-Man y otros favoritos nostálgicos. ¡Diversión simple pero adictiva!' },
    memory: { title: 'Juegos de Memoria & Reflejos - Agudiza Tu Mente', desc: 'Los juegos de memoria y reflejos están diseñados para entrenar tu cerebro. Tests de memoria de patrones, secuencias numéricas y tests de reflejos.' },
    skill: { title: 'Juegos de Habilidad - Pon a Prueba Tus Habilidades', desc: 'Los juegos de habilidad prueban tus capacidades específicas. Test de mecanografía, Entrenador de puntería, Trivia y más.' },
    puzzle: { title: 'Juegos de Puzzle - Relájate y Resuelve', desc: 'Los juegos de puzzle ofrecen entretenimiento relajante. Mahjong, Block Puzzle, rompecabezas y más juegos de fichas.' },
  },
  ru: {
    word: { title: 'Словесные Игры - Расширяйте Словарный Запас', desc: 'Словесные игры идеально подходят для изучающих языки. Wordle, Spelling Bee, Поиск Слов и более. Улучшайте словарный запас и правописание!' },
    logic: { title: 'Логические & Числовые Головоломки - Тренируйте Мозг', desc: 'Логические головоломки отлично подходят для развития критического мышления. Судоку, 2048, Нонограм и более головоломок для всех уровней.' },
    strategy: { title: 'Стратегические Игры - Перехитрите Соперника', desc: 'Стратегические игры заставляют вас думать наперёд. Шахматы, Гомоку, Реверси против умного ИИ. Учитесь планировать и адаптироваться.' },
    arcade: { title: 'Аркадные Игры - Классическое Развлечение', desc: 'Заново переживите золотой век аркадных игр. Тетрис, Змейка, Пак-Ман и другие ностальгические хиты. Простая, но затягивающая игра!' },
    memory: { title: 'Игры на Память & Рефлексы - Острите Ум', desc: 'Игры на память и рефлексы разработаны для тренировки мозга. Тесты памяти, последовательности чисел и тесты реакции.' },
    skill: { title: 'Игры на Навыки - Проверьте Способности', desc: 'Игры на навыки проверяют ваши способности. Тест печати, Тренажер прицеливания, Викторина и более.' },
    puzzle: { title: 'Головоломки - Расслабьтесь и Решайте', desc: 'Головоломки предлагают расслабляющее развлечение. Маджонг, Block Puzzle, пазлы и более.' },
  },
  ja: {
    word: { title: 'ワードゲーム - 語彙力を拡張', desc: 'ワードゲームは言語学習者と語彙愛好家に最適です。Wordle、Spelling Bee、Word Searchなど。楽しみながら語彙力とスペルを向上！' },
    logic: { title: 'ロジック & 数字パズル - 脳を鍛える', desc: 'ロジックパズルは批判的思考と問題解決能力の発達に最適です。数独、2048、ノノグラムなど全レベル対応の脳トレパズル。' },
    strategy: { title: 'ストラテジーゲーム - 対戦相手を出し抜く', desc: 'ストラテジーゲームは先を読んで慎重に手を計画することを求めます。チェス、五目並べ、リバーシなど名作ボードゲーム。' },
    arcade: { title: 'アーケードゲーム - クラシックの楽しさ', desc: 'クラシックタイトルのコレクションでアーケードゲームの黄金時代を追体験。テトリス、スネーク、パックマンなど懐かしい名作が満載！' },
    memory: { title: '記憶 & 反射神経ゲーム - 脳を鋭くする', desc: '記憶と反射神経のゲームは脳を鍛え、反応時間を向上させるように設計されています。パターン記憶、数列、反射テストで脳力アップ！' },
    skill: { title: 'スキルゲーム - 能力をテスト', desc: 'スキルゲームは特定の能力をテストします。タイピングテスト、エイムトレーナー、クイズなどでスキルを測定・向上。' },
    puzzle: { title: 'パズルゲーム - リラックスして解く', desc: 'パズルゲームはリラックスできるエンターテイメント。麻雀、ブロックパズル、ジグソーなどで頭を休めながら楽しむ。' },
  },
  'zh-TW': {
    word: { title: '文字遊戲 - 擴展您的詞彙量', desc: '文字遊戲非常適合語言學習者和詞彙愛好者。我們的合集包括 Wordle、Spelling Bee、Word Search 等經典文字謎題。在娛樂的同時提升詞彙量和拼寫能力！' },
    logic: { title: '數字邏輯 - 訓練您的大腦', desc: '邏輯謎題非常適合培養批判性思維和解決問題的能力。數獨、2048、數織（Nonogram）等腦力訓練遊戲，從入門到專家級應有盡有。' },
    strategy: { title: '策略對戰 - 智勝對手', desc: '策略遊戲考驗您的前瞻思維和周密計劃能力。西洋棋、五子棋、黑白棋等經典棋盤遊戲，對戰智能 AI！' },
    arcade: { title: '經典街機 - 重溫黃金時代', desc: '透過我們的經典遊戲合集重溫街機遊戲的黃金時代。俄羅斯方塊、貪吃蛇、小精靈等懷舊名作，簡單卻令人著迷！' },
    memory: { title: '記憶反應 - 鍛鍊您的思維', desc: '記憶和反應遊戲專為訓練大腦和提高反應速度而設計。圖案記憶、數字序列、反應測試，每天10-15分鐘顯著提升腦力！' },
    skill: { title: '技能挑戰 - 測試您的能力', desc: '技能遊戲測試您的特定能力。打字測試測量您的 WPM、瞄準訓練器提高精準度、冷知識測驗挑戰知識儲備。' },
    puzzle: { title: '拼圖消除 - 放鬆解謎', desc: '拼圖遊戲提供放鬆的娛樂體驗。麻雀、方塊拼圖、拼圖等配對消除遊戲，在休息時刻保持大腦活躍。' },
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
