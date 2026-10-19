import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ShoppingBag, MessageCircle, ArrowRight, Star, Crown, Sparkles } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function PriceListModal({ isOpen, onClose, initialPackageId = 'standard' }) {
  const [selectedTab, setSelectedTab] = useState(initialPackageId);
  const packageList = Object.values(PACKAGES);

  // Sync selected tab if initialPackageId changes
  useEffect(() => {
    if (initialPackageId) {
      setSelectedTab(initialPackageId);
    }
  }, [initialPackageId]);

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
      <div className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-4 selection:bg-rose-900 selection:text-amber-200">
        
        {/* Backdrop with Soft Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Floating Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl bg-gradient-to-b from-[#1E0B17] via-[#260E1E] to-[#150610] border border-[#C4A46C]/60 rounded-3xl p-5 sm:p-7 text-white shadow-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto z-10"
        >
          
          {/* Subtle Ambient Shimmer */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer z-20"
            title="Tutup"
          >
            <X size={16} />
          </button>

          {/* Modal Header */}
          <div className="text-center pb-4 border-b border-white/10 relative z-10 flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-amber-400/40 text-amber-200 text-[10.5px] font-mono font-bold tracking-widest uppercase mb-2">
              <ShoppingBag size={12} className="text-amber-300" />
              <span>Sirklenice Photobooth</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 tracking-tight leading-tight">
              Paket Photobooth Virtual
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl mx-auto leading-relaxed font-sans">
              Pilihan paket resmi untuk pernikahan & event spesial. Tamu bebas berfoto & merekam doa restu tanpa install aplikasi.
            </p>
          </div>

          {/* Mobile Interactive Tab Switcher (Visible on small screens) */}
          <div className="block sm:hidden pt-3 pb-1 relative z-10 flex-shrink-0">
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10">
              {packageList.map((pkg) => {
                const isActive = selectedTab === pkg.id;
                const isPopular = pkg.id === 'standard';
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedTab(pkg.id)}
                    className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer relative ${
                      isActive
                        ? 'bg-gradient-to-r from-[#C4A46C] to-[#E5C178] text-[#1C0A15] font-bold shadow-md'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {isPopular && !isActive && (
                      <span className="absolute -top-1.5 inset-x-0 flex justify-center pointer-events-none">
                        <span className="text-[7.5px] font-mono font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-400 text-black">
                          Populer
                        </span>
                      </span>
                    )}
                    <span className="block text-[11px] font-serif leading-none">
                      {pkg.name}
                    </span>
                    <span className="block text-[10px] font-mono mt-1 opacity-90">
                      {pkg.displayPrice}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto py-3 sm:py-4 pr-1 relative z-10 no-scrollbar">
            
            {/* Desktop View: 3 Column Side-by-Side Comparison */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-4 items-stretch h-full">
              {packageList.map((pkg) => {
                const isPopular = pkg.id === 'standard';
                const isSpecial = pkg.id === 'all_in';

                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                      isPopular
                        ? 'bg-gradient-to-b from-[#2E1224] to-[#1C0A15] border-2 border-[#C4A46C] shadow-xl shadow-rose-950/40 ring-1 ring-[#C4A46C]/60 transform -translate-y-1'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Top Badge */}
                    {isPopular && (
                      <div className="absolute -top-3 inset-x-0 flex justify-center">
                        <span className="bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] text-[#1C0A15] text-[9.5px] font-mono font-black px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md">
                          {pkg.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Card Header */}
                      <div className="border-b border-white/10 pb-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isSpecial && <Crown size={14} className="text-amber-300" />}
                          {isPopular && <Star size={14} className="text-amber-300 fill-amber-300" />}
                          <h3 className={`text-lg font-serif font-bold ${isPopular ? 'text-amber-200' : 'text-white'}`}>
                            {pkg.name}
                          </h3>
                        </div>

                        <div className="mt-2 flex items-baseline justify-center gap-1">
                          <span className="text-2xl font-serif font-bold text-white tracking-tight">
                            {pkg.formattedPrice}
                          </span>
                          <span className="text-[11px] text-stone-400 font-sans">
                            / acara
                          </span>
                        </div>

                        <span className={`inline-block text-[10.5px] font-mono px-2.5 py-0.5 rounded-full mt-2 ${
                          isPopular ? 'bg-amber-400/20 text-amber-200' : 'bg-white/10 text-stone-300'
                        }`}>
                          {pkg.displayPrice} • Akses {pkg.activeDays} Hari
                        </span>
                      </div>

                      {/* Feature Bullet Points */}
                      <ul className="py-4 space-y-2.5 text-left">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs text-stone-200 font-sans">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isPopular ? 'bg-amber-400/25 text-amber-300' : 'bg-white/10 text-amber-200'
                            }`}>
                              <Check size={10} className="stroke-[3]" />
                            </div>
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-white/10 flex flex-col gap-1.5">
                      <a
                        href={CONTACT_LINKS.lynkId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                          isPopular
                            ? 'bg-gradient-to-r from-[#C4A46C] to-[#E5C178] text-[#1C0A15] hover:brightness-110 shadow-sm'
                            : 'bg-white/15 hover:bg-white/20 text-white'
                        }`}
                      >
                        <ShoppingBag size={13} />
                        <span>Pesan Paket</span>
                        <ArrowRight size={12} />
                      </a>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Halo Sirklen Photo, saya ingin konsultasi & memesan Paket ${pkg.name} (${pkg.displayPrice}) untuk acara saya.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 text-center text-[11px] text-stone-300 hover:text-white flex items-center justify-center gap-1 transition"
                      >
                        <MessageCircle size={12} className="text-[#25D366]" />
                        <span>Tanya via WhatsApp</span>
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Mobile View: Active Selected Package Card */}
            <div className="block sm:hidden">
              {(() => {
                const activePkg = packageList.find(p => p.id === selectedTab) || packageList[1];
                const isPopular = activePkg.id === 'standard';

                return (
                  <div className={`rounded-2xl p-4 sm:p-5 text-left relative transition-all ${
                    isPopular 
                      ? 'bg-gradient-to-b from-[#2E1224] to-[#1C0A15] border-2 border-[#C4A46C] shadow-lg shadow-rose-950/40' 
                      : 'bg-white/5 border border-white/10'
                  }`}>
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-serif font-bold text-amber-200">
                            {activePkg.name}, {activePkg.displayPrice}
                          </h4>
                          {activePkg.badge && (
                            <span className="text-[8.5px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                              {activePkg.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-stone-400 mt-0.5">
                          Akses foto {activePkg.activeDays} hari
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-serif font-bold text-white tracking-tight">
                          {activePkg.formattedPrice}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-sans">
                          / acara
                        </span>
                      </div>
                    </div>

                    {/* Features Checklist */}
                    <ul className="mt-3.5 space-y-2.5">
                      {activePkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-stone-200 font-sans">
                          <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={11} className="stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Quick Booking Button for Active Mobile Package */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-col gap-2">
                      <a
                        href={CONTACT_LINKS.lynkId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C4A46C] to-[#E5C178] text-[#1C0A15] font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
                      >
                        <ShoppingBag size={14} />
                        <span>Pesan Paket {activePkg.name} ({activePkg.displayPrice})</span>
                        <ArrowRight size={13} />
                      </a>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Halo Sirklen Photo, saya ingin konsultasi mengenai Paket ${activePkg.name} (${activePkg.displayPrice}) untuk acara saya.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 rounded-xl bg-white/10 text-stone-200 text-xs font-sans font-medium flex items-center justify-center gap-2 active:scale-95 transition"
                      >
                        <MessageCircle size={14} className="text-[#25D366]" />
                        <span>Konsultasi Paket Ini via WhatsApp</span>
                      </a>
                    </div>

                  </div>
                );
              })()}
            </div>

          </div>

          {/* Modal Footer Global Actions */}
          <div className="pt-3 border-t border-white/10 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={CONTACT_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-2.5 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-800 font-sans font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <MessageCircle size={15} className="text-[#25D366]" />
                <span>Konsultasi WhatsApp</span>
              </a>

              <a
                href={CONTACT_LINKS.lynkId}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-2.5 px-4 rounded-full bg-gradient-to-r from-[#8C6534] via-[#A3783F] to-[#8C6534] text-white font-serif font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
              >
                <ShoppingBag size={14} className="text-amber-200" />
                <span>Lynk.id Store</span>
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-white text-xs py-1 px-3 transition cursor-pointer"
            >
              Tutup & Lanjut Mencoba Photobooth
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
