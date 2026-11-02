import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [audioQuality, setAudioQuality] = useState('High');
  const [crossfade, setCrossfade] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [normalizeVolume, setNormalizeVolume] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#282828] rounded-xl max-w-lg w-full p-6 text-white shadow-2xl border border-white/10 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1db954]" />
            <h2 className="text-xl font-bold">Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 text-[#b3b3b3] hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 text-sm">
          {/* Audio Quality */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Streaming Quality</p>
              <p className="text-xs text-[#b3b3b3]">Streaming high bitrate MP3/WebM audio directly from YouTube</p>
            </div>
            <select
              value={audioQuality}
              onChange={(e) => setAudioQuality(e.target.value)}
              className="bg-[#181818] border border-white/20 rounded px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
            >
              <option value="Normal">Normal (128 kbps)</option>
              <option value="High">High (256 kbps)</option>
              <option value="Very High">Very High (320 kbps lossless)</option>
            </select>
          </div>

          {/* Crossfade */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Crossfade</span>
              <span className="text-xs text-[#b3b3b3]">{crossfade}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              value={crossfade}
              onChange={(e) => setCrossfade(parseInt(e.target.value))}
              className="spotify-slider"
            />
          </div>

          {/* Autoplay */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Autoplay similar songs</p>
              <p className="text-xs text-[#b3b3b3]">Keep the music going when your queue finishes</p>
            </div>
            <button
              onClick={() => setAutoplay(!autoplay)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                autoplay ? 'bg-[#1db954]' : 'bg-[#535353]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  autoplay ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Normalize Volume */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Normalize volume</p>
              <p className="text-xs text-[#b3b3b3]">Set the same volume level for all YouTube audio tracks</p>
            </div>
            <button
              onClick={() => setNormalizeVolume(!normalizeVolume)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                normalizeVolume ? 'bg-[#1db954]' : 'bg-[#535353]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  normalizeVolume ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-black font-bold rounded-full text-sm hover:scale-105 active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
