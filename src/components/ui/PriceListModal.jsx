import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShoppingBag, MessageCircle, ArrowRight, Star, Crown, LayoutGrid, Table } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function PriceListModal({ isOpen, onClose }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [activeMobileIdx, setActiveMobileIdx] = useState(1); // Default to Standar (index 1)
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

  // Scroll to active card when activeMobileIdx changes via chip click
  const scrollToCard = (idx) => {
    setActiveMobileIdx(idx);
    const target = cardRefs.current[idx];
    if (target && carouselRef.current) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Track scroll position on mobile to update active chip
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = carouselRef.current.offsetWidth * 0.82;
    const newIdx = Math.round(scrollLeft / cardWidth);
    if (newIdx >= 0 && newIdx < packageList.length && newIdx !== activeMobileIdx) {
      setActiveMobileIdx(newIdx);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-4 selection:bg-rose-900 selection:text-amber-200">
        
        {/* Backdrop with Soft Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
        />

        {/* Floating Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-5xl bg-[#FBF9F5] border border-stone-200/90 rounded-3xl p-5 sm:p-8 text-stone-900 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto z-10"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 hover:text-stone-900 flex items-center justify-center transition active:scale-90 cursor-pointer z-20"
            title="Tutup"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>

          {/* Modal Header (Clean, Transparent Pricing like Lampiran 2 & 3) */}
          <div className="text-center pb-4 sm:pb-6 relative z-10 flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#6B111F]/10 border border-[#6B111F]/20 text-[#6B111F] text-[10.5px] font-mono font-bold tracking-widest uppercase mb-2">
              <ShoppingBag size={11} className="text-[#6B111F]" />
              <span>Sirklenice Photobooth</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              Pilihan Paket Photobooth Virtual
            </h2>

            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-lg mx-auto font-sans leading-relaxed">
              Harga transparan tanpa biaya tersembunyi. Bebas foto & rekam pesan suara sepuasnya tanpa install aplikasi.
            </p>

            {/* Mobile View Toggle Switcher (Cards vs Table) */}
            <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
              <div className="inline-flex p-0.5 bg-stone-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Kartu Paket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Table size={13} />
                  <span>Tabel Perbandingan</span>
                </button>
              </div>
            </div>

            {/* Mobile Quick-Jump Chips (Visible in cards view on mobile) */}
            {viewMode === 'cards' && (
              <div className="flex md:hidden items-center justify-center gap-1.5 mt-2.5">
                {packageList.map((pkg, idx) => {
                  const isActive = activeMobileIdx === idx;
                  const isPopular = pkg.id === 'standard';
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => scrollToCard(idx)}
                      className={`text-[11px] font-sans px-2.5 py-0.5 rounded-full transition flex items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-[#6B111F] text-amber-200 font-bold shadow-xs'
                          : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {isPopular && <Star size={10} className={isActive ? 'text-amber-300 fill-amber-300' : 'text-amber-500'} />}
                      <span>{pkg.name} ({pkg.displayPrice})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Main Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 py-1 relative z-10">
            
            {/* VIEW 1: 3-CARD SIDE-BY-SIDE LAYOUT (Desktop Grid / Mobile Horizontal Snap) */}
            {viewMode === 'cards' ? (
              <div
                ref={carouselRef}
                onScroll={handleScroll}
                className="flex md:grid md:grid-cols-3 gap-4 lg:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory items-stretch py-2 px-1 scroll-smooth"
              >
                {packageList.map((pkg, idx) => {
                  const isPopular = pkg.id === 'standard';
                  const isSpecial = pkg.id === 'all_in';

                  const shortDesc = isPopular
                    ? 'Pilihan favorit untuk resepsi pernikahan standar & wisuda.'
                    : isSpecial
                    ? 'Paling lengkap untuk grand ballroom, festival, & event multi-hari.'
                    : 'Cocok untuk acara intimate atau gathering keluarga kecil.';

                  return (
                    <div
                      key={pkg.id}
                      ref={(el) => (cardRefs.current[idx] = el)}
                      className={`w-[84vw] max-w-[320px] md:w-auto flex-shrink-0 snap-center rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 relative ${
                        isPopular
                          ? 'bg-gradient-to-b from-[#6B111F] via-[#540D18] to-[#3B0710] text-white shadow-xl shadow-rose-950/30 ring-2 ring-[#C4A46C] md:-translate-y-2'
                          : 'bg-white border border-stone-200/90 text-stone-900 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {/* Popular / Special Badges */}
                      {isPopular && (
                        <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                          <span className="bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] text-[#240C17] text-[9.5px] font-mono font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
                            {pkg.badge}
                          </span>
                        </div>
                      )}

                      {isSpecial && (
                        <div className="absolute -top-3 inset-x-0 flex justify-center">
                          <span className="bg-rose-50 border border-rose-200 text-[#6B111F] text-[9.5px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                            {pkg.badge}
                          </span>
                        </div>
                      )}

                      <div>
                        {/* Header Section */}
                        <div className={`pb-4 border-b ${isPopular ? 'border-white/10' : 'border-stone-100'}`}>
                          <div className="flex items-center gap-1.5">
                            {isSpecial && <Crown size={15} className="text-[#6B111F]" />}
                            {isPopular && <Star size={15} className="text-amber-300 fill-amber-300" />}
                            <h3 className={`text-xl font-serif font-bold ${isPopular ? 'text-amber-200' : 'text-stone-900'}`}>
                              {pkg.name}
                            </h3>
                          </div>

                          <p className={`text-xs mt-1 min-h-[32px] leading-relaxed ${isPopular ? 'text-stone-200' : 'text-stone-500'}`}>
                            {shortDesc}
                          </p>

                          <div className="mt-3 flex items-baseline gap-1">
                            <span className={`text-3xl font-serif font-bold tracking-tight ${isPopular ? 'text-white' : 'text-stone-900'}`}>
                              {pkg.formattedPrice}
                            </span>
                            <span className={`text-xs font-sans ${isPopular ? 'text-amber-200/80' : 'text-stone-500'}`}>
                              / acara
                            </span>
                          </div>

                          <span className={`inline-block text-[10.5px] font-mono px-2.5 py-0.5 rounded-full mt-2 font-medium ${
                            isPopular ? 'bg-white/10 text-amber-200' : 'bg-stone-100 text-stone-600'
                          }`}>
                            {pkg.displayPrice} • Akses {pkg.activeDays} Hari
                          </span>
                        </div>

                        {/* Features List */}
                        <ul className="py-4 space-y-2.5">
                          {pkg.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isPopular ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                <Check size={11} className="stroke-[3]" />
                              </div>
                              <span className={`leading-snug ${isPopular ? 'text-stone-100' : 'text-stone-700'}`}>
                                {feat}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Card Action Buttons: Single focused primary CTA + WhatsApp consultation */}
                      <div className={`pt-3 border-t flex flex-col gap-1.5 ${isPopular ? 'border-white/10' : 'border-stone-100'}`}>
                        <a
                          href={CONTACT_LINKS.lynkId}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-3 px-4 rounded-xl font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-98 transition shadow-sm ${
                            isPopular
                              ? 'bg-gradient-to-r from-[#F5D77F] via-[#E5C158] to-[#C4A46C] text-[#240C17] hover:brightness-105 shadow-amber-950/20'
                              : isSpecial
                              ? 'bg-[#6B111F] hover:bg-[#520C16] text-[#F5D77F]'
                              : 'bg-stone-900 hover:bg-stone-800 text-white'
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
                          className={`w-full py-1.5 text-center text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition ${
                            isPopular ? 'text-amber-200/90 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <MessageCircle size={13} className="text-[#25D366]" />
                          <span>Tanya via WhatsApp</span>
                        </a>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              /* VIEW 2: SIDE-BY-SIDE COMPARISON TABLE */
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50/80">
                        <th className="p-3 sm:p-4 text-stone-500 font-medium">Fitur Paket</th>
                        {packageList.map((pkg) => {
                          const isPopular = pkg.id === 'standard';
                          return (
                            <th
                              key={pkg.id}
                              className={`p-3 sm:p-4 text-center ${
                                isPopular ? 'bg-amber-50/80 text-[#6B111F] font-bold ring-1 ring-amber-300' : 'text-stone-900 font-bold'
                              }`}
                            >
                              <div className="text-sm sm:text-base font-serif">{pkg.name}</div>
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
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Virtual Photobooth (Photo & Voice)</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold">✓ Ya</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold bg-amber-50/30">✓ Ya</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold">✓ Ya</td>
                      </tr>
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Template Polaroid & Custom</td>
                        <td className="p-3 sm:p-4 text-center font-semibold">1 Custom</td>
                        <td className="p-3 sm:p-4 text-center font-semibold bg-amber-50/30 text-[#6B111F]">2 Custom</td>
                        <td className="p-3 sm:p-4 text-center font-semibold">3 Custom</td>
                      </tr>
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Cetak Kartu QR Fisik</td>
                        <td className="p-3 sm:p-4 text-center">100 pcs</td>
                        <td className="p-3 sm:p-4 text-center bg-amber-50/30 font-semibold text-[#6B111F]">100 pcs</td>
                        <td className="p-3 sm:p-4 text-center font-bold text-emerald-700">200 pcs (2x)</td>
                      </tr>
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Kapasitas Foto</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold">Unlimited</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold bg-amber-50/30">Unlimited</td>
                        <td className="p-3 sm:p-4 text-center text-emerald-600 font-bold">Unlimited</td>
                      </tr>
                      <tr>
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Masa Aktif Akses Galeri</td>
                        <td className="p-3 sm:p-4 text-center">7 Hari</td>
                        <td className="p-3 sm:p-4 text-center bg-amber-50/30 font-bold text-[#6B111F]">10 Hari</td>
                        <td className="p-3 sm:p-4 text-center font-bold text-emerald-700">14 Hari</td>
                      </tr>
                      <tr className="bg-stone-50/50">
                        <td className="p-3 sm:p-4 font-medium text-stone-900">Tindakan Pemesanan</td>
                        {packageList.map((pkg) => {
                          const isPopular = pkg.id === 'standard';
                          return (
                            <td key={pkg.id} className={`p-3 sm:p-4 text-center ${isPopular ? 'bg-amber-50/50' : ''}`}>
                              <a
                                href={CONTACT_LINKS.lynkId}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                                  isPopular
                                    ? 'bg-[#6B111F] text-[#F5D77F] hover:bg-[#520C16] shadow-xs'
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
            )}

          </div>

          {/* Clean Modal Footer (No Duplicate CTA Buttons!) */}
          <div className="pt-3 sm:pt-4 border-t border-stone-200 mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500 font-sans flex-shrink-0">
            <div className="flex items-center gap-1.5 text-center sm:text-left">
              <span>💡 Butuh kustomisasi khusus atau konsultasi vendor?</span>
              <a
                href={CONTACT_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B111F] font-semibold hover:underline inline-flex items-center gap-1"
              >
                <MessageCircle size={13} className="text-[#25D366]" />
                <span>Chat WhatsApp Kami</span>
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 py-1 px-3 transition cursor-pointer"
            >
              Tutup & Lanjut Mencoba Photobooth
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
