import { useState } from 'react';
import { Camera, Sparkles, QrCode, Mic, Layers, ArrowRight, ShieldCheck, ShoppingBag, CheckCircle, ExternalLink } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import SirklenPricing from './SirklenPricing';
import Marquee from './Marquee';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function SirklenMasterLanding() {
  const { openBooth, openAdminModal, events, navigateToSlug } = useBooth();
  const [selectedDemoSlug, setSelectedDemoSlug] = useState('sabrina-raka');

  const handleOrderClick = (pkg) => {
    window.open(`https://lynk.id/sirklenphoto?package=${pkg.id}`, '_blank');
  };

  return (
    <div className="w-full bg-[#12070D] text-white font-sans select-none overflow-x-hidden">
      
      {/* ================= 🌟 1. MASTER HERO SECTION 🌟 ================= */}
      <section className="relative py-16 sm:py-24 text-center px-4 overflow-hidden border-b border-white/10">
        
        {/* Glow Aura Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#6B111F]/60 via-[#8A1828]/40 to-amber-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Company Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-amber-400/40 text-amber-200 text-xs font-mono font-bold tracking-widest uppercase mb-6 shadow-lg backdrop-blur-md">
            <div className="w-5 h-5 rounded-full bg-white p-0.5 flex items-center justify-center">
              <img src={logoPhotobooth} alt="Sirklen Logo" className="w-full h-full object-contain" />
            </div>
            <span>PT SIRKLEN KREASI USAHA • SIRKLEN PHOTO</span>
          </div>

          {/* Main SaaS Headline */}
          <h1 className="text-4xl xs:text-5xl sm:text-7xl font-serif font-bold text-white tracking-tight leading-tight">
            Virtual Photobooth Modern untuk Event & Pernikahan
          </h1>

          <p className="text-gray-300 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed font-normal">
            Platform photo & voice booth berbasis web tanpa install aplikasi. Cukup scan QR code di meja tamu, abadikan pose terbaik dengan frame custom, dan simpan kenangan abadi di galeri bersama.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigateToSlug('sabrina-raka')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] text-[#F5D77F] font-serif font-bold text-sm sm:text-base border border-amber-400/50 shadow-2xl shadow-rose-950/60 flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
            >
              <Camera size={18} />
              <span>Coba Demo Photobooth</span>
              <ArrowRight size={16} />
            </button>

            <a
              href="#paket"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-black/50 hover:bg-black/70 text-white font-serif font-bold text-sm sm:text-base border border-white/20 shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <span>Lihat Paket Layanan</span>
            </a>
          </div>

          {/* Demo Event Quick Selector Pills */}
          <div className="mt-10 pt-6 border-t border-white/10 max-w-xl mx-auto flex flex-col items-center gap-2">
            <span className="text-[11px] font-mono text-amber-200/80 uppercase tracking-widest">
              ⚡ ATAU PILIH SAMPLE DEMO EVENT AKTIF:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {events.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => navigateToSlug(evt.slug)}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-amber-400/30 text-amber-200 text-xs font-serif font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>✦ {evt.displayName}</span>
                  <span className="text-[10px] font-mono text-gray-400">({evt.slug})</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ================= 🌟 2. HOW IT WORKS WORKFLOW 🌟 ================= */}
      <section className="py-16 sm:py-20 bg-[#160810] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-widest">
              WORKFLOW OTOMATIS
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-1">
              Bagaimana Sirklen Photo Bekerja?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-[#1D0C18] p-6 rounded-2xl border border-amber-400/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 text-lg font-bold">
                1
              </div>
              <h3 className="font-serif font-bold text-sm text-white mb-1">Scan QR Code</h3>
              <p className="text-xs text-gray-400">Tamu cukup scan kartu QR Code di meja tanpa perlu mendownload aplikasi.</p>
            </div>

            <div className="bg-[#1D0C18] p-6 rounded-2xl border border-amber-400/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 text-lg font-bold">
                2
              </div>
              <h3 className="font-serif font-bold text-sm text-white mb-1">Foto + Suara</h3>
              <p className="text-xs text-gray-400">Ambil pose foto terbaik dan rekam pesan suara doa restu secara langsung.</p>
            </div>

            <div className="bg-[#1D0C18] p-6 rounded-2xl border border-amber-400/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 text-lg font-bold">
                3
              </div>
              <h3 className="font-serif font-bold text-sm text-white mb-1">Frame Custom</h3>
              <p className="text-xs text-gray-400">Foto otomatis terpasang dengan bingkai desain eksklusif acara Anda.</p>
            </div>

            <div className="bg-[#1D0C18] p-6 rounded-2xl border border-amber-400/20 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 text-lg font-bold">
                4
              </div>
              <h3 className="font-serif font-bold text-sm text-white mb-1">Galeri Bersama</h3>
              <p className="text-xs text-gray-400">Hasil tersimpan di galeri cloud dan dapat diunduh kapan saja oleh tamu.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 🌟 3. PACKAGES & PRICING TABLE 🌟 ================= */}
      <SirklenPricing onOrderClick={handleOrderClick} />

      {/* ================= 🌟 4. FOOTER BRANDING 🌟 ================= */}
      <footer className="py-8 bg-black text-gray-400 border-t border-white/10 text-center text-xs font-mono">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center mb-1 shadow-md">
            <img src={logoPhotobooth} alt="Sirklen Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-amber-200 font-serif font-bold">
            PT SIRKLEN KREASI USAHA — Sirklen Photo
          </p>
          <p className="text-[10px] text-gray-500">
            Domain Resmi: <code className="text-amber-300 font-mono">sirklenice.com</code> • Hak Cipta © {new Date().getFullYear()} PT Sirklen Kreasi Usaha.
          </p>
        </div>
      </footer>

    </div>
  );
}
