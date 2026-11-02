import React from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getGreeting } from '../utils/formatters';

export default function HomeView({ playlists = [], onContextMenu }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    navigateTo
  } = usePlayer();

  const greeting = getGreeting();

  // Pick top 6 items for the quick picks grid
  const quickPicks = playlists.slice(0, 6);

  const handlePlayPlaylist = (e, playlist) => {
    e.stopPropagation();
    if (playlist.tracks && playlist.tracks.length > 0) {
      const isCurrentPlaylist = playlist.tracks.some(t => t.id === currentTrack?.id);
      if (isCurrentPlaylist) {
        togglePlay();
      } else {
        playTrack(playlist.tracks[0], playlist.tracks);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12 select-none animate-in fade-in duration-300">
      {/* Dynamic Ambient Gradient Header */}
      <div className="relative pt-4">
        <h1 className="text-3xl font-black text-white tracking-tight mb-5">
          {greeting}
        </h1>

        {/* 6-Grid Quick Picks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickPicks.map((pl) => {
            const isPlayingThis = isPlaying && pl.tracks?.some(t => t.id === currentTrack?.id);
            return (
              <div
                key={pl.id}
                onClick={() => navigateTo('playlist', pl)}
                className="group flex items-center bg-white/5 hover:bg-white/15 rounded-md overflow-hidden cursor-pointer transition-colors duration-200 shadow-md relative"
              >
                <img
                  src={pl.cover}
                  alt={pl.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover shrink-0 shadow-lg"
                />
                <div className="px-4 flex-1 min-w-0">
                  <span className="font-bold text-sm sm:text-base text-white truncate block">
                    {pl.title}
                  </span>
                </div>

                {/* Pop-in Spotify Green Play Button */}
                <button
                  onClick={(e) => handlePlayPlaylist(e, pl)}
                  className={`mr-4 w-11 h-11 rounded-full bg-[#1db954] hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-2xl transition-all duration-200 ${
                    isPlayingThis
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}
                  title="Play"
                >
                  {isPlayingThis ? (
                    <Pause className="w-5 h-5 fill-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black translate-x-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Today's Biggest Hits */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
            Today's Biggest Hits
          </h2>
          <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">
            Show all
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((pl) => {
            const isPlayingThis = isPlaying && pl.tracks?.some(t => t.id === currentTrack?.id);
            return (
              <div
                key={pl.id}
                onClick={() => navigateTo('playlist', pl)}
                className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 relative shadow-md hover:shadow-xl"
              >
                {/* Playlist Cover Container with Play Button */}
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#242424] shadow-md">
                  <img
                    src={pl.cover}
                    alt={pl.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => handlePlayPlaylist(e, pl)}
                    className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1db954] hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-2xl transition-all duration-300 ${
                      isPlayingThis
                        ? 'opacity-100 translate-y-0 shadow-xl'
                        : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                  >
                    {isPlayingThis ? (
                      <Pause className="w-6 h-6 fill-black" />
                    ) : (
                      <Play className="w-6 h-6 fill-black translate-x-0.5" />
                    )}
                  </button>
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm text-white truncate">
                    {pl.title}
                  </span>
                  <span className="text-xs text-[#b3b3b3] line-clamp-2 mt-1 leading-snug">
                    {pl.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section: Recommended Tracks */}
      {playlists.length > 0 && playlists[0].tracks && (
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                Recommended For You
              </h2>
              <p className="text-xs text-[#b3b3b3] mt-1">Based on recent YouTube listening habits</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {playlists[0].tracks.slice(0, 6).map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, playlists[0].tracks)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (onContextMenu) onContextMenu(e, track);
                  }}
                  className="group p-4 bg-[#181818] hover:bg-[#282828] rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 relative shadow-md"
                >
                  <div className="relative w-full aspect-square rounded-md overflow-hidden bg-[#242424] shadow-md">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) togglePlay();
                        else playTrack(track, playlists[0].tracks);
                      }}
                      className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1db954] hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-2xl transition-all duration-300 ${
                        isPlayingThis
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                      }`}
                    >
                      {isPlayingThis ? (
                        <Pause className="w-6 h-6 fill-black" />
                      ) : (
                        <Play className="w-6 h-6 fill-black translate-x-0.5" />
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
        </section>
      )}
    </div>
  );
}
