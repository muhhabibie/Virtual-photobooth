import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';

const BRAND_NAME = "VIRTUAL PHOTOBOOTH";

// ================= Geometri monogram Sirklen (dijiplak dari logo resmi, kanvas 551x551) =================
// Bentuk solid: huruf N + titik kiri-bawah + titik kanan-atas
const GLYPH_N = "M108 107 H183 L372 333 V107 H447 V445 H372 L183 220 V445 H108 Z";
const GLYPH_DOT_BOTTOM = "M108 475 H183 V535 H108 Z";
const GLYPH_DOT_TOP = "M372 20 H447 V78 H372 Z";

// Kontur tipis emas (digambar lebih dulu sebagai garis panduan)
const OUTLINE_PATH = `${GLYPH_DOT_BOTTOM} ${GLYPH_N} ${GLYPH_DOT_TOP}`;

// Jalur "pena" (centerline) — urutan goresan seperti menulis:
// titik bawah -> batang kiri naik -> diagonal turun -> batang kanan naik -> titik atas
const INK_PATH = "M145.5 535 V475 M145.5 445 V107 L409.5 445 V107 M409.5 78 V20";

const EASE_DRAW = [0.65, 0, 0.35, 1];
const EASE_SOFT = [0.25, 1, 0.5, 1];

