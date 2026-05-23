// Shared utilities for AI story API endpoints

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status)
}

interface StoryNodeResponse {
  nodeText: string
  speaker?: string
  emotion?: string
  choices: Array<{ id: string; text: string }>
  isChapterEnd: boolean
  nextChapter?: string
  metadataUpdate?: Record<string, number>
}

interface EndingResponse {
  endingId: string
  title: string
  description: string
  summary: string
  shareText: string
}

// Mock story responses per chapter for the dating simulator
const MOCK_STORY_DATA: Record<string, {
  nodes: StoryNodeResponse[]
  ending: EndingResponse
}> = {
  'ch1': {
    nodes: [
      {
        nodeText: "You push open the door of the corner coffee shop and are greeted by the rich aroma of freshly brewed beans. Behind the counter, someone with paint-stained fingers expertly crafts a latte.",
        speaker: undefined,
        emotion: 'neutral',
        choices: [
          { id: 'm1a', text: 'Order your usual and find a cozy spot' },
          { id: 'm1b', text: 'Ask the barista what they recommend' },
          { id: 'm1c', text: 'Comment on the paintings on the wall' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': 5 },
      },
      {
        nodeText: "\"Oh, you noticed those?\" A warm laugh. \"I painted them myself. Most people just stare at their phones.\" The barista slides a perfect latte across the counter with a little heart in the foam.",
        speaker: 'Alex',
        emotion: 'happy',
        choices: [
          { id: 'm1d', text: '"They\'re beautiful. You\'re really talented."' },
          { id: 'm1e', text: '"A Renaissance barista! What\'s your story?"' },
          { id: 'm1f', text: '"The heart in the foam is a nice touch too"' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'affection-alex': 10 },
      },
      {
        nodeText: "The conversation flows easily. Alex tells you about studying art, then falling into coffee as a way to pay rent and stay creative. There's something genuine here — no pretense, just warmth.",
        speaker: undefined,
        emotion: 'excited',
        choices: [
          { id: 'm1g', text: 'Suggest meeting up again sometime' },
          { id: 'm1h', text: 'Leave a generous tip and your number' },
          { id: 'm1i', text: 'Say you\'ll be back tomorrow for sure' },
        ],
        isChapterEnd: true,
        nextChapter: 'ch2',
        metadataUpdate: { 'affection-alex': 5, 'confidence': 5 },
      },
    ],
    ending: {
      endingId: 'ch1-end',
      title: 'Chapter Complete',
      description: 'You\'ve made your first connection in the city.',
      summary: 'You visited the coffee shop and had a lovely conversation with Alex.',
      shareText: 'I just had the most delightful coffee shop encounter in my AI Dating Simulator! ☕💕',
    },
  },
  'ch2': {
    nodes: [
      {
        nodeText: "A few days later, your phone lights up. A text from Sam invites you to their gallery opening tonight. Across town, Jordan mentioned a tech meetup. And Alex always seems to have time for another latte and chat.",
        speaker: undefined,
        emotion: 'excited',
        choices: [
          { id: 'm2a', text: 'Head to Sam\'s gallery opening' },
          { id: 'm2b', text: 'Meet Jordan at the tech meetup' },
          { id: 'm2c', text: 'Drop by Alex\'s coffee shop first' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': 5 },
      },
      {
        nodeText: "The gallery is alive with color and energy. Bold strokes, raw emotion on canvas. Sam spots you from across the room and their face lights up like sunrise.",
        speaker: 'Sam',
        emotion: 'excited',
        choices: [
          { id: 'm2d', text: '"You made it! I\'m so glad you came."' },
          { id: 'm2e', text: '"This painting is incredible — tell me about it"' },
          { id: 'm2f', text: '"The whole place feels alive tonight"' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'affection-sam': 10 },
      },
      {
        nodeText: "As the evening winds down, Sam walks you outside. The city lights reflect in their eyes. \"I don't usually let people see my work so early,\" they admit softly. \"But something about you felt... safe.\"",
        speaker: undefined,
        emotion: 'nervous',
        choices: [
          { id: 'm2g', text: '"I feel safe with you too, Sam"' },
          { id: 'm2h', text: '"Your vulnerability is your strength"' },
          { id: 'm2i', text: '"We should do this again — just us"' },
        ],
        isChapterEnd: true,
        nextChapter: 'ch3',
        metadataUpdate: { 'affection-sam': 10, 'confidence': 5 },
      },
    ],
    ending: {
      endingId: 'ch2-end',
      title: 'Chapter Complete',
      description: 'Connections are deepening. Your heart is opening.',
      summary: 'You attended the gallery opening and connected deeply with Sam.',
      shareText: 'Just had the most magical evening at an art gallery in my AI Dating Simulator! 🎨✨',
    },
  },
  'ch3': {
    nodes: [
      {
        nodeText: "It's date night. You've picked the perfect restaurant — soft jazz, candlelight, the works. But your heart won't stop racing. Tonight feels important somehow.",
        speaker: undefined,
        emotion: 'nervous',
        choices: [
          { id: 'm3a', text: 'Take a deep breath and be yourself' },
          { id: 'm3b', text: 'Plan the perfect conversation topics' },
          { id: 'm3c', text: 'Let the evening unfold naturally' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': -5 },
      },
      {
        nodeText: "They arrive, slightly breathless from running. \"Sorry, I couldn't decide what to wear.\" A self-conscious laugh. \"Turns out I care more about tonight than I expected.\"",
        speaker: undefined,
        emotion: 'happy',
        choices: [
          { id: 'm3d', text: '"You look perfect — honestly"' },
          { id: 'm3e', text: '"I had the same problem, actually"' },
          { id: 'm3f', text: '"The fact you care means everything"' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': 10 },
      },
      {
        nodeText: "Dinner becomes a blur of laughter, shared stories, and meaningful glances. At one point, your hands brush reaching for the same breadstick, and neither of you pulls away quickly.",
        speaker: undefined,
        emotion: 'excited',
        choices: [
          { id: 'm3g', text: 'Let your hand linger on theirs' },
          { id: 'm3h', text: 'Laugh it off but keep the eye contact' },
          { id: 'm3i', text: 'Suggest a walk under the stars' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': 5 },
      },
      {
        nodeText: "Walking together afterward, the city is quiet around you. Streetlights cast golden halos. \"Can I tell you something?\" they say, stopping. \"I've never felt this comfortable with someone so quickly.\"",
        speaker: undefined,
        emotion: 'happy',
        choices: [
          { id: 'm3j', text: '"I feel the same way. Exactly the same."' },
          { id: 'm3k', text: '"Then let\'s see where this goes"' },
          { id: 'm3l', text: 'Simply smile and take their hand' },
        ],
        isChapterEnd: true,
        nextChapter: 'ch4',
        metadataUpdate: { 'confidence': 10 },
      },
    ],
    ending: {
      endingId: 'ch3-end',
      title: 'Chapter Complete',
      description: 'Something special is blooming under the city lights.',
      summary: 'A magical date night that brought you closer together.',
      shareText: 'Just had the most romantic dinner date in my AI Dating Simulator! 🌙💫',
    },
  },
  'ch4': {
    nodes: [
      {
        nodeText: "Life was starting to feel like a dream. Then reality calls — your phone rings early one morning with news that shakes everything up. A once-in-a-lifetime opportunity, but it comes with a catch.",
        speaker: undefined,
        emotion: 'nervous',
        choices: [
          { id: 'm4a', text: 'Answer the call — hear what they have to say' },
          { id: 'm4b', text: 'Let it go to voicemail and process later' },
          { id: 'm4c', text: 'Call the person who matters most first' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': -5 },
      },
      {
        nodeText: "The opportunity would mean long hours, less free time, possibly even a move across the city. But it could change everything for your career. The timing couldn't be worse.",
        speaker: undefined,
        emotion: 'sad',
        choices: [
          { id: 'm4d', text: 'Share the news honestly with them' },
          { id: 'm4e', text: 'Keep it to yourself for now' },
          { id: 'm4f', text: 'Ask for their advice' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': 5 },
      },
      {
        nodeText: "That evening, you find yourself at the coffee shop, the gallery, and the apartment building — all in one night. Each person you've grown to care about deserves to know what's happening. But where does your heart truly belong?",
        speaker: undefined,
        emotion: 'nervous',
        choices: [
          { id: 'm4g', text: 'Follow your heart, wherever it leads' },
          { id: 'm4h', text: 'Choose the practical path' },
          { id: 'm4i', text: 'Trust that the right answer will come' },
        ],
        isChapterEnd: true,
        nextChapter: 'ch5',
        metadataUpdate: { 'confidence': 10 },
      },
    ],
    ending: {
      endingId: 'ch4-end',
      title: 'Chapter Complete',
      description: 'Every crossroads teaches you something about what you truly want.',
      summary: 'You faced a difficult choice that tested your priorities.',
      shareText: 'Standing at a crossroads in my AI Dating Simulator... what would you choose? 🤔💫',
    },
  },
  'ch5': {
    nodes: [
      {
        nodeText: "The city sparkles under a canopy of stars. You're standing at the spot where everything began — that first coffee, that first painting, that first encounter at the elevator. It all comes flooding back.",
        speaker: undefined,
        emotion: 'happy',
        choices: [
          { id: 'm5a', text: 'Wait for the person who holds your heart' },
          { id: 'm5b', text: 'Write down what you truly feel' },
          { id: 'm5c', text: 'Take a moment to appreciate the journey' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': 5 },
      },
      {
        nodeText: "Footsteps behind you. \"I had a feeling I'd find you here.\" That familiar voice, warm like the first cup of coffee in a new city. They stand beside you, looking out at the skyline.",
        speaker: undefined,
        emotion: 'excited',
        choices: [
          { id: 'm5d', text: '"This city changed everything for me"' },
          { id: 'm5e', text: '"More specifically — you changed everything"' },
          { id: 'm5f', text: 'Let the silence speak for you' },
        ],
        isChapterEnd: false,
        metadataUpdate: { 'confidence': 5 },
      },
      {
        nodeText: "\"I've been thinking,\" they say softly. \"About us. About what this all means.\" They turn to face you, vulnerability and hope written across their features. \"I don't want to wonder anymore. Do you?\"",
        speaker: undefined,
        emotion: 'nervous',
        choices: [
          { id: 'm5g', text: '"No more wondering. I choose you."' },
          { id: 'm5h', text: '"Whatever comes next, I want it with you"' },
          { id: 'm5i', text: 'Close the distance between you' },
        ],
        isChapterEnd: true,
        metadataUpdate: { 'confidence': 15 },
      },
    ],
    ending: {
      endingId: 'true-love',
      title: 'True Love',
      description: 'Against all odds, you found something real in this new city. What started as a chance encounter blossomed into a connection that neither of you expected. Sometimes the best stories begin with a single brave step into the unknown.',
      summary: 'You followed your heart through every chapter and found love in the most unexpected place — right where you were meant to be.',
      shareText: 'I found True Love in the AI Dating Simulator! 💕 Our story was written in coffee cups, paint strokes, and city lights.',
    },
  },
}

const DEFAULT_ENDING: EndingResponse = {
  endingId: 'dear-friends',
  title: 'Dear Friends',
  description: "Not every connection becomes a romance, and that's perfectly okay. You've built meaningful friendships that enrich your life in ways you never imagined. The city no longer feels strange — it feels like home.",
  summary: 'You built genuine connections and found friendship in unexpected places.',
  shareText: 'I played the AI Dating Simulator and discovered the beauty of friendship! 🤗🏙️',
}

export function getMockStoryNode(
  templateId: string,
  chapterId: string,
  turnInChapter: number,
  _userChoice: string,
  _language: string,
): StoryNodeResponse {
  if (templateId !== 'ai-dating-simulator') {
    return {
      nodeText: 'Story template not found.',
      choices: [{ id: 'retry', text: 'Try again' }],
      isChapterEnd: false,
    }
  }

  const chapterData = MOCK_STORY_DATA[chapterId]
  if (!chapterData) {
    return {
      nodeText: 'Chapter not found.',
      choices: [{ id: 'retry', text: 'Start over' }],
      isChapterEnd: false,
    }
  }

  const nodeIndex = Math.min(turnInChapter, chapterData.nodes.length - 1)
  return chapterData.nodes[nodeIndex]
}

export function getMockEnding(
  templateId: string,
  _storyContext: Record<string, unknown>,
  _language: string,
): EndingResponse {
  if (templateId !== 'ai-dating-simulator') {
    return DEFAULT_ENDING
  }

  // Simple logic: return the last chapter's ending or default
  const lastChapter = MOCK_STORY_DATA['ch5']
  if (lastChapter) {
    return lastChapter.ending
  }
  return DEFAULT_ENDING
}

export function validateStoryResponse(raw: unknown): StoryNodeResponse | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  if (typeof obj.nodeText !== 'string' || !obj.nodeText) return null
  if (!Array.isArray(obj.choices) || obj.choices.length === 0) return null

  for (const choice of obj.choices as Array<Record<string, unknown>>) {
    if (typeof choice.id !== 'string' || typeof choice.text !== 'string') return null
    if (choice.text.length > 100) choice.text = choice.text.slice(0, 100)
  }

  if (obj.nodeText.length > 500) obj.nodeText = obj.nodeText.slice(0, 500)

  return {
    nodeText: obj.nodeText,
    speaker: typeof obj.speaker === 'string' ? obj.speaker : undefined,
    emotion: typeof obj.emotion === 'string' ? obj.emotion : undefined,
    choices: (obj.choices as Array<{ id: string; text: string }>).slice(0, 4),
    isChapterEnd: !!obj.isChapterEnd,
    nextChapter: typeof obj.nextChapter === 'string' ? obj.nextChapter : undefined,
    metadataUpdate: obj.metadataUpdate && typeof obj.metadataUpdate === 'object'
      ? obj.metadataUpdate as Record<string, number>
      : undefined,
  }
}
