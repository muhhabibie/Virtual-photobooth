import { useEffect, useRef, useCallback } from 'react';
import { RotateCcw, ArrowRight, X } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { renderMasterPhotoStrip } from '../../utils/stripRenderer';

export default function StepReview() {
  const {
    guestName,
    guestMessage,
    targetPhotoCount,
    stripColor,
    capturedPhotos,
    setCapturedPhotos,
    setCurrentStep,
    activeEvent,
    closeBooth
  } = useBooth();

  const canvasRef = useRef(null);

  const renderStrip = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || capturedPhotos.length === 0) return;

    renderMasterPhotoStrip(canvas, {
      photos: capturedPhotos,
      targetCount: targetPhotoCount,
      stripColor,
      guestName,
      guestMessage,
      activeEvent,
      scale: 2,
    });
  }, [capturedPhotos, targetPhotoCount, stripColor, guestName, guestMessage, activeEvent]);

  useEffect(() => {
    renderStrip();
  }, [renderStrip]);

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
          SESI FOTO SELESAI
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
          {getEventDisplayName(activeEvent, activeEvent?.slug)} {activeEvent?.eventType === 'wedding' || (!activeEvent?.eventType && !activeEvent?.slug) ? 'Wedding' : ''}
        </p>
      </div>

      {/* ================= 🌟 2. PERFECT VERTICAL CANVAS PHOTO STRIP 🌟 ================= */}
      <div className="flex-1 my-auto w-full flex flex-col items-center justify-center z-10 overflow-hidden py-2">
        <div className="relative h-full max-h-full flex items-center justify-center">
          <canvas 
            ref={canvasRef} 
            className="h-full max-h-full w-auto max-w-full object-contain block shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(245,215,127,0.15)] rounded-2xl mx-auto border border-white/20" 
          />
        </div>
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