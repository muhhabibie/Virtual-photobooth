import { RotateCcw, ArrowRight, X } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';

export default function StepReview() {
  const {
    guestName,
    guestMessage,
    targetPhotoCount,
    stripColor,
    capturedPhotos,
    setCapturedPhotos,
    setCurrentStep,
    closeBooth
  } = useBooth();

  // Retake or remove a single photo from the strip
  const handleRemovePhoto = (indexToRemove) => {
    const updated = capturedPhotos.filter((_, idx) => idx !== indexToRemove);
    setCapturedPhotos(updated);
    setCurrentStep('camera');
  };

  // Retake all photos
  const handleRetakeAll = () => {
    setCapturedPhotos([]);
    setCurrentStep('camera');
  };

  // Proceed to voice step
  const handleContinue = () => {
    setCurrentStep('voice');
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-[#0E080C] text-white select-none overflow-hidden flex flex-col justify-between items-center font-sans z-[100] px-4 pt-3.5 sm:pt-6 pb-24 sm:pb-28">
      
      {/* ================= 🌟 1. TOP HEADER ("Foto Siap!") 🌟 ================= */}
      <div className="text-center w-full z-10 flex-shrink-0">
        <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-[#E5C158] uppercase font-bold">
          ✦ SESI FOTO SELESAI ✦
        </p>

        <h1 
          className="text-4xl xs:text-5xl sm:text-6xl text-white font-normal leading-tight my-0.5 sm:my-1 drop-shadow-2xl"
          style={{ 
            fontFamily: "'Alex Brush', 'Great Vibes', cursive",
            textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 30px rgba(229,193,88,0.35)'
          }}
        >
          Foto Siap!
        </h1>

        <p className="text-[11px] sm:text-xs text-[#C4A46C] font-serif italic tracking-wide">
          Sabrina & Raka Wedding
        </p>
      </div>

      {/* ================= 🌟 2. PERFECT VERTICAL & HORIZONTAL CENTER PHOTO STRIP 🌟 ================= */}
      <div className="flex-1 my-auto w-full flex flex-col items-center justify-center z-10">
        <div 
          style={{ backgroundColor: stripColor || '#6B111F' }}
          className="w-44 xs:w-48 sm:w-56 rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-white/20 flex flex-col justify-between transition-all transform hover:scale-[1.01]"
        >
          {/* Strip Top Header */}
          <div className="text-center pb-1.5 border-b border-white/10">
            <p className="text-[6.5px] sm:text-[7.5px] font-serif font-bold text-[#F5D77F] uppercase tracking-wider">
              ✦ THE WEDDING OF ✦
            </p>
            <h3 
              style={{ fontFamily: "'Alex Brush', 'Great Vibes', cursive" }}
              className="text-xs sm:text-sm text-[#F5D77F] font-script leading-none mt-0.5"
            >
              Sabrina & Raka
            </h3>
          </div>

          {/* Photo Slots with individual delete buttons */}
          <div className="flex flex-col gap-1.5 sm:gap-2 py-1.5 sm:py-2 max-h-[320px] xs:max-h-[360px] sm:max-h-[420px] overflow-y-auto no-scrollbar">
            {Array.from({ length: targetPhotoCount }).map((_, idx) => {
              const photo = capturedPhotos[idx];
              return (
                <div
                  key={idx}
                  className={`relative w-full rounded-lg bg-black/40 border border-white/10 overflow-hidden shadow-inner group ${
                    targetPhotoCount === 1 ? 'aspect-[4/5]' : 'aspect-[4/3]'
                  }`}
                >
                  {photo ? (
                    <>
                      <img 
                        src={photo.dataUrl} 
                        alt={`Foto ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      {/* Red Delete Badge on Top Right */}
                      <button
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 border border-white text-white flex items-center justify-center text-xs font-bold shadow-lg active:scale-90 transition cursor-pointer z-30"
                        title="Hapus & Ambil Ulang Foto Ini"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/40 text-[10px] font-mono">
                      <span>Pose #{idx + 1}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strip Bottom Footer matching agreed gallery card output */}
          <div className="text-center pt-1.5 pb-1 flex-shrink-0 flex flex-col items-center">
            <h3 
              style={{ 
                color: '#F5D77F',
                fontFamily: "'Alex Brush', 'Great Vibes', 'Playfair Display', cursive" 
              }}
              className="text-xs sm:text-sm font-serif italic leading-tight"
            >
              Sabrina & Raka
            </h3>
            <p className="text-[6.5px] sm:text-[7.5px] font-mono text-[#F5D77F]/80 tracking-widest mt-0.5">
              30 · 05 · 2026
            </p>
            <h4 className="text-[10px] sm:text-xs font-sans font-bold text-white leading-tight mt-0.5 tracking-wide truncate max-w-full px-1">
              {guestName && guestName.trim() ? guestName.trim() : 'Tamu Undangan (Kamu)'}
            </h4>
            {guestMessage && guestMessage.trim() ? (
              <>
                <div className="w-full border-t border-white/20 my-0.5 flex-shrink-0" />
                <div className="px-1 text-center max-h-6 overflow-hidden flex items-center justify-center">
                  <p className="text-[8px] sm:text-[9px] font-serif italic text-rose-100/90 leading-tight line-clamp-1 overflow-hidden text-ellipsis">
                    "{guestMessage.trim().length > 45 ? `${guestMessage.trim().slice(0, 45)}...` : guestMessage.trim()}"
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-2.5">
          Ketuk foto di strip untuk menghapus & retake
        </p>
      </div>

      {/* ================= 🌟 3. STICKY BOTTOM ACTION BAR 🌟 ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0E080C]/95 backdrop-blur-md border-t border-white/10 p-3 sm:p-4 pb-[max(env(safe-area-inset-bottom),12px)] z-40">
        <div className="max-w-md mx-auto flex items-center gap-3">
          
          {/* Ulang Button */}
          <button
            onClick={handleRetakeAll}
            className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Ulang</span>
          </button>

          {/* Lanjutkan Gold Button */}
          <button
            onClick={handleContinue}
            className="flex-1 py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-[#B59150] via-[#C4A46C] to-[#B59150] hover:brightness-110 text-white font-serif font-bold text-xs sm:text-sm shadow-xl shadow-amber-950/40 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
          >
            <span>Lanjutkan</span>
          </button>
        </div>
      </div>

    </div>
  );
}