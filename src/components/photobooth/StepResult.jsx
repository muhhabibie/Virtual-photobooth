import { useEffect, useRef, useState, useCallback } from 'react';
import { Download, Share2, Volume2, Check, X, ArrowLeft, Move, Sparkles, SlidersHorizontal, Smile, RefreshCw, BookOpen } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import SpotifyVoicePlayer from '../ui/SpotifyVoicePlayer';

const PHOTO_FILTERS = [
  { id: 'natural', name: 'NATURAL', css: 'none', desc: 'Asli', previewClass: 'from-amber-200 via-rose-300 to-amber-100' },
  { id: 'monochrome', name: 'B&W MONO', css: 'grayscale(100%) contrast(120%)', desc: 'Hitam Putih', previewClass: 'from-gray-950 via-gray-500 to-gray-200' },
  { id: 'vintage', name: 'VINTAGE', css: 'sepia(40%) contrast(110%) saturate(120%) brightness(102%)', desc: 'Retro Warm', previewClass: 'from-amber-900 via-amber-600 to-yellow-200' },
  { id: 'soft-warm', name: 'SOFT WARM', css: 'sepia(18%) saturate(125%) brightness(106%) contrast(102%)', desc: 'Romantic', previewClass: 'from-rose-500 via-pink-300 to-amber-200' },
  { id: 'noir', name: 'FILM NOIR', css: 'grayscale(100%) contrast(145%) brightness(92%)', desc: 'Kontras Tinggi', previewClass: 'from-black via-gray-900 to-gray-600' },
  { id: 'bright-glow', name: 'BRIGHT GLOW', css: 'brightness(112%) contrast(105%) saturate(115%)', desc: 'Cerah Berkilau', previewClass: 'from-yellow-200 via-amber-300 to-white' },
];

const STICKERS = ['💍', '🌸', '✨', '🎀', '👑', '🌹', '⭐', '🥂', '💖', '🕊️'];

