import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, UserCheck, Heart, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';

const STRIP_TYPES = [
  { id: 1, name: 'Polaroid', sub: '1 frame', badge: 'CLASSIC', badgeColor: 'bg-[#6B111F]', slots: 1 },
  { id: 2, name: '2 Foto', sub: '2 frames', badge: 'DUO', badgeColor: 'bg-[#6B111F]', slots: 2 },
  { id: 3, name: '3 Foto', sub: '3 frames', badge: null, slots: 3 },
  { id: 4, name: '4 Foto', sub: '4 frames', badge: 'POPULER', badgeColor: 'bg-[#C4A46C]', slots: 4 },
];

const COLOR_THEMES = [
  { id: 'burgundy', name: 'Burgundy', hex: '#6B111F', textHex: '#F5D77F', styleName: 'POLOS', subName: 'Minimalis Royal' },
  { id: 'ivory', name: 'Ivory', hex: '#FDFBF7', borderHex: '#E2DDD5', textHex: '#6B111F', styleName: 'IVORY BLISS', subName: 'Clean & Pure' },
  { id: 'slate', name: 'Slate', hex: '#2D3748', textHex: '#E2E8F0', styleName: 'NOIR SLATE', subName: 'Modern Dark' },
  { id: 'blush', name: 'Blush', hex: '#F3C5CB', textHex: '#6B111F', styleName: 'BLUSH ROMANCE', subName: 'Sweet Pastel' },
  { id: 'antique', name: 'Antique', hex: '#C4A46C', textHex: '#FFFFFF', styleName: 'ANTIQUE GOLD', subName: 'Vintage Luxury' },
];

