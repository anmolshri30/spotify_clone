import React, { useState } from 'react';
import { Play, Pause, Heart, Clock, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime, formatDurationDetailed } from '../utils/formatters';

export default function LikedSongsView({ onContextMenu }) {
  const {
    likedSongs,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    navigateTo
  } = usePlayer();

  const [hoveredRow, setHoveredRow] = useState(null);

  const totalDurationSeconds = likedSongs.reduce((acc, t) => acc + (t.duration || 0), 0);
  const isCurrentlyPlayingLiked = isPlaying && likedSongs.some(t => t.id === currentTrack?.id);

  const handlePlayLiked = () => {
    if (likedSongs.length === 0) return;
    if (isCurrentlyPlayingLiked) {
      togglePlay();
    } else {
      playTrack(likedSongs[0], likedSongs);
    }
  };

  return (
    <div className="flex flex-col pb-16 select-none animate-in fade-in duration-300">
      {/* Hero Header */}
      <div
        className="p-6 md:p-8 flex flex-col md:flex-row items-end gap-6 transition-colors duration-500 rounded-t-lg -mx-6 -mt-6"
        style={{
          background: 'linear-gradient(to bottom, #4f38a6 0%, rgba(18, 18, 18, 0.8) 100%)'
        }}
      >
        {/* Liked Songs Cover Box */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-md overflow-hidden shadow-2xl bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shrink-0">
          <Heart className="w-24 h-24 text-white fill-white" />
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-white mb-2">
            Playlist
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none mb-4">
            Liked Songs
          </h1>
          <div className="flex items-center gap-2 text-xs text-white/90 font-medium">
            <span className="font-bold text-white">Your Account</span>
            <span>•</span>
            <span className="font-semibold text-white">{likedSongs.length} songs,</span>
            <span className="text-white/70">{formatDurationDetailed(totalDurationSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="py-6 flex items-center gap-6">
        <button
          onClick={handlePlayLiked}
          disabled={likedSongs.length === 0}
          className={`w-14 h-14 rounded-full bg-[#1db954] hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-2xl transition-all ${
            likedSongs.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          title="Play Liked Songs"
        >
          {isCurrentlyPlayingLiked ? (
            <Pause className="w-7 h-7 fill-black" />
          ) : (
            <Play className="w-7 h-7 fill-black translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Songs Table */}
      {likedSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-[#b3b3b3] gap-3">
          <Heart className="w-12 h-12 opacity-30 text-white" />
          <h3 className="text-xl font-bold text-white">Songs you like will appear here</h3>
          <p className="text-sm max-w-sm">
            Save songs by tapping the heart icon anywhere while listening.
          </p>
          <button
            onClick={() => navigateTo('search')}
            className="mt-2 px-6 py-2 bg-white text-black font-bold text-sm rounded-full hover:scale-105 active:scale-95 transition-transform"
          >
            Find songs to like
          </button>
        </div>
      ) : (
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5 md:col-span-5">Title</div>
            <div className="hidden md:block md:col-span-4">Album</div>
            <div className="hidden sm:block sm:col-span-2 text-right">Date added</div>
            <div className="col-span-6 sm:col-span-4 md:col-span-1 text-right flex justify-end">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* List */}
          <div className="flex flex-col gap-0.5">
            {likedSongs.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && isPlaying;
              const isHovered = hoveredRow === track.id;

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onMouseEnter={() => setHoveredRow(track.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => playTrack(track, likedSongs)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (onContextMenu) onContextMenu(e, track);
                  }}
                  className={`grid grid-cols-12 gap-4 px-4 py-2 rounded-md items-center text-sm cursor-pointer transition-colors group ${
                    isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="col-span-1 flex items-center justify-center text-xs">
                    {isHovered ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrent) togglePlay();
                          else playTrack(track, likedSongs);
                        }}
                      >
                        {isPlayingThis ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                      </button>
                    ) : isPlayingThis ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-[#1db954] rounded-full eq-bar-1" />
                        <span className="w-1 bg-[#1db954] rounded-full eq-bar-2" />
                        <span className="w-1 bg-[#1db954] rounded-full eq-bar-3" />
                        <span className="w-1 bg-[#1db954] rounded-full eq-bar-4" />
                      </div>
                    ) : (
                      <span className={isCurrent ? 'text-[#1db954] font-bold' : 'text-[#b3b3b3]'}>
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  <div className="col-span-5 md:col-span-5 flex items-center gap-3 min-w-0">
                    <img
                      src={track.thumbnail || "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg"}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className={`font-semibold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                        {track.title}
                      </span>
                      <span className="text-xs text-[#b3b3b3] truncate group-hover:text-white">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-4 text-xs text-[#b3b3b3] truncate group-hover:text-white">
                    {track.album || `${track.title} - Single`}
                  </div>

                  <div className="hidden sm:block sm:col-span-2 text-right text-xs text-[#b3b3b3]">
                    {track.addedAt ? new Date(track.addedAt).toLocaleDateString() : 'Recently'}
                  </div>

                  <div className="col-span-6 sm:col-span-4 md:col-span-1 flex items-center justify-end gap-3 text-xs text-[#b3b3b3]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className="text-[#1db954] hover:scale-110 active:scale-95 transition-transform"
                      title="Remove from Liked Songs"
                    >
                      <Heart className="w-4 h-4 fill-[#1db954]" />
                    </button>
                    <span className="font-mono">{formatTime(track.duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
