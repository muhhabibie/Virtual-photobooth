import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShoppingBag, MessageCircle, ArrowRight, Sparkles, Star, Crown } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function PriceListPosterModal({ isOpen, onClose }) {
  const [selectedTab, setSelectedTab] = useState('standard');
  const packageList = Object.values(PACKAGES);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#1C0A15] via-[#240D1C] to-[#12050D] border-2 border-[#C4A46C]/60 rounded-3xl p-5 sm:p-7 text-white shadow-2xl my-auto flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Subtle Golden Glow Backdrops */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 hover:text-white flex items-center justify-center transition cursor-pointer z-20"
            title="Tutup Poster"
          >
            <X size={16} />
          </button>

          {/* ================= 🌟 POSTER HEADER 🌟 ================= */}
          <div className="text-center pb-4 border-b border-white/10 relative z-10 flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[10px] font-mono font-bold tracking-widest uppercase mb-1.5">
              <Sparkles size={11} className="text-amber-300" />
              <span>SIRKLENICE • OFFICIAL PRICE LIST</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 tracking-tight leading-tight">
              Paket Photobooth Virtual
            </h2>

            <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto leading-relaxed">
              Solusi virtual photobooth interaktif tanpa antre & tanpa install aplikasi. Tamu cukup scan QR code di meja untuk berfoto dan rekam ucapan doa restu.
            </p>

            {/* Mobile Tab Switcher Pills */}
            <div className="mt-3 flex sm:hidden items-center justify-center gap-1 p-1 rounded-full bg-black/40 border border-white/15 max-w-xs mx-auto">
              {packageList.map((pkg) => {
                const isSelected = selectedTab === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedTab(pkg.id)}
                    className={`flex-1 py-1 px-2 rounded-full text-[10px] font-serif font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] text-[#1C0A15] shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {pkg.name} ({pkg.displayPrice})
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= 🌟 3 PACKAGE FLYER CARDS 🌟 ================= */}
          <div className="my-4 flex-1 min-h-0 overflow-y-auto pr-1 no-scrollbar relative z-10">
            
            {/* Desktop: 3 Columns Grid | Mobile: Active Tab Card with Toggle */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-3.5 items-stretch">
              {packageList.map((pkg) => {
                const isPopular = pkg.id === 'standard';
                const isSpecial = pkg.id === 'all_in';

                return (
                  <div
                    key={pkg.id}
                    className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 relative ${
                      isPopular
                        ? 'bg-gradient-to-b from-[#2E1224] to-[#1C0A15] border-2 border-[#C4A46C] shadow-xl shadow-rose-950/40 ring-1 ring-[#F5D77F]/30 transform -translate-y-1'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Badge Pill */}
                    {pkg.badge && (
                      <div className="absolute -top-2.5 inset-x-0 flex justify-center">
                        <span className="bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] text-[#240C17] text-[8.5px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md">
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
                          <h3 className={`text-base font-serif font-bold ${isPopular ? 'text-amber-200' : 'text-white'}`}>
                            {pkg.name}
                          </h3>
                        </div>

                        <div className="mt-1.5 flex items-baseline justify-center gap-1">
                          <span className="text-xl font-serif font-bold text-white tracking-tight">
                            {pkg.formattedPrice}
                          </span>
                        </div>

                        <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full mt-1.5 ${
                          isPopular ? 'bg-amber-400/20 text-amber-200' : 'bg-white/10 text-gray-300'
                        }`}>
                          {pkg.displayPrice} • {pkg.activeDays} Hari
                        </span>
                      </div>

                      {/* Feature Bullet Points */}
                      <ul className="py-3.5 space-y-2 text-left">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-gray-200">
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isPopular ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10 text-amber-200'
                            }`}>
                              <Check size={9} className="stroke-[3]" />
                            </div>
                            <span className="leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Quick Button */}
                    <div className="pt-2 border-t border-white/10">
                      <a
                        href={CONTACT_LINKS.lynkId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2 px-2 rounded-xl text-[11px] font-serif font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
                          isPopular
                            ? 'bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] text-[#1C0A15] hover:brightness-110 shadow-sm'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                      >
                        <span>Pesan Paket</span>
                        <ArrowRight size={11} />
                      </a>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Mobile View: Render Selected Tab Card in Full Clarity */}
            <div className="block sm:hidden">
              {(() => {
                const activePkg = packageList.find(p => p.id === selectedTab) || packageList[1];
                const isPopular = activePkg.id === 'standard';
                return (
                  <div className={`rounded-2xl p-4 text-left relative ${
                    isPopular 
                      ? 'bg-gradient-to-b from-[#2E1224] to-[#1D0A16] border-2 border-[#C4A46C] shadow-lg' 
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
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                          Akses foto {activePkg.activeDays} hari
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-serif font-bold text-white tracking-tight">
                          {activePkg.formattedPrice}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-sans">
                          / acara
                        </span>
                      </div>
                    </div>

                    {/* Feature Bullets */}
                    <ul className="mt-3 space-y-2">
                      {activePkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-gray-200">
                          <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check size={11} className="stroke-[3]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>

          </div>

          {/* ================= 🌟 POSTER FOOTER ACTIONS 🌟 ================= */}
          <div className="pt-3 border-t border-white/10 relative z-10 flex flex-col gap-2 flex-shrink-0">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
              {/* WhatsApp Consultation */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent('Halo Sirklen Photo, saya ingin konsultasi mengenai Paket Photobooth Virtual untuk acara saya.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-full bg-white hover:bg-stone-50 text-stone-800 font-sans font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-stone-200 shadow-md transition active:scale-95 cursor-pointer text-center"
              >
                <MessageCircle size={16} className="text-[#25D366]" />
                <span>Konsultasi WhatsApp</span>
              </a>

              {/* Lynk.id Direct Order */}
              <a
                href={CONTACT_LINKS.lynkId}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-full bg-gradient-to-r from-[#8C6534] via-[#A3783F] to-[#8C6534] hover:from-[#7A562B] hover:to-[#7A562B] text-white border border-[#BFA069]/40 font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 transition active:scale-95 cursor-pointer text-center"
              >
                <ShoppingBag size={15} className="text-amber-200" />
                <span>Pesan Sekarang di Lynk.id</span>
                <ArrowRight size={14} className="text-amber-200 opacity-80" />
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-1.5 rounded-full text-gray-400 hover:text-white text-xs transition cursor-pointer"
            >
              Tutup & Lanjut Mencoba Photobooth
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
