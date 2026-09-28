import { useState, useEffect } from 'react';
import { Camera, BookOpen, Lock, ShieldAlert, Sparkles, Clock, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import Marquee from './Marquee';
import { PACKAGES } from '../../data/mockEvents';

const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&auto=format&fit=crop&q=85',
];

export default function EventHero() {
  const { 
    activeEvent, 
    isEventExpired, 
    openBooth, 
    openGalleryModal, 
    isPinAuthenticated, 
    verifyEventPin 
  } = useBooth();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (!activeEvent) return null;

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
        
        {/* Sliding Images Track */}
        <div 
          className="flex h-full w-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDE_IMAGES.map((imgUrl, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 relative">
              <img
                src={imgUrl}
                alt={`${activeEvent.displayName} ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Vignette Lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none z-10" />

        {/* ================= 👑 FESTIVE WEDDING NAMES 👑 ================= */}
        <div className="absolute top-8 xs:top-10 sm:top-16 md:top-20 inset-x-3 sm:inset-x-4 text-center z-20 pointer-events-none flex flex-col items-center">
          
          <div className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-lg mb-2">
            <Sparkles size={13} className="text-amber-300" />
            <span className="text-[10px] sm:text-xs font-sans font-semibold tracking-[0.2em] sm:tracking-[0.25em] text-amber-200 uppercase">
              THE WEDDING CELEBRATION OF
            </span>
          </div>

          <h1 
            className="text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[115px] font-normal text-white mt-1 leading-tight sm:leading-none drop-shadow-2xl"
            style={{ 
              fontFamily: "'Alex Brush', 'Great Vibes', cursive",
              textShadow: '0 4px 30px rgba(0,0,0,0.85), 0 0 50px rgba(245,215,127,0.45)'
            }}
          >
            {activeEvent.displayName}
          </h1>

          <div className="mt-2 sm:mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 shadow-md">
            <p className="text-[11px] sm:text-sm text-rose-100 font-medium tracking-wide">
              {activeEvent.formattedDate} • {activeEvent.venue || 'Wedding Venue'}
            </p>
          </div>

          {/* Package Expiry Pill */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-200 text-[10px] font-mono font-bold">
            <Clock size={11} />
            <span>Paket {pkgInfo.name} ({isEventExpired ? 'Masa Aktif Selesai' : `Galeri Aktif ${pkgInfo.activeDays} Hari`})</span>
          </div>

        </div>

        {/* Slide Dots */}
        <div className="absolute bottom-24 sm:bottom-32 inset-x-0 flex items-center justify-center gap-2 z-20 pointer-events-auto">
          {SLIDE_IMAGES.map((_, idx) => (
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
        </div>

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
        
        <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6 font-normal px-2">
          Abadikan momen kebahagiaan bersama <strong>{activeEvent.displayName}</strong>. Ambil pose foto terbaikmu dan rekam pesan doa restu yang tersimpan di galeri pernikahan.
        </p>

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
          /* Main Action Buttons */
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-20 max-w-md mx-auto">
            <button
              onClick={handleStartBooth}
              className="w-full sm:flex-1 py-4 px-6 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] text-[#F5D77F] font-serif font-bold text-xs sm:text-sm border border-amber-300/40 shadow-2xl shadow-rose-950/35 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 transition cursor-pointer"
            >
              <Camera size={18} />
              <span>Mulai Photobooth</span>
            </button>

            <button
              onClick={handleStartGallery}
              className="w-full sm:flex-1 py-4 px-6 rounded-full bg-white hover:bg-amber-50/80 text-[#6B111F] font-serif font-bold text-xs sm:text-sm border border-[#6B111F]/30 shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95 transition cursor-pointer"
            >
              <BookOpen size={18} />
              <span>Lihat Galeri Foto</span>
            </button>
          </div>
        )}

        {/* Frame Marquee */}
        <div className="w-full bg-white pt-6 pb-4 overflow-hidden">
          <div className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#6B111F] mb-3 font-sans">
            BINGKAI KHUSUS PERNIKAHAN {activeEvent.displayName.toUpperCase()}
          </div>
          <Marquee />
        </div>

      </div>

      {/* PRIVATE PIN MODAL OVERLAY */}
      {showPinModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#1C0A15] border border-amber-400/50 rounded-3xl p-5 text-white text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mx-auto mb-3">
              <Lock size={22} />
            </div>

            <h3 className="text-base font-serif font-bold text-amber-200">
              Galeri Mempelai Dilindungi PIN
            </h3>

            <p className="text-xs text-gray-300 mt-1">
              Masukkan PIN yang diberikan oleh pengantin ({activeEvent.displayName}) untuk membuka galeri.
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
                  PIN salah, mohon tanyakan ke mempelai.
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

    </section>
  );
}
