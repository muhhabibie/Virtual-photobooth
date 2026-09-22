import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import Marquee from './Marquee';

const SLIDE_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1600&auto=format&fit=crop&q=85',
];

const GALLERY_STRIP_PHOTOS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80',
];

const romanticTransition = {
  duration: 0.9,
  ease: [0.6, 0.01, -0.05, 0.9],
};

export default function Hero() {
  const { openBooth, capturedPhotos } = useBooth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto sliding carousel every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDE_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const userPhotoUrls = capturedPhotos.map(p => p.dataUrl);
  const basePhotos = userPhotoUrls.length > 0 ? [...userPhotoUrls, ...GALLERY_STRIP_PHOTOS] : GALLERY_STRIP_PHOTOS;

  // Duplicated arrays for endless continuous vertical scrolling
  const leftSeamlessList = [...basePhotos, ...basePhotos];
  const rightSeamlessList = [...basePhotos.slice().reverse(), ...basePhotos.slice().reverse()];

  return (
    <section id="beranda" className="pt-0 pb-0 overflow-hidden text-center relative bg-white">
      
      {/* ================= 🌟 1. 100% FULL-BLEED SLIDING CAROUSEL HERO 🌟 ================= */}
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
                alt={`Wedding Photo ${idx + 1}`}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* Cinematic Lighting Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none z-10" />

        {/* ================= 👑 GRAND CLEAN & PROFESSIONAL WEDDING TYPOGRAPHY 👑 ================= */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={romanticTransition}
          className="absolute top-10 xs:top-12 sm:top-20 md:top-24 inset-x-3 sm:inset-x-4 text-center z-20 pointer-events-none flex flex-col items-center"
        >
          {/* Top Clean Editorial Pill (No AI/sparkle logos) */}
          <div className="inline-flex items-center px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-lg mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-sm font-sans font-semibold tracking-[0.2em] sm:tracking-[0.28em] text-amber-200/90 uppercase drop-shadow-md">
              THE WEDDING CELEBRATION OF
            </span>
          </div>

          {/* Grand Festive Names (Large Calligraphy) */}
          <h1 
            className="text-5xl xs:text-6xl sm:text-8xl md:text-9xl lg:text-[115px] font-normal text-white mt-0.5 sm:mt-1 leading-tight sm:leading-none drop-shadow-2xl"
            style={{ 
              fontFamily: "'Alex Brush', 'Great Vibes', cursive",
              textShadow: '0 4px 30px rgba(0,0,0,0.85), 0 0 50px rgba(245,215,127,0.45)',
              filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.7))'
            }}
          >
            Sabrina & Raka
          </h1>

          {/* Clean Date & Venue Pill (No emojis) */}
          <div className="mt-2 sm:mt-4 inline-flex items-center px-3.5 sm:px-5 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 shadow-md">
            <p className="text-[11px] sm:text-sm md:text-base text-rose-100 font-medium tracking-wide sm:tracking-wider drop-shadow-md">
              Minggu, 10 Mei 2026 • Grand Ballroom Jakarta
            </p>
          </div>
        </motion.div>

        {/* Minimal Slide Dots Indicator */}
        <div className="absolute bottom-24 sm:bottom-32 inset-x-0 flex items-center justify-center gap-2 sm:gap-2.5 z-20 pointer-events-auto">
          {SLIDE_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-500 rounded-full cursor-pointer ${
                idx === currentSlide
                  ? 'w-6 sm:w-7 h-1.5 sm:h-2 bg-amber-300 shadow-lg shadow-amber-300/50 scale-105'
                  : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/60 hover:bg-white'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Full-width Misty Cloudy Fog Bottom Fade into Page Background */}
        <div 
          className="absolute bottom-0 inset-x-0 h-36 sm:h-64 pointer-events-none z-10"
          style={{
            background: `linear-gradient(to top, 
              #ffffff 15%, 
              rgba(255, 255, 255, 0.95) 38%, 
              rgba(255, 255, 255, 0.70) 65%, 
              rgba(255, 255, 255, 0.25) 85%, 
              rgba(255, 255, 255, 0) 100%
            )`
          }}
        />

      </div>

      {/* ==================== 🌟 2. GRAND & CLEAN AESTHETIC CONTENT 🌟 ==================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-5 relative z-20 -mt-6 sm:-mt-8">
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={romanticTransition}
          className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-6 font-normal px-2"
        >
          Abadikan momen manismu dengan photo strip berbingkai eksklusif, abadikan pose terbaikmu, dan tinggalkan rekaman doa restu untuk kedua mempelai.
        </motion.p>

        {/* ================= 🌟 GRAND MAIN CTA BUTTON (MATCHING BURGUNDY THEME) 🌟 ================= */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ ...romanticTransition, delay: 0.1 }}
          className="mb-6 sm:mb-8 flex items-center justify-center relative z-20"
        >
          <button
            onClick={openBooth}
            className="group relative inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-10 py-3.5 sm:py-4.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] text-[#F5D77F] font-serif font-bold text-xs sm:text-base tracking-wide shadow-2xl shadow-rose-950/35 border border-amber-300/40 transform hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            <span className="text-amber-300 text-sm sm:text-lg"></span>
            <span>Mulai Photobooth Sekarang</span>
            <span className="text-amber-300 text-sm sm:text-lg"></span>
          </button>
        </motion.div>

        {/* ================= 🌟 3. CENTER PREVIEW WITH 2 CONTINUOUSLY SCROLLING STRIPS 🌟 ================= */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ ...romanticTransition, delay: 0.2 }}
          className="relative max-w-3xl mx-auto pt-2 sm:pt-4 px-2 sm:px-0 flex items-center justify-center"
        >
          
          {/* ================= LEFT TILTED PHOTO STRIP (CONTINUOUS DOWN ANIMATION) ================= */}
          <div 
            className="absolute -left-2 xs:-left-6 sm:-left-12 md:-left-16 lg:-left-20 xl:-left-24 top-1/2 -translate-y-1/2 z-20 w-16 xs:w-20 sm:w-28 md:w-32 lg:w-36 h-[88%] sm:h-[92%] max-h-[360px] md:max-h-[400px] bg-[#12070D] p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 flex flex-col justify-between overflow-hidden transform -rotate-6 sm:-rotate-8 hover:rotate-0 transition-all duration-500 group cursor-pointer"
            onClick={openBooth}
            title="Klik untuk Mulai Foto"
          >
            <div className="absolute inset-x-0 top-0 h-3 sm:h-6 bg-gradient-to-b from-[#12070D] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-5 sm:bottom-8 h-3 sm:h-6 bg-gradient-to-t from-[#12070D] to-transparent z-10 pointer-events-none" />

            <div className="flex-1 overflow-hidden relative">
              <div className="animate-strip-down flex flex-col gap-1 sm:gap-2">
                {leftSeamlessList.map((imgUrl, i) => (
                  <div key={i} className="aspect-[4/3] rounded sm:rounded-lg bg-gray-900 overflow-hidden flex-shrink-0 border border-white/10 shadow-inner">
                    <img 
                      src={imgUrl} 
                      alt={`Left Strip ${i}`} 
                      className="w-full h-full object-cover grayscale brightness-95 group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center font-serif text-[6.5px] sm:text-[9px] text-[#F5D77F] font-bold tracking-wider pt-0.5 sm:pt-1.5 border-t border-white/15 z-20 bg-[#12070D]">
              Sabrina & Raka ♡
            </div>
          </div>

          {/* ================= RIGHT TILTED PHOTO STRIP (CONTINUOUS UP ANIMATION) ================= */}
          <div 
            className="absolute -right-2 xs:-right-6 sm:-right-12 md:-right-16 lg:-right-20 xl:-right-24 top-1/2 -translate-y-1/2 z-20 w-16 xs:w-20 sm:w-28 md:w-32 lg:w-36 h-[88%] sm:h-[92%] max-h-[360px] md:max-h-[400px] bg-[#6B111F] p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-2xl border border-amber-300/30 flex flex-col justify-between overflow-hidden transform rotate-6 sm:rotate-8 hover:rotate-0 transition-all duration-500 group cursor-pointer"
            onClick={openBooth}
            title="Klik untuk Mulai Foto"
          >
            <div className="absolute inset-x-0 top-0 h-3 sm:h-6 bg-gradient-to-b from-[#6B111F] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-5 sm:bottom-8 h-3 sm:h-6 bg-gradient-to-t from-[#6B111F] to-transparent z-10 pointer-events-none" />

            <div className="flex-1 overflow-hidden relative">
              <div className="animate-strip-up flex flex-col gap-1 sm:gap-2">
                {rightSeamlessList.map((imgUrl, i) => (
                  <div key={i} className="aspect-[4/3] rounded sm:rounded-lg bg-black/40 overflow-hidden flex-shrink-0 relative border border-white/15 shadow-inner">
                    <img 
                      src={imgUrl} 
                      alt={`Right Strip ${i}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center font-serif text-[6.5px] sm:text-[9px] text-[#F5D77F] font-bold tracking-wider pt-0.5 sm:pt-1.5 border-t border-white/15 z-20 bg-[#6B111F]">
              Sabrina & Raka ♡
            </div>
          </div>

          {/* ================= CENTER TABLET PREVIEW ================= */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-2xl border border-rose-100 max-w-[78vw] sm:max-w-lg md:max-w-xl mx-auto relative z-10 hover:shadow-rose-900/10 transition-shadow">
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-900 shadow-inner group cursor-pointer" onClick={openBooth}>
              <img 
                src={SLIDE_IMAGES[currentSlide]} 
                alt="Sabrina and Raka Wedding" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
          </div>

        </motion.div>

      </div>

      {/* ================= 🌟 4. LUXURIOUS CONTINUOUS MARQUEE 🌟 ================= */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={romanticTransition}
        className="w-full bg-white pt-8 pb-4 overflow-hidden"
      >
        <div className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#6B111F] mb-3 font-sans">
          PILIHAN BINGKAI PERNIKAHAN SABRINA & RAKA
        </div>
        <Marquee />
      </motion.div>

      {/* ================= 🌟 5. 100% SEAMLESS FADING GRADIENT INTO MATCHING DARK LUXURY (#16080E) 🌟 ================= */}
      <div 
        className="w-full h-28 sm:h-40 -mb-1 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, 
            #ffffff 0%, 
            rgba(255, 255, 255, 0.90) 20%, 
            rgba(65, 20, 36, 0.35) 50%, 
            rgba(36, 12, 22, 0.75) 75%, 
            #16080E 100%
          )`
        }}
      />

    </section>
  );
}