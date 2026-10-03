import { useState, useRef } from 'react';
import { Download, Copy, Check, Printer, QrCode, Sparkles, ExternalLink } from 'lucide-react';
import logoPhotobooth from '../../assets/logo photobooth.png';
import { QR_THEMES, resolveEventQrTheme } from '../../utils/qrTheme';
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
  
  // Custom QR Code API with color adaptation
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
      
      // Render aesthetic card canvas for direct download
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = 800;
      const h = 1000;
      canvas.width = w;
      canvas.height = h;

      // Card Background
      ctx.fillStyle = activeTheme.canvasBgHex;
      ctx.fillRect(0, 0, w, h);

      // Card Border & Accent Frame
      ctx.strokeStyle = activeTheme.goldAccent;
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      ctx.lineWidth = 1.5;
      ctx.strokeRect(42, 42, w - 84, h - 84);

      // Header Text
      ctx.fillStyle = activeTheme.canvasAccentHex;
      ctx.font = '600 24px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(activeTheme.name.toUpperCase(), w / 2, 95);

      ctx.fillStyle = activeTheme.canvasTextHex;
      ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
      ctx.fillText(title, w / 2, 160);

      ctx.fillStyle = activeTheme.canvasSubtextHex;
      ctx.font = '18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(activeTheme.scanInstruction, w / 2, 205);

      // Load & Draw QR Code with quiet-zone padding & central icon
      await new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const qrSize = 480;
          const qrX = (w - qrSize) / 2;
          const qrY = 245;

          // White QR background card
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

          ctx.strokeStyle = activeTheme.goldAccent;
          ctx.lineWidth = 2;
          ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);

          // Draw QR
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

          // Center Icon Circle Badge
          const badgeRadius = 38;
          const badgeX = w / 2;
          const badgeY = qrY + qrSize / 2;

          ctx.beginPath();
          ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = activeTheme.goldAccent;
          ctx.stroke();

          ctx.font = '32px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(activeTheme.centerIcon, badgeX, badgeY + 2);

          resolve();
        };
        img.onerror = resolve;
        img.src = qrImageUrl;
      });

      // Footer Info
      ctx.fillStyle = activeTheme.canvasAccentHex;
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PT SIRKLEN KREASI USAHA • SIRKLENICE.COM', w / 2, h - 110);

      ctx.fillStyle = activeTheme.canvasSubtextHex;
      ctx.font = '16px monospace';
      ctx.fillText(targetUrl, w / 2, h - 75);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `QR_Sirklen_${(title || 'Event').replace(/\s+/g, '_')}.png`;
        a.download = filename;
        a.href = blobUrl;
        a.click();
        toast('QR Code HD berhasil diunduh', 'success');
      }, 'image/png');

    } catch (e) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      
      {/* Dynamic Aesthetic Card Frame */}
      <div 
        ref={containerRef} 
        className={`w-full p-5 sm:p-6 rounded-3xl border shadow-2xl transition-all duration-300 relative flex flex-col items-center text-center ${activeTheme.cardBg} ${activeTheme.cardBorder}`}
      >
        
        {/* Inner Gold Foil Hairline Border */}
        <div className="absolute inset-2.5 rounded-2xl border border-amber-400/25 pointer-events-none" />

        {/* Brand Header & Event Badge */}
        <div className="flex flex-col items-center z-10 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <img src={logoPhotobooth} alt="Sirklen Photo" className="w-6 h-6 object-contain" />
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

        {/* QR Code Container with Soft Shadow & Center Icon Badge */}
        <div className="relative z-10 p-3.5 bg-white rounded-2xl border border-amber-300/50 shadow-xl flex items-center justify-center group my-1">
          
          <img 
            src={qrImageUrl} 
            alt={`QR Code ${title}`} 
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
          />

          {/* Center Monogram / Theme Icon Overlay Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-amber-400/80 shadow-md flex items-center justify-center text-xl sm:text-2xl transform group-hover:scale-110 transition-transform">
              {activeTheme.centerIcon}
            </div>
          </div>
        </div>

        {/* URL Chip */}
        <div className="w-full bg-black/25 backdrop-blur-xs border border-white/10 rounded-xl py-1.5 px-3 mt-3.5 z-10 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-gray-300 truncate">
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

        {/* Action Buttons */}
        {showDownload && (
          <div className="w-full grid grid-cols-2 gap-2 mt-4 z-10">
            <button
              onClick={handleDownloadHD}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Download size={14} />
              <span>Download HD</span>
            </button>

            {onOpenTentCard ? (
              <button
                onClick={onOpenTentCard}
                className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-serif font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
              >
                <Printer size={14} />
                <span>Kartu Meja</span>
              </button>
            ) : (
              <button
                onClick={handleCopy}
                className="py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-serif font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
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
        <div className="w-full mt-4 p-2 rounded-2xl bg-stone-900/80 border border-stone-800 backdrop-blur-md">
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
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-bold text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md scale-102'
                      : 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                >
                  <span className="text-xs">{th.centerIcon}</span>
                  <span className="truncate w-full text-[9px]">{th.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
