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

// ---------------------------------------------------------------------------
// Generic mock system — works for ANY story template
// ---------------------------------------------------------------------------
// When AI is unavailable, users still get atmospheric, playable content.
// The tone shifts across chapters: early = exploration, mid = tension,
// late = climax, giving every story a natural arc.

interface MockTurn {
  nodeText: string
  emotion: string
  choices: Array<{ id: string; text: string }>
  metadataUpdate: Record<string, number>
}

type ChapterPhase = 'opening' | 'rising' | 'midpoint' | 'climax' | 'resolution'

function phaseForChapter(chapterId: string): ChapterPhase {
  const num = parseInt(chapterId.replace(/\D/g, ''), 10)
  if (isNaN(num) || num <= 0) return 'opening'
  if (num === 1) return 'opening'
  if (num === 2) return 'rising'
  if (num === 3) return 'midpoint'
  if (num === 4) return 'climax'
  return 'resolution'
}

// Deterministic-ish hash so the same template+chapter always gets the same
// variation, keeping the experience consistent within a session.
function simpleHash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function pick<T>(arr: T[], seed: string, index: number): T {
  return arr[(simpleHash(seed) + index) % arr.length]
}

// ----- Opening nodes (ch1) -------------------------------------------------

const OPENING_TURNS: MockTurn[] = [
  {
    nodeText:
      'The world around you hums with quiet possibility. Something about today feels different — charged, as if the air itself is holding its breath. You take your first step forward, unsure of where the path leads but certain that standing still is no longer an option.',
    emotion: 'neutral',
    choices: [
      { id: 'mo1', text: 'Step boldly into the unknown' },
      { id: 'mo2', text: 'Pause and observe your surroundings carefully' },
      { id: 'mo3', text: 'Seek out the nearest sign of life' },
    ],
    metadataUpdate: { confidence: 5 },
  },
  {
    nodeText:
      'A figure emerges from the shadows — not threatening, but guarded. Their eyes study you with an intensity that suggests they have been waiting. "You came," they say, half question, half relief. "I wasn\'t sure you would."',
    emotion: 'curious',
    choices: [
      { id: 'mo4', text: '"Who are you? How did you know I\'d be here?"' },
      { id: 'mo5', text: 'Say nothing — let them speak first' },
      { id: 'mo6', text: '"I almost didn\'t. Something pulled me here."' },
    ],
    metadataUpdate: { trust: 5 },
  },
  {
    nodeText:
      'The first hurdle appears sooner than expected. A locked door, a riddle, a choice between two paths — the kind of moment that defines who you are when nobody is watching. Your heart quickens, but your mind sharpens.',
    emotion: 'nervous',
    choices: [
      { id: 'mo7', text: 'Trust your instincts and act quickly' },
      { id: 'mo8', text: 'Take your time and think it through' },
      { id: 'mo9', text: 'Look for help from someone nearby' },
    ],
    metadataUpdate: { confidence: -5 },
  },
  {
    nodeText:
      'A moment of unexpected beauty catches you off guard — a shaft of light through the gloom, a stranger\'s kindness, a discovery that changes everything you thought you knew. The journey ahead suddenly feels worth every risk.',
    emotion: 'happy',
    choices: [
      { id: 'mo10', text: 'Press forward with renewed determination' },
      { id: 'mo11', text: 'Savor this moment before moving on' },
      { id: 'mo12', text: 'Share what you found with your companion' },
    ],
    metadataUpdate: { hope: 10, confidence: 5 },
  },
]

// ----- Rising action nodes (ch2) -------------------------------------------

