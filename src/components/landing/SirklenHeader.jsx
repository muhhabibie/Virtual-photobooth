import { useState } from 'react';
import { Camera, Sparkles, Lock, ExternalLink, QrCode, ShieldCheck } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';

export default function SirklenHeader() {
  const { openAdminModal, activeEvent, currentSlug, resetToMasterHome } = useBooth();

  return (
    <header className="w-full bg-[#12070D]/95 backdrop-blur-md border-b border-amber-400/20 text-white sticky top-0 z-50 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* Brand Logo & Company Title */}
        <div 
          onClick={resetToMasterHome}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#6B111F] via-[#8A1828] to-[#C4A46C] p-0.5 shadow-lg group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#16080E] rounded-[10px] flex items-center justify-center text-amber-200">
              <Camera size={18} />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-black text-sm sm:text-base tracking-wide text-white group-hover:text-amber-200 transition">
                Sirklen Photo
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold">
                .my.id
              </span>
            </div>
            <span className="text-[8.5px] font-mono text-amber-200/60 uppercase tracking-widest">
              PT Sirklen Kreasi Usaha
            </span>
          </div>
        </div>

        {/* Navigation & Admin Portal Trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeEvent && (
            <button
              onClick={resetToMasterHome}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-sans font-medium transition cursor-pointer hidden sm:flex items-center gap-1"
            >
              <span>Beranda Sirklen</span>
            </button>
          )}

          {/* Admin Dashboard Entry Button */}
          <button
            onClick={openAdminModal}
            className="px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-700/30 border border-amber-400/50 hover:border-amber-300 text-amber-200 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            title="Dashboard Admin PT Sirklen Kreasi Usaha"
          >
            <Lock size={13} className="text-amber-300" />
            <span>Dashboard Admin</span>
          </button>
        </div>

      </div>
    </header>
  );
}
