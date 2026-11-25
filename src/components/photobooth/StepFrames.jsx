import { useEffect, useRef, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, UserCheck, AlertCircle, RefreshCw, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import { getEventHeaderTitle, getEventDisplayName, getEventFormattedDate } from '../../utils/eventHeader';
import { renderMasterPhotoStrip, renderBotanicalWeddingStrip } from '../../utils/stripRenderer';
import { preloadFaceMesh } from '../../hooks/useFaceMesh';
import { getEventGraphicFrames, getCachedFrameImage } from '../../data/eventFrames';

const STRIP_TYPES = [
  { id: 1, name: 'Polaroid', sub: '1 frame', badge: 'CLASSIC', badgeColor: 'bg-[#6B111F]', slots: 1 },
  { id: 2, name: '2 Foto', sub: '2 frames', badge: 'DUO', badgeColor: 'bg-[#6B111F]', slots: 2 },
  { id: 3, name: '3 Foto', sub: '3 frames', badge: null, slots: 3 },
  { id: 4, name: '4 Foto', sub: '4 frames', badge: 'POPULER', badgeColor: 'bg-[#C4A46C]', slots: 4 },
];

const BASE_COLOR_THEMES = [
  { id: 'botanical', name: 'Botanical', hex: '#FFFFFF', borderHex: '#C4A482', textHex: '#2B2826', styleName: 'PASADENA BOTANICAL', subName: 'Elegan Putih & Emas' },
  { id: 'burgundy', name: 'Burgundy', hex: '#6B111F', textHex: '#F5D77F', styleName: 'ROYAL BURGUNDY', subName: 'Minimalis Royal' },
  { id: 'ivory', name: 'Ivory', hex: '#FDFBF7', borderHex: '#E2DDD5', textHex: '#6B111F', styleName: 'IVORY BLISS', subName: 'Clean & Pure' },
  { id: 'slate', name: 'Slate', hex: '#2D3748', textHex: '#E2E8F0', styleName: 'NOIR SLATE', subName: 'Modern Dark' },
  { id: 'blush', name: 'Blush', hex: '#F3C5CB', textHex: '#6B111F', styleName: 'BLUSH ROMANCE', subName: 'Sweet Pastel' },
  { id: 'antique', name: 'Antique', hex: '#C4A46C', textHex: '#FFFFFF', styleName: 'ANTIQUE GOLD', subName: 'Vintage Luxury' },
  { id: 'vintage', name: 'Vintage', hex: '#5E0915', textHex: '#F5D77F', styleName: 'CLASSIC VINTAGE', subName: 'Deep Wine Classic' },
  { id: 'midnight', name: 'Midnight', hex: '#120B18', textHex: '#F5D77F', styleName: 'MIDNIGHT DARK', subName: 'Luxury Dark' },
  { id: 'sage', name: 'Sage', hex: '#26402E', borderHex: '#3B5943', textHex: '#E2F5D5', styleName: 'SAGE BOTANICAL', subName: 'Forest Earthy' },
];
const COLOR_THEMES = BASE_COLOR_THEMES;

export default function StepFrames() {
  const { 
    targetPhotoCount, 
    setTargetPhotoCount, 
    stripColor, 
    setStripColor,
    setStripColorName,
    guestName,
    setGuestName,
    guestMessage,
    setGuestMessage,
    activeEvent,
    setCurrentStep,
    setCapturedPhotos,
    setSelectedPhotoIndex,
    stripStyle, setStripStyle,
    selectedGraphicFrameId, setSelectedGraphicFrameId,
    closeBooth 
  } = useBooth();

  // Event-specific graphic frames (e.g. Mitufaya 8th Anniversary)
  const eventGraphicFrames = useMemo(() => getEventGraphicFrames(activeEvent), [activeEvent]);
  const hasGraphicFrames = eventGraphicFrames.length > 0;

  // Active graphic frame is only non-null when selectedGraphicFrameId is set to one of the event graphic frames
  const activeGraphicFrame = (hasGraphicFrames && selectedGraphicFrameId)
    ? (eventGraphicFrames.find(f => f.id === selectedGraphicFrameId) || null)
    : null;
  const isPremiumMode = Boolean(activeGraphicFrame);

  // Preload overlay images for all graphic frames
  useEffect(() => {
    if (hasGraphicFrames) {
      eventGraphicFrames.forEach(f => {
        getCachedFrameImage(f.overlayUrl);
        getCachedFrameImage(f.previewUrl);
      });
    }
  }, [eventGraphicFrames]);

  const [nameError, setNameError] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const nameInputRef = useRef(null);

  // Pre-warm MediaPipe FaceMesh in the background during idle time on StepFrames!
  useEffect(() => {
    preloadFaceMesh();
  }, []);

  // Compute color themes with Bride's custom frame dynamically featured
  const colorThemes = useMemo(() => {
    if (activeEvent?.customFrame) {
      const customTheme = {
        id: 'custom_bride',
        name: 'Kustom',
        hex: activeEvent.customFrame.bgColor || '#6B111F',
        textHex: activeEvent.customFrame.textColor || '#F5D77F',
        borderHex: activeEvent.customFrame.borderColor,
        styleName: 'KUSTOM PENGANTIN',
        subName: 'Desain Kustom Mempelai',
        isCustom: true
      };
      const others = BASE_COLOR_THEMES.filter(c => c.hex !== customTheme.hex);
      return [customTheme, ...others];
    }
    return BASE_COLOR_THEMES;
  }, [activeEvent]);

  const [activeColorIdx, setActiveColorIdx] = useState(() => {
    const found = colorThemes.findIndex(c => c.hex?.toLowerCase() === (stripColor || '').toLowerCase());
    return found >= 0 ? found : 0;
  });

  // Sync active index if stripColor changes externally (e.g. clicked from Marquee)
  useEffect(() => {
    const found = colorThemes.findIndex(c => c.hex?.toLowerCase() === (stripColor || '').toLowerCase());
    if (found >= 0 && found !== activeColorIdx) {
      setActiveColorIdx(found);
    }
  }, [stripColor, colorThemes]);

  const canvasRef = useRef(null);

  const activeTheme = colorThemes[activeColorIdx] || colorThemes[0];

  const handleSelectType = (typeId) => {
    setTargetPhotoCount(typeId);
  };

  const handleSelectColor = (idx) => {
    setActiveColorIdx(idx);
    const theme = colorThemes[idx];
    setStripColor(theme.hex);
    if (setStripColorName) setStripColorName(theme.name);
    setStripStyle('standard');
  };

  const handlePrev = () => {
    if (isPremiumMode && hasGraphicFrames) {
      const currentIdx = eventGraphicFrames.findIndex(f => f.id === selectedGraphicFrameId);
      const nextIdx = (currentIdx - 1 + eventGraphicFrames.length) % eventGraphicFrames.length;
      const targetFrame = eventGraphicFrames[nextIdx];
      setSelectedGraphicFrameId(targetFrame.id);
      setTargetPhotoCount(targetFrame.slots);
    } else {
      const nextIdx = (activeColorIdx - 1 + colorThemes.length) % colorThemes.length;
      handleSelectColor(nextIdx);
    }
  };

  const handleNext = () => {
    if (isPremiumMode && hasGraphicFrames) {
      const currentIdx = eventGraphicFrames.findIndex(f => f.id === selectedGraphicFrameId);
      const nextIdx = (currentIdx + 1) % eventGraphicFrames.length;
      const targetFrame = eventGraphicFrames[nextIdx];
      setSelectedGraphicFrameId(targetFrame.id);
      setTargetPhotoCount(targetFrame.slots);
    } else {
      const nextIdx = (activeColorIdx + 1) % colorThemes.length;
      handleSelectColor(nextIdx);
    }
  };

  const handleStartCamera = () => {
    if (!guestName || !guestName.trim()) {
      setNameError(true);
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setNameError(false);
    setIsStartingCamera(true);
    setCapturedPhotos([]);
    setSelectedPhotoIndex(0);
    // Instant switch to camera
    setCurrentStep('camera');
  };

  // Render high fidelity large live strip preview on canvas (with font loading listener)
  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isPremiumMode && activeGraphicFrame) {
        // Graphic frame preview: show frame overlay on color background
        renderMasterPhotoStrip(canvas, {
          targetCount: activeGraphicFrame.slots,
          stripColor: activeGraphicFrame.themeHex || '#FFFFFF',
          guestName,
          guestMessage,
          activeEvent,
          graphicFrameId: activeGraphicFrame.id,
          scale: 1,
        });
      } else if (stripStyle === 'botanical-wedding') {
        renderBotanicalWeddingStrip(canvas, {
          targetCount: targetPhotoCount,
          guestName,
          guestMessage,
          activeEvent,
          scale: 1,
        });
      } else {
        renderMasterPhotoStrip(canvas, {
          targetCount: targetPhotoCount,
          stripColor: activeTheme.hex,
          guestName,
          guestMessage,
          activeEvent,
          scale: 1,
        });
      }
    };

    render();
    if (document.fonts?.ready) {
      document.fonts.ready.then(render);
    }
  }, [targetPhotoCount, activeTheme, guestName, guestMessage, activeEvent, stripStyle, activeGraphicFrame, isPremiumMode]);

  const isWedding = (activeEvent?.eventType || 'wedding') === 'wedding';

  return (
    <div className="fixed inset-0 z-[100] w-full h-[100dvh] max-h-[100dvh] bg-[#FBF8F2] text-gray-900 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Full-Width Scrollable Container (No deadzones) */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="px-3.5 sm:px-6 pt-3.5 sm:pt-5 pb-24 sm:pb-28 max-w-lg mx-auto w-full">
        
        {/* ================= 🌟 TOP HEADER 🌟 ================= */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-widest text-[#C4A46C]">
              {isWedding ? `THE WEDDING OF ${activeEvent?.displayName?.toUpperCase() || 'SABRINA & RAKA'}` : `OFFICIAL PHOTOBOOTH ${activeEvent?.displayName?.toUpperCase() || 'EVENT'}`}
            </p>
            <h1 className="text-xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight mt-0.5">
              Studio Pemilihan <span className="text-[#6B111F]">Strip & Bingkai</span>
            </h1>
          </div>

          <button
            onClick={closeBooth}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full bg-white hover:bg-stone-50 shadow-sm border border-stone-200/90 text-stone-700 text-[10px] sm:text-xs font-serif font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer flex-shrink-0 ml-2"
            title="Kembali ke Dashboard"
          >
            <Home size={13} className="text-[#6B111F]" />
            <span>Kembali ke Dashboard</span>
          </button>
        </div>

        {/* ================= 🌟 LARGE & CLEAR LIVE PREVIEW CAROUSEL 🌟 ================= */}
        <div className="relative flex flex-col items-center my-2 sm:my-3">
          
          {/* Divider */}
          <div className="w-full flex items-center justify-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#C4A46C]/40 to-[#C4A46C]/40"></div>
            <span className="text-[9px] sm:text-[10px] font-serif font-bold tracking-widest text-[#C4A46C] uppercase">
              LIVE PREVIEW
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#C4A46C]/40 to-[#C4A46C]/40"></div>
          </div>

          {/* Large Canvas Strip with Navigation Arrows */}
          <div className="relative w-full flex items-center justify-center py-2 sm:py-3">
            
            {/* Left Arrow */}
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-1 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-[#6B111F] shadow-xl border border-stone-200/90 flex items-center justify-center active:scale-90 transition cursor-pointer"
              title="Warna Sebelumnya"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Floating Large Live Strip Canvas (Substantially Enlarged & Framed) */}
            <div className="relative inline-flex items-center justify-center p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl shadow-rose-950/20 bg-white/80 backdrop-blur-md border border-white transition-all duration-300 transform hover:scale-[1.01]">
              <canvas
                ref={canvasRef}
                className="h-[390px] xs:h-[440px] sm:h-[500px] w-auto max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] mx-auto object-contain rounded-xl sm:rounded-2xl shadow-md transition-all duration-300"
              />
            </div>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-1 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-[#6B111F] shadow-xl border border-stone-200/90 flex items-center justify-center active:scale-90 transition cursor-pointer"
              title="Warna Selanjutnya"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Under-Preview Labels */}
          <div className="text-center mt-2 sm:mt-3">
            <h3 className="text-[11px] sm:text-xs font-serif font-bold tracking-widest text-[#C4A46C] uppercase">
              {isPremiumMode ? activeGraphicFrame.name : activeTheme.styleName}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-sans mt-0.5">
              {isPremiumMode ? `${activeGraphicFrame.slots} Pose · Bingkai Eksklusif` : activeTheme.subName}
            </p>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 my-2">
              {isPremiumMode ? (
                eventGraphicFrames.map((frame, idx) => (
                  <button
                    key={frame.id}
                    onClick={() => {
                      setSelectedGraphicFrameId(frame.id);
                      setTargetPhotoCount(frame.slots);
                    }}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      selectedGraphicFrameId === frame.id
                        ? 'w-4 sm:w-5 h-1.5 bg-[#C4A46C]'
                        : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))
              ) : (
                colorThemes.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectColor(i)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      i === activeColorIdx
                        ? 'w-4 sm:w-5 h-1.5 bg-[#C4A46C]'
                        : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))
              )}
            </div>

            {/* Mode Badge Pill */}
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border transition-colors ${
              isPremiumMode
                ? 'bg-gradient-to-r from-[#5E0E1A] to-[#7B1626] border-[#C5A059]/60 text-[#F5D77F] shadow-sm'
                : 'bg-rose-50 border-rose-200 text-[#6B111F]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isPremiumMode ? 'bg-[#E8C987]' : 'bg-[#6B111F]'}`}></span>
              <span>
                {isPremiumMode
                  ? `Bingkai Eksklusif · ${activeGraphicFrame.slots} Pose`
                  : `Mode: ${targetPhotoCount === 1 ? 'Polaroid Single' : `${targetPhotoCount} Foto Strip`}`
                }
              </span>
            </div>
          </div>

        </div>

        {/* ================= 🌟 STUDIO CONFIGURATION FORM 🌟 ================= */}
        <div className="mt-3 sm:mt-4 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-rose-950/5 border border-rose-100/70 space-y-4 sm:space-y-6">
          
          {/* STEP A: Tulis Nama & Doa Restu */}
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#6B111F] text-white flex items-center justify-center text-xs font-bold font-serif">
                  1
                </div>
                <h2 className="text-xs sm:text-sm font-serif font-bold text-gray-900">
                  {isWedding ? 'Nama Tamu & Doa Restu' : 'Nama & Pesan Kesan'}
                </h2>
              </div>
            </div>

            {guestName && guestName.trim() && (
              <div className="mb-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-900 font-bold">
                  <UserCheck size={13} className="text-amber-600" />
                  <span>{isWedding ? 'Undangan' : 'Pengunjung'}: <b>{guestName.trim()}</b></span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded-md font-mono">
                  Tercetak di Strip
                </span>
              </div>
            )}

            <div className="space-y-3">
              {/* Field Wrapper with Floating Speech Bubble Warning Popup */}
              <div className="relative pt-3">
                
                {/* Floating Speech Bubble Warning Popup pointing directly down to the input field */}
                <AnimatePresence>
                  {nameError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute -top-7 left-2.5 z-30 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white text-[11px] font-bold shadow-xl shadow-red-950/30 border border-red-300/60 pointer-events-none"
                    >
                      <AlertCircle size={13} className="animate-pulse text-amber-200 flex-shrink-0" />
                      <span>{isWedding ? 'Isi Nama Tamu kamu terlebih dahulu!' : 'Isi Nama kamu terlebih dahulu!'}</span>
                      {/* Downward Caret Arrow pointing to the input */}
                      <div className="absolute -bottom-1 left-6 w-2.5 h-2.5 bg-rose-600 rotate-45 border-r border-b border-red-300/60" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] sm:text-xs font-bold text-gray-700 flex items-center gap-1">
                    <span>{isWedding ? 'Nama Lengkap Tamu' : 'Nama Lengkap'}</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                </div>

                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Nama Lengkap Kamu (Contoh: Sarah / Naufal)..."
                  value={guestName}
                  onChange={e => {
                    setGuestName(e.target.value);
                    if (e.target.value.trim()) setNameError(false);
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleStartCamera()}
                  className={`w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-rose-50/40 border rounded-xl text-xs sm:text-sm font-semibold text-gray-900 placeholder-gray-400 outline-none transition-all ${
                    nameError
                      ? 'border-2 border-red-500 ring-4 ring-red-100 bg-red-50/50 shadow-md shadow-red-500/10'
                      : 'border-rose-200/90 focus:border-[#6B111F] focus:ring-2 focus:ring-rose-100'
                  }`}
                />
              </div>
              <div>
                <label className="text-[11px] sm:text-xs font-medium text-gray-600 mb-1 block">
                  {isWedding ? 'Pesan / Doa Singkat' : 'Pesan / Ucapan Singkat'} <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder={isWedding ? `Doa singkat (Contoh: Bahagia selalu ${activeEvent?.displayName || 'kedua mempelai'}!)...` : `Pesan singkat (Contoh: Seru banget di ${activeEvent?.displayName || 'event'}!)...`}
                  value={guestMessage}
                  onChange={e => setGuestMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleStartCamera()}
                  className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-rose-50/40 border border-rose-200/90 rounded-xl text-xs sm:text-sm font-normal text-gray-900 placeholder-gray-400 outline-none focus:border-[#6B111F] focus:ring-2 focus:ring-rose-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-gray-100 w-full" />

          {/* TAB SELEKSI: Bingkai Eksklusif (Highlighted) vs Bingkai Standar */}
          {hasGraphicFrames && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[11px] sm:text-xs font-sans font-bold text-stone-700 uppercase tracking-[0.12em]">
                  Pilih Koleksi Bingkai
                </span>
                <span className={`text-[10px] sm:text-[11px] font-sans font-semibold ${
                  isPremiumMode ? 'text-[#8A1828]' : 'text-stone-400'
                }`}>
                  {isPremiumMode ? 'Koleksi Eksklusif' : 'Koleksi Standar'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Bingkai Eksklusif — Highlighted Featured Collection */}
                <button
                  type="button"
                  onClick={() => {
                    const first = eventGraphicFrames[0];
                    setSelectedGraphicFrameId(first.id);
                    setTargetPhotoCount(first.slots);
                  }}
                  className={`relative text-left p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isPremiumMode
                      ? 'bg-gradient-to-br from-[#5C0D19] via-[#7A1525] to-[#4A0913] border-[1.5px] border-[#C5A059] shadow-[0_8px_20px_-4px_rgba(107,17,31,0.32)]'
                      : 'bg-gradient-to-br from-[#FFFDF7] via-[#FBF3E2] to-[#F7ECD4] border-[1.5px] border-[#C5A059]/80 shadow-[0_4px_14px_-2px_rgba(197,160,89,0.22)] hover:border-[#B88E3E] hover:shadow-[0_6px_18px_-2px_rgba(197,160,89,0.3)]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className={`text-[9px] font-sans font-bold uppercase tracking-[0.1em] ${
                      isPremiumMode ? 'text-[#E8C987]' : 'text-[#9B7228]'
                    }`}>
                      Eksklusif
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-sans font-bold tracking-tight ${
                      isPremiumMode
                        ? 'bg-[#C5A059]/20 text-[#F5D77F] border border-[#C5A059]/40'
                        : 'bg-[#6B111F]/10 text-[#6B111F]'
                    }`}>
                      {eventGraphicFrames.length} Desain
                    </span>
                  </div>

                  <div>
                    <div className={`text-xs sm:text-sm font-serif font-bold leading-snug ${
                      isPremiumMode ? 'text-[#FDF3D7]' : 'text-[#5C0E1A]'
                    }`}>
                      Bingkai Eksklusif
                    </div>
                    <div className={`text-[10px] font-sans mt-0.5 leading-tight ${
                      isPremiumMode ? 'text-rose-100/80' : 'text-stone-600'
                    }`}>
                      Artwork khusus event
                    </div>
                  </div>
                </button>

                {/* Bingkai Standar */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGraphicFrameId(null);
                    setTargetPhotoCount(3);
                  }}
                  className={`relative text-left p-3 sm:p-3.5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    !isPremiumMode
                      ? 'bg-white border-[1.5px] border-[#6B111F]/45 shadow-sm'
                      : 'bg-stone-50/90 border border-stone-200/90 hover:bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className={`text-[9px] font-sans font-bold uppercase tracking-[0.1em] ${
                      !isPremiumMode ? 'text-[#8A1828]/80' : 'text-stone-400'
                    }`}>
                      Klasik
                    </span>
                    <span className={`text-[9px] font-sans font-medium ${
                      !isPremiumMode ? 'text-stone-500' : 'text-stone-400'
                    }`}>
                      1–4 Pose
                    </span>
                  </div>

                  <div>
                    <div className={`text-xs sm:text-sm font-serif font-bold leading-snug ${
                      !isPremiumMode ? 'text-[#6B111F]' : 'text-stone-700'
                    }`}>
                      Bingkai Standar
                    </div>
                    <div className={`text-[10px] font-sans mt-0.5 leading-tight ${
                      !isPremiumMode ? 'text-stone-500' : 'text-stone-400'
                    }`}>
                      Warna solid minimalis
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Divider if tabs shown */}
          {hasGraphicFrames && <div className="h-[1px] bg-gray-100 w-full" />}

          {/* STEP 2: Either Exclusive Frames Selection or Standard Strip Pose Count */}
          {isPremiumMode ? (
            /* EXCLUSIVE FRAMES SELECTION */
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#6B111F] text-white flex items-center justify-center text-xs font-bold font-serif">
                    2
                  </div>
                  <h2 className="text-xs sm:text-sm font-serif font-bold text-gray-900">
                    Pilih Desain Bingkai Eksklusif
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF3E3] border border-[#C5A059]/45 text-[#8A621B] text-[9px] sm:text-[10px] font-sans font-semibold tracking-wide uppercase">
                  Eksklusif
                </span>
              </div>

              <div className={`grid gap-2.5 ${eventGraphicFrames.length === 3 ? 'grid-cols-3' : eventGraphicFrames.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {eventGraphicFrames.map((frame) => {
                  const isSelected = selectedGraphicFrameId === frame.id;
                  return (
                    <button
                      key={frame.id}
                      onClick={() => {
                        setSelectedGraphicFrameId(frame.id);
                        setTargetPhotoCount(frame.slots);
                      }}
                      className={`relative rounded-2xl overflow-hidden flex flex-col items-center transition-all cursor-pointer group ${
                        isSelected
                          ? 'ring-2 ring-[#C5A059] shadow-lg shadow-amber-950/15 scale-[1.03]'
                          : 'ring-1 ring-stone-200 hover:ring-[#C5A059]/60 hover:scale-[1.01]'
                      }`}
                    >
                      <div className="relative w-full" style={{ aspectRatio: '1/3' }}>
                        <img
                          src={frame.previewUrl}
                          alt={frame.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-[#6B111F]/10 flex items-center justify-center">
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#6B111F] border border-[#C5A059]/80 flex items-center justify-center shadow-md">
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5L4 7L8 3" stroke="#F5D77F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`w-full text-center px-1.5 py-2 transition-colors ${isSelected ? 'bg-[#6B111F]' : 'bg-white group-hover:bg-stone-50'}`}>
                        <p className={`text-[9px] sm:text-[10px] font-serif font-bold leading-tight truncate ${isSelected ? 'text-[#FDF3D7]' : 'text-gray-900'}`}>
                          {frame.name}
                        </p>
                        <p className={`text-[8px] mt-0.5 ${isSelected ? 'text-[#E8C987]' : 'text-gray-400'}`}>
                          {frame.slots} pose
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] sm:text-[11px] text-stone-500 font-sans mt-3 text-center leading-relaxed">
                Desain grafis kustom eksklusif event sudah dilengkapi artwork latar, tipografi, dan ornamen khusus.
              </p>
            </div>
          ) : (
            /* BINGKAI STANDAR: STEP 2 & STEP 3 */
            <>
              {/* STEP 2: Pilih Jumlah Pose Strip */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 sm:mb-3.5">
                  <div className="w-5 h-5 rounded-full bg-[#6B111F] text-white flex items-center justify-center text-xs font-bold font-serif">
                    2
                  </div>
                  <h2 className="text-xs sm:text-sm font-serif font-bold text-gray-900">
                    Pilih Jumlah Pose Strip
                  </h2>
                </div>

                {/* 4 Strip Cards Grid */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
                  {STRIP_TYPES.map(t => {
                    const isSelected = targetPhotoCount === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectType(t.id)}
                        className={`relative rounded-xl sm:rounded-2xl pt-3 sm:pt-4 pb-2 sm:pb-3 px-1 sm:px-1.5 flex flex-col items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#6B111F] text-white shadow-lg shadow-rose-950/20 scale-[1.02]'
                            : 'bg-white text-gray-800 border border-gray-200/90 hover:border-rose-200'
                        }`}
                      >
                        {t.badge && (
                          <span className={`absolute -top-1.5 sm:-top-2 px-1.5 sm:px-2 py-0.5 rounded-full text-[7px] sm:text-[8px] font-bold text-white tracking-wider ${
                            isSelected ? 'bg-[#C4A46C]' : t.badgeColor
                          }`}>
                            {t.badge}
                          </span>
                        )}

                        <div className={`w-6 sm:w-8 rounded-md p-0.5 sm:p-1 my-1 flex flex-col gap-0.5 items-center justify-center ${
                          isSelected ? 'bg-black/30 border border-white/20' : 'bg-[#2E2421] border border-[#443834]'
                        }`}>
                          {Array.from({ length: t.slots }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`w-full rounded-xs ${
                                t.slots === 1 ? 'aspect-[4/3] bg-[#423632]' : 'h-1.5 sm:h-2 bg-[#423632]'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="text-center mt-0.5 sm:mt-1">
                          <div className={`text-[11px] sm:text-xs font-serif font-bold leading-tight ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {t.name}
                          </div>
                          <div className={`text-[8px] sm:text-[9px] mt-0.5 ${isSelected ? 'text-rose-200' : 'text-gray-400'}`}>
                            {t.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-gray-100 w-full" />

              {/* STEP 3: Warna Bingkai Strip */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 sm:mb-3.5">
                  <div className="w-5 h-5 rounded-full bg-[#6B111F] text-white flex items-center justify-center text-xs font-bold font-serif">
                    3
                  </div>
                  <h2 className="text-xs sm:text-sm font-serif font-bold text-gray-900">
                    Warna Bingkai Strip
                  </h2>
                </div>

                {/* Color Swatches */}
                <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-10 gap-2 sm:gap-2.5">
                  {colorThemes.map((c, idx) => {
                    const isSelected = activeColorIdx === idx;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectColor(idx)}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <div
                          style={{ 
                            backgroundColor: c.hex,
                            border: c.borderHex ? `2px solid ${c.borderHex}` : undefined
                          }}
                          className={`w-full aspect-[4/3] rounded-lg sm:rounded-xl transition-all shadow-xs flex items-center justify-center ${
                            isSelected
                              ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-[#6B111F] scale-105'
                              : 'border border-gray-200/80 group-hover:scale-102'
                          }`}
                        />
                        <span className={`text-[9px] sm:text-[10px] mt-1 sm:mt-1.5 tracking-tight font-sans transition-colors truncate max-w-full ${
                          isSelected ? 'font-bold text-[#6B111F]' : 'text-gray-500'
                        }`}>
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>

        </div>
      </div>

      {/* ================= 🌟 STICKY BOTTOM ACTION BAR 🌟 ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-rose-100/80 p-2.5 sm:p-4 pb-[max(env(safe-area-inset-bottom),10px)] z-40">
        <div className="max-w-lg mx-auto flex items-center gap-2.5 sm:gap-3">
        

          <button
            onClick={handleStartCamera}
            disabled={isStartingCamera}
            className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-[#6B111F] hover:bg-[#520C16] text-[#F5D77F] text-xs sm:text-sm font-serif font-bold shadow-lg shadow-rose-950/25 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98 transition cursor-pointer disabled:opacity-80"
          >
            {isStartingCamera ? (
              <>
                <RefreshCw size={14} className="animate-spin text-amber-300" />
                <span>Menyiapkan Kamera...</span>
              </>
            ) : (
              <span>Mulai Foto ({targetPhotoCount} Pose)</span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}