import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sparkles, Download, Volume2, Check, Share2 } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import MonochromeFloralOrnament from '../ui/MonochromeFloralOrnament';

const romanticTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
};

const HOW_STEPS = [
  {
    id: 1,
    num: '01',
    title: 'Pilih Strip & Bingkai',
    desc: 'Pilih layout 1–4 pose foto dan warna bingkai favoritmu (Burgundy, Ivory, Slate, dll) dengan live preview instan.',
    badge: 'LANGKAH 1',
  },
  {
    id: 2,
    num: '02',
    title: 'Ambil Foto Bersama & Rekam Doa',
    desc: 'Ambil foto bersama dan rekam doa ucapan untuk calon mempelai secara langsung melalui pesan suara.',
    badge: 'LANGKAH 2',
  },
  {
    id: 3,
    num: '03',
    title: 'Unduh & Bagikan Kenangan',
    desc: 'Unduh photo strip berbingkai kualitas HD (2X Retina) dan bagikan kenangan manismu ke media sosial.',
    badge: 'LANGKAH 3',
  },
];

const DEMO_THEMES = [
  { name: 'Burgundy', hex: '#6B111F', text: '#F5D77F' },
  { name: 'Ivory', hex: '#FDFBF7', text: '#6B111F' },
  { name: 'Slate', hex: '#2D3748', text: '#E2E8F0' },
  { name: 'Blush', hex: '#F3C5CB', text: '#6B111F' },
  { name: 'Gold', hex: '#C4A46C', text: '#FFFFFF' },
];

