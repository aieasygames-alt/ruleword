import React, { useState, useEffect } from 'react';
import { isFavorite, toggleFavorite } from '../utils/favorites';

interface FavoriteButtonProps {
  gameSlug: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({
  gameSlug,
  size = 'md',
  showLabel = false,
  onToggle
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    setFavorited(isFavorite(gameSlug));

    const handleFavoritesChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ favorites: string[] }>;
      setFavorited(customEvent.detail.favorites.includes(gameSlug));
    };

    window.addEventListener('favoritesChanged', handleFavoritesChange);
    return () => window.removeEventListener('favoritesChanged', handleFavoritesChange);
  }, [gameSlug]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = toggleFavorite(gameSlug);
    setFavorited(newState);
    onToggle?.(newState);
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg'
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center gap-1.5
        rounded-lg transition-all duration-200
        ${favorited
          ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30'
          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
        }
        ${showLabel ? 'px-3' : ''}
      `}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorited ? (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {favorited ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </button>
  );
}
