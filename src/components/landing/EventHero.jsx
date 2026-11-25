import { useState, useEffect, useRef } from 'react';
import { Camera, BookOpen, Lock, ShieldAlert, Calendar, MapPin, QrCode, MessageCircle, ShoppingBag, ArrowRight, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import Marquee from './Marquee';
import { DEFAULT_HERO_PHOTOS, PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';
import GuestQrModal from '../ui/GuestQrModal';
import PriceListModal from '../ui/PriceListModal';

/**
 * Renders non-wedding event titles with an aesthetic, legible handwritten script
 * for ordinal numbers (e.g. "8th") paired with luxury editorial serif text.
 */
function renderFormattedEventTitle(rawName, isOverlay = false) {
  const cleanName = (rawName || '').trim();
  const parts = cleanName.split(/(\b\d+(?:st|nd|rd|th)\b)/gi);

  const serifStyle = isOverlay
    ? undefined
    : {
        background: 'linear-gradient(135deg, #430812 0%, #7B1323 28%, #A8283D 52%, #7B1323 76%, #430812 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 2px 10px rgba(107,17,31,0.14))',
      };

  const ordinalStyle = isOverlay
    ? {
        fontFamily: "'Dancing Script', 'Caveat', cursive",
        fontWeight: 700,
        fontSize: '1.28em',
        lineHeight: 1.05,
        background: 'linear-gradient(135deg, #FFFBEB 0%, #F5D77F 52%, #E5B94E 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.45))',
      }
    : {
        fontFamily: "'Dancing Script', 'Caveat', cursive",
        fontWeight: 700,
        fontSize: '1.34em',
        lineHeight: 1.08,
        background: 'linear-gradient(135deg, #9A6B1E 0%, #CFA047 38%, #A12339 76%, #6B111F 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 2px 8px rgba(154,107,30,0.2))',
      };

  return parts.map((part, idx) => {
    const match = part.match(/^(\d+)(st|nd|rd|th)$/i);
    if (match) {
      return (
        <span
          key={idx}
          className="inline-block px-2 py-0.5 -rotate-2 align-baseline select-none"
          style={ordinalStyle}
        >
          {match[1]}
          {match[2].toLowerCase()}
        </span>
      );
    }
    if (!part) return null;
    return (
      <span key={idx} style={serifStyle}>
        {part}
      </span>
    );
  });
}

export default function EventHero() {
  const { 
    activeEvent, 
    isDemo,
    isEventExpired, 
    openBooth, 
    openGalleryModal, 
    isPinAuthenticated, 
    verifyEventPin,
    introReady
  } = useBooth();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

  // Swipe & Drag Gesture State for Mobile Touch & Laptop Mouse
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontalSwipe = useRef(null);

  const slideImages = (activeEvent?.heroPhotos && activeEvent.heroPhotos.length > 0 
    ? activeEvent.heroPhotos 
    : DEFAULT_HERO_PHOTOS).slice(0, 5);

  useEffect(() => {
    if (currentSlide >= slideImages.length) {
      setCurrentSlide(0);
    }
  }, [slideImages.length, currentSlide]);

  // Auto-play slideshow every 5 seconds (pauses when user is dragging or touching)
  useEffect(() => {
    if (slideImages.length <= 1 || isInteracting) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideImages.length, isInteracting]);

  // Pointer Drag Handlers (Smoothly handles Touch on Mobile and Mouse on Laptop)
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    isPointerDown.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
    setIsInteracting(true);
  };

  const handlePointerMove = (e) => {
    if (!isPointerDown.current) return;
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    // Detect gesture intent: horizontal swipe vs vertical scroll
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipe.current) {
      setDragOffset(deltaX);
    }
  };

  const handlePointerUp = () => {
    if (!isPointerDown.current) return;
    isPointerDown.current = false;
    setIsDragging(false);

    if (isHorizontalSwipe.current) {
      const threshold = 45;
      if (dragOffset < -threshold) {
        // Swiped Left -> Next Slide
        setCurrentSlide((prev) => (prev + 1) % slideImages.length);
      } else if (dragOffset > threshold) {
        // Swiped Right -> Previous Slide
        setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length);
      }
    }

    setDragOffset(0);
    isHorizontalSwipe.current = null;
    setTimeout(() => setIsInteracting(false), 2000);
  };

  if (!activeEvent) return null;

  const isWedding = (activeEvent.eventType || 'wedding') === 'wedding';
  const shouldHideOverlay = activeEvent.hideHeroTextOverlay !== undefined
    ? !!activeEvent.hideHeroTextOverlay
    : !isWedding;

  const eventBadge = isWedding ? 'THE WEDDING CELEBRATION OF' : '';

  const isDemoMode = Boolean(isDemo || activeEvent?.isDemo || activeEvent?.slug === 'demo');

  const pkgInfo = PACKAGES[activeEvent.package] || PACKAGES.standard;
  const isPrivate = !!activeEvent.pin && !isPinAuthenticated;

  const handleStartBooth = () => {
    if (isPrivate) {
      setShowPinModal(true);
    } else {
      openBooth();
    }
  };

  const handleStartGallery = () => {
    if (isPrivate) {
      setShowPinModal(true);
    } else {
      openGalleryModal();
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (verifyEventPin(pinInput)) {
      setShowPinModal(false);
      setPinError(false);
      openBooth();
    } else {
      setPinError(true);
    }
  };

  return (
    <section id="beranda" className="pt-0 pb-0 overflow-hidden text-center relative bg-white select-none">
      
      {/* ================= 🌟 1. FULL BLEED SLIDING HERO (TOUCH & MOUSE DRAGGABLE) 🌟 ================= */}
      <div 
        className="relative w-full h-[500px] xs:h-[540px] sm:h-[680px] md:h-[780px] overflow-hidden bg-gray-950 cursor-grab active:cursor-grabbing select-none group touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        
        {/* Intro Reveal Wrapper */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.08 }}
          animate={introReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
          transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0"
        >
          {/* Horizontal Carousel Track (1:1 with finger on mobile & mouse on laptop) */}
          <div 
            className="absolute inset-0 flex h-full"
            style={{
              width: `${slideImages.length * 100}%`,
              transform: `translateX(calc(-${(currentSlide * 100) / slideImages.length}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: 'transform'
            }}
          >
            {slideImages.map((imgUrl, idx) => (
              <div
                key={`${idx}-${imgUrl.slice(-24)}`}
                className="relative h-full flex-shrink-0"
                style={{ width: `${100 / slideImages.length}%` }}
              >
                <img
                  src={imgUrl}
                  alt={`${activeEvent.displayName} ${idx + 1}`}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center pointer-events-none select-none"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Desktop / Laptop Left & Right Click Navigation Arrows */}
        {slideImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length);
              }}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-xl active:scale-90"
              title="Foto Sebelumnya"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide((prev) => (prev + 1) % slideImages.length);
              }}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md border border-white/20 text-white items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer shadow-xl active:scale-90"
              title="Foto Berikutnya"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        {/* Vignette Lighting - only shown if text is overlaid to maintain readability */}
        {!shouldHideOverlay && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none z-10" />
        )}

        {/* ================= 👑 FESTIVE WEDDING NAMES (ROMANTIC POETIC REVEAL) 👑 ================= */}
        {!shouldHideOverlay && (
          <div className="absolute top-10 xs:top-12 sm:top-16 md:top-20 inset-x-3 sm:inset-x-4 text-center z-20 pointer-events-none flex flex-col items-center">
            
            {/* Item 1: Celebration Badge (Weddings Only) */}
            {eventBadge && (
              <motion.div 
                initial={{ opacity: 0, y: -16 }}
                animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 1, 0.5, 1] }}
                className="inline-flex items-center px-4 sm:px-5 py-1 sm:py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 shadow-lg mb-2"
              >
                <span className="text-[10px] sm:text-xs font-sans font-semibold tracking-[0.22em] sm:tracking-[0.28em] text-amber-200 uppercase">
                  {eventBadge}
                </span>
              </motion.div>
            )}

            {/* Item 2: Wedding Couple Names or Event Name */}
            <motion.h1 
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={introReady ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 30, filter: 'blur(10px)' }}
              transition={{ duration: 1.0, delay: 0.25, ease: [0.25, 1, 0.5, 1] }}
              className={`text-white mt-1 leading-tight sm:leading-none drop-shadow-2xl ${
                isWedding 
                  ? 'text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[115px] font-normal' 
                  : 'text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-black tracking-tight'
              }`}
              style={isWedding ? { 
                fontFamily: "'Alex Brush', 'Great Vibes', cursive",
                textShadow: '0 4px 30px rgba(0,0,0,0.85), 0 0 50px rgba(245,215,127,0.45)'
              } : {
                fontFamily: "'Playfair Display', Georgia, serif",
                textShadow: '0 4px 30px rgba(0,0,0,0.85), 0 0 40px rgba(245,215,127,0.3)',
                letterSpacing: '-0.02em'
              }}
            >
              {isWedding ? activeEvent.displayName : renderFormattedEventTitle(activeEvent.displayName, true)}
            </motion.h1>

            {/* Item 3: Event Date & Venue Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 1, 0.5, 1] }}
              className="mt-2 sm:mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 shadow-md"
            >
              <p className="text-[11px] sm:text-sm text-rose-100 font-medium tracking-wide">
                {activeEvent.formattedDate} • {activeEvent.venue || (isWedding ? 'Wedding Venue' : 'Event Venue')}
              </p>
            </motion.div>

          </div>
        )}

        {/* Item 5: Slide Dots (Seamless Floating iPhone Style - No Black Bar Container) */}
        {slideImages.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.6, delay: 0.50, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-x-0 flex items-center justify-center z-20 pointer-events-auto ${
              shouldHideOverlay ? 'bottom-2 sm:bottom-3' : 'bottom-20 sm:bottom-28'
            }`}
          >
            <div className="flex items-center gap-1.5 py-1">
              {slideImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className="group/dot relative p-1 focus:outline-none cursor-pointer flex items-center justify-center transition-transform active:scale-90"
                  aria-label={`Slide ${idx + 1}`}
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ease-out ${
                      idx === currentSlide
                        ? 'w-5 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.55),0_0_8px_rgba(255,255,255,0.85)] ring-1 ring-black/15'
                        : 'w-1.5 bg-white/60 shadow-[0_1px_3px_rgba(0,0,0,0.45)] hover:bg-white/90 ring-1 ring-black/10'
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Fog Bottom Fade - ultra subtle in poster mode to keep bottom artwork & icons crisp */}
        <div 
          className={`absolute bottom-0 inset-x-0 pointer-events-none z-10 ${shouldHideOverlay ? 'h-6 sm:h-8' : 'h-36 sm:h-64'}`}
          style={{
            background: shouldHideOverlay
              ? 'linear-gradient(to top, #ffffff, transparent)'
              : `linear-gradient(to top, 
                  #ffffff 15%, 
                  rgba(255, 255, 255, 0.95) 38%, 
                  rgba(255, 255, 255, 0) 100%
                )`
          }}
        />

      </div>

      {/* ==================== 🌟 2. CONTENT & ACTION BUTTONS 🌟 ==================== */}
      <div className={`max-w-5xl mx-auto px-4 sm:px-5 relative z-20 ${shouldHideOverlay ? 'pt-4 sm:pt-6' : '-mt-6 sm:-mt-8'}`}>
        
        {/* Header Block Below Poster when Overlay is Hidden from Hero Photo */}
        {shouldHideOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
            className="mb-6 sm:mb-8 flex flex-col items-center text-center px-3"
          >
            {/* Badge (Weddings Only) */}
            {eventBadge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={introReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="inline-flex items-center px-4 py-1 rounded-full mb-3 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #6B111F08, #B88E3E14)', border: '1px solid #C5A05940' }}
              >
                <span className="text-[10px] sm:text-xs font-sans font-bold tracking-[0.25em] uppercase"
                  style={{ color: '#8A1828' }}>
                  {eventBadge}
                </span>
              </motion.div>
            )}

            {/* Title — High-Craft Editorial Luxury Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
              animate={introReady ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 18, filter: 'blur(6px)' }}
              transition={{ duration: 1.0, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`px-1 ${
                isWedding
                  ? 'leading-[1.12] text-5xl xs:text-6xl sm:text-8xl font-normal'
                  : 'leading-[1.22] text-[30px] xs:text-[34px] sm:text-5xl md:text-[54px] font-bold'
              }`}
              style={isWedding ? {
                fontFamily: "'Alex Brush', 'Great Vibes', cursive",
                color: '#3E0A14',
                textShadow: '0 3px 16px rgba(107,17,31,0.13)'
              } : {
                fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                letterSpacing: '-0.02em',
              }}
            >
              {isWedding ? activeEvent.displayName : renderFormattedEventTitle(activeEvent.displayName, false)}
            </motion.h1>

            {/* Minimalist Champagne-Gold Hairline Divider (No Star/Sparkle Icons) */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.3 }}
              animate={introReady ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.3 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center gap-2.5 my-3 sm:my-4"
            >
              <span className="h-[1px] w-12 sm:w-20" style={{ background: 'linear-gradient(to right, transparent, rgba(197, 160, 89, 0.75))' }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C5A059' }} />
              <span className="h-[1px] w-12 sm:w-20" style={{ background: 'linear-gradient(to left, transparent, rgba(197, 160, 89, 0.75))' }} />
            </motion.div>

            {/* Date & Venue — Refined Luxury Ivory-Gold Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
              className="inline-flex items-center flex-wrap justify-center gap-x-3 gap-y-1.5 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #FFFEFB 0%, #FAF3E6 55%, #FFFEFB 100%)',
                border: '1px solid rgba(197, 160, 89, 0.45)',
                boxShadow: '0 4px 18px rgba(168, 128, 56, 0.10), 0 1px 2px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95)'
              }}
            >
              {/* Date */}
              <div className="inline-flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 shrink-0 text-[#9B6F29]" strokeWidth={2} />
                <span
                  className="font-semibold text-xs sm:text-sm tracking-[0.02em] tabular-nums"
                  style={{ color: '#2F0D13', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {activeEvent.formattedDate}
                </span>
              </div>

              {/* Clean Vertical Hairline Separator */}
              {activeEvent.venue && (
                <span className="hidden xs:inline-block w-[1px] h-3.5 shrink-0" style={{ background: 'rgba(197, 160, 89, 0.5)' }} />
              )}

              {/* Venue */}
              {activeEvent.venue && (
                <div className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#8A1828]" strokeWidth={2} />
                  <span
                    className="font-semibold text-xs sm:text-sm tracking-[0.01em]"
                    style={{ color: '#4A1822', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {activeEvent.venue}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
        
        {/* Item 6: Description Paragraph */}
        <motion.p 
          initial={{ opacity: 0, y: 16 }}
          animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.8, delay: 0.80, ease: [0.25, 1, 0.5, 1] }}
          className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6 font-normal px-2"
        >
          {isWedding ? (
            <>
              Abadikan momen kebahagiaan bersama <strong>{activeEvent.displayName}</strong>. Ambil pose foto terbaikmu dan rekam pesan doa restu yang tersimpan di galeri pernikahan.
            </>
          ) : (
            <>
              Abadikan keseruanmu di <strong>{(activeEvent.displayName || '').trim()}</strong>! Ambil pose terbaikmu bersama teman dan tinggalkan jejak memori tak terlupakan di galeri photobooth event.
            </>
          )}
        </motion.p>

        {/* Warning if Event is Expired */}
        {isEventExpired ? (
          <div className="max-w-md mx-auto mb-6 bg-rose-950/90 text-rose-200 border border-rose-500/50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-left">
            <ShieldAlert size={24} className="text-rose-400 flex-shrink-0" />
            <div className="text-xs font-sans">
              <span className="font-bold block text-rose-100">Masa Aktif Event Telah Selesai ({pkgInfo.activeDays} Hari)</span>
              Sesuai ketentuan paket {pkgInfo.name}, pengunggahan foto baru telah dihentikan.
            </div>
          </div>
        ) : (
          /* Item 7: Main Action Buttons */
          <motion.div 
            initial={{ opacity: 0, y: 22 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            transition={{ duration: 0.9, delay: 0.95, ease: [0.25, 1, 0.5, 1] }}
            className="mb-6 sm:mb-8 flex flex-col items-center justify-center gap-3 relative z-20 max-w-lg mx-auto"
          >
            {/* Demo Indicator Badge & Price List Anchor Button */}
            {isDemoMode && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 border border-stone-200/90 shadow-2xs">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#540D18]/10 text-[#540D18]">
                    Mode Demo
                  </span>
                  <span className="text-stone-600 font-medium text-[11px] sm:text-xs">
                    Coba Gratis Fitur Sirklen Photo
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPriceModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 hover:bg-stone-50 border border-stone-200/90 shadow-2xs text-[#6B111F] text-[11px] sm:text-xs font-semibold transition active:scale-95 cursor-pointer"
                >
                  <Tag size={12} className="text-[#6B111F]" />
                  <span>Daftar Harga Paket</span>
                </button>
              </div>
            )}

            {/* Row 1: Primary Photobooth & Gallery Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
              <button
                onClick={handleStartBooth}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] text-[#F5D77F] font-serif font-bold text-xs sm:text-sm border border-amber-300/40 shadow-2xl shadow-rose-950/35 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 transition cursor-pointer"
              >
                <Camera size={18} />
                <span>Mulai Photobooth</span>
              </button>

              <button
                onClick={handleStartGallery}
                className="w-full sm:flex-1 py-3.5 px-5 rounded-full bg-white hover:bg-amber-50/80 text-[#6B111F] font-serif font-bold text-xs sm:text-sm border border-[#6B111F]/30 shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 transition cursor-pointer"
              >
                <BookOpen size={18} />
                <span>Lihat Galeri</span>
              </button>
            </div>

            {/* Commercial Booking CTAs */}
            {isDemoMode && (
              <>
                <div className="flex items-center gap-2.5 w-full pt-1.5 pb-0.5">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-stone-200" />
                  <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-stone-500 select-none">
                    Tertarik untuk acaramu?
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent via-stone-300 to-stone-200" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
                  <a
                    href={CONTACT_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full sm:flex-1 py-3 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-emerald-500/50 font-sans font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transform hover:-translate-y-0.5 active:scale-95 transition duration-200 cursor-pointer"
                  >
                    <MessageCircle size={16} className="text-[#25D366] transition-transform duration-200 group-hover:scale-110" />
                    <span>Konsultasi WA</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowPriceModal(true)}
                    className="group w-full sm:flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#8C6534] via-[#A3783F] to-[#8C6534] hover:from-[#7A562B] hover:to-[#7A562B] text-white border border-[#BFA069]/40 font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-xl shadow-amber-950/15 transform hover:-translate-y-0.5 active:scale-95 transition duration-200 cursor-pointer"
                  >
                    <ShoppingBag size={15} className="text-amber-200 transition-transform duration-200 group-hover:scale-110" />
                    <span className="tracking-wide">Pesan Sekarang</span>
                    <ArrowRight size={14} className="text-amber-200 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

      </div>

      {/* Item 8: Frame Showcase (Swipeable on Mobile & Laptop) */}
      <motion.div 
        initial={{ opacity: 0, y: 26 }}
        animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
        transition={{ duration: 0.9, delay: 1.15, ease: [0.25, 1, 0.5, 1] }}
        className="w-full bg-white pt-6 pb-6 overflow-hidden relative z-20"
      >
        <div className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#6B111F] mb-3 font-sans px-4">
          BINGKAI KHUSUS {isWedding ? 'PERNIKAHAN' : 'EVENT'} {activeEvent.displayName.toUpperCase()}
        </div>
        <Marquee />
      </motion.div>

      {/* PRIVATE PIN MODAL OVERLAY */}
      {showPinModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#1C0A15] border border-amber-400/50 rounded-3xl p-5 text-white text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mx-auto mb-3">
              <Lock size={22} />
            </div>

            <h3 className="text-base font-serif font-bold text-amber-200">
              Galeri {isWedding ? 'Mempelai' : 'Event'} Dilindungi PIN
            </h3>

            <p className="text-xs text-gray-300 mt-1">
              Masukkan PIN yang diberikan oleh {isWedding ? 'pengantin' : 'penyelenggara'} ({activeEvent.displayName}) untuk membuka galeri.
            </p>

            <form onSubmit={handlePinSubmit} className="mt-4 space-y-3">
              <input
                type="password"
                placeholder="Masukkan PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-400/40 text-center font-mono font-bold text-lg text-amber-200 placeholder:text-gray-600 focus:outline-none"
                autoFocus
              />

              {pinError && (
                <span className="text-[11px] text-rose-400 block font-medium">
                  PIN salah, mohon tanyakan ke {isWedding ? 'mempelai' : 'penyelenggara'}.
                </span>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#6B111F] text-[#F5D77F] text-xs font-bold border border-amber-400/40"
                >
                  Buka Galeri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest QR Code Modal */}
      <GuestQrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />

      {/* Official Floating Price List Modal */}
      <PriceListModal isOpen={showPriceModal} onClose={() => setShowPriceModal(false)} />

    </section>
  );
}
