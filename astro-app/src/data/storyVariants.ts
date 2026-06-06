// Story Variants for Programmatic SEO
// Seasonal and themed variants of AI story games
// Each variant targets specific long-tail keywords with unique landing pages

export interface StoryVariant {
  storySlug: string
  variant: string
  variantType: 'seasonal' | 'theme'
  title: string
  description: string
  keywords: string[]
  h1: string
  subtitle?: string
  tips?: string[]
}

export const storyVariants: StoryVariant[] = [
  // =============================================
  // Dating Simulator - Seasonal Variants
  // =============================================
  {
    storySlug: 'ai-dating-simulator',
    variant: 'valentine',
    variantType: 'seasonal',
    title: 'Valentine Dating Simulator - AI Love Story Game',
    description: 'Play the Valentine\'s Day special of our AI Dating Simulator! Find romance in a love-filled city during the most magical time of year. Hearts, chocolates, and unique AI-generated love stories await.',
    keywords: ['valentine dating simulator', 'valentine AI game', 'love story game', 'valentine interactive story', 'romantic AI game'],
    h1: 'Valentine Dating Simulator ❤️',
    subtitle: 'A Valentine\'s Day special — find love in the season of romance',
    tips: [
      'Valentine-themed choices unlock special romantic scenes',
      'Each character has a unique Valentine surprise',
      'Try the chocolate shop for bonus affection points',
    ],
  },
  {
    storySlug: 'ai-dating-simulator',
    variant: 'summer',
    variantType: 'seasonal',
    title: 'Summer Romance Simulator - AI Beach Love Story',
    description: 'Experience summer love in this AI-powered dating sim! Beach parties, sunset walks, and fireworks create the perfect backdrop for romance. Your AI-generated summer love story awaits.',
    keywords: ['summer romance game', 'beach dating simulator', 'summer love story', 'AI dating summer', 'romantic beach game'],
    h1: 'Summer Romance Simulator 🏖️',
    subtitle: 'Sun, sand, and summer love — your beach romance awaits',
    tips: [
      'Beach activities boost affection with sporty characters',
      'Sunset scenes trigger deeper conversations',
      'The fireworks festival is the perfect moment for confession',
    ],
  },

  // =============================================
  // Zombie Survival - Themed Variants
  // =============================================
  {
    storySlug: 'ai-zombie-survival',
    variant: 'halloween',
    variantType: 'seasonal',
    title: 'Halloween Zombie Survival - AI Horror Story Game',
    description: 'The Halloween special of our zombie survival game! Face terrifying undead hordes on the spookiest night of the year. AI-generated horror with extra scares, creepy settings, and survival decisions.',
    keywords: ['halloween zombie game', 'halloween survival game', 'AI horror story', 'zombie halloween game', 'scary AI game'],
    h1: 'Halloween Zombie Survival 🎃',
    subtitle: 'On Halloween night, the dead rise — can you survive till dawn?',
    tips: [
      'Halloween events spawn special zombie types',
      'Candy you collect can be traded for survival gear',
      'Stay in the light — darkness brings extra dangers tonight',
    ],
  },

  // =============================================
  // Startup Simulator - Themed Variants
  // =============================================
  {
    storySlug: 'startup-simulator',
    variant: 'silicon-valley',
    variantType: 'theme',
    title: 'Silicon Valley Startup Simulator - Build Your Tech Empire',
    description: 'The Silicon Valley edition of Startup Simulator! Navigate the cutthroat world of Palo Alto tech startups. Pitch to legendary VCs, poach engineers from big tech, and build the next unicorn.',
    keywords: ['silicon valley simulator', 'tech startup game', 'startup game online', 'build a startup game', 'AI business simulator'],
    h1: 'Silicon Valley Startup Simulator 💻',
    subtitle: 'Palo Alto, venture capital, and the quest for unicorn status',
    tips: [
      'Network effects are key — focus on user growth early',
      'Don\'t skip the VC pitch — preparation beats improvisation',
      'The best hires come from your competitors',
    ],
  },
  {
    storySlug: 'startup-simulator',
    variant: 'college-dorm',
    variantType: 'theme',
    title: 'College Dorm Startup Simulator - From Dorm Room to Boardroom',
    description: 'Start your business from a college dorm room! The dorm edition of Startup Simulator puts you in the shoes of a student entrepreneur juggling classes, roommates, and building the next big thing.',
    keywords: ['college startup game', 'dorm room business simulator', 'student entrepreneur game', 'college business game', 'AI startup simulator'],
    h1: 'College Dorm Startup Simulator 🎓',
    subtitle: 'Ramens, roommates, and revolutionary ideas',
    tips: [
      'Your roommate can be your first co-founder or your biggest distraction',
      'Study for exams AND build your startup — balance is everything',
      'Campus networking events are gold mines for early users',
    ],
  },

  // =============================================
  // Murder Mystery - Themed Variants
  // =============================================
  {
    storySlug: 'ai-murder-mystery',
    variant: 'murder-on-the-orient-express',
    variantType: 'theme',
    title: 'Train Murder Mystery - AI Detective Story Game',
    description: 'A luxurious train journey turns deadly in this classic-style murder mystery! Solve the crime before the train reaches its destination. AI generates unique suspects, clues, and twists every time.',
    keywords: ['train murder mystery', 'detective game online', 'murder mystery train', 'AI detective game', 'who done it game'],
    h1: 'Murder on the Express 🚂',
    subtitle: 'A killer is aboard — solve the mystery before the final station',
    tips: [
      'Everyone on the train has a secret — dig deep',
      'The timetable is crucial — track who was where',
      'Don\'t trust the obvious suspect',
    ],
  },

  // =============================================
  // Fantasy Adventure - Themed Variants
  // =============================================
  {
    storySlug: 'ai-fantasy-adventure',
    variant: 'dragon-quest',
    variantType: 'theme',
    title: 'Dragon Quest - AI Fantasy Adventure Game',
    description: 'The Dragon Quest edition of our Fantasy Adventure! Face ancient dragons, discover magical artifacts, and save the kingdom. AI-generated fantasy worlds with epic dragon encounters.',
    keywords: ['dragon quest game', 'fantasy adventure online', 'dragon AI game', 'fantasy RPG browser', 'dragon slayer game'],
    h1: 'Dragon Quest 🐉',
    subtitle: 'Ancient dragons have awakened — only you can save the realm',
    tips: [
      'Not all dragons are enemies — some can be allies',
      'Collect dragon scales to forge legendary armor',
      'The ancient library holds the key to dragon language',
    ],
  },

  // =============================================
  // Crypto Trader - Themed Variants
  // =============================================
  {
    storySlug: 'ai-crypto-trader',
    variant: 'bull-run',
    variantType: 'theme',
    title: 'Crypto Bull Run Simulator - AI Trading Game',
    description: 'Ride the crypto bull run in this AI-powered trading simulator! Experience the highs and lows of a massive market rally. Make trades, manage risk, and try to become a crypto millionaire.',
    keywords: ['crypto bull run game', 'bitcoin simulator', 'crypto trading game', 'AI crypto game', 'bitcoin trading simulator'],
    h1: 'Crypto Bull Run Simulator 📈',
    subtitle: 'The market is going to the moon — but when will it crash?',
    tips: [
      'Take profits on the way up — greed is your enemy',
      'Watch the fear index for sell signals',
      'Diversify — don\'t put everything in one coin',
    ],
  },

  // =============================================
  // Time Traveler - Themed Variants
  // =============================================
  {
    storySlug: 'time-traveler',
    variant: 'ancient-egypt',
    variantType: 'theme',
    title: 'Ancient Egypt Time Travel - AI Historical Adventure',
    description: 'Travel back to Ancient Egypt in this special edition time travel adventure! Walk among the pyramids, meet pharaohs, and uncover secrets of the Nile. AI generates historically-inspired scenarios.',
    keywords: ['ancient egypt game', 'historical adventure game', 'egypt time travel', 'AI history game', 'pyramid adventure game'],
    h1: 'Ancient Egypt Time Travel 🏺',
    subtitle: 'The sands of time have carried you to the age of pharaohs',
    tips: [
      'Learn the customs before approaching the pharaoh',
      'The Nile\'s flooding cycle affects everything',
      'Hieroglyphics hold clues to finding your way back',
    ],
  },
]

// Helper functions
export function getVariantsForStory(storySlug: string): StoryVariant[] {
  return storyVariants.filter(v => v.storySlug === storySlug)
}

export function getStoriesWithVariants(): string[] {
  return [...new Set(storyVariants.map(v => v.storySlug))]
}

export function getStoryVariant(storySlug: string, variant: string): StoryVariant | undefined {
  return storyVariants.find(v => v.storySlug === storySlug && v.variant === variant)
}

export function getAllStoryVariants(): StoryVariant[] {
  return storyVariants
}
