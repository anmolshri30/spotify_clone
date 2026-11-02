import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Plus, Trash2, Mic2, ListMusic, UserCheck, Play, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function NowPlayingSidebar() {
  const {
    rightSidebarTab,
    setRightSidebarTab,
    currentTrack,
    currentTime,
    queue,
    removeFromQueue,
    clearQueue,
    playTrack,
    toggleLike,
    isLiked,
    seek
  } = usePlayer();

  const [lyricsData, setLyricsData] = useState({ synced: null, plain: null, loading: false });
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const lyricsContainerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Fetch lyrics whenever current track changes
  useEffect(() => {
    if (!currentTrack || rightSidebarTab !== 'lyrics') return;

    let isCancelled = false;
    setLyricsData({ synced: null, plain: null, loading: true });

    fetch(`/api/lyrics?track=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist || '')}&id=${currentTrack.id}`)
      .then(res => res.json())
      .then(data => {
        if (isCancelled) return;
        setLyricsData({
          synced: data.synced,
          plain: data.plain,
          loading: false
        });

        // Parse LRC format: [mm:ss.xx] line
        if (data.synced) {
          const lines = data.synced.split('\n');
          const parsed = [];
          const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/;

          for (const line of lines) {
            const match = timeRegex.exec(line);
            if (match) {
              const mins = parseInt(match[1], 10);
              const secs = parseInt(match[2], 10);
              const ms = match[3] ? parseInt(match[3], 10) / (match[3].length === 3 ? 1000 : 100) : 0;
              const timestamp = mins * 60 + secs + ms;
              const text = line.replace(timeRegex, '').trim();
              if (text) {
                parsed.push({ time: timestamp, text });
              }
            }
          }
          setParsedLyrics(parsed);
        } else {
          setParsedLyrics([]);
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setLyricsData({ synced: null, plain: 'Could not load lyrics for this track.', loading: false });
          setParsedLyrics([]);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.id, rightSidebarTab]);

  // Find active line index
  let activeLyricIndex = -1;
  if (parsedLyrics.length > 0) {
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        activeLyricIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth scroll active lyric into view
  useEffect(() => {
    if (activeLineRef.current && lyricsContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLyricIndex]);

  if (!rightSidebarTab || !currentTrack) return null;

  return (
    <aside className="w-80 bg-[#121212] rounded-lg p-4 flex flex-col h-full overflow-hidden select-none transition-all duration-300">
      {/* Header with Title & Close button */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
        <h3 className="font-bold text-base text-white capitalize">
          {rightSidebarTab === 'now-playing' && (currentTrack.original_title || currentTrack.title)}
          {rightSidebarTab === 'lyrics' && 'Lyrics'}
          {rightSidebarTab === 'queue' && 'Queue'}
        </h3>
        <button
          onClick={() => setRightSidebarTab(null)}
          className="p-1 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#282828] transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab 1: Now Playing */}
      {rightSidebarTab === 'now-playing' && (
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
          {/* Big Artwork */}
          <div className="w-full aspect-square rounded-lg overflow-hidden shadow-2xl bg-[#282828] relative group">
            <img
              src={currentTrack.thumbnail || "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg"}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title & Artist & Like */}
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <h2 className="text-xl font-bold text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-[#b3b3b3] truncate hover:underline cursor-pointer hover:text-white">
                {currentTrack.artist}
              </p>
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="p-2 text-[#b3b3b3] hover:text-white"
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked(currentTrack.id) ? 'text-[#1db954] fill-[#1db954]' : ''
                }`}
              />
            </button>
          </div>

          {/* About the Artist Card */}
          <div className="bg-[#242424] rounded-xl overflow-hidden p-4 relative group">
            <h4 className="text-sm font-bold text-white mb-3">About the artist</h4>
            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-black/40">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.artist}
                className="w-full h-full object-cover"
              />
            </div>
            <h5 className="font-bold text-base text-white truncate">{currentTrack.artist}</h5>
            <p className="text-xs text-[#b3b3b3] mt-1 mb-3">
              Over {currentTrack.views ? Number(currentTrack.views).toLocaleString() : '10,000,000+'} YouTube streams
            </p>
            <p className="text-xs text-[#b3b3b3] line-clamp-3 leading-relaxed mb-4">
              {currentTrack.artist} continues to dominate global charts and streaming platforms with unforgettable hooks and groundbreaking production.
            </p>
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                isFollowing
                  ? 'border border-[#727272] text-white hover:border-white'
                  : 'bg-white text-black hover:scale-105'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Next in Queue Preview */}
          {queue.length > 0 && (
            <div className="bg-[#242424] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white">Next in queue</h4>
                <button
                  onClick={() => setRightSidebarTab('queue')}
                  className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline"
                >
                  Open queue
                </button>
              </div>
              <div 
                onClick={() => playTrack(queue[0])}
                className="flex items-center gap-3 p-2 rounded-lg bg-[#181818] hover:bg-[#282828] cursor-pointer transition-colors"
              >
                <img
                  src={queue[0].thumbnail}
                  alt={queue[0].title}
                  className="w-12 h-12 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{queue[0].title}</p>
                  <p className="text-xs text-[#b3b3b3] truncate">{queue[0].artist}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Synced Live Lyrics */}
      {rightSidebarTab === 'lyrics' && (
        <div
          ref={lyricsContainerRef}
          className="flex-1 overflow-y-auto pr-1 flex flex-col gap-6 py-4 scroll-smooth"
        >
          {lyricsData.loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-[#b3b3b3]">
              <div className="w-6 h-6 border-2 border-[#1db954] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Finding lyrics for {currentTrack.title}...</p>
            </div>
          ) : parsedLyrics.length > 0 ? (
            parsedLyrics.map((line, idx) => {
              const isActive = idx === activeLyricIndex;
              const isPast = idx < activeLyricIndex;
              return (
                <p
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => seek(line.time)}
                  className={`cursor-pointer transition-all duration-300 font-bold leading-relaxed text-left ${
                    isActive
                      ? 'text-white text-2xl scale-[1.02] origin-left drop-shadow-md'
                      : isPast
                      ? 'text-white/40 text-lg hover:text-white/80'
                      : 'text-white/60 text-lg hover:text-white'
                  }`}
                >
                  {line.text}
                </p>
              );
            })
          ) : lyricsData.plain ? (
            <div className="whitespace-pre-line text-lg font-bold text-white/80 leading-loose">
              {lyricsData.plain}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-[#b3b3b3] text-center">
              <Mic2 className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">No lyrics available for this song</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Queue Management */}
      {rightSidebarTab === 'queue' && (
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
          {/* Currently Playing Card */}
          <div>
            <span className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">Now Playing</span>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-[#242424] mt-2">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1db954] truncate">{currentTrack.title}</p>
                <p className="text-xs text-[#b3b3b3] truncate">{currentTrack.artist}</p>
              </div>
            </div>
          </div>

          {/* Next Up Section */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider">
              Next Up ({queue.length})
            </span>
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-[#b3b3b3] hover:text-white font-medium hover:underline"
              >
                Clear queue
              </button>
            )}
          </div>

          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-[#b3b3b3]">
              <ListMusic className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">Queue is empty</p>
              <p className="text-xs mt-1">Play any track or add songs to queue</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-[#1f1f1f] group transition-colors"
                >
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div
                    onClick={() => playTrack(track)}
                    className="min-w-0 flex-1 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-white truncate group-hover:text-[#1db954] transition-colors">
                      {track.title}
                    </p>
                    <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                  </div>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-white transition-opacity"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
