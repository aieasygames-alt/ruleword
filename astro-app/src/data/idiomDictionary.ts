// 四字成语词典（带解释）
export interface IdiomEntry {
  idiom: string
  pinyin: string
  meaning: string
  category: string
}

export const IDIOM_DICTIONARY: IdiomEntry[] = [
  // A-B
  { idiom: '一举两得', pinyin: 'yī jǔ liǎng dé', meaning: '做一件事得到两方面的好处', category: '褒义' },
  { idiom: '一鸣惊人', pinyin: 'yī míng jīng rén', meaning: '比喻平时默默无闻，突然有惊人的表现', category: '褒义' },
  { idiom: '一石二鸟', pinyin: 'yī shí èr niǎo', meaning: '扔一颗石子打到两只鸟', category: '褒义' },
  { idiom: '一诺千金', pinyin: 'yī nuò qiān jīn', meaning: '许下的一个诺言有千金的价值', category: '褒义' },
  { idiom: '一目了然', pinyin: 'yī mù liǎo rán', meaning: '一眼就看得很清楚', category: '中性' },
  { idiom: '一刀两断', pinyin: 'yī dāo liǎng duàn', meaning: '坚决断绝关系', category: '中性' },
  { idiom: '一帆风顺', pinyin: 'yī fān fēng shùn', meaning: '船挂着满帆顺风行驶，比喻非常顺利', category: '褒义' },
  { idiom: '一丝不苟', pinyin: 'yī sī bù gǒu', meaning: '形容办事认真，连最细微的地方也不马虎', category: '褒义' },
  { idiom: '一言九鼎', pinyin: 'yī yán jiǔ dǐng', meaning: '说话分量极重，作用很大', category: '褒义' },
  { idiom: '一箭双雕', pinyin: 'yī jiàn shuāng diāo', meaning: '原指射箭技术高超，一箭射中两只雕', category: '褒义' },
  { idiom: '不屈不挠', pinyin: 'bù qū bù náo', meaning: '在压力和困难面前不屈服，表现十分顽强', category: '褒义' },
  { idiom: '不谋而合', pinyin: 'bù móu ér hé', meaning: '事先没有商量过，意见或行动却完全一致', category: '中性' },
  { idiom: '半途而废', pinyin: 'bàn tú ér fèi', meaning: '路走到一半停了下来', category: '贬义' },

  // C
  { idiom: '持之以恒', pinyin: 'chí zhī yǐ héng', meaning: '长久坚持下去', category: '褒义' },
  { idiom: '层出不穷', pinyin: 'céng chū bù qióng', meaning: '接连不断地出现，没有穷尽', category: '中性' },

  // D-L
  { idiom: '大同小异', pinyin: 'dà tóng xiǎo yì', meaning: '大体相同，略有差异', category: '中性' },
  { idiom: '独具匠心', pinyin: 'dú jù jiàng xīn', meaning: '具有独到的巧妙心思', category: '褒义' },
  { idiom: '废寝忘食', pinyin: 'fèi qǐn wàng shí', meaning: '顾不得睡觉，忘记了吃饭', category: '褒义' },
  { idiom: '坚持不懈', pinyin: 'jiān chí bù xiè', meaning: '坚持到底，一点不松懈', category: '褒义' },
  { idiom: '井底之蛙', pinyin: 'jǐng dǐ zhī wā', meaning: '井底的蛙只能看到井口那么大的一块天', category: '贬义' },
  { idiom: '举一反三', pinyin: 'jǔ yī fǎn sān', meaning: '学一件东西，可以灵活地思考，运用到其他相类似的东西上', category: '褒义' },

  // M-N
  { idiom: '名落孙山', pinyin: 'míng luò sūn shān', meaning: '指考试没有被录取', category: '中性' },
  { idiom: '莫名其妙', pinyin: 'mò míng qí miào', meaning: '说不出其中的奥妙', category: '中性' },

  // Q-R
  { idiom: '坚持不懈', pinyin: 'jiān chí bù xiè', meaning: '坚持到底，一点不松懈', category: '褒义' },
  { idiom: '勤学苦练', pinyin: 'qín xué kǔ liàn', meaning: '认真学习，刻苦训练', category: '褒义' },
  { idiom: '人山人海', pinyin: 'rén shān rén hǎi', meaning: '人群如山似海', category: '中性' },

  // S-T
  { idiom: '三心二意', pinyin: 'sān xīn èr yì', meaning: '又想这样又想那样，犹豫不定', category: '贬义' },
  { idiom: '实事求是', pinyin: 'shí shì qiú shì', meaning: '从实际情况出发，不夸大，不缩小，正确地认知和解决问题', category: '褒义' },
  { idiom: '水滴石穿', pinyin: 'shuǐ dī shí chuān', meaning: '水一直下滴，时间长了能把石头滴穿', category: '褒义' },

  // W-X
  { idiom: '完美无缺', pinyin: 'wán měi wú quē', meaning: '美好完善，没有缺点', category: '褒义' },
  { idiom: '循序渐进', pinyin: 'xún xù jiàn jìn', meaning: '按一定的顺序、步骤逐渐进步', category: '褒义' },

  // Y-Z
  { idiom: '一丝不苟', pinyin: 'yī sī bù gǒu', meaning: '形容办事认真，连最细微的地方也不马虎', category: '褒义' },
  { idiom: '精益求精', pinyin: 'jīng yì qiú jīng', meaning: '已经很好了，还要求更好', category: '褒义' },
  { idiom: '专心致志', pinyin: 'zhuān xīn zhì zhì', meaning: '一心一意，集中精神', category: '褒义' },
  { idiom: '孜孜不倦', pinyin: 'zī zī bù juàn', meaning: '指工作或学习勤奋不知疲倦', category: '褒义' },
]

// 按首字拼音分组
export function getIdiomsByLetter(letter: string): IdiomEntry[] {
  return IDIOM_DICTIONARY.filter(entry =>
    entry.pinyin.startsWith(letter.toLowerCase()) ||
    entry.idiom.includes(letter)
  )
}

// 按首字（汉字）分组
export function getIdiomsByChar(char: string): IdiomEntry[] {
  return IDIOM_DICTIONARY.filter(entry =>
    entry.idiom.startsWith(char)
  )
}

// 获取所有首字
export function getAllFirstChars(): string[] {
  const chars = new Set<string>()
  IDIOM_DICTIONARY.forEach(entry => {
    chars.add(entry.idiom[0])
  })
  return Array.from(chars).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

// 搜索成语
export function searchIdioms(query: string): IdiomEntry[] {
  const lowerQuery = query.toLowerCase()
  return IDIOM_DICTIONARY.filter(entry =>
    entry.idiom.includes(query) ||
    entry.pinyin.toLowerCase().includes(lowerQuery) ||
    entry.meaning.includes(query)
  )
}

// 按分类获取成语
export function getIdiomsByCategory(category: string): IdiomEntry[] {
  return IDIOM_DICTIONARY.filter(entry => entry.category === category)
}

// 获取所有分类
export function getAllCategories(): string[] {
  const categories = new Set<string>()
  IDIOM_DICTIONARY.forEach(entry => {
    categories.add(entry.category)
  })
  return Array.from(categories).sort()
}
