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

        {/* ================= 👑 CENTERED PURE FLOATING MONOGRAM LOGO (NO TEXT) 👑 ================= */}
        <div 
          onClick={resetToMasterHome}
          className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer group pointer-events-auto transition-transform hover:scale-110 active:scale-95 p-1 rounded-full"
          title="Sirklen Photo"
        >
          {/* Pure Letter N Monogram Logo - Floating as a Royal Hallmark */}
          <img 
            src={logoPhotoboothWhite} 
            alt="Sirklen Monogram" 
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] group-hover:brightness-110 transition select-none" 
          />
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
