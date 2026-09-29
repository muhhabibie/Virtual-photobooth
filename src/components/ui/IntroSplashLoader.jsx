import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function IntroSplashLoader({ onComplete }) {
  // Cinematic Animation Phases:
  // 1. 'entering' (0.0s - 1.3s): Progressive ink stroke drawing & golden beam entrance
  // 2. 'holding'  (1.3s - 1.75s): Peak crest illumination & subtle aura breath
  // 3. 'exiting'  (1.75s - 2.3s): Progressive stroke dissolution sweep & blur fade-out
  // 4. 'curtain'  (2.3s - 2.95s): Luxury silk curtain wipe reveals the application
  // 5. 'done'     (2.95s): Unmounted
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    // 1. Transition to holding peak at 1.3s
    const timer1 = setTimeout(() => {
      setPhase('holding');
    }, 1300);

    // 2. Transition to progressive exit dissolve at 1.75s
    const timer2 = setTimeout(() => {
      setPhase('exiting');
    }, 1750);

    // 3. Transition to curtain wipe at 2.3s
    const timer3 = setTimeout(() => {
      setPhase('curtain');
    }, 2300);

    // 4. Unmount sequence at 2.95s
    const timer4 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2950);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <AnimatePresence mode="wait">
      {phase !== 'done' && (
        <motion.div
          key="intro-container"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'curtain' ? 0.95 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[99999] bg-[#0B0408] flex items-center justify-center select-none overflow-hidden"
        >
          {/* Top Layer: Pure White Silk Canvas with Monogram */}
          <motion.div
            initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            animate={{ 
              clipPath: phase === 'curtain'
                ? 'inset(100% 0% 0% 0%)' 
                : 'inset(0% 0% 0% 0%)' 
            }}
            transition={{ 
              duration: 0.85, 
              ease: [0.77, 0, 0.175, 1] 
            }}
            className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 pointer-events-none"
          >
            {/* Center Monogram Logo with Symmetrical Progressive Reveal & Dissolve */}
            <div className="flex flex-col items-center text-center px-4">
              
              {/* Progressive Stroke Reveal & Dissolve Container */}
              <div className="relative mb-3.5 inline-flex items-center justify-center">
                
                {/* Layer 1: Soft Ghost Underlay (Context during entrance, dissolves at exit) */}
                <motion.img 
                  src={logoPhotobooth} 
                  alt="Sirklen Photo Logo" 
                  animate={{ 
                    opacity: phase === 'exiting' || phase === 'curtain' ? 0 : 0.12,
                    scale: phase === 'exiting' || phase === 'curtain' ? 1.06 : 1
                  }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
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
                          filter: 'blur(5px)'
                        }
                  }
                  transition={
                    phase === 'exiting' || phase === 'curtain'
                      ? { duration: 0.75, ease: [0.65, 0, 0.35, 1] }
                      : phase === 'holding'
                      ? { duration: 0.45, ease: 'easeInOut' }
                      : { duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.1 }
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
                        duration: 1.15, 
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.1
                      }}
                      className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent pointer-events-none"
                      style={{ transform: 'skewX(-18deg)' }}
                    />
                  )}

                  {/* Layer 3B: Exit Golden Dissolve Beam (Sweeps across as the ink evaporates) */}
                  {(phase === 'exiting' || phase === 'curtain') && (
                    <motion.div
                      initial={{ left: '-20%', opacity: 0 }}
                      animate={{ left: '120%', opacity: [0, 1, 0] }}
                      transition={{ 
                        duration: 0.75, 
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
                  phase === 'exiting' || phase === 'curtain'
                    ? { opacity: 0, y: -12, letterSpacing: '0.46em', filter: 'blur(8px)' }
                    : { opacity: 1, letterSpacing: '0.38em', y: 0, filter: 'blur(0px)' }
                }
                transition={
                  phase === 'exiting' || phase === 'curtain'
                    ? { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                    : { duration: 0.7, delay: 0.5, ease: 'easeOut' }
                }
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                className="text-sm sm:text-base font-bold tracking-[0.38em] text-[#6B111F] uppercase mt-0.5"
              >
                SIRKLEN PHOTO
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 3, filter: 'blur(0px)' }}
                animate={
                  phase === 'exiting' || phase === 'curtain'
                    ? { opacity: 0, y: -8, letterSpacing: '0.35em', filter: 'blur(6px)' }
                    : { opacity: 1, y: 0, letterSpacing: '0.25em', filter: 'blur(0px)' }
                }
                transition={
                  phase === 'exiting' || phase === 'curtain'
                    ? { duration: 0.5, delay: 0.05, ease: [0.4, 0, 0.2, 1] }
                    : { duration: 0.6, delay: 0.7, ease: 'easeOut' }
                }
                className="text-[9px] font-mono tracking-[0.25em] text-gray-500 uppercase mt-1"
              >
                PT SIRKLEN KREASI USAHA
              </motion.p>
            </div>
          </motion.div>

          {/* Underneath Layer: Dark Luxury Background */}
          <div className="absolute inset-0 bg-[#0B0408] flex items-center justify-center z-0">
            <div className="w-80 h-80 rounded-full bg-[#6B111F]/60 blur-3xl opacity-70" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
