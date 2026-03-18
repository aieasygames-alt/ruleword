import { useState, useCallback, useEffect, useRef } from 'react'

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type BoggleProps = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
  toggleTheme: () => void
  toggleSound: () => void
}

const GRID_SIZE = 4
const TIME_LIMIT = 120 // 2 minutes

// Dice configuration for Boggle (standard)
const DICE = [
  ['R', 'I', 'F', 'O', 'B', 'X'],
  ['I', 'F', 'E', 'H', 'E', 'Y'],
  ['D', 'E', 'N', 'O', 'W', 'S'],
  ['U', 'T', 'O', 'K', 'N', 'D'],
  ['H', 'M', 'S', 'R', 'A', 'O'],
  ['L', 'U', 'P', 'E', 'T', 'S'],
  ['A', 'C', 'I', 'T', 'O', 'A'],
  ['Y', 'L', 'G', 'K', 'U', 'E'],
  ['Q', 'B', 'M', 'J', 'O', 'A'],
  ['E', 'H', 'I', 'S', 'P', 'N'],
  ['V', 'E', 'T', 'I', 'G', 'N'],
  ['B', 'A', 'L', 'I', 'Y', 'T'],
  ['E', 'Z', 'A', 'V', 'N', 'D'],
  ['R', 'A', 'L', 'E', 'S', 'C'],
  ['U', 'W', 'I', 'L', 'R', 'G'],
  ['P', 'A', 'C', 'E', 'M', 'D'],
]

