import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import logoPhotobooth from '../../assets/logo photobooth.png';

const BRAND_NAME = "SIRKLEN PHOTO";

export default function IntroSplashLoader({ onComplete }) {
  const { setIntroReady, introKey } = useBooth();

  // Romantic & Aesthetic Cinematic Timeline:
  // 1. 'entering' (0.0s - 1.35s): Progressive ink stroke drawing & golden shimmer beam entrance
  // 2. 'holding'  (1.35s - 2.5s): Aesthetic romantic breathing, warm champagne ambient aura
  // 3. 'exiting'  (2.5s - 3.2s): Smooth stroke sweep dissolution with golden exit beam
  // 4. 'dissolve' (3.0s - 3.7s): Velvet lens optical blur fade & release to main app
  // 5. 'done'     (3.7s): Unmounted completely
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    setPhase('entering');
    if (setIntroReady) setIntroReady(false);

    // 1. Transition to holding peak at 1.35s
    const timer1 = setTimeout(() => {
      setPhase('holding');
    }, 1350);

    // 2. Transition to progressive stroke dissolve at 2.5s
    const timer2 = setTimeout(() => {
      setPhase('exiting');
    }, 2500);

    // 3. Transition to optical dissolve at 3.0s & trigger staggered page reveal
    const timer3 = setTimeout(() => {
      setPhase('dissolve');
      if (setIntroReady) setIntroReady(true);
    }, 3000);

    // 4. Unmount completely at 3.7s
    const timer4 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 3700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [introKey, onComplete, setIntroReady]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence mode="wait">
      {phase !== 'done' && (
        <motion.div
          key={`intro-splash-canvas-${introKey || 0}`}
          initial={{ opacity: 1 }}
          animate={{
            opacity: phase === 'dissolve' ? 0 : 1,
            filter: phase === 'dissolve' ? 'blur(10px)' : 'blur(0px)',
          }}
          transition={{
            duration: 0.7,
            ease: [0.25, 1, 0.5, 1]
          }}
          className={`fixed inset-0 z-[99999] bg-[#FAF8F5] flex flex-col items-center justify-center select-none overflow-hidden ${
            phase === 'dissolve' ? 'pointer-events-none' : ''
          }`}
        >
          {/* Subtle Warm Ivory & Silk Radial Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FAF8F5] to-[#F5EFEB] pointer-events-none" />

          {/* Gentle Warm Champagne Ambient Aura */}
          <motion.div 
            animate={{
              scale: phase === 'holding' ? [1, 1.08, 1] : 1,
              opacity: phase === 'holding' ? [0.35, 0.65, 0.35] : 0.35
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-amber-200/35 via-rose-100/25 to-amber-100/15 blur-3xl pointer-events-none -translate-y-4" 
          />

          {/* Center Content Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            
            {/* ================= 👑 1. LOGO MONOGRAM DENGAN ANIMASI GORESAN HURUF 👑 ================= */}
            <div className="relative mb-4 inline-flex items-center justify-center">
              
              {/* Layer 1: Soft Ghost Underlay (Outline context di awal) */}
              <motion.img 
                src={logoPhotobooth} 
                alt="Sirklen Photo Logo" 
                animate={{ 
                  opacity: phase === 'exiting' || phase === 'dissolve' ? 0 : 0.12,
                  scale: phase === 'exiting' || phase === 'dissolve' ? 1.06 : 1
                }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain select-none pointer-events-none"
              />

              {/* Layer 2: Main Monogram Letter dengan Progressive Wipe Reveal (Animasi Goresan Huruf) */}
              <motion.div
                initial={{ 
                  clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                  opacity: 0,
                  scale: 0.94,
                  filter: 'blur(0px)'
                }}
                animate={
                  phase === 'entering' 
                    ? { 
                        clipPath: 'polygon(0% 0%, 105% 0%, 100% 100%, 0% 100%)',
                        opacity: 1,
                        scale: 1,
                        filter: 'blur(0px)'
                      }
                    : phase === 'holding'
                    ? {
                        clipPath: 'polygon(0% 0%, 105% 0%, 100% 100%, 0% 100%)',
                        opacity: 1,
                        scale: [1, 1.025, 1],
                        filter: 'blur(0px)'
                      }
                    : {
                        // EXIT: Progressive sweep dissolution from start to end
                        clipPath: 'polygon(105% 0%, 105% 0%, 100% 100%, 100% 100%)',
                        opacity: 0,
                        scale: 1.08,
                        filter: 'blur(6px)'
                      }
                }
                transition={
                  phase === 'exiting' || phase === 'dissolve'
                    ? { duration: 0.85, ease: [0.65, 0, 0.35, 1] }
                    : phase === 'holding'
                    ? { duration: 1.4, ease: 'easeInOut' }
                    : { duration: 1.25, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
                }
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                <img 
                  src={logoPhotobooth} 
                  alt="Sirklen Photo Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain select-none"
                />

                {/* Layer 3A: Entrance Golden Shimmer Beam (Sinar Emas Menyapu Ujung Goresan Huruf) */}
                {phase === 'entering' && (
                  <motion.div
                    initial={{ left: '-25%', opacity: 0 }}
                    animate={{ left: '120%', opacity: [0, 0.95, 0] }}
                    transition={{ 
                      duration: 1.25, 
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.1
                    }}
                    className="absolute top-0 bottom-0 w-10 bg-gradient-to-r from-transparent via-[#C4A46C]/70 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-18deg)' }}
                  />
                )}

                {/* Layer 3B: Exit Golden Dissolve Beam */}
                {(phase === 'exiting' || phase === 'dissolve') && (
                  <motion.div
                    initial={{ left: '-20%', opacity: 0 }}
                    animate={{ left: '125%', opacity: [0, 1, 0] }}
                    transition={{ 
                      duration: 0.85, 
                      ease: [0.65, 0, 0.35, 1]
                    }}
                    className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-[#C4A46C]/85 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-18deg)' }}
                  />
                )}
              </motion.div>
            </div>

            {/* ================= 👑 2. ANIMASI HURUF TIPOGRAFI BERTAHAP (STAGGERED LETTER REVEAL) 👑 ================= */}
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={
                phase === 'exiting' || phase === 'dissolve'
                  ? { opacity: 0, y: -8, letterSpacing: '0.45em', filter: 'blur(6px)' }
                  : { opacity: 1, y: 0, letterSpacing: '0.38em', filter: 'blur(0px)' }
              }
              transition={{
                duration: phase === 'exiting' || phase === 'dissolve' ? 0.6 : 0.4,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              className="text-base sm:text-lg font-bold tracking-[0.38em] text-[#6B111F] uppercase mt-0.5 flex items-center justify-center select-none"
            >
              {BRAND_NAME.split("").map((char, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    filter: 'blur(0px)' 
                  }}
                  transition={{
                    duration: 0.55,
                    delay: 0.25 + idx * 0.045,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className={char === " " ? "inline-block w-2 sm:w-2.5" : "inline-block"}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtitle / Company Badge */}
            <motion.p 
              initial={{ opacity: 0, y: 4, filter: 'blur(0px)' }}
              animate={
                phase === 'exiting' || phase === 'dissolve'
                  ? { opacity: 0, y: -6, letterSpacing: '0.34em', filter: 'blur(5px)' }
                  : { opacity: 1, y: 0, letterSpacing: '0.25em', filter: 'blur(0px)' }
              }
              transition={
                phase === 'exiting' || phase === 'dissolve'
                  ? { duration: 0.55, delay: 0.05, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0.75, delay: 0.75, ease: [0.16, 1, 0.3, 1] }
              }
              className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] text-[#8C7A6B] uppercase mt-1.5"
            >
              PT SIRKLEN KREASI USAHA
            </motion.p>

            {/* Romantic Whisper Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={
                phase === 'holding'
                  ? { opacity: 0.85, y: 0 }
                  : { opacity: 0, y: phase === 'entering' ? 4 : -4 }
              }
              transition={{ duration: 0.7, delay: phase === 'holding' ? 0.2 : 0 }}
              className="text-[10px] font-serif italic text-[#C4A46C] mt-2 tracking-wider"
            >
              ✦ Memories in Every Frame ✦
            </motion.p>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
