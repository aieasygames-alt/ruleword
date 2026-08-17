import { useState, useCallback, useEffect, useRef } from 'react'
import {
  BOGGLE_TIME_LIMIT,
  type BoggleBoard,
  type BoggleBoardSize,
  type BoggleCell,
  type BoggleMode,
  type BoggleRoundSummary,
  bogglePathToWord,
  canAddBoggleCell,
  createBoggleShareText,
  generateDailyBoggleBoard,
  generateBoggleBoard,
  getBoggleHint,
  groupBoggleWordsByLength,
  scoreBoggleWord,
  summarizeBoggleRound,
} from '../../games/boggle/logic'
import {
  BOGGLE_BEST_SCORE_KEY,
  boggleBestScoreKey,
  getBoggleStorage,
  readBoggleBestScores,
  readBoggleDailyStats,
  readBoggleSettings,
  readRecentBoggleRounds,
  saveRecentBoggleRound,
  saveBoggleSettings,
  updateBoggleBestScores,
  updateBoggleDailyStats,
  type BoggleBestScores,
  type BoggleDailyStats,
  type BoggleRecentRound,
} from '../../games/boggle/retention'
import { trackRulewordEvent } from '../../utils/analytics'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type BoggleProps = {
  settings: Settings
  onBack: () => void
  onShare?: (data: { score?: number; result?: string }) => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

// Fallback common words used until the full dictionary (~76k words from /data/words-en.txt) loads.
// Lets the game stay playable on first paint even if the fetch is slow or fails.
const FALLBACK_WORDS = new Set([
  'able', 'ace', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'all',
  'and', 'ant', 'any', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ask',
  'ate', 'aug', 'awe', 'axe', 'bad', 'bag', 'ban', 'bar', 'bat', 'bay',
  'bed', 'bee', 'beg', 'bet', 'bid', 'big', 'bin', 'bit', 'bow', 'box',
  'boy', 'bud', 'bug', 'bun', 'bus', 'but', 'buy', 'cab', 'can', 'cap',
  'car', 'cat', 'cop', 'cow', 'cry', 'cub', 'cup', 'cut', 'dad', 'dam',
  'day', 'den', 'dew', 'did', 'die', 'dig', 'dim', 'dip', 'dog', 'dot',
  'dry', 'dub', 'dud', 'due', 'dug', 'dye', 'ear', 'eat', 'egg', 'ego',
  'elf', 'elk', 'elm', 'end', 'era', 'eve', 'eye', 'fab', 'fad', 'fan',
  'far', 'fat', 'fax', 'fed', 'fee', 'few', 'fig', 'fin', 'fir', 'fit',
  'fix', 'fly', 'foe', 'fog', 'for', 'fox', 'fry', 'fun', 'fur', 'gab',
  'gag', 'gap', 'gas', 'gay', 'gel', 'gem', 'get', 'gin', 'gnu', 'god',
  'got', 'gum', 'gun', 'gut', 'guy', 'gym', 'had', 'ham', 'has', 'hat',
  'hay', 'hem', 'hen', 'her', 'hew', 'hid', 'him', 'hip', 'his', 'hit',
  'hob', 'hog', 'hop', 'hot', 'how', 'hub', 'hue', 'hug', 'hum', 'hut',
  'ice', 'icy', 'ill', 'imp', 'ink', 'inn', 'ion', 'ire', 'irk', 'its',
  'ivy', 'jab', 'jag', 'jam', 'jar', 'jaw', 'jay', 'jet', 'jig', 'job',
  'jog', 'jot', 'joy', 'jug', 'jut', 'keg', 'ken', 'key', 'kid', 'kin',
  'kit', 'lab', 'lac', 'lad', 'lag', 'lap', 'law', 'lay', 'lea', 'led',
  'leg', 'let', 'lid', 'lie', 'lip', 'lit', 'log', 'lot', 'low', 'lug',
  'mad', 'man', 'map', 'mar', 'mat', 'maw', 'may', 'men', 'met', 'mid',
  'mix', 'mob', 'mod', 'mom', 'mop', 'mow', 'mud', 'mug', 'nab', 'nag',
  'nap', 'net', 'new', 'nil', 'nip', 'nit', 'nob', 'nod', 'nor', 'not',
  'now', 'nun', 'nut', 'oak', 'oar', 'oat', 'odd', 'ode', 'off', 'oft',
  'ohm', 'oil', 'old', 'one', 'opt', 'orb', 'ore', 'our', 'out', 'owe',
  'owl', 'own', 'pad', 'pal', 'pan', 'pap', 'par', 'pat', 'paw', 'pay',
  'pea', 'peg', 'pen', 'pep', 'per', 'pet', 'pew', 'pie', 'pig', 'pin',
  'pit', 'ply', 'pod', 'pop', 'pot', 'pow', 'pro', 'pry', 'pub', 'pug',
  'pun', 'pup', 'pus', 'put', 'rad', 'rag', 'ram', 'ran', 'rap', 'rat',
  'raw', 'ray', 'red', 'ref', 'rep', 'rib', 'rid', 'rig', 'rim', 'rip',
  'rob', 'rod', 'roe', 'rot', 'row', 'rub', 'rug', 'rum', 'run', 'rut',
  'rye', 'sac', 'sad', 'sag', 'sap', 'sat', 'saw', 'say', 'sea', 'set',
  'sew', 'she', 'shy', 'sin', 'sip', 'sir', 'sis', 'sit', 'six', 'ski',
  'sky', 'sly', 'sob', 'sod', 'son', 'sop', 'sot', 'sow', 'soy', 'spa',
  'spy', 'sty', 'sub', 'sue', 'sum', 'sun', 'sup', 'tab', 'tad', 'tag',
  'tan', 'tap', 'tar', 'tax', 'tea', 'ten', 'the', 'thy', 'tic', 'tie',
  'tin', 'tip', 'toe', 'ton', 'too', 'top', 'tot', 'tow', 'toy', 'try',
  'tub', 'tug', 'two', 'ugh', 'ump', 'ups', 'urn', 'use', 'van', 'vat',
  'vet', 'via', 'vie', 'vim', 'vow', 'wad', 'wag', 'war', 'was', 'wax',
  'way', 'web', 'wed', 'wee', 'wet', 'who', 'why', 'wig', 'win', 'wit',
  'woe', 'wok', 'won', 'woo', 'wow', 'yak', 'yam', 'yap', 'yaw', 'yea',
  'yen', 'yes', 'yet', 'yew', 'yin', 'yip', 'you', 'zap', 'zed', 'zee',
  'zen', 'zig', 'zip', 'zit', 'zoo',
  // 4-letter words
  'able', 'ache', 'acid', 'aged', 'aide', 'ally', 'also', 'amid', 'arch', 'area',
  'army', 'away', 'baby', 'back', 'bake', 'ball', 'band', 'bank', 'bare', 'bark',
  'barn', 'base', 'bath', 'bead', 'beam', 'bean', 'bear', 'beat', 'been', 'beer',
  'bell', 'belt', 'bend', 'bent', 'best', 'bias', 'bike', 'bill', 'bind', 'bird',
  'bite', 'blow', 'blue', 'boat', 'body', 'boil', 'bold', 'bolt', 'bomb', 'bond',
  'bone', 'book', 'boom', 'boot', 'bore', 'born', 'boss', 'both', 'bowl', 'bulk',
  'burn', 'bury', 'bush', 'busy', 'cafe', 'cage', 'cake', 'call', 'calm', 'came',
  'camp', 'card', 'care', 'cart', 'case', 'cash', 'cast', 'cave', 'cell', 'chip',
  'city', 'club', 'clue', 'coal', 'coat', 'code', 'coin', 'cold', 'come', 'cook',
  'cool', 'cope', 'copy', 'core', 'cost', 'cure', 'cute', 'dale', 'dame', 'damp',
  'dare', 'dark', 'dart', 'dash', 'data', 'date', 'dawn', 'dead', 'deal', 'dean',
  'dear', 'debt', 'deck', 'deed', 'deem', 'deep', 'deer', 'demo', 'deny', 'desk',
  'dial', 'dice', 'diet', 'dime', 'dine', 'dire', 'dirt', 'disc', 'dish', 'disk',
  'dive', 'dock', 'does', 'doll', 'dome', 'done', 'doom', 'door', 'dose', 'down',
  'drag', 'draw', 'drew', 'drip', 'drop', 'drug', 'drum', 'dual', 'duck', 'dude',
  'duel', 'duke', 'dust', 'duty', 'each', 'earn', 'ease', 'east', 'easy', 'edge',
  'edit', 'else', 'emit', 'ends', 'epic', 'even', 'ever', 'evil', 'exam', 'exit',
  'face', 'fact', 'fade', 'fail', 'fair', 'fake', 'fall', 'fame', 'fang', 'fare',
  'farm', 'fast', 'fate', 'fawn', 'fear', 'feat', 'feed', 'feel', 'feet', 'fell',
  'felt', 'file', 'fill', 'film', 'find', 'fine', 'fire', 'firm', 'fish', 'fist',
  'five', 'flag', 'flame', 'flap', 'flat', 'fled', 'flee', 'flew', 'flip', 'flow',
  'foam', 'fold', 'folk', 'food', 'fool', 'foot', 'ford', 'fork', 'form', 'fort',
  'four', 'free', 'frog', 'from', 'fuel', 'full', 'fund', 'fury', 'fuse', 'fuss',
  'gain', 'game', 'gang', 'gate', 'gave', 'gaze', 'gear', 'gene', 'gift', 'girl',
  'give', 'glad', 'glow', 'glue', 'goal', 'goat', 'goes', 'gold', 'golf', 'gone',
  'good', 'grab', 'gram', 'gray', 'grew', 'grid', 'grim', 'grin', 'grip', 'grow',
  'gulf', 'gust', 'hack', 'hail', 'hair', 'half', 'hall', 'halt', 'hand', 'hang',
  'hard', 'hare', 'harm', 'harp', 'hash', 'hate', 'haul', 'have', 'hawk', 'haze',
  'head', 'heal', 'heap', 'hear', 'heat', 'heel', 'held', 'hell', 'helm', 'help',
  'herb', 'herd', 'here', 'hero', 'hide', 'high', 'hike', 'hill', 'hint', 'hire',
  'hold', 'hole', 'holy', 'home', 'hook', 'hope', 'horn', 'host', 'hour', 'huge',
  'hull', 'hung', 'hunt', 'hurt', 'hype', 'icon', 'idea', 'idle', 'inch', 'into',
  'iron', 'item', 'jack', 'jail', 'jazz', 'jean', 'jerk', 'jest', 'join', 'joke',
  'jump', 'june', 'junk', 'jury', 'just', 'keen', 'keep', 'kept', 'kick', 'kill',
  'kind', 'king', 'kiss', 'kite', 'knee', 'knew', 'knit', 'knob', 'knot', 'know',
  'lace', 'lack', 'lady', 'laid', 'lake', 'lamb', 'lamp', 'land', 'lane', 'last',
  'late', 'lawn', 'lead', 'leaf', 'lean', 'leap', 'left', 'lend', 'lens', 'less',
  'liar', 'lick', 'life', 'lift', 'like', 'limb', 'lime', 'limp', 'line', 'link',
  'lion', 'list', 'live', 'load', 'loan', 'lock', 'logo', 'lone', 'long', 'look',
  'loop', 'lord', 'lose', 'loss', 'lost', 'loud', 'love', 'luck', 'lump', 'lung',
  'lure', 'lush', 'made', 'mail', 'main', 'make', 'male', 'mall', 'many', 'mare',
  'mark', 'mask', 'mass', 'mate', 'math', 'maze', 'meal', 'mean', 'meat', 'meet',
  'melt', 'memo', 'mend', 'menu', 'mere', 'mesh', 'mess', 'mild', 'mile', 'milk',
  'mill', 'mind', 'mine', 'mint', 'miss', 'mist', 'mode', 'mold', 'mood', 'moon',
  'more', 'most', 'moth', 'move', 'much', 'mule', 'must', 'myth', 'nail', 'name',
  'navy', 'near', 'neat', 'neck', 'need', 'nest', 'news', 'next', 'nice', 'nine',
  'node', 'none', 'noon', 'norm', 'nose', 'note', 'noun', 'nova', 'nude', 'nuts',
  'oath', 'obey', 'odds', 'okay', 'once', 'ones', 'only', 'onto', 'open', 'oral',
  'ours', 'oven', 'over', 'owed', 'pace', 'pack', 'page', 'paid', 'pain', 'pair',
  'pale', 'palm', 'pant', 'park', 'part', 'pass', 'past', 'path', 'peak', 'pear',
  'peas', 'peel', 'peer', 'perk', 'pest', 'pick', 'pier', 'pike', 'pile', 'pill',
  'pine', 'pink', 'pipe', 'pity', 'plan', 'play', 'plea', 'plot', 'plow', 'plug',
  'plus', 'poem', 'poet', 'pole', 'poll', 'pond', 'pool', 'poor', 'pope', 'pork',
  'port', 'pose', 'post', 'pour', 'pray', 'prep', 'prey', 'prop', 'proud', 'pull',
  'pump', 'pure', 'push', 'quit', 'race', 'rack', 'rage', 'raid', 'rail', 'rain',
  'ramp', 'rang', 'rank', 'rare', 'rash', 'rate', 'rave', 'read', 'real', 'rear',
  'rely', 'rent', 'rest', 'rice', 'rich', 'ride', 'ring', 'riot', 'rise', 'risk',
  'road', 'roam', 'roar', 'robe', 'rock', 'rode', 'role', 'roll', 'roof', 'room',
  'root', 'rope', 'rose', 'ruin', 'rule', 'rush', 'ruth', 'safe', 'sage', 'said',
  'sail', 'sake', 'sale', 'salt', 'same', 'sand', 'sane', 'sang', 'sank', 'save',
  'scan', 'seal', 'seam', 'seat', 'seed', 'seek', 'seem', 'seen', 'self', 'sell',
  'semi', 'send', 'sent', 'shed', 'ship', 'shop', 'shot', 'show', 'shut', 'sick',
  'side', 'sign', 'silk', 'sink', 'site', 'size', 'skin', 'skip', 'slam', 'slap',
  'slid', 'slim', 'slip', 'slot', 'slow', 'snap', 'snow', 'soak', 'soap', 'soar',
  'sock', 'soda', 'soft', 'soil', 'sold', 'sole', 'some', 'song', 'soon', 'sore',
  'sort', 'soul', 'span', 'spit', 'spot', 'stab', 'stay', 'stem', 'step', 'stir',
  'stop', 'such', 'suck', 'suit', 'sure', 'surf', 'swap', 'swim', 'tail', 'take',
  'tale', 'talk', 'tall', 'tank', 'tape', 'task', 'team', 'tear', 'tech', 'teen',
  'tell', 'tend', 'tent', 'term', 'test', 'text', 'than', 'that', 'them', 'then',
  'they', 'thin', 'this', 'thus', 'tide', 'tile', 'till', 'tilt', 'time', 'tiny',
  'tire', 'toad', 'told', 'toll', 'tone', 'took', 'tool', 'tops', 'tore', 'torn',
  'tour', 'town', 'trap', 'tray', 'tree', 'trim', 'trio', 'trip', 'trot', 'true',
  'tube', 'tuck', 'tune', 'turn', 'twin', 'type', 'ugly', 'unit', 'upon', 'urge',
  'used', 'user', 'vary', 'vast', 'verb', 'very', 'vest', 'vice', 'view', 'vile',
  'vine', 'visa', 'void', 'volt', 'vote', 'wage', 'wait', 'wake', 'walk', 'wall',
  'want', 'warm', 'warn', 'wash', 'wave', 'weak', 'wear', 'week', 'well', 'went',
  'were', 'west', 'what', 'when', 'whip', 'wide', 'wife', 'wild', 'will', 'wind',
  'wine', 'wing', 'wipe', 'wire', 'wise', 'wish', 'with', 'woke', 'wolf', 'wood',
  'wool', 'word', 'wore', 'work', 'worm', 'worn', 'wrap', 'yard', 'yarn', 'yeah',
  'year', 'yell', 'yoga', 'yoke', 'your', 'zero', 'zone', 'zoom',
  // 5-letter words
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
  'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alien', 'align', 'alike', 'alive',
  'allow', 'alone', 'along', 'alter', 'among', 'angel', 'anger', 'angle', 'angry', 'apart',
  'apple', 'apply', 'arena', 'argue', 'arise', 'armed', 'armor', 'array', 'arrow', 'aside',
  'asset', 'avoid', 'award', 'aware', 'awful', 'bacon', 'badge', 'badly', 'baker', 'basic',
  'basis', 'batch', 'beach', 'beard', 'beast', 'began', 'begin', 'being', 'belly', 'below',
  'bench', 'berry', 'birth', 'black', 'blade', 'blame', 'blank', 'blast', 'blaze', 'bleed',
  'blend', 'bless', 'blind', 'block', 'blood', 'bloom', 'blown', 'board', 'boost', 'booth',
  'bound', 'brain', 'brand', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief',
  'bring', 'broad', 'broke', 'broom', 'brown', 'brush', 'build', 'built', 'bunch', 'burst',
  'buyer', 'cabin', 'cable', 'candy', 'cargo', 'carry', 'catch', 'cause', 'cease', 'chain',
  'chair', 'chalk', 'champ', 'chaos', 'charm', 'chart', 'chase', 'cheap', 'check', 'cheek',
  'cheer', 'chess', 'chest', 'chief', 'child', 'chill', 'china', 'choir', 'chord', 'chose',
  'chunk', 'civic', 'civil', 'claim', 'clash', 'class', 'clean', 'clear', 'clerk', 'click',
  'cliff', 'climb', 'cling', 'clock', 'close', 'cloth', 'cloud', 'coach', 'coast', 'coral',
  'couch', 'could', 'count', 'court', 'cover', 'crack', 'craft', 'crash', 'crazy', 'cream',
  'creek', 'crime', 'crisp', 'cross', 'crowd', 'crown', 'crude', 'crush', 'curve', 'cycle',
  'daily', 'dairy', 'dance', 'debug', 'depth', 'dirty', 'doubt', 'dozen', 'draft', 'drain',
  'drake', 'drama', 'drank', 'drawn', 'dream', 'dress', 'dried', 'drift', 'drill', 'drink',
  'drive', 'droit', 'drown', 'drunk', 'dying', 'eager', 'early', 'earth', 'eight', 'elect',
  'elite', 'email', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'equip', 'error',
  'essay', 'event', 'every', 'exact', 'exist', 'extra', 'faint', 'fairy', 'faith', 'false',
  'fancy', 'fatal', 'fault', 'favor', 'feast', 'fence', 'ferry', 'fetch', 'fever', 'fiber',
  'field', 'fifth', 'fifty', 'fight', 'final', 'first', 'fixed', 'flame', 'flash', 'fleet',
  'flesh', 'float', 'flock', 'flood', 'floor', 'flour', 'fluid', 'flush', 'focus', 'force',
  'forge', 'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front',
  'frost', 'fruit', 'fully', 'funny', 'giant', 'given', 'glass', 'globe', 'glory', 'glove',
  'grace', 'grade', 'grain', 'grand', 'grant', 'grape', 'grasp', 'grass', 'grave', 'great',
  'green', 'greet', 'grief', 'grill', 'grind', 'groan', 'gross', 'group', 'grove', 'grown',
  'guard', 'guess', 'guest', 'guide', 'guilt', 'habit', 'happy', 'harsh', 'heart', 'heavy',
  'hello', 'hence', 'hinge', 'hobby', 'honey', 'honor', 'horse', 'hotel', 'hound', 'house',
  'human', 'humid', 'humor', 'ideal', 'image', 'imply', 'index', 'inner', 'input', 'issue',
  'jelly', 'jewel', 'joint', 'joker', 'jolly', 'judge', 'juice', 'juicy', 'jumbo', 'jumpy',
  'keeper', 'kitty', 'knife', 'knock', 'known', 'label', 'labor', 'laser', 'latch', 'later',
  'laugh', 'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'lemon', 'level', 'lever',
  'light', 'limit', 'linen', 'liver', 'lobby', 'local', 'lodge', 'logic', 'loose', 'lorry',
  'lotus', 'lover', 'lower', 'loyal', 'lucky', 'lunch', 'lunar', 'lying', 'lyric', 'macro',
  'madam', 'magic', 'major', 'maker', 'manor', 'maple', 'march', 'marsh', 'match', 'maybe',
  'mayor', 'means', 'medal', 'media', 'melon', 'mercy', 'merge', 'merit', 'merry', 'metal',
  'meter', 'midst', 'might', 'minor', 'minus', 'mixed', 'model', 'money', 'month', 'moral',
  'motor', 'motto', 'mount', 'mouse', 'mouth', 'movie', 'muddy', 'music', 'naked', 'nerve',
  'never', 'newly', 'night', 'ninth', 'noble', 'noise', 'noisy', 'north', 'notch', 'noted',
  'novel', 'nurse', 'occur', 'ocean', 'offer', 'often', 'olive', 'onion', 'opera', 'orbit',
  'order', 'organ', 'other', 'ought', 'outer', 'owned', 'owner', 'oxide', 'ozone', 'paint',
  'panel', 'panic', 'paper', 'party', 'paste', 'patch', 'pause', 'peace', 'peach', 'pearl',
  'penny', 'perch', 'piano', 'piece', 'pilot', 'pinch', 'pitch', 'pizza', 'place', 'plain',
  'plane', 'plant', 'plate', 'plaza', 'plead', 'pleat', 'pluck', 'plumb', 'plump', 'plunge',
  'point', 'polar', 'poker', 'polar', 'porch', 'pouch', 'pound', 'power', 'press', 'price',
  'pride', 'prime', 'print', 'prior', 'prize', 'probe', 'proof', 'proud', 'prove', 'proxy',
  'pulse', 'pupil', 'puppy', 'purse', 'queen', 'query', 'quest', 'quick', 'quiet', 'quite',
  'quota', 'quote', 'radar', 'radio', 'raise', 'rally', 'ranch', 'range', 'rapid', 'ratio',
  'reach', 'react', 'ready', 'realm', 'rebel', 'refer', 'reign', 'relax', 'relay', 'reply',
  'rider', 'ridge', 'rifle', 'right', 'rigid', 'risky', 'rival', 'river', 'roast', 'robot',
  'rocky', 'roman', 'roomy', 'roots', 'rough', 'round', 'route', 'royal', 'rugby', 'ruler',
  'rumor', 'rural', 'sadly', 'saint', 'salad', 'salon', 'sandy', 'sauce', 'scale', 'scare',
  'scarf', 'scary', 'scene', 'scent', 'scope', 'score', 'scout', 'scrap', 'seize', 'sense',
  'serve', 'setup', 'seven', 'shade', 'shake', 'shall', 'shame', 'shape', 'share', 'shark',
  'sharp', 'sheep', 'sheer', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shirt', 'shock',
  'shoot', 'shore', 'short', 'shout', 'shown', 'sides', 'siege', 'sight', 'sigma', 'silly',
  'since', 'sixth', 'sixty', 'sized', 'skill', 'skull', 'slave', 'sleep', 'slice', 'slide',
  'slope', 'small', 'smart', 'smell', 'smile', 'smoke', 'snake', 'solar', 'solid', 'solve',
  'sorry', 'sound', 'south', 'space', 'spare', 'spark', 'speak', 'speed', 'spend', 'spent',
  'spice', 'spine', 'spite', 'split', 'spoke', 'spoon', 'sport', 'spray', 'squad', 'stack',
  'staff', 'stage', 'stain', 'stair', 'stake', 'stamp', 'stand', 'stare', 'stark', 'start',
  'state', 'steak', 'steal', 'steam', 'steel', 'steep', 'steer', 'stick', 'stiff', 'still',
  'stock', 'stomp', 'stone', 'stood', 'stool', 'store', 'storm', 'story', 'stove', 'strap',
  'straw', 'stray', 'strip', 'stuck', 'study', 'stuff', 'style', 'sugar', 'suite', 'sunny',
  'super', 'surge', 'swamp', 'swear', 'sweat', 'sweep', 'sweet', 'swept', 'swift', 'swing',
  'sword', 'syrup', 'table', 'taken', 'tales', 'taste', 'tasty', 'teach', 'teeth', 'tempo',
  'tense', 'tenth', 'terms', 'terry', 'thank', 'theft', 'their', 'theme', 'there', 'these',
  'thick', 'thief', 'thigh', 'thing', 'think', 'third', 'those', 'three', 'threw', 'throw',
  'thumb', 'tiger', 'tight', 'timer', 'tired', 'title', 'toast', 'today', 'token', 'topic',
  'torch', 'total', 'touch', 'tough', 'tower', 'trace', 'track', 'trade', 'trail', 'train',
  'trait', 'trash', 'treat', 'trend', 'trial', 'tribe', 'trick', 'tried', 'troop', 'truck',
  'truly', 'trump', 'trunk', 'trust', 'truth', 'twice', 'twist', 'tying', 'udder', 'ultra',
  'uncle', 'under', 'unfair', 'union', 'unity', 'until', 'upper', 'upset', 'urban', 'usage',
  'usual', 'valid', 'value', 'vapor', 'vault', 'venue', 'verse', 'video', 'vigor', 'vinyl',
  'virus', 'visit', 'vital', 'vivid', 'vocal', 'vodka', 'vogue', 'voice', 'voter', 'wagon',
  'waist', 'waste', 'watch', 'water', 'weary', 'weave', 'wedge', 'weigh', 'weird', 'wheat',
  'wheel', 'where', 'which', 'while', 'white', 'whole', 'whose', 'widen', 'widow', 'width',
  'wired', 'witch', 'woman', 'women', 'world', 'worry', 'worse', 'worst', 'worth', 'would',
  'wound', 'wrist', 'write', 'wrong', 'wrote', 'yacht', 'yearn', 'yeast', 'yield', 'young',
  'yours', 'youth', 'zebra', 'zesty',
])


// Async-loaded full dictionary. Module-level cache shared across all Boggle instances.
let dictionaryPromise: Promise<Set<string>> | null = null
let dictionaryCache: Set<string> | null = null

function loadDictionary(): Promise<Set<string>> {
  if (dictionaryCache) return Promise.resolve(dictionaryCache)
  if (!dictionaryPromise) {
    dictionaryPromise = fetch('/data/words-en.txt')
      .then(r => (r.ok ? r.text() : ''))
      .then(text => {
        const words = new Set<string>()
        for (const w of text.split('\n')) {
          const trimmed = w.trim().toLowerCase()
          if (trimmed.length >= 3 && trimmed.length <= 16 && /^[a-z]+$/.test(trimmed)) {
            words.add(trimmed)
          }
        }
        if (words.size > 0) dictionaryCache = words
        return words
      })
      .catch(() => new Set<string>())
  }
  return dictionaryPromise
}

function getDictionary(): Set<string> {
  return dictionaryCache ?? FALLBACK_WORDS
}

function isValidWord(word: string): boolean {
  const lower = word.toLowerCase()
  if (dictionaryCache) return dictionaryCache.has(lower)
  return FALLBACK_WORDS.has(lower)
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function wordListLabel(words: string[]) {
  if (words.length === 0) return 'No words yet'
  return `${words.length} word${words.length === 1 ? '' : 's'}`
}

export default function Boggle({ settings, onBack, onShare }: BoggleProps) {
  const [board, setBoard] = useState<BoggleBoard>([])
  const [selectedCells, setSelectedCells] = useState<BoggleCell[]>([])
  const [currentWord, setCurrentWord] = useState('')
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(BOGGLE_TIME_LIMIT)
  const [mode, setMode] = useState<BoggleMode>('classic')
  const [boardSize, setBoardSize] = useState<BoggleBoardSize>(4)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')
  const [roundSummary, setRoundSummary] = useState<BoggleRoundSummary | null>(null)
  const [bestScore, setBestScore] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set())
  const [hintText, setHintText] = useState('')
  const [shareStatus, setShareStatus] = useState('')
  const [recentRounds, setRecentRounds] = useState<BoggleRecentRound[]>([])
  const [dailyStats, setDailyStats] = useState<BoggleDailyStats>({ streak: 0, bestStreak: 0, lastPlayedDate: '' })
  const [bestScores, setBestScores] = useState<BoggleBestScores>({})
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadDictionary()
    const stored = getBoggleStorage()?.getItem(BOGGLE_BEST_SCORE_KEY)
    if (stored) setBestScore(Number(stored) || 0)
    setRecentRounds(readRecentBoggleRounds())
    setDailyStats(readBoggleDailyStats())
    setBestScores(readBoggleBestScores())
    const savedSettings = readBoggleSettings()
    setMode(savedSettings.mode)
    setBoardSize(savedSettings.boardSize)
    setSettingsLoaded(true)
  }, [])

  useEffect(() => {
    if (!settingsLoaded) return
    saveBoggleSettings({ mode, boardSize })
  }, [boardSize, mode, settingsLoaded])

  const clearSelection = useCallback(() => {
    setSelectedCells([])
    setCurrentWord('')
  }, [])

  const finishRound = useCallback(() => {
    setGameActive(false)
    setGameOver(true)
    setIsDragging(false)
    clearSelection()
    try {
      const summary = summarizeBoggleRound(board, foundWords, getDictionary())
      setRoundSummary(summary)
      const nextDailyStats = mode === 'daily' ? updateBoggleDailyStats() : dailyStats
      if (mode === 'daily') setDailyStats(nextDailyStats)
      setRecentRounds(saveRecentBoggleRound({
        id: `${Date.now()}-${mode}-${boardSize}`,
        playedAt: new Date().toISOString(),
        mode,
        boardSize,
        score,
        wordCount: foundWords.size,
        possibleWordCount: summary.possibleWords.length,
      }))
      trackRulewordEvent('boggle_complete', {
        mode,
        board_size: boardSize,
        score,
        word_count: foundWords.size,
        possible_word_count: summary.possibleWords.length,
        missed_word_count: summary.missedWords.length,
        daily_streak: nextDailyStats.streak,
      })
      setBestScore(prev => {
        const next = Math.max(prev, score)
        getBoggleStorage()?.setItem(BOGGLE_BEST_SCORE_KEY, String(next))
        return next
      })
      setBestScores(updateBoggleBestScores(mode, boardSize, score))
    } catch {
      setRoundSummary(null)
    }
  }, [board, boardSize, clearSelection, dailyStats, foundWords, mode, score])

  const startGame = useCallback(() => {
    setBoard(mode === 'daily' ? generateDailyBoggleBoard(new Date(), boardSize) : generateBoggleBoard(Math.random, boardSize))
    setSelectedCells([])
    setCurrentWord('')
    setFoundWords(new Set())
    setScore(0)
    setTimeLeft(BOGGLE_TIME_LIMIT)
    setGameActive(true)
    setGameOver(false)
    setMessage('')
    setRoundSummary(null)
    setIsDragging(false)
    setRevealedHints(new Set())
    setHintText('')
    setShareStatus('')
    trackRulewordEvent('boggle_start', {
      mode,
      board_size: boardSize,
    })
  }, [boardSize, mode])

  useEffect(() => {
    if (gameActive && mode === 'classic' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (gameActive && mode === 'classic' && timeLeft === 0) {
      finishRound()
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [finishRound, gameActive, mode, timeLeft])

  const addCellToPath = useCallback((row: number, col: number) => {
    if (!gameActive) return

    const cellIndex = selectedCells.findIndex(c => c.row === row && c.col === col)
    if (cellIndex !== -1) {
      const nextPath = selectedCells.slice(0, cellIndex)
      setSelectedCells(nextPath)
      setCurrentWord(bogglePathToWord(board, nextPath))
      return
    }

    const next = { row, col }
    if (!canAddBoggleCell(board, selectedCells, next)) return
    const nextPath = [...selectedCells, next]
    setSelectedCells(nextPath)
    setCurrentWord(bogglePathToWord(board, nextPath))
  }, [board, gameActive, selectedCells])

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !gameActive) return
    const target = document.elementFromPoint(clientX, clientY)
    const cell = target?.closest<HTMLButtonElement>('[data-boggle-cell]')
    const row = Number(cell?.dataset.row)
    const col = Number(cell?.dataset.col)
    if (Number.isInteger(row) && Number.isInteger(col)) addCellToPath(row, col)
  }, [addCellToPath, gameActive, isDragging])

  const submitWord = useCallback(() => {
    if (!currentWord || currentWord.length < 3 || !gameActive) return

    const word = currentWord.toUpperCase()
    if (foundWords.has(word)) {
      setMessage('Already found')
    } else if (isValidWord(word)) {
      const points = scoreBoggleWord(word)
      setScore(prev => prev + points)
      setFoundWords(prev => new Set([...prev, word]))
      setMessage(`+${points} points`)
    } else {
      setMessage('Not a valid word')
    }

    window.setTimeout(() => setMessage(''), 1400)
    clearSelection()
  }, [clearSelection, currentWord, foundWords, gameActive])

  const handleHint = useCallback(() => {
    const summary = summarizeBoggleRound(board, foundWords, getDictionary())
    const hint = getBoggleHint(summary, revealedHints)
    if (!hint) {
      setHintText('No more hints available')
      return
    }
    const hintedWord = summary.missedWords.find(word => {
      const prefixLength = word.length >= 6 ? 2 : 1
      return hint.startsWith(word.slice(0, prefixLength))
    })
    if (hintedWord) setRevealedHints(prev => new Set([...prev, hintedWord]))
    setHintText(hint)
    trackRulewordEvent('boggle_hint', {
      mode,
      board_size: boardSize,
      revealed_hints: revealedHints.size + 1,
    })
  }, [board, boardSize, foundWords, mode, revealedHints])

  const handleShare = useCallback(async () => {
    const text = createBoggleShareText({
      score,
      wordCount: foundWords.size,
      possibleWordCount: roundSummary?.possibleWords.length,
      bestPossibleScore: roundSummary?.bestPossibleScore,
      mode,
      size: boardSize,
      date: new Date(),
    })
    if (onShare) {
      onShare({ score, result: text })
      trackRulewordEvent('boggle_share', {
        mode,
        board_size: boardSize,
        score,
        word_count: foundWords.size,
      })
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('Copied')
      trackRulewordEvent('boggle_share', {
        mode,
        board_size: boardSize,
        score,
        word_count: foundWords.size,
      })
      window.setTimeout(() => setShareStatus(''), 1400)
    } catch {
      setShareStatus('Share unavailable')
    }
  }, [boardSize, foundWords.size, mode, onShare, roundSummary?.possibleWords.length, score])

  useEffect(() => {
    if (!gameActive) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        submitWord()
        return
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
        const nextPath = selectedCells.slice(0, -1)
        setSelectedCells(nextPath)
        setCurrentWord(bogglePathToWord(board, nextPath))
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
        return
      }
      if (!/^[a-zA-Z]$/.test(e.key)) return
      e.preventDefault()
      const letter = e.key.toUpperCase()
      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          if (selectedCells.some(cell => cell.row === row && cell.col === col)) continue
          const tile = board[row][col].toUpperCase()
          if (tile !== letter && !(tile === 'QU' && letter === 'Q')) continue
          if (!canAddBoggleCell(board, selectedCells, { row, col })) continue
          const nextPath = [...selectedCells, { row, col }]
          setSelectedCells(nextPath)
          setCurrentWord(bogglePathToWord(board, nextPath))
          return
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [board, clearSelection, gameActive, selectedCells, submitWord])

  const sortedFoundWords = Array.from(foundWords).sort((a, b) => b.length - a.length || a.localeCompare(b))
  const groupedFoundWords = groupBoggleWordsByLength(sortedFoundWords)
  const selectedBestScore = bestScores[boggleBestScoreKey(mode, boardSize)] ?? 0
  const hasBoard = board.length > 0

  return (
    <div data-testid="boggle-game" className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button onClick={onBack} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm">
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">Time</div>
              <div data-testid="boggle-time" className={`text-lg font-bold ${mode === 'classic' && timeLeft <= 30 ? 'text-red-400' : 'text-green-400'}`}>
                {mode === 'classic' ? formatTime(timeLeft) : 'Relax'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Score</div>
              <div data-testid="boggle-score" className="text-lg font-bold text-yellow-400">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Words</div>
              <div data-testid="boggle-word-count" className="text-lg font-bold text-blue-400">{foundWords.size}</div>
            </div>
            <div className="hidden sm:block text-center">
              <div className="text-xs text-slate-400">Best</div>
              <div className="text-lg font-bold text-emerald-400">{bestScore}</div>
            </div>
          </div>
          <button data-testid="boggle-header-start" onClick={startGame} className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium">
            {gameActive ? 'New' : gameOver ? 'Play Again' : hasBoard ? 'New' : 'Start'}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {!gameActive && !gameOver && !hasBoard ? (
          <div className="text-center space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold">Play Boggle Online Free</h1>
            <p className="text-slate-400 max-w-md mx-auto">
              Race the classic 2-minute timer or practice in relaxed mode. Connect adjacent letters, submit 3+ letter words, and review missed words after every round.
            </p>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
              {(['classic', 'relaxed', 'daily'] as BoggleMode[]).map(option => (
                <button
                  key={option}
                  data-testid={`boggle-mode-${option}`}
                  onClick={() => setMode(option)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === option ? 'bg-green-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  {option === 'classic' ? 'Classic 2:00' : option === 'daily' ? 'Daily' : 'Relaxed'}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-xl border border-slate-700 bg-slate-900 p-1">
              {([4, 5] as BoggleBoardSize[]).map(size => (
                <button
                  key={size}
                  data-testid={`boggle-size-${size}`}
                  onClick={() => setBoardSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${boardSize === size ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-800/70 px-4 py-3">Classic 4x4 and Big 5x5</div>
              <div className="rounded-lg bg-slate-800/70 px-4 py-3">Mouse, touch, keyboard</div>
              <div className="rounded-lg bg-slate-800/70 px-4 py-3">Daily board, hints, share result</div>
            </div>
            <div className="grid gap-3 text-left sm:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="text-xs uppercase text-slate-500">Daily Streak</div>
                <div className="mt-1 text-2xl font-bold text-amber-300">{dailyStats.streak}</div>
                <div className="text-xs text-slate-400">Best streak: {dailyStats.bestStreak}</div>
                <div className="mt-3 border-t border-slate-800 pt-3">
                  <div className="text-xs uppercase text-slate-500">Best for {mode} {boardSize}x{boardSize}</div>
                  <div data-testid="boggle-selected-best" className="mt-1 text-xl font-bold text-emerald-300">{selectedBestScore}</div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs uppercase text-slate-500">Recent Rounds</div>
                  <div className="text-xs text-slate-600">{recentRounds.length}/5</div>
                </div>
                <div className="space-y-2">
                  {recentRounds.length > 0 ? recentRounds.slice(0, 3).map(round => (
                    <div key={round.id} className="flex items-center justify-between rounded-lg bg-slate-800/70 px-3 py-2 text-xs">
                      <span className="capitalize text-slate-300">{round.mode} {round.boardSize}x{round.boardSize}</span>
                      <span className="text-slate-400">{round.score} pts · {round.wordCount} words</span>
                    </div>
                  )) : (
                    <div className="rounded-lg bg-slate-800/70 px-3 py-2 text-xs text-slate-500">Finish a round to start your history.</div>
                  )}
                </div>
              </div>
            </div>
            <button data-testid="boggle-start" onClick={startGame} className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold text-lg">
              Start Game
            </button>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div data-testid="boggle-current-word" className="text-3xl font-bold tracking-wider min-h-[2.5rem]">{currentWord || '_'}</div>
              {message && (
                <div data-testid="boggle-message" className={`text-sm mt-1 ${message.includes('+') ? 'text-green-400' : message.includes('Already') ? 'text-amber-400' : 'text-red-400'}`}>
                  {message}
                </div>
              )}
            </div>

            <div
              data-testid="boggle-board"
              className="bg-slate-800 rounded-xl p-4 touch-none select-none"
              onPointerMove={event => handlePointerMove(event.clientX, event.clientY)}
              onPointerLeave={() => setIsDragging(false)}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
            >
              <div className={`grid gap-2 ${boardSize === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                {board.map((row, rowIdx) => row.map((letter, colIdx) => {
                  const isSelected = selectedCells.some(c => c.row === rowIdx && c.col === colIdx)
                  const isLast = selectedCells[selectedCells.length - 1]?.row === rowIdx && selectedCells[selectedCells.length - 1]?.col === colIdx
                  return (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      data-boggle-cell
                      data-testid={`boggle-cell-${rowIdx}-${colIdx}`}
                      data-row={rowIdx}
                      data-col={colIdx}
                      onPointerDown={event => {
                        event.currentTarget.setPointerCapture(event.pointerId)
                        setIsDragging(true)
                        addCellToPath(rowIdx, colIdx)
                      }}
                      className={`${boardSize === 5 ? 'w-11 h-11 sm:w-14 sm:h-14' : 'w-14 h-14 sm:w-16 sm:h-16'} rounded-lg text-xl font-bold flex items-center justify-center transition-all ${isSelected ? 'bg-green-600 scale-95' : 'bg-slate-700 hover:bg-slate-600'} ${isLast ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      {letter}
                    </button>
                  )
                }))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button data-testid="boggle-clear" onClick={clearSelection} disabled={!currentWord} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                Clear
              </button>
              <button data-testid="boggle-submit" onClick={submitWord} disabled={!currentWord || currentWord.length < 3} className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                Submit
              </button>
              {mode === 'relaxed' && gameActive && (
                <button data-testid="boggle-end-round" onClick={finishRound} className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 transition-colors font-medium">
                  End Round
                </button>
              )}
              {gameActive && (
                <button data-testid="boggle-hint" onClick={handleHint} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium">
                  Hint
                </button>
              )}
            </div>
            {hintText && <div data-testid="boggle-hint-text" className="text-sm text-blue-300">Hint: {hintText}</div>}

            <div data-testid="boggle-found-words" className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">Found Words</span>
                <span className="text-slate-500">{wordListLabel(sortedFoundWords)}</span>
              </div>
              <div className="max-h-36 space-y-3 overflow-y-auto">
                {groupedFoundWords.length > 0 ? groupedFoundWords.map(group => (
                  <div key={group.length} data-testid={`boggle-found-group-${group.length}`} className="text-left">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                      <span>{group.length} letters</span>
                      <span>{group.words.length} word{group.words.length === 1 ? '' : 's'} · {group.score} pts</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.words.map(word => (
                        <span key={word} className="px-2 py-1 bg-slate-700 rounded text-xs">{word}</span>
                      ))}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg bg-slate-800/70 px-3 py-2 text-xs text-slate-500">Found words will group by length here.</div>
                )}
              </div>
            </div>
          </>
        )}

        {gameOver && (
          <div data-testid="boggle-round-complete" className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-6 text-center shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
              <h2 className="text-2xl font-bold mb-3">Round Complete</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <div className="text-xs text-slate-400">Score</div>
                  <div className="text-xl font-bold text-yellow-400">{score}</div>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <div className="text-xs text-slate-400">Found</div>
                  <div className="text-xl font-bold text-blue-400">{foundWords.size}</div>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <div className="text-xs text-slate-400">Missed</div>
                  <div className="text-xl font-bold text-red-400">{roundSummary?.missedWords.length ?? 0}</div>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3">
                  <div className="text-xs text-slate-400">Best</div>
                  <div className="text-xl font-bold text-emerald-400">{bestScore}</div>
                </div>
              </div>

              {mode === 'daily' && (
                <div className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3">
                  <div className="text-xs uppercase text-amber-200/80">Daily Boggle Streak</div>
                  <div className="mt-1 text-lg font-bold text-amber-200">{dailyStats.streak} day{dailyStats.streak === 1 ? '' : 's'}</div>
                  <div className="text-xs text-amber-100/70">Best streak: {dailyStats.bestStreak}</div>
                </div>
              )}

              {roundSummary && (
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className="rounded-xl bg-slate-900/60 p-3">
                    <div className="text-xs uppercase text-slate-400">Best possible</div>
                    <div className="text-lg font-bold text-emerald-400">{roundSummary.bestPossibleScore} pts</div>
                    <div className="text-xs text-slate-500">{roundSummary.possibleWords.length} total words on this board</div>
                  </div>
                  <div className="rounded-xl bg-slate-900/60 p-3">
                    <div className="text-xs uppercase text-slate-400">Your breakdown</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {roundSummary.scoreByLength.length > 0 ? roundSummary.scoreByLength.map(row => (
                        <span key={row.length} className="rounded bg-slate-700 px-2 py-1 text-xs">
                          {row.length}L: {row.count} / {row.score}pts
                        </span>
                      )) : <span className="text-xs text-slate-500">No scored words yet</span>}
                    </div>
                  </div>
                </div>
              )}

              {roundSummary && roundSummary.missedWords.length > 0 && (
                <div className="mb-4">
                  <div className={`text-sm mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Words you missed</div>
                  <div className="flex flex-wrap gap-1 justify-center max-h-48 overflow-y-auto">
                    {roundSummary.missedWords.slice(0, 80).map(word => (
                      <span key={word} className={`px-2 py-1 rounded text-xs ${word.length >= 8 ? 'bg-purple-700 text-purple-100' : word.length >= 5 ? 'bg-slate-700 text-slate-100' : isDark ? 'bg-slate-700/60 text-slate-300' : 'bg-gray-200 text-gray-700'}`}>
                        {word}
                      </span>
                    ))}
                    {roundSummary.missedWords.length > 80 && (
                      <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">+{roundSummary.missedWords.length - 80} more</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-2">
                <button data-testid="boggle-play-again" onClick={startGame} className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium">
                  Play Again
                </button>
                <button data-testid="boggle-share" onClick={handleShare} className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium">
                  Share
                </button>
                <button data-testid="boggle-review-board" onClick={() => setGameOver(false)} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors font-medium">
                  Review Board
                </button>
              </div>
              {shareStatus && <div className="mt-3 text-sm text-blue-300">{shareStatus}</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
