import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, MessageCircle, Table, LayoutGrid } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function PriceListModal({ isOpen, onClose }) {
  // Default to 'table' so customer immediately sees the comparison (pembanding)!
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
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

  // When switching to cards mode, center the Standar card on mobile
  useEffect(() => {
    if (viewMode === 'cards' && carouselRef.current && cardRefs.current[1]) {
      setTimeout(() => {
        cardRefs.current[1]?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }, 50);
    }
  }, [viewMode]);

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
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-[#FBF9F5] border border-stone-200/90 rounded-3xl p-4 sm:p-6 md:p-8 text-stone-900 shadow-2xl max-h-[94vh] flex flex-col overflow-y-auto my-auto z-10"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 hover:text-stone-900 flex items-center justify-center transition active:scale-90 cursor-pointer z-20"
            title="Tutup"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>

          {/* Clean Modal Header (NO 'sirklenice photobooth' above title!) */}
          <div className="text-center pb-3 sm:pb-4 flex-shrink-0">
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              Paket Photobooth Virtual
            </h2>

            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-sm mx-auto font-sans">
              Bandingkan fasilitas & pilih paket sesuai kebutuhan acaramu.
            </p>

            {/* View Switcher: Tabel Pembanding (Default) vs Kartu Paket */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="inline-flex p-1 bg-stone-200/80 rounded-2xl shadow-inner">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-[#6B111F] text-[#F5D77F] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Table size={13} />
                  <span>Tabel Pembanding</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-[#6B111F] text-[#F5D77F] shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Kartu Paket</span>
                </button>
              </div>
            </div>

            {/* In Cards View on Mobile: Quick Jump Selector */}
            {viewMode === 'cards' && (
              <div className="flex md:hidden items-center justify-center gap-1.5 mt-2.5">
                {packageList.map((pkg, idx) => {
                  const isActive = activeIdx === idx;
                  const isPopular = pkg.id === 'standard';
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => scrollToCard(idx)}
                      className={`text-[11px] font-sans px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? isPopular
                            ? 'bg-[#6B111F] text-[#F5D77F] font-bold shadow-xs'
                            : 'bg-stone-900 text-white font-bold shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <span>{pkg.name}</span>
                      <span className="opacity-80">· {pkg.displayPrice}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 py-1">
            
            {/* OPTION 1: TABEL PEMBANDING (Default View - Easy Direct Comparison of all 3 Packages!) */}
            {viewMode === 'table' ? (
              <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/90">
                        <th className="p-3 sm:p-4 text-stone-500 font-medium">Fitur Paket</th>
                        {packageList.map((pkg) => {
                          const isPopular = pkg.id === 'standard';
                          return (
                            <th
                              key={pkg.id}
                              className={`p-3 sm:p-4 text-center ${
                                isPopular ? 'bg-amber-50/70 text-[#6B111F] font-bold ring-1 ring-amber-300/80' : 'text-stone-900 font-bold'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-sm sm:text-base font-serif">{pkg.name}</span>
                                {isPopular && (
                                  <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-[#6B111F] text-[#F5D77F] px-1.5 py-0.2 rounded-full">
                                    POPULAR
                                  </span>
                                )}
                              </div>
                              <div className="text-xs sm:text-sm font-sans font-extrabold text-[#6B111F] mt-0.5">
                                {pkg.displayPrice}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Custom Frame Polaroid</td>
                        <td className="p-3 sm:p-4 text-center font-semibold text-stone-700">1 Custom</td>
                        <td className="p-3 sm:p-4 text-center font-bold bg-amber-50/30 text-[#6B111F]">2 Custom</td>
                        <td className="p-3 sm:p-4 text-center font-bold text-stone-900">3 Custom</td>
                      </tr>
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Cetak Kartu QR Fisik</td>
                        <td className="p-3 sm:p-4 text-center font-semibold text-stone-700">100 pcs</td>
                        <td className="p-3 sm:p-4 text-center font-semibold bg-amber-50/30 text-[#6B111F]">100 pcs</td>
                        <td className="p-3 sm:p-4 text-center font-bold text-emerald-700 bg-emerald-50/30">200 pcs (2x)</td>
                      </tr>
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Masa Aktif Akses Galeri</td>
                        <td className="p-3 sm:p-4 text-center font-semibold text-stone-700">7 Hari</td>
                        <td className="p-3 sm:p-4 text-center font-bold bg-amber-50/30 text-[#6B111F]">10 Hari</td>
                        <td className="p-3 sm:p-4 text-center font-bold text-emerald-700 bg-emerald-50/30">14 Hari</td>
                      </tr>
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Virtual Photobooth (Photo & Voice)</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold">✓ Ya</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold bg-amber-50/30">✓ Ya</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold">✓ Ya</td>
                      </tr>
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Kapasitas Foto</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold">Unlimited</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold bg-amber-50/30">Unlimited</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold">Unlimited</td>
                      </tr>
                      {/* Direct CTA Action Row */}
                      <tr className="bg-stone-50/50">
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Pemesanan Langsung</td>
                        {packageList.map((pkg) => {
                          const isPopular = pkg.id === 'standard';
                          return (
                            <td key={pkg.id} className={`p-3 sm:p-4 text-center ${isPopular ? 'bg-amber-50/50' : ''}`}>
                              <a
                                href={CONTACT_LINKS.lynkId}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 shadow-xs ${
                                  isPopular
                                    ? 'bg-[#6B111F] text-[#F5D77F] hover:bg-[#520C16]'
                                    : 'bg-stone-900 text-white hover:bg-stone-800'
                                }`}
                              >
                                <span>Pesan ({pkg.displayPrice})</span>
                              </a>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* OPTION 2: KARTU DETAIL (Wave Header Design matching Reference Image 3) */
              <div
                ref={carouselRef}
                onScroll={handleScroll}
                className="flex md:grid md:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory items-stretch py-2 px-1 scroll-smooth"
              >
                {packageList.map((pkg, idx) => {
                  const isPopular = pkg.id === 'standard';
                  const isSpecial = pkg.id === 'all_in';

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
                          : 'border border-stone-200/90 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <div>
                        {/* Top Wave Header */}
                        <div className={`relative pt-5 pb-9 sm:pb-10 px-5 text-white overflow-hidden ${headerGradient}`}>
                          
                          {/* Header Badge */}
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
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
                              {pkg.displayPrice}
                            </span>
                            <span className="text-xs opacity-80 font-sans">
                              / acara
                            </span>
                          </div>

                          {/* Smooth SVG Wave Divider */}
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
                        <div className="px-5 pt-3 pb-4">
                          <ul className="space-y-2.5">
                            {pkg.features.map((feat, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-700">
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

                      {/* Clean Pill CTA Button + WhatsApp Consultation */}
                      <div className="px-5 pb-5 pt-2 border-t border-stone-100 flex flex-col gap-1.5">
                        <a
                          href={CONTACT_LINKS.lynkId}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-3 px-5 rounded-full font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition shadow-sm ${
                            isPopular
                              ? 'bg-gradient-to-r from-[#6B111F] via-[#851627] to-[#6B111F] text-[#F5D77F] border border-amber-300/40 hover:brightness-105 shadow-rose-950/20'
                              : isSpecial
                              ? 'bg-[#6B111F] hover:bg-[#520C18] text-[#F5D77F]'
                              : 'bg-stone-900 hover:bg-stone-800 text-white'
                          }`}
                        >
                          <span>Pesan Sekarang</span>
                          <ArrowRight size={13} />
                        </a>

                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Halo Sirklen Photo, saya ingin konsultasi mengenai Paket ${pkg.name} (${pkg.displayPrice}) untuk acara saya.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1 text-center text-xs font-sans font-medium text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1.5 transition"
                        >
                          <MessageCircle size={13} className="text-[#25D366]" />
                          <span>Tanya via WhatsApp</span>
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* Simple, On-Point Footer */}
          <div className="pt-3 pb-1 border-t border-stone-200 mt-2 flex items-center justify-between text-xs text-stone-500 font-sans flex-shrink-0">
            <a
              href={CONTACT_LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B111F] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <MessageCircle size={13} className="text-[#25D366]" />
              <span>Konsultasi WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 py-0.5 px-2 transition cursor-pointer font-medium"
            >
              Tutup
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
