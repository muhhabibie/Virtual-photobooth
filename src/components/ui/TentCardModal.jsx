import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Printer, Download, Copy, Check, Sparkles, Layers, 
  Palette, Smartphone, Heart, ArrowRight
} from 'lucide-react';
import { sanitizeFilename } from '../../utils/zipExport';
import { useToast } from './Toast';
import MonochromeFloralOrnament from './MonochromeFloralOrnament';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function TentCardModal({ isOpen, onClose, event }) {
  const { toast } = useToast();
  const [theme, setTheme] = useState('ivory'); // 'ivory' (clean ink-saver) | 'burgundy' (regal dark)
  const [layoutMode, setLayoutMode] = useState('foldable'); // 'foldable' | 'single'
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);

  const printAreaRef = useRef(null);

  if (!isOpen || !event) return null;

  const coupleName = event.displayName || 'Sabrina & Raka';
  const eventDate = event.formattedDate || event.eventDate || 'Hari Bahagia';
  const eventVenue = event.venue || 'Wedding Venue';
  const eventUrl = `${window.location.origin}/${event.slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(eventUrl)}&color=${theme === 'burgundy' ? '520C16' : '1A1A1A'}&bgcolor=ffffff`;

  const isBurgundy = theme === 'burgundy';

  // Handle native browser print
  const handlePrint = () => {
    window.print();
  };

  // Handle copy event URL
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(eventUrl);
    setIsCopied(true);
    toast('Link photobooth berhasil disalin!', 'success');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // High-Res 300DPI PNG Canvas Generator for WhatsApp sharing to print shops
  const handleDownloadPng = async () => {
    setIsExportingPng(true);
    toast('Merender desain kartu meja resolusi tinggi...', 'info');

    try {
      const canvas = document.createElement('canvas');
      const isFold = layoutMode === 'foldable';
      // 1200 x 1800 px (Crisp print ready)
      canvas.width = 1200;
      canvas.height = isFold ? 1800 : 1200;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = isBurgundy ? '#5A0D18' : '#FCFAF7';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border outer
      ctx.strokeStyle = isBurgundy ? '#E5C158' : '#C4A46C';
      ctx.lineWidth = 8;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Inner double line
      ctx.lineWidth = 2;
      ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

      // Helper function to render a single card side onto the canvas
      const drawCardSide = async (topY, height, isFlipped = false) => {
        ctx.save();
        if (isFlipped) {
          ctx.translate(canvas.width / 2, topY + height / 2);
          ctx.rotate(Math.PI);
          ctx.translate(-canvas.width / 2, -(topY + height / 2));
        }

        const centerY = topY;

        // Subtitle
        ctx.fillStyle = isBurgundy ? '#F5D77F' : '#8A1828';
        ctx.font = 'italic 24px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('The Wedding Celebration of', canvas.width / 2, centerY + 100);

        // Couple Names
        ctx.fillStyle = isBurgundy ? '#FFFFFF' : '#1F2937';
        ctx.font = 'bold 54px Georgia, serif';
        ctx.fillText(coupleName, canvas.width / 2, centerY + 165);

        // Date & Venue
        ctx.fillStyle = isBurgundy ? '#F5D77F' : '#6B7280';
        ctx.font = '22px Arial, sans-serif';
        ctx.fillText(`${eventDate} • ${eventVenue}`, canvas.width / 2, centerY + 205);

        // Load & Draw QR Code
        await new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const qrSize = 340;
            const qrX = (canvas.width - qrSize) / 2;
            const qrY = centerY + 245;

            // QR white background & border
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0,0,0,0.15)';
            ctx.shadowBlur = 15;
            ctx.fillRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);
            ctx.shadowBlur = 0;

            ctx.strokeStyle = isBurgundy ? '#E5C158' : '#C4A46C';
            ctx.lineWidth = 3;
            ctx.strokeRect(qrX - 15, qrY - 15, qrSize + 30, qrSize + 30);

            ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          img.onerror = resolve;
          img.src = qrCodeUrl;
        });

        // CTA Label
        ctx.fillStyle = isBurgundy ? '#F5D77F' : '#8A1828';
        ctx.font = 'bold 28px Arial, sans-serif';
        ctx.fillText('📸 SCAN ME & BERFOTO', canvas.width / 2, centerY + 650);

        // 3 Instructions
        ctx.fillStyle = isBurgundy ? '#E5E7EB' : '#374151';
        ctx.font = '20px Arial, sans-serif';
        ctx.fillText('1. Arahkan kamera HP ke QR Code', canvas.width / 2, centerY + 695);
        ctx.fillText('2. Pilih bingkai estetik & pose terbaikmu', canvas.width / 2, centerY + 730);
        ctx.fillText('3. Simpan foto ke galeri & kirim doa restu', canvas.width / 2, centerY + 765);

        // Footer note
        ctx.fillStyle = isBurgundy ? '#9CA3AF' : '#9CA3AF';
        ctx.font = '16px monospace';
        ctx.fillText(`sirklenice.com/${event.slug} • Sirklen Photo`, canvas.width / 2, centerY + 825);

        ctx.restore();
      };

      if (isFold) {
        // Top half (flipped for opposite table view)
        await drawCardSide(0, 900, false);

        // Center fold line
        ctx.strokeStyle = isBurgundy ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([12, 8]);
        ctx.beginPath();
        ctx.moveTo(60, 900);
        ctx.lineTo(canvas.width - 60, 900);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = isBurgundy ? '#F5D77F' : '#6B7280';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✂️ GARIS LIPAT MEJA (FOLD HERE) ✂️', canvas.width / 2, 905);

        // Bottom half
        await drawCardSide(900, 900, false);
      } else {
        await drawCardSide(100, 1000, false);
      }

      // Trigger download
      const cleanCouple = sanitizeFilename(coupleName);
      const filename = `TentCard_Meja_${cleanCouple}.png`;
      const dataUrl = canvas.toDataURL('image/png', 0.96);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast('Desain Kartu Meja HD berhasil diunduh!', 'success');
    } catch (err) {
      console.error(err);
      toast('Gagal membuat gambar kartu meja', 'error');
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
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-50 w-full max-w-4xl bg-[#140810] border border-amber-400/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                  SIAP CETAK MEJA
                </span>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                  Desain Kartu Meja (Tent Card)
                </h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {coupleName} • Letakkan di meja tamu agar langsung scan & berfoto
              </p>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Controls Bar */}
          <div className="px-6 py-3 bg-white/[0.03] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Tema Cetak:</span>
              <div className="flex p-0.5 rounded-xl bg-black/60 border border-white/15">
                <button
                  onClick={() => setTheme('ivory')}
                  className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition ${
                    theme === 'ivory' 
                      ? 'bg-amber-100 text-stone-900 shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🕊️ Ivory (Hemat Tinta)
                </button>
                <button
                  onClick={() => setTheme('burgundy')}
                  className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition ${
                    theme === 'burgundy' 
                      ? 'bg-[#6B111F] text-[#F5D77F] shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  👑 Royal Burgundy
                </button>
              </div>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-mono">Format:</span>
              <div className="flex p-0.5 rounded-xl bg-black/60 border border-white/15">
                <button
                  onClick={() => setLayoutMode('foldable')}
                  className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition ${
                    layoutMode === 'foldable' 
                      ? 'bg-amber-400 text-stone-950 shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📐 Lipat Meja (Tent)
                </button>
                <button
                  onClick={() => setLayoutMode('single')}
                  className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition ${
                    layoutMode === 'single' 
                      ? 'bg-amber-400 text-stone-950 shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🖼️ Single A6 (Pigura)
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-gray-200 border border-white/10 flex items-center gap-1.5 transition active:scale-95"
              >
                {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{isCopied ? 'Tersalin' : 'Salin URL'}</span>
              </button>

              <button
                onClick={handleDownloadPng}
                disabled={isExportingPng}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Download size={14} />
                <span>{isExportingPng ? 'Merender...' : 'Download PNG HD'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950/40 transition active:scale-95 cursor-pointer"
              >
                <Printer size={15} />
                <span>Cetak / PDF</span>
              </button>
            </div>
          </div>

          {/* Interactive Printable Preview Container */}
          <div className="p-4 sm:p-6 overflow-y-auto flex justify-center bg-black/30">
            <div 
              id="tent-card-print-area"
              ref={printAreaRef}
              className={`w-full max-w-md transition-colors duration-300 rounded-2xl p-6 sm:p-8 border-2 shadow-2xl relative select-none ${
                isBurgundy 
                  ? 'bg-[#520C16] text-[#FDFBF7] border-[#E5C158]' 
                  : 'bg-[#FCFAF7] text-[#1F2937] border-[#C4A46C]'
              }`}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-12 h-12 opacity-40 pointer-events-none text-current">
                <MonochromeFloralOrnament variant="corner-tl" />
              </div>
              <div className="absolute top-2 right-2 w-12 h-12 opacity-40 pointer-events-none text-current">
                <MonochromeFloralOrnament variant="corner-tr" />
              </div>
              <div className="absolute bottom-2 left-2 w-12 h-12 opacity-40 pointer-events-none text-current">
                <MonochromeFloralOrnament variant="corner-bl" />
              </div>
              <div className="absolute bottom-2 right-2 w-12 h-12 opacity-40 pointer-events-none text-current">
                <MonochromeFloralOrnament variant="corner-br" />
              </div>

              {/* CARD SIDE A (FRONT) */}
              <div className="flex flex-col items-center text-center">
                <span className={`text-[11px] font-serif italic tracking-wide block ${
                  isBurgundy ? 'text-[#F5D77F]' : 'text-[#8A1828]'
                }`}>
                  The Wedding Celebration of
                </span>

                <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight mt-1 mb-1">
                  {coupleName}
                </h2>

                <p className={`text-xs font-sans tracking-wide mb-5 ${
                  isBurgundy ? 'text-amber-200/80' : 'text-stone-600'
                }`}>
                  {eventDate} • {eventVenue}
                </p>

                {/* QR Code Container */}
                <div className={`p-4 rounded-2xl border-2 shadow-lg mb-4 bg-white ${
                  isBurgundy ? 'border-[#E5C158]' : 'border-[#C4A46C]'
                }`}>
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code ${coupleName}`} 
                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                  />
                </div>

                {/* Call to Action */}
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-serif font-bold tracking-wider uppercase mb-3 ${
                  isBurgundy 
                    ? 'bg-[#E5C158] text-[#520C16]' 
                    : 'bg-[#8A1828] text-[#F5D77F]'
                }`}>
                  <Sparkles size={13} />
                  <span>Scan Me & Berfoto</span>
                </div>

                {/* 3 Step Instruction */}
                <div className={`w-full max-w-xs space-y-1.5 text-xs text-left mb-4 p-3 rounded-xl border ${
                  isBurgundy 
                    ? 'bg-black/25 border-white/10 text-gray-200' 
                    : 'bg-stone-100 border-stone-200 text-stone-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-500 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      1
                    </span>
                    <span>Arahkan kamera HP ke QR Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-500 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      2
                    </span>
                    <span>Pilih bingkai estetik & pose terbaikmu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-500 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                      3
                    </span>
                    <span>Simpan foto ke HP & kirim doa restu</span>
                  </div>
                </div>

                {/* Brand Footnote */}
                <p className="text-[10px] font-mono text-gray-400 truncate max-w-full">
                  sirklenice.com/{event.slug} • Sirklen Photo
                </p>
              </div>

              {/* FOLD LINE (Only for Foldable Mode) */}
              {layoutMode === 'foldable' && (
                <div className="my-8 relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t-2 border-dashed ${
                      isBurgundy ? 'border-white/30' : 'border-black/25'
                    }`} />
                  </div>
                  <span className={`relative px-3 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase ${
                    isBurgundy 
                      ? 'bg-[#520C16] text-amber-200 border border-white/20' 
                      : 'bg-[#FCFAF7] text-stone-600 border border-black/20'
                  }`}>
                    ✂️ Garis Lipat Meja (Fold Here) ✂️
                  </span>
                </div>
              )}

              {/* CARD SIDE B (BACK / INVERTED FOR OPPOSITE TABLE VIEW) */}
              {layoutMode === 'foldable' && (
                <div className="flex flex-col items-center text-center pt-2">
                  <span className={`text-[11px] font-serif italic tracking-wide block ${
                    isBurgundy ? 'text-[#F5D77F]' : 'text-[#8A1828]'
                  }`}>
                    Terima Kasih Atas Kehadiran Anda
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight mt-1 mb-1">
                    {coupleName}
                  </h2>

                  <p className={`text-xs font-sans tracking-wide mb-4 ${
                    isBurgundy ? 'text-amber-200/80' : 'text-stone-600'
                  }`}>
                    Abadikan momen Anda bersama kami hari ini
                  </p>

                  {/* QR Code Container */}
                  <div className={`p-4 rounded-2xl border-2 shadow-lg mb-3 bg-white ${
                    isBurgundy ? 'border-[#E5C158]' : 'border-[#C4A46C]'
                  }`}>
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR Code ${coupleName}`} 
                      className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                    />
                  </div>

                  <p className={`text-xs font-serif font-bold ${
                    isBurgundy ? 'text-[#F5D77F]' : 'text-[#8A1828]'
                  }`}>
                    Scan QR untuk Foto & Kirim Pesan Doa
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
            top: 20px !important;
            transform: translateX(-50%) !important;
            width: 100% !important;
            max-width: 500px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </AnimatePresence>
  );
}
