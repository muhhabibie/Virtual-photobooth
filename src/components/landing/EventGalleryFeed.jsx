import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Share2, Plus, Volume2, ArrowRight, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';
import { getEventHeaderTitle } from '../../utils/eventHeader';
import PhotostripThumbnail from '../gallery/PhotostripThumbnail';

const romanticTransition = {
  duration: 1.1,
  ease: [0.22, 1, 0.36, 1],
};

export default function EventGalleryFeed() {
  const { 
    openBooth, 
    openGalleryModal, 
    capturedPhotos, 
    guestName, 
    stripColor, 
    guestMessage, 
    voiceUrl, 
    activeEvent, 
    savedSubmissions 
  } = useBooth();
  const { toast } = useToast();

  const coupleName = activeEvent?.displayName || 'Raka & Sabrina';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Galeri Pengunjung The Wedding of ${coupleName}`,
          text: `Lihat photo strip kenangan pernikahan ${coupleName}!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast('Tautan galeri berhasil disalin', 'success');
    }
  };

  // Prepend live user submission if taken
  const userCard = capturedPhotos.length > 0 ? {
    id: 'user-submission',
    guestName: guestName || 'Tamu Undangan (Kamu)',
    date: activeEvent?.formattedDate || '30 Mei 2026',
    photos: capturedPhotos.map(p => p.dataUrl),
    stripColor: stripColor || '#6B111F',
    colorHex: stripColor || '#6B111F',
    textHex: stripColor === '#FAF6F0' || stripColor === '#FDFBF7' || stripColor === '#F3C5CB' ? '#6B111F' : '#F5D77F',
    hasVoice: !!voiceUrl,
    voiceUrl: voiceUrl,
    message: guestMessage || '',
  } : null;

  // Filter real-time savedSubmissions by active event
  const eventSubmissions = useMemo(() => {
    if (!savedSubmissions || savedSubmissions.length === 0) return [];
    if (!activeEvent) return savedSubmissions;
    const currentSlug = activeEvent.slug;
    const isDemoEvent = currentSlug === 'demo' || currentSlug === 'sabrina-raka' || currentSlug === 'raka-sabrina' || !currentSlug;
    return savedSubmissions.filter(sub => {
      if (sub.eventId && activeEvent.id && sub.eventId === activeEvent.id) return true;
      if (sub.eventSlug && currentSlug && sub.eventSlug === currentSlug) return true;
      if (isDemoEvent && (sub.eventSlug === 'demo' || sub.eventSlug === 'sabrina-raka' || sub.eventSlug === 'raka-sabrina' || !sub.eventSlug)) {
        return true;
      }
      return false;
    });
  }, [savedSubmissions, activeEvent]);

  // Base cards list per event
  const baseCards = useMemo(() => {
    let hiddenIds = [];
    try {
      hiddenIds = JSON.parse(localStorage.getItem('sirklen_hidden_mock_submissions') || '[]');
    } catch (e) {}

    let list = eventSubmissions.filter(sub => !hiddenIds.includes(sub.id));
    if (list.length === 0 && (!activeEvent || activeEvent.slug === 'sabrina-raka' || activeEvent.slug === 'raka-sabrina' || activeEvent.slug === 'demo' || activeEvent.isDemo)) {
      list = MOCK_GALLERY_PHOTOS.filter(sub => !hiddenIds.includes(sub.id));
    }
    return userCard && !hiddenIds.includes(userCard.id) ? [userCard, ...list.filter(s => s.id !== userCard.id)] : list;
  }, [eventSubmissions, activeEvent, userCard]);
  
  // Ensure enough items (at least 5) before repeating 4x so infinite wrapping is flawless
  const displayCards = useMemo(() => {
    if (!baseCards || baseCards.length === 0) return [];
    let set = baseCards;
    while (set.length < 5) {
      set = [...set, ...baseCards];
    }
    return [...set, ...set, ...set, ...set];
  }, [baseCards]);

  // Real-time Gesture & Motion Coordinates
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const singleSetWidthRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const velocityRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);

  // Measure single set width for seamless infinite modulo wrapping
  const updateMetrics = useCallback(() => {
    if (trackRef.current) {
      singleSetWidthRef.current = trackRef.current.scrollWidth / 4;
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    const timer = setTimeout(updateMetrics, 400);
    window.addEventListener('resize', updateMetrics);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateMetrics);
    };
  }, [updateMetrics, displayCards]);

  // CONTINUOUS SLIDING FROM RIGHT TO LEFT (Infinite Smooth Hardware-Accelerated Animation)
  useEffect(() => {
    let animId;

    const animate = (time) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      // Auto-slide to the left continuously when NOT actively dragged by hand/mouse
      if (!isDraggingRef.current && trackRef.current) {
        // Continuous sliding speed: 45px/sec (slows down to 20px/sec on desktop hover for easy browsing)
        const baseSpeed = isHovered ? -20 : -45;

        // If user swiped with momentum, decay smoothly toward baseSpeed
        if (Math.abs(velocityRef.current) > 3) {
          const decay = Math.pow(0.92, dt * 60);
          velocityRef.current = velocityRef.current * decay + baseSpeed * (1 - decay);
          currentXRef.current += velocityRef.current * dt;
        } else {
          currentXRef.current += baseSpeed * dt;
        }

        // Wrap around seamlessly without any visual jumps
        const setWidth = singleSetWidthRef.current || (trackRef.current.scrollWidth / 4);
        if (setWidth > 0) {
          while (currentXRef.current <= -setWidth * 2) {
            currentXRef.current += setWidth;
          }
          while (currentXRef.current > -setWidth) {
            currentXRef.current -= setWidth;
          }
        }

        trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  // TOUCH SWIPE (MOBILE) & MOUSE DRAG (LAPTOP) HANDLERS
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    dragDistanceRef.current = 0;
    velocityRef.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    startXRef.current = e.clientX;
    dragDistanceRef.current += Math.abs(deltaX);

    currentXRef.current += deltaX;

    const now = performance.now();
    const dt = Math.max((now - lastPointerTimeRef.current) / 1000, 0.001);
    if (dt > 0.005) {
      const currentVel = (e.clientX - lastPointerXRef.current) / dt;
      velocityRef.current = velocityRef.current * 0.3 + currentVel * 0.7;
      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = now;
    }

    // Wrap around while dragging so user can swipe infinitely in either direction
    const setWidth = singleSetWidthRef.current || (trackRef.current ? trackRef.current.scrollWidth / 4 : 0);
    if (setWidth > 0) {
      while (currentXRef.current <= -setWidth * 2) {
        currentXRef.current += setWidth;
      }
      while (currentXRef.current > -setWidth) {
        currentXRef.current -= setWidth;
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastTimeRef.current = performance.now();
    velocityRef.current = Math.max(-1200, Math.min(1200, velocityRef.current));
  };

  // Step scroll buttons for Laptop users
  const handleStepScroll = (direction) => {
    const shift = direction === 'left' ? 280 : -280;
    currentXRef.current += shift;
    const setWidth = singleSetWidthRef.current || (trackRef.current ? trackRef.current.scrollWidth / 4 : 0);
    if (setWidth > 0) {
      while (currentXRef.current <= -setWidth * 2) {
        currentXRef.current += setWidth;
      }
      while (currentXRef.current > -setWidth) {
        currentXRef.current -= setWidth;
      }
    }
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
      setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = '';
      }, 450);
    }
  };

  const backdropPhoto = activeEvent?.heroPhotos && activeEvent.heroPhotos.length > 0
    ? activeEvent.heroPhotos[0]
    : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85';

  return (
    <section id="gallery-feed" className="relative bg-gradient-to-b from-[#0E050A] via-[#0E050A] to-[#14060C] text-white pt-0 pb-24 sm:pb-28 overflow-hidden select-none">
      
      {/* ================= 🌟 1. TOP ROMANTIC WEDDING PHOTO WITH CINEMATIC MASK FADE 🌟 ================= */}
      <div className="relative w-full h-[280px] sm:h-[340px] overflow-hidden bg-gradient-to-b from-white via-[#0E050A] to-[#0E050A]">
        {/* Background Wedding Couple Photo with Mask Fade */}
        <img
          src={backdropPhoto}
          alt={coupleName}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1600&auto=format&fit=crop&q=85';
          }}
          style={{
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.3) 75%, rgba(0,0,0,0) 100%)',
          }}
          className="w-full h-full object-cover object-top filter brightness-85"
        />

        {/* Top Seamless Transparent Fog Fade from White Hero to Photo */}
        <div 
          className="absolute top-0 inset-x-0 h-24 sm:h-36 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255, 255, 255, 0.8) 35%, rgba(255, 255, 255, 0) 100%)'
          }}
        />

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
              {activeEvent?.eventType === 'wedding' ? `THE WEDDING OF ${coupleName.toUpperCase()}` : `${coupleName.toUpperCase()}`}
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent flex-1" />
          </div>

          <p className="text-[11px] sm:text-xs text-amber-100/90 font-serif italic max-w-md mx-auto px-4 mt-1 leading-snug drop-shadow">
            {activeEvent?.eventType === 'wedding' 
              ? '"Setiap senyuman, doa restu, dan kenangan manis yang terabadikan abadi dari seluruh tamu tercinta."'
              : '"Setiap senyuman, keseruan, dan kenangan manis yang terabadikan abadi dari seluruh pengunjung tercinta."'}
          </p>
        </motion.div>
      </div>

      {/* ================= 🌟 3. RIGHT-TO-LEFT HORIZONTAL SWIPEABLE & AUTO-SLIDING CAROUSEL 🌟 ================= */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden py-3 select-none group cursor-grab active:cursor-grabbing touch-pan-y z-20"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handlePointerUp();
        }}
      >
        {/* Navigation Chevrons for Laptop / Desktop */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStepScroll('left');
          }}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-[#F5D77F] shadow-2xl border border-amber-400/40 items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer active:scale-95 backdrop-blur-sm"
          title="Geser Kiri"
        >
          <ChevronLeft size={22} className="text-[#F5D77F]" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleStepScroll('right');
          }}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/85 text-[#F5D77F] shadow-2xl border border-amber-400/40 items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer active:scale-95 backdrop-blur-sm"
          title="Geser Kanan"
        >
          <ChevronRight size={22} className="text-[#F5D77F]" />
        </button>

        {/* Infinite Hardware-Accelerated Sliding Track (Always moving right to left + 100% swipeable) */}
        <div 
          ref={trackRef}
          className="flex items-center gap-3.5 sm:gap-5 will-change-transform"
          style={{ width: 'max-content' }}
        >
          {displayCards.map((card, idx) => (
            <div
              key={`${card.id}-${idx}`}
              onClick={() => {
                if (dragDistanceRef.current < 8) {
                  openGalleryModal();
                }
              }}
              className="w-44 xs:w-50 sm:w-56 flex-shrink-0 cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              <PhotostripThumbnail
                item={card}
                activeEvent={activeEvent}
                className="w-full shadow-[0_14px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(245,215,127,0.12)] border border-white/20 hover:border-amber-400/50 pointer-events-none select-none"
              />
            </div>
          ))}
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