export default function IntroSplashLoader({ onComplete }) {
  const { setIntroReady, introKey } = useBooth();
  const clipId = `sirklen-glyph-clip-${introKey || 0}`;

  // Timeline (snappy ~3.2s total on mobile & desktop):
  // 1. 'entering' (0.0s - 1.35s): kontur emas tergambar, tinta mengisi huruf
  // 2. 'holding'  (1.35s - 2.05s): logo utuh bernapas lembut
  // 3. 'exiting'  (2.05s - 2.75s): tinta & kontur ditarik mundur
  // 4. 'dissolve' (2.75s - 3.25s): kanvas memudar ke aplikasi utama
  // 5. 'done'     (3.25s): unmount
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    setPhase('entering');
    if (setIntroReady) setIntroReady(false);

    const timer1 = setTimeout(() => setPhase('holding'), 1350);
    const timer2 = setTimeout(() => setPhase('exiting'), 2050);
    const timer3 = setTimeout(() => {
      setPhase('dissolve');
      if (setIntroReady) setIntroReady(true);
    }, 2750);
    const timer4 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 3250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [introKey, onComplete, setIntroReady]);

  if (phase === 'done') return null;

  const isOut = phase === 'exiting' || phase === 'dissolve';

  // Kontur emas: muncul -> memudar saat tinta penuh -> muncul lagi & ditarik mundur saat keluar
  const outlineAnimate =
    phase === 'entering'
      ? { pathLength: 1, opacity: 1 }
      : phase === 'holding'
      ? { pathLength: 1, opacity: 0 }
      : { pathLength: 0, opacity: [0.7, 0.7, 0] };

  const outlineTransition =
    phase === 'entering'
      ? { pathLength: { duration: 0.85, ease: EASE_DRAW, delay: 0.05 }, opacity: { duration: 0.25, delay: 0.05 } }
      : phase === 'holding'
      ? { opacity: { duration: 0.5, ease: 'easeOut' } }
      : { pathLength: { duration: 0.65, ease: EASE_DRAW, delay: 0.1 }, opacity: { duration: 0.75, times: [0, 0.8, 1] } };

  // Tinta utama: digambar maju, lalu ditarik mundur dari ujung ke awal (arah sebaliknya)
  const inkAnimate = isOut ? { pathLength: 0 } : { pathLength: 1 };
  const inkTransition = isOut
    ? { pathLength: { duration: 0.65, ease: EASE_DRAW } }
    : { pathLength: { duration: 1.0, ease: EASE_DRAW, delay: 0.2 } };

  return (
    <AnimatePresence mode="wait">
      {phase !== 'done' && (
        <motion.div
          key={`intro-splash-canvas-${introKey || 0}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'dissolve' ? 0 : 1 }}
          transition={{ duration: 0.5, ease: EASE_SOFT }}
          className={`fixed inset-0 z-[99999] bg-[#FAF8F5] flex flex-col items-center justify-center select-none overflow-hidden ${
            phase === 'dissolve' ? 'pointer-events-none' : ''
          }`}
        >
          {/* Warm Ivory & Silk Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FAF8F5] to-[#F5EFEB] pointer-events-none" />

          {/* Lightweight Champagne Radial Aura (Zero heavy CSS blur filter for 60fps mobile) */}
          <div
            className="absolute w-[420px] h-[420px] rounded-full pointer-events-none -translate-y-4 opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(245, 215, 127, 0.22) 0%, rgba(255, 228, 230, 0.14) 45%, transparent 72%)',
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-4">

            {/* ================= 1. MONOGRAM — SVG STROKE / PATH DRAW ANIMATION ================= */}
            <motion.div
              initial={{ scale: 0.97 }}
              animate={{ scale: phase === 'holding' ? 1.02 : isOut ? 0.98 : 1 }}
              transition={{ duration: phase === 'holding' ? 1.2 : 1.6, ease: 'easeInOut' }}
              className="mb-5"
              style={{ willChange: 'transform' }}
            >
              <svg
                viewBox="98 10 359 535"
                className="h-[62px] sm:h-[78px] w-auto overflow-visible"
                aria-label="Virtual Photobooth"
                role="img"
              >
                <defs>
                  <clipPath id={clipId}>
                    <path d={`${GLYPH_N} ${GLYPH_DOT_BOTTOM} ${GLYPH_DOT_TOP}`} />
                  </clipPath>
                </defs>

                {/* Layer 1: Kontur emas tipis (path draw) */}
                <motion.path
                  d={OUTLINE_PATH}
                  fill="none"
                  stroke="#C4A46C"
                  strokeWidth={14}
                  strokeLinejoin="miter"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={outlineAnimate}
                  transition={outlineTransition}
                />

                {/* Layer 2: Tinta pena mengisi huruf (stroke drawing, di-clip ke bentuk logo asli) */}
                <g clipPath={`url(#${clipId})`}>
                  <motion.path
                    d={INK_PATH}
                    fill="none"
                    stroke="#1C1917"
                    strokeWidth={96}
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={inkAnimate}
                    transition={inkTransition}
                  />
                </g>
              </svg>
            </motion.div>

            {/* ================= 2. BRAND TYPOGRAPHY LOCKUP ================= */}
            <div className="flex flex-col items-center justify-center mt-0.5">
              {/* Title: VIRTUAL PHOTOBOOTH (Single GPU-composited layer instead of 18 span nodes) */}
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={isOut ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }}
                transition={{
                  duration: isOut ? 0.4 : 0.65,
                  delay: isOut ? 0 : 0.45,
                  ease: EASE_SOFT
                }}
                style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif", willChange: 'transform, opacity' }}
                className="text-xs xs:text-sm sm:text-base md:text-lg font-bold tracking-[0.24em] sm:tracking-[0.32em] text-[#540D18] uppercase text-center select-none whitespace-nowrap pl-[0.24em] sm:pl-[0.32em]"
              >
                {BRAND_NAME}
              </motion.h1>

              {/* Tagline: makes memories with sirklenice (Luxury Editorial with Delicate Hairlines) */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={isOut ? { opacity: 0, y: -4 } : { opacity: 1, y: 0 }}
                transition={{
                  duration: isOut ? 0.35 : 0.65,
                  delay: isOut ? 0.05 : 0.7,
                  ease: EASE_SOFT
                }}
                className="flex items-center justify-center gap-2.5 sm:gap-3.5 mt-3 sm:mt-3.5"
                style={{ willChange: 'transform, opacity' }}
              >
                <span className="w-5 sm:w-8 h-[1px] bg-gradient-to-r from-transparent via-[#8C6D46]/45 to-[#8C6D46]/70" />
                <p
                  style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                  className="text-xs sm:text-[13px] font-normal italic tracking-[0.18em] sm:tracking-[0.22em] text-[#785C38] select-none whitespace-nowrap leading-none"
                >
                  makes memories with sirklenice
                </p>
                <span className="w-5 sm:w-8 h-[1px] bg-gradient-to-l from-transparent via-[#8C6D46]/45 to-[#8C6D46]/70" />
              </motion.div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
