import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, X, Bell, User, ExternalLink, Settings, LogOut, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function TopBar({ searchQuery, setSearchQuery, onOpenSettings }) {
  const {
    canGoBack,
    canGoForward,
    navigateBack,
    navigateForward,
    currentView,
    navigateTo
  } = usePlayer();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
      {/* Navigation History & Search */}
      <div className="flex items-center gap-3">
        {/* Back Button */}
        <button
          onClick={navigateBack}
          disabled={!canGoBack}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            canGoBack
              ? 'bg-black/60 hover:bg-black/80 text-white cursor-pointer'
              : 'bg-black/40 text-[#727272] cursor-not-allowed opacity-60'
          }`}
          title="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Forward Button */}
        <button
          onClick={navigateForward}
          disabled={!canGoForward}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            canGoForward
              ? 'bg-black/60 hover:bg-black/80 text-white cursor-pointer'
              : 'bg-black/40 text-[#727272] cursor-not-allowed opacity-60'
          }`}
          title="Go forward"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Search Bar (Visible in Search View or Always Accessible) */}
        {currentView.type === 'search' && (
          <div className="relative w-80 md:w-96">
            <Search className="w-5 h-5 text-[#b3b3b3] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to play?"
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-sm text-white pl-10 pr-9 py-3 rounded-full placeholder-[#757575] outline-none border border-transparent focus:border-white transition-all shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right User & Actions Pill */}
      <div className="flex items-center gap-3">
        {/* Upgrade / Premium Pill */}
        <button
          onClick={() => alert("You're already enjoying Spotify Clone Premium with Unlimited Free YouTube Streaming!")}
          className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-black bg-white hover:scale-105 active:scale-100 transition-transform shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>Explore Premium</span>
        </button>

        {/* What's New Bell */}
        <button
          onClick={() => alert("What's New: YouTube pure audio stream engine v2.0 connected with LRCLIB live karaoke lyrics!")}
          className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 hover:scale-105 active:scale-100 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-all"
          title="What's New"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-8 h-8 rounded-full bg-[#535353] hover:scale-105 active:scale-100 p-0.5 flex items-center justify-center transition-all overflow-hidden border border-transparent hover:border-white/20"
            title="User Profile"
          >
            <div className="w-full h-full rounded-full bg-[#282828] flex items-center justify-center text-white font-bold text-xs">
              U
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#282828] rounded-md shadow-2xl py-1 text-sm z-50 border border-white/5 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  alert("Account Profile: Spotify Clone VIP User");
                }}
                className="w-full px-3 py-2 text-left text-white hover:bg-[#3e3e3e] flex items-center justify-between"
              >
                <span>Account</span>
                <ExternalLink className="w-4 h-4 text-[#b3b3b3]" />
              </button>
              
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigateTo('liked');
                }}
                className="w-full px-3 py-2 text-left text-white hover:bg-[#3e3e3e]"
              >
                Profile
              </button>

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  if (onOpenSettings) onOpenSettings();
                }}
                className="w-full px-3 py-2 text-left text-white hover:bg-[#3e3e3e] flex items-center justify-between"
              >
                <span>Settings</span>
                <Settings className="w-4 h-4 text-[#b3b3b3]" />
              </button>

              <div className="h-[1px] bg-white/10 my-1" />

              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  alert("Spotify Clone is always signed in with your personal session.");
                }}
                className="w-full px-3 py-2 text-left text-[#f15e6c] hover:bg-[#3e3e3e] flex items-center justify-between"
              >
                <span>Log out</span>
                <LogOut className="w-4 h-4 text-[#f15e6c]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
