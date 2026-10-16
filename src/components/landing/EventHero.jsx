import { useState, useEffect } from 'react';
import { Camera, BookOpen, Lock, ShieldAlert, Calendar, QrCode, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import Marquee from './Marquee';
import { DEFAULT_HERO_PHOTOS, PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';
import GuestQrModal from '../ui/GuestQrModal';

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

  const slideImages = (activeEvent?.heroPhotos && activeEvent.heroPhotos.length > 0 
    ? activeEvent.heroPhotos 
    : DEFAULT_HERO_PHOTOS).slice(0, 5);

  useEffect(() => {
    if (currentSlide >= slideImages.length) {
      setCurrentSlide(0);
    }
  }, [slideImages.length, currentSlide]);

  useEffect(() => {
    if (slideImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideImages.length]);

  if (!activeEvent) return null;

  const isWedding = (activeEvent.eventType || 'wedding') === 'wedding';
  const eventBadge = isWedding
    ? 'THE WEDDING CELEBRATION OF'
    : (activeEvent.eventType === 'concert'
        ? 'OFFICIAL FESTIVAL PHOTOBOOTH'
        : (activeEvent.eventType === 'exhibition'
            ? 'EXHIBITION PHOTOBOOTH'
            : (activeEvent.eventType === 'festival'
                ? 'OFFICIAL EXPO PHOTOBOOTH'
                : 'OFFICIAL EVENT PHOTOBOOTH')));

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
      
      {/* ================= 🌟 1. FULL BLEED SLIDING HERO 🌟 ================= */}
      <div className="relative w-full h-[500px] xs:h-[540px] sm:h-[680px] md:h-[780px] overflow-hidden bg-gray-950">
        
        {/* Intro Reveal Wrapper (Framer controls transform here only) */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.08 }}
          animate={introReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.08 }}
          transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0"
        >
          {/* Crossfade Slides (stacked) */}
          {slideImages.map((imgUrl, idx) => (
            <div
              key={`${idx}-${imgUrl.slice(-24)}`}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                idx === currentSlide ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={imgUrl}
                alt={`${activeEvent.displayName} ${idx + 1}`}
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </motion.div>

        {/* Vignette Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none z-10" />

        {/* ================= 👑 FESTIVE WEDDING NAMES (ROMANTIC POETIC REVEAL) 👑 ================= */}
        <div className="absolute top-10 xs:top-12 sm:top-16 md:top-20 inset-x-3 sm:inset-x-4 text-center z-20 pointer-events-none flex flex-col items-center">
          
          {/* Item 1: Celebration Badge */}
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
            {activeEvent.displayName}
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

        {/* Item 5: Slide Dots */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={introReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.70 }}
          className="absolute bottom-24 sm:bottom-32 inset-x-0 flex items-center justify-center gap-2 z-20 pointer-events-auto"
        >
          {slideImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-500 rounded-full cursor-pointer ${
                idx === currentSlide
                  ? 'w-6 h-2 bg-amber-300 shadow-lg shadow-amber-300/50'
                  : 'w-2 h-2 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </motion.div>

        {/* Fog Bottom Fade */}
        <div 
          className="absolute bottom-0 inset-x-0 h-36 sm:h-64 pointer-events-none z-10"
          style={{
            background: `linear-gradient(to top, 
              #ffffff 15%, 
              rgba(255, 255, 255, 0.95) 38%, 
              rgba(255, 255, 255, 0) 100%
            )`
          }}
        />

      </div>

      {/* ==================== 🌟 2. CONTENT & ACTION BUTTONS 🌟 ==================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-5 relative z-20 -mt-6 sm:-mt-8">
        
        {/* Item 6: Description Paragraph (Gentle Fade Up) */}
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
              Abadikan keseruanmu di <strong>{activeEvent.displayName}</strong>! Ambil pose terbaikmu bersama teman dan tinggalkan jejak memori tak terlupakan di galeri photobooth event.
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
          /* Item 7: Main Action Buttons (Photobooth, Gallery, WA Consultation, Lynk.id Order) */
          <motion.div 
            initial={{ opacity: 0, y: 22 }}
            animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
            transition={{ duration: 0.9, delay: 0.95, ease: [0.25, 1, 0.5, 1] }}
            className="mb-6 sm:mb-8 flex flex-col items-center justify-center gap-3 relative z-20 max-w-lg mx-auto"
          >
            {/* Demo Indicator Pill */}
            {isDemo && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[11px] font-sans font-semibold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>Mode Demo Sirklen Photo — Coba Gratis Fitur Kami</span>
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

            {/* Contextual Divider: Bridges Guest Experience to Commercial Booking */}
            <div className="flex items-center gap-2.5 w-full pt-1.5 pb-0.5">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-stone-300 to-stone-200" />
              <span className="text-[10px] sm:text-[11px] font-sans font-medium uppercase tracking-[0.14em] text-stone-500 select-none">
                Tertarik untuk acaramu?
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-stone-300 to-stone-200" />
            </div>

            {/* Row 2: WhatsApp Consultation & Lynk.id Order Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full">
              {/* WhatsApp Consultation: Clean, Low-Friction Advisory */}
              <a
                href={CONTACT_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:flex-1 py-3 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-emerald-500/50 font-sans font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transform hover:-translate-y-0.5 active:scale-95 transition duration-200 cursor-pointer"
              >
                <MessageCircle size={16} className="text-[#25D366] transition-transform duration-200 group-hover:scale-110" />
                <span>Konsultasi WA</span>
              </a>

              {/* Lynk.id Order: Warm Luxury Bronze, High-Intent Primary Commercial CTA */}
              <a
                href={CONTACT_LINKS.lynkId}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#8C6534] via-[#A3783F] to-[#8C6534] hover:from-[#7A562B] hover:to-[#7A562B] text-white border border-[#BFA069]/40 font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-xl shadow-amber-950/15 transform hover:-translate-y-0.5 active:scale-95 transition duration-200 cursor-pointer"
              >
                <ShoppingBag size={15} className="text-amber-200 transition-transform duration-200 group-hover:scale-110" />
                <span className="tracking-wide">Pesan Sekarang</span>
                <ArrowRight size={14} className="text-amber-200 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
              </a>
            </div>
          </motion.div>
        )}

      </div>

      {/* Item 8: Frame Marquee (Full-Bleed Edge to Edge, No Box Constraint) */}
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

    </section>
  );
}
