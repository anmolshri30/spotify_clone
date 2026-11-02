import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Minimize2,
  Heart,
  Volume2,
  VolumeX,
  Volume1
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatters';

export default function FullscreenPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    changeVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    isLiked,
    isFullscreen,
    setIsFullscreen
  } = usePlayer();

  const progressRef = useRef(null);

  if (!isFullscreen || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  const handleSeek = (e) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    seek(pct * duration);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col justify-between p-8 sm:p-12 overflow-hidden select-none animate-in fade-in duration-300">
      {/* Blurred Ambient Background */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-30 scale-125 pointer-events-none"
        style={{ backgroundImage: `url(${currentTrack.thumbnail})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <span className="text-white font-bold tracking-tight">Spotify TV</span>
        </div>

        <button
          onClick={() => setIsFullscreen(false)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Exit Fullscreen (F / ESC)"
        >
          <Minimize2 className="w-6 h-6" />
        </button>
      </header>

      {/* Main Center Content */}
      <main className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 max-w-6xl mx-auto w-full my-auto">
        {/* Giant Album Artwork */}
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-2xl overflow-hidden shadow-2xl bg-[#282828] border border-white/10 shrink-0 transform transition-transform duration-500 hover:scale-105">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Track Info & Lyrics Snapshot */}
        <div className="flex flex-col text-left max-w-xl">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-xs font-bold tracking-widest text-[#1db954] uppercase">Playing from YouTube</span>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="text-[#b3b3b3] hover:text-white transition-colors"
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked(currentTrack.id) ? 'text-[#1db954] fill-[#1db954]' : ''
                }`}
              />
            </button>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-3 line-clamp-2">
            {currentTrack.title}
          </h1>
          <h2 className="text-xl sm:text-2xl text-[#b3b3b3] font-medium mb-6">
            {currentTrack.artist}
          </h2>
          <p className="text-sm text-white/50 leading-relaxed italic">
            Press Space to pause • Left/Right arrow keys to seek • F to exit
          </p>
        </div>
      </main>

      {/* Floating Bottom Controls */}
      <footer className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-4">
        {/* Scrubber */}
        <div className="flex items-center gap-3 text-sm text-[#b3b3b3] font-mono">
          <span>{formatTime(currentTime)}</span>
          <div
            ref={progressRef}
            onClick={handleSeek}
            className="flex-1 h-3 flex items-center cursor-pointer group"
          >
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative group-hover:h-2 transition-all">
              <div
                className="h-full bg-white group-hover:bg-[#1db954] transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-2 transition-colors ${
                isShuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-2 transition-colors ${
                repeatMode !== 'off' ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
              }`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={playPrevious} className="text-white hover:scale-110 active:scale-95 transition-transform p-2">
              <SkipBack className="w-7 h-7 fill-white" />
            </button>
            <button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-white hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-xl transition-transform"
            >
              {isPlaying ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black translate-x-0.5" />}
            </button>
            <button onClick={playNext} className="text-white hover:scale-110 active:scale-95 transition-transform p-2">
              <SkipForward className="w-7 h-7 fill-white" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-36">
            <button onClick={toggleMute} className="text-[#b3b3b3] hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumePercent / 100}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="spotify-slider h-1"
            />
          </div>
        </div>
      </footer>
    </div>
  );
}
