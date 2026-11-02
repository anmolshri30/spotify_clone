import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  // Current track state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [isLoading, setIsLoading] = useState(false);

  // Playback queue & history
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  // Right sidebar view mode
  const [rightSidebarTab, setRightSidebarTab] = useState(null); // null | 'now-playing' | 'lyrics' | 'queue'
  const [isFullscreen, setIsFullscreen] = useState(false);

  // User Library stored in localStorage
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('spotify_liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [userPlaylists, setUserPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('spotify_user_playlists');
      return saved ? JSON.parse(saved) : [
        {
          id: 'user-favs',
          title: 'My Top Favorites',
          description: 'Personal playlist created by you',
          cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          color: '#503750',
          tracks: []
        }
      ];
    } catch {
      return [];
    }
  });

  // Current view navigation state
  const [currentView, setCurrentView] = useState({ type: 'home', data: null });
  const [viewHistory, setViewHistory] = useState([{ type: 'home', data: null }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // References
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const isUsingYtFallback = useRef(false);

  // Save liked songs & playlists to localStorage
  useEffect(() => {
    localStorage.setItem('spotify_liked_songs', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('spotify_user_playlists', JSON.stringify(userPlaylists));
  }, [userPlaylists]);

  // View navigation helpers
  const navigateTo = (type, data = null) => {
    const newView = { type, data };
    const newHistory = viewHistory.slice(0, historyIndex + 1);
    newHistory.push(newView);
    setViewHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentView(newView);
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentView(viewHistory[newIndex]);
    }
  };

  const navigateForward = () => {
    if (historyIndex < viewHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentView(viewHistory[newIndex]);
    }
  };

  // Play a specific track
  const playTrack = (track, trackList = null) => {
    if (!track) return;
    
    // Set playlist/queue if provided
    if (trackList && trackList.length > 0) {
      const trackIndex = trackList.findIndex(t => t.id === track.id);
      if (trackIndex !== -1) {
        setQueue(trackList.slice(trackIndex + 1));
      } else {
        setQueue(trackList);
      }
    }

    if (currentTrack) {
      setHistory(prev => [currentTrack, ...prev.slice(0, 30)]);
    }

    setCurrentTrack(track);
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(track.duration || 0);

    const audio = audioRef.current;
    if (audio) {
      // Direct stream endpoint from our backend
      audio.src = `/api/stream/${track.id}`;
      audio.load();
      audio.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(err => {
        console.warn("Direct stream autoplay blocked or error, trying fallback:", err);
        setIsLoading(false);
      });
    }

    // Media Session API integration for Windows media overlay
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Spotify Web Player',
        artwork: [
          { src: track.thumbnail || '', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) seek(details.seekTime);
      });
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const playNext = () => {
    if (repeatMode === 'one' && currentTrack) {
      seek(0);
      togglePlay();
      return;
    }

    if (queue.length > 0) {
      let nextIndex = 0;
      if (isShuffle) {
        nextIndex = Math.floor(Math.random() * queue.length);
      }
      const nextTrack = queue[nextIndex];
      const remainingQueue = queue.filter((_, idx) => idx !== nextIndex);
      setQueue(remainingQueue);
      playTrack(nextTrack);
    } else if (repeatMode === 'all' && history.length > 0) {
      // Loop back to beginning
      const firstTrack = history[history.length - 1];
      playTrack(firstTrack);
    } else {
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      seek(0);
      return;
    }

    if (history.length > 0) {
      const prevTrack = history[0];
      setHistory(prev => prev.slice(1));
      if (currentTrack) {
        setQueue(prev => [currentTrack, ...prev]);
      }
      playTrack(prevTrack);
    } else {
      seek(0);
    }
  };

  const seek = (time) => {
    const audio = audioRef.current;
    if (audio && duration > 0) {
      const clamped = Math.max(0, Math.min(time, duration));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
    }
  };

  const changeVolume = (val) => {
    const newVol = Math.max(0, Math.min(1, val));
    setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : newVol;
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const nextMuted = !prev;
      if (audioRef.current) {
        audioRef.current.volume = nextMuted ? 0 : volume;
      }
      return nextMuted;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const toggleLike = (track) => {
    if (!track) return;
    setLikedSongs(prev => {
      const exists = prev.some(t => t.id === track.id);
      if (exists) {
        return prev.filter(t => t.id !== track.id);
      } else {
        return [{ ...track, addedAt: new Date().toISOString() }, ...prev];
      }
    });
  };

  const isLiked = (trackId) => {
    return likedSongs.some(t => t.id === trackId);
  };

  const addToQueue = (track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index) => {
    setQueue(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const createPlaylist = (title, description = '') => {
    const newPlaylist = {
      id: `playlist-${Date.now()}`,
      title: title || 'New Playlist',
      description,
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      color: '#282828',
      tracks: []
    };
    setUserPlaylists(prev => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const addTrackToPlaylist = (playlistId, track) => {
    setUserPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        const exists = pl.tracks.some(t => t.id === track.id);
        if (!exists) {
          return { ...pl, tracks: [...pl.tracks, { ...track, addedAt: new Date().toISOString() }] };
        }
      }
      return pl;
    }));
  };

  const removeTrackFromPlaylist = (playlistId, trackId) => {
    setUserPlaylists(prev => prev.map(pl => {
      if (pl.id === playlistId) {
        return { ...pl, tracks: pl.tracks.filter(t => t.id !== trackId) };
      }
      return pl;
    }));
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(currentTime + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(currentTime - 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(volume - 0.05);
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyL':
          if (currentTrack) toggleLike(currentTrack);
          break;
        case 'KeyF':
          setIsFullscreen(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isPlaying, currentTime, duration, volume, isMuted]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        isLoading,
        queue,
        history,
        currentPlaylist,
        rightSidebarTab,
        isFullscreen,
        likedSongs,
        userPlaylists,
        currentView,
        canGoBack: historyIndex > 0,
        canGoForward: historyIndex < viewHistory.length - 1,
        setRightSidebarTab,
        setIsFullscreen,
        setCurrentPlaylist,
        navigateTo,
        navigateBack,
        navigateForward,
        playTrack,
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
        addToQueue,
        removeFromQueue,
        clearQueue,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist
      }}
    >
      {children}
      {/* Invisible HTML5 Audio Tag */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          if (e.target.duration && !isNaN(e.target.duration)) {
            setDuration(e.target.duration);
          }
          setIsLoading(false);
        }}
        onEnded={playNext}
        onError={(e) => {
          console.warn("Audio tag error:", e);
          setIsLoading(false);
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
