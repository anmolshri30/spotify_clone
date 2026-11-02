import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, Clock, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatters';

export default function SearchView({ searchQuery, setSearchQuery, categories = [], onContextMenu }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    isLiked
  } = usePlayer();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'songs' | 'artists' | 'playlists'
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search to backend YouTube endpoint
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=15`)
        .then(res => res.json())
        .then(data => {
          setResults(data.results || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Search error:", err);
          setIsLoading(false);
        });
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const topResult = results.length > 0 ? results[0] : null;
  const songResults = results.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 pb-12 select-none animate-in fade-in duration-300">
      {/* Category Pills */}
      {searchQuery && (
        <div className="flex items-center gap-2">
          {['All', 'Songs', 'Artists', 'Playlists'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab.toLowerCase())}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterType === tab.toLowerCase()
                  ? 'bg-white text-black'
                  : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Query Empty: Browse All Categories */}
      {!searchQuery.trim() ? (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Browse all
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {categories.map(cat => (
              <div
                key={cat.id}
                onClick={() => setSearchQuery(cat.name)}
                style={{ backgroundColor: cat.color }}
                className="group relative h-48 rounded-lg p-4 overflow-hidden cursor-pointer shadow-lg hover:scale-[1.02] transition-transform duration-200"
              >
                <h3 className="text-xl font-bold text-white tracking-tight break-words max-w-[70%]">
                  {cat.name}
                </h3>
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="absolute bottom-0 right-0 w-24 h-24 object-cover rounded shadow-xl transform rotate-[25deg] translate-x-[18%] translate-y-[5%] transition-transform duration-200 group-hover:rotate-[28deg] group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#b3b3b3]">
          <div className="w-8 h-8 border-3 border-[#1db954] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Searching YouTube for "{searchQuery}"...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">No results found for "{searchQuery}"</h3>
          <p className="text-sm text-[#b3b3b3]">
            Please make sure words are spelled correctly, or try different keywords.
          </p>
        </div>
      ) : (
        /* Search Results Section */
        <div className="flex flex-col gap-8">
          {/* Top Result + Songs 2-column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Top Result Card */}
            {topResult && (
              <div className="lg:col-span-5 flex flex-col gap-3">
                <h3 className="text-xl font-bold text-white">Top result</h3>
                <div
                  onClick={() => playTrack(topResult, results)}
                  className="group relative p-5 bg-[#181818] hover:bg-[#282828] rounded-xl cursor-pointer transition-all duration-200 flex flex-col justify-between h-56 shadow-md"
                >
                  <div className="flex flex-col gap-3">
                    <img
                      src={topResult.thumbnail}
                      alt={topResult.title}
                      className="w-24 h-24 rounded-lg object-cover shadow-lg"
                    />
                    <div className="min-w-0">
                      <h4 className="text-2xl font-black text-white truncate group-hover:text-white">
                        {topResult.title}
                      </h4>
                      <p className="text-sm text-[#b3b3b3] truncate mt-1">
                        <span className="text-white font-medium">{topResult.artist}</span> •{' '}
                        <span className="px-2 py-0.5 rounded-full bg-black/40 text-xs font-bold text-white uppercase tracking-wider">
                          Song
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Big Circular Green Play Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentTrack?.id === topResult.id) togglePlay();
                      else playTrack(topResult, results);
                    }}
                    className={`absolute bottom-5 right-5 w-12 h-12 rounded-full bg-[#1db954] hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-2xl transition-all ${
                      currentTrack?.id === topResult.id && isPlaying
                        ? 'opacity-100'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                  >
                    {currentTrack?.id === topResult.id && isPlaying ? (
                      <Pause className="w-6 h-6 fill-black" />
                    ) : (
                      <Play className="w-6 h-6 fill-black translate-x-0.5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Songs List */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <h3 className="text-xl font-bold text-white">Songs</h3>
              <div className="flex flex-col">
                {songResults.map((track) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isPlayingThis = isCurrent && isPlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, results)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (onContextMenu) onContextMenu(e, track);
                      }}
                      className="group flex items-center justify-between p-2 rounded-md hover:bg-[#282828] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Thumbnail with hover play icon */}
                        <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-[#282828]">
                          <img
                            src={track.thumbnail}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                          <div
                            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                              isPlayingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isPlayingThis ? (
                              <Pause className="w-4 h-4 fill-white text-white" />
                            ) : (
                              <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                            )}
                          </div>
                        </div>

                        {/* Title & Artist */}
                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isCurrent ? 'text-[#1db954]' : 'text-white'
                            }`}
                          >
                            {track.title}
                          </span>
                          <span className="text-xs text-[#b3b3b3] truncate hover:underline">
                            {track.artist}
                          </span>
                        </div>
                      </div>

                      {/* Right: Like & Duration */}
                      <div className="flex items-center gap-4 text-xs text-[#b3b3b3] ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track);
                          }}
                          className={`opacity-0 group-hover:opacity-100 hover:text-white transition-opacity ${
                            isLiked(track.id) ? '!opacity-100 text-[#1db954]' : ''
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isLiked(track.id) ? 'fill-[#1db954] text-[#1db954]' : ''
                            }`}
                          />
                        </button>
                        <span>{formatTime(track.duration)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* More Matching Tracks Grid */}
          {results.length > 5 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-white">More Results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.slice(5).map((track) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isPlayingThis = isCurrent && isPlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, results)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (onContextMenu) onContextMenu(e, track);
                      }}
                      className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-lg cursor-pointer transition-all duration-200 flex flex-col gap-3 relative shadow-md"
                    >
                      <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#242424]">
                        <img
                          src={track.thumbnail}
                          alt={track.title}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) togglePlay();
                            else playTrack(track, results);
                          }}
                          className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1db954] hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-2xl transition-all ${
                            isPlayingThis
                              ? 'opacity-100 translate-y-0'
                              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                          }`}
                        >
                          {isPlayingThis ? (
                            <Pause className="w-5 h-5 fill-black" />
                          ) : (
                            <Play className="w-5 h-5 fill-black translate-x-0.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className={`font-bold text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                          {track.title}
                        </span>
                        <span className="text-xs text-[#b3b3b3] truncate mt-1">
                          {track.artist}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
