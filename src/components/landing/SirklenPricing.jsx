import { Check, ArrowRight, MessageCircle } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function SirklenPricing({ onOrderClick }) {
  const packageList = Object.values(PACKAGES);

  return (
    <section id="paket" className="py-14 sm:py-20 bg-[#FBF9F5] text-stone-900 select-none relative overflow-hidden">
      
      {/* Soft Wedding Aura Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 relative z-10">
        
        {/* Section Header (Clean & On-Point, No Separate Tabs) */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
            Paket Photobooth Virtual
          </h2>

          <p className="text-stone-600 text-xs sm:text-base font-sans mt-2">
            Perbandingan lengkap fasilitas & harga untuk seluruh tamu undangan.
          </p>
        </div>

        {/* ================= 🌟 1. TABEL PEMBANDING (100% FULL-WIDTH, NO HORIZONTAL SCROLL) 🌟 ================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm max-w-4xl mx-auto mb-10 sm:mb-16">
          <table className="w-full table-fixed text-left border-collapse text-[11px] sm:text-xs md:text-sm">
            <colgroup>
              <col className="w-[31%] sm:w-[28%]" />
              <col className="w-[23%] sm:w-[24%]" />
              <col className="w-[23%] sm:w-[24%]" />
              <col className="w-[23%] sm:w-[24%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/90">
                <th className="px-2 py-3 sm:px-4 sm:py-4 text-stone-500 font-medium text-[10px] sm:text-xs">
                  Fitur Paket
                </th>
                {packageList.map((pkg) => {
                  const isPopular = pkg.id === 'standard';
                  return (
                    <th
                      key={pkg.id}
                      className={`px-1.5 py-2.5 sm:px-4 sm:py-4 text-center ${
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
                <td className="px-2 py-2.5 sm:px-4 sm:py-3.5 font-medium text-stone-900">Custom Frame</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-semibold text-stone-700">1 Custom</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-bold bg-amber-50/40 text-[#6B111F] border-x border-[#C4A46C]/20">2 Custom</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-bold text-stone-900">3 Custom</td>
              </tr>
              <tr>
                <td className="px-2 py-2.5 sm:px-4 sm:py-3.5 font-medium text-stone-900">Kartu QR Fisik</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-semibold text-stone-700">100 pcs</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-semibold bg-amber-50/40 text-[#6B111F] border-x border-[#C4A46C]/20">100 pcs</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-bold text-emerald-700 bg-emerald-50/30">200 pcs (2x)</td>
              </tr>
              <tr>
                <td className="px-2 py-2.5 sm:px-4 sm:py-3.5 font-medium text-stone-900">Masa Akses Foto</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-semibold text-stone-700">7 Hari</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-bold bg-amber-50/40 text-[#6B111F] border-x border-[#C4A46C]/20">10 Hari</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center font-bold text-emerald-700 bg-emerald-50/30">14 Hari</td>
              </tr>
              <tr>
                <td className="px-2 py-2.5 sm:px-4 sm:py-3.5 font-medium text-stone-900">Photo & Voice Note</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center text-emerald-600 font-bold bg-amber-50/40 border-x border-[#C4A46C]/20">✓ Ya</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center text-emerald-600 font-bold">✓ Ya</td>
              </tr>
              <tr>
                <td className="px-2 py-2.5 sm:px-4 sm:py-3.5 font-medium text-stone-900">Kapasitas Foto</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center text-emerald-600 font-bold">Unlimited</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center text-emerald-600 font-bold bg-amber-50/40 border-x border-[#C4A46C]/20">Unlimited</td>
                <td className="px-1.5 py-2.5 sm:px-4 sm:py-3.5 text-center text-emerald-600 font-bold">Unlimited</td>
              </tr>
              {/* Direct Booking Action Row */}
              <tr className="bg-stone-50/70">
                <td className="px-2 py-2.5 sm:px-4 sm:py-4 font-semibold text-stone-900 text-[10px] sm:text-xs">
                  Pesan Paket
                </td>
                {packageList.map((pkg) => {
                  const isPopular = pkg.id === 'standard';
                  return (
                    <td
                      key={pkg.id}
                      className={`px-1 py-2 sm:px-3 sm:py-3 text-center ${
                        isPopular ? 'bg-amber-50/70 border-x border-[#C4A46C]/40' : ''
                      }`}
                    >
                      <a
                        href={CONTACT_LINKS.lynkId}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (onOrderClick) {
                            e.preventDefault();
                            onOrderClick(pkg);
                          }
                        }}
                        className={`w-full inline-flex items-center justify-center gap-1 py-2 px-1.5 sm:py-2.5 sm:px-3 rounded-xl text-[10.5px] sm:text-xs font-bold transition active:scale-95 shadow-xs ${
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
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
                className={`w-full rounded-3xl bg-white flex flex-col justify-between overflow-hidden transition-all duration-300 relative ${
                  isPopular
                    ? 'border-2 border-[#C4A46C] shadow-2xl ring-2 ring-[#C4A46C]/40 md:-translate-y-2'
                    : 'border border-stone-200/90 shadow-lg hover:shadow-xl'
                }`}
              >
                <div>
                  {/* Top Wave Header */}
                  <div className={`relative pt-6 pb-10 sm:pb-12 px-6 text-white overflow-hidden ${headerGradient}`}>
                    
                    {/* Header Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-90">
                        {pkg.name}
                      </span>

                      {isPopular && (
                        <span className="bg-white/20 backdrop-blur-xs border border-white/30 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs">
                          MOST POPULAR
                        </span>
                      )}

                      {isSpecial && (
                        <span className="bg-white/20 backdrop-blur-xs border border-white/30 text-amber-200 text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-2xs">
                          PAKET TERLENGKAP
                        </span>
                      )}
                    </div>

                    {/* Large Bold Price */}
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans">
                        {pkg.displayPrice}
                      </span>
                      <span className="text-xs sm:text-sm opacity-80 font-sans">
                        / acara
                      </span>
                    </div>

                    {/* Smooth SVG Wave Divider */}
                    <div className="absolute -bottom-px inset-x-0 leading-none overflow-hidden pointer-events-none">
                      <svg
                        viewBox="0 0 500 50"
                        preserveAspectRatio="none"
                        className="w-full h-7 sm:h-8 fill-white block"
                      >
                        <path d="M0,15 C150,42 350,-5 500,22 L500,50 L0,50 Z" />
                      </svg>
                    </div>
                  </div>

                  {/* Feature Checklist on White Body */}
                  <div className="px-6 pt-3 pb-6">
                    <ul className="space-y-3">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-stone-700">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPopular ? 'text-[#6B111F] bg-rose-50' : 'text-emerald-600 bg-emerald-50'
                          }`}>
                            <Check size={13} className="stroke-[3]" />
                          </div>
                          <span className="leading-snug font-medium">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Single Pill CTA Button + WhatsApp Consultation */}
                <div className="px-6 pb-6 pt-2 border-t border-stone-100 flex flex-col gap-2">
                  <a
                    href={CONTACT_LINKS.lynkId}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (onOrderClick) {
                        e.preventDefault();
                        onOrderClick(pkg);
                      }
                    }}
                    className={`w-full py-3.5 rounded-full font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-[#6B111F] via-[#851627] to-[#6B111F] text-[#F5D77F] border border-amber-300/40 hover:brightness-105 shadow-rose-950/20'
                        : isSpecial
                        ? 'bg-[#6B111F] hover:bg-[#520C18] text-[#F5D77F]'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    <span>Pesan Sekarang</span>
                    <ArrowRight size={14} />
                  </a>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Halo Sirklen Photo, saya ingin memesan Paket ${pkg.name} (${pkg.displayPrice}) untuk acara saya.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 text-center text-xs font-sans font-medium text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageCircle size={14} className="text-[#25D366]" />
                    <span>Konsultasi WhatsApp</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
