import { useEffect, useRef, useCallback } from 'react';
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

  const canvasRef = useRef(null);

  const renderStrip = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || capturedPhotos.length === 0) return;

    const count = targetPhotoCount;
    const scale = 2; // 2x Retina Resolution
    const photoW = 400 * scale;
    const pad = 30 * scale;
    const gap = 18 * scale;
    const headerH = 65 * scale;
    const footerH = 85 * scale;

    const photoLayouts = Array.from({ length: count }).map((_, idx) => {
      const photo = capturedPhotos[idx];
      const srcEl = photo?.canvas;
      const aspect = (srcEl && srcEl.width && srcEl.height) ? (srcEl.height / srcEl.width) : 0.75;
      const h = Math.round(photoW * aspect);
      return { photo, h };
    });

    const totalPhotosHeight = photoLayouts.reduce((sum, item) => sum + item.h, 0);
    const totalW = photoW + pad * 2;
    const totalH = pad + headerH + totalPhotosHeight + (gap * Math.max(0, count - 1)) + footerH + pad;

    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const frameBg = stripColor || '#6B111F';
    ctx.fillStyle = frameBg;
    ctx.fillRect(0, 0, totalW, totalH);

    const isLightBg = frameBg === '#FAF6F0' || frameBg === '#FDFBF7' || frameBg === '#ffffff' || frameBg === '#F3C5CB';
    ctx.fillStyle = isLightBg ? '#8C7A6B' : '#F5D77F';
    ctx.font = `bold ${14 * scale}px monospace, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✦ THE WEDDING OF ✦', totalW / 2, pad + 38 * scale);

    let drawY = pad + headerH;
    photoLayouts.forEach(({ photo, h }, idx) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pad - 4 * scale, drawY - 4 * scale, photoW + 8 * scale, h + 8 * scale);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(pad - 4 * scale, drawY - 4 * scale, photoW + 8 * scale, h + 8 * scale);

      if (photo && photo.canvas) {
        ctx.drawImage(photo.canvas, 0, 0, photo.canvas.width, photo.canvas.height, pad, drawY, photoW, h);
      } else if (photo && photo.dataUrl) {
        const img = new Image();
        img.src = photo.dataUrl;
        ctx.drawImage(img, pad, drawY, photoW, h);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(pad, drawY, photoW, h);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `bold ${16 * scale}px monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(`Pose #${idx + 1}`, pad + photoW / 2, drawY + h / 2);
      }

      drawY += h + gap;
    });

    const displayName = guestName ? guestName.trim() : 'Sabrina & Raka';
    ctx.fillStyle = isLightBg ? '#6B111F' : 'rgba(255,255,255,0.85)';
    ctx.font = `italic bold ${13 * scale}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('With Love & Blessings,', totalW / 2, totalH - pad - 38 * scale);

    ctx.fillStyle = isLightBg ? '#6B111F' : '#F5D77F';
    ctx.font = `italic bold ${24 * scale}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    ctx.fillText(displayName, totalW / 2, totalH - pad - 10 * scale);
  }, [capturedPhotos, targetPhotoCount, stripColor, guestName]);

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