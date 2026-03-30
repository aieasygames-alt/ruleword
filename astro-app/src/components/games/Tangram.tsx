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

type Props = {
  settings?: { darkMode: boolean; soundEnabled: boolean; language: 'en' | 'zh' }
}

export default function Tangram({ settings }: Props = { settings: undefined }) {
  const [shapes, setShapes] = useState<Shape[]>(() =>
    SHAPES.map((s, i) => ({ ...s, x: 50 + i * 80, y: 300, rotation: 0, placed: false }))
  );
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const isDark = settings?.darkMode ?? true;

  const handleShapeClick = useCallback((shapeId: string) => {
    setSelectedShape(shapeId);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedShape) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Snap to 10px grid for easier alignment
    x = Math.round((x - 25) / 10) * 10;
    y = Math.round((y - 25) / 10) * 10;

    setShapes(prev => prev.map(shape =>
      shape.id === selectedShape
        ? { ...shape, x, y, placed: true }
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
    // Check that all shapes are placed AND overlap with the target area
    const target = TARGETS[currentTarget];
    // Calculate target bounding box center
    const targetCenter = {
      x: target.points.reduce((sum, p) => sum + p[0], 0) / target.points.length,
      y: target.points.reduce((sum, p) => sum + p[1], 0) / target.points.length,
    };
    // Offset to canvas coordinate space (target is displayed in 200x120 SVG centered)
    const canvasCenterX = 100; // center of SVG display
    const canvasCenterY = 60;
    const offsetX = canvasCenterX - targetCenter.x;
    const offsetY = canvasCenterY - targetCenter.y;
    const targetInCanvas = target.points.map(p => [p[0] + offsetX, p[1] + offsetY + 50]);

    const allPlaced = shapes.every(s => s.placed);
    if (!allPlaced || shapes.length === 0) return;

    // Check each shape center is within the target polygon bounding box (with tolerance)
    const tolerance = 30;
    let allInTarget = true;
    for (const shape of shapes) {
      const cx = shape.x + 50;
      const cy = shape.y + 25;
      // Simple bounding box check with tolerance
      const minX = Math.min(...targetInCanvas.map(p => p[0])) - tolerance;
      const maxX = Math.max(...targetInCanvas.map(p => p[0])) + tolerance;
      const minY = Math.min(...targetInCanvas.map(p => p[1])) - tolerance;
      const maxY = Math.max(...targetInCanvas.map(p => p[1])) + tolerance;
      if (cx < minX || cx > maxX || cy < minY || cy > maxY) {
        allInTarget = false;
        break;
      }
    }

    if (allInTarget) {
      setGameWon(true);
    }
  }, [shapes, currentTarget]);

  useEffect(() => {
    checkWin();
  }, [shapes, checkWin]);

  const resetGame = useCallback(() => {
    setShapes(() => SHAPES.map((s, i) => ({ ...s, x: 50 + i * 80, y: 300, rotation: 0, placed: false })));
    setSelectedShape(null);
    setGameWon(false);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
      <div className={`max-w-4xl w-full rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Tangram 七巧板
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
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
                  : isDark
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              🔄 Rotate
            </button>
            <button
              onClick={resetGame}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                isDark
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Target Display */}
        <div className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${isDark ? 'from-slate-700 to-slate-800 shadow-lg shadow-slate-900/50' : 'from-gray-100 to-gray-200 shadow-lg'}`}>
          <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            Target Shape:
          </div>
          <div className="flex justify-center">
            <svg width="200" height="120" viewBox="0 0 200 120">
              <polygon
                points={TARGETS[currentTarget].points.map(p => p.join(',')).join(' ')}
                fill={isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.2)'}
                stroke={isDark ? '#60A5FA' : '#3B82F6'}
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
                    : isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-gray-400 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Game Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl mb-6 cursor-crosshair ${isDark ? 'border-slate-600 bg-slate-700/50' : 'border-gray-400 bg-gray-100'}`}
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
                stroke={isDark ? '#fff' : '#000'}
                strokeWidth="1"
              />
            </svg>
          ))}
        </div>

        {/* Instructions */}
        <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
          <div className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            How to Play:
          </div>
          <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            <li>• Click a shape to select it, then click the canvas to place it</li>
            <li>• Use the Rotate button to rotate the selected shape</li>
            <li>• Arrange all 7 shapes to form the target</li>
            <li>• Classic Chinese puzzle dating back to the Song Dynasty</li>
          </ul>
        </div>

        {/* Win Message */}
        {gameWon && (
          <div className={`mt-6 p-6 rounded-xl text-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              🎉 Complete!
            </h2>
            <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              You solved the Tangram puzzle!
            </p>
            <button
              onClick={resetGame}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                isDark
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
