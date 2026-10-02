import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import logoPhotobooth from '../../assets/logo photobooth.png';

const BRAND_NAME = "SIRKLEN PHOTO";
const BRAND_LETTERS = BRAND_NAME.split("");
const TOTAL_LETTERS = BRAND_LETTERS.length;

export default function IntroSplashLoader({ onComplete }) {
  const { setIntroReady, introKey } = useBooth();

  // Majestic & Leisurely Luxury Cinematic Timeline:
  // 1. 'entering' (0.0s - 2.1s): Progressive calligraphy stroke drawing (left -> right) & forward golden beam
  // 2. 'holding'  (2.1s - 3.5s): Aesthetic romantic breathing, warm champagne ambient aura
  // 3. 'exiting'  (3.5s - 5.1s): REVERSE stroke erase (right -> left) & backward golden beam sweep + reverse letter fade
  // 4. 'dissolve' (5.0s - 5.7s): Velvet lens optical blur fade & release to main app
  // 5. 'done'     (5.7s): Unmounted completely
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    setPhase('entering');
    if (setIntroReady) setIntroReady(false);

    // 1. Transition to holding peak at 2.1s
    const timer1 = setTimeout(() => {
      setPhase('holding');
    }, 2100);

    // 2. Transition to reverse stroke erase at 3.5s (arah sebaliknya)
    const timer2 = setTimeout(() => {
      setPhase('exiting');
    }, 3500);

    // 3. Transition to optical dissolve at 5.0s & trigger staggered page reveal
    const timer3 = setTimeout(() => {
      setPhase('dissolve');
      if (setIntroReady) setIntroReady(true);
    }, 5000);

    // 4. Unmount completely at 5.7s
    const timer4 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 5700);

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
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-200/35 via-rose-100/25 to-amber-100/15 blur-3xl pointer-events-none -translate-y-4" 
          />

          {/* Center Content Container */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            
            {/* ================= 👑 1. LOGO MONOGRAM DENGAN GORESAN MAJU & MUNDUR (ARAH SEBALIKNYA) 👑 ================= */}
            <div className="relative mb-4 inline-flex items-center justify-center">
              
              {/* Layer 1: Soft Ghost Underlay (Outline context di awal, memudar lembut di akhir) */}
              <motion.img 
                src={logoPhotobooth} 
                alt="Sirklen Photo Logo" 
                animate={{ 
                  opacity: phase === 'exiting' || phase === 'dissolve' ? 0 : 0.12,
                  scale: phase === 'exiting' || phase === 'dissolve' ? 0.96 : 1
                }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain select-none pointer-events-none"
              />

              {/* Layer 2: Main Monogram Letter dengan Progressive Reveal & Reverse Retraction */}
              <motion.div
                initial={{ 
                  clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                  opacity: 0,
                  scale: 0.95,
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
                        // EXIT: Arah Sebaliknya (Mundur dari Kanan ke Kiri menuju 0%)
                        clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                        opacity: 0,
                        scale: 0.96,
                        filter: 'blur(4px)'
                      }
                }
                transition={
                  phase === 'exiting' || phase === 'dissolve'
                    ? { duration: 1.6, ease: [0.4, 0, 0.2, 1] }
                    : phase === 'holding'
                    ? { duration: 1.4, ease: 'easeInOut' }
                    : { duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
                }
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                <img 
                  src={logoPhotobooth} 
                  alt="Sirklen Photo Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain select-none"
                />

                {/* Layer 3A: Entrance Golden Shimmer Beam (Menyapu Maju dari Kiri ke Kanan) */}
                {phase === 'entering' && (
                  <motion.div
                    key="shimmer-forward"
                    initial={{ left: '-30%', opacity: 0 }}
                    animate={{ left: '120%', opacity: [0, 0.95, 0.95, 0] }}
                    transition={{ 
                      duration: 1.8, 
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.1
                    }}
                    className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-[#C4A46C]/75 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-18deg)' }}
                  />
                )}

                {/* Layer 3B: Exit Golden Dissolve Beam (Arah Sebaliknya: Menyapu Mundur dari Kanan ke Kiri) */}
                {(phase === 'exiting' || phase === 'dissolve') && (
                  <motion.div
                    key="shimmer-reverse"
                    initial={{ left: '120%', opacity: 0 }}
                    animate={{ left: '-30%', opacity: [0, 0.95, 0.95, 0] }}
                    transition={{ 
                      duration: 1.6, 
                      ease: [0.4, 0, 0.2, 1]
                    }}
                    className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-[#C4A46C]/85 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(18deg)' }}
                  />
                )}
              </motion.div>
            </div>

            {/* ================= 👑 2. ANIMASI HURUF MAJU (KIRI->KANAN) & MUNDUR (KANAN->KIRI) 👑 ================= */}
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={
                phase === 'exiting' || phase === 'dissolve'
                  ? { opacity: 0, y: -6, letterSpacing: '0.42em', filter: 'blur(4px)' }
                  : { opacity: 1, y: 0, letterSpacing: '0.38em', filter: 'blur(0px)' }
              }
              transition={{
                duration: phase === 'exiting' || phase === 'dissolve' ? 0.9 : 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              className="text-base sm:text-lg font-bold tracking-[0.38em] text-[#6B111F] uppercase mt-0.5 flex items-center justify-center select-none"
            >
              {BRAND_LETTERS.map((char, idx) => {
                const isSpace = char === " ";
                const reverseIdx = TOTAL_LETTERS - 1 - idx;
                return (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                    animate={
                      phase === 'entering' || phase === 'holding'
                        ? { 
                            opacity: 1, 
                            y: 0, 
                            filter: 'blur(0px)' 
                          }
                        : { 
                            // Menghilang satu-per-satu dari arah sebaliknya (kanan ke kiri)
                            opacity: 0, 
                            y: -6, 
                            filter: 'blur(4px)' 
                          }
                    }
                    transition={{
                      duration: phase === 'exiting' || phase === 'dissolve' ? 0.45 : 0.65,
                      delay: phase === 'exiting' || phase === 'dissolve'
                        ? reverseIdx * 0.045
                        : 0.35 + idx * 0.065,
                      ease: [0.25, 1, 0.5, 1]
                    }}
                    className={isSpace ? "inline-block w-2 sm:w-2.5" : "inline-block"}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </motion.h1>

            {/* Subtitle / Company Badge */}
            <motion.p 
              initial={{ opacity: 0, y: 4, filter: 'blur(0px)' }}
              animate={
                phase === 'entering' || phase === 'holding'
                  ? { opacity: 1, y: 0, letterSpacing: '0.25em', filter: 'blur(0px)' }
                  : { opacity: 0, y: -6, letterSpacing: '0.34em', filter: 'blur(5px)' }
              }
              transition={{
                duration: phase === 'exiting' || phase === 'dissolve' ? 0.6 : 0.9,
                delay: phase === 'exiting' || phase === 'dissolve' ? 0.15 : 1.35,
                ease: [0.25, 1, 0.5, 1]
              }}
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
              transition={{ 
                duration: 0.8, 
                delay: phase === 'holding' ? 0.3 : 0 
              }}
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
