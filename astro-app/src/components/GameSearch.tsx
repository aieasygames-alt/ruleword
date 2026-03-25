import React, { useState, useMemo } from 'react';

interface Game {
  slug: string;
  id: string;
  name: string;
  nameZh: string;
  icon: string;
  desc: string;
  descZh: string;
  category: string;
  color: string;
}

interface GameSearchProps {
  games: Game[];
  onGameSelect: (slug: string) => void;
  language?: 'en' | 'zh';
}

export default function GameSearch({ games, onGameSelect, language = 'en' }: GameSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showResults, setShowResults] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(games.map(g => g.category));
    return ['all', ...Array.from(cats)];
  }, [games]);

  // Filter games based on search query and category
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        game.name.toLowerCase().includes(query) ||
        game.nameZh.toLowerCase().includes(query) ||
        game.desc.toLowerCase().includes(query) ||
        game.descZh.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    }).slice(0, 20); // Limit to 20 results
  }, [games, searchQuery, selectedCategory]);

  const handleGameClick = (slug: string) => {
    setShowResults(false);
    setSearchQuery('');
    onGameSelect(slug);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={language === 'zh' ? '搜索游戏...' : 'Search games...'}
          className="w-full px-5 py-3 pl-12 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setShowResults(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (searchQuery || selectedCategory !== 'all') && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Category Filter */}
          {searchQuery && (
            <div className="flex gap-2 p-3 border-b border-slate-700 overflow-x-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {cat === 'all'
                    ? language === 'zh'
                      ? '全部'
                      : 'All'
                    : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredGames.length > 0 ? (
              filteredGames.map(game => (
                <button
                  key={game.slug}
                  onClick={() => handleGameClick(game.slug)}
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {game.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white">
                      {language === 'zh' ? game.nameZh : game.name}
                    </div>
                    <div className="text-sm text-slate-400 line-clamp-1">
                      {language === 'zh' ? game.descZh : game.desc}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {game.category}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-400">
                {language === 'zh' ? '未找到匹配的游戏' : 'No games found'}
              </div>
            )}
          </div>

          {/* Results Count */}
          {filteredGames.length > 0 && (
            <div className="px-4 py-2 bg-slate-900/50 text-xs text-slate-500 text-center">
              {language === 'zh' ? '找到' : 'Found'} {filteredGames.length} {language === 'zh' ? '个游戏' : 'games'}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}