const RISING_TURNS: MockTurn[] = [
  {
    nodeText:
      'The stakes become clearer. What started as curiosity has become commitment, and the path ahead grows narrower. Allies reveal their true colors — some brighter than you hoped, others darker than you feared.',
    emotion: 'nervous',
    choices: [
      { id: 'mr1', text: 'Confront the truth head-on' },
      { id: 'mr2', text: 'Bide your time and gather more information' },
      { id: 'mr3', text: 'Seek a new ally you can trust' },
    ],
    metadataUpdate: { trust: -5 },
  },
  {
    nodeText:
      '"I need to tell you something." The voice is barely above a whisper, heavy with confession. The words that follow reshape the landscape of everything you thought you understood about this journey.',
    emotion: 'sad',
    choices: [
      { id: 'mr4', text: 'Listen with an open mind' },
      { id: 'mr5', text: 'Ask questions before passing judgment' },
      { id: 'mr6', text: 'Step back and process the revelation' },
    ],
    metadataUpdate: { trust: 5, wisdom: 5 },
  },
  {
    nodeText:
      'A critical crossroads. Two options, each with consequences you can only half-predict. One path promises safety but feels like surrender. The other is dangerous, but it pulses with the fierce energy of purpose.',
    emotion: 'nervous',
    choices: [
      { id: 'mr7', text: 'Choose the safe path — there is no shame in caution' },
      { id: 'mr8', text: 'Take the dangerous path — nothing worth having comes easy' },
      { id: 'mr9', text: 'Forge a third option nobody considered' },
    ],
    metadataUpdate: { courage: 10 },
  },
  {
    nodeText:
      'The results of your choice ripple outward. Some consequences are immediate — a door opens, a relationship shifts. Others are seeds planted in dark soil, waiting for their moment. You feel the weight of agency.',
    emotion: 'determined',
    choices: [
      { id: 'mr10', text: 'Double down on your decision' },
      { id: 'mr11', text: 'Course-correct while you still can' },
      { id: 'mr12', text: 'Accept the consequences and adapt' },
    ],
    metadataUpdate: { resolve: 5 },
  },
]

// ----- Midpoint nodes (ch3) ------------------------------------------------

const MIDPOINT_TURNS: MockTurn[] = [
  {
    nodeText:
      'The midpoint of your journey arrives not with a whisper but a roar. Everything you\'ve learned, every ally you\'ve made, every risk you\'ve taken — it all converges here. There is no going back. The world you knew is already behind you.',
    emotion: 'excited',
    choices: [
      { id: 'mm1', text: 'Charge forward — hesitation is the real enemy' },
      { id: 'mm2', text: 'Rally your allies for what comes next' },
      { id: 'mm3', text: 'Take one moment to prepare yourself' },
    ],
    metadataUpdate: { courage: 10, resolve: 5 },
  },
  {
    nodeText:
      'A betrayal — or was it a misunderstanding? Trust fractures like glass. The person standing before you was supposed to be on your side. Their explanation hangs in the air, waiting for your verdict.',
    emotion: 'angry',
    choices: [
      { id: 'mm4', text: 'Give them a chance to explain fully' },
      { id: 'mm5', text: 'Walk away — actions speak louder than words' },
      { id: 'mm6', text: 'Demand proof of their loyalty right now' },
    ],
    metadataUpdate: { trust: -10 },
  },
  {
    nodeText:
      'In the chaos, a truth emerges — about yourself, about the world, about what really matters. It\'s not the truth you expected, but it\'s the one you needed. The kind of insight that only comes from walking through fire.',
    emotion: 'happy',
    choices: [
      { id: 'mm7', text: 'Embrace this truth and let it guide you' },
      { id: 'mm8', text: 'Question it — not all revelations are what they seem' },
      { id: 'mm9', text: 'Share it with those who need to hear it' },
    ],
    metadataUpdate: { wisdom: 10 },
  },
  {
    nodeText:
      'The calm before the storm. A rare moment of stillness where you can breathe, think, feel. The next chapter will demand everything you have. For now, there is only this — the quiet company of your own thoughts and the faint hope of dawn.',
    emotion: 'neutral',
    choices: [
      { id: 'mm10', text: 'Rest and recover your strength' },
      { id: 'mm11', text: 'Use this time to plan your next move' },
      { id: 'mm12', text: 'Reach out to someone you care about' },
    ],
    metadataUpdate: { hope: 5, resolve: 5 },
  },
]

