import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import logoPhotoboothWhite from '../../assets/logo photobooth white.png';

export default function SirklenHeader() {
  const { activeEvent, navigateToAdmin, resetToMasterHome, introReady } = useBooth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-0 inset-x-0 z-40 select-none bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between relative">
        
        {/* Left balance spacer */}
        <div className="w-16 sm:w-32" />

        {/* ================= 👑 CENTERED LUXURY FLOATING LOGO 👑 ================= */}
        <div 
          onClick={resetToMasterHome}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2.5 cursor-pointer group pointer-events-auto transition-transform hover:scale-105 active:scale-95 py-1 px-3 rounded-full hover:bg-white/5"
          title="Sirklen Photo"
        >
          {/* Pure Letter N Logo - Floating with Candlelit Glow */}
          <img 
            src={logoPhotoboothWhite} 
            alt="Sirklen Photo Logo" 
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] group-hover:brightness-110 transition" 
          />

          <div className="flex items-center gap-1.5">
            <span 
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              className="font-bold text-sm sm:text-base tracking-[0.22em] sm:tracking-[0.28em] text-white group-hover:text-amber-200 transition drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] uppercase"
            >
              Sirklen Photo
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-amber-400/20 backdrop-blur-md border border-amber-400/40 text-amber-200 font-bold shadow-sm">
              .my.id
            </span>
          </div>
        </div>

        {/* ================= 🌟 RIGHT ACTION / EVENT BADGE 🌟 ================= */}
        <div className="flex items-center">
          {activeEvent ? (
            <div className="hidden xs:inline-flex px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-amber-200 text-xs font-serif italic shadow-lg pointer-events-auto">
              {activeEvent.displayName}
            </div>
          ) : (
            <button
              onClick={navigateToAdmin}
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/50 hover:border-amber-300 text-amber-200 text-xs font-serif font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer pointer-events-auto"
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