export default function StepResult() {
  const {
    capturedPhotos,
    guestName,
    guestMessage,
    stripColor,
    voiceUrl,
    setCurrentStep,
    reset,
    closeBooth,
  } = useBooth();

  const { toast } = useToast();
  const canvasRef = useRef(null);
  const stickerAreaRef = useRef(null);
  
  const [selectedFilter, setSelectedFilter] = useState('natural');
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [activeTab, setActiveTab] = useState('filters'); // 'filters' | 'stickers'

  const filterCarouselRef = useRef(null);
  const filterRefs = useRef({});
  const isProgrammaticScrollRef = useRef(false);

  // Scroll swipe center detection for Tone Filters in StepResult
  const handleFilterScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;
    const container = filterCarouselRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestId = null;
    let minDistance = Infinity;

    PHOTO_FILTERS.forEach(filter => {
      const el = filterRefs.current[filter.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(itemCenter - containerCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestId = filter.id;
        }
      }
    });

    if (closestId && closestId !== selectedFilter) {
      setSelectedFilter(closestId);
    }
  }, [selectedFilter]);

  const selectFilterByClick = (id) => {
    isProgrammaticScrollRef.current = true;
    setSelectedFilter(id);
    const el = filterRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
  };

  // Render high-res 2X Retina wedding photo strip (Base canvas: photos, frames, text)
  const renderStrip = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || capturedPhotos.length === 0) return;

    const count = capturedPhotos.length;
    const scale = 2; // 2x Retina Resolution
    const photoW = 400 * scale;
    const pad = 30 * scale;
    const gap = 18 * scale;
    const headerH = 65 * scale;
    const footerH = 85 * scale;

    // Calculate exact height for each captured photo based on its real aspect ratio
    const photoLayouts = capturedPhotos.map((photo) => {
      const srcEl = photo.canvas;
      const aspect = (srcEl && srcEl.width && srcEl.height) ? (srcEl.height / srcEl.width) : (count === 1 ? 1.15 : 0.75);
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

    // Background Frame Color
    const frameBg = stripColor || '#6B111F';
    ctx.fillStyle = frameBg;
    ctx.fillRect(0, 0, totalW, totalH);

    // Frame Header Branding
    const isLightBg = frameBg === '#FAF6F0' || frameBg === '#FDFBF7' || frameBg === '#ffffff' || frameBg === '#F3C5CB';
    ctx.fillStyle = isLightBg ? '#8C7A6B' : '#F5D77F';
    ctx.font = `bold ${14 * scale}px monospace, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✦ THE WEDDING OF ✦', totalW / 2, pad + 38 * scale);

    // Render Photos with Applied Filter (100% UNCROPPED - EXACT WYSIWYG MATCH)
    const activeFilterObj = PHOTO_FILTERS.find(f => f.id === selectedFilter) || PHOTO_FILTERS[0];

    let drawY = pad + headerH;
    photoLayouts.forEach(({ photo, h }) => {
      // Photo Mat & Black Frame Line (Matching reference image photobooth strip border)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(pad - 4 * scale, drawY - 4 * scale, photoW + 8 * scale, h + 8 * scale);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2 * scale;
      ctx.strokeRect(pad - 4 * scale, drawY - 4 * scale, photoW + 8 * scale, h + 8 * scale);

      ctx.save();
      if (activeFilterObj.css && activeFilterObj.css !== 'none') {
        ctx.filter = activeFilterObj.css;
      }

      const srcEl = photo.canvas;
      if (srcEl) {
        // Draw 100% of the captured canvas without any secondary cropping
        ctx.drawImage(srcEl, 0, 0, srcEl.width, srcEl.height, pad, drawY, photoW, h);
      } else if (photo.dataUrl) {
        const img = new Image();
        img.src = photo.dataUrl;
        ctx.drawImage(img, pad, drawY, photoW, h);
      }
      ctx.restore();

      drawY += h + gap;
    });

    // Frame Footer Signature
    const displayName = guestName ? guestName.trim() : 'Sabrina & Raka';
    ctx.fillStyle = isLightBg ? '#6B111F' : 'rgba(255,255,255,0.85)';
    ctx.font = `italic bold ${13 * scale}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('With Love & Blessings,', totalW / 2, totalH - pad - 38 * scale);

    ctx.fillStyle = isLightBg ? '#6B111F' : '#F5D77F';
    ctx.font = `italic bold ${24 * scale}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    ctx.fillText(displayName, totalW / 2, totalH - pad - 10 * scale);
  }, [capturedPhotos, stripColor, guestName, selectedFilter]);

  useEffect(() => {
    renderStrip();
  }, [renderStrip]);

  // Add new sticker centered on the photo strip
  const addSticker = (emoji) => {
    const newStk = {
      id: Date.now(),
      emoji,
      x: 0.5,
      y: 0.35 + (selectedStickers.length % 4) * 0.12,
    };
    setSelectedStickers(prev => [...prev, newStk]);
    setActiveStickerId(newStk.id);
    toast(`Stiker ${emoji} ditambahkan!`, 'success');
  };

  // Pointer drag handler for moving stickers freely across the photostrip
  const handleStickerDragStart = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveStickerId(id);

    const area = stickerAreaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();

    const onPointerMove = (moveEvent) => {
      const x = Math.max(0.06, Math.min(0.94, (moveEvent.clientX - rect.left) / rect.width));
      const y = Math.max(0.05, Math.min(0.95, (moveEvent.clientY - rect.top) / rect.height));

      setSelectedStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleDeleteSticker = (id) => {
    setSelectedStickers(prev => prev.filter(s => s.id !== id));
    if (activeStickerId === id) setActiveStickerId(null);
    toast('Stiker dihapus', 'info');
  };

  // Generates complete 2X Retina canvas with photos, typography, and user-placed stickers
  const getExportCanvas = () => {
    const baseCanvas = canvasRef.current;
    if (!baseCanvas) return null;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = baseCanvas.width;
    exportCanvas.height = baseCanvas.height;
    const ctx = exportCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(baseCanvas, 0, 0);

    const scale = 2;
    selectedStickers.forEach(stk => {
      ctx.font = `${38 * scale}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stk.emoji, stk.x * exportCanvas.width, stk.y * exportCanvas.height);
    });

    return exportCanvas;
  };

  const handleDownload = () => {
    const canvas = getExportCanvas();
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `wedding_photostrip_${Date.now()}.jpg`;
    a.href = canvas.toDataURL('image/jpeg', 0.96);
    a.click();
    toast('Photo strip berhasil diunduh! 💍', 'success');
  };

  const handleShare = async () => {
    const canvas = getExportCanvas();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `wedding_strip_${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'The Wedding of Sabrina & Raka',
            text: `Kenangan foto pernikahan dari ${guestName || 'Tamu Undangan'}! 💍✨`,
            files: [file],
          });
          toast('Berhasil dibagikan!', 'success');
        } catch (e) {
          // User cancelled
        }
      } else {
        handleDownload();
      }
    }, 'image/jpeg', 0.96);
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-black text-white select-none overflow-hidden flex flex-col justify-between p-1.5 sm:p-2.5 pb-[max(env(safe-area-inset-bottom),10px)] z-[100]">
      
      {/* ================= 🌟 1. INSTAGRAM STORY TOP BAR 🌟 ================= */}
      <div className="relative z-30 flex items-center justify-between w-full max-w-md mx-auto flex-shrink-0 pt-1 px-2 pb-1">
        {/* Left: Retake / New Photo Button */}
        <button
          onClick={() => { reset(); setCurrentStep('camera'); }}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow-md"
          title="Foto Baru"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Center: Title Badge */}
        <div className="px-4 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-amber-200 text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center shadow-md">
          <span>HASIL PHOTO STRIP</span>
        </div>

        {/* Right: Close X Button */}
        <button 
          onClick={closeBooth} 
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow-md"
          title="Tutup"
        >
          <X size={18} />
        </button>
      </div>

      {/* ================= 🌟 2. CENTER PHOTO STRIP DISPLAY WITH DRAGGABLE STICKERS 🌟 ================= */}
      <div className="flex-1 min-h-0 w-full max-w-md mx-auto relative flex flex-col items-center justify-center py-1 overflow-hidden">
        
        {/* Photo Strip Card Container */}
        <div className="relative h-full max-h-[100%] flex flex-col items-center justify-center">
          
          <div className="relative h-full max-h-[calc(100%-20px)] aspect-auto shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(245,215,127,0.15)] rounded-2xl overflow-hidden border border-white/20 flex items-center justify-center bg-gray-950">
            <canvas ref={canvasRef} className="h-full w-auto max-w-full object-contain block pointer-events-none" />

            {/* Draggable Stickers Overlay */}
            <div 
              ref={stickerAreaRef}
              onClick={() => setActiveStickerId(null)}
              className="absolute inset-0 z-20 overflow-hidden cursor-default"
            >
              {selectedStickers.map((stk) => (
                <div
                  key={stk.id}
                  onPointerDown={(e) => handleStickerDragStart(stk.id, e)}
                  style={{
                    left: `${stk.x * 100}%`,
                    top: `${stk.y * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    touchAction: 'none'
                  }}
                  className={`absolute cursor-grab active:cursor-grabbing select-none group p-1 transition-shadow ${
                    activeStickerId === stk.id ? 'ring-2 ring-amber-300 rounded-xl bg-black/50 backdrop-blur-xs shadow-lg' : ''
                  }`}
                >
                  <span className="text-2xl sm:text-3xl block filter drop-shadow-lg hover:scale-110 active:scale-105 transition-transform pointer-events-none">
                    {stk.emoji}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSticker(stk.id);
                    }}
                    className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 border border-white text-white flex items-center justify-center text-[10px] font-bold shadow-md ${
                      activeStickerId === stk.id ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90'
                    } transition-all cursor-pointer`}
                    title="Hapus Stiker Ini"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] sm:text-[10px] text-amber-200/80 text-center font-mono mt-1 tracking-wide">
            ✦ Geser stiker di atas foto untuk memindahkan posisi ✦
          </p>
        </div>

      </div>

      {/* ================= 🌟 3. INSTAGRAM STORY EDITING CONTROL DOCK 🌟 ================= */}
      <div className="relative z-30 flex flex-col items-center w-full max-w-md mx-auto flex-shrink-0 pt-1">
        
        {/* Toggle Mode Switcher Pill (Filters / Stickers) */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 mb-1.5 shadow-md">
          <button
            onClick={() => setActiveTab('filters')}
            className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'filters'
                ? 'bg-gradient-to-r from-amber-600 to-rose-900 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={11} />
            <span>Tone Filter</span>
          </button>

          <button
            onClick={() => setActiveTab('stickers')}
            className={`px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'stickers'
                ? 'bg-gradient-to-r from-amber-600 to-rose-900 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smile size={11} />
            <span>Stiker AR ({selectedStickers.length})</span>
          </button>
        </div>

        {/* Carousel Content */}
        {activeTab === 'filters' ? (
          <div 
            ref={filterCarouselRef}
            onScroll={handleFilterScroll}
            className="w-full overflow-x-auto no-scrollbar py-1 flex justify-start items-center touch-pan-x snap-x snap-mandatory scroll-smooth"
          >
            <div className="flex items-center gap-3.5 min-w-max px-[calc(50vw-24px)] sm:px-6">
              {PHOTO_FILTERS.map(filter => {
                const isActive = selectedFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    ref={el => (filterRefs.current[filter.id] = el)}
                    onClick={() => selectFilterByClick(filter.id)}
                    className={`flex flex-col items-center gap-1 transition-all cursor-pointer snap-center flex-shrink-0 ${
                      isActive ? 'scale-105 z-10' : 'opacity-65 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <div
                      className={`rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'w-12 h-12 sm:w-13 sm:h-13 ring-2 ring-amber-300 ring-offset-2 ring-offset-black bg-gradient-to-br ' + filter.previewClass + ' shadow-[0_0_20px_rgba(255,215,0,0.35)]'
                          : 'w-9 h-9 sm:w-10 sm:h-10 border border-white/30 bg-gradient-to-br ' + filter.previewClass
                      }`}
                    />
                    <span className={`text-[9px] font-mono uppercase tracking-wider font-bold ${isActive ? 'text-amber-200' : 'text-gray-400'}`}>
                      {filter.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar py-1 flex justify-start sm:justify-center items-center touch-pan-x snap-x">
            <div className="flex items-center gap-2.5 min-w-max px-6">
              {STICKERS.map((stk, i) => (
                <button
                  key={i}
                  onClick={() => addSticker(stk)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-lg sm:text-xl hover:scale-125 active:scale-95 transition-all cursor-pointer shadow-md snap-center"
                  title={`Tambah Stiker ${stk}`}
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= 🌟 4. INSTAGRAM ACTION DOCK (DOWNLOAD & SHARE) 🌟 ================= */}
      <div className="relative z-30 w-full max-w-md mx-auto pt-1 pb-1 px-2 flex flex-col gap-2 flex-shrink-0">
        
        {/* Primary Download Button */}
        <button
          onClick={handleDownload}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] text-[#F5D77F] font-serif font-bold text-xs sm:text-sm border border-amber-400/50 shadow-2xl shadow-rose-950/60 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
        >
          <Download size={17} />
          <span>Download Photo Strip HD (2X Retina)</span>
        </button>

        {/* Secondary Actions */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-full bg-[#1C1C1E] border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <Share2 size={14} />
            <span>Bagikan</span>
          </button>

          <button
            onClick={() => {
              closeBooth();
              document.getElementById('gallery-feed')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 py-2.5 rounded-full bg-[#24101D] border border-amber-400/40 text-amber-200 text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Buku Tamu</span>
          </button>
        </div>

      </div>

    </div>
  );
}