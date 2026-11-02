import React, { useState, useEffect, useRef } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PlayerBar from './components/PlayerBar';
import NowPlayingSidebar from './components/NowPlayingSidebar';
import FullscreenPlayer from './components/FullscreenPlayer';
import ContextMenu from './components/ContextMenu';
import SettingsModal from './components/SettingsModal';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import PlaylistView from './views/PlaylistView';
import LikedSongsView from './views/LikedSongsView';

function SpotifyApp() {
  const { currentView, rightSidebarTab } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const mainContentRef = useRef(null);

  // Fetch curated playlists & categories from backend
  useEffect(() => {
    fetch('/api/playlists')
      .then(res => res.json())
      .then(data => {
        if (data.playlists) setPlaylists(data.playlists);
        if (data.categories) setCategories(data.categories);
      })
      .catch(err => console.error("Error loading curated playlists:", err));
  }, []);

  // Reset scroll to top when changing views
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [currentView.type, currentView.data?.id]);

  const handleContextMenu = (e, track) => {
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 220),
      y: Math.min(e.clientY, window.innerHeight - 250),
      track
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden select-none">
      {/* Upper Main Section: Sidebar + Main Content + Right Sidebar */}
      <div className="flex-1 flex gap-2 p-2 min-h-0 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar playlists={playlists} />

        {/* Center Main View Area */}
        <main
          ref={mainContentRef}
          className="flex-1 bg-[#121212] rounded-lg overflow-y-auto flex flex-col relative transition-colors duration-500"
        >
          {/* Top Bar with History & Search */}
          <TopBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          {/* View Container */}
          <div className="flex-1 px-6 pt-2">
            {currentView.type === 'home' && (
              <HomeView playlists={playlists} onContextMenu={handleContextMenu} />
            )}

            {currentView.type === 'search' && (
              <SearchView
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={categories}
                onContextMenu={handleContextMenu}
              />
            )}

            {currentView.type === 'playlist' && (
              <PlaylistView
                playlist={currentView.data}
                onContextMenu={handleContextMenu}
              />
            )}

            {currentView.type === 'liked' && (
              <LikedSongsView onContextMenu={handleContextMenu} />
            )}
          </div>
        </main>

        {/* Right Sidebar: Now Playing / Lyrics / Queue */}
        {rightSidebarTab && <NowPlayingSidebar />}
      </div>

      {/* Bottom Audio Player Bar */}
      <PlayerBar />

      {/* Fullscreen Player Mode */}
      <FullscreenPlayer />

      {/* Right-click Context Menu */}
      {contextMenu && (
        <ContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <SpotifyApp />
    </PlayerProvider>
  );
}