export default function HowItWorks() {
  const { openBooth } = useBooth();
  const { toast } = useToast();

  // Interactive step state
  const [activeStep, setActiveStep] = useState(1);
  
  // Step 1 interactive demo state
  const [demoPoses, setDemoPoses] = useState(4);
  const [demoThemeIdx, setDemoThemeIdx] = useState(0);

  // Step 2 interactive demo state
  const [demoTimer, setDemoTimer] = useState(3);
  const [demoFlashing, setDemoFlashing] = useState(false);
  const [demoRecording, setDemoRecording] = useState(false);

  // Step 3 interactive demo state
  const [demoDownloaded, setDemoDownloaded] = useState(false);

  const activeDemoTheme = DEMO_THEMES[demoThemeIdx];

  const handleSimulateFlash = () => {
    setDemoFlashing(true);
    setTimeout(() => setDemoFlashing(false), 450);
  };

  return (
    <section 
      id="how-to" 
      className="pt-14 sm:pt-20 pb-0 text-white overflow-hidden relative bg-[#16080E]"
    >
      {/* Seamless Top Blend Overlay from EventGalleryFeed */}
      <div 
        className="absolute top-0 inset-x-0 h-28 sm:h-36 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(to bottom, #16080E 0%, rgba(22, 8, 14, 0.75) 45%, transparent 100%)'
        }}
      />

      {/* ================= 🌸 100% PURE VECTOR BOTANICAL ORNAMENTS (SCATTERED IN ALL CORNERS) 🌸 ================= */}
      {/* 1. Top Left Gold Botanical Linework */}
      <MonochromeFloralOrnament 
        variant="corner-tl"
        className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 w-44 sm:w-64 md:w-72 h-44 sm:h-64 md:h-72 pointer-events-none text-[#F5D77F] opacity-35 z-0"
      />

      {/* 2. Top Right Gold Botanical Linework */}
      <MonochromeFloralOrnament 
        variant="corner-tr"
        className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 w-44 sm:w-64 md:w-72 h-44 sm:h-64 md:h-72 pointer-events-none text-[#F5D77F] opacity-35 z-0"
      />

      {/* 3. Middle Left Side Accent */}
      <MonochromeFloralOrnament 
        variant="corner-bl"
        className="absolute top-1/3 -left-10 sm:-left-14 w-36 sm:w-56 md:w-64 h-36 sm:h-56 md:h-64 pointer-events-none text-[#F5D77F] opacity-20 z-0 transform rotate-45"
      />

      {/* 4. Middle Right Side Accent */}
      <MonochromeFloralOrnament 
        variant="corner-br"
        className="absolute top-1/2 -right-10 sm:-right-14 w-36 sm:w-56 md:w-64 h-36 sm:h-56 md:h-64 pointer-events-none text-[#F5D77F] opacity-20 z-0 transform -rotate-45"
      />

      {/* 5. Bottom Left Gold Botanical Linework */}
      <MonochromeFloralOrnament 
        variant="corner-bl"
        className="absolute bottom-16 -left-6 sm:bottom-20 sm:-left-8 w-40 sm:w-64 md:w-72 h-40 sm:h-64 md:h-72 pointer-events-none text-[#F5D77F] opacity-30 z-0"
      />

      {/* 6. Bottom Right Gold Botanical Linework */}
      <MonochromeFloralOrnament 
        variant="corner-br"
        className="absolute bottom-16 -right-6 sm:bottom-20 sm:-right-8 w-40 sm:w-64 md:w-72 h-40 sm:h-64 md:h-72 pointer-events-none text-[#F5D77F] opacity-30 z-0"
      />

      {/* ================= 🌟 GRAND MULTI-LAYERED AMBIENT SPOTLIGHT GRADIENT AURA 🌟 ================= */}
      {/* Layer 1: Giant Deep Burgundy & Wine Crimson Backdrop Radiance */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] max-w-[1400px] h-[800px] sm:h-[1100px] pointer-events-none z-0 rounded-full opacity-85 blur-[120px] sm:blur-[160px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(138, 24, 40, 0.85) 0%, rgba(107, 17, 31, 0.60) 35%, rgba(74, 8, 21, 0.40) 60%, rgba(196, 164, 108, 0.18) 80%, transparent 95%)'
        }}
      />

      {/* Layer 2: Core Golden Light Beam (Pendaran Emas Megah) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-[900px] h-[450px] sm:h-[650px] pointer-events-none z-0 rounded-full opacity-60 blur-[80px] sm:blur-[110px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 215, 127, 0.50) 0%, rgba(212, 175, 55, 0.30) 40%, rgba(138, 24, 40, 0.20) 70%, transparent 88%)'
        }}
      />

      {/* Layer 3: Top Title Golden Crown Beam */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 w-[850px] sm:w-[1200px] h-[420px] pointer-events-none z-0 rounded-full opacity-50 blur-[110px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 215, 127, 0.45) 0%, rgba(138, 24, 40, 0.35) 50%, transparent 80%)'
        }}
      />

      <div className="max-w-md sm:max-w-xl mx-auto px-3.5 sm:px-5 relative z-10">
        
        {/* ================= 🌟 1. SECTION HEADER 🌟 ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={romanticTransition}
          className="text-center mb-5 sm:mb-6"
        >
          {/* Top Divider with Gold Text */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 mb-2 sm:mb-2.5">
            <span className="h-[1px] w-6 sm:w-8 bg-[#C4A46C]/40" />
            <span className="text-[9px] sm:text-xs font-sans tracking-[0.22em] sm:tracking-[0.25em] text-[#C4A46C] uppercase font-bold">
              PANDUAN PHOTOBOOTH
            </span>
            <span className="h-[1px] w-6 sm:w-8 bg-[#C4A46C]/40" />
          </div>

          {/* Section Main Title */}
          <h2 className="text-xl sm:text-3xl font-serif text-white leading-tight font-bold">
            Panduan Interaktif &<br />
            <span className="text-[#E5C158] font-serif">Cara Mengabadikan Momen</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-[#B3A1A8] font-sans mt-1.5 sm:mt-2">
            Ketuk langkah di bawah untuk mencoba simulasi photobooth secara langsung:
          </p>
        </motion.div>

        {/* ================= 🌟 2. INTERACTIVE STEP SWITCHER TABS 🌟 ================= */}
        <div className="flex rounded-xl sm:rounded-2xl bg-[#220F1A] border border-[#C4A46C]/30 p-1 mb-5 sm:mb-6 gap-1 shadow-xl">
          {HOW_STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              className={`flex-1 py-2 sm:py-2.5 px-1 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-serif font-bold transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                activeStep === s.id
                  ? 'bg-gradient-to-r from-[#6B111F] to-[#8A1828] text-[#F5D77F] shadow-md shadow-rose-950/40 border border-amber-300/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-[9px] sm:text-[10px] font-mono opacity-75">{s.num}.</span>
              <span className="truncate">{s.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* ================= 🌟 3. INTERACTIVE SIMULATOR STAGE 🌟 ================= */}
        <div className="bg-[#2A1420] border border-[#C4A46C]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl mb-6 sm:mb-8 transition-all">
          <AnimatePresence mode="wait">
            
            {/* STAGE 1: INTERACTIVE FRAME & COLOR CHOOSER */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-[10px] font-mono tracking-widest text-[#E5C158] uppercase font-bold mb-1">
                  SIMULASI LANGKAH 1
                </span>
                <h3 className="text-lg font-serif font-bold text-white mb-3">
                  Pilih Jumlah Pose & Warna Strip
                </h3>

                {/* Interactive Pose Count Selector */}
                <div className="flex gap-2 mb-3.5 w-full justify-center">
                  {[1, 2, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setDemoPoses(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        demoPoses === num
                          ? 'bg-[#6B111F] text-[#F5D77F] border border-amber-400/40 shadow-sm'
                          : 'bg-black/30 text-gray-400 border border-white/10 hover:text-white'
                      }`}
                    >
                      {num === 1 ? 'Polaroid (1)' : `${num} Foto Strip`}
                    </button>
                  ))}
                </div>

                {/* Interactive Color Theme Swatches */}
                <div className="flex items-center gap-1.5 sm:gap-2 mb-3.5 sm:mb-4">
                  {DEMO_THEMES.map((theme, i) => (
                    <button
                      key={theme.name}
                      onClick={() => setDemoThemeIdx(i)}
                      style={{ backgroundColor: theme.hex }}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                        demoThemeIdx === i ? 'scale-125 border-amber-300 ring-2 ring-white/30' : 'border-white/20 hover:scale-110'
                      }`}
                      title={theme.name}
                    >
                      {demoThemeIdx === i && (
                        <Check size={10} className={theme.hex === '#FDFBF7' ? 'text-gray-900' : 'text-white'} />
                      )}
                    </button>
                  ))}
                </div>

                {/* Live Simulated Demo Card */}
                <div 
                  style={{ backgroundColor: activeDemoTheme.hex }}
                  className="w-40 sm:w-48 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-white/20 flex flex-col justify-between transition-colors duration-300"
                >
                  <p 
                    style={{ color: activeDemoTheme.text }}
                    className="text-[6.5px] sm:text-[7px] font-serif font-bold uppercase tracking-widest pb-1 border-b border-black/10"
                  >
                    THE WEDDING OF SABRINA & RAKA
                  </p>
                  
                  <div className="flex flex-col gap-1 sm:gap-1.5 py-1 sm:py-1.5">
                    {Array.from({ length: demoPoses }).map((_, idx) => (
                      <div key={idx} className="w-full aspect-[4/3] rounded sm:rounded-lg bg-black/30 border border-black/15 overflow-hidden flex items-center justify-center">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" 
                          alt="Demo Pose" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-1 border-t border-black/10">
                    <p className="text-[6px] sm:text-[6.5px] font-serif italic text-white/80">With Love & Blessings,</p>
                    <h4 
                      style={{ 
                        color: activeDemoTheme.text,
                        fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" 
                      }}
                      className="text-[11px] sm:text-xs font-serif font-bold italic leading-tight my-0.5"
                    >
                      Marko
                    </h4>
                    <p className="text-[5.5px] sm:text-[6px] opacity-80 text-white font-mono mt-0.5">
                      10 Mei 2026 • Tema: {activeDemoTheme.name}
                    </p>
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-[#B3A1A8] mt-2.5 sm:mt-3">
                  ✓ Ubah jumlah pose & warna di atas untuk melihat preview berubah langsung!
                </p>
              </motion.div>
            )}

            {/* STAGE 2: AMBIL FOTO BERSAMA & REKAM DOA UCAPAN UNTUK CALON MEMPELAI */}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[#E5C158] uppercase font-bold mb-1">
                  LANGKAH 2
                </span>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-2 sm:mb-2.5 max-w-sm leading-snug">
                  Ambil Foto Bersama & Rekam Doa Ucapan untuk Calon Mempelai
                </h3>

                {/* ================= 🌟 OPEN FANNED 3-STEP DECK (1. SESI POTRET • 2. HASIL POTRET • 3. REKAM SUARA) 🌟 ================= */}
                <div className="relative w-full max-w-[340px] xs:max-w-[390px] sm:max-w-[460px] h-48 sm:h-56 flex items-center justify-center my-3 sm:my-4">
                  
                  {/* ================= CARD 1 (LEFT): SESI POTRET ================= */}
                  <div 
                    className="absolute -left-1 xs:left-1 sm:left-4 top-2 xs:top-3 sm:top-2 w-32 xs:w-36 sm:w-44 aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-black/90 border-2 border-white/30 shadow-2xl transform -rotate-12 -translate-x-2 xs:-translate-x-3 sm:-translate-x-4 transition-all duration-300 hover:rotate-0 hover:scale-110 hover:z-30 z-10 cursor-pointer group"
                    onClick={handleSimulateFlash}
                    title="Langkah 1: Sesi Potret Live"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
                      alt="1. Sesi Potret"
                      className="w-full h-full object-cover filter brightness-80 contrast-110 group-hover:scale-105 transition-transform"
                    />
                    
                    {/* Viewfinder Target Brackets */}
                    <span className="absolute top-1.5 left-1.5 text-amber-300 text-[10px] font-mono leading-none">┌</span>
                    <span className="absolute top-1.5 right-1.5 text-amber-300 text-[10px] font-mono leading-none">┐</span>
                    <span className="absolute bottom-1.5 left-1.5 text-amber-300 text-[10px] font-mono leading-none">└</span>
                    <span className="absolute bottom-1.5 right-1.5 text-amber-300 text-[10px] font-mono leading-none">┘</span>

                    {/* Step 1 Header Badge */}
                    <div className="absolute top-1.5 inset-x-1 flex justify-center">
                      <span className="px-1.5 py-0.5 rounded-full bg-black/80 backdrop-blur-xs text-[7px] sm:text-[8px] font-mono font-bold text-amber-200 border border-white/20 shadow-sm truncate">
                        📸 1. Sesi Potret
                      </span>
                    </div>

                    {/* Timer Pill */}
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="px-1.5 py-0.5 rounded-md bg-red-600/90 text-white text-[6.5px] sm:text-[7.5px] font-mono font-bold">
                        ⏱ 3s Live
                      </span>
                    </div>
                  </div>

                  {/* ================= CARD 2 (CENTER): HASIL POTRET ================= */}
                  <div 
                    className="relative w-38 xs:w-42 sm:w-50 aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-black border-2 border-amber-300 shadow-2xl z-20 transform hover:scale-105 transition-all duration-300 ring-4 ring-black/70 cursor-pointer"
                    onClick={handleSimulateFlash}
                    title="Langkah 2: Tampil Hasil Potret Siap"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80"
                      alt="2. Hasil Potret"
                      className="w-full h-full object-cover"
                    />

                    {/* Flash Effect on capture */}
                    {demoFlashing && (
                      <div className="absolute inset-0 bg-white z-40 animate-ping opacity-95" />
                    )}

                    {/* Step 2 Header Badge */}
                    <div className="absolute top-1.5 inset-x-1 flex justify-center">
                      <span className="px-2 py-0.5 rounded-full bg-[#6B111F]/90 backdrop-blur-xs text-[7.5px] sm:text-[8.5px] font-serif font-bold text-[#F5D77F] border border-[#F5D77F]/40 shadow-sm">
                        ✨ 2. Hasil Potret
                      </span>
                    </div>

                    {/* Shutter Button */}
                    <div className="absolute bottom-2 inset-x-0 flex items-center justify-center z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSimulateFlash();
                        }}
                        className="px-2.5 sm:px-3 py-1 rounded-full bg-white/95 hover:bg-white text-gray-900 text-[8.5px] sm:text-[9.5px] font-bold shadow-lg active:scale-90 transition cursor-pointer flex items-center gap-1"
                      >
                        <span>⚡</span>
                        <span>Tes Jepret</span>
                      </button>
                    </div>

                    {/* Watermark Sabrina & Raka */}
                    <div className="absolute bottom-1.5 right-1.5 pointer-events-none">
                      <span className="text-[6.5px] sm:text-[7.5px] font-script text-white/90 drop-shadow-md">
                        Sabrina & Raka ♡
                      </span>
                    </div>
                  </div>

                  {/* ================= CARD 3 (RIGHT): REKAM SUARA ================= */}
                  <div 
                    className="absolute -right-1 xs:right-1 sm:right-4 top-2 xs:top-3 sm:top-2 w-32 xs:w-36 sm:w-44 aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#1F0A15] to-[#2D0D1F] border-2 border-white/30 shadow-2xl transform rotate-12 translate-x-2 xs:translate-x-3 sm:translate-x-4 transition-all duration-300 hover:rotate-0 hover:scale-110 hover:z-30 z-10 cursor-pointer flex flex-col justify-between p-2 sm:p-2.5 text-center group"
                    onClick={() => setDemoRecording(!demoRecording)}
                    title="Langkah 3: Rekam Doa Suara"
                  >
                    {/* Step 3 Header Badge */}
                    <div className="flex justify-center">
                      <span className="px-1.5 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[7px] sm:text-[8px] font-mono font-bold text-amber-200 border border-white/20 shadow-sm truncate">
                        🎙️ 3. Rekam Suara
                      </span>
                    </div>

                    {/* Center Mic & Waveform */}
                    <div className="flex flex-col items-center justify-center gap-1 my-auto">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
                        demoRecording ? 'bg-red-600 ring-2 ring-red-400 animate-pulse' : 'bg-[#6B111F] ring-1 ring-amber-300/40 group-hover:scale-110'
                      }`}>
                        <Volume2 size={15} className="text-white" />
                      </div>
                      
                      {/* Animated Mini Waveform */}
                      <div className={`flex items-center gap-0.5 h-3 ${demoRecording ? 'waveform-active' : ''}`}>
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <span key={idx} className="wave-bar w-0.5 h-2.5 bg-[#F5D77F] rounded-full" />
                        ))}
                      </div>
                    </div>

                    {/* Bottom Status Text */}
                    <div className="border-t border-white/10 pt-0.5">
                      <span className="text-[6.5px] sm:text-[7.5px] font-serif italic text-amber-100/90 block leading-tight truncate">
                        {demoRecording ? '● Merekam Doa...' : 'Doa untuk Mempelai'}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Voice Note Recording Box */}
                <div className="w-full max-w-xs bg-black/40 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-white/10 flex items-center justify-between gap-2 mt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDemoRecording(!demoRecording)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs text-white transition cursor-pointer ${
                        demoRecording ? 'bg-red-600 animate-pulse' : 'bg-[#6B111F]'
                      }`}
                      title={demoRecording ? 'Jeda Suara' : 'Mulai Rekam Doa'}
                    >
                      <Volume2 size={13} />
                    </button>
                    <div className="text-left">
                      <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight">
                        {demoRecording ? 'Merekam Doa untuk Mempelai...' : 'Rekam Pesan Doa Ucapan'}
                      </p>
                      <p className="text-[8px] sm:text-[9px] text-[#F5D77F]">
                        {demoRecording ? '00:24 / 01:00 • Doa Restu Aktif' : 'Untuk Sabrina & Raka (Maks. 60s)'}
                      </p>
                    </div>
                  </div>

                  {/* Waveform Visualizer */}
                  <div className={`flex items-center gap-1 ${demoRecording ? 'waveform-active' : ''}`}>
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <span key={idx} className="wave-bar w-0.5 h-3 bg-amber-400 rounded-full" />
                    ))}
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-[#B3A1A8] mt-2.5 sm:mt-3">
                  ✓ Ambil beberapa pose foto terbaik dan rekam doa restu yang tersimpan abadi di buku tamu.
                </p>
              </motion.div>
            )}

            {/* STAGE 3: UNDUH & BAGIKAN KENANGAN KAMU */}
            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[#E5C158] uppercase font-bold mb-1">
                  LANGKAH 3
                </span>
                <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-1.5 sm:mb-2">
                  Unduh & Bagikan Kenangan Kamu
                </h3>
                <p className="text-[11px] sm:text-xs text-[#D8C6A5] font-serif italic mb-3">
                  Simpan photo strip berbingkai kualitas HD (2X Retina) & bagikan momen bahagiamu.
                </p>

                {/* Ready Photostrip Card */}
                <div className="w-40 sm:w-48 bg-[#6B111F] rounded-xl sm:rounded-2xl p-2 sm:p-2.5 shadow-2xl border border-amber-300/30 mb-3 sm:mb-4">
                  <p className="text-[6.5px] sm:text-[7px] font-serif font-bold uppercase tracking-widest text-[#F5D77F] pb-1 border-b border-white/10">
                    THE WEDDING OF SABRINA & RAKA
                  </p>
                  <div className="my-1 sm:my-1.5 aspect-[4/3] rounded-lg overflow-hidden bg-black/40">
                    <img
                      src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80"
                      alt="Final Result"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[6px] sm:text-[6.5px] font-serif italic text-white/80">With Love & Blessings,</p>
                  <h4 
                    style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
                    className="text-[11px] sm:text-xs font-serif font-bold italic text-[#F5D77F] my-0.5"
                  >
                    Sarah & Dimas
                  </h4>
                  <p className="text-[5.5px] sm:text-[6px] font-mono text-white/70">10 Mei 2026 • Grand Ballroom</p>
                </div>

                {/* Action Buttons: Unduh HD & Bagikan Kenangan */}
                <div className="flex gap-2 w-full max-w-xs justify-center">
                  <button
                    onClick={() => {
                      setDemoDownloaded(true);
                      toast('📥 Photo strip siap diunduh dalam kualitas HD 2X Retina!', 'success');
                      setTimeout(() => setDemoDownloaded(false), 2500);
                    }}
                    className={`flex-1 py-2 sm:py-2.5 px-3 rounded-full text-[10.5px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg ${
                      demoDownloaded 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] text-[#F5D77F] border border-amber-300/40 hover:brightness-110'
                    }`}
                  >
                    {demoDownloaded ? <Check size={12} /> : <Download size={12} />}
                    <span>{demoDownloaded ? 'Tersimpan HD' : 'Unduh HD'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Kenangan Photobooth Sabrina & Raka',
                          text: 'Lihat photo strip pernikahan Sabrina & Raka! 💍✨',
                          url: window.location.href
                        }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                        toast('🔗 Tautan kenangan berhasil disalin!', 'success');
                      }
                    }}
                    className="flex-1 py-2 sm:py-2.5 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10.5px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-lg"
                  >
                    <Share2 size={12} />
                    <span>Bagikan</span>
                  </button>
                </div>

                <p className="text-[10px] sm:text-[11px] text-[#B3A1A8] mt-2.5">
                  ✓ Photo strip otomatis tersimpan di Buku Tamu Digital dan dapat diunduh kapan saja.
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ================= 🌟 4. MAIN CTA BUTTON 🌟 ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ ...romanticTransition, delay: 0.3 }}
          className="mb-10 sm:mb-14 text-center"
        >
          <button
            onClick={openBooth}
            className="w-full py-3.5 sm:py-4 px-5 sm:px-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] border border-[#C4A46C]/40 text-[#F5D77F] font-serif font-bold text-xs sm:text-sm tracking-wider shadow-2xl flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
          >
            <span>Mulai Photobooth Sekarang</span>
          </button>
        </motion.div>

      </div>

      {/* ================= 🌟 5. DARK LUXURY FOOTER 🌟 ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ ...romanticTransition, delay: 0.4 }}
        className="w-full bg-[#0F050A] text-center pt-8 pb-10 border-t border-white/5 relative z-10"
      >
        <div className="max-w-md mx-auto px-5">
          <h4 
            className="text-3xl sm:text-4xl font-normal text-[#E5C158] leading-tight font-script"
            style={{ 
              fontFamily: "'Alex Brush', 'Great Vibes', cursive",
              textShadow: '0 2px 15px rgba(229,193,88,0.2)'
            }}
          >
            Sabrina & Raka
          </h4>
          <p className="text-[9px] sm:text-[10px] font-sans tracking-[0.28em] text-[#8C7A82] uppercase mt-2 font-medium">
            10 MEI 2026 · GRAND BALLROOM JAKARTA
          </p>
        </div>
      </motion.div>

    </section>
  );
}