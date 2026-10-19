import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, MessageCircle } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function PriceListModal({ isOpen, onClose }) {
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[260] flex items-center justify-center p-2 sm:p-4 selection:bg-rose-900 selection:text-amber-200">
        
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
          className="relative w-full max-w-5xl bg-[#FBF9F5] border border-stone-200/90 rounded-3xl p-3.5 sm:p-6 md:p-8 text-stone-900 shadow-2xl max-h-[94vh] flex flex-col overflow-y-auto my-auto z-10"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 hover:text-stone-900 flex items-center justify-center transition active:scale-90 cursor-pointer z-20"
            title="Tutup"
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>

          {/* Modal Header (No separate tabs, no 'sirklenice photobooth' above title) */}
          <div className="text-center pb-2.5 sm:pb-4 flex-shrink-0">
            <h2 className="text-xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-tight">
              Paket Photobooth Virtual
            </h2>

            <p className="text-xs sm:text-sm text-stone-500 mt-0.5 sm:mt-1 max-w-sm mx-auto font-sans">
              Perbandingan lengkap fasilitas & harga untuk seluruh tamu.
            </p>
          </div>

          {/* ================= 🌟 1. TABEL PEMBANDING (100% LEBAR LAYAR, TANPA GESER) 🌟 ================= */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-sm mb-6 sm:mb-8">
            <table className="w-full table-fixed text-left border-collapse text-[11px] sm:text-xs md:text-sm">
              <colgroup>
                <col className="w-[31%] sm:w-[28%]" />
                <col className="w-[23%] sm:w-[24%]" />
                <col className="w-[23%] sm:w-[24%]" />
                <col className="w-[23%] sm:w-[24%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/90">
                  <th className="px-2 py-2.5 sm:px-4 sm:py-3.5 text-stone-500 font-medium text-[10px] sm:text-xs">
                    Fitur Paket
                  </th>
                  {packageList.map((pkg) => {
                    const isPopular = pkg.id === 'standard';
                    return (
                      <th
                        key={pkg.id}
                        className={`px-1.5 py-2 sm:px-4 sm:py-3.5 text-center ${
                          isPopular
                            ? 'bg-amber-50/80 text-[#6B111F] font-bold border-x border-[#C4A46C]/40'
                            : 'text-stone-900 font-bold'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center">
                          {isPopular && (
                            <span className="text-[7.5px] sm:text-[9px] font-mono font-bold uppercase tracking-wider bg-[#6B111F] text-[#F5D77F] px-1.5 py-0.2 rounded-full mb-0.5">
                              POPULAR
                            </span>
                          )}
                          <span className="text-xs sm:text-base font-serif leading-tight">{pkg.name}</span>
                          <span className="text-[11px] sm:text-sm font-sans font-extrabold text-[#6B111F] mt-0.5">
                            {pkg.displayPrice}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                <tr>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 font-medium text-stone-900">Custom Frame</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-semibold text-stone-700">1 Custom</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-bold bg-amber-50/40 text-[#6B111F] border-x border-[#C4A46C]/20">2 Custom</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-bold text-stone-900">3 Custom</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 font-medium text-stone-900">Kartu QR Fisik</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-semibold text-stone-700">100 pcs</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-semibold bg-amber-50/40 text-[#6B111F] border-x border-[#C4A46C]/20">100 pcs</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-bold text-emerald-700 bg-emerald-50/30">200 pcs (2x)</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 font-medium text-stone-900">Masa Akses Foto</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-semibold text-stone-700">7 Hari</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-bold bg-amber-50/40 text-[#6B111F] border-x border-[#C4A46C]/20">10 Hari</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center font-bold text-emerald-700 bg-emerald-50/30">14 Hari</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 font-medium text-stone-900">Photo & Voice Note</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center text-emerald-600 font-bold bg-amber-50/40 border-x border-[#C4A46C]/20">✓ Ya</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                </tr>
                <tr>
                  <td className="px-2 py-2 sm:px-4 sm:py-3 font-medium text-stone-900">Kapasitas Foto</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center text-emerald-600 font-bold">Unlimited</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center text-emerald-600 font-bold bg-amber-50/40 border-x border-[#C4A46C]/20">Unlimited</td>
                  <td className="px-1.5 py-2 sm:px-4 sm:py-3 text-center text-emerald-600 font-bold">Unlimited</td>
                </tr>
                {/* Direct Booking Action Row */}
                <tr className="bg-stone-50/70">
                  <td className="px-2 py-2 sm:px-4 sm:py-3 font-semibold text-stone-900 text-[10px] sm:text-xs">
                    Pesan Paket
                  </td>
                  {packageList.map((pkg) => {
                    const isPopular = pkg.id === 'standard';
                    return (
                      <td
                        key={pkg.id}
                        className={`px-1 py-1.5 sm:px-3 sm:py-2.5 text-center ${
                          isPopular ? 'bg-amber-50/70 border-x border-[#C4A46C]/40' : ''
                        }`}
                      >
                        <a
                          href={CONTACT_LINKS.lynkId}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full inline-flex items-center justify-center py-2 px-1 rounded-xl text-[10.5px] sm:text-xs font-bold transition active:scale-95 shadow-xs ${
                            isPopular
                              ? 'bg-[#6B111F] text-[#F5D77F] hover:bg-[#520C16]'
                              : 'bg-stone-900 text-white hover:bg-stone-800'
                          }`}
                        >
                          <span>Pesan</span>
                        </a>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* ================= 🌟 2. KARTU DETAIL (WAVE DESIGN - REFERENSI GAMBAR 3) 🌟 ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch mb-2">
            {packageList.map((pkg) => {
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
                  className={`w-full rounded-3xl bg-white flex flex-col justify-between overflow-hidden transition-all duration-200 relative ${
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
