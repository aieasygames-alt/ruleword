import React, { useState } from 'react';

export default function MemoryGrid() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [showSequence, setShowSequence] = useState(false);
  const [level, setLevel] = useState(3);
  const [darkMode] = useState(true);

  const generateSequence = (len: number) => {
    const seq: number[] = [];
    for (let i = 0; i < len; i++) {
      seq.push(Math.floor(Math.random() * 9));
    }
    return seq;
  };

  const startRound = () => {
    const seq = generateSequence(level);
    setSequence(seq);
    setUserInput([]);
    setShowSequence(true);

    setTimeout(() => {
      setShowSequence(false);
    }, (level + 1) * 1000);
  };

  const handleTileClick = (num: number) => {
    if (showSequence) return;

    const newInput = [...userInput, num];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      const correct = newInput.every((val, i) => val === sequence[i]);
      if (correct) {
        setTimeout(() => {
          setLevel(l => l + 1);
          startRound();
        }, 1000);
      } else {
        setTimeout(() => {
          setUserInput([]);
        }, 1000);
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-lg w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Memory Grid</h1>
        <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Level: {level}</p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <button
              key={num}
              onClick={() => handleTileClick(num)}
              disabled={showSequence}
              className={`aspect-square rounded-lg text-2xl font-bold transition-all ${
                showSequence
                  ? 'opacity-50 cursor-not-allowed'
                  : darkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {showSequence ? (sequence[userInput.length] || '') : (userInput[userInput.indexOf(num)] || '')}
            </button>
          ))}
        </div>

        <button
          onClick={startRound}
          disabled={showSequence}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            showSequence
              ? 'bg-slate-600 cursor-not-allowed'
              : darkMode
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
          }`}
        >
          {showSequence ? 'Watch...' : 'Start'}
        </button>
      </div>
    </div>
  );
}
