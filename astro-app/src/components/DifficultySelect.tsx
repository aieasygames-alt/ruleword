import React, { useState } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface DifficultySelectProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
  showLabels?: boolean;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { icon: string; color: string; label: string }> = {
  easy: { icon: '🟢', color: 'from-green-500 to-green-600', label: 'Easy' },
  medium: { icon: '🟡', color: 'from-yellow-500 to-yellow-600', label: 'Medium' },
  hard: { icon: '🟠', color: 'from-orange-500 to-orange-600', label: 'Hard' },
  expert: { icon: '🔴', color: 'from-red-500 to-red-600', label: 'Expert' },
};

export default function DifficultySelect({
  value,
  onChange,
  disabled = false,
  showLabels = true
}: DifficultySelectProps) {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-300">Difficulty</label>
      <div className="flex gap-2">
        {difficulties.map((diff) => {
          const config = DIFFICULTY_CONFIG[diff];
          const isSelected = value === diff;

          return (
            <button
              key={diff}
              onClick={() => onChange(diff)}
              disabled={disabled}
              className={`
                flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg
                transition-all duration-200 font-medium text-sm
                ${disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105 active:scale-95 cursor-pointer'
                }
                ${isSelected
                  ? `bg-gradient-to-br ${config.color} text-white shadow-lg`
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                }
              `}
              aria-label={config.label}
              aria-pressed={isSelected}
            >
              <span className="text-base">{config.icon}</span>
              {showLabels && <span>{config.label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get difficulty settings
export function getDifficultySettings(difficulty: Difficulty) {
  const settings = {
    easy: { multiplier: 1, label: 'Easy' },
    medium: { multiplier: 1.5, label: 'Medium' },
    hard: { multiplier: 2, label: 'Hard' },
    expert: { multiplier: 3, label: 'Expert' },
  };
  return settings[difficulty];
}
