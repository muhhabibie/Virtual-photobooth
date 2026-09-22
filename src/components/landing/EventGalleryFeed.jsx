import { useState } from 'react';
import { Share2, Plus, Volume2, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';

const romanticTransition = {
  duration: 1.1,
  ease: [0.22, 1, 0.36, 1],
};

export default function EventGalleryFeed() {
  const { openBooth, openGalleryModal, capturedPhotos, guestName } = useBooth();
  const { toast } = useToast();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Galeri Pengunjung The Wedding of Sabrina & Raka',
          text: 'Lihat photo strip kenangan pernikahan Sabrina & Raka!',
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast('🔗 Tautan galeri berhasil disalin!', 'success');
    }
  };

  // Prepend live user submission if taken
  const userCard = capturedPhotos.length > 0 ? {
    id: 'user-submission',
    guestName: guestName || 'Tamu Undangan (Kamu)',
    date: '30 - 05 - 2026',
    photos: capturedPhotos.map(p => p.dataUrl),
    colorHex: '#6B111F',
    textHex: '#F5D77F',
    hasVoice: true,
  } : null;

  const baseCards = userCard ? [userCard, ...MOCK_GALLERY_PHOTOS] : MOCK_GALLERY_PHOTOS;
  
  // Duplicated for infinite continuous seamless loop from right to left
  const doubledCards = [...baseCards, ...baseCards];

  return (
    <section id="gallery-feed" className="relative bg-gradient-to-b from-[#0E050A] via-[#0E050A] to-[#14060C] text-white pt-0 pb-24 sm:pb-28 overflow-hidden select-none">
      
      {/* ================= 🌟 1. TOP ROMANTIC WEDDING PHOTO WITH CINEMATIC MASK FADE 🌟 ================= */}
      <div className="relative w-full h-[280px] sm:h-[340px] overflow-hidden bg-[#0E050A]">
        {/* Background Wedding Couple Photo with Mask Fade */}
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85"
          alt="Sabrina & Raka"
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)',
          }}
          className="w-full h-full object-cover object-top filter brightness-85"
        />

        {/* Top Soft Shadow */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Bottom Soft Opacity Blur Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-28 sm:h-36 bg-gradient-to-t from-[#0E050A] via-[#0E050A]/70 to-transparent backdrop-blur-[2px] pointer-events-none" />
      </div>

      {/* ================= 🌟 GRAND MULTI-LAYERED AMBIENT SPOTLIGHT GRADIENT AURA 🌟 ================= */}
      {/* Layer 1: Giant Deep Burgundy & Wine Crimson Backdrop Radiance */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] max-w-[1500px] h-[850px] sm:h-[1150px] pointer-events-none z-0 rounded-full opacity-85 blur-[120px] sm:blur-[160px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(138, 24, 40, 0.85) 0%, rgba(107, 17, 31, 0.60) 35%, rgba(74, 8, 21, 0.40) 60%, rgba(196, 164, 108, 0.20) 80%, transparent 95%)'
        }}
      />

      {/* Layer 2: Core Golden Light Beam (Pendaran Emas Megah) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[125%] max-w-[950px] h-[480px] sm:h-[680px] pointer-events-none z-0 rounded-full opacity-60 blur-[85px] sm:blur-[115px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 215, 127, 0.52) 0%, rgba(212, 175, 55, 0.32) 40%, rgba(138, 24, 40, 0.22) 70%, transparent 88%)'
        }}
      />

      {/* Layer 3: Header Golden Crown Beam */}
      <div 
        className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] sm:w-[1200px] h-[450px] pointer-events-none z-0 rounded-full opacity-50 blur-[110px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 215, 127, 0.48) 0%, rgba(138, 24, 40, 0.35) 55%, transparent 80%)'
        }}
      />

      {/* ================= 🌟 2. EDITORIAL LUXURY SECTION HEADER ("Galeri Pengunjung") 🌟 ================= */}
      <div className="relative z-20 max-w-xl mx-auto px-4 -mt-32 sm:-mt-36 text-center mb-6">
        
        {/* Gold Ornament Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={romanticTransition}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#180A12]/80 backdrop-blur-md border border-[#C4A46C]/40 shadow-lg shadow-black/50 mb-2.5"
        >
          <span 
            style={{ fontFamily: "'Cinzel', Georgia, serif" }}
            className="text-[9px] sm:text-[10px] font-bold tracking-[0.28em] text-[#F5D77F] uppercase"
          >
            MOMENTS & GUESTBOOK
          </span>
        </motion.div>

        {/* Big Grand Aesthetic Title: Galeri Pengunjung (No Font Clipping) */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ ...romanticTransition, delay: 0.1 }}
          className="text-5xl xs:text-6xl sm:text-7xl font-normal leading-tight my-1 drop-shadow-2xl pt-4 pb-4 px-6 overflow-visible"
          style={{ 
            fontFamily: "'Great Vibes', 'Alex Brush', cursive",
            background: 'linear-gradient(135deg, #FFFFFF 10%, #FFF2CC 40%, #F5D77F 70%, #D4AF37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(245,215,127,0.35))'
          }}
        >
          Galeri Pengunjung
        </motion.h2>

        {/* Subtitle Divider & Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ ...romanticTransition, delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 my-1 w-full max-w-sm mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent flex-1" />
            <span className="text-[9px] font-serif tracking-[0.25em] text-[#F5D77F] uppercase font-bold">
              THE WEDDING OF SABRINA & RAKA
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent flex-1" />
          </div>

          <p className="text-[11px] sm:text-xs text-amber-100/90 font-serif italic max-w-md mx-auto px-4 mt-1 leading-snug drop-shadow">
            "Setiap senyuman, doa restu, dan kenangan manis yang terabadikan abadi dari seluruh tamu tercinta."
          </p>
        </motion.div>
      </div>

      {/* ================= 🌟 3. RIGHT-TO-LEFT HORIZONTAL INFINITE CAROUSEL 🌟 ================= */}
      <div className="relative w-full overflow-hidden py-3 z-20">
        
        {/* Soft edge blur vignettes */}
        <div className="absolute left-0 inset-y-0 w-8 sm:w-24 bg-gradient-to-r from-[#0E050A] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-8 sm:w-24 bg-gradient-to-l from-[#0E050A] to-transparent z-10 pointer-events-none" />

        {/* Infinite Sliding Track (Right to Left) */}
        <div className="marquee-track-h flex items-center gap-3.5 sm:gap-5 hover:[animation-play-state:paused] cursor-pointer">
          {doubledCards.map((card, idx) => {
            const isLight = card.colorHex === '#FAF6F0' || card.colorHex === '#FDFBF7' || card.colorHex === '#ffffff' || card.colorHex === '#F3C5CB';
            const textColor = isLight ? '#3A2D28' : (card.textHex || '#F5D77F');
            const subTextColor = isLight ? '#8C7A6B' : 'rgba(245, 215, 127, 0.85)';
            const guestNameColor = isLight ? '#5A4A3E' : '#FFFFFF';
            const borderColor = isLight ? 'border-[#D4C5B0]' : 'border-white/25';
            const dividerColor = isLight ? 'border-[#D9CFC4]' : 'border-white/20';

            const photosList = (card.photos && card.photos.length > 0) ? card.photos : [card.photo];

            const rawMsg = card.message ? card.message.trim() : '';
            const truncatedMsg = rawMsg.length > 55 ? `${rawMsg.slice(0, 55).trim()}...` : rawMsg;

            return (
              <div
                key={`${card.id}-${idx}`}
                onClick={openGalleryModal}
                style={{ backgroundColor: card.colorHex || '#6B111F' }}
                className={`relative overflow-hidden w-48 xs:w-54 sm:w-60 h-fit rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-[0_14px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(245,215,127,0.12)] border ${borderColor} flex flex-col justify-start gap-1 transition-all duration-300 transform hover:scale-105 flex-shrink-0 group before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/15 before:to-transparent before:pointer-events-none before:z-20`}
              >
                {/* 1. Top Header */}
                <div className="text-center pt-0.5 pb-1 flex-shrink-0 z-10">
                  <p 
                    style={{ color: subTextColor }}
                    className="text-[7px] sm:text-[8px] font-mono font-bold uppercase tracking-widest"
                  >
                    ✦ THE WEDDING OF ✦
                  </p>
                </div>

                {/* 2. Photo Cuts Stack */}
                <div className="relative w-full flex flex-col justify-start gap-1 flex-shrink-0 overflow-hidden z-10">
                  {photosList.map((src, i) => (
                    <div 
                      key={i} 
                      className="w-full aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-black/20 border border-black/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] flex-shrink-0"
                    >
                      <img
                        src={src}
                        alt={`${card.guestName} pose ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}

                  {/* Voice Note Badge (Frosted Glass Pill) */}
                  {card.hasVoice && (
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[#F5D77F] border border-[#F5D77F]/40 text-[7.5px] sm:text-[8px] font-mono flex items-center gap-1 shadow-lg z-20">
                      <Volume2 size={9} className="animate-pulse" />
                      <span>Doa</span>
                    </span>
                  )}
                </div>

                {/* 3. Middle Signature: Couple Calligraphy, Date & Guest Name */}
                <div className="text-center pt-1.5 pb-1 flex-shrink-0 flex flex-col items-center z-10">
                  <h3 
                    style={{ 
                      color: textColor,
                      fontFamily: "'Alex Brush', 'Great Vibes', 'Playfair Display', cursive" 
                    }}
                    className="text-lg sm:text-2xl font-serif italic leading-tight drop-shadow-xs"
                  >
                    Sabrina & Raka
                  </h3>
                  <p className="text-[7px] sm:text-[8px] font-mono tracking-widest mt-0.5" style={{ color: subTextColor }}>
                    {card.date || '30 · 05 · 2026'}
                  </p>
                  <h4 
                    style={{ color: guestNameColor }}
                    className="text-xs sm:text-sm font-sans font-bold leading-tight mt-0.5 tracking-wide truncate max-w-full px-1" 
                  >
                    {card.guestName}
                  </h4>
                </div>

                {/* 4. Bottom Quoted Message & Divider (Only rendered if message exists) */}
                {rawMsg ? (
                  <>
                    <div className={`w-full border-t ${dividerColor} my-1 flex-shrink-0`} />
                    <div className="pt-0.5 pb-0.5 text-center flex-shrink-0 flex items-center justify-center px-1 overflow-hidden">
                      <p 
                        style={{ color: isLight ? '#7A6A5D' : 'rgba(255, 255, 255, 0.88)' }}
                        className="text-[9.5px] sm:text-[10.5px] font-serif italic leading-snug line-clamp-2 overflow-hidden text-ellipsis"
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

      </div>

      {/* ================= 🌟 4. "LIHAT SEMUA GALERI FOTO TAMU" BUTTON 🌟 ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={romanticTransition}
        className="text-center mt-7 sm:mt-9 px-4 relative z-20 flex justify-center"
      >
        <motion.button
          onClick={openGalleryModal}
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="group relative inline-flex items-center justify-center gap-2.5 sm:gap-3.5 px-7 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#8A1828] hover:to-[#9E1C30] border-2 border-[#F5D77F]/80 text-[#F5D77F] font-serif font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_35px_rgba(245,215,127,0.35),0_12px_40px_rgba(107,17,31,0.8)] hover:shadow-[0_0_50px_rgba(245,215,127,0.55),0_15px_50px_rgba(138,24,40,0.9)] transform active:scale-95 transition-all duration-300 overflow-hidden cursor-pointer"
        >
          {/* Continuous Glare Beam Sweeping */}
          <motion.div 
            animate={{
              x: ['-100%', '350%'],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-amber-200/35 to-transparent -skew-x-12 pointer-events-none" 
          />

          {/* Text (No Arrow icon) */}
          <span className="drop-shadow-sm font-semibold tracking-wider">
            Lihat Semua Galeri Foto Tamu ({baseCards.length} Foto)
          </span>
        </motion.button>
      </motion.div>

      {/* ================= 🌟 5. SEAMLESS GRADIENT & BLUR TRANSITION TO HOW IT WORKS 🌟 ================= */}
      <div 
        className="absolute bottom-0 inset-x-0 h-32 sm:h-40 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(22, 8, 14, 0.4) 40%, rgba(22, 8, 14, 0.85) 75%, #16080E 100%)'
        }}
      />
      {/* Soft Ambient Light Glow Orb at Seam */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[120px] bg-[#6B111F]/30 blur-3xl rounded-full pointer-events-none z-0" />

    </section>
  );
}