import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Download, Copy, Check, Camera
} from 'lucide-react';
import { sanitizeFilename } from '../../utils/zipExport';
import { QR_THEMES, resolveEventQrTheme } from '../../utils/qrTheme';
import { DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';
import MonochromeFloralOrnament from './MonochromeFloralOrnament';
import RibbonBowOrnament from './RibbonBowOrnament';
import { useToast } from './Toast';

export default function TentCardModal({ isOpen, onClose, event }) {
  const { toast } = useToast();
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
  
  // Clean QR Code URL without loud styling
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(eventUrl)}&color=${activeTheme.qrColor}&bgcolor=ffffff&margin=1`;

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

  // High-Res 300DPI PNG Canvas Generator for WhatsApp sharing & print shops
  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    toast('Merender kartu meja cetak HD...', 'info');

    try {
      const canvas = document.createElement('canvas');
      const isFold = layoutMode === 'foldable';
      canvas.width = 1200;
      canvas.height = isFold ? 2400 : 1200;
      const ctx = canvas.getContext('2d');

      // 1. Base Theme Fill Background
      ctx.fillStyle = activeTheme.canvasBgHex;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Helper function to render a clean, professional card side onto the canvas
      const drawCardSide = async (topY, height) => {
        const centerY = topY;

        // 1. Base Dark Theme Fill
        ctx.fillStyle = activeTheme.canvasBgHex;
        ctx.fillRect(0, centerY, canvas.width, height);

        // 4. Double Line Hairline Gold Borders
        ctx.strokeStyle = activeTheme.goldAccent;
        ctx.lineWidth = 3.5;
        ctx.strokeRect(36, centerY + 36, canvas.width - 72, height - 72);

        ctx.lineWidth = 1.2;
        ctx.strokeRect(48, centerY + 48, canvas.width - 96, height - 96);

        // 5. Card Subtitle, Title & Date
        ctx.fillStyle = activeTheme.canvasAccentHex;
        ctx.font = '500 22px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '4px';
        ctx.fillText(`${eventSubtitle} • ${eventDate.toUpperCase()}`, canvas.width / 2, centerY + 110);

        ctx.fillStyle = activeTheme.canvasTextHex;
        ctx.font = 'bold 54px "Playfair Display", Georgia, serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(coupleName, canvas.width / 2, centerY + 180);

        // Poetic Quote Lines (Reference kisahkan style)
        if (activeTheme.poeticQuoteLines && activeTheme.poeticQuoteLines.length > 0) {
          ctx.fillStyle = activeTheme.canvasSubtextHex;
          ctx.font = 'italic 18px "Georgia", serif';
          let lineY = centerY + 222;
          activeTheme.poeticQuoteLines.forEach((line) => {
            ctx.fillText(line, canvas.width / 2, lineY);
            lineY += 24;
          });
        }

        // 6. Clean White High Contrast QR Code Container
        await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const qrSize = 360;
            const qrX = (canvas.width - qrSize) / 2;
            const qrY = centerY + 320;

            // Pure Bright White Background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

            ctx.strokeStyle = activeTheme.goldAccent;
            ctx.lineWidth = 2;
            ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          img.onerror = resolve;
          img.src = qrCodeUrl;
        });

        // 7. CTA Text & Instructions
        ctx.fillStyle = activeTheme.canvasAccentHex;
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('PINDAI KODE QR UNTUK BERFOTO & KIRIM DOA', canvas.width / 2, centerY + 740);

        ctx.fillStyle = activeTheme.canvasSubtextHex;
        ctx.font = '18px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '0.5px';
        ctx.fillText('01 • Buka kamera di ponsel Anda', canvas.width / 2, centerY + 785);
        ctx.fillText('02 • Arahkan lensa ke kode QR di atas', canvas.width / 2, centerY + 820);
        ctx.fillText('03 • Ambil foto & simpan kenangan Anda', canvas.width / 2, centerY + 855);

        ctx.fillStyle = activeTheme.canvasSubtextHex;
        ctx.font = '14px monospace';
        ctx.letterSpacing = '1px';
        ctx.fillText(`sirklenice.com/${event.slug}`, canvas.width / 2, centerY + 910);
      };

      // Draw Side A (Front)
      await drawCardSide(0, 1200);

      // Draw Side B (Back) if Foldable
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

      // Export Canvas to HD PNG File
      canvas.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `KartuMeja_QR_${sanitizeFilename(coupleName)}.png`;
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
                Generator Kartu Meja (Tent Card)
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Action Bar (Layout & Theme Switcher) */}
          <div className="px-5 py-3 bg-stone-900/50 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
            
            {/* Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900 border border-stone-800">
              <button
                onClick={() => setLayoutMode('foldable')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  layoutMode === 'foldable'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Kartu Lipat Meja (2 Sisi)
              </button>
              <button
                onClick={() => setLayoutMode('single')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  layoutMode === 'single'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Kartu Tunggal (1 Sisi)
              </button>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 text-xs font-serif font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Download size={14} />
                <span>{isExportingPng ? 'Merender...' : 'Download PNG HD'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Printer size={14} />
                <span>Cetak PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Printable Preview Area */}
          <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-black/60">
            <div 
              id="tent-card-print-area"
              ref={printAreaRef}
              className={`w-full max-w-sm transition-colors duration-200 rounded-2xl p-6 sm:p-8 border relative select-none overflow-hidden ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
            >
              


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
                  {eventSubtitle} • {eventDate}
                </span>

                <h2 className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-1 drop-shadow-md ${activeTheme.titleText}`}>
                  {coupleName}
                </h2>

                {/* Poetic Quote Lines */}
                {activeTheme.poeticQuoteLines && activeTheme.poeticQuoteLines.length > 0 && (
                  <div className="my-1.5 space-y-0.5 max-w-[270px] mx-auto">
                    {activeTheme.poeticQuoteLines.map((line, idx) => (
                      <p key={idx} className="text-[10px] font-serif italic text-amber-200/90 leading-tight drop-shadow-xs">
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                {/* Hairline Accent */}
                <div className="w-16 h-px mb-4 bg-amber-400/50" />

                {/* Bright Clean White High Contrast QR Container (100% Scannable) */}
                <div className="p-3 rounded-2xl border-2 border-amber-400/80 bg-white mb-3 shadow-2xl flex items-center justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code ${coupleName}`} 
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-lg"
                  />
                </div>

                {/* Bottom Ribbon Bows Line Art */}
                <RibbonBowOrnament className="my-1 text-amber-300/75" count={4} />

                {/* CTA Text & Instructions */}
                <div className={`flex items-center gap-1.5 text-xs font-serif font-bold tracking-widest uppercase mb-2 ${activeTheme.headerText}`}>
                  <Camera size={13} />
                  <span>Pindai untuk Berfoto</span>
                </div>

                <div className="w-full max-w-[270px] space-y-1 text-[10px] text-left mb-3 p-2.5 rounded-xl border bg-black/50 backdrop-blur-md border-white/15 text-stone-200">
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

              {/* FOLD LINE (Only for Foldable Mode) */}
              {layoutMode === 'foldable' && (
                <div className="my-8 relative flex items-center justify-center z-20">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-dashed border-amber-400/40" />
                  </div>
                  <span className="relative px-3 py-0.5 text-[9px] font-mono tracking-widest uppercase bg-stone-950 text-amber-300 rounded-full border border-amber-400/40">
                    — GARIS LIPAT MEJA —
                  </span>
                </div>
              )}

              {/* CARD SIDE B (BACK / INVERTED FOR OPPOSITE TABLE VIEW) */}
              {layoutMode === 'foldable' && (
                <div className="relative z-20 flex flex-col items-center text-center py-2">


                  <span className={`text-[10px] font-serif uppercase tracking-[0.25em] block mb-1 font-medium z-10 ${activeTheme.headerText}`}>
                    {isWedding ? 'Terima Kasih Atas Kehadiran Anda' : 'Official Event Photobooth'}
                  </span>

                  <h2 className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-1 z-10 drop-shadow-md ${activeTheme.titleText}`}>
                    {coupleName}
                  </h2>

                  <p className={`text-[11px] font-sans tracking-wider mb-3 z-10 ${activeTheme.subtitleText}`}>
                    Abadikan momen Anda bersama kami hari ini
                  </p>

                  <div className="w-16 h-px mb-4 bg-amber-400/50 z-10" />

                  {/* Bright Clean White High Contrast QR Container */}
                  <div className="p-3 rounded-2xl border-2 border-amber-400/80 bg-white mb-3 shadow-2xl flex items-center justify-center z-10">
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR Code ${coupleName}`} 
                      className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-lg"
                    />
                  </div>

                  {/* Bottom Ribbon Bows */}
                  <RibbonBowOrnament className="my-1 text-amber-300/75 z-10" count={4} />

                  <p className={`text-[11px] font-serif font-semibold tracking-wider z-10 ${activeTheme.headerText}`}>
                    Pindai untuk Berfoto & Kirim Doa
                  </p>
                </div>
              )}

            </div>
          </div>
        </motion.div>
      </div>

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
    </AnimatePresence>
  );
}
