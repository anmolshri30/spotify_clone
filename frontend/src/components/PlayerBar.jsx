import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Maximize2,
  Mic2,
  ListMusic,
  Tv,
  PictureInPicture2,
  MonitorSpeaker,
  Check
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/formatters';

export default function PlayerBar({ onOpenLyrics, onOpenQueue }) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isLoading,
    rightSidebarTab,
    setRightSidebarTab,
    isFullscreen,
    setIsFullscreen,
    togglePlay,
    playNext,
    playPrevious,
    seek,
    changeVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    isLiked
  } = usePlayer();

  const [isHoveringProgress, setIsHoveringProgress] = useState(false);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const progressContainerRef = useRef(null);

  // Volume icon logic
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5 text-[#b3b3b3]" />;
    if (volume < 0.5) return <Volume1 className="w-5 h-5 text-[#b3b3b3]" />;
    return <Volume2 className="w-5 h-5 text-[#b3b3b3]" />;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  // Handle clicking or scrubbing on the progress bar
  const handleSeekClick = (e) => {
    if (!progressContainerRef.current || duration <= 0) return;
    const rect = progressContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    seek(percentage * duration);
  };

  const handleLyricsToggle = () => {
    setRightSidebarTab(prev => prev === 'lyrics' ? null : 'lyrics');
  };

  const handleQueueToggle = () => {
    setRightSidebarTab(prev => prev === 'queue' ? null : 'queue');
  };

  const handleNowPlayingToggle = () => {
    setRightSidebarTab(prev => prev === 'now-playing' ? null : 'now-playing');
  };

  return (
    <footer className="h-20 bg-black border-t border-[#282828] px-4 flex items-center justify-between select-none relative z-40">
      {/* Left: Track Details */}
      <div className="flex items-center gap-3 w-[30%] min-w-[180px]">
        {currentTrack ? (
          <>
            <div className="relative group/cover w-14 h-14 rounded overflow-hidden shrink-0 shadow-lg bg-[#282828]">
              <img
                src={currentTrack.thumbnail || "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg"}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform group-hover/cover:scale-105"
              />
              <button 
                onClick={handleNowPlayingToggle}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center transition-opacity"
                title="Expand album cover"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex flex-col min-w-0 mr-2">
              <span className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </span>
              <span className="text-xs text-[#b3b3b3] truncate hover:underline cursor-pointer hover:text-white">
                {currentTrack.artist || 'Unknown Artist'}
              </span>
            </div>

            {/* Like / Heart Button */}
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-1 text-[#b3b3b3] hover:text-white transition-all transform hover:scale-110 active:scale-90"
              title={isLiked(currentTrack.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked(currentTrack.id)
                    ? 'text-[#1db954] fill-[#1db954]'
                    : 'hover:text-white'
                }`}
              />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded bg-[#181818]" />
            <div className="flex flex-col gap-1">
              <div className="w-24 h-3 bg-[#282828] rounded" />
              <div className="w-16 h-2 bg-[#181818] rounded" />
            </div>
          </div>
        )}
      </div>

      {/* Center: Playback Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 w-[40%] max-w-[722px]">
        {/* Buttons Row */}
        <div className="flex items-center gap-5">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            className={`relative p-1 transition-colors ${
              isShuffle ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={isShuffle ? "Disable shuffle" : "Enable shuffle"}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1db954] rounded-full" />
            )}
          </button>

          {/* Previous Track Button */}
          <button
            onClick={playPrevious}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Big Green Play / Pause Button */}
          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className={`w-8 h-8 rounded-full bg-white hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-md transition-all ${
              !currentTrack ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Next Track Button */}
          <button
            onClick={playNext}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={toggleRepeat}
            className={`relative p-1 transition-colors ${
              repeatMode !== 'off' ? 'text-[#1db954]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1db954] rounded-full" />
            )}
          </button>
        </div>

        {/* Scrubber Progress Bar */}
        <div className="w-full flex items-center gap-2 text-xs text-[#b3b3b3] font-mono">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <div
            ref={progressContainerRef}
            onClick={handleSeekClick}
            onMouseEnter={() => setIsHoveringProgress(true)}
            onMouseLeave={() => setIsHoveringProgress(false)}
            className="flex-1 h-3 flex items-center cursor-pointer group"
          >
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative group-hover:h-1.5 transition-all">
              <div
                className={`h-full rounded-full transition-colors ${
                  isHoveringProgress ? 'bg-[#1db954]' : 'bg-white'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Scrubber thumb circle */}
            <div
              className={`w-3 h-3 bg-white rounded-full shadow-md -ml-1.5 pointer-events-none transition-opacity ${
                isHoveringProgress ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
            />
          </div>
          <span className="w-10 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Auxiliary Controls & Volume */}
      <div className="flex items-center justify-end gap-2.5 w-[30%] min-w-[180px]">
        {/* Now Playing View */}
        <button
          onClick={handleNowPlayingToggle}
          className={`p-1.5 hover:text-white transition-colors ${
            rightSidebarTab === 'now-playing' ? 'text-[#1db954]' : 'text-[#b3b3b3]'
          }`}
          title="Now playing view"
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* Lyrics Button */}
        <button
          onClick={handleLyricsToggle}
          className={`p-1.5 hover:text-white transition-colors ${
            rightSidebarTab === 'lyrics' ? 'text-[#1db954]' : 'text-[#b3b3b3]'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Queue Button */}
        <button
          onClick={handleQueueToggle}
          className={`p-1.5 hover:text-white transition-colors ${
            rightSidebarTab === 'queue' ? 'text-[#1db954]' : 'text-[#b3b3b3]'
          }`}
          title="Queue"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Connect to a Device */}
        <div className="relative">
          <button
            onClick={() => setShowDeviceModal(!showDeviceModal)}
            className={`p-1.5 hover:text-white transition-colors ${
              showDeviceModal ? 'text-[#1db954]' : 'text-[#b3b3b3]'
            }`}
            title="Connect to a device"
          >
            <MonitorSpeaker className="w-4 h-4" />
          </button>

          {/* Device Modal */}
          {showDeviceModal && (
            <div className="absolute right-0 bottom-10 w-72 bg-[#282828] rounded-lg shadow-2xl p-4 text-white z-50 border border-white/10 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#1db954]/20 flex items-center justify-center text-[#1db954]">
                  <MonitorSpeaker className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Current Device</h4>
                  <p className="text-xs text-[#1db954] flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" /> Web Player (This Computer)
                  </p>
                </div>
              </div>
              <div className="text-xs text-[#b3b3b3] border-t border-white/10 pt-2">
                Listening to YouTube audio streams at High Quality (256kbps).
              </div>
            </div>
          )}
        </div>

        {/* Volume Controls */}
        <div
          className="flex items-center gap-2 w-28 group"
          onMouseEnter={() => setIsHoveringVolume(true)}
          onMouseLeave={() => setIsHoveringVolume(false)}
        >
          <button
            onClick={toggleMute}
            className="hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {getVolumeIcon()}
          </button>

          <div className="relative flex-1 h-3 flex items-center cursor-pointer">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumePercent / 100}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              className="spotify-slider absolute w-full h-1"
            />
            <div
              className={`h-1 rounded-full pointer-events-none transition-colors ${
                isHoveringVolume ? 'bg-[#1db954]' : 'bg-white'
              }`}
              style={{ width: `${volumePercent}%` }}
            />
          </div>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(prev => !prev)}
          className={`p-1.5 hover:text-white transition-colors ${
            isFullscreen ? 'text-[#1db954]' : 'text-[#b3b3b3]'
          }`}
          title="Full screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}
