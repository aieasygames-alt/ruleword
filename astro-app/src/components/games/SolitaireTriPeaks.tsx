import React, { useState, useCallback, useEffect } from 'react';

interface Card {
  suit: '♥' | '♦' | '♣' | '♠';
  rank: number;
  faceUp: boolean;
}

interface Pile {
  cards: Card[];
}

const SUITS: ('♥' | '♦' | '♣' | '♠')[] = ['♥', '♦', '♣', '♠'];
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const RANK_NAMES: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K'
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, faceUp: false });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const isRed = (suit: string): boolean => suit === '♥' || suit === '♦';

export default function SolitaireTriPeaks() {
  const [tableau, setTableau] = useState<Pile[]>([]);
  const [stock, setStock] = useState<Pile>({ cards: [] });
  const [waste, setWaste] = useState<Pile>({ cards: [] });
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [darkMode] = useState(true);

  const initGame = useCallback(() => {
    const deck = createDeck();
    const piles: Pile[] = [];
    let cardIndex = 0;

    // Create 3 peaks (triangular layout)
    // Peak 1: 1 card
    // Peak 2: 2 cards
    // Peak 3: 3 cards
    // Then rows of 4, 5, 6, 7, 6, 5, 4, 3, 2, 1, 2, 3...

    // Simplified: Create 3 peaks with overlapping
    const peakLayout = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 2, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 3, 3, 0, 0, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 0, 0, 0],
      [5, 5, 5, 5, 5, 5, 5, 5, 0, 0],
      [6, 6, 6, 6, 6, 6, 6, 6, 6, 0],
      [7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    ];

    // Fill peaks
    for (let row = 0; row < peakLayout.length; row++) {
      const pile: Pile = { cards: [] };
      for (let col = 0; col < peakLayout[row].length; col++) {
        if (peakLayout[row][col] > 0 && cardIndex < deck.length) {
          const card = deck[cardIndex++];
          card.faceUp = row === peakLayout.length - 1; // Only top row face up
          pile.cards.push(card);
        }
      }
      if (pile.cards.length > 0) {
        piles.push(pile);
      }
    }

    // Rest goes to stock
    const stockCards = deck.slice(cardIndex);
    stockCards.forEach(c => c.faceUp = true);

    setTableau(piles);
    setStock({ cards: stockCards });
    setWaste({ cards: [] });
    setScore(0);
    setGameWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const canPlayCard = useCallback((card: Card, targetCard: Card | null): boolean => {
    if (!targetCard) return true;
    // Can play if rank is one lower (any suit)
    return card.rank === targetCard.rank - 1;
  }, []);

  const playCard = useCallback((pileIndex: number, cardIndex: number) => {
    const pile = tableau[pileIndex];
    const card = pile.cards[cardIndex];

    if (!card.faceUp) return;

    // Can only play top card
    if (cardIndex !== pile.cards.length - 1) return;

    // Check if can play on waste
    const wasteTop = waste.cards[waste.cards.length - 1];

    if (canPlayCard(card, wasteTop)) {
      // Remove from pile
      const newTableau = tableau.map((p, i) => {
        if (i === pileIndex) {
          const newCards = p.cards.slice(0, -1);
          // Flip new top card
          if (newCards.length > 0) {
            newCards[newCards.length - 1].faceUp = true;
          }
          return { cards: newCards };
        }
        return p;
      });

      // Add to waste
      const newWaste = { cards: [...waste.cards, card] };
      setTableau(newTableau);
      setWaste(newWaste);
      setScore(s => s + 10);

      // Check win condition
      const hasCards = newTableau.some(p => p.cards.length > 0);
      if (!hasCards) {
        setGameWon(true);
      }
    }
  }, [tableau, waste, canPlayCard]);

  const drawCard = useCallback(() => {
    if (stock.cards.length === 0) {
      // Recycle waste to stock
      if (waste.cards.length > 0) {
        setStock({ cards: waste.cards.reverse() });
        setWaste({ cards: [] });
      }
    } else {
      const card = stock.cards[stock.cards.length - 1];
      setStock(s => ({ cards: s.cards.slice(0, -1) }));
      setWaste(w => ({ cards: [...w.cards, card] }));
    }
  }, [stock, waste]);

  const getCardColor = (suit: string): string => {
    return isRed(suit) ? 'text-red-600' : 'text-slate-900';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-4xl w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Solitaire TriPeaks
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Remove all cards from the peaks!
            </p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              {score}
            </div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex gap-6 mb-6">
          {/* Stock and Waste */}
          <div className="flex gap-2">
            <div
              onClick={drawCard}
              className={`w-16 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer ${
                darkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-400 bg-gray-200'
              }`}
            >
              {stock.cards.length > 0 && (
                <div className={`w-12 h-16 rounded bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md`} />
              )}
            </div>
            <div className={`w-16 h-24 rounded-lg flex items-center justify-center ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
              {waste.cards.length > 0 && (
                <div
                  className={`w-12 h-16 rounded shadow-md flex items-center justify-center font-bold ${
                    darkMode ? 'bg-white' : 'bg-white'
                  }`}
                >
                  <span className={getCardColor(waste.cards[waste.cards.length - 1].suit)}>
                    {RANK_NAMES[waste.cards[waste.cards.length - 1].rank]}{waste.cards[waste.cards.length - 1].suit}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Remaining stock count */}
          <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Stock: {stock.cards.length}
          </div>
        </div>

        {/* Tableau */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {tableau.map((pile, pileIndex) =>
            pile.cards.map((card, cardIndex) => (
              <div
                key={`${pileIndex}-${cardIndex}`}
                onClick={() => playCard(pileIndex, cardIndex)}
                className={`w-14 h-20 rounded-lg shadow-md flex items-center justify-center font-bold text-sm transition-all ${
                  card.faceUp
                    ? (cardIndex === pile.cards.length - 1
                        ? 'cursor-pointer hover:scale-105 hover:-translate-y-1'
                        : '')
                    : 'bg-gradient-to-br from-blue-600 to-indigo-700'
                } ${darkMode ? 'bg-white' : 'bg-white'} ${
                  card.faceUp && getCardColor(card.suit)
                }`}
                style={{
                  marginLeft: cardIndex > 0 ? '-20px' : '0',
                  marginTop: cardIndex > 0 ? '-60px' : '0',
                }}
              >
                {card.faceUp ? (
                  <span>
                    {RANK_NAMES[card.rank]}
                    {card.suit}
                  </span>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Click stock to draw cards</li>
            <li>• Play cards that are one rank higher than the waste pile top card</li>
            <li>• Any suit can be played on any other suit</li>
            <li>• Clear all cards from the peaks to win</li>
          </ul>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={initGame}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
            }`}
          >
            New Game
          </button>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              🎉 You Win!
            </h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              Score: {score}
            </p>
            <button
              onClick={initGame}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                darkMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
              }`}
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
