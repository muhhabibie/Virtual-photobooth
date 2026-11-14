import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

/**
 * Web Audio API Chime & Arpeggio Synthesizer
 * Provides authentic, audible acoustic chime / wedding melody playback
 * for demo gallery photos and as a fallback if binary audio format is unsupported on the client.
 */
class ChimeSynthesizer {
  constructor() {
    this.ctx = null;
    this.activeNodes = [];
    this.timerId = null;
    this.startTime = 0;
    this.pausedAt = 0;
    this.durationSec = 10;
    this.onProgressCb = null;
    this.onEndCb = null;
  }

  init() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playMelody(durationSec = 10, startOffset = 0, onProgress, onEnd) {
    this.stopAudioNodesOnly();
    const ctx = this.init();
    if (!ctx) {
      if (typeof onEnd === 'function') onEnd();
      return;
    }

    this.durationSec = durationSec;
    this.onProgressCb = onProgress;
    this.onEndCb = onEnd;

    const now = ctx.currentTime;
    // Harmonic notes for a warm romantic blessing melody (frequencies in Hz):
    // E4, G#4, B4, E5, G#5, B5, E5, B4, E5
    const melody = [
      { f: 329.63, time: 0.0, dur: 2.2, gain: 0.16 }, // E4
      { f: 415.30, time: 0.6, dur: 2.2, gain: 0.15 }, // G#4
      { f: 493.88, time: 1.2, dur: 2.4, gain: 0.16 }, // B4
      { f: 659.25, time: 1.8, dur: 2.8, gain: 0.18 }, // E5
      { f: 830.61, time: 2.6, dur: 2.5, gain: 0.14 }, // G#5
      { f: 987.77, time: 3.4, dur: 3.0, gain: 0.14 }, // B5
      { f: 659.25, time: 4.4, dur: 2.4, gain: 0.15 }, // E5
      { f: 493.88, time: 5.4, dur: 2.6, gain: 0.16 }, // B4
      { f: 659.25, time: 6.4, dur: 3.8, gain: 0.19 }, // E5 resolution
    ];

    melody.forEach(note => {
      // Offset if playing after seek/pause
      const scheduledTime = note.time - startOffset;
      if (scheduledTime + note.dur <= 0 || scheduledTime >= durationSec) return;

      const noteStart = Math.max(now, now + scheduledTime);
      const remainingDur = Math.max(0.2, (note.time + note.dur) - startOffset);

      try {
        // Fundamental tone (warm sine wave)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, noteStart);

        // Soft acoustic overtone (gentle triangle an octave higher)
        const oscHarmonic = ctx.createOscillator();
        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(note.f * 2, noteStart);

        // Gain envelope for realistic bell / chime decay
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.0001, noteStart);
        gainNode.gain.exponentialRampToValueAtTime(note.gain, noteStart + 0.025);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, noteStart + remainingDur);

        const harmGain = ctx.createGain();
        harmGain.gain.setValueAtTime(0.0001, noteStart);
        harmGain.gain.exponentialRampToValueAtTime(note.gain * 0.18, noteStart + 0.025);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + remainingDur * 0.65);

        osc.connect(gainNode);
        oscHarmonic.connect(harmGain);
        gainNode.connect(ctx.destination);
        harmGain.connect(ctx.destination);

        osc.start(noteStart);
        oscHarmonic.start(noteStart);
        osc.stop(noteStart + remainingDur);
        oscHarmonic.stop(noteStart + remainingDur);

        this.activeNodes.push(osc, oscHarmonic, gainNode, harmGain);
      } catch (err) {}
    });

    const baselineDate = Date.now() - (startOffset * 1000);
    this.startTime = baselineDate;

    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      if (elapsed >= this.durationSec) {
        this.stop();
        if (typeof this.onEndCb === 'function') this.onEndCb();
      } else {
        if (typeof this.onProgressCb === 'function') this.onProgressCb(elapsed);
      }
    }, 100);
  }

  stopAudioNodesOnly() {
    this.activeNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.stopAudioNodesOnly();
  }
}

export default function SpotifyVoicePlayer({ voiceUrl, guestName, totalDuration = 12 }) {
  const audioRef = useRef(null);
  const synthRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(totalDuration || 12);
  const [useSynth, setUseSynth] = useState(false);

  // Initialize synth singleton lazily
  const getSynth = useCallback(() => {
    if (!synthRef.current) {
      synthRef.current = new ChimeSynthesizer();
    }
    return synthRef.current;
  }, []);

  // Sync prop duration when totalDuration updates
  useEffect(() => {
    if (totalDuration && totalDuration > 0) {
      setDuration(totalDuration);
    }
  }, [totalDuration]);

  // Clean up playback when voiceUrl changes or component unmounts
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setUseSynth(false);

    if (synthRef.current) {
      synthRef.current.stop();
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.stop();
      }
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (e) {}
      }
    };
  }, [voiceUrl]);

  // HTML5 Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !voiceUrl) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
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

    const onError = (e) => {
      console.info("[SpotifyVoicePlayer] Audio format not decodable natively, using harmonic chime synth:", e);
      if (isPlaying) {
        startSynthPlayback(currentTime);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [voiceUrl, isPlaying, currentTime]);

  const startSynthPlayback = (fromSec = 0) => {
    setUseSynth(true);
    setIsPlaying(true);
    const synth = getSynth();
    const effectiveDur = duration || totalDuration || 12;
    synth.playMelody(
      effectiveDur,
      fromSec,
      (elapsed) => {
        setCurrentTime(elapsed);
      },
      () => {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    );
  };

  const togglePlay = () => {
    // 1. If currently playing, PAUSE
    if (isPlaying) {
      if (useSynth) {
        getSynth().stop();
      } else if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {}
      }
      setIsPlaying(false);
      return;
    }

    // 2. If not playing, START PLAYBACK
    // Try HTML5 <audio> if voiceUrl exists and synth is not forced
    if (voiceUrl && !useSynth && audioRef.current) {
      const audio = audioRef.current;
      if (audio.ended || (audio.duration && audio.currentTime >= audio.duration)) {
        audio.currentTime = 0;
        setCurrentTime(0);
      }
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.info("[SpotifyVoicePlayer] HTML5 audio.play blocked or unsupported format, falling back to chime synth:", err?.message || err);
        startSynthPlayback(currentTime);
      });
      return;
    }

    // Otherwise, play with the Web Audio Chime Synthesizer
    startSynthPlayback(currentTime >= duration ? 0 : currentTime);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    if (voiceUrl && !useSynth && audioRef.current) {
      try {
        audioRef.current.currentTime = newTime;
      } catch (err) {}
    } else if (isPlaying) {
      startSynthPlayback(newTime);
    }
  };

  const formatTime = (secs) => {
    const safeSecs = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(safeSecs / 60);
    const s = Math.floor(safeSecs % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full bg-[#160810]/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-[#C4A46C]/30 shadow-xl select-none transition-all my-1.5 group">
      {voiceUrl && (
        <audio 
          ref={audioRef} 
          src={voiceUrl} 
          preload="auto" 
          playsInline 
        />
      )}

      <div className="flex items-center gap-3">
        
        {/* Spotify-style Circular Play/Pause Button */}
        <button
          type="button"
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
                max={duration || 12}
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