export default function StepFrames() {
  const { 
    targetPhotoCount, 
    setTargetPhotoCount, 
    stripColor, 
    setStripColor,
    guestName,
    setGuestName,
    guestMessage,
    setGuestMessage,
    setCurrentStep,
    closeBooth 
  } = useBooth();

  const [nameError, setNameError] = useState(false);
  const nameInputRef = useRef(null);

  const [activeColorIdx, setActiveColorIdx] = useState(() => {
    const found = COLOR_THEMES.findIndex(c => c.hex === stripColor);
    return found >= 0 ? found : 0;
  });

  const canvasRef = useRef(null);

  const activeTheme = COLOR_THEMES[activeColorIdx] || COLOR_THEMES[0];

  const handleSelectType = (typeId) => {
    setTargetPhotoCount(typeId);
  };

  const handleSelectColor = (idx) => {
    setActiveColorIdx(idx);
    setStripColor(COLOR_THEMES[idx].hex);
  };

  const handlePrev = () => {
    const nextIdx = (activeColorIdx - 1 + COLOR_THEMES.length) % COLOR_THEMES.length;
    handleSelectColor(nextIdx);
  };

  const handleNext = () => {
    const nextIdx = (activeColorIdx + 1) % COLOR_THEMES.length;
    handleSelectColor(nextIdx);
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
    setCurrentStep('camera');
  };

  // Render high fidelity large live strip preview on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const count = targetPhotoCount;
    const theme = activeTheme;

    const w = 320;
    const pad = 16;
    const gap = 12;
    const photoW = w - pad * 2;
    const photoH = count === 1 ? Math.round(photoW * 1.15) : Math.round(photoW * (4 / 3));
    const headH = 50;
    const footH = 58;
    const totalH = pad + headH + (photoH * count) + (gap * (count - 1)) + footH + pad;

    canvas.width = w * 2;
    canvas.height = totalH * 2;
    ctx.scale(2, 2);

    // Background color
    ctx.fillStyle = theme.hex;
    ctx.fillRect(0, 0, w, totalH);

    // Header branding
    ctx.fillStyle = theme.textHex;
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE WEDDING OF', w / 2, pad + 18);

    ctx.font = 'italic bold 17px Georgia, serif';
    ctx.fillText('Sabrina & Raka', w / 2, pad + 38);

    // Photo slots
    for (let i = 0; i < count; i++) {
      const y = pad + headH + i * (photoH + gap);

      // Inner box
      ctx.fillStyle = theme.hex === '#FDFBF7' ? '#EAE5DC' : 'rgba(0,0,0,0.32)';
      ctx.fillRect(pad, y, photoW, photoH);

      // Icon & Pose Label
      ctx.fillStyle = theme.textHex;
      ctx.font = '14px serif';
      ctx.fillText('📷', w / 2, y + photoH / 2 - 4);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`Pose #${i + 1}`, w / 2, y + photoH / 2 + 13);
    }

    // Footer signature: Line 1 (With Love & Blessings) & Line 2 (Marko - Aesthetic & Crystal Clear Font)
    const displayName = guestName.trim() ? guestName.trim() : 'Tamu Undangan';
    ctx.fillStyle = theme.hex === '#FDFBF7' ? '#6B111F' : 'rgba(255,255,255,0.85)';
    ctx.font = 'italic 10.5px Georgia, serif';
    ctx.fillText('With Love & Blessings,', w / 2, totalH - pad - 24);

    ctx.fillStyle = theme.textHex;
    ctx.font = "italic bold 17px 'Playfair Display', 'Cormorant Garamond', Georgia, serif";
    ctx.fillText(displayName, w / 2, totalH - pad - 6);
  }, [targetPhotoCount, activeTheme, guestName]);

  return (
    <div className="fixed inset-0 z-[100] w-full h-[100dvh] max-h-[100dvh] bg-[#FBF8F2] text-gray-900 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Full-Width Scrollable Container (No deadzones) */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar">
        <div className="px-3.5 sm:px-6 pt-3.5 sm:pt-5 pb-24 sm:pb-28 max-w-lg mx-auto w-full">
        
        {/* ================= 🌟 TOP HEADER 🌟 ================= */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div>
            <p className="text-[9px] sm:text-[10px] font-serif font-bold uppercase tracking-widest text-[#C4A46C]">
              THE WEDDING OF SABRINA & RAKA
            </p>
            <h1 className="text-xl sm:text-3xl font-serif font-bold text-gray-900 leading-tight mt-0.5">
              Studio Pemilihan <span className="text-[#6B111F]">Strip & Bingkai</span>
            </h1>
          </div>

          <button
            onClick={closeBooth}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-sm border border-gray-200/80 flex items-center justify-center text-gray-500 hover:text-gray-900 active:scale-95 transition cursor-pointer flex-shrink-0 ml-2"
            title="Tutup"
          >
            <X size={16} />
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
          <div className="relative w-full flex items-center justify-center py-1 sm:py-2">
            
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute left-0 sm:left-3 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-gray-200/80 flex items-center justify-center text-gray-700 hover:text-[#6B111F] active:scale-90 transition cursor-pointer"
              title="Warna Sebelumnya"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Floating Large Live Strip Canvas */}
            <div className="p-1 sm:p-1.5 rounded-2xl shadow-2xl shadow-rose-950/20 bg-white/60 backdrop-blur-sm border border-white/90 transition-all duration-300 transform hover:scale-[1.01] max-w-[240px] xs:max-w-[270px] sm:max-w-[320px] w-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full max-h-[300px] xs:max-h-[340px] sm:max-h-[380px] h-auto mx-auto object-contain rounded-xl shadow-xs"
              />
            </div>

            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute right-0 sm:right-3 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-gray-200/80 flex items-center justify-center text-gray-700 hover:text-[#6B111F] active:scale-90 transition cursor-pointer"
              title="Warna Selanjutnya"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Under-Preview Labels */}
          <div className="text-center mt-2 sm:mt-3">
            <h3 className="text-[11px] sm:text-xs font-serif font-bold tracking-widest text-[#C4A46C] uppercase">
              {activeTheme.styleName}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-sans mt-0.5">
              {activeTheme.subName}
            </p>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 my-2">
              {COLOR_THEMES.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectColor(i)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    i === activeColorIdx
                      ? 'w-4 sm:w-5 h-1.5 bg-[#C4A46C]'
                      : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Mode Badge Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-rose-50 border border-rose-200 text-[#6B111F] text-[11px] sm:text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6B111F]"></span>
              <span>Mode: {targetPhotoCount === 1 ? 'Polaroid Single' : `${targetPhotoCount} Foto Strip`}</span>
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
                  Nama Tamu & Doa Restu
                </h2>
              </div>
            </div>

            {guestName && guestName.trim() && (
              <div className="mb-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-900 font-bold">
                  <UserCheck size={13} className="text-amber-600" />
                  <span>Undangan: <b>{guestName.trim()}</b></span>
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
                      <span>Isi Nama Tamu kamu terlebih dahulu!</span>
                      {/* Downward Caret Arrow pointing to the input */}
                      <div className="absolute -bottom-1 left-6 w-2.5 h-2.5 bg-rose-600 rotate-45 border-r border-b border-red-300/60" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] sm:text-xs font-bold text-gray-700 flex items-center gap-1">
                    <span>Nama Lengkap Tamu</span>
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
                  Pesan / Doa Singkat <span className="text-gray-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Doa singkat (Contoh: Bahagia selalu Sabrina & Raka!)..."
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

          {/* STEP B: Pilih Tipe & Jumlah Pose Strip */}
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

          {/* STEP C: Warna Bingkai Strip */}
          <div>
            <div className="flex items-center gap-2 mb-2.5 sm:mb-3.5">
              <div className="w-5 h-5 rounded-full bg-[#6B111F] text-white flex items-center justify-center text-xs font-bold font-serif">
                3
              </div>
              <h2 className="text-xs sm:text-sm font-serif font-bold text-gray-900">
                Warna Bingkai Strip
              </h2>
            </div>

            {/* 5 Color Swatches */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
              {COLOR_THEMES.map((c, idx) => {
                const isSelected = activeColorIdx === idx;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectColor(idx)}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div
                      style={{ backgroundColor: c.hex }}
                      className={`w-full aspect-[4/3] rounded-lg sm:rounded-xl transition-all shadow-xs flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-[#6B111F] scale-105'
                          : 'border border-gray-200/80 group-hover:scale-102'
                      }`}
                    />
                    <span className={`text-[9px] sm:text-[10px] mt-1 sm:mt-1.5 tracking-tight font-sans transition-colors ${
                      isSelected ? 'font-bold text-[#6B111F]' : 'text-gray-500'
                    }`}>
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        </div>
      </div>

      {/* ================= 🌟 STICKY BOTTOM ACTION BAR 🌟 ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-rose-100/80 p-2.5 sm:p-4 pb-[max(env(safe-area-inset-bottom),10px)] z-40">
        <div className="max-w-lg mx-auto flex items-center gap-2.5 sm:gap-3">
        

          <button
            onClick={handleStartCamera}
            className="flex-1 py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-[#6B111F] hover:bg-[#520C16] text-[#F5D77F] text-xs sm:text-sm font-serif font-bold shadow-lg shadow-rose-950/25 flex items-center justify-center gap-1.5 sm:gap-2 active:scale-98 transition cursor-pointer"
          >
            <span>Mulai Foto ({targetPhotoCount} Pose)</span>
          </button>
        </div>
      </div>

    </div>
  );
}