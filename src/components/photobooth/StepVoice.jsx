import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Mic, Square, Check, X, Sparkles, Volume2 } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useRecorder } from '../../hooks/useRecorder';
import { useToast } from '../ui/Toast';
import SpotifyVoicePlayer from '../ui/SpotifyVoicePlayer';

export default function StepVoice() {
  const {
    guestName,
    guestMessage,
    targetPhotoCount,
    stripColor,
    capturedPhotos,
    setVoiceBlob,
    setVoiceUrl,
    setCurrentStep,
    closeBooth
  } = useBooth();

  const { isRecording, seconds, audioUrl, audioBlob, toggle, reset, formatTime } = useRecorder();
  const { toast } = useToast();

  useEffect(() => {
    reset();
    return () => reset();
  }, []);

  const handleFinish = () => {
    if (audioBlob) {
      setVoiceBlob(audioBlob);
      setVoiceUrl(audioUrl);
      toast('Doa & pesan suara tersimpan! 💍', 'success');
    }
    setCurrentStep('result');
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-black text-white select-none overflow-hidden flex flex-col justify-between p-1.5 sm:p-2.5 pb-[max(env(safe-area-inset-bottom),10px)] z-[100] font-sans">
      
      {/* ================= 🌟 1. INSTAGRAM STORY TOP BAR 🌟 ================= */}
      <div className="relative z-30 flex items-center justify-between w-full max-w-md mx-auto flex-shrink-0 pt-1 px-2 pb-1">
        {/* Back to Photo Review */}
        <button
          onClick={() => { reset(); setCurrentStep('review'); }}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow-md"
          title="Foto Ulang"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Center Title Badge */}
        <div className="px-4 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-amber-200 text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center shadow-md">
          <span>REKAM DOA RESTU</span>
        </div>

        {/* Right Close X Button */}
        <button
          onClick={closeBooth}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow-md"
          title="Tutup"
        >
          <X size={18} />
        </button>
      </div>

      {/* ================= 🌟 2. CENTER CONTENT (PROMINENT PHOTOSTRIP + RECORDING CARD) 🌟 ================= */}
      <div className="flex-1 min-h-0 w-full max-w-md mx-auto relative flex flex-col items-center justify-between py-1 overflow-y-auto no-scrollbar gap-2">
        
        {/* Prominent Photo Strip Preview Container (Scaled properly) */}
        <div className="flex-1 min-h-0 w-full flex items-center justify-center py-1 overflow-hidden">
          <div 
            style={{ backgroundColor: stripColor || '#6B111F' }}
            className="h-full max-h-full w-48 xs:w-52 sm:w-56 rounded-2xl p-2.5 sm:p-3 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(245,215,127,0.15)] border border-white/20 flex flex-col justify-between transition-all overflow-hidden mx-auto"
          >
            {/* Header */}
            <div className="text-center pb-1 border-b border-white/10 flex-shrink-0">
              <p className="text-[6.5px] sm:text-[7.5px] font-serif font-bold text-[#F5D77F] uppercase tracking-wider">
                ✦ THE WEDDING OF ✦
              </p>
              <h3 
                style={{ fontFamily: "'Alex Brush', 'Great Vibes', cursive" }}
                className="text-xs sm:text-sm text-[#F5D77F] leading-none mt-0.5"
              >
                Sabrina & Raka
              </h3>
            </div>

            {/* Photos */}
            <div className="flex-1 min-h-0 flex flex-col gap-1 sm:gap-1.5 py-1 sm:py-1.5 overflow-hidden">
              {Array.from({ length: targetPhotoCount }).map((_, idx) => {
                const photo = capturedPhotos[idx];
                return (
                  <div
                    key={idx}
                    className={`relative w-full flex-1 min-h-0 rounded-lg bg-black/40 border border-white/10 overflow-hidden shadow-inner ${
                      targetPhotoCount === 1 ? 'aspect-[4/5]' : 'aspect-[4/3]'
                    }`}
                  >
                    {photo ? (
                      <img src={photo.dataUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover object-[center_35%]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/40 text-[9px] font-mono">
                        Pose #{idx + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="text-center pt-1 border-t border-white/10 flex-shrink-0">
              <p className="text-[6px] sm:text-[7px] font-mono text-[#F5D77F]/80 tracking-widest">
                30 · 05 · 2026
              </p>
              <h4 className="text-[9px] sm:text-[10px] font-sans font-bold text-white leading-tight truncate px-1">
                {guestName && guestName.trim() ? guestName.trim() : 'Tamu Undangan'}
              </h4>
            </div>
          </div>
        </div>

        {/* Voice Recording Card */}
        <div className="w-full bg-[#160B12]/90 backdrop-blur-xl border border-white/15 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl text-center flex-shrink-0">
          
          <h2 className="text-sm sm:text-base font-serif text-amber-200 font-bold leading-tight">
            Doa Restu untuk Mempelai
          </h2>

          <p className="text-[10px] sm:text-xs text-gray-300 mt-0.5">
            Rekam ucapan doa tulusmu, maks. 15 detik
          </p>

          {/* Dotted Waveform Visualizer */}
          <div className="flex items-center justify-center gap-1 sm:gap-1.5 my-2">
            {Array.from({ length: 18 }).map((_, idx) => (
              <span
                key={idx}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  isRecording 
                    ? 'bg-amber-300 scale-125 animate-pulse' 
                    : audioUrl 
                      ? 'bg-emerald-400' 
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Circular Timer & Mic Shutter */}
          <div className="flex items-center justify-center gap-4 my-1">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/20 bg-black/50 flex flex-col items-center justify-center shadow-inner">
              <span className="text-sm sm:text-base font-mono font-black text-amber-200 tracking-wider">
                {formatTime(seconds)}
              </span>
              <span className="text-[7.5px] text-gray-400 font-mono">
                / 0:15
              </span>
            </div>

            <button
              onClick={toggle}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white text-xl shadow-2xl active:scale-95 transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-600 ring-4 ring-red-500/40 animate-pulse'
                  : audioUrl
                    ? 'bg-emerald-600 ring-4 ring-emerald-500/40 hover:scale-105'
                    : 'bg-[#6B111F] ring-4 ring-amber-400/30 hover:bg-[#8A1828] hover:scale-105'
              }`}
              title={isRecording ? 'Berhenti Merekam' : 'Mulai Rekam Doa'}
            >
              {isRecording ? (
                <Square size={20} className="fill-white" />
              ) : audioUrl ? (
                <Check size={24} />
              ) : (
                <Mic size={24} />
              )}
            </button>
          </div>

          {/* Status Text */}
          <p className="text-[10px] text-gray-300 mt-1 font-medium">
            {isRecording
              ? 'Sedang merekam doa... (Ketuk untuk stop)'
              : audioUrl
                ? 'Doa suara tersimpan! (Ketuk mic untuk rekam ulang)'
                : 'Ketuk tombol mic untuk mulai rekam'}
          </p>

          {/* Audio Playback Player */}
          {audioUrl && (
            <div className="mt-2 w-full">
              <SpotifyVoicePlayer
                voiceUrl={audioUrl}
                guestName={guestName}
                totalDuration={seconds || 15}
              />
            </div>
          )}

        </div>

      </div>

      {/* ================= 🌟 3. INSTAGRAM ACTION DOCK (FULL WIDTH PRIMARY BUTTON) 🌟 ================= */}
      <div className="relative z-30 w-full max-w-md mx-auto pt-1 pb-1 px-2 flex-shrink-0">
        <button
          onClick={handleFinish}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] text-[#F5D77F] font-serif font-bold text-xs sm:text-sm border border-amber-400/50 shadow-2xl shadow-rose-950/60 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
        >
          <span>Simpan & Lihat Photo Strip</span>
        </button>
      </div>

    </div>
  );
}