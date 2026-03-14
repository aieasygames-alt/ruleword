// 常用5字母英文单词库

// 简单的种子随机数生成器 (Mulberry32)
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

export const WORDS = [
  // 科技相关
  'react', 'rules', 'input', 'logic', 'state', 'hooks', 'array', 'bytes', 'cache', 'debug',
  'email', 'files', 'graph', 'html', 'image', 'javascript', 'json', 'kernel', 'links',
  'macro', 'nodes', 'object', 'parse', 'query', 'regex', 'stack', 'token', 'users', 'valid',
  'web', 'xml', 'yield', 'zones',

  // 常用单词
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
  'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'align', 'alike', 'alive', 'allow',
  'alone', 'along', 'alter', 'among', 'angel', 'anger', 'angle', 'angry', 'apart', 'apple',
  'apply', 'arena', 'argue', 'arise', 'armor', 'array', 'arrow', 'asset', 'avoid', 'award',
  'aware', 'basic', 'basis', 'beach', 'beast', 'began', 'begin', 'being', 'below', 'bench',
  'bible', 'birth', 'black', 'blade', 'blame', 'blank', 'blast', 'bleed', 'blend', 'bless',
  'blind', 'block', 'blood', 'bloom', 'blown', 'board', 'boast', 'bonus', 'boost', 'booth',
  'bound', 'brain', 'brand', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief',
  'bring', 'broad', 'broke', 'brown', 'brush', 'build', 'bunch', 'burst', 'buyer', 'cable',
  'camel', 'candy', 'cargo', 'carry', 'catch', 'cause', 'chain', 'chair', 'charm', 'chart',
  'chase', 'cheap', 'check', 'cheek', 'chest', 'chief', 'child', 'china', 'chose', 'chunk',
  'civic', 'civil', 'claim', 'class', 'clean', 'clear', 'clerk', 'click', 'cliff', 'climb',
  'clock', 'close', 'cloth', 'cloud', 'coach', 'coast', 'colon', 'color', 'couch', 'could',
  'count', 'court', 'cover', 'crack', 'craft', 'crash', 'crazy', 'cream', 'crisp', 'cross',
  'crowd', 'crown', 'crude', 'crush', 'curve', 'cycle', 'daily', 'dairy', 'dance', 'dealt',
  'death', 'debut', 'decay', 'delay', 'delta', 'dense', 'depth', 'devil', 'diary', 'dirty',
  'doubt', 'dozen', 'draft', 'drain', 'drama', 'drank', 'drawn', 'dream', 'dress', 'dried',
  'drift', 'drill', 'drink', 'drive', 'drown', 'dying', 'eager', 'early', 'earth', 'eight',
  'elder', 'elect', 'elite', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error',
  'essay', 'event', 'every', 'exact', 'exist', 'extra', 'faint', 'faith', 'false', 'fault',
  'favor', 'feast', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final', 'first', 'fixed',
  'flame', 'flash', 'fleet', 'flesh', 'float', 'flock', 'flood', 'floor', 'flour', 'fluid',
  'flush', 'focal', 'focus', 'force', 'forge', 'forth', 'forty', 'forum', 'found', 'frame',
  'frank', 'fraud', 'fresh', 'front', 'frost', 'fruit', 'fully', 'funny', 'giant', 'given',
  'glass', 'globe', 'glory', 'glove', 'goose', 'grace', 'grade', 'grain', 'grand', 'grant',
  'grape', 'grasp', 'grass', 'grave', 'great', 'green', 'greet', 'grief', 'grill', 'gross',
  'group', 'grove', 'grown', 'guard', 'guess', 'guest', 'guide', 'guilt', 'habit', 'happy',
  'hardy', 'harsh', 'haven', 'heart', 'heavy', 'hence', 'hobby', 'honey', 'honor', 'horse',
  'hotel', 'house', 'human', 'humor', 'ideal', 'ideal', 'image', 'imply', 'index', 'inner',
  'input', 'issue', 'jelly', 'jewel', 'joint', 'joker', 'judge', 'juice', 'jumbo', 'jumpy',
  'knife', 'knock', 'known', 'label', 'labor', 'lance', 'large', 'laser', 'latch', 'later',
  'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'lemon', 'level', 'lever',
  'light', 'limit', 'linen', 'liver', 'local', 'lodge', 'logic', 'loose', 'lorry', 'loser',
  'lover', 'lower', 'loyal', 'lucky', 'lunar', 'lunch', 'lyric', 'magic', 'major', 'maker',
  'manga', 'manor', 'maple', 'march', 'marry', 'marsh', 'match', 'mayor', 'medal', 'media',
  'melon', 'mercy', 'merge', 'merit', 'merry', 'metal', 'meter', 'midst', 'might', 'minor',
  'minus', 'mixed', 'model', 'modem', 'money', 'month', 'moral', 'motor', 'mount', 'mouse',
  'mouth', 'movie', 'music', 'naked', 'nasty', 'naval', 'nerve', 'never', 'newly', 'night',
  'ninth', 'noble', 'noise', 'north', 'notch', 'noted', 'novel', 'nurse', 'occur', 'ocean',
  'offer', 'often', 'olive', 'onion', 'opera', 'orbit', 'order', 'organ', 'other', 'ought',
  'outer', 'outdo', 'owner', 'oxide', 'ozone', 'paint', 'panel', 'panic', 'paper', 'party',
  'pasta', 'paste', 'patch', 'pause', 'peace', 'peach', 'pearl', 'penny', 'perch', 'phase',
  'phone', 'photo', 'piano', 'piece', 'pilot', 'pinch', 'pitch', 'pizza', 'place', 'plain',
  'plane', 'plant', 'plate', 'plaza', 'plead', 'pluck', 'plumb', 'plunge', 'point', 'polar',
  'porch', 'posed', 'pound', 'power', 'press', 'price', 'pride', 'prime', 'print', 'prior',
  'prize', 'probe', 'proof', 'proud', 'prove', 'pupil', 'purse', 'queen', 'quest', 'quick',
  'quiet', 'quite', 'quote', 'radar', 'radio', 'raise', 'rally', 'ranch', 'range', 'rapid',
  'ratio', 'reach', 'react', 'ready', 'realm', 'rebel', 'refer', 'relax', 'relay', 'renew',
  'reply', 'reset', 'rider', 'ridge', 'rifle', 'right', 'rigid', 'rigor', 'rinse', 'risen',
  'risky', 'rival', 'river', 'roast', 'robot', 'rocky', 'roman', 'roomy', 'roots', 'rough',
  'round', 'route', 'royal', 'rugby', 'ruler', 'rumor', 'rural', 'sadly', 'saint', 'salad',
  'salon', 'sandy', 'sauce', 'scale', 'scare', 'scene', 'scent', 'scope', 'score', 'scout',
  'scrap', 'seize', 'sense', 'serve', 'setup', 'seven', 'shade', 'shake', 'shall', 'shame',
  'shape', 'share', 'shark', 'sharp', 'sheep', 'sheer', 'sheet', 'shelf', 'shell', 'shift',
  'shine', 'shirt', 'shock', 'shoot', 'shore', 'short', 'shout', 'shown', 'shrug', 'sight',
  'sigma', 'since', 'sixth', 'sixty', 'sized', 'skill', 'skull', 'slave', 'sleek', 'sleep',
  'slice', 'slide', 'slope', 'slump', 'small', 'smart', 'smell', 'smile', 'smoke', 'snake',
  'sneak', 'sniff', 'solid', 'solve', 'sorry', 'sound', 'south', 'space', 'spare', 'spark',
  'speak', 'speed', 'spell', 'spend', 'spice', 'spine', 'split', 'spoke', 'spoon', 'sport',
  'spray', 'squad', 'stack', 'staff', 'stage', 'stain', 'stake', 'stamp', 'stand', 'stare',
  'stark', 'start', 'state', 'steak', 'steal', 'steam', 'steel', 'steep', 'steer', 'stern',
  'stick', 'stiff', 'still', 'sting', 'stock', 'stomp', 'stone', 'stool', 'store', 'storm',
  'story', 'stove', 'strap', 'straw', 'stray', 'strip', 'stuck', 'study', 'stuff', 'style',
  'sugar', 'suite', 'sunny', 'super', 'surge', 'swamp', 'swarm', 'sweat', 'sweep', 'sweet',
  'swift', 'swing', 'sword', 'table', 'taken', 'taste', 'taxes', 'teach', 'teeth', 'tempo',
  'tense', 'tenth', 'terms', 'thank', 'theft', 'theme', 'there', 'these', 'thick', 'thief',
  'thigh', 'thing', 'think', 'third', 'thorn', 'those', 'three', 'threw', 'throw', 'thumb',
  'tiger', 'tight', 'timer', 'tired', 'title', 'toast', 'today', 'token', 'tooth', 'topic',
  'torch', 'total', 'touch', 'tough', 'towel', 'tower', 'toxic', 'trace', 'track', 'trade',
  'trail', 'train', 'trait', 'trash', 'treat', 'trend', 'trial', 'tribe', 'trick', 'tried',
  'troop', 'truck', 'truly', 'trump', 'trunk', 'trust', 'truth', 'tumor', 'twist', 'ultra',
  'uncle', 'under', 'unify', 'union', 'unity', 'until', 'upper', 'upset', 'urban', 'usage',
  'usual', 'valid', 'value', 'vapor', 'vault', 'venue', 'verse', 'video', 'viral', 'virus',
  'visit', 'vital', 'vivid', 'vocal', 'voice', 'voter', 'wagon', 'waist', 'waste', 'watch',
  'water', 'weary', 'weave', 'wedge', 'weigh', 'weird', 'wheat', 'wheel', 'where', 'which',
  'while', 'white', 'whole', 'whose', 'widen', 'widow', 'width', 'woman', 'world', 'worry',
  'worse', 'worst', 'worth', 'would', 'wound', 'woven', 'wrath', 'wreck', 'wrist', 'write',
  'wrong', 'wrote', 'yacht', 'yearn', 'yeast', 'yield', 'young', 'yours', 'youth', 'zebra',
]

// 验证单词是否为5字母
export const VALID_WORDS = WORDS.filter(w => w.length === 5)

// 根据种子获取单词（用于挑战模式）
export function getWordBySeed(seed: number): string {
  const rng = mulberry32(seed)
  const index = Math.floor(rng() * VALID_WORDS.length)
  return VALID_WORDS[index]
}
