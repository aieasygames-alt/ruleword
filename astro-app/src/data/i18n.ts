// Multi-language support for UI text only (not game content)
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
  }
  game: {
    loading: string
    error: string
    backToHome: string
    howToPlay: string
    tips: string
  }
  footer: {
    copyright: string
  }
}> = {
  en: {
    nav: {
      home: 'Home',
      feedback: 'Feedback',
      language: 'Language',
    },
    home: {
      title: 'Free Online Games',
      subtitle: 'Classic puzzles, strategy games, arcade fun. No downloads, play instantly.',
      featured: 'Featured Games',
      allGames: 'All Games',
      gamesCount: 'games',
      freeGames: 'Free Games',
    },
    game: {
      loading: 'Loading',
      error: 'Error',
      backToHome: 'Back to Home',
      howToPlay: 'How to Play',
      tips: 'Tips',
    },
    footer: {
      copyright: '© 2026 RuleWord',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      feedback: 'Commentaires',
      language: 'Langue',
    },
    home: {
      title: 'Jeux en Ligne Gratuits',
      subtitle: 'Puzzles classiques, jeux de stratégie, arcade. Sans téléchargement.',
      featured: 'Jeux en Vedette',
      allGames: 'Tous les Jeux',
      gamesCount: 'jeux',
      freeGames: 'Jeux Gratuits',
    },
    game: {
      loading: 'Chargement',
      error: 'Erreur',
      backToHome: 'Retour à l\'accueil',
      howToPlay: 'Comment Jouer',
      tips: 'Conseils',
    },
    footer: {
      copyright: '© 2026 RuleWord',
    },
  },
  de: {
    nav: {
      home: 'Startseite',
      feedback: 'Feedback',
      language: 'Sprache',
    },
    home: {
      title: 'Kostenlose Online-Spiele',
      subtitle: 'Klassische Puzzles, Strategiespiele, Arcade-Spaß. Kein Download nötig.',
      featured: 'Empfohlene Spiele',
      allGames: 'Alle Spiele',
      gamesCount: 'Spiele',
      freeGames: 'Kostenlose Spiele',
    },
    game: {
      loading: 'Laden',
      error: 'Fehler',
      backToHome: 'Zurück zur Startseite',
      howToPlay: 'Spielanleitung',
      tips: 'Tipps',
    },
    footer: {
      copyright: '© 2026 RuleWord',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      feedback: 'Comentarios',
      language: 'Idioma',
    },
    home: {
      title: 'Juegos en Línea Gratuitos',
      subtitle: 'Puzzles clásicos, juegos de estrategia, diversión arcade. Sin descargas.',
      featured: 'Juegos Destacados',
      allGames: 'Todos los Juegos',
      gamesCount: 'juegos',
      freeGames: 'Juegos Gratis',
    },
    game: {
      loading: 'Cargando',
      error: 'Error',
      backToHome: 'Volver al Inicio',
      howToPlay: 'Cómo Jugar',
      tips: 'Consejos',
    },
    footer: {
      copyright: '© 2026 RuleWord',
    },
  },
  ru: {
    nav: {
      home: 'Главная',
      feedback: 'Обратная связь',
      language: 'Язык',
    },
    home: {
      title: 'Бесплатные Онлайн Игры',
      subtitle: 'Классические головоломки, стратегии, аркады. Без загрузок.',
      featured: 'Рекомендуемые Игры',
      allGames: 'Все Игры',
      gamesCount: 'игр',
      freeGames: 'Бесплатные Игры',
    },
    game: {
      loading: 'Загрузка',
      error: 'Ошибка',
      backToHome: 'Вернуться на главную',
      howToPlay: 'Как Играть',
      tips: 'Советы',
    },
    footer: {
      copyright: '© 2026 RuleWord',
    },
  },
  ja: {
    nav: {
      home: 'ホーム',
      feedback: 'フィードバック',
      language: '言語',
    },
    home: {
      title: '無料オンラインゲーム',
      subtitle: '定番パズル、ストラテジーゲーム、アーケード。ダウンロード不要。',
      featured: 'おすすめゲーム',
      allGames: 'すべてのゲーム',
      gamesCount: 'ゲーム',
      freeGames: '無料ゲーム',
    },
    game: {
      loading: '読み込み中',
      error: 'エラー',
      backToHome: 'ホームに戻る',
      howToPlay: '遊び方',
      tips: 'ヒント',
    },
    footer: {
      copyright: '© 2026 RuleWord',
    },
  },
  'zh-TW': {
    nav: {
      home: '首頁',
      feedback: '意見反饋',
      language: '語言',
    },
    home: {
      title: '免費線上遊戲',
      subtitle: '經典益智、策略遊戲、街機樂趣。無需下載，即開即玩。',
      featured: '精選遊戲',
      allGames: '所有遊戲',
      gamesCount: '個遊戲',
      freeGames: '免費遊戲',
    },
    game: {
      loading: '載入中',
      error: '錯誤',
      backToHome: '返回首頁',
      howToPlay: '遊戲說明',
      tips: '技巧提示',
    },
    footer: {
      copyright: '© 2026 RuleWord',
    },
  },
  'zh-CN': {
    nav: {
      home: '首页',
      feedback: '意见反馈',
      language: '语言',
    },
    home: {
      title: '免费在线游戏',
      subtitle: '经典益智、策略游戏、街机乐趣。无需下载，即开即玩。',
      featured: '精选游戏',
      allGames: '所有游戏',
      gamesCount: '个游戏',
      freeGames: '免费游戏',
    },
    game: {
      loading: '加载中',
      error: '错误',
      backToHome: '返回首页',
      howToPlay: '游戏说明',
      tips: '技巧提示',
    },
    footer: {
      copyright: '© 2026 RuleWord',
    },
  },
}

export function getI18n(lang: Language) {
  return i18n[lang] || i18n.en
}
