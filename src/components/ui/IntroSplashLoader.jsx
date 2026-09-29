import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function IntroSplashLoader({ onComplete }) {
  const { setIntroReady } = useBooth();

  // Romantic & Aesthetic Cinematic Timeline:
  // 1. 'entering' (0.0s - 1.6s): Poetic ink stroke sketch & silky golden beam entrance
  // 2. 'holding'  (1.6s - 3.2s): Aesthetic romantic breathing peak, warm champagne aura & shimmer
  // 3. 'exiting'  (3.2s - 4.1s): Slow graceful stroke dissolution sweep with gold stardust beam
  // 4. 'dissolve' (3.8s - 4.8s): Velvet lens optical blur fade & light bloom (triggers page choreography)
  // 5. 'done'     (4.8s): Unmounted completely
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    // 1. Transition to holding peak at 1.6s
    const timer1 = setTimeout(() => {
      setPhase('holding');
    }, 1600);

    // 2. Transition to progressive stroke dissolve at 3.2s
    const timer2 = setTimeout(() => {
      setPhase('exiting');
    }, 3200);

    // 3. Transition to velvet optical dissolve at 3.85s & trigger staggered page reveal
    const timer3 = setTimeout(() => {
      setPhase('dissolve');
      if (setIntroReady) {
        setIntroReady(true);
      }
    }, 3850);

    // 4. Unmount completely at 4.8s
    const timer4 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 4800);

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
                  filter: 'blur(20px)' 
                }
              : { 
                  opacity: 1, 
                  scale: 1, 
                  filter: 'blur(0px)' 
                }
          }
          transition={{ 
            duration: 0.95, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className={`fixed inset-0 z-[99999] bg-[#FAF8F5] flex flex-col items-center justify-center select-none overflow-hidden ${
            phase === 'dissolve' ? 'pointer-events-none' : ''
          }`}
        >
          {/* Subtle Warm Champagne & Rose-Gold Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FAF8F5] to-[#F5EFEB] pointer-events-none" />
          
          <motion.div 
            animate={{
              scale: phase === 'holding' ? [1, 1.08, 1] : 1,
              opacity: phase === 'holding' ? [0.45, 0.75, 0.45] : 0.45
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-amber-200/40 via-rose-100/30 to-amber-100/20 blur-3xl pointer-events-none -translate-y-4" 
          />

          {/* Center Monogram Logo with Symmetrical Progressive Reveal & Dissolve */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            
            {/* Progressive Stroke Reveal & Dissolve Container */}
            <div className="relative mb-4 inline-flex items-center justify-center">
              
              {/* Layer 1: Soft Ghost Underlay (Context during entrance, dissolves at exit) */}
              <motion.img 
                src={logoPhotobooth} 
                alt="Sirklen Photo Logo" 
                animate={{ 
                  opacity: phase === 'exiting' || phase === 'dissolve' ? 0 : 0.12,
                  scale: phase === 'exiting' || phase === 'dissolve' ? 1.06 : 1
                }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
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
                        scale: [1, 1.03, 1],
                        filter: 'blur(0px)'
                      }
                    : {
                        // AESTHETIC EXIT: Slow, poetic sweep dissolution from start to end
                        clipPath: 'polygon(105% 0%, 105% 0%, 100% 100%, 100% 100%)',
                        opacity: 0,
                        scale: 1.09,
                        filter: 'blur(7px)'
                      }
                }
                transition={
                  phase === 'exiting' || phase === 'dissolve'
                    ? { duration: 0.95, ease: [0.65, 0, 0.35, 1] }
                    : phase === 'holding'
                    ? { duration: 1.6, ease: 'easeInOut' }
                    : { duration: 1.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
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
                    initial={{ left: '-30%', opacity: 0 }}
                    animate={{ left: '120%', opacity: [0, 0.95, 0] }}
                    transition={{ 
                      duration: 1.45, 
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.1
                    }}
                    className="absolute top-0 bottom-0 w-10 bg-gradient-to-r from-transparent via-[#C4A46C]/65 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-18deg)' }}
                  />
                )}

                {/* Layer 3B: Exit Golden Dissolve Beam */}
                {(phase === 'exiting' || phase === 'dissolve') && (
                  <motion.div
                    initial={{ left: '-25%', opacity: 0 }}
                    animate={{ left: '125%', opacity: [0, 1, 0] }}
                    transition={{ 
                      duration: 0.95, 
                      ease: [0.65, 0, 0.35, 1]
                    }}
                    className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-[#C4A46C]/85 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-18deg)' }}
                  />
                )}
              </motion.div>

              {/* Delicate Golden Sparkle Glint during Holding */}
              {phase === 'holding' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0] }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
                  className="absolute -top-1.5 -right-1 text-amber-500 pointer-events-none"
                >
                  <Sparkles size={14} />
                </motion.div>
              )}
            </div>

            {/* Title & Tagline with Cinematic Blur & Romantic Spacing */}
            <motion.h1 
              initial={{ opacity: 0, letterSpacing: '0.22em', y: 5, filter: 'blur(0px)' }}
              animate={
                phase === 'exiting' || phase === 'dissolve'
                  ? { opacity: 0, y: -10, letterSpacing: '0.48em', filter: 'blur(8px)' }
                  : { opacity: 1, letterSpacing: '0.40em', y: 0, filter: 'blur(0px)' }
              }
              transition={
                phase === 'exiting' || phase === 'dissolve'
                  ? { duration: 0.75, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0.95, delay: 0.55, ease: [0.16, 1, 0.3, 1] }
              }
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              className="text-sm sm:text-base font-bold tracking-[0.40em] text-[#6B111F] uppercase mt-0.5"
            >
              SIRKLEN PHOTO
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 4, filter: 'blur(0px)' }}
              animate={
                phase === 'exiting' || phase === 'dissolve'
                  ? { opacity: 0, y: -6, letterSpacing: '0.36em', filter: 'blur(6px)' }
                  : { opacity: 1, y: 0, letterSpacing: '0.26em', filter: 'blur(0px)' }
              }
              transition={
                phase === 'exiting' || phase === 'dissolve'
                  ? { duration: 0.65, delay: 0.08, ease: [0.4, 0, 0.2, 1] }
                  : { duration: 0.85, delay: 0.8, ease: [0.16, 1, 0.3, 1] }
              }
              className="text-[9px] font-mono tracking-[0.26em] text-gray-500 uppercase mt-1.5"
            >
              PT SIRKLEN KREASI USAHA
            </motion.p>

            {/* Romantic Subtitle Whisper */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={
                phase === 'holding'
                  ? { opacity: 0.75, y: 0 }
                  : { opacity: 0, y: phase === 'entering' ? 4 : -4 }
              }
              transition={{ duration: 0.8, delay: phase === 'holding' ? 0.3 : 0 }}
              className="text-[10px] font-serif italic text-amber-900/70 mt-2 tracking-wider"
            >
              ✦ Memories in Every Frame ✦
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
