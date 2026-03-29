import React, { useState, useCallback, useEffect } from 'react';

interface Shape {
  id: string;
  color: string;
  points: [number, number][];
  x: number;
  y: number;
  rotation: number;
  placed: boolean;
}

const SHAPES: Omit<Shape, 'x' | 'y' | 'rotation' | 'placed'>[] = [
  {
    id: 'large-tri-1',
    color: '#EF4444',
    points: [[0, 0], [100, 0], [50, 50]]
  },
  {
    id: 'large-tri-2',
    color: '#3B82F6',
    points: [[0, 0], [100, 0], [50, 50]]
  },
  {
    id: 'med-tri',
    color: '#22C55E',
    points: [[0, 0], [70, 0], [35, 35]]
  },
  {
    id: 'small-tri-1',
    color: '#EAB308',
    points: [[0, 0], [50, 0], [25, 25]]
  },
  {
    id: 'small-tri-2',
    color: '#A855F7',
    points: [[0, 0], [50, 0], [25, 25]]
  },
  {
    id: 'square',
    color: '#F97316',
    points: [[0, 0], [35, 0], [35, 35], [0, 35]]
  },
  {
    id: 'parallelogram',
    color: '#EC4899',
    points: [[0, 0], [50, 0], [70, 35], [20, 35]]
  }
];

const TARGETS = [
  // Square target
  { id: 'square', points: [[0, 0], [100, 0], [100, 100], [0, 100]] },
  // Triangle target
  { id: 'triangle', points: [[0, 100], [50, 0], [100, 100]] },
  // Rectangle target
  { id: 'rectangle', points: [[0, 0], [150, 0], [150, 80], [0, 80]] },
  // House target
  { id: 'house', points: [[0, 80], [50, 0], [100, 80], [100, 100], [0, 100]] },
];

export default function Tangram() {
  const [shapes, setShapes] = useState<Shape[]>(() =>
    SHAPES.map((s, i) => ({ ...s, x: 50 + i * 80, y: 300, rotation: 0, placed: false }))
  );
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [darkMode] = useState(true);

  const handleShapeClick = useCallback((shapeId: string) => {
    setSelectedShape(shapeId);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedShape) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setShapes(prev => prev.map(shape =>
      shape.id === selectedShape
        ? { ...shape, x: x - 25, y: y - 25, placed: true }
        : shape
    ));

    setSelectedShape(null);
  }, [selectedShape]);

  const handleRotate = useCallback(() => {
    if (!selectedShape) return;

    setShapes(prev => prev.map(shape =>
      shape.id === selectedShape
        ? { ...shape, rotation: (shape.rotation + 45) % 360 }
        : shape
    ));
  }, [selectedShape]);

  const checkWin = useCallback(() => {
    // Simplified win check - all shapes placed
    const allPlaced = shapes.every(s => s.placed);
    if (allPlaced && shapes.length > 0) {
      setGameWon(true);
    }
  }, [shapes]);

  useEffect(() => {
    checkWin();
  }, [shapes, checkWin]);

  const resetGame = useCallback(() => {
    setShapes(() => SHAPES.map((s, i) => ({ ...s, x: 50 + i * 80, y: 300, rotation: 0, placed: false })));
    setSelectedShape(null);
    setGameWon(false);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-4xl w-full rounded-2xl shadow-2xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Tangram 七巧板
            </h1>
            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Arrange shapes to form the target!
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRotate}
              disabled={!selectedShape}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                !selectedShape
                  ? 'bg-slate-600 cursor-not-allowed'
                  : darkMode
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              🔄 Rotate
            </button>
            <button
              onClick={resetGame}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                darkMode
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Target Display */}
        <div className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${darkMode ? 'from-slate-700 to-slate-800 shadow-lg shadow-slate-900/50' : 'from-gray-100 to-gray-200 shadow-lg'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            Target Shape:
          </div>
          <div className="flex justify-center">
            <svg width="200" height="120" viewBox="0 0 200 120">
              <polygon
                points={TARGETS[currentTarget].points.map(p => p.join(',')).join(' ')}
                fill={darkMode ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)'}
                stroke={darkMode ? '#60A5FA' : '#3B82F6'}
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            {TARGETS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTarget(i)}
                className={`w-3 h-3 rounded-full transition-all transform ${
                  i === currentTarget
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600 scale-125 shadow-lg shadow-blue-500/50'
                    : darkMode ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-400 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Game Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl mb-6 cursor-crosshair ${darkMode ? 'border-slate-600 bg-slate-700/50' : 'border-gray-400 bg-gray-100'}`}
          style={{ height: '400px' }}
          onClick={handleCanvasClick}
        >
          {shapes.map(shape => (
            <svg
              key={shape.id}
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className="absolute cursor-pointer transition-all hover:scale-105"
              style={{
                left: shape.x,
                top: shape.y,
                transform: `rotate(${shape.rotation}deg)`,
                transformOrigin: 'center',
                opacity: selectedShape === shape.id ? 0.8 : 1,
                zIndex: selectedShape === shape.id ? 10 : 1
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleShapeClick(shape.id);
              }}
            >
              <polygon
                points={shape.points.map(p => p.join(',')).join(' ')}
                fill={shape.color}
                stroke={darkMode ? '#fff' : '#000'}
                strokeWidth="1"
              />
            </svg>
          ))}
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Click a shape to select it, then click the canvas to place it</li>
            <li>• Use the Rotate button to rotate the selected shape</li>
            <li>• Arrange all 7 shapes to form the target</li>
            <li>• Classic Chinese puzzle dating back to the Song Dynasty</li>
          </ul>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
              🎉 Complete!
            </h2>
            <p className={`text-lg mb-4 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
              You solved the Tangram puzzle!
            </p>
            <button
              onClick={resetGame}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                darkMode
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
              }`}
            >
              Next Puzzle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
