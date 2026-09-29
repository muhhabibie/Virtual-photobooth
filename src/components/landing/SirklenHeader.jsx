import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import logoPhotoboothWhite from '../../assets/logo photobooth white.png';

export default function SirklenHeader() {
  const { activeEvent, navigateToAdmin, resetToMasterHome, introReady } = useBooth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
      transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-0 inset-x-0 z-40 select-none bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between relative">
        
        {/* Left balance spacer */}
        <div className="w-12 sm:w-28" />

        {/* ================= 👑 CENTERED LUXURY FLOATING LOGO (NO .my.id, NO PT) 👑 ================= */}
        <div 
          onClick={resetToMasterHome}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 cursor-pointer group pointer-events-auto transition-transform hover:scale-105 active:scale-95 py-1 px-3 rounded-full hover:bg-white/5"
          title="Sirklen Photo"
        >
          {/* Pure Letter N Logo - Floating with Soft Glow */}
          <img 
            src={logoPhotoboothWhite} 
            alt="Sirklen Photo Logo" 
            className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] group-hover:brightness-110 transition" 
          />

          <span 
            style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
            className="font-bold text-xs sm:text-sm tracking-[0.26em] sm:tracking-[0.32em] text-white group-hover:text-amber-200 transition drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] uppercase whitespace-nowrap"
          >
            Sirklen Photo
          </span>
        </div>

        {/* ================= 🌟 RIGHT ACTION / EVENT BADGE 🌟 ================= */}
        <div className="flex items-center">
          {activeEvent ? (
            <div className="hidden sm:inline-flex px-3 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-serif italic shadow-md pointer-events-auto">
              {activeEvent.displayName}
            </div>
          ) : (
            <button
              onClick={navigateToAdmin}
              className="px-3 sm:px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/50 hover:border-amber-300 text-amber-200 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer pointer-events-auto"
              title="Portal Admin"
            >
              <Lock size={13} className="text-amber-300" />
              <span>Portal Admin</span>
            </button>
          )}
        </div>

      </div>
    </motion.header>
  );
}
