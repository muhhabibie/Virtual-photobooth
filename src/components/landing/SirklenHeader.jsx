import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';

export default function SirklenHeader() {
  const { activeEvent, navigateToAdmin, introReady } = useBooth();

  // If on an active wedding event, omit header completely for 100% clean romantic hero
  if (activeEvent) {
    return null;
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={introReady ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-0 inset-x-0 z-40 select-none bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-end relative">
        <button
          onClick={navigateToAdmin}
          className="px-3.5 sm:px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-amber-400/50 hover:border-amber-300 text-amber-200 text-xs font-serif font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer pointer-events-auto"
          title="Portal Admin"
        >
          <Lock size={13} className="text-amber-300" />
          <span>Portal Admin</span>
        </button>
      </div>
    </motion.header>
  );
}
