import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Download, Copy, Check, Camera
} from 'lucide-react';
import { sanitizeFilename } from '../../utils/zipExport';
import { QR_THEMES, resolveEventQrTheme } from '../../utils/qrTheme';
import { DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';
import MonochromeFloralOrnament from './MonochromeFloralOrnament';
import { useToast } from './Toast';

export default function TentCardModal({ isOpen, onClose, event }) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState('pureQr'); // 'pureQr' | 'kartuMeja'
  const [selectedThemeKey, setSelectedThemeKey] = useState('auto'); // 'auto' | 'burgundy' | 'ivory' | 'neon' | 'slate'
  const [layoutMode, setLayoutMode] = useState('foldable'); // 'foldable' | 'single'
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const printAreaRef = useRef(null);

  if (!isOpen || !event) return null;

  const activeTheme = resolveEventQrTheme(event, selectedThemeKey);
  const coupleName = event.displayName || 'Sabrina & Raka';
  const isWedding = (event.eventType || 'wedding') === 'wedding';
  const eventSubtitle = isWedding 
    ? 'THE WEDDING CELEBRATION OF' 
    : (event.eventType === 'concert' 
        ? 'OFFICIAL FESTIVAL PHOTOBOOTH' 
        : (event.eventType === 'exhibition' 
            ? 'EXHIBITION PHOTOBOOTH' 
            : 'OFFICIAL EVENT PHOTOBOOTH'));
  const eventDate = event.formattedDate || event.eventDate || (isWedding ? 'Hari Bahagia' : 'Tanggal Acara');
  const eventVenue = event.venue || (isWedding ? 'Wedding Venue' : 'Event Venue');
  const eventUrl = `${window.location.origin}/${event.slug}`;
  const coverPhoto = event?.heroPhotos?.[0] || DEFAULT_HERO_PHOTOS[0];
  
  // Clean QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=${encodeURIComponent(eventUrl)}&color=000000&bgcolor=ffffff&margin=1`;

  // Download Pure QR Code PNG Only (Zero Border, Zero Ornaments, Zero Photos/Titles)
  const handleDownloadPureQr = () => {
    const a = document.createElement('a');
    a.download = `QRCode_${sanitizeFilename(coupleName)}.png`;
    a.href = qrCodeUrl;
    a.click();
    toast('Aset Pure QR Code (PNG HD) berhasil diunduh', 'success');
  };

  // Handle native browser print
  const handlePrint = () => {
    window.print();
  };

  // Handle copy event URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(eventUrl);
    setIsCopied(true);
    toast('Link photobooth berhasil disalin', 'success');
    setTimeout(() => setIsCopied(false), 2500);
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

  // High-Res 300DPI PNG Canvas Generator for Kartu Meja
  const handleDownloadPng = async () => {
    if (viewMode === 'pureQr') {
      handleDownloadPureQr();
      return;
    }
    setIsExportingPng(true);
    toast('Merender kartu meja cetak HD...', 'info');

    const filename = `KartuMeja_QR_${sanitizeFilename(coupleName)}.png`;
    const exported = await exportDomToPng(printAreaRef.current, filename);

    if (exported) {
      setIsExportingPng(false);
      toast('Kartu meja cetak HD berhasil diunduh', 'success');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      const isFold = layoutMode === 'foldable';
      canvas.width = 1200;
      canvas.height = isFold ? 2400 : 1200;
      const ctx = canvas.getContext('2d');

      ctx.fillStyle = activeTheme.canvasBgHex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawCardSide = async (topY, height) => {
        const centerY = topY;

        if (coverPhoto) {
          await new Promise((resolve) => {
            const bgImg = new Image();
            bgImg.crossOrigin = 'anonymous';
            bgImg.onload = () => {
              ctx.save();
              ctx.globalAlpha = 0.32;
              const scaleFactor = 1.4;
              const aspect = bgImg.width / bgImg.height;
              let dw = canvas.width * scaleFactor;
              let dh = (canvas.width / aspect) * scaleFactor;
              if (dh < height * scaleFactor) {
                dh = height * scaleFactor;
                dw = (height * aspect) * scaleFactor;
              }
              const dx = (canvas.width - dw) / 2;
              const dy = centerY + (height - dh) / 2;
              ctx.drawImage(bgImg, dx, dy, dw, dh);
              ctx.restore();
              resolve();
            };
            bgImg.onerror = resolve;
            bgImg.src = coverPhoto;
          });
        }

        const grad = ctx.createLinearGradient(0, centerY, 0, centerY + height);
        const [r, g, b] = (activeTheme.canvasOverlayRgb || '59, 6, 13').split(',').map(n => n.trim());
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.75)`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.85)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.95)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, centerY, canvas.width, height);

        ctx.strokeStyle = activeTheme.goldAccent;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(36, centerY + 36, canvas.width - 72, height - 72);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(48, centerY + 48, canvas.width - 96, height - 96);

        ctx.fillStyle = activeTheme.canvasAccentHex;
        ctx.font = '500 22px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '4px';
        ctx.fillText(eventSubtitle, canvas.width / 2, centerY + 110);

        ctx.fillStyle = activeTheme.canvasTextHex;
        ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(coupleName, canvas.width / 2, centerY + 180);

        ctx.fillStyle = activeTheme.canvasSubtextHex;
        ctx.font = '19px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(`${eventDate.toUpperCase()} • ${eventVenue.toUpperCase()}`, canvas.width / 2, centerY + 220);

        await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const qrSize = 360;
            const qrX = (canvas.width - qrSize) / 2;
            const qrY = centerY + 270;

            // Draw rounded white QR container
            ctx.fillStyle = '#FFFFFF';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 24);
              ctx.fill();
              ctx.strokeStyle = activeTheme.goldAccent;
              ctx.lineWidth = 3;
              ctx.stroke();
            } else {
              ctx.fillRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
            }

            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          img.onerror = resolve;
          img.src = qrCodeUrl;
        });

        // URL Pill Bar
        const pillW = 400;
        const pillH = 44;
        const pillX = (canvas.width - pillW) / 2;
        const pillY = centerY + 780;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(pillX, pillY, pillW, pillH, 16);
          ctx.fill();
        } else {
          ctx.fillRect(pillX, pillY, pillW, pillH);
        }

        ctx.fillStyle = '#E2E8F0';
        ctx.font = '16px monospace';
        ctx.fillText(`sirklenice.com/${event.slug}`, canvas.width / 2, pillY + 28);
      };

      await drawCardSide(0, 1200);

      if (isFold) {
        ctx.strokeStyle = activeTheme.goldAccent;
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.moveTo(0, 1200);
        ctx.lineTo(1200, 1200);
        ctx.stroke();
        ctx.setLineDash([]);

        await drawCardSide(1200, 1200);
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = filename;
        a.href = blobUrl;
        a.click();
        setIsExportingPng(false);
        toast('Kartu meja cetak HD berhasil diunduh', 'success');
      }, 'image/png');

    } catch (e) {
      setIsExportingPng(false);
      handlePrint();
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-xl bg-stone-950 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-white flex flex-col max-h-[92vh]"
        >
          {/* Top Modal Controls Header */}
          <div className="px-5 py-4 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <Printer size={18} className="text-amber-400" />
              <h3 className="text-sm font-serif font-bold text-amber-200">
                {viewMode === 'pureQr' ? 'Mode 1: QR Code Murni (Aset Minimalis)' : 'Mode 2: Generator Kartu Meja Full Design'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Primary View Mode Switcher (1. QR Code vs 2. Kartu Meja) */}
          <div className="px-5 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-center gap-2 text-xs flex-shrink-0">
            <button
              onClick={() => setViewMode('pureQr')}
              className={`flex-1 py-2 px-3 rounded-xl font-serif font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === 'pureQr'
                  ? 'bg-[#6B111F] text-[#F5D77F] border border-amber-400/40 shadow-sm'
                  : 'bg-stone-800/80 text-stone-400 hover:text-white'
              }`}
            >
              <span>1. QR Code (Murni)</span>
            </button>

            <button
              onClick={() => setViewMode('kartuMeja')}
              className={`flex-1 py-2 px-3 rounded-xl font-serif font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === 'kartuMeja'
                  ? 'bg-[#6B111F] text-[#F5D77F] border border-amber-400/40 shadow-sm'
                  : 'bg-stone-800/80 text-stone-400 hover:text-white'
              }`}
            >
              <span>2. Kartu Meja (Full Design)</span>
            </button>
          </div>

          {/* Interactive Preview Area */}
          <div className="p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-center bg-black/60 min-h-[360px]">
            
            {/* Mode 1: QR Code Murni (Zero Border, Zero Ornaments, Zero Photos, Zero Titles, Zero URLs, Zero Extra Text) */}
            {viewMode === 'pureQr' ? (
              <div className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center">
                <img 
                  src={qrCodeUrl} 
                  alt={`Pure QR Code ${coupleName}`} 
                  className="w-56 h-56 object-contain"
                />
              </div>
            ) : (
              /* Mode 2: Kartu Meja Full Design */
              <div 
                id="tent-card-print-area"
                ref={printAreaRef}
                className={`w-full max-w-sm transition-colors duration-200 rounded-2xl p-6 sm:p-8 border relative select-none overflow-hidden ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
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
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80" />
                </div>

                {/* 2. Pure Vector Botanical Corner Flourishes */}
                <MonochromeFloralOrnament variant="corner-tr" className={`absolute -top-3 -right-3 w-28 h-28 ${activeTheme.flourishClass} pointer-events-none z-10`} />
                <MonochromeFloralOrnament variant="corner-tl" className={`absolute -top-3 -left-3 w-28 h-28 ${activeTheme.flourishClass} pointer-events-none z-10`} />
                <MonochromeFloralOrnament variant="corner-br" className={`absolute -bottom-3 -right-3 w-24 h-24 ${activeTheme.flourishClass} pointer-events-none z-10`} />
                <MonochromeFloralOrnament variant="corner-bl" className={`absolute -bottom-3 -left-3 w-24 h-24 ${activeTheme.flourishClass} pointer-events-none z-10`} />

                {/* 3. Double Hairline Thin Gold Borders */}
                <div className="absolute inset-2.5 rounded-xl border border-amber-400/40 pointer-events-none z-10" />
                <div className="absolute inset-4 rounded-lg border border-amber-400/20 pointer-events-none z-10" />

                {/* CARD SIDE A (FRONT) */}
                <div className="relative z-20 flex flex-col items-center text-center py-2">
                  <span className={`text-[10px] font-serif uppercase tracking-[0.25em] block mb-1 font-medium ${activeTheme.headerText}`}>
                    {eventSubtitle}
                  </span>

                  <h2 className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-1 ${activeTheme.titleText}`}>
                    {coupleName}
                  </h2>

                  <p className={`text-[11px] font-sans tracking-wider mb-4 ${activeTheme.subtitleText}`}>
                    {eventDate.toUpperCase()} • {eventVenue.toUpperCase()}
                  </p>

                  <div className="w-16 h-px mb-5 bg-amber-400/50" />

                  <div className="p-3 rounded-2xl border-2 border-amber-400/80 bg-white mb-4 shadow-2xl flex items-center justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR Code ${coupleName}`} 
                      className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-lg"
                    />
                  </div>

                  <div className={`flex items-center gap-1.5 text-xs font-serif font-bold tracking-widest uppercase mb-3 ${activeTheme.headerText}`}>
                    <Camera size={13} />
                    <span>Pindai untuk Berfoto</span>
                  </div>

                  <div className="w-full max-w-[270px] space-y-1.5 text-[11px] text-left mb-4 p-3 rounded-xl border bg-black/40 backdrop-blur-sm border-white/15 text-stone-200">
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-400 text-[10px]">01.</span>
                      <span>Buka kamera di ponsel Anda</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-400 text-[10px]">02.</span>
                      <span>Arahkan lensa ke kode QR di atas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-400 text-[10px]">03.</span>
                      <span>Ambil foto & simpan kenangan Anda</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-gray-300 tracking-wider">
                    sirklenice.com/{event.slug}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Bar Footer */}
          <div className="px-5 py-3 bg-stone-900 border-t border-stone-800 flex items-center justify-between flex-shrink-0">
            {viewMode === 'pureQr' ? (
              <>
                <span className="text-xs text-stone-400">Format: 300 DPI Transparent PNG</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPureQr}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Download size={15} />
                    <span>Download QR Code (PNG HD)</span>
                  </button>
                  <button
                    onClick={() => setViewMode('kartuMeja')}
                    className="px-4 py-2 rounded-xl bg-[#6B111F] hover:bg-[#520C16] text-[#F5D77F] text-xs font-serif font-bold border border-amber-400/30 transition cursor-pointer"
                  >
                    <span>Kartu Meja ➔</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setViewMode('pureQr')}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 text-stone-300 text-xs font-serif font-semibold hover:text-white"
                >
                  <span>← QR Code Murni</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadPng}
                    disabled={isExportingPng}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  >
                    <Download size={15} />
                    <span>{isExportingPng ? 'Merender...' : 'Download Kartu Meja'}</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-serif font-bold border border-white/20"
                  >
                    <Printer size={15} />
                    <span>Cetak PDF</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>

    {/* Print Specific CSS */}
    <style>{`
      @media print {
        body * {
          visibility: hidden !important;
        }
        #tent-card-print-area, #tent-card-print-area * {
          visibility: visible !important;
        }
        #tent-card-print-area {
          position: absolute !important;
          left: 50% !important;
          top: 10px !important;
          transform: translateX(-50%) !important;
          width: 100% !important;
          max-width: 440px !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          page-break-inside: avoid !important;
        }
      }
    `}</style>
  </>
  );
}
