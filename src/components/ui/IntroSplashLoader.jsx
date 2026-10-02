import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';

export default function IntroSplashLoader({ onComplete }) {
  const { setIntroReady, currentRoute } = useBooth();

  // If on client setup portal, bypass splash screen completely
  const isSetup = currentRoute === 'setup';

  // Pure Luxury Minimalist Timeline
  const [phase, setPhase] = useState(isSetup ? 'done' : 'entering');

  useEffect(() => {
    if (isSetup) {
      if (setIntroReady) setIntroReady(true);
      if (onComplete) onComplete();
      return;
    }

    const timer1 = setTimeout(() => {
      setPhase('holding');
    }, 800);

    const timer2 = setTimeout(() => {
      setPhase('dissolve');
      if (setIntroReady) setIntroReady(true);
    }, 1800);

    const timer3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isSetup, onComplete, setIntroReady]);

  if (phase === 'done' || isSetup) return null;

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
            duration: 0.7,
            ease: [0.25, 1, 0.5, 1]
          }}
          className={`fixed inset-0 z-[99999] bg-[#FAF7F2] flex flex-col items-center justify-center select-none overflow-hidden ${
            phase === 'dissolve' ? 'pointer-events-none' : ''
          }`}
        >
          {/* Subtle Warm Ivory & Silk Radial Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FAF7F2] to-[#F5EFEB] pointer-events-none" />

          {/* Minimalist Pure Typography (No Logos or Symbols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={
              phase === 'dissolve'
                ? { opacity: 0, scale: 1.02 }
                : { opacity: 1, scale: 1 }
            }
            transition={{
              duration: phase === 'dissolve' ? 0.6 : 0.8,
              ease: [0.25, 1, 0.5, 1]
            }}
            className="relative z-10 flex flex-col items-center text-center px-4"
          >
            {/* Brand Title (Minimalist Typography) */}
            <h1 
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              className="text-base sm:text-lg font-bold tracking-[0.35em] text-[#6B111F] uppercase"
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
