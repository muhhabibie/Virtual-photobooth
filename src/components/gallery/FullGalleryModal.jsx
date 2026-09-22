import { useState } from 'react';
import { ArrowLeft, Plus, Share2, Download, Volume2, Search, X, Calendar, Clock, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import SpotifyVoicePlayer from '../ui/SpotifyVoicePlayer';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';

function getNowIndonesianDate() {
  const now = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} • ${hours}:${minutes} WIB`;
}

function getNowShortDate() {
  const now = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
  return `${now.getDate()} · ${months[now.getMonth()]} · ${now.getFullYear()}`;
}

export default function FullGalleryModal() {
  const { 
    galleryModalOpen, 
    closeGalleryModal, 
    openBooth, 
    capturedPhotos, 
    guestName,
    guestMessage,
    stripColor,
    voiceUrl 
  } = useBooth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all'); // 'all' | '1-cut' | '2-cut' | '4-cut'
  const [likes, setLikes] = useState({});
  const [fullFrameModal, setFullFrameModal] = useState(null);

  if (!galleryModalOpen) return null;

  // Real-time user submission card
  const userSubmission = capturedPhotos.length > 0 ? {
    id: 'user-latest-live',
    guestName: guestName || 'Tamu Undangan (Kamu)',
    takenDate: getNowIndonesianDate(),
    shortDate: getNowShortDate(),
    photos: capturedPhotos.map(p => p.dataUrl),
    type: capturedPhotos.length === 1 ? 'polaroid' : `${capturedPhotos.length}-cut`,
    colorHex: stripColor || '#6B111F',
    textHex: stripColor === '#FDFBF7' || stripColor === '#F3C5CB' ? '#6B111F' : '#F5D77F',
    hasVoice: !!voiceUrl,
    voiceUrl: voiceUrl,
    message: guestMessage && guestMessage.trim() ? guestMessage.trim() : '',
    likes: 1,
  } : null;

  const fullList = userSubmission ? [userSubmission, ...MOCK_GALLERY_PHOTOS] : MOCK_GALLERY_PHOTOS;

  // Search & Category Type Filter
  const filteredList = fullList.filter(item => {
    const matchesSearch = item.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const count = item.photos ? item.photos.length : 1;
    let matchesType = true;
    if (activeTypeFilter === '1-cut') matchesType = count === 1;
    if (activeTypeFilter === '2-cut') matchesType = count === 2;
    if (activeTypeFilter === '4-cut') matchesType = count >= 3;

    return matchesSearch && matchesType;
  });

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikes(prev => {
      const isLiked = !prev[id];
      if (isLiked) toast('❤️ Kamu menyukai foto ini!', 'info');
      return { ...prev, [id]: isLiked };
    });
  };

  const handleShare = async (item, e) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Photo Strip ${item.guestName} • The Wedding of Sabrina & Raka`,
          text: `Lihat photo strip pernikahan dari ${item.guestName}! 💍✨ (${item.takenDate})`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast('🔗 Tautan berhasil disalin!', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-[100dvh] max-h-[100dvh] bg-[#0C0409] text-white flex flex-col font-sans select-none overflow-hidden animate-fadeIn">
      
      {/* ================= 🌟 1. LUXURY DARK GLASS TOP NAVIGATION BAR 🌟 ================= */}
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 bg-[#14060E]/85 backdrop-blur-xl border-b border-[#C4A46C]/30 flex-shrink-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
        <button
          onClick={closeGalleryModal}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white hover:text-[#F5D77F] flex items-center gap-1.5 active:scale-95 transition cursor-pointer backdrop-blur-md shadow-sm"
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>

        <button
          onClick={() => {
            closeGalleryModal();
            openBooth();
          }}
          className="btn-pink text-xs px-4 sm:px-5 py-1.5 sm:py-2 shadow-lg shadow-rose-950/50"
        >
          <span>Ambil Foto</span>
        </button>
      </div>

      {/* ================= 🌟 2. SCROLLABLE GALLERY BODY WITH CONTINUOUS BURGUNDY-GOLD RADIANCE 🌟 ================= */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 sm:pb-28 no-scrollbar bg-[#0E050A] text-white relative">
        
        {/* Layer 1: Top Golden Halo Beam */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1200px] h-[550px] pointer-events-none z-0 rounded-full opacity-60 blur-[120px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245, 215, 127, 0.40) 0%, rgba(168, 30, 50, 0.35) 50%, transparent 80%)'
          }}
        />

        {/* Layer 2: Central Ambient Deep Crimson Spotlight Blooming Behind Grid */}
        <div 
          className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] max-w-[1300px] h-[800px] sm:h-[950px] pointer-events-none z-0 rounded-full opacity-80 blur-[140px] sm:blur-[170px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(168, 30, 50, 0.70) 0%, rgba(115, 18, 33, 0.45) 45%, rgba(196, 164, 108, 0.20) 75%, transparent 92%)'
          }}
        />
        
        {/* ================= 🌟 GRAND EDITORIAL LUXURY HERO BANNER WITH PROGRESSIVE GRADIENT BLUR FADE 🌟 ================= */}
        <div className="relative w-full min-h-[380px] xs:min-h-[420px] sm:min-h-[480px] pt-8 sm:pt-12 pb-16 sm:pb-20 flex flex-col items-center justify-center overflow-hidden">
          
          {/* Couple Photo Background with Multi-Layer Progressive Blur & Color Mask Dissolve */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Base Image */}
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85"
              alt="The Wedding of Sabrina & Raka"
              className="w-full h-full object-cover object-top filter brightness-85 contrast-105 transform scale-102"
            />

            {/* Top Soft Vignette */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-10" />

            {/* Progressive Blur Overlay Layer (Gradually blurs the photo from mid to bottom) */}
            <div 
              className="absolute inset-x-0 bottom-0 h-4/5 backdrop-blur-[8px] sm:backdrop-blur-[12px] z-10"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%)',
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%)'
              }}
            />

            {/* Multi-Stop Color Dissolve Layer (Smoothly fades the blurred photo into #0E050A background) */}
            <div 
              className="absolute inset-0 z-20"
              style={{
                background: `linear-gradient(to bottom, 
                  rgba(14, 5, 10, 0.15) 0%, 
                  rgba(14, 5, 10, 0.35) 25%, 
                  rgba(14, 5, 10, 0.70) 55%, 
                  rgba(14, 5, 10, 0.92) 80%, 
                  #0E050A 100%
                )`
              }}
            />
          </div>

          {/* Grand Gold Calligraphy Header ("Galeri Pengunjung") */}
          <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-xl mx-auto my-auto pointer-events-none">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-1.5 rounded-full bg-[#180A12]/85 backdrop-blur-xl border border-[#C4A46C]/50 shadow-xl shadow-amber-950/40 mb-2 sm:mb-3">
              <span 
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                className="text-[9px] sm:text-[10px] font-bold tracking-[0.28em] text-[#F5D77F] uppercase"
              >
                MOMENTS & GUESTBOOK
              </span>
            </div>

            {/* Grand Gold Calligraphy: Galeri Pengunjung */}
            <h2 
              className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl font-normal leading-tight my-1 drop-shadow-2xl select-none pt-2 pb-2 px-6 overflow-visible"
              style={{ 
                fontFamily: "'Great Vibes', 'Alex Brush', cursive",
                background: 'linear-gradient(135deg, #FFFFFF 10%, #FFF2CC 40%, #F5D77F 70%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.9)) drop-shadow(0 0 35px rgba(245,215,127,0.45))'
              }}
            >
              Galeri Pengunjung
            </h2>

            {/* Subtitle Divider & Quote */}
            <div className="flex items-center justify-center gap-3 my-1 w-full max-w-sm">
              <div className="h-px bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent flex-1" />
              <span className="text-[9px] font-serif tracking-[0.25em] text-[#F5D77F] uppercase font-bold">
                THE WEDDING OF SABRINA & RAKA
              </span>
              <div className="h-px bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent flex-1" />
            </div>

            <p className="text-[11px] sm:text-xs text-amber-100/90 font-serif italic max-w-md px-4 mt-1 leading-snug drop-shadow">
              "Setiap senyuman, doa restu, dan kenangan manis yang terabadikan abadi dari seluruh tamu tercinta."
            </p>

            {/* Date & Collection Count Pill */}
            <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/65 backdrop-blur-xl border border-amber-400/40 shadow-xl text-xs text-amber-200 font-serif">
              <Calendar size={12} className="text-[#F5D77F]" />
              <span>{fullList.length} Koleksi Photo Strip & Ucapan Doa Tamu</span>
            </div>

          </div>

        </div>

        {/* ================= 🌟 3. DARK GLASS SEARCH BAR & FILTER TABS 🌟 ================= */}
        <div className="max-w-md sm:max-w-lg mx-auto px-4 relative z-30 -mt-6 sm:-mt-8 mb-6 sm:mb-8 flex flex-col gap-2.5">
          <div className="bg-[#1C0816]/85 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-[0_14px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(245,215,127,0.18)] border border-[#C4A46C]/60 flex items-center gap-3 transition-all hover:border-[#F5D77F]">
            <Search size={16} className="text-[#F5D77F] ml-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari nama tamu atau ucapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-3 py-1.5 bg-transparent text-xs sm:text-sm text-white placeholder-amber-100/50 outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-amber-200/60 hover:text-white mr-2 text-xs flex-shrink-0 p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills (Filter by Strip Length/Pose Count) */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: 'all', label: 'Semua Strip' },
              { id: '1-cut', label: '1 Foto (Polaroid)' },
              { id: '2-cut', label: '2 Foto (Duo)' },
              { id: '4-cut', label: '4 Cut Classic' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTypeFilter(tab.id)}
                className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                  activeTypeFilter === tab.id
                    ? 'bg-gradient-to-r from-[#6B111F] to-[#8A1828] text-[#F5D77F] border border-amber-400/60 shadow-lg scale-105'
                    : 'bg-black/60 border border-white/15 text-gray-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= 🌟 4. PINTEREST MASONRY COLUMNS GRID 🌟 ================= */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          
          {filteredList.length === 0 ? (
            <div className="text-center py-16 bg-[#180812]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-amber-400/30 flex items-center justify-center text-3xl mx-auto mb-3">
                🔍
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-1">Foto Tidak Ditemukan</h3>
              <p className="text-xs text-gray-400">Coba ubah kata kunci pencarian atau filter tipe strip.</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3.5 sm:gap-5 space-y-3.5 sm:space-y-5">
              {filteredList.map((item) => {
                const isLight = item.colorHex === '#FAF6F0' || item.colorHex === '#FDFBF7' || item.colorHex === '#ffffff' || item.colorHex === '#F3C5CB';
                const textColor = isLight ? '#3A2D28' : (item.textHex || '#F5D77F');
                const subTextColor = isLight ? '#8C7A6B' : 'rgba(245, 215, 127, 0.85)';
                const guestNameColor = isLight ? '#5A4A3E' : '#FFFFFF';
                const borderColor = isLight ? 'border-[#D4C5B0]' : 'border-white/25';
                const dividerColor = isLight ? 'border-[#D9CFC4]' : 'border-white/20';

                const photosList = (item.photos && item.photos.length > 0) ? item.photos : [item.photo];

                const rawMsg = item.message ? item.message.trim() : '';
                const truncatedMsg = rawMsg.length > 55 ? `${rawMsg.slice(0, 55).trim()}...` : rawMsg;

                return (
                  <div
                    key={item.id}
                    onClick={() => setFullFrameModal(item)}
                    style={{ backgroundColor: item.colorHex || '#6B111F' }}
                    className="break-inside-avoid inline-block w-full relative overflow-hidden h-fit rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 shadow-[0_14px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(245,215,127,0.12)] border border-white/25 flex flex-col justify-start gap-1 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-amber-500/25 cursor-pointer group"
                  >
                    {/* 1. Top Header */}
                    <div className="text-center pt-0.5 pb-1 flex-shrink-0 z-10">
                      <p 
                        style={{ color: subTextColor }}
                        className="text-[6.5px] sm:text-[7.5px] font-mono font-bold uppercase tracking-widest"
                      >
                        ✦ THE WEDDING OF ✦
                      </p>
                    </div>

                    {/* 2. Photo Cuts Stack */}
                    <div className="relative w-full flex flex-col justify-start gap-1 flex-shrink-0 overflow-hidden z-10">
                      {photosList.map((src, i) => (
                        <div 
                          key={i} 
                          className={`w-full rounded-lg sm:rounded-xl overflow-hidden bg-black/20 border border-black/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex-shrink-0 ${
                            photosList.length === 1 ? 'aspect-[4/5]' : 'aspect-[3/4]'
                          }`}
                        >
                          <img
                            src={src}
                            alt={`${item.guestName} pose ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ))}

                      {/* Voice Note Badge (Frosted Glass Pill) */}
                      {item.hasVoice && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[#F5D77F] border border-[#F5D77F]/40 text-[7.5px] sm:text-[8px] font-mono flex items-center gap-1 shadow-lg z-20">
                          <Volume2 size={9} className="animate-pulse" />
                          <span>Doa</span>
                        </span>
                      )}
                    </div>

                    {/* 3. Middle Signature: Couple Calligraphy, Date & Guest Name */}
                    <div className="text-center pt-1 pb-1 flex-shrink-0 flex flex-col items-center z-10">
                      <h3 
                        style={{ 
                          color: textColor,
                          fontFamily: "'Alex Brush', 'Great Vibes', 'Playfair Display', cursive" 
                        }}
                        className="text-base sm:text-xl font-serif italic leading-tight drop-shadow-xs"
                      >
                        Sabrina & Raka
                      </h3>
                      <p className="text-[6.5px] sm:text-[7.5px] font-mono tracking-widest mt-0.5" style={{ color: subTextColor }}>
                        {item.shortDate || '30 · 05 · 2026'}
                      </p>
                      <h4 
                        style={{ color: guestNameColor }}
                        className="text-xs sm:text-sm font-sans font-bold leading-tight mt-0.5 tracking-wide truncate max-w-full px-1" 
                      >
                        {item.guestName}
                      </h4>
                    </div>

                    {/* 4. Bottom Quoted Message & Divider (Only rendered if message exists) */}
                    {rawMsg ? (
                      <>
                        <div className={`w-full border-t ${dividerColor} my-1 flex-shrink-0 z-10`} />
                        <div className="pt-0.5 pb-0.5 text-center flex-shrink-0 flex items-center justify-center px-1 overflow-hidden z-10">
                          <p 
                            style={{ color: isLight ? '#7A6A5D' : 'rgba(255, 255, 255, 0.92)' }}
                            className="text-[9px] sm:text-[10px] font-serif italic leading-snug line-clamp-2 overflow-hidden text-ellipsis"
                          >
                            "{truncatedMsg}"
                          </p>
                        </div>
                      </>
                    ) : null}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* ================= 🌟 5. FULL LIGHTBOX: DIRECT PHOTOSTRIP FRAME (FULL-SCREEN SCROLLABLE) 🌟 ================= */}
      <AnimatePresence>
        {fullFrameModal && (() => {
          const modalIsLight = fullFrameModal.colorHex === '#FAF6F0' || fullFrameModal.colorHex === '#FDFBF7' || fullFrameModal.colorHex === '#ffffff' || fullFrameModal.colorHex === '#F3C5CB';
          const modalTextColor = modalIsLight ? '#3A2D28' : (fullFrameModal.textHex || '#F5D77F');
          const modalSubTextColor = modalIsLight ? '#8C7A6B' : 'rgba(245, 215, 127, 0.8)';
          const modalGuestColor = modalIsLight ? '#5A4A3E' : '#FFFFFF';
          const modalDividerColor = modalIsLight ? 'border-[#D9CFC4]' : 'border-white/20';
          const modalBorderColor = modalIsLight ? 'border-[#D4C5B0]' : 'border-white/25';

          const modalRawMsg = fullFrameModal.message ? fullFrameModal.message.trim() : '';
          const modalTruncatedMsg = modalRawMsg.length > 70 ? `${modalRawMsg.slice(0, 70).trim()}...` : modalRawMsg;

          return (
            <div 
              className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md overflow-y-auto no-scrollbar flex flex-col items-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
              onClick={(e) => {
                if (e.target === e.currentTarget) setFullFrameModal(null);
              }}
            >
              {/* Floating Close Button */}
              <button
                onClick={() => setFullFrameModal(null)}
                className="fixed top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-base font-bold backdrop-blur-md border border-white/25 transition active:scale-95 cursor-pointer z-50 shadow-2xl"
                title="Tutup"
              >
                <X size={18} />
              </button>

              {/* Direct Photostrip Container (Interactive wrapper, centered with margin-auto) */}
              <div 
                className="relative w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[330px] my-auto flex flex-col items-center gap-2.5 sm:gap-3 py-6 sm:py-8 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Exact Physical Photostrip with Full Frame Header, All Photo Cuts & Footer */}
                <div 
                  style={{ backgroundColor: fullFrameModal.colorHex || '#6B111F' }}
                  className={`w-full h-fit rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-2xl border ${modalBorderColor} flex flex-col justify-start`}
                >
                  {/* Frame Header Calligraphy */}
                  <div className="text-center pb-1">
                    <p 
                      style={{ color: modalSubTextColor }}
                      className="text-[7.5px] sm:text-[8.5px] font-mono font-bold uppercase tracking-widest"
                    >
                      ✦ THE WEDDING OF ✦
                    </p>
                  </div>

                  {/* All Photo Cuts in the Strip */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 py-1.5">
                    {fullFrameModal.photos.map((src, i) => (
                      <div 
                        key={i} 
                        className={`relative w-full rounded-xl overflow-hidden bg-black/20 border border-black/10 shadow-inner ${
                          fullFrameModal.photos.length === 1 ? 'aspect-[4/5]' : 'aspect-[3/4]'
                        }`}
                      >
                        <img src={src} alt={`Cut ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Middle Section: Couple Calligraphy, Date & Guest Name */}
                  <div className="text-center pt-2 pb-1.5 flex flex-col items-center">
                    <h3 
                      style={{ 
                        color: modalTextColor,
                        fontFamily: "'Alex Brush', 'Great Vibes', 'Playfair Display', cursive" 
                      }}
                      className="text-xl sm:text-2xl font-serif italic leading-tight"
                    >
                      Sabrina & Raka
                    </h3>
                    <p className="text-[7.5px] sm:text-[8.5px] font-mono tracking-widest mt-0.5" style={{ color: modalSubTextColor }}>
                      {fullFrameModal.shortDate || '30 · 05 · 2026'}
                    </p>
                    <h4 
                      style={{ color: modalGuestColor }}
                      className="text-sm sm:text-base font-sans font-bold leading-tight mt-0.5 tracking-wide"
                    >
                      {fullFrameModal.guestName}
                    </h4>
                  </div>

                  {/* Bottom Message & Divider (Only rendered if message exists) */}
                  {modalRawMsg ? (
                    <>
                      <div className={`w-full border-t ${modalDividerColor} my-1.5`} />
                      <div className="py-1 text-center flex items-center justify-center px-1">
                        <p 
                          style={{ color: modalIsLight ? '#7A6A5D' : 'rgba(255, 255, 255, 0.9)' }}
                          className="text-[10px] sm:text-[11px] font-serif italic leading-snug line-clamp-3"
                        >
                          "{modalTruncatedMsg}"
                        </p>
                      </div>
                    </>
                  ) : null}

                </div>

              {/* Guest Message Card (Clean floating pill) */}
              {fullFrameModal.message && (
                <div className="w-full px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/15 text-xs text-rose-100 italic text-center shadow-lg">
                  "{fullFrameModal.message}"
                </div>
              )}

              {/* Attached Spotify-style Voice Note Audio Player */}
              {fullFrameModal.hasVoice && (
                <div className="w-full">
                  <SpotifyVoicePlayer
                    voiceUrl={fullFrameModal.voiceUrl}
                    guestName={fullFrameModal.guestName}
                    totalDuration={24}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 w-full mt-0.5">
                <button
                  onClick={() => handleShare(fullFrameModal)}
                  className="flex-1 py-2.5 sm:py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = fullFrameModal.photos[0];
                    a.download = `wedding_photostrip_${fullFrameModal.guestName}.jpg`;
                    a.click();
                    toast('Photo strip berhasil diunduh HD! 💍', 'success');
                  }}
                  className="flex-1 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] text-[#F5D77F] border border-[#E5C158]/50 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xl transition active:scale-95 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download HD</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}
      </AnimatePresence>

    </div>
  );
}