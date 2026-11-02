import React, { useState } from 'react';
import { Play, Pause, Heart, Clock, MoreHorizontal, ArrowDownCircle, Search, Trash2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime, formatDurationDetailed } from '../utils/formatters';

export default function PlaylistView({ playlist, onContextMenu }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    isLiked,
    removeTrackFromPlaylist,
    addTrackToPlaylist
  } = usePlayer();

  const [hoveredRow, setHoveredRow] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [isLikedPlaylist, setIsLikedPlaylist] = useState(false);
  const [ytSearchTerm, setYtSearchTerm] = useState('');
  const [ytSearchResults, setYtSearchResults] = useState([]);
  const [isSearchingYt, setIsSearchingYt] = useState(false);

  if (!playlist) return null;

  const tracks = playlist.tracks || [];
  const totalDurationSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const isCurrentlyPlayingPlaylist = isPlaying && tracks.some(t => t.id === currentTrack?.id);

  const filteredTracks = tracks.filter(t => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.artist && t.artist.toLowerCase().includes(q));
  });

  const handlePlayPlaylist = () => {
    if (tracks.length === 0) return;
    if (isCurrentlyPlayingPlaylist) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  // Search YouTube to add to user playlist
  const handleSearchYtToAdd = (e) => {
    e.preventDefault();
    if (!ytSearchTerm.trim()) return;
    setIsSearchingYt(true);
    fetch(`/api/search?q=${encodeURIComponent(ytSearchTerm)}&limit=5`)
      .then(res => res.json())
      .then(data => {
        setYtSearchResults(data.results || []);
        setIsSearchingYt(false);
      })
      .catch(() => setIsSearchingYt(false));
  };

  const bgGradient = playlist.color || '#1e3264';

  return (
    <div className="flex flex-col pb-16 select-none animate-in fade-in duration-300">
      {/* Hero Header with Dynamic Sampled Color Gradient */}
      <div
        className="p-6 md:p-8 flex flex-col md:flex-row items-end gap-6 transition-colors duration-500 rounded-t-lg -mx-6 -mt-6"
        style={{
          background: `linear-gradient(to bottom, ${bgGradient} 0%, rgba(18, 18, 18, 0.8) 100%)`
        }}
      >
        {/* Big Cover Art */}
        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-md overflow-hidden shadow-2xl bg-[#282828] shrink-0 border border-white/5">
          <img
            src={playlist.cover || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80"}
            alt={playlist.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Playlist Metadata Info */}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wider text-white mb-2">
            Public Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-4 break-words">
            {playlist.title}
          </h1>
          <p className="text-sm text-white/80 line-clamp-2 mb-3">
            {playlist.description || "Collection of top songs streamed pure audio directly from YouTube."}
          </p>

          <div className="flex items-center gap-2 text-xs text-white/90 font-medium flex-wrap">
            <span className="font-bold text-white hover:underline cursor-pointer">
              Spotify
            </span>
            <span>•</span>
            <span>{playlist.followers || '1,240,512'} likes</span>
            <span>•</span>
            <span className="font-semibold text-white">{tracks.length} songs,</span>
            <span className="text-white/70">{formatDurationDetailed(totalDurationSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar (Big Green Play Button, Like, Download, Search) */}
      <div className="py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Big Green Play Button */}
          <button
            onClick={handlePlayPlaylist}
            disabled={tracks.length === 0}
            className={`w-14 h-14 rounded-full bg-[#1db954] hover:scale-106 active:scale-95 flex items-center justify-center text-black shadow-2xl transition-all ${
              tracks.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Play Playlist"
          >
            {isCurrentlyPlayingPlaylist ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Heart / Like Playlist */}
          <button
            onClick={() => setIsLikedPlaylist(!isLikedPlaylist)}
            className="text-[#b3b3b3] hover:text-white transition-colors"
            title="Save to Your Library"
          >
            <Heart
              className={`w-8 h-8 transition-colors ${
                isLikedPlaylist ? 'text-[#1db954] fill-[#1db954]' : ''
              }`}
            />
          </button>

          {/* Download Icon */}
          <button
            onClick={() => alert("Playlist audio streams cached for high-speed offline playback.")}
            className="text-[#b3b3b3] hover:text-white transition-colors"
            title="Download"
          >
            <ArrowDownCircle className="w-7 h-7" />
          </button>

          {/* More Options */}
          <button
            className="text-[#b3b3b3] hover:text-white transition-colors"
            title="More options"
          >
            <MoreHorizontal className="w-7 h-7" />
          </button>
        </div>

        {/* Filter input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search in playlist"
            className="bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#333333] text-xs text-white pl-9 pr-3 py-1.5 rounded-full placeholder-[#727272] outline-none transition-colors w-44 focus:w-60"
          />
        </div>
      </div>

      {/* Tracks Table */}
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-2">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 md:col-span-4">Title</div>
          <div className="hidden md:block md:col-span-4">Album</div>
          <div className="hidden sm:block sm:col-span-2 text-right">Date added</div>
          <div className="col-span-6 sm:col-span-4 md:col-span-1 text-right flex justify-end">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Table Rows */}
        {filteredTracks.length === 0 ? (
          <div className="text-center py-12 text-[#b3b3b3]">
            <p className="text-base font-semibold">No songs in this playlist yet</p>
            <p className="text-xs mt-1">Search below to find any song on YouTube and add it!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isPlayingThis = isCurrent && isPlaying;
              const isHovered = hoveredRow === track.id;

              return (
                <div
                  key={`${track.id}-${idx}`}
                  onMouseEnter={() => setHoveredRow(track.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => playTrack(track, filteredTracks)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (onContextMenu) onContextMenu(e, track);
                  }}
                  className={`grid grid-cols-12 gap-4 px-4 py-2 rounded-md items-center text-sm cursor-pointer transition-colors group ${
                    isCurrent ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* # or Play button or Equalizer animation */}
                  <div className="col-span-1 flex items-center justify-center text-xs">
                    {isHovered ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCurrent) togglePlay();
                          else playTrack(track, filteredTracks);
                        }}
                        className="text-white hover:scale-110 active:scale-95 transition-transform"
                      >
                        {isPlayingThis ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white translate-x-0.5" />
                        )}
                      </button>
                    ) : isPlayingThis ? (
                      /* Animated Green Equalizer Bars */
                      <div className="flex items-end gap-0.5 h-4">
                        <span className="w-1 bg-[#1db954] rounded-full eq-bar-1" />
                        <span className="w-1 bg-[#1db954] rounded-full eq-bar-2" />
                        <span className="w-1 bg-[#1db954] rounded-full eq-bar-3" />
                        <span className="w-1 bg-[#1db954] rounded-full eq-bar-4" />
                      </div>
                    ) : (
                      <span className={`${isCurrent ? 'text-[#1db954] font-bold' : 'text-[#b3b3b3]'}`}>
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Title & Artist */}
                  <div className="col-span-5 md:col-span-4 flex items-center gap-3 min-w-0">
                    <img
                      src={track.thumbnail || "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg"}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover shrink-0 shadow"
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className={`font-semibold truncate ${
                          isCurrent ? 'text-[#1db954]' : 'text-white'
                        }`}
                      >
                        {track.title}
                      </span>
                      <span className="text-xs text-[#b3b3b3] truncate group-hover:text-white transition-colors">
                        {track.artist || 'Unknown Artist'}
                      </span>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="hidden md:block md:col-span-4 text-xs text-[#b3b3b3] truncate group-hover:text-white transition-colors">
                    {track.album || `${track.title} - Single`}
                  </div>

                  {/* Date Added */}
                  <div className="hidden sm:block sm:col-span-2 text-right text-xs text-[#b3b3b3]">
                    {track.addedAt ? new Date(track.addedAt).toLocaleDateString() : 'Just now'}
                  </div>

                  {/* Duration & Like Button */}
                  <div className="col-span-6 sm:col-span-4 md:col-span-1 flex items-center justify-end gap-3 text-xs text-[#b3b3b3]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track);
                      }}
                      className={`transition-opacity ${
                        isLiked(track.id) ? 'text-[#1db954] opacity-100' : 'opacity-0 group-hover:opacity-100 hover:text-white'
                      }`}
                      title={isLiked(track.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
                    >
                      <Heart
                        className={`w-4 h-4 ${isLiked(track.id) ? 'fill-[#1db954]' : ''}`}
                      />
                    </button>
                    <span className="font-mono">{formatTime(track.duration)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Songs to Playlist Section (User Playlists) */}
      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">Let's find something for your playlist</h3>
        <form onSubmit={handleSearchYtToAdd} className="relative max-w-md">
          <Search className="w-5 h-5 text-[#b3b3b3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ytSearchTerm}
            onChange={(e) => setYtSearchTerm(e.target.value)}
            placeholder="Search songs on YouTube to add"
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#333333] text-sm text-white pl-10 pr-24 py-2.5 rounded-full placeholder-[#727272] outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-white text-black font-bold text-xs hover:scale-105 active:scale-95 transition-transform"
          >
            Search
          </button>
        </form>

        {isSearchingYt && (
          <div className="py-4 text-xs text-[#b3b3b3]">Searching YouTube...</div>
        )}

        {ytSearchResults.length > 0 && (
          <div className="flex flex-col gap-1 max-w-2xl bg-[#181818] p-2 rounded-lg">
            {ytSearchResults.map(track => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2 rounded hover:bg-[#282828] text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={track.thumbnail} alt={track.title} className="w-10 h-10 rounded object-cover" />
                  <div className="min-w-0">
                    <p className="font-medium text-white truncate">{track.title}</p>
                    <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    addTrackToPlaylist(playlist.id, track);
                    setYtSearchResults(prev => prev.filter(t => t.id !== track.id));
                  }}
                  className="px-4 py-1.5 rounded-full border border-white/20 hover:border-white text-xs font-bold text-white hover:scale-105 transition-all"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
