import { useState, useCallback, useEffect } from 'react'

type Card = {
  suit: string
  value: number
  faceUp: boolean
  id: string
}

type Settings = {
  darkMode: boolean
  soundEnabled: boolean
  language: 'en' | 'zh'
}

type Props = {
  settings: Settings
  onBack: () => void
  toggleLanguage: () => void
}

const SUITS = ['♠', '♥', '♦', '♣']
const SUIT_COLORS: Record<string, string> = { '♠': 'text-black', '♥': 'text-red-500', '♦': 'text-red-500', '♣': 'text-black' }
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const createDeck = (): Card[] => {
  const deck: Card[] = []
  SUITS.forEach(suit => {
    for (let value = 1; value <= 13; value++) {
      deck.push({ suit, value, faceUp: false, id: `${suit}-${value}-${Math.random()}` })
    }
  })
  return deck.sort(() => Math.random() - 0.5)
}

export default function Solitaire({ settings, onBack, toggleLanguage }: Props) {
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []])
  const [foundation, setFoundation] = useState<Card[][]>([[], [], [], []])
  const [stock, setStock] = useState<Card[]>([])
  const [waste, setWaste] = useState<Card[]>([])
  const [selected, setSelected] = useState<{ pile: string; index: number } | null>(null)
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)

  const t = (en: string, zh: string) => settings.language === 'zh' ? zh : en

  const initGame = useCallback(() => {
    const deck = createDeck()
    const newTableau: Card[][] = [[], [], [], [], [], [], []]
    let cardIndex = 0

    for (let i = 0; i < 7; i++) {
      for (let j = i; j < 7; j++) {
        const card = { ...deck[cardIndex], faceUp: j === i }
        newTableau[j].push(card)
        cardIndex++
      }
    }

    setTableau(newTableau)
    setFoundation([[], [], [], []])
    setStock(deck.slice(cardIndex).map(c => ({ ...c, faceUp: false })))
    setWaste([])
    setSelected(null)
    setMoves(0)
    setGameWon(false)
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  // Check win condition
  useEffect(() => {
    const totalFoundation = foundation.reduce((sum, f) => sum + f.length, 0)
    if (totalFoundation === 52) {
      setGameWon(true)
    }
  }, [foundation])

  const getValueDisplay = (value: number) => VALUES[value - 1]

  const canPlaceOnTableau = (card: Card, targetPile: Card[]): boolean => {
    if (targetPile.length === 0) return card.value === 13 // King on empty
    const topCard = targetPile[targetPile.length - 1]
    const isRed = (suit: string) => suit === '♥' || suit === '♦'
    return topCard.value === card.value + 1 && isRed(topCard.suit) !== isRed(card.suit)
  }

  const canPlaceOnFoundation = (card: Card, foundationIndex: number): boolean => {
    const pile = foundation[foundationIndex]
    if (pile.length === 0) return card.value === 1 // Ace
    const topCard = pile[pile.length - 1]
    return topCard.suit === card.suit && topCard.value === card.value - 1
  }

  const drawCard = () => {
    if (stock.length === 0) {
      setStock(waste.map(c => ({ ...c, faceUp: false })))
      setWaste([])
    } else {
      const card = { ...stock[stock.length - 1], faceUp: true }
      setStock(stock.slice(0, -1))
      setWaste([...waste, card])
    }
    setMoves(m => m + 1)
    setSelected(null)
  }

  const handleCardClick = (pile: string, pileIndex: number, cardIndex: number) => {
    if (pile === 'stock') {
      drawCard()
      return
    }

    if (selected) {
      // Try to move selected card(s)
      let cardsToMove: Card[] = []

      if (selected.pile === 'waste') {
        cardsToMove = [waste[waste.length - 1]]
      } else if (selected.pile.startsWith('tableau')) {
        const ti = parseInt(selected.pile.split('-')[1])
        cardsToMove = tableau[ti].slice(selected.index)
      } else if (selected.pile.startsWith('foundation')) {
        const fi = parseInt(selected.pile.split('-')[1])
        cardsToMove = [foundation[fi][foundation[fi].length - 1]]
      }

      if (cardsToMove.length === 0) {
        setSelected(null)
        return
      }

      if (pile === 'foundation') {
        if (cardsToMove.length === 1 && canPlaceOnFoundation(cardsToMove[0], pileIndex)) {
          moveCards(selected.pile, pile, pileIndex)
        }
      } else if (pile.startsWith('tableau')) {
        if (canPlaceOnTableau(cardsToMove[0], tableau[pileIndex])) {
          moveCards(selected.pile, pile, pileIndex)
        }
      }
      setSelected(null)
    } else {
      // Select card
      if (pile === 'waste' && waste.length > 0) {
        setSelected({ pile: 'waste', index: waste.length - 1 })
      } else if (pile.startsWith('tableau')) {
        const ti = parseInt(pile.split('-')[1])
        if (tableau[ti].length > 0 && tableau[ti][cardIndex].faceUp) {
          setSelected({ pile, index: cardIndex })
        }
      } else if (pile.startsWith('foundation')) {
        const fi = parseInt(pile.split('-')[1])
        if (foundation[fi].length > 0) {
          setSelected({ pile, index: foundation[fi].length - 1 })
        }
      }
    }
  }

  const moveCards = (from: string, to: string, toIndex: number) => {
    const newTableau = tableau.map(t => [...t])
    const newFoundation = foundation.map(f => [...f])
    const newWaste = [...waste]
    const newStock = [...stock]
    let cardsToMove: Card[] = []

    if (from === 'waste') {
      cardsToMove = [newWaste.pop()!]
      setWaste(newWaste)
    } else if (from.startsWith('tableau')) {
      const ti = parseInt(from.split('-')[1])
      const selectedIdx = selected!.index
      cardsToMove = newTableau[ti].splice(selectedIdx)
      // Flip top card
      if (newTableau[ti].length > 0) {
        newTableau[ti][newTableau[ti].length - 1].faceUp = true
      }
      setTableau(newTableau)
    } else if (from.startsWith('foundation')) {
      const fi = parseInt(from.split('-')[1])
      cardsToMove = [newFoundation[fi].pop()!]
      setFoundation(newFoundation)
    }

    if (to === 'foundation') {
      newFoundation[toIndex].push(...cardsToMove)
      setFoundation(newFoundation)
    } else if (to.startsWith('tableau')) {
      newTableau[toIndex].push(...cardsToMove)
      setTableau(newTableau)
    }

    setMoves(m => m + 1)
  }

  const renderCard = (card: Card | null, isSelected: boolean = false) => {
    if (!card) {
      return (
        <div className="w-14 h-20 bg-gradient-to-br from-slate-600 to-slate-800 border-2 border-dashed border-slate-500 rounded-lg shadow-inner" />
      )
    }
    if (!card.faceUp) {
      return (
        <div className="w-14 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 border-2 border-blue-400 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-2xl opacity-60">🂠</span>
        </div>
      )
    }
    return (
      <div className={`w-14 h-20 bg-gradient-to-br from-white to-gray-100 border-2 rounded-lg p-1 shadow-lg transition-all duration-200 ${isSelected ? 'border-yellow-400 ring-2 ring-yellow-400 scale-105 shadow-yellow-500/30' : 'border-gray-300 hover:shadow-xl'}`}>
        <div className={`text-xs font-bold ${SUIT_COLORS[card.suit]}`}>
          {getValueDisplay(card.value)}{card.suit}
        </div>
        <div className={`text-2xl text-center drop-shadow-sm ${SUIT_COLORS[card.suit]}`}>
          {card.suit}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-white">← {t('Back', '返回')}</button>
            <h1 className="text-xl font-bold">🃏 {t('Solitaire', '纸牌接龙')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">{t('Moves', '步数')}: {moves}</span>
            <button onClick={toggleLanguage} className="px-2 py-1 bg-slate-700 rounded text-sm">
              {settings.language === 'en' ? '中文' : 'EN'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4">
        {/* Top Row: Stock, Waste, Foundations */}
        <div className="flex justify-between mb-6">
          <div className="flex gap-4">
            {/* Stock */}
            <div onClick={() => handleCardClick('stock', 0, 0)} className="cursor-pointer">
              {stock.length > 0 ? renderCard(stock[stock.length - 1]) : renderCard(null)}
            </div>
            {/* Waste */}
            <div onClick={() => handleCardClick('waste', 0, waste.length - 1)} className="cursor-pointer">
              {waste.length > 0 ? renderCard(waste[waste.length - 1], selected?.pile === 'waste') : renderCard(null)}
            </div>
          </div>
          {/* Foundations */}
          <div className="flex gap-2">
            {foundation.map((pile, i) => (
              <div key={i} onClick={() => handleCardClick('foundation', i, pile.length - 1)} className="cursor-pointer">
                {pile.length > 0 ? renderCard(pile[pile.length - 1], selected?.pile === `foundation-${i}`) : renderCard(null)}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau */}
        <div className="flex gap-4 justify-center">
          {tableau.map((pile, i) => (
            <div key={i} className="relative" style={{ minHeight: 300 }}>
              {pile.length === 0 ? (
                <div onClick={() => handleCardClick(`tableau-${i}`, i, 0)} className="cursor-pointer">
                  {renderCard(null)}
                </div>
              ) : (
                pile.map((card, j) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(`tableau-${i}`, i, j)}
                    className="absolute cursor-pointer"
                    style={{ top: j * 25 }}
                  >
                    {renderCard(card, selected?.pile === `tableau-${i}` && selected?.index === j)}
                  </div>
                ))
              )}
            </div>
          ))}
        </div>

        {/* New Game Button */}
        <div className="mt-8 text-center">
          <button onClick={initGame} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
            {t('New Game', '新游戏')}
          </button>
        </div>
      </main>

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">{t('You Won!', '你赢了！')}</h2>
            <p className="text-slate-400 mb-4">{t('Moves', '步数')}: {moves}</p>
            <button onClick={initGame} className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl font-bold">
              {t('Play Again', '再玩一次')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
