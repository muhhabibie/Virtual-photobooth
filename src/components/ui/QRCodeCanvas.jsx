import { useState, useRef } from 'react';
import { Download, Copy, Check, Printer, Sparkles } from 'lucide-react';
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

  // Clean, high contrast QR Code URL (No logo/emoji in center)
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

      // 1. Base Dark Theme Background
      ctx.fillStyle = activeTheme.canvasBgHex;
      ctx.fillRect(0, 0, w, h);

      // 2. Top Hero Photo Banner (Clearly Visible in Top Section)
      if (coverPhoto) {
        await new Promise((resolve) => {
          const bgImg = new Image();
          bgImg.crossOrigin = 'anonymous';
          bgImg.onload = () => {
            ctx.save();
            ctx.globalAlpha = 0.75; // Clear visibility of hero photo
            const bannerH = 400;
            const aspect = bgImg.width / bgImg.height;
            let dw = w;
            let dh = w / aspect;
            if (dh < bannerH) {
              dh = bannerH;
              dw = bannerH * aspect;
            }
            const dx = (w - dw) / 2;
            const dy = 0;
            ctx.drawImage(bgImg, dx, dy, dw, dh);
            ctx.restore();
            resolve();
          };
          bgImg.onerror = resolve;
          bgImg.src = coverPhoto;
        });
      }

      // 3. Top Banner Gradient Fade Out into Dark Background Below
      const heroGrad = ctx.createLinearGradient(0, 0, 0, 420);
      const [r, g, b] = (activeTheme.canvasOverlayRgb || '59, 6, 13').split(',').map(n => n.trim());
      heroGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.35)`);
      heroGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.75)`);
      heroGrad.addColorStop(1, activeTheme.canvasBgHex);
      ctx.fillStyle = heroGrad;
      ctx.fillRect(0, 0, w, 420);

      // Fill lower portion with theme background
      ctx.fillStyle = activeTheme.canvasBgHex;
      ctx.fillRect(0, 418, w, h - 418);

      // 4. Double Line Thin Gold Hairline Borders & Corner Flourishes
      ctx.strokeStyle = activeTheme.goldAccent;
      ctx.lineWidth = 3.5;
      ctx.strokeRect(32, 32, w - 64, h - 64);

      ctx.lineWidth = 1.2;
      ctx.strokeRect(44, 44, w - 88, h - 88);

      // Corner flourishes line art
      const drawCornerFlourish = (x, y, flipX, flipY) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        ctx.strokeStyle = activeTheme.goldAccent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(0, 0);
        ctx.lineTo(30, 0);
        ctx.moveTo(8, 8);
        ctx.arc(16, 16, 8, Math.PI, Math.PI * 1.5);
        ctx.stroke();
        ctx.restore();
      };
      drawCornerFlourish(55, 55, false, false);
      drawCornerFlourish(w - 55, 55, true, false);
      drawCornerFlourish(55, h - 55, false, true);
      drawCornerFlourish(w - 55, h - 55, true, true);

      // 5. Header Text & Event Title
      ctx.fillStyle = activeTheme.canvasAccentHex;
      ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SIRKLEN PHOTO • VIRTUAL PHOTOBOOTH', w / 2, 135);

      ctx.fillStyle = activeTheme.canvasTextHex;
      ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
      ctx.fillText(title, w / 2, 195);

      ctx.fillStyle = activeTheme.canvasSubtextHex;
      ctx.font = 'italic 18px "Georgia", serif';
      ctx.fillText(activeTheme.scanInstruction, w / 2, 235);

      // 6. Clean, High-Contrast QR Code Area (Bright white container)
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const qrSize = 460;
          const qrX = (w - qrSize) / 2;
          const qrY = 275;

          // Pure Bright White Container
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

      // 7. Footer Info
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
        toast('QR Code HD dengan background hero banner berhasil diunduh', 'success');
      }, 'image/png');

    } catch (e) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      
      {/* Dynamic Aesthetic Card Frame with Top Hero Background Banner & Bottom Blur Fade */}
      <div 
        ref={containerRef} 
        className={`w-full p-5 sm:p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative flex flex-col items-center text-center overflow-hidden ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
      >
        
        {/* 1. Hero Main Cover Photo Background Banner with Smooth Bottom Opacity Blur Fade */}
        <div className="absolute top-0 inset-x-0 h-48 sm:h-56 overflow-hidden pointer-events-none z-0">
          {coverPhoto && (
            <img 
              src={coverPhoto} 
              alt="" 
              className="w-full h-full object-cover object-top opacity-70 filter brightness-105" 
            />
          )}
          {/* Feather-Soft Gradient Blur Fade Masking Bottom Edge into Card Background */}
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, 
                rgba(0, 0, 0, 0.25) 0%, 
                rgba(0, 0, 0, 0.50) 45%, 
                rgba(0, 0, 0, 0.85) 75%, 
                ${activeTheme.canvasBgHex} 98%
              )`
            }}
          />
        </div>

        {/* 2. Elegant Thin Gold Line Art & Corner Flourishes */}
        <MonochromeFloralOrnament variant="corner-tr" className={`absolute -top-3 -right-3 w-32 h-32 ${activeTheme.flourishClass} pointer-events-none z-10`} />
        <MonochromeFloralOrnament variant="corner-tl" className={`absolute -top-3 -left-3 w-32 h-32 ${activeTheme.flourishClass} pointer-events-none z-10`} />
        <MonochromeFloralOrnament variant="corner-br" className={`absolute -bottom-3 -right-3 w-28 h-28 ${activeTheme.flourishClass} pointer-events-none z-10`} />
        <MonochromeFloralOrnament variant="corner-bl" className={`absolute -bottom-3 -left-3 w-28 h-28 ${activeTheme.flourishClass} pointer-events-none z-10`} />

        {/* 3. Double Hairline Thin Gold Borders */}
        <div className="absolute inset-2.5 rounded-2xl border border-amber-400/40 pointer-events-none z-10" />
        <div className="absolute inset-4 rounded-xl border border-amber-400/20 pointer-events-none z-10" />

        {/* 4. Brand Header & Event Title (Overlaid Prominently on Hero Photo Banner) */}
        <div className="flex flex-col items-center z-20 mb-3 pt-1">
          <div className="flex items-center gap-1.5 mb-1">
            <img src={logoPhotobooth} alt="Sirklen Photo" className="w-5 h-5 object-contain" />
            <span className={`text-[10px] font-mono tracking-widest uppercase font-bold text-amber-200 drop-shadow-md`}>
              SIRKLEN PHOTO
            </span>
          </div>

          <h4 className={`text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-md ${activeTheme.fontStyle}`}>
            {title}
          </h4>

          <p className={`text-xs font-serif italic mt-0.5 text-amber-200/90 drop-shadow-sm`}>
            {activeTheme.scanInstruction}
          </p>
        </div>

        {/* 5. Clean, Bright White High-Contrast QR Code Area (Below Hero Photo, 100% Scannable) */}
        <div className="relative z-20 p-3.5 bg-white rounded-2xl border-2 border-amber-400/80 shadow-2xl flex items-center justify-center my-1">
          <img 
            src={qrImageUrl} 
            alt={`QR Code ${title}`} 
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
          />
        </div>

        {/* 6. URL Chip */}
        <div className="w-full bg-black/60 backdrop-blur-md border border-white/20 rounded-xl py-1.5 px-3 mt-3.5 z-20 flex items-center justify-between gap-2">
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
