import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';

const BRAND_NAME = "SIRKLEN PHOTO";
const BRAND_LETTERS = BRAND_NAME.split("");
const TOTAL_LETTERS = BRAND_LETTERS.length;

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

  // Timeline:
  // 1. 'entering' (0.0s - 2.5s): kontur emas tergambar, lalu tinta mengisi huruf mengikuti alur pena
  // 2. 'holding'  (2.5s - 3.7s): logo utuh, aura champagne bernafas lembut
  // 3. 'exiting'  (3.7s - 5.1s): tinta ditarik mundur (arah sebaliknya), lalu kontur emas ikut mundur
  // 4. 'dissolve' (5.1s - 5.8s): kanvas memudar ke aplikasi utama
  // 5. 'done'     (5.8s): unmount
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    setPhase('entering');
    if (setIntroReady) setIntroReady(false);

    const timer1 = setTimeout(() => setPhase('holding'), 2500);
    const timer2 = setTimeout(() => setPhase('exiting'), 3700);
    const timer3 = setTimeout(() => {
      setPhase('dissolve');
      if (setIntroReady) setIntroReady(true);
    }, 5100);
    const timer4 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 5800);

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
      ? { pathLength: { duration: 1.4, ease: EASE_DRAW, delay: 0.1 }, opacity: { duration: 0.3, delay: 0.1 } }
      : phase === 'holding'
      ? { opacity: { duration: 0.9, ease: 'easeOut' } }
      : { pathLength: { duration: 1.2, ease: EASE_DRAW, delay: 0.25 }, opacity: { duration: 1.45, times: [0, 0.8, 1] } };

  // Tinta utama: digambar maju, lalu ditarik mundur dari ujung ke awal (arah sebaliknya)
  const inkAnimate = isOut ? { pathLength: 0 } : { pathLength: 1 };
  const inkTransition = isOut
    ? { pathLength: { duration: 1.3, ease: EASE_DRAW } }
    : { pathLength: { duration: 1.9, ease: EASE_DRAW, delay: 0.45 } };

  return (
    <AnimatePresence mode="wait">
      {phase !== 'done' && (
        <motion.div
          key={`intro-splash-canvas-${introKey || 0}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'dissolve' ? 0 : 1 }}
          transition={{ duration: 0.7, ease: EASE_SOFT }}
          className={`fixed inset-0 z-[99999] bg-[#FAF8F5] flex flex-col items-center justify-center select-none overflow-hidden ${
            phase === 'dissolve' ? 'pointer-events-none' : ''
          }`}
        >
          {/* Warm Ivory & Silk Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFBF7] via-[#FAF8F5] to-[#F5EFEB] pointer-events-none" />

          {/* Aura champagne lembut */}
          <motion.div
            animate={{
              scale: phase === 'holding' ? [1, 1.06, 1] : 1,
              opacity: phase === 'holding' ? [0.35, 0.6, 0.35] : 0.35
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-200/35 via-rose-100/25 to-amber-100/15 blur-3xl pointer-events-none -translate-y-4"
            style={{ willChange: 'transform, opacity' }}
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
                aria-label="Sirklen Photo"
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

            {/* ================= 2. HURUF BERTAHAP: MASUK KIRI->KANAN, KELUAR KANAN->KIRI ================= */}
            <h1
              style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
              className="text-base sm:text-lg font-bold tracking-[0.38em] text-[#6B111F] uppercase flex items-center justify-center select-none"
            >
              {BRAND_LETTERS.map((char, idx) => {
                const reverseIdx = TOTAL_LETTERS - 1 - idx;
                return (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 6 }}
                    animate={isOut ? { opacity: 0, y: -5 } : { opacity: 1, y: 0 }}
                    transition={{
                      duration: isOut ? 0.5 : 0.7,
                      delay: isOut ? reverseIdx * 0.05 : 1.0 + idx * 0.06,
                      ease: EASE_SOFT
                    }}
                    className={char === " " ? "inline-block w-2 sm:w-2.5" : "inline-block"}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {char}
                  </motion.span>
                );
              })}
            </h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={phase === 'holding' ? { opacity: 0.85, y: 0 } : { opacity: 0, y: phase === 'entering' ? 4 : -4 }}
              transition={{ duration: 0.8, delay: phase === 'holding' ? 0.15 : 0 }}
              className="text-[10px] font-serif italic text-[#C4A46C] mt-2 tracking-wider"
            >
              Memories in Every Frame
            </motion.p>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
