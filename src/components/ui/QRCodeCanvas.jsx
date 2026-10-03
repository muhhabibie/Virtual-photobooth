import { useState, useRef } from 'react';
import { Download, Copy, Check, Printer, QrCode, Sparkles } from 'lucide-react';
import logoPhotobooth from '../../assets/logo photobooth.png';
import MonochromeFloralOrnament from './MonochromeFloralOrnament';
import { QR_THEMES, resolveEventQrTheme } from '../../utils/qrTheme';
import { DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';
import { useToast } from './Toast';

export default function QRCodeCanvas({ 
  event, 
  url, 
  displayName, 
  size = 260, 
  showDownload = true,
  showOptions = true,
  onOpenTentCard = null
}) {
  const { toast } = useToast();
  const [selectedThemeKey, setSelectedThemeKey] = useState('auto');
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef(null);

  const activeTheme = resolveEventQrTheme(event, selectedThemeKey);
  const targetUrl = url || (event ? `${window.location.origin}/${event.slug}` : window.location.href);
  const title = displayName || event?.displayName || 'Sirklen Photo Event';
  
  // Hero Main Cover Photo from active event
  const coverPhoto = event?.heroPhotos?.[0] || DEFAULT_HERO_PHOTOS[0];

  // Custom QR Code API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}&color=${activeTheme.qrColor}&bgcolor=${activeTheme.bgColor}&margin=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    toast('Link QR Code berhasil disalin', 'success');
    setTimeout(() => setIsCopied(false), 2200);
  };

  const handleDownloadHD = async () => {
    try {
      toast('Merender QR Code HD...', 'info');
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = 800;
      const h = 1000;
      canvas.width = w;
      canvas.height = h;

      // 1. Base Dark Background
      ctx.fillStyle = activeTheme.canvasBgHex;
      ctx.fillRect(0, 0, w, h);

      // 2. Vivid Translucent Hero Cover Photo Background (50% Opacity)
      if (coverPhoto) {
        await new Promise((resolve) => {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          bgImg.onload = () => {
            ctx.save();
            ctx.globalAlpha = 0.48; // Vivid cover photo visibility
            const aspect = bgImg.width / bgImg.height;
            let dw = w;
            let dh = w / aspect;
            if (dh < h) {
              dh = h;
              dw = h * aspect;
            }
            const dx = (w - dw) / 2;
            const dy = (h - dh) / 2;
            ctx.drawImage(bgImg, dx, dy, dw, dh);
            ctx.restore();
            resolve();
          };
          bgImg.onerror = resolve;
          bgImg.src = coverPhoto;
        });
      }

      // 3. Luxurious Overlay Gradient (preserves cover photo while enhancing contrast)
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(30, 8, 14, 0.65)');
      grad.addColorStop(0.5, 'rgba(20, 5, 10, 0.78)');
      grad.addColorStop(1, 'rgba(10, 2, 5, 0.92)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // 4. Double Line Gold Hairline Border Frame
      ctx.strokeStyle = activeTheme.goldAccent;
      ctx.lineWidth = 3.5;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      ctx.lineWidth = 1.2;
      ctx.strokeRect(42, 42, w - 84, h - 84);

      // 5. Hero Thumbnail Badge in Header
      if (coverPhoto) {
        await new Promise((resolve) => {
          const thumbImg = new Image();
          thumbImg.crossOrigin = 'anonymous';
          thumbImg.onload = () => {
            ctx.save();
            const thumbSize = 80;
            const thumbX = w / 2 - thumbSize / 2;
            const thumbY = 60;

            ctx.beginPath();
            ctx.arc(w / 2, thumbY + thumbSize / 2, thumbSize / 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(thumbImg, thumbX, thumbY, thumbSize, thumbSize);
            ctx.restore();

            // Gold Ring Border
            ctx.beginPath();
            ctx.arc(w / 2, thumbY + thumbSize / 2, thumbSize / 2 + 2, 0, Math.PI * 2);
            ctx.strokeStyle = activeTheme.goldAccent;
            ctx.lineWidth = 2.5;
            ctx.stroke();

            resolve();
          };
          thumbImg.onerror = resolve;
          thumbImg.src = coverPhoto;
        });
      }

      // 6. Header Branding & Event Title
      ctx.fillStyle = activeTheme.canvasAccentHex;
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIRKLEN PHOTO • VIRTUAL PHOTOBOOTH', w / 2, 168);

      ctx.fillStyle = activeTheme.canvasTextHex;
      ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
      ctx.fillText(title, w / 2, 222);

      ctx.fillStyle = activeTheme.canvasSubtextHex;
      ctx.font = 'italic 18px "Georgia", serif';
      ctx.fillText(activeTheme.scanInstruction, w / 2, 260);

      // 7. Draw Clean QR Code Image Container
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const qrSize = 450;
          const qrX = (w - qrSize) / 2;
          const qrY = 290;

          // Crisp White Background Container
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

          ctx.strokeStyle = activeTheme.goldAccent;
          ctx.lineWidth = 2;
          ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

          // Draw QR Image clean
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
          resolve();
        };
        img.onerror = resolve;
        img.src = qrImageUrl;
      });

      // 8. Footer Info
      ctx.fillStyle = activeTheme.canvasAccentHex;
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PINDAI QR CODE DI ATAS UNTUK AKSES ACARA', w / 2, h - 105);

      ctx.fillStyle = activeTheme.canvasSubtextHex;
      ctx.font = '15px monospace';
      ctx.fillText(targetUrl, w / 2, h - 72);

      // Export Blob & Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `QR_Sirklen_${(title || 'Event').replace(/\s+/g, '_')}.png`;
        a.download = filename;
        a.href = blobUrl;
        a.click();
        toast('QR Code HD dengan ornamen hero cover berhasil diunduh', 'success');
      }, 'image/png');

    } catch (e) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      
      {/* Dynamic Aesthetic Card Frame with Vivid Hero Cover Background & Vector Botanical Ornaments */}
      <div 
        ref={containerRef} 
        className={`w-full p-5 sm:p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative flex flex-col items-center text-center overflow-hidden ${activeTheme.cardBorder}`}
      >
        {/* 1. Vivid Hero Cover Background Image */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {coverPhoto && (
            <img 
              src={coverPhoto} 
              alt="" 
              className="w-full h-full object-cover object-center opacity-50 filter brightness-105 scale-105" 
            />
          )}
          {/* Translucent Dark Gradient Layer for Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2A050A]/75 via-[#3B060D]/85 to-[#1A0306]/95" />
        </div>

        {/* 2. Pure Vector Botanical Corner Ornaments from Web Design */}
        <MonochromeFloralOrnament variant="corner-tr" className="absolute -top-3 -right-3 w-28 h-28 text-amber-300/45 pointer-events-none z-10" />
        <MonochromeFloralOrnament variant="corner-tl" className="absolute -top-3 -left-3 w-28 h-28 text-amber-300/45 pointer-events-none z-10" />
        <MonochromeFloralOrnament variant="corner-br" className="absolute -bottom-3 -right-3 w-24 h-24 text-amber-300/35 pointer-events-none z-10" />
        <MonochromeFloralOrnament variant="corner-bl" className="absolute -bottom-3 -left-3 w-24 h-24 text-amber-300/35 pointer-events-none z-10" />

        {/* 3. Inner Gold Foil Hairline Border */}
        <div className="absolute inset-2.5 rounded-2xl border border-amber-400/40 pointer-events-none z-10" />

        {/* 4. Hero Cover Thumbnail Badge & Brand Header */}
        <div className="flex flex-col items-center z-20 mb-2.5">
          
          {/* Circular Hero Cover Photo Preview Badge */}
          {coverPhoto && (
            <div className="relative mb-2 mt-1">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/90 shadow-lg shadow-amber-950/50">
                <img src={coverPhoto} alt="" className="w-full h-full object-cover object-center" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#6B111F] border border-amber-300 text-amber-200 flex items-center justify-center text-[9px] shadow-sm">
                ✨
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 mb-0.5">
            <img src={logoPhotobooth} alt="Sirklen Photo" className="w-5 h-5 object-contain" />
            <span className={`text-[10px] font-mono tracking-widest uppercase font-bold text-amber-200`}>
              SIRKLEN PHOTO
            </span>
          </div>

          <h4 className={`text-xl sm:text-2xl font-bold tracking-tight text-white ${activeTheme.fontStyle}`}>
            {title}
          </h4>

          <p className={`text-xs font-serif italic mt-0.5 text-amber-200/90`}>
            {activeTheme.scanInstruction}
          </p>
        </div>

        {/* 5. Clean QR Code Container */}
        <div className="relative z-20 p-3 bg-white rounded-2xl border border-amber-300/70 shadow-2xl flex items-center justify-center my-1">
          <img 
            src={qrImageUrl} 
            alt={`QR Code ${title}`} 
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
          />
        </div>

        {/* 6. URL Chip */}
        <div className="w-full bg-black/50 backdrop-blur-md border border-white/20 rounded-xl py-1.5 px-3 mt-3 z-20 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-gray-200 truncate">
            {targetUrl}
          </span>
          <button
            onClick={handleCopy}
            className="p-1 text-amber-300 hover:text-amber-100 transition cursor-pointer flex-shrink-0"
            title="Salin Link"
          >
            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>

        {/* 7. Action Buttons */}
        {showDownload && (
          <div className="w-full grid grid-cols-2 gap-2 mt-3.5 z-20">
            <button
              onClick={handleDownloadHD}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
            >
              <Download size={14} />
              <span>Download HD</span>
            </button>

            {onOpenTentCard ? (
              <button
                onClick={onOpenTentCard}
                className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-400/40 text-amber-200 text-xs font-serif font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
              >
                <Printer size={14} />
                <span>Kartu Meja</span>
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-400/40 text-amber-200 text-xs font-serif font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
              >
                {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{isCopied ? 'Tersalin' : 'Salin Link'}</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* Theme Presets Switcher (If showOptions enabled) */}
      {showOptions && (
        <div className="w-full mt-4 p-2 rounded-2xl bg-stone-900/90 border border-stone-800 backdrop-blur-md">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              <span>Gaya Desain QR Code</span>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {Object.keys(QR_THEMES).map((key) => {
              const th = QR_THEMES[key];
              const isSelected = (selectedThemeKey === 'auto' && activeTheme.id === key) || selectedThemeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedThemeKey(key)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-102 font-bold'
                      : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <span className="truncate w-full text-[10px] uppercase font-mono">{th.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
