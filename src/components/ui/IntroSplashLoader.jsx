import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function IntroSplashLoader({ onComplete }) {
  const { setIntroReady } = useBooth();

  // Cinematic Animation Phases:
  // 1. 'entering' (0.0s - 1.15s): Progressive ink stroke drawing & golden beam entrance
  // 2. 'holding'  (1.15s - 1.55s): Peak crest illumination & subtle aura breath
  // 3. 'exiting'  (1.55s - 1.85s): Monogram progressive stroke dissolution sweep
  // 4. 'dissolve' (1.85s - 2.45s): Velvet optical blur & scale dissolve (no top curtain!) + triggers staggered content reveal
  // 5. 'done'     (2.45s): Unmounted completely
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    // 1. Transition to holding peak at 1.15s
    const timer1 = setTimeout(() => {
      setPhase('holding');
    }, 1150);

    // 2. Transition to progressive stroke dissolve at 1.55s
    const timer2 = setTimeout(() => {
      setPhase('exiting');
    }, 1550);

    // 3. Transition to velvet optical dissolve at 1.85s & trigger staggered page elements
    const timer3 = setTimeout(() => {
      setPhase('dissolve');
      if (setIntroReady) {
        setIntroReady(true);
      }
    }, 1850);

    // 4. Unmount completely at 2.45s
    const timer4 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete, setIntroReady]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence mode="wait">
      {phase !== 'done' && (
        <motion.div
          key="intro-splash-canvas"
          initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          animate={
            phase === 'dissolve'
              ? { 
                  opacity: 0, 
                  scale: 1.04, 
                  filter: 'blur(16px)' 
                }
              : { 
                  opacity: 1, 
                  scale: 1, 
                  filter: 'blur(0px)' 
                }
          }
          transition={{ 
            duration: 0.6, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className={`fixed inset-0 z-[99999] bg-[#FAF8F5] flex flex-col items-center justify-center select-none overflow-hidden ${
            phase === 'dissolve' ? 'pointer-events-none' : ''
          }`}
        >
          {/* Subtle Champagne Silk Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FAF8F5] to-[#F5EFEB] pointer-events-none" />
          <div className="absolute w-[450px] h-[450px] rounded-full bg-amber-100/40 blur-3xl pointer-events-none -translate-y-4" />

          {/* Center Monogram Logo with Symmetrical Progressive Reveal & Dissolve */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            
            {/* Progressive Stroke Reveal & Dissolve Container */}
            <div className="relative mb-3.5 inline-flex items-center justify-center">
              
              {/* Layer 1: Soft Ghost Underlay (Context during entrance, dissolves at exit) */}
              <motion.img 
                src={logoPhotobooth} 
                alt="Sirklen Photo Logo" 
                animate={{ 
                  opacity: phase === 'exiting' || phase === 'dissolve' ? 0 : 0.12,
                  scale: phase === 'exiting' || phase === 'dissolve' ? 1.06 : 1
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain select-none pointer-events-none"
              />

              {/* Layer 2: Main Monogram Letter N with Progressive Entrance & Progressive Exit Dissolve */}
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
                        // ADVANCED EXIT: Progressive sweep dissolution from start to end of the stroke
                        clipPath: 'polygon(105% 0%, 105% 0%, 100% 100%, 100% 100%)',
                        opacity: 0,
                        scale: 1.08,
                        filter: 'blur(6px)'
                      }
                }
                transition={
                  phase === 'exiting' || phase === 'dissolve'
                    ? { duration: 0.65, ease: [0.65, 0, 0.35, 1] }
                    : phase === 'holding'
                    ? { duration: 0.4, ease: 'easeInOut' }
                    : { duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.05 }
                }
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
              >
                <img 
                  src={logoPhotobooth} 
                  alt="Sirklen Photo Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain select-none"
                />

                {/* Layer 3A: Entrance Golden Shimmer Beam */}
                {phase === 'entering' && (
                  <motion.div
                    initial={{ left: '-25%', opacity: 0 }}
                    animate={{ left: '115%', opacity: [0, 0.9, 0] }}
                    transition={{ 
                      duration: 1.05, 
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.05
                    }}
                    className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-18deg)' }}
                  />
                )}

                {/* Layer 3B: Exit Golden Dissolve Beam */}
                {(phase === 'exiting' || phase === 'dissolve') && (
                  <motion.div
                    initial={{ left: '-20%', opacity: 0 }}
                    animate={{ left: '120%', opacity: [0, 1, 0] }}
                    transition={{ 
                      duration: 0.65, 
                      ease: [0.65, 0, 0.35, 1]
                    }}
                    className="absolute top-0 bottom-0 w-10 bg-gradient-to-r from-transparent via-[#C4A46C]/80 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-18deg)' }}
                  />
                )}
              </motion.div>
            </div>

            {/* Title & Tagline with Cinematic Blur & Floating Exit */}
            <motion.h1 
              initial={{ opacity: 0, letterSpacing: '0.22em', y: 4, filter: 'blur(0px)' }}
              animate={
                phase === 'exiting' || phase === 'dissolve'
                  ? { opacity: 0, y: -10, letterSpacing: '0.46em', filter: 'blur(8px)' }
                  : { opacity: 1, letterSpacing: '0.38em', y: 0, filter: 'blur(0px)' }
              }
              transition={
                phase === 'exiting' || phase === 'dissolve'
                  ? { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0.65, delay: 0.45, ease: 'easeOut' }
              }
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              className="text-sm sm:text-base font-bold tracking-[0.38em] text-[#6B111F] uppercase mt-0.5"
            >
              SIRKLEN PHOTO
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 3, filter: 'blur(0px)' }}
              animate={
                phase === 'exiting' || phase === 'dissolve'
                  ? { opacity: 0, y: -6, letterSpacing: '0.35em', filter: 'blur(6px)' }
                  : { opacity: 1, y: 0, letterSpacing: '0.25em', filter: 'blur(0px)' }
              }
              transition={
                phase === 'exiting' || phase === 'dissolve'
                  ? { duration: 0.45, delay: 0.05, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0.55, delay: 0.6, ease: 'easeOut' }
              }
              className="text-[9px] font-mono tracking-[0.25em] text-gray-500 uppercase mt-1"
            >
              PT SIRKLEN KREASI USAHA
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
