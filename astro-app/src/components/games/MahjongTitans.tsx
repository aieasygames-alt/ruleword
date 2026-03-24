import React, { useState, useCallback, useEffect } from 'react';

interface Card {
  id: string;
  suit: string;
  value: number;
  faceUp: boolean;
}

const SUITS = ['🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋'];
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function MahjongTitans() {
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);
  const [darkMode] = useState(true);

  const initGame = useCallback(() => {
    const deck: Card[] = [];
    let id = 0;

    SUITS.forEach(suit => {
      for (let i = 0; i < 4; i++) {
        VALUES.forEach(value => {
          deck.push({ id: `card-${id++}`, suit, value, faceUp: false });
        });
      }
    });

    setCards(deck.sort(() => Math.random() - 0.5).slice(0, 60));
    setSelectedCards([]);
    setScore(0);
    setTimeLeft(120);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCardClick = useCallback((card: Card) => {
    if (gameOver || card.faceUp) return;

    if (selectedCards.length === 0) {
      setSelectedCards([card]);
      setCards(prev => prev.map(c => (c.id === card.id ? { ...c, faceUp: true } : c)));
    } else if (selectedCards.length === 1) {
      const first = selectedCards[0];

      if (first.suit === card.suit && first.value === card.value && first.id !== card.id) {
        // Match found
        setScore(s => s + 20);
        setCards(prev => prev.filter(c => c.id !== first.id && c.id !== card.id));
        setSelectedCards([]);
      } else {
        // No match, flip back
        setCards(prev => prev.map(c =>
          c.id === first.id ? { ...c, faceUp: false } : c
        ));
        setSelectedCards([card]);
        setCards(prev => prev.map(c => (c.id === card.id ? { ...c, faceUp: true } : c)));
      }
    }
  }, [selectedCards, gameOver]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-lg w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Mahjong Titans
          </h1>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
          </div>
        </div>

        <div className="mb-6">
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div className={`h-full transition-all ${timeLeft < 30 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${(timeLeft / 120) * 100}%` }} />
          </div>
          <div className={`text-center mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="grid grid-cols-6 gap-2 mb-6">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={gameOver}
              className={`aspect-[3/4] rounded-lg flex flex-col items-center justify-center text-2xl transition-all ${
                card.faceUp
                  ? 'bg-white shadow-md hover:scale-105'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500'
              }`}
            >
              {card.faceUp ? (
                <>
                  <span>{card.suit}</span>
                  <span className="text-xs">{card.value}</span>
                </>
              ) : (
                <span className="text-white text-3xl">🀫</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button onClick={initGame} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
            New Game
          </button>
        </div>

        {gameOver && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-red-900/50' : 'bg-red-100'}`}>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>Time's Up!</h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Final Score: {score}</p>
            <button onClick={initGame} className={`px-6 py-3 rounded-xl font-semibold transition-all ${darkMode ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-green-600 hover:bg-green-500 text-white'}`}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