// Common English words for validation (subset)
const VALID_WORDS = new Set([
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

function generateBoard(): string[][] {
  const shuffledDice = [...DICE].sort(() => Math.random() - 0.5)
  const board: string[][] = []

  for (let i = 0; i < GRID_SIZE; i++) {
    const row: string[] = []
    for (let j = 0; j < GRID_SIZE; j++) {
      const die = shuffledDice[i * GRID_SIZE + j]
      const letter = die[Math.floor(Math.random() * die.length)]
      row.push(letter)
    }
    board.push(row)
  }

  return board
}

export default function Boggle({ settings, onBack }: BoggleProps) {
  const [board, setBoard] = useState<string[][]>([])
  const [selectedCells, setSelectedCells] = useState<{ row: number; col: number }[]>([])
  const [currentWord, setCurrentWord] = useState('')
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [gameActive, setGameActive] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')

  const isDark = settings.darkMode
  const bgClass = isDark ? 'bg-slate-900' : 'bg-gray-100'
  const textClass = isDark ? 'text-white' : 'text-gray-900'

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start game
  const startGame = useCallback(() => {
    setBoard(generateBoard())
    setSelectedCells([])
    setCurrentWord('')
    setFoundWords(new Set())
    setScore(0)
    setTimeLeft(TIME_LIMIT)
    setGameActive(true)
    setGameOver(false)
    setMessage('')
  }, [])

  // Timer
  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false)
      setGameOver(true)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [gameActive, timeLeft])

  // Check if cells are adjacent
  const isAdjacent = (cell1: { row: number; col: number }, cell2: { row: number; col: number }): boolean => {
    const rowDiff = Math.abs(cell1.row - cell2.row)
    const colDiff = Math.abs(cell1.col - cell2.col)
    return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)
  }

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (!gameActive) return

    const cellIndex = selectedCells.findIndex(c => c.row === row && c.col === col)

    if (cellIndex !== -1) {
      // Deselect from this cell onwards
      const newSelected = selectedCells.slice(0, cellIndex)
      setSelectedCells(newSelected)
      setCurrentWord(newSelected.map(c => board[c.row][c.col]).join(''))
    } else {
      // Check if adjacent to last selected cell
      if (selectedCells.length === 0 || isAdjacent(selectedCells[selectedCells.length - 1], { row, col })) {
        const newSelected = [...selectedCells, { row, col }]
        setSelectedCells(newSelected)
        setCurrentWord(prev => prev + board[row][col])
      }
    }
  }

  // Submit word
  const submitWord = useCallback(() => {
    if (!currentWord || currentWord.length < 3 || !gameActive) return

    const word = currentWord.toUpperCase()

    if (foundWords.has(word)) {
      setMessage('Already found!')
      setTimeout(() => setMessage(''), 1500)
    } else if (VALID_WORDS.has(word.toLowerCase())) {
      // Calculate score
      let points = 0
      if (word.length === 3) points = 1
      else if (word.length === 4) points = 1
      else if (word.length === 5) points = 2
      else if (word.length === 6) points = 3
      else if (word.length === 7) points = 5
      else points = 11

      setScore(prev => prev + points)
      setFoundWords(prev => new Set([...prev, word]))
      setMessage(`+${points} points!`)
      setTimeout(() => setMessage(''), 1500)
    } else {
      setMessage('Not a valid word')
      setTimeout(() => setMessage(''), 1500)
    }

    setSelectedCells([])
    setCurrentWord('')
  }, [currentWord, foundWords, gameActive])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedCells([])
    setCurrentWord('')
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col`}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">Time</div>
              <div className={`text-lg font-bold ${timeLeft <= 30 ? 'text-red-400' : 'text-green-400'}`}>
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Score</div>
              <div className="text-lg font-bold text-yellow-400">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-400">Words</div>
              <div className="text-lg font-bold text-blue-400">{foundWords.size}</div>
            </div>
          </div>
          <button
            onClick={startGame}
            className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 transition-colors text-sm font-medium"
          >
            {gameOver ? 'Play Again' : 'New'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {!gameActive && !gameOver ? (
          // Start Screen
          <div className="text-center space-y-6">
            <div className="text-6xl">🎲</div>
            <h1 className="text-3xl font-bold">Boggle</h1>
            <p className="text-slate-400 max-w-sm mx-auto">
              Find as many words as possible in {formatTime(TIME_LIMIT)}! Click adjacent letters to form words (3+ letters).
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 transition-colors font-bold text-lg"
            >
              Start Game
            </button>
          </div>
        ) : (
          <>
            {/* Current Word */}
            <div className="text-center">
              <div className="text-3xl font-bold tracking-wider min-h-[2.5rem]">
                {currentWord || '_'}
              </div>
              {message && (
                <div className={`text-sm mt-1 ${message.includes('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </div>
              )}
            </div>

            {/* Game Board */}
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="grid grid-cols-4 gap-2">
                {board.map((row, rowIdx) =>
                  row.map((letter, colIdx) => {
                    const isSelected = selectedCells.some(c => c.row === rowIdx && c.col === colIdx)
                    const isLast = selectedCells.length > 0 &&
                      selectedCells[selectedCells.length - 1].row === rowIdx &&
                      selectedCells[selectedCells.length - 1].col === colIdx

                    return (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg text-xl font-bold flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-green-600 scale-95'
                            : 'bg-slate-700 hover:bg-slate-600'
                        } ${isLast ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        {letter}
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                disabled={!currentWord}
                className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Clear
              </button>
              <button
                onClick={submitWord}
                disabled={!currentWord || currentWord.length < 3}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Submit
              </button>
            </div>

            {/* Found Words */}
            {foundWords.size > 0 && (
              <div className="w-full max-w-md">
                <div className="text-sm text-slate-400 mb-2">Found Words ({foundWords.size}):</div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {Array.from(foundWords).sort().map(word => (
                    <span
                      key={word}
                      className="px-2 py-1 bg-slate-700 rounded text-xs"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 text-center shadow-2xl max-w-sm mx-4`}>
              <div className="text-5xl mb-4">⏱️</div>
              <h2 className="text-2xl font-bold mb-2">Time's Up!</h2>
              <p className={`mb-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Score: <span className="text-yellow-400 font-bold">{score}</span>
              </p>
              <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                Words Found: <span className="text-blue-400 font-bold">{foundWords.size}</span>
              </p>
              <button
                onClick={startGame}
                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors font-medium"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