// ----- Climax nodes (ch4) --------------------------------------------------

const CLIMAX_TURNS: MockTurn[] = [
  {
    nodeText:
      'The moment of reckoning. Every choice, every sacrifice, every leap of faith has led to this singular point in time. The air crackles with tension. Your adversary — whether person, circumstance, or your own doubt — stands before you.',
    emotion: 'nervous',
    choices: [
      { id: 'mc1', text: 'Stand your ground and face it directly' },
      { id: 'mc2', text: 'Use cunning over brute force' },
      { id: 'mc3', text: 'Seek an unexpected compromise' },
    ],
    metadataUpdate: { courage: 15 },
  },
  {
    nodeText:
      'The ground shifts beneath you — literally or figuratively. A revelation upends the conflict, showing it in a new light. The enemy may not be who you thought. The prize may not be what you imagined. Certainty crumbles, but clarity begins to form.',
    emotion: 'shocked',
    choices: [
      { id: 'mc4', text: 'Adapt immediately to the new reality' },
      { id: 'mc5', text: 'Challenge the revelation — look deeper' },
      { id: 'mc6', text: 'Trust the people who got you this far' },
    ],
    metadataUpdate: { wisdom: 10, trust: 5 },
  },
  {
    nodeText:
      'Everything hangs in the balance. One final push, one last choice, and the outcome will be decided. Your body aches, your mind races, but somewhere deep inside, a voice says: you were made for this moment.',
    emotion: 'excited',
    choices: [
      { id: 'mc7', text: 'Give it everything — hold nothing back' },
      { id: 'mc8', text: 'Sacrifice something precious to secure victory' },
      { id: 'mc9', text: 'Find the path that saves everyone' },
    ],
    metadataUpdate: { resolve: 10, courage: 10 },
  },
]

// ----- Resolution nodes (ch5+) ---------------------------------------------

const RESOLUTION_TURNS: MockTurn[] = [
  {
    nodeText:
      'The dust settles. What was once a battlefield — of wits, of wills, of hearts — is now simply a place where something important happened. You stand in the aftermath, changed. The person who walked in is not the person walking out.',
    emotion: 'happy',
    choices: [
      { id: 'mv1', text: 'Take a moment to honor the journey' },
      { id: 'mv2', text: 'Reach for the person who mattered most' },
      { id: 'mv3', text: 'Look ahead — the story isn\'t over yet' },
    ],
    metadataUpdate: { hope: 10, wisdom: 5 },
  },
  {
    nodeText:
      '"Thank you." Two words, simple and enormous. The person beside you means them with every fiber of their being. In this moment, all the struggle, all the doubt, crystallizes into something beautiful: connection, forged in adversity.',
    emotion: 'happy',
    choices: [
      { id: 'mv4', text: '"You don\'t have to thank me — I\'d do it again."' },
      { id: 'mv5', text: '"We did this together."' },
      { id: 'mv6', text: 'Simply hold them close — words aren\'t needed' },
    ],
    metadataUpdate: { trust: 10, affection: 10 },
  },
  {
    nodeText:
      'The horizon stretches before you, vast and open. For the first time in what feels like forever, there is no urgent threat, no ticking clock — just possibility. Whatever comes next, you face it on your own terms.',
    emotion: 'excited',
    choices: [
      { id: 'mv7', text: 'Walk toward the future with open arms' },
      { id: 'mv8', text: 'Stay a while longer — there\'s more to discover' },
      { id: 'mv9', text: 'Share this victory with everyone who believed in you' },
    ],
    metadataUpdate: { confidence: 10, hope: 10 },
  },
]

// ----- Map phase to turn pool ----------------------------------------------

const TURNS_BY_PHASE: Record<ChapterPhase, MockTurn[]> = {
  opening: OPENING_TURNS,
  rising: RISING_TURNS,
  midpoint: MIDPOINT_TURNS,
  climax: CLIMAX_TURNS,
  resolution: RESOLUTION_TURNS,
}

