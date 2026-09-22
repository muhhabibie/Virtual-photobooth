import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export default function SpotifyVoicePlayer({ voiceUrl, guestName, totalDuration = 24 }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDuration || 24);
  const [simulatedInterval, setSimulatedInterval] = useState(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [voiceUrl]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (simulatedInterval) clearInterval(simulatedInterval);
    };
  }, [simulatedInterval]);

  const togglePlay = () => {
    const audio = audioRef.current;

    if (voiceUrl && audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {
          // Fallback if browser blocks auto audio
          setIsPlaying(false);
        });
      }
    } else {
      // Simulated interactive playback for demo guest entries
      if (isPlaying) {
        clearInterval(simulatedInterval);
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        const timer = setInterval(() => {
          setCurrentTime(prev => {
            if (prev >= duration) {
              clearInterval(timer);
              setIsPlaying(false);
              return 0;
            }
            return prev + 1;
          });
        }, 1000);
        setSimulatedInterval(timer);
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (voiceUrl && audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-[#160810]/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#C4A46C]/30 shadow-xl select-none transition-all my-1.5 group">
      {voiceUrl && <audio ref={audioRef} src={voiceUrl} preload="metadata" />}

      <div className="flex items-center gap-3">
        
        {/* Spotify-style Circular Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#E5C158] via-[#F5D77F] to-[#E5C158] hover:from-[#d8b346] hover:to-[#eed072] text-[#240c17] flex items-center justify-center shadow-lg shadow-amber-900/40 hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
          title={isPlaying ? 'Jeda Suara' : 'Putar Pesan Suara'}
        >
          {isPlaying ? (
            <Pause size={16} className="fill-current text-[#240c17]" />
          ) : (
            <Play size={16} className="fill-current text-[#240c17] ml-0.5" />
          )}
        </button>

        {/* Center: Info & Spotify Scrubber Track */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
          
          {/* Top Info Bar with animated Equalizer bars */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Volume2 size={12} className={`flex-shrink-0 ${isPlaying ? 'text-[#F5D77F] animate-pulse' : 'text-gray-400'}`} />
              <span className="text-[11px] sm:text-xs font-serif font-bold text-white truncate">
                {guestName ? `Pesan Doa dari ${guestName}` : 'Pesan Doa Tamu'}
              </span>
            </div>

            {/* Spotify-style Mini Animated Equalizer Waveform */}
            <div className="flex items-end gap-0.5 h-3.5 flex-shrink-0 px-1">
              <span className={`w-0.5 bg-[#F5D77F] rounded-full transition-all duration-300 ${isPlaying ? 'h-3.5 animate-pulse' : 'h-1'}`} />
              <span className={`w-0.5 bg-[#F5D77F] rounded-full transition-all duration-200 ${isPlaying ? 'h-2 animate-pulse' : 'h-1.5'}`} style={{ animationDelay: '0.15s' }} />
              <span className={`w-0.5 bg-[#F5D77F] rounded-full transition-all duration-300 ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`} style={{ animationDelay: '0.3s' }} />
              <span className={`w-0.5 bg-[#F5D77F] rounded-full transition-all duration-200 ${isPlaying ? 'h-2.5 animate-pulse' : 'h-1.5'}`} style={{ animationDelay: '0.45s' }} />
            </div>
          </div>

          {/* Spotify Progress Bar Scrubber */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-[#F5D77F] w-6 text-left">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center h-2">
              {/* Background Track */}
              <div className="absolute inset-x-0 h-1 bg-white/15 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Invisible touch seeker input */}
              <input
                type="range"
                min="0"
                max={duration || 24}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <span className="text-[9px] font-mono text-gray-400 w-6 text-right">
              {formatTime(duration)}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
