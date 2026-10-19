import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function PriceListModal({ isOpen, onClose }) {
  const [activeIdx, setActiveIdx] = useState(1); // Default to Standar (index 1)
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);

  const packageList = Object.values(PACKAGES);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Center the "Standar" (Most Popular) card on mobile open
  useEffect(() => {
    if (isOpen && carouselRef.current && cardRefs.current[1]) {
      setTimeout(() => {
        cardRefs.current[1]?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }, 50);
    }
  }, [isOpen]);

  const scrollToCard = (idx) => {
    setActiveIdx(idx);
    cardRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const handleScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.offsetWidth * 0.82;
    const newIdx = Math.round(scrollLeft / cardWidth);
    if (newIdx >= 0 && newIdx < packageList.length && newIdx !== activeIdx) {
      setActiveIdx(newIdx);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[260] flex items-center justify-center p-2.5 sm:p-4 selection:bg-rose-900 selection:text-amber-200">
        
        {/* Backdrop with Soft Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        />

        {/* Floating Modal Window - Full Responsive & Scrollable */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-[#F8F9FA] border border-slate-200/90 rounded-3xl p-4 sm:p-6 md:p-8 text-slate-900 shadow-2xl max-h-[94vh] flex flex-col overflow-y-auto my-auto z-10"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 hover:text-slate-900 flex items-center justify-center transition active:scale-90 cursor-pointer z-20"
            title="Tutup"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>

          {/* Compact Header (No Vertical Clutter) */}
          <div className="text-center pb-3 sm:pb-5 flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#6B111F]/10 border border-[#6B111F]/20 text-[#6B111F] text-[10px] sm:text-[11px] font-mono font-bold tracking-widest uppercase mb-1.5">
              <ShoppingBag size={11} className="text-[#6B111F]" />
              <span>Sirklenice Photobooth</span>
            </div>

            <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
              Pilihan Paket Photobooth Virtual
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto font-sans leading-relaxed">
              Harga transparan resmi untuk pernikahan & event spesial. Bebas foto & pesan suara sepuasnya.
            </p>

            {/* Mobile Navigation Chips (Indicator to compare all 3) */}
            <div className="flex md:hidden items-center justify-center gap-1.5 mt-2.5">
              {packageList.map((pkg, idx) => {
                const isActive = activeIdx === idx;
                const isPopular = pkg.id === 'standard';
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => scrollToCard(idx)}
                    className={`text-[11px] font-sans px-3 py-0.5 rounded-full transition flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? isPopular
                          ? 'bg-[#6B111F] text-[#F5D77F] font-bold shadow-xs'
                          : 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{pkg.name}</span>
                    <span className="opacity-80">({pkg.displayPrice})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Container: 3 Side-by-Side (Desktop Grid / Mobile Horizontal Snap Carousel) */}
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory items-stretch py-2 px-1 scroll-smooth"
          >
            {packageList.map((pkg, idx) => {
              const isPopular = pkg.id === 'standard';
              const isSpecial = pkg.id === 'all_in';

              // Header gradient based on package type (Inspired by Reference Image 3)
              const headerGradient = isPopular
                ? 'bg-gradient-to-br from-[#6B111F] via-[#851627] to-[#540D18]'
                : isSpecial
                ? 'bg-gradient-to-br from-[#2D1420] via-[#3D182B] to-[#1F0C16]'
                : 'bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#1E293B]';

              return (
                <div
                  key={pkg.id}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  className={`w-[85vw] max-w-[320px] md:w-auto flex-shrink-0 snap-center rounded-3xl bg-white flex flex-col justify-between overflow-hidden transition-all duration-200 relative ${
                    isPopular
                      ? 'border-2 border-[#C4A46C] shadow-xl md:shadow-2xl md:-translate-y-2 ring-1 ring-[#C4A46C]/50'
                      : 'border border-slate-200/90 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div>
                    {/* Top Wave Header (Dual-Tone Design matching Reference Image 3) */}
                    <div className={`relative pt-5 pb-9 sm:pb-10 px-5 text-white overflow-hidden ${headerGradient}`}>
                      
                      {/* Header Badge: MOST POPULAR (no star icon) or PAKET TERLENGKAP */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-90">
                          {pkg.name}
                        </span>

                        {isPopular && (
                          <span className="bg-white/20 backdrop-blur-xs border border-white/30 text-white text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                            MOST POPULAR
                          </span>
                        )}

                        {isSpecial && (
                          <span className="bg-white/20 backdrop-blur-xs border border-white/30 text-amber-200 text-[9.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                            PAKET TERLENGKAP
                          </span>
                        )}
                      </div>

                      {/* Large Bold Price */}
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
                          {pkg.displayPrice}
                        </span>
                        <span className="text-xs opacity-80 font-sans">
                          / acara
                        </span>
                      </div>

                      <p className="text-[11px] opacity-80 font-mono mt-1">
                        Akses foto {pkg.activeDays} hari • {pkg.formattedPrice}
                      </p>

                      {/* Smooth SVG Wave Divider into White Card Body (Reference Image 3) */}
                      <div className="absolute -bottom-px inset-x-0 leading-none overflow-hidden pointer-events-none">
                        <svg
                          viewBox="0 0 500 50"
                          preserveAspectRatio="none"
                          className="w-full h-6 sm:h-7 fill-white block"
                        >
                          <path d="M0,15 C150,42 350,-5 500,22 L500,50 L0,50 Z" />
                        </svg>
                      </div>
                    </div>

                    {/* Features Checklist on Pure White Body */}
                    <div className="px-5 pt-2 pb-4">
                      <ul className="space-y-2.5">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isPopular ? 'text-[#6B111F] bg-rose-50' : 'text-emerald-600 bg-emerald-50'
                            }`}>
                              <Check size={12} className="stroke-[3]" />
                            </div>
                            <span className="leading-snug font-medium">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Single Clean Pill CTA Button + WhatsApp Consultation (Matching Reference Image 3) */}
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    <a
                      href={CONTACT_LINKS.lynkId}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 px-5 rounded-full font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition shadow-sm ${
                        isPopular
                          ? 'bg-gradient-to-r from-[#6B111F] via-[#851627] to-[#6B111F] text-[#F5D77F] border border-amber-300/40 hover:brightness-105 shadow-rose-950/20'
                          : isSpecial
                          ? 'bg-[#6B111F] hover:bg-[#520C18] text-[#F5D77F]'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <ShoppingBag size={14} />
                      <span>Pesan Paket {pkg.name}</span>
                      <ArrowRight size={13} />
                    </a>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Halo Sirklen Photo, saya ingin konsultasi mengenai Paket ${pkg.name} (${pkg.displayPrice}) untuk acara saya.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1 text-center text-xs font-sans font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition"
                    >
                      <MessageCircle size={13} className="text-[#25D366]" />
                      <span>Tanya via WhatsApp</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Clean Modal Footer (Compact & Non-Clipped) */}
          <div className="pt-3 pb-1 border-t border-slate-200 mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-sans flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <span>💡 Butuh kustomisasi tema khusus?</span>
              <a
                href={CONTACT_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B111F] font-bold hover:underline inline-flex items-center gap-1"
              >
                <MessageCircle size={13} className="text-[#25D366]" />
                <span>Chat WhatsApp Kami</span>
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 py-0.5 px-2 transition cursor-pointer font-medium"
            >
              Tutup & Lanjut Mencoba Photobooth
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
