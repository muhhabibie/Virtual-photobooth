import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroSplashLoader({ onComplete }) {
  const [stage, setStage] = useState('visible'); // 'visible' | 'wiping' | 'fading' | 'done'

  useEffect(() => {
    // Stage 1 -> 2: Start top-to-bottom erase/wipe transition at 1.2s
    const timer1 = setTimeout(() => {
      setStage('wiping');
    }, 1200);

    // Stage 2 -> 3: Start fade-out of dark screen at 2.3s
    const timer2 = setTimeout(() => {
      setStage('fading');
    }, 2300);

    // Stage 3 -> Done: Unmount intro at 2.9s
    const timer3 = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 2900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <AnimatePresence mode="wait">
      {stage !== 'done' && (
        <motion.div
          key="intro-container"
          initial={{ opacity: 1 }}
          animate={{ opacity: stage === 'fading' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[99999] bg-[#0B0408] flex items-center justify-center select-none overflow-hidden"
        >
          {/* Top Layer: Pure White Background with Black Monogram Logo */}
          <motion.div
            initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            animate={{ 
              clipPath: stage === 'wiping' || stage === 'fading'
                ? 'inset(100% 0% 0% 0%)' 
                : 'inset(0% 0% 0% 0%)' 
            }}
            transition={{ 
              duration: 1.1, 
              ease: [0.76, 0, 0.24, 1] 
            }}
            className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 pointer-events-none"
          >
            {/* Center Black Monogram Logo */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="flex flex-col items-center text-center px-4"
            >
              {/* Architectural Sleek Black Monogram Emblem (Inspired by Screenshot) */}
              <svg 
                viewBox="0 0 100 100" 
                fill="currentColor" 
                className="w-16 h-16 sm:w-20 sm:h-20 text-black mb-3"
              >
                {/* Modern Arch & Ring Monogram */}
                <path d="M50 8 C28 8 18 26 18 46 L18 90 L33 90 L33 46 C33 33 39 22 50 22 C61 22 67 33 67 46 L67 90 L82 90 L82 46 C82 26 72 8 50 8 Z" />
                <circle cx="50" cy="56" r="7.5" />
              </svg>

              {/* Title & Tagline */}
              <h1 
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                className="text-xs sm:text-sm font-bold tracking-[0.38em] text-black uppercase mt-2"
              >
                Sabrina & Raka
              </h1>
              <p className="text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-gray-500 uppercase mt-1">
                The Wedding Photobooth
              </p>
            </motion.div>
          </motion.div>

          {/* Underneath Layer: Dark Burgundy Background with Subtle Gold Ambient Glow */}
          <div className="absolute inset-0 bg-[#0B0408] flex items-center justify-center z-0">
            <div 
              className="w-80 h-80 rounded-full bg-[#6B111F]/60 blur-3xl opacity-70"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
