import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function IntroSplashLoader({ onComplete }) {
  const { setIntroReady } = useBooth();

  // Pure Luxury Minimalist Timeline:
  // 1. 'entering' (0.0s - 0.9s): Soft optical focus fade-in
  // 2. 'holding'  (0.9s - 2.2s): Calm, prestigious stillness
  // 3. 'dissolve' (2.2s - 3.0s): Dreamy cross-dissolve & handover to hero
  // 4. 'done'     (3.0s): Unmounted completely
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    // 1. Transition to holding stillness at 0.9s
    const timer1 = setTimeout(() => {
      setPhase('holding');
    }, 900);

    // 2. Transition to soft cross-dissolve at 2.2s & awaken page content
    const timer2 = setTimeout(() => {
      setPhase('dissolve');
      if (setIntroReady) {
        setIntroReady(true);
      }
    }, 2200);

    // 3. Unmount completely at 3.0s
    const timer3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete, setIntroReady]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence mode="wait">
      {phase !== 'done' && (
        <motion.div
          key="intro-splash-canvas"
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === 'dissolve' ? 0 : 1,
            filter: phase === 'dissolve' ? 'blur(10px)' : 'blur(0px)',
          }}
          transition={{
            duration: 0.8,
            ease: [0.25, 1, 0.5, 1]
          }}
          className={`fixed inset-0 z-[99999] bg-[#FAF7F2] flex flex-col items-center justify-center select-none overflow-hidden ${
            phase === 'dissolve' ? 'pointer-events-none' : ''
          }`}
        >
          {/* Subtle Warm Ivory & Silk Radial Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FAF7F2] to-[#F5EFEB] pointer-events-none" />

          {/* Central Luxury Monogram & Brand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
            animate={
              phase === 'dissolve'
                ? { opacity: 0, scale: 1.02, filter: 'blur(10px)' }
                : { opacity: 1, scale: 1, filter: 'blur(0px)' }
            }
            transition={{
              duration: phase === 'dissolve' ? 0.75 : 0.9,
              ease: [0.25, 1, 0.5, 1]
            }}
            className="relative z-10 flex flex-col items-center text-center px-4"
          >
            {/* Pure Monogram Logo */}
            <div className="relative mb-3.5">
              <img 
                src={logoPhotobooth} 
                alt="Sirklen Photo Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain select-none drop-shadow-[0_4px_24px_rgba(107,17,31,0.08)]"
              />
            </div>

            {/* Brand Title */}
            <h1 
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              className="text-base sm:text-lg font-bold tracking-[0.35em] text-[#6B111F] uppercase mt-1"
            >
              SIRKLEN PHOTO
            </h1>

            {/* Subtle Elegant Tagline */}
            <p className="text-[10px] sm:text-[11px] font-serif italic text-[#8C7A6B] tracking-[0.22em] uppercase mt-1.5">
              Wedding Photobooth
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
