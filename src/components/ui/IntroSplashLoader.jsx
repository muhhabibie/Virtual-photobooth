import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function IntroSplashLoader({ onComplete }) {
  const [stage, setStage] = useState('visible'); // 'visible' | 'wiping' | 'fading' | 'done'

  useEffect(() => {
    // Stage 1 -> 2: Start curtain wipe after logo drawing finishes at 1.5s
    const timer1 = setTimeout(() => {
      setStage('wiping');
    }, 1500);

    // Stage 2 -> 3: Start fade-out of dark screen at 2.4s
    const timer2 = setTimeout(() => {
      setStage('fading');
    }, 2400);

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
          transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }}
          className="fixed inset-0 z-[99999] bg-[#0B0408] flex items-center justify-center select-none overflow-hidden"
        >
          {/* Top Layer: Pure White Background with Black Camera Monogram */}
          <motion.div
            initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            animate={{ 
              clipPath: stage === 'wiping' || stage === 'fading'
                ? 'inset(100% 0% 0% 0%)' 
                : 'inset(0% 0% 0% 0%)' 
            }}
            transition={{ 
              duration: 0.9, 
              ease: [0.76, 0, 0.24, 1] 
            }}
            className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 pointer-events-none"
          >
            {/* Center Monogram Logo with Progressive Letter Reveal */}
            <div className="flex flex-col items-center text-center px-4">
              
              {/* Progressive Stroke Reveal Container */}
              <div className="relative mb-3.5 inline-flex items-center justify-center">
                
                {/* Layer 1: Soft Ghost Underlay (Outline context) */}
                <img 
                  src={logoPhotobooth} 
                  alt="Sirklen Photo Logo" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain opacity-10 select-none pointer-events-none"
                />

                {/* Layer 2: Progressive Wipe Reveal (From Left/Start to Right/End of Letter N) */}
                <motion.div
                  initial={{ 
                    clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
                    opacity: 0,
                    scale: 0.94
                  }}
                  animate={{ 
                    clipPath: 'polygon(0% 0%, 105% 0%, 100% 100%, 0% 100%)',
                    opacity: 1,
                    scale: 1
                  }}
                  transition={{ 
                    duration: 1.15, 
                    ease: [0.22, 1, 0.36, 1],
                    delay: 0.15
                  }}
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                >
                  <img 
                    src={logoPhotobooth} 
                    alt="Sirklen Photo Logo" 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain select-none"
                  />

                  {/* Layer 3: Soft Golden Light Beam Sweeping Along the Stroke Tip */}
                  <motion.div
                    initial={{ left: '-25%', opacity: 0 }}
                    animate={{ left: '115%', opacity: [0, 0.9, 0] }}
                    transition={{ 
                      duration: 1.15, 
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.15
                    }}
                    className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent pointer-events-none"
                    style={{ transform: 'skewX(-18deg)' }}
                  />
                </motion.div>
              </div>

              {/* Title & Tagline with Elegant Typography Reveal */}
              <motion.h1 
                initial={{ opacity: 0, letterSpacing: '0.22em', y: 4 }}
                animate={{ opacity: 1, letterSpacing: '0.38em', y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
                className="text-sm sm:text-base font-bold tracking-[0.38em] text-[#6B111F] uppercase mt-0.5"
              >
                SIRKLEN PHOTO
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: 'easeOut' }}
                className="text-[9px] font-mono tracking-[0.25em] text-gray-500 uppercase mt-1"
              >
                PT SIRKLEN KREASI USAHA
              </motion.p>
            </div>
          </motion.div>

          {/* Underneath Layer: Dark Burgundy Background */}
          <div className="absolute inset-0 bg-[#0B0408] flex items-center justify-center z-0">
            <div className="w-80 h-80 rounded-full bg-[#6B111F]/60 blur-3xl opacity-70" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
