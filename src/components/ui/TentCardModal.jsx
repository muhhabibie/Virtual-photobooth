import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Download, Copy, Check, Camera
} from 'lucide-react';
import { sanitizeFilename } from '../../utils/zipExport';
import { useToast } from './Toast';

export default function TentCardModal({ isOpen, onClose, event }) {
  const { toast } = useToast();
  const [theme, setTheme] = useState('ivory'); // 'ivory' (clean ink-saver) | 'burgundy' (bespoke dark)
  const [layoutMode, setLayoutMode] = useState('foldable'); // 'foldable' | 'single'
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const printAreaRef = useRef(null);

  if (!isOpen || !event) return null;

  const coupleName = event.displayName || 'Sabrina & Raka';
  const eventDate = event.formattedDate || event.eventDate || 'Hari Bahagia';
  const eventVenue = event.venue || 'Wedding Venue';
  const eventUrl = `${window.location.origin}/${event.slug}`;
  
  // Clean QR Code URL without loud styling
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(eventUrl)}&color=${theme === 'burgundy' ? '4A0811' : '1A1A1A'}&bgcolor=ffffff`;

  const isBurgundy = theme === 'burgundy';

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

  // High-Res 300DPI PNG Canvas Generator for WhatsApp sharing to print shops
  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    toast('Merender kartu meja cetak...', 'info');

    try {
      const canvas = document.createElement('canvas');
      const isFold = layoutMode === 'foldable';
      canvas.width = 1200;
      canvas.height = isFold ? 1800 : 1200;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = isBurgundy ? '#4A0811' : '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clean Bespoke Stationery Borders
      ctx.strokeStyle = isBurgundy ? '#C5A059' : '#C4A46C';
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

      ctx.lineWidth = 1;
      ctx.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);

      // Helper function to render a clean, professional card side onto the canvas
      const drawCardSide = async (topY, height) => {
        const centerY = topY;

        // Subtitle
        ctx.fillStyle = isBurgundy ? '#D4AF37' : '#8A1828';
        ctx.font = '500 20px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.letterSpacing = '4px';
        ctx.fillText('THE WEDDING CELEBRATION OF', canvas.width / 2, centerY + 105);

        // Couple Names
        ctx.fillStyle = isBurgundy ? '#FFFFFF' : '#1A1A1A';
        ctx.font = 'bold 52px "Playfair Display", Georgia, serif';
        ctx.letterSpacing = '1px';
        ctx.fillText(coupleName, canvas.width / 2, centerY + 170);

        // Date & Venue
        ctx.fillStyle = isBurgundy ? '#E6D5B8' : '#555555';
        ctx.font = '19px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(`${eventDate.toUpperCase()} • ${eventVenue.toUpperCase()}`, canvas.width / 2, centerY + 208);

        // Thin Accent Divider
        ctx.strokeStyle = isBurgundy ? 'rgba(197, 160, 89, 0.4)' : 'rgba(196, 164, 108, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 120, centerY + 225);
        ctx.lineTo(canvas.width / 2 + 120, centerY + 225);
        ctx.stroke();

        // Load & Draw QR Code
        await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const qrSize = 340;
            const qrX = (canvas.width - qrSize) / 2;
            const qrY = centerY + 255;

            // QR white background & crisp thin border
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

            ctx.strokeStyle = isBurgundy ? '#C5A059' : '#D1D5DB';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          img.onerror = resolve;
          img.src = qrCodeUrl;
        });

        // Clean CTA Text
        ctx.fillStyle = isBurgundy ? '#D4AF37' : '#1A1A1A';
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '3px';
        ctx.fillText('PINDAI KODE QR UNTUK BERFOTO', canvas.width / 2, centerY + 665);

        // 3 Clean Instructions
        ctx.fillStyle = isBurgundy ? '#E5E7EB' : '#4B5563';
        ctx.font = '18px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '0.5px';
        ctx.fillText('01 • Buka kamera di ponsel Anda', canvas.width / 2, centerY + 705);
        ctx.fillText('02 • Arahkan lensa ke kode QR di atas', canvas.width / 2, centerY + 738);
        ctx.fillText('03 • Ambil foto & simpan kenangan Anda', canvas.width / 2, centerY + 771);

        // Subtle Domain Footer
        ctx.fillStyle = isBurgundy ? '#9CA3AF' : '#9CA3AF';
        ctx.font = '14px monospace';
        ctx.letterSpacing = '1px';
        ctx.fillText(`sirklenice.com/${event.slug}`, canvas.width / 2, centerY + 825);
      };

      if (isFold) {
        await drawCardSide(0, 900);

        // Center fold line
        ctx.strokeStyle = isBurgundy ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(60, 900);
        ctx.lineTo(canvas.width - 60, 900);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = isBurgundy ? '#C5A059' : '#888888';
        ctx.font = '13px monospace';
        ctx.letterSpacing = '2px';
        ctx.textAlign = 'center';
        ctx.fillText('— GARIS LIPAT MEJA (FOLD HERE) —', canvas.width / 2, 904);

        await drawCardSide(900, 900);
      } else {
        await drawCardSide(100, 1000);
      }

      // Trigger download
      const cleanCouple = sanitizeFilename(coupleName);
      const filename = `Kartu_Meja_${cleanCouple}.png`;
      const dataUrl = canvas.toDataURL('image/png', 0.98);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast('Desain Kartu Meja berhasil diunduh', 'success');
    } catch (err) {
      console.error(err);
      toast('Gagal memproses gambar kartu meja', 'error');
    } finally {
      setIsExportingPng(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative z-50 w-full max-w-3xl bg-[#140810] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30">
            <div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
                Desain Kartu Meja (Tent Card)
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {coupleName} • Format cetak bersih & profesional untuk meja tamu
              </p>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="px-6 py-3 bg-white/[0.02] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Warna:</span>
              <div className="flex p-0.5 rounded-lg bg-black/60 border border-white/15">
                <button
                  onClick={() => setTheme('ivory')}
                  className={`px-3 py-1 rounded-md text-xs font-serif font-bold transition cursor-pointer ${
                    theme === 'ivory' 
                      ? 'bg-stone-100 text-stone-900 shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Ivory (Hemat Tinta)
                </button>
                <button
                  onClick={() => setTheme('burgundy')}
                  className={`px-3 py-1 rounded-md text-xs font-serif font-bold transition cursor-pointer ${
                    theme === 'burgundy' 
                      ? 'bg-[#4A0811] text-[#E6D5B8] shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Deep Burgundy
                </button>
              </div>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Format:</span>
              <div className="flex p-0.5 rounded-lg bg-black/60 border border-white/15">
                <button
                  onClick={() => setLayoutMode('foldable')}
                  className={`px-3 py-1 rounded-md text-xs font-serif font-bold transition cursor-pointer ${
                    layoutMode === 'foldable' 
                      ? 'bg-amber-400 text-stone-950 shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Lipat Meja
                </button>
                <button
                  onClick={() => setLayoutMode('single')}
                  className={`px-3 py-1 rounded-md text-xs font-serif font-bold transition cursor-pointer ${
                    layoutMode === 'single' 
                      ? 'bg-amber-400 text-stone-950 shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Single A6
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-gray-200 border border-white/10 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{isCopied ? 'Tersalin' : 'Salin URL'}</span>
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 text-xs font-serif font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Download size={14} />
                <span>{isExportingPng ? 'Merender...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
              >
                <Printer size={14} />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Printable Preview Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-black/40">
            <div 
              id="tent-card-print-area"
              ref={printAreaRef}
              className={`w-full max-w-sm transition-colors duration-200 rounded-lg p-6 sm:p-8 border relative select-none ${
                isBurgundy 
                  ? 'bg-[#4A0811] text-[#FFFFFF] border-[#C5A059]' 
                  : 'bg-[#FFFFFF] text-[#1A1A1A] border-[#D1D5DB]'
              }`}
            >
              {/* Clean Double Line Frame */}
              <div className={`absolute inset-2 border pointer-events-none ${
                isBurgundy ? 'border-[#C5A059]/40' : 'border-[#C4A46C]/40'
              }`} />

              {/* CARD SIDE A (FRONT) */}
              <div className="flex flex-col items-center text-center py-2">
                <span className={`text-[10px] font-serif uppercase tracking-[0.25em] block mb-1 font-medium ${
                  isBurgundy ? 'text-[#D4AF37]' : 'text-[#8A1828]'
                }`}>
                  The Wedding Celebration of
                </span>

                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-1">
                  {coupleName}
                </h2>

                <p className={`text-[11px] font-sans tracking-wider mb-4 ${
                  isBurgundy ? 'text-amber-100/70' : 'text-stone-500'
                }`}>
                  {eventDate.toUpperCase()} • {eventVenue.toUpperCase()}
                </p>

                {/* Clean Hairline Accent */}
                <div className={`w-16 h-px mb-5 ${
                  isBurgundy ? 'bg-[#C5A059]/50' : 'bg-[#C4A46C]/50'
                }`} />

                {/* QR Code Container */}
                <div className="p-3 rounded-lg border border-stone-200 bg-white mb-4 shadow-xs">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code ${coupleName}`} 
                    className="w-44 h-44 sm:w-52 sm:h-52 object-contain"
                  />
                </div>

                {/* Clean Call to Action */}
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold tracking-widest uppercase mb-3 text-current">
                  <Camera size={13} />
                  <span>Pindai untuk Berfoto</span>
                </div>

                {/* 3 Step Instruction */}
                <div className={`w-full max-w-[270px] space-y-1.5 text-[11px] text-left mb-4 p-3 rounded-md border ${
                  isBurgundy 
                    ? 'bg-black/20 border-white/10 text-gray-200' 
                    : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-bold text-amber-500 text-[10px]">01.</span>
                    <span>Buka kamera di ponsel Anda</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-bold text-amber-500 text-[10px]">02.</span>
                    <span>Arahkan lensa ke kode QR di atas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-bold text-amber-500 text-[10px]">03.</span>
                    <span>Ambil foto & simpan kenangan Anda</span>
                  </div>
                </div>

                {/* Minimalist Footnote */}
                <p className="text-[10px] font-mono text-gray-400 tracking-wider">
                  sirklenice.com/{event.slug}
                </p>
              </div>

              {/* FOLD LINE (Only for Foldable Mode) */}
              {layoutMode === 'foldable' && (
                <div className="my-8 relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t border-dashed ${
                      isBurgundy ? 'border-white/20' : 'border-black/20'
                    }`} />
                  </div>
                  <span className={`relative px-3 py-0.5 text-[9px] font-mono tracking-widest uppercase ${
                    isBurgundy 
                      ? 'bg-[#4A0811] text-amber-200' 
                      : 'bg-[#FFFFFF] text-stone-500'
                  }`}>
                    — GARIS LIPAT MEJA —
                  </span>
                </div>
              )}

              {/* CARD SIDE B (BACK / INVERTED FOR OPPOSITE TABLE VIEW) */}
              {layoutMode === 'foldable' && (
                <div className="flex flex-col items-center text-center py-2">
                  <span className={`text-[10px] font-serif uppercase tracking-[0.25em] block mb-1 font-medium ${
                    isBurgundy ? 'text-[#D4AF37]' : 'text-[#8A1828]'
                  }`}>
                    Terima Kasih Atas Kehadiran Anda
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-1">
                    {coupleName}
                  </h2>

                  <p className={`text-[11px] font-sans tracking-wider mb-4 ${
                    isBurgundy ? 'text-amber-100/70' : 'text-stone-500'
                  }`}>
                    Abadikan momen Anda bersama kami hari ini
                  </p>

                  <div className={`w-16 h-px mb-5 ${
                    isBurgundy ? 'bg-[#C5A059]/50' : 'bg-[#C4A46C]/50'
                  }`} />

                  {/* QR Code Container */}
                  <div className="p-3 rounded-lg border border-stone-200 bg-white mb-3 shadow-xs">
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR Code ${coupleName}`} 
                      className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                    />
                  </div>

                  <p className={`text-[11px] font-serif font-semibold tracking-wider ${
                    isBurgundy ? 'text-[#D4AF37]' : 'text-[#8A1828]'
                  }`}>
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
