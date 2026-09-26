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
    description: 'Free AI dating simulator and romance story games with relationship stats, heartfelt choices, and multiple endings to unlock.',
    keywords: ['free AI dating simulator', 'AI dating simulator', 'AI romance game', 'interactive romance story', 'relationship story game'],
  },
  {
    label: 'Mystery & Detective',
    slug: 'mystery-detective',
    icon: '🔍',
    types: ['detective', 'persuasion'],
    description: 'Interactive AI mystery, detective, and persuasion stories where clues, questions, and risky decisions shape the final reveal.',
    keywords: ['AI murder mystery', 'AI detective game', 'detective story game', 'interactive mystery game', 'AI persuasion game'],
  },
  {
    label: 'Survival & Horror',
    slug: 'survival-horror',
    icon: '🧟',
    types: ['survival', 'horror'],
    description: 'Free AI survival and horror story games with scarce resources, dangerous choices, zombie threats, and dramatic endings.',
    keywords: ['AI survival game', 'zombie survival story', 'AI zombie game', 'interactive horror game', 'survival story game'],
  },
  {
    label: 'Fantasy & Adventure',
    slug: 'fantasy-adventure',
    icon: '⚔️',
    types: ['fantasy-rpg', 'open-adventure'],
    description: 'AI fantasy RPG and adventure story games with quests, companions, branching chapters, and replayable outcomes.',
    keywords: ['AI fantasy RPG', 'AI RPG story game', 'fantasy adventure game', 'interactive adventure story', 'AI dungeon master'],
  },
  {
    label: 'Strategy & Simulation',
    slug: 'strategy-simulation',
    icon: '💼',
    types: ['startup-sim', 'business-sim', 'negotiation', 'personality-quiz', 'escape-room'],
    description: 'Strategic AI simulations, escape rooms, quizzes, and business story games where every choice changes your path.',
    keywords: ['AI simulation game', 'startup simulator', 'AI escape room', 'business simulator game', 'AI personality quiz'],
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