// ----- Generic endings -----------------------------------------------------

const GENERIC_ENDINGS: EndingResponse[] = [
  {
    endingId: 'triumph',
    title: 'Triumph',
    description:
      'Against all odds, you persevered. The journey tested every fiber of your being, but you emerged stronger, wiser, and more certain of who you truly are. Some stories are about the destination. Yours was about becoming.',
    summary:
      'You overcame every obstacle and emerged transformed by the experience.',
    shareText:
      'I just achieved a triumphant ending! Every choice I made led to this moment.',
  },
  {
    endingId: 'bittersweet',
    title: 'Bittersweet Victory',
    description:
      'You won, but at a cost. The path demanded sacrifice, and you paid it without flinching. What remains is not the person who started this journey, but someone forged by fire — tempered, resilient, and quietly proud.',
    summary:
      'Victory came at a price, but you would pay it again without hesitation.',
    shareText:
      'A bittersweet ending to an incredible journey. Sometimes the hardest choices are the ones that matter most.',
  },
  {
    endingId: 'discovery',
    title: 'A New Discovery',
    description:
      'The real treasure wasn\'t what you set out to find — it was what you discovered about yourself along the way. Every wrong turn, every leap of faith, led you to a truth you never expected and a future you never imagined.',
    summary:
      'The journey revealed something unexpected and profound about who you are.',
    shareText:
      'I just discovered something unexpected about myself on this journey!',
  },
  {
    endingId: 'connection',
    title: 'A Meaningful Connection',
    description:
      'In the end, what mattered most wasn\'t the quest or the prize — it was the bonds you formed along the way. Trust given, trust earned, and the knowledge that even in the most uncertain times, we find each other.',
    summary:
      'The relationships you built became the true reward of your journey.',
    shareText:
      'I found that the real reward was the connections I made along the way!',
  },
  {
    endingId: 'legacy',
    title: 'A Lasting Legacy',
    description:
      'Your choices rippled outward, touching lives and reshaping the world in ways you may never fully see. That is the nature of courage — it doesn\'t ask for recognition. It simply acts, and trusts that good will follow.',
    summary:
      'Your actions left a mark that will endure long after the journey ends.',
    shareText:
      'I left my mark on this story. Every choice echoed beyond what I could see!',
  },
]

// ----- Public mock functions -----------------------------------------------

export function getMockStoryNode(
  templateId: string,
  chapterId: string,
  turnInChapter: number,
  _userChoice: string,
  _language: string,
): StoryNodeResponse {
  const phase = phaseForChapter(chapterId)
  const pool = TURNS_BY_PHASE[phase]
  const seed = `${templateId}-${chapterId}`
  const turn = pool[turnInChapter % pool.length]

  // Rotate choices slightly based on template so different games feel distinct
  const rotatedChoices = turn.choices.map((c, i) => {
    const offset = simpleHash(templateId) % turn.choices.length
    const src = turn.choices[(i + offset) % turn.choices.length]
    return { id: `${seed}-${turnInChapter}-${i}`, text: src.text }
  })

  // Determine if this should be the chapter-end node
  // Every ~3 turns within a chapter, create a chapter break
  const isChapterEnd = turnInChapter >= 2 && turnInChapter % 3 === 2
  const nextChapterNum = parseInt(chapterId.replace(/\D/g, ''), 10) || 1
  const nextChapter = isChapterEnd ? `ch${nextChapterNum + 1}` : undefined

  return {
    nodeText: turn.nodeText,
    emotion: turn.emotion,
    choices: rotatedChoices,
    isChapterEnd,
    nextChapter,
    metadataUpdate: turn.metadataUpdate,
  }
}

export function getMockEnding(
  templateId: string,
  _storyContext: Record<string, unknown>,
  _language: string,
): EndingResponse {
  // Deterministic pick based on template so the same game always gets
  // a consistent ending, but different games get different endings.
  const idx = simpleHash(templateId) % GENERIC_ENDINGS.length
  return GENERIC_ENDINGS[idx]
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
