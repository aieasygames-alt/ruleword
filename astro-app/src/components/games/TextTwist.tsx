import React, { useState, useEffect, useCallback } from 'react';

interface Letter {
  char: string;
  selected: boolean;
  index: number;
}

interface Word {
  text: string;
  found: boolean;
}

const WORD_LIST = [
  'GAME', 'PLAY', 'WORD', 'PUZZLE', 'LOGIC', 'THINK', 'SMART', 'BRAIN',
  'FOCUS', 'SOLVE', 'LEARN', 'STUDY', 'WRITE', 'READ', 'SPEAK',
  'TEST', 'QUIZ', 'LEVEL', 'SCORE', 'TIMER', 'RESET', 'CLEAR',
  'GUESS', 'CHECK', 'HINT', 'HELP', 'SKIP', 'NEXT', 'EXIT'
];

const getRandomLetters = (): Letter[] => {
  const vowels = 'AEIOU';
  const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
  const letters: Letter[] = [];

  // Ensure at least 2 vowels
  letters.push({ char: vowels[Math.floor(Math.random() * vowels.length)], selected: false, index: 0 });
  letters.push({ char: vowels[Math.floor(Math.random() * vowels.length)], selected: false, index: 1 });

  // Add 4 more letters
  for (let i = 2; i < 6; i++) {
    const isVowel = Math.random() > 0.6;
    const char = isVowel
      ? vowels[Math.floor(Math.random() * vowels.length)]
      : consonants[Math.floor(Math.random() * consonants.length)];
    letters.push({ char, selected: false, index: i });
  }

  // Shuffle
  return letters.sort(() => Math.random() - 0.5).map((l, i) => ({ ...l, index: i }));
};

const findValidWords = (letters: Letter[]): string[] => {
  const chars = letters.map(l => l.char).join('');
  const valid: string[] = [];

  for (const word of WORD_LIST) {
    if (word.length >= 3 && word.length <= 6) {
      const tempChars = chars;
      let canForm = true;

      for (const char of word) {
        const idx = tempChars.indexOf(char);
        if (idx === -1) {
          canForm = false;
          break;
        }
      }

      if (canForm) {
        valid.push(word);
      }
    }
  }

  return valid.sort((a, b) => b.length - a.length);
};

export default function TextTwist() {
  const [letters, setLetters] = useState<Letter[]>(() => getRandomLetters());
  const [currentWord, setCurrentWord] = useState<string>('');
  const [foundWords, setFoundWords] = useState<Word[]>([]);
  const [validWords, setValidWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const found = findValidWords(letters);
    setValidWords(found);
  }, [letters]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleLetterClick = useCallback((letter: Letter) => {
    if (letter.selected || gameOver) return;

    const newLetters = letters.map(l =>
      l.index === letter.index ? { ...l, selected: true } : l
    );
    setLetters(newLetters);
    setCurrentWord(prev => prev + letter.char);
  }, [letters, gameOver]);

  const handleBackspace = useCallback(() => {
    const newLetters = [...letters];
    for (let i = newLetters.length - 1; i >= 0; i--) {
      if (newLetters[i].selected) {
        newLetters[i] = { ...newLetters[i], selected: false };
        break;
      }
    }
    setLetters(newLetters);
    setCurrentWord(prev => prev.slice(0, -1));
  }, [letters]);

  const handleClear = useCallback(() => {
    setLetters(letters.map(l => ({ ...l, selected: false })));
    setCurrentWord('');
  }, [letters]);

  const handleSubmit = useCallback(() => {
    if (!currentWord || currentWord.length < 3) return;

    if (validWords.includes(currentWord)) {
      if (!foundWords.find(w => w.text === currentWord)) {
        setFoundWords(prev => [...prev, { text: currentWord, found: true }]);
        setScore(prev => prev + currentWord.length * 10);
      }
      handleClear();
    }
  }, [currentWord, validWords, foundWords, handleClear]);

  const handleNewGame = useCallback(() => {
    setLetters(getRandomLetters());
    setCurrentWord('');
    setFoundWords([]);
    setScore(0);
    setTimeLeft(120);
    setGameOver(false);
  }, []);

  const handleSkip = useCallback(() => {
    if (score >= 50) {
      setScore(prev => prev - 50);
      setLetters(getRandomLetters());
      setCurrentWord('');
      handleClear();
    }
  }, [handleClear]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-2xl w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Text Twist</h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Rearrange letters to form words!</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</div>
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Score</div>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
            <div
              className={`h-full transition-all duration-1000 ${timeLeft < 30 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${(timeLeft / 120) * 100}%` }}
            />
          </div>
          <div className={`text-center mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Found Words */}
        <div className="mb-6">
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Found Words ({foundWords.length}/{validWords.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {foundWords.map((word, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                }`}
              >
                {word.text}
              </span>
            ))}
          </div>
        </div>

        {/* Current Word */}
        <div className={`mb-6 p-4 rounded-xl min-h-16 flex items-center justify-center text-3xl font-bold tracking-widest ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {currentWord || '_'.repeat(6)}
        </div>

        {/* Letters */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {letters.map((letter, i) => (
            <button
              key={i}
              onClick={() => handleLetterClick(letter)}
              disabled={letter.selected || gameOver}
              className={`aspect-square rounded-xl text-2xl font-bold transition-all ${
                letter.selected
                  ? 'bg-slate-600 text-slate-500 cursor-not-allowed'
                  : darkMode
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500 hover:scale-105 active:scale-95'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:from-blue-400 hover:to-indigo-500 hover:scale-105 active:scale-95'
              }`}
            >
              {letter.char}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={handleBackspace}
            disabled={gameOver}
            className={`py-3 rounded-xl font-semibold transition-all ${
              darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            ⌫
          </button>
          <button
            onClick={handleClear}
            disabled={gameOver}
            className={`py-3 rounded-xl font-semibold transition-all ${
              darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={gameOver}
            className={`py-3 rounded-xl font-semibold transition-all ${
              darkMode
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'
            }`}
          >
            Submit
          </button>
          <button
            onClick={handleSkip}
            disabled={gameOver || score < 50}
            className={`py-3 rounded-xl font-semibold transition-all ${
              score < 50
                ? 'bg-slate-600 text-slate-500 cursor-not-allowed'
                : darkMode
                  ? 'bg-orange-600 hover:bg-orange-500 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
            }`}
          >
            Skip (-50)
          </button>
        </div>

        {/* Game Over */}
        {gameOver && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Time's Up!</h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Final Score: <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{score}</span>
            </p>
            <button
              onClick={handleNewGame}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                darkMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
              }`}
            >
              New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
