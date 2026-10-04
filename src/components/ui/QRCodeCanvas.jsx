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
  const [viewMode, setViewMode] = useState('pureQr'); // 'pureQr' | 'kartuMeja'
  const [selectedThemeKey, setSelectedThemeKey] = useState('auto');
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef(null);

  const activeTheme = resolveEventQrTheme(event, selectedThemeKey);
  const targetUrl = url || (event ? `${window.location.origin}/${event.slug}` : window.location.href);
  const title = displayName || event?.displayName || 'Sirklen Photo Event';
  const coverPhoto = event?.heroPhotos?.[0] || DEFAULT_HERO_PHOTOS[0];

  // Clean pure QR Code image URL (Black on White)
  const pureQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(targetUrl)}&color=000000&bgcolor=ffffff&margin=1`;
  
  // Theme styled QR Code URL for Kartu Meja
  const cardQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(targetUrl)}&color=${activeTheme.qrColor}&bgcolor=${activeTheme.bgColor}&margin=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    toast('Link QR Code berhasil disalin', 'success');
    setTimeout(() => setIsCopied(false), 2200);
  };

  // Mode 1 Download: Pure QR Code Only
  const handleDownloadPureQr = () => {
    const a = document.createElement('a');
    a.download = `PureQRCode_${(title || 'Event').replace(/\s+/g, '_')}.png`;
    a.href = pureQrImageUrl;
    a.click();
    toast('Aset Pure QR Code (PNG HD) berhasil diunduh', 'success');
  };

  // DOM to PNG rasterizer for 100% exact visual match with web preview
  const exportDomToPng = async (element, filename) => {
    if (!element) return false;
    try {
      const width = element.offsetWidth || 360;
      const height = element.offsetHeight || 520;
      const scale = 3; // 300 DPI HD

      const clone = element.cloneNode(true);
      const wrapper = document.createElement('div');
      wrapper.style.width = width + 'px';
      wrapper.style.height = height + 'px';
      wrapper.appendChild(clone);

      const imgs = clone.querySelectorAll('img');
      for (const img of imgs) {
        if (img.src && !img.src.startsWith('data:')) {
          const dataUrl = await new Promise((resolve) => {
            const tempImg = new Image();
            tempImg.crossOrigin = 'anonymous';
            tempImg.onload = () => {
              try {
                const c = document.createElement('canvas');
                c.width = tempImg.naturalWidth || tempImg.width || 300;
                c.height = tempImg.naturalHeight || tempImg.height || 300;
                const ctx = c.getContext('2d');
                ctx.drawImage(tempImg, 0, 0);
                resolve(c.toDataURL('image/png'));
              } catch (e) {
                resolve(img.src);
              }
            };
            tempImg.onerror = () => resolve(img.src);
            tempImg.src = img.src;
          });
          img.src = dataUrl;
        }
      }

      const serialized = new XMLSerializer().serializeToString(wrapper);
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
              * { box-sizing: border-box; }
            </style>
            ${serialized}
          </div>
        </foreignObject>
      </svg>`;

      const base64Svg = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
      const imgNode = new Image();

      return await new Promise((resolve) => {
        imgNode.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(imgNode, 0, 0);

          canvas.toBlob((blob) => {
            if (blob) {
              const a = document.createElement('a');
              a.download = filename;
              a.href = URL.createObjectURL(blob);
              a.click();
              resolve(true);
            } else {
              resolve(false);
            }
          }, 'image/png');
        };
        imgNode.onerror = (err) => {
          console.warn('SVG imgNode load error:', err);
          resolve(false);
        };
        imgNode.src = base64Svg;
      });
    } catch (e) {
      console.error('DOM export error', e);
      return false;
    }
  };

  const handleDownloadHD = async () => {
    if (viewMode === 'pureQr') {
      handleDownloadPureQr();
      return;
    }

    toast('Merender kartu meja cetak HD...', 'info');
    const filename = `KartuMeja_${(title || 'Event').replace(/\s+/g, '_')}.png`;
    const success = await exportDomToPng(containerRef.current, filename);
    if (success) {
      toast('Kartu meja cetak HD berhasil diunduh', 'success');
    } else {
      handleDownloadPureQr();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      
      {/* Primary View Mode Switcher Pills (1. QR Code Murni vs 2. Kartu Meja) */}
      <div className="w-full flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-stone-900 border border-stone-800 mb-4 text-xs font-serif font-bold">
        <button
          onClick={() => setViewMode('pureQr')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer ${
            viewMode === 'pureQr'
              ? 'bg-[#6B111F] text-[#F5D77F] border border-amber-400/40 shadow-xs'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          1. QR Code (Murni)
        </button>

        <button
          onClick={() => setViewMode('kartuMeja')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer ${
            viewMode === 'kartuMeja'
              ? 'bg-[#6B111F] text-[#F5D77F] border border-amber-400/40 shadow-xs'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          2. Kartu Meja (Full Design)
        </button>
      </div>

      {viewMode === 'pureQr' ? (
        /* Mode 1: QR Code Murni (Zero Border, Zero Ornaments, Zero Photos, Zero Titles, Zero URLs, Zero Extra Text) */
        <div className="w-full p-6 rounded-3xl bg-white border border-stone-200 shadow-xl flex flex-col items-center justify-center text-center">
          <img 
            src={pureQrImageUrl} 
            alt={`Pure QR Code ${title}`} 
            className="w-56 h-56 object-contain"
          />
          {showDownload && (
            <button
              onClick={handleDownloadPureQr}
              className="w-full mt-5 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Download size={15} />
              <span>Download Pure QR (PNG HD)</span>
            </button>
          )}
        </div>
      ) : (
        /* Mode 2: Kartu Meja Full Design */
        <div 
          ref={containerRef} 
          className={`w-full p-5 sm:p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative flex flex-col items-center text-center overflow-hidden ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
        >
          {/* 1. Large Subtle Background Portrait Watermark */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {coverPhoto && (
              <img 
                src={coverPhoto} 
                alt="" 
                className="w-full h-full object-cover object-center scale-150 filter blur-[1.5px] opacity-35 mix-blend-overlay" 
              />
            )}
            <div className={`absolute inset-0 bg-gradient-to-b ${activeTheme.overlayGradient}`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-stone-950/40 to-stone-950/80" />
          </div>

          {/* 2. Pure Vector Botanical Corner Flourishes */}
          <MonochromeFloralOrnament variant="corner-tr" className={`absolute -top-3 -right-3 w-32 h-32 ${activeTheme.flourishClass} pointer-events-none z-10`} />
          <MonochromeFloralOrnament variant="corner-tl" className={`absolute -top-3 -left-3 w-32 h-32 ${activeTheme.flourishClass} pointer-events-none z-10`} />
          <MonochromeFloralOrnament variant="corner-br" className={`absolute -bottom-3 -right-3 w-28 h-28 ${activeTheme.flourishClass} pointer-events-none z-10`} />
          <MonochromeFloralOrnament variant="corner-bl" className={`absolute -bottom-3 -left-3 w-28 h-28 ${activeTheme.flourishClass} pointer-events-none z-10`} />

          {/* 3. Double Hairline Thin Gold Borders */}
          <div className="absolute inset-2.5 rounded-2xl border border-amber-400/40 pointer-events-none z-10" />
          <div className="absolute inset-4 rounded-xl border border-amber-400/20 pointer-events-none z-10" />

          {/* 4. Brand Header & Event Title */}
          <div className="flex flex-col items-center z-20 mb-3 pt-1">
            <div className="flex items-center gap-1.5 mb-1">
              <img src={logoPhotobooth} alt="Sirklen Photo" className="w-5 h-5 object-contain" />
              <span className={`text-[10px] font-mono tracking-widest uppercase font-bold ${activeTheme.headerText}`}>
                SIRKLEN PHOTO
              </span>
            </div>

            <h4 className={`text-xl sm:text-2xl font-bold tracking-tight ${activeTheme.titleText} ${activeTheme.fontStyle}`}>
              {title}
            </h4>

            <p className={`text-xs font-serif italic mt-0.5 ${activeTheme.subtitleText}`}>
              {activeTheme.scanInstruction}
            </p>
          </div>

          {/* 5. Clean, Bright White High-Contrast QR Code Area */}
          <div className="relative z-20 p-3.5 bg-white rounded-2xl border-2 border-amber-400/80 shadow-2xl flex items-center justify-center my-1">
            <img 
              src={cardQrImageUrl} 
              alt={`QR Code ${title}`} 
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
            />
          </div>

          {/* 6. URL Chip */}
          <div className="w-full bg-black/50 backdrop-blur-md border border-white/20 rounded-xl py-1.5 px-3 mt-3.5 z-20 flex items-center justify-between gap-2">
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
                <span>Download Kartu Meja</span>
              </button>

              {onOpenTentCard ? (
                <button
                  onClick={onOpenTentCard}
                  className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-amber-400/40 text-amber-200 text-xs font-serif font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Pratinjau Lipat</span>
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
      )}

      {/* Theme Presets Switcher (If showOptions enabled & Mode 2 active) */}
      {showOptions && viewMode === 'kartuMeja' && (
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
