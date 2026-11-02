import React, { useState } from 'react';
import { Home, Search, Library, Plus, ArrowRight, Heart, Music, ListMusic, MoreHorizontal, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function Sidebar({ playlists = [] }) {
  const {
    currentView,
    navigateTo,
    likedSongs,
    userPlaylists,
    createPlaylist,
    currentTrack,
    isPlaying
  } = usePlayer();

  const [filter, setFilter] = useState('all'); // 'all' | 'playlists' | 'artists'
  const [searchLibrary, setSearchLibrary] = useState('');
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);

  const handleCreatePlaylist = () => {
    const num = userPlaylists.length + 1;
    const newPl = createPlaylist(`My Playlist #${num}`);
    navigateTo('playlist', newPl);
  };

  // Filtered library items
  const allLibraryPlaylists = [
    ...userPlaylists,
    ...playlists
  ];

  const filteredPlaylists = allLibraryPlaylists.filter(pl => {
    if (searchLibrary && !pl.title.toLowerCase().includes(searchLibrary.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className={`flex flex-col gap-2 h-full select-none transition-all duration-300 ${isLibraryExpanded ? 'w-80' : 'w-72'}`}>
      {/* Top Navigation Pill Box */}
      <div className="bg-[#121212] rounded-lg p-3 flex flex-col gap-1">
        {/* Spotify Logo Header */}
        <div 
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 px-3 py-2 text-white font-bold cursor-pointer group mb-1"
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Spotify</span>
        </div>

        {/* Home Button */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-colors duration-200 ${
            currentView.type === 'home'
              ? 'text-white'
              : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Home className={`w-6 h-6 transition-transform ${currentView.type === 'home' ? 'text-white' : ''}`} />
          <span>Home</span>
        </button>

        {/* Search Button */}
        <button
          onClick={() => navigateTo('search')}
          className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-semibold text-sm transition-colors duration-200 ${
            currentView.type === 'search'
              ? 'text-white'
              : 'text-[#b3b3b3] hover:text-white'
          }`}
        >
          <Search className={`w-6 h-6 transition-transform ${currentView.type === 'search' ? 'text-white' : ''}`} />
          <span>Search</span>
        </button>
      </div>

      {/* Library Container */}
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Library Header */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between text-[#b3b3b3]">
          <button
            onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
            className="flex items-center gap-2 font-bold text-sm hover:text-white transition-colors duration-200"
            title="Collapse or expand Your Library"
          >
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </button>
          
          <div className="flex items-center gap-1">
            <button
              onClick={handleCreatePlaylist}
              className="p-1.5 hover:text-white hover:bg-[#282828] rounded-full transition-all duration-200"
              title="Create playlist or folder"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsLibraryExpanded(!isLibraryExpanded)}
              className="p-1.5 hover:text-white hover:bg-[#282828] rounded-full transition-all duration-200"
              title="Enlarge Your Library"
            >
              <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isLibraryExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['Playlists', 'Artists', 'Albums'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(filter === tab.toLowerCase() ? 'all' : tab.toLowerCase())}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                filter === tab.toLowerCase()
                  ? 'bg-white text-black'
                  : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Library Search Bar */}
        <div className="px-3 py-1 flex items-center justify-between">
          <div className="relative flex-1 mr-2">
            <Search className="w-4 h-4 text-[#b3b3b3] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchLibrary}
              onChange={(e) => setSearchLibrary(e.target.value)}
              placeholder="Search in Your Library"
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#333333] text-xs text-white pl-8 pr-3 py-1.5 rounded-full placeholder-[#727272] outline-none transition-colors"
            />
          </div>
          <span className="text-xs text-[#b3b3b3] font-medium cursor-pointer hover:text-white">Recents</span>
        </div>

        {/* Library Scrollable Item List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-1">
          {/* Liked Songs Pinned Item */}
          <div
            onClick={() => navigateTo('liked')}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors duration-200 group ${
              currentView.type === 'liked' ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="w-12 h-12 rounded bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shrink-0 shadow-md">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-sm font-semibold truncate ${currentView.type === 'liked' ? 'text-[#1db954]' : 'text-white'}`}>
                Liked Songs
              </span>
              <span className="text-xs text-[#b3b3b3] truncate flex items-center gap-1">
                <span className="text-[#1db954]">📌</span> Playlist • {likedSongs.length} songs
              </span>
            </div>
          </div>

          {/* User & Curated Playlists */}
          {filteredPlaylists.map(playlist => {
            const isCurrent = currentView.type === 'playlist' && currentView.data?.id === playlist.id;
            return (
              <div
                key={playlist.id}
                onClick={() => navigateTo('playlist', playlist)}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors duration-200 group ${
                  isCurrent ? 'bg-[#282828]' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="w-12 h-12 rounded bg-[#282828] overflow-hidden shrink-0 relative">
                  {playlist.cover ? (
                    <img src={playlist.cover} alt={playlist.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#282828] text-[#b3b3b3]">
                      <Music className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#1db954]' : 'text-white group-hover:text-white'}`}>
                    {playlist.title}
                  </span>
                  <span className="text-xs text-[#b3b3b3] truncate">
                    Playlist • {playlist.tracks ? `${playlist.tracks.length} songs` : 'Spotify'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
