import type { StoryTemplate, TemplateType } from '../types'

export type StoryGenre = {
  label: string
  slug: string
  icon: string
  types: TemplateType[]
  description: string
  keywords: string[]
}

export const storyGenres: StoryGenre[] = [
  {
    label: 'Romance & Relationships',
    slug: 'romance-relationships',
    icon: '💕',
    types: ['dating-sim'],
    description: 'Choice-driven AI romance stories with relationship stats, heartfelt scenes, and multiple endings to unlock.',
    keywords: ['AI dating simulator', 'AI romance game', 'relationship story game'],
  },
  {
    label: 'Mystery & Detective',
    slug: 'mystery-detective',
    icon: '🔍',
    types: ['detective', 'persuasion'],
    description: 'Interactive mystery and persuasion stories where clues, questions, and risky decisions shape the final reveal.',
    keywords: ['AI murder mystery', 'detective story game', 'interactive mystery game'],
  },
  {
    label: 'Survival & Horror',
    slug: 'survival-horror',
    icon: '🧟',
    types: ['survival', 'horror'],
    description: 'Tense AI survival stories with scarce resources, dangerous choices, and dramatic endings.',
    keywords: ['AI survival game', 'zombie survival story', 'interactive horror game'],
  },
  {
    label: 'Fantasy & Adventure',
    slug: 'fantasy-adventure',
    icon: '⚔️',
    types: ['fantasy-rpg', 'open-adventure'],
    description: 'AI fantasy adventures with quests, companions, branching chapters, and replayable outcomes.',
    keywords: ['AI fantasy RPG', 'fantasy adventure game', 'interactive adventure story'],
  },
  {
    label: 'Strategy & Simulation',
    slug: 'strategy-simulation',
    icon: '💼',
    types: ['startup-sim', 'business-sim', 'negotiation', 'personality-quiz', 'escape-room'],
    description: 'Strategic AI simulations, escape rooms, quizzes, and business stories where every choice changes your path.',
    keywords: ['AI simulation game', 'startup simulator', 'AI escape room'],
  },
]

export function getStoryGenreBySlug(slug: string) {
  return storyGenres.find(genre => genre.slug === slug)
}

export function getStoryGenreForTemplateType(templateType: string) {
  return storyGenres.find(genre => genre.types.includes(templateType as TemplateType)) ?? storyGenres[storyGenres.length - 1]
}

export function groupStoriesByGenre<T extends Pick<StoryTemplate, 'templateType'>>(stories: T[]) {
  const genreMap = new Map<string, T[]>()

  stories.forEach(story => {
    const genre = getStoryGenreForTemplateType(story.templateType)
    const groupStories = genreMap.get(genre.slug) ?? []
    groupStories.push(story)
    genreMap.set(genre.slug, groupStories)
  })

  return genreMap
}
