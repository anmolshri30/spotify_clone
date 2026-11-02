import React, { useEffect, useRef, useState } from 'react';
import { Plus, ListPlus, Heart, Share2, Copy, User, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function ContextMenu({ menu, onClose }) {
  const {
    addToQueue,
    toggleLike,
    isLiked,
    userPlaylists,
    addTrackToPlaylist,
    createPlaylist,
    navigateTo
  } = usePlayer();

  const [copied, setCopied] = useState(false);
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!menu || !menu.track) return null;
  const { x, y, track } = menu;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=track.id`);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1000);
  };

  return (
    <div
      ref={menuRef}
      style={{ top: `${y}px`, left: `${x}px` }}
      className="fixed z-50 min-w-52 bg-[#282828] rounded-md shadow-2xl p-1 text-sm text-white border border-white/5 animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Add to Queue */}
      <button
        onClick={() => {
          addToQueue(track);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] rounded flex items-center gap-3"
      >
        <ListPlus className="w-4 h-4 text-[#b3b3b3]" />
        <span>Add to queue</span>
      </button>

      {/* Save to Liked Songs */}
      <button
        onClick={() => {
          toggleLike(track);
          onClose();
        }}
        className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] rounded flex items-center gap-3"
      >
        <Heart className={`w-4 h-4 ${isLiked(track.id) ? 'text-[#1db954] fill-[#1db954]' : 'text-[#b3b3b3]'}`} />
        <span>{isLiked(track.id) ? 'Remove from Liked Songs' : 'Save to your Liked Songs'}</span>
      </button>

      {/* Add to Playlist Submenu */}
      <div
        className="relative"
        onMouseEnter={() => setShowPlaylistSubmenu(true)}
        onMouseLeave={() => setShowPlaylistSubmenu(false)}
      >
        <button
          className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] rounded flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-4 h-4 text-[#b3b3b3]" />
            <span>Add to playlist</span>
          </div>
          <span className="text-xs text-[#b3b3b3]">▶</span>
        </button>

        {showPlaylistSubmenu && (
          <div className="absolute left-full top-0 ml-1 min-w-48 bg-[#282828] rounded-md shadow-2xl p-1 border border-white/5">
            <button
              onClick={() => {
                const newPl = createPlaylist(`New Playlist`);
                addTrackToPlaylist(newPl.id, track);
                onClose();
              }}
              className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] rounded font-semibold text-xs text-[#1db954]"
            >
              + Create New Playlist
            </button>
            <div className="h-[1px] bg-white/10 my-1" />
            {userPlaylists.map(pl => (
              <button
                key={pl.id}
                onClick={() => {
                  addTrackToPlaylist(pl.id, track);
                  onClose();
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] rounded text-xs truncate"
              >
                {pl.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-[1px] bg-white/10 my-1" />

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="w-full px-3 py-2 text-left hover:bg-[#3e3e3e] rounded flex items-center gap-3"
      >
        {copied ? <Check className="w-4 h-4 text-[#1db954]" /> : <Copy className="w-4 h-4 text-[#b3b3b3]" />}
        <span>{copied ? 'Copied link!' : 'Copy song link'}</span>
      </button>
    </div>
  );
}
