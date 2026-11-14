import { useState, useRef, useEffect } from 'react';
import { Download, Copy, Check, Printer, Sparkles } from 'lucide-react';
import { useToast } from './Toast';
import { renderTableQrCard, downloadTableQrCard, formatVanityDomain } from '../../utils/tableQrRenderer';

const TABLE_THEMES = [
  { id: 'ivory', name: 'Kapas Ivory', sub: 'Kertas Kapas Mewah', bgHex: '#FAF6F0', textHex: '#222' },
  { id: 'burgundy', name: 'Royal Burgundy', sub: 'Maroon & Gold', bgHex: '#420A13', textHex: '#FFF' },
  { id: 'slate', name: 'Noir Slate', sub: 'Hitam & Platina', bgHex: '#0F172A', textHex: '#FFF' },
  { id: 'sage', name: 'Sage Botanical', sub: 'Earthy Sage', bgHex: '#22382B', textHex: '#FFF' },
];

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
  const [viewMode, setViewMode] = useState('kartuMeja'); // Default to Kartu Meja as requested by user
  const [selectedThemeKey, setSelectedThemeKey] = useState('ivory');
  const [isCopied, setIsCopied] = useState(false);
  const [isRenderingCard, setIsRenderingCard] = useState(false);

  const cardCanvasRef = useRef(null);

  const targetUrl = url || (event ? (event.slug === 'demo' || event.isDemo ? `${window.location.origin}/` : `${window.location.origin}/${event.slug}?qr=1`) : window.location.href);
  const title = displayName || event?.displayName || 'Sirklen Photo Event';
  const vanityUrl = formatVanityDomain(targetUrl, event?.slug);

  // Pure QR Code image URL (Black on White for designers)
  const pureQrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(targetUrl)}&color=000000&bgcolor=ffffff&margin=1`;

  // Render high-definition deckled edge table card on Canvas
  useEffect(() => {
    if (viewMode !== 'kartuMeja') return;
    const canvas = cardCanvasRef.current;
    if (!canvas) return;

    let isMounted = true;
    setIsRenderingCard(true);

    renderTableQrCard(canvas, {
      event,
      url: targetUrl,
      themeKey: selectedThemeKey,
      scale: 2
    }).finally(() => {
      if (isMounted) setIsRenderingCard(false);
    });

    return () => { isMounted = false; };
  }, [viewMode, event, targetUrl, selectedThemeKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    toast('Link photobooth berhasil disalin', 'success');
    setTimeout(() => setIsCopied(false), 2200);
  };

  // Mode 1: Download Pure QR Code Only
  const handleDownloadPureQr = () => {
    const a = document.createElement('a');
    a.download = `PureQRCode_${(title || 'Event').replace(/\s+/g, '_')}.png`;
    a.href = pureQrImageUrl;
    a.click();
    toast('Aset Pure QR Code (PNG HD) berhasil diunduh', 'success');
  };

  // Mode 2: Download Full Luxury Deckled Table Card (100% Reliable Canvas Direct Export)
  const handleDownloadHD = async () => {
    if (viewMode === 'pureQr') {
      handleDownloadPureQr();
      return;
    }

    const canvas = cardCanvasRef.current;
    if (!canvas) return;

    toast('Mengunduh kartu meja cetak HD...', 'info');
    const filename = `KartuMeja_${(title || 'Event').replace(/\s+/g, '_')}_Deckled.png`;
    const success = await downloadTableQrCard(canvas, filename);
    if (success) {
      toast('Kartu meja cetak HD (Kertas Bergerigi) berhasil diunduh!', 'success');
    } else {
      handleDownloadPureQr();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto select-none">
      
      {/* Primary View Mode Switcher Pills */}
      <div className="w-full flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-stone-900 border border-stone-800 mb-4 text-xs font-serif font-bold">
        <button
          onClick={() => setViewMode('kartuMeja')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
            viewMode === 'kartuMeja'
              ? 'bg-[#6B111F] text-[#F5D77F] border border-amber-400/40 shadow-xs'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles size={12} className={viewMode === 'kartuMeja' ? 'text-amber-300' : 'text-stone-500'} />
          <span>1. Kartu Meja (Kertas Bergerigi)</span>
        </button>

        <button
          onClick={() => setViewMode('pureQr')}
          className={`flex-1 py-1.5 px-2 rounded-xl transition cursor-pointer ${
            viewMode === 'pureQr'
              ? 'bg-[#6B111F] text-[#F5D77F] border border-amber-400/40 shadow-xs'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <span>2. QR Code (Murni)</span>
        </button>
      </div>

      {viewMode === 'pureQr' ? (
        /* Mode 2: QR Code Murni (Aset polos minimalis) */
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
        /* Mode 1: Kartu Meja Estetik & Profesional (Kertas Bergerigi / Deckled Edge) */
        <div className="w-full flex flex-col items-center">
          
          {/* Deckled Edge Live Canvas Preview */}
          <div className="relative w-full flex items-center justify-center py-1">
            <canvas 
              ref={cardCanvasRef}
              className="w-full max-w-[290px] xs:max-w-[320px] sm:max-w-[340px] h-auto object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.55)] block transition-transform duration-300 transform hover:scale-[1.01]"
            />
            {isRenderingCard && (
              <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs rounded-2xl flex items-center justify-center text-amber-200 text-xs font-serif font-bold gap-2">
                <Sparkles size={16} className="animate-spin text-amber-400" />
                <span>Merender Desain Kartu Bergerigi...</span>
              </div>
            )}
          </div>

          {/* Clean Vanity Link & Copy Pill (No raw ugly query params!) */}
          <div className="w-full max-w-[320px] bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-xl py-2 px-3 mt-3.5 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-[11px] font-mono text-stone-200 truncate">
                {vanityUrl}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-serif font-bold flex items-center gap-1.5 transition cursor-pointer flex-shrink-0 shadow-xs active:scale-95"
              title="Salin Link Photobooth"
            >
              {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{isCopied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>

          {/* Action Buttons: Download Kartu Meja & Pratinjau Lipat */}
          {showDownload && (
            <div className="w-full max-w-[320px] grid grid-cols-2 gap-2 mt-3 z-20">
              <button
                onClick={handleDownloadHD}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-stone-950 text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
              >
                <Download size={14} />
                <span>Download Kartu Meja</span>
              </button>

              {onOpenTentCard ? (
                <button
                  onClick={onOpenTentCard}
                  className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-400/40 text-amber-200 text-xs font-serif font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Pratinjau Lipat</span>
                </button>
              ) : (
                <button
                  onClick={handleCopy}
                  className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-400/40 text-amber-200 text-xs font-serif font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                >
                  {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* Theme Presets Switcher (If showOptions enabled & Kartu Meja active) */}
      {showOptions && viewMode === 'kartuMeja' && (
        <div className="w-full mt-4 p-2.5 rounded-2xl bg-stone-900/90 border border-stone-800 backdrop-blur-md">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              <span>Tema Kertas Bergerigi Meja</span>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {TABLE_THEMES.map((th) => {
              const isSelected = selectedThemeKey === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => setSelectedThemeKey(th.id)}
                  className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    isSelected
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold ring-2 ring-amber-300'
                      : 'bg-stone-800/70 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-700/60'
                  }`}
                >
                  <span 
                    className="w-3.5 h-3.5 rounded-full border border-black/30 mb-0.5 shadow-xs" 
                    style={{ backgroundColor: th.bgHex }} 
                  />
                  <span className="truncate w-full text-[9.5px] font-serif font-bold">{th.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
