import { useState } from 'react';
import { Check, ArrowRight, MessageCircle, Table, LayoutGrid } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function SirklenPricing({ onOrderClick }) {
  const [viewMode, setViewMode] = useState('table'); // Default to table for direct comparison
  const packageList = Object.values(PACKAGES);

  return (
    <section id="paket" className="py-16 sm:py-24 bg-[#FBF9F5] text-stone-900 select-none relative overflow-hidden">
      
      {/* Soft Wedding Aura Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header (Clean, On-Point, No 'sirklenice photobooth' above title!) */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
            Paket Photobooth Virtual
          </h2>

          <p className="text-stone-600 text-sm sm:text-base font-sans mt-2">
            Bandingkan fasilitas & pilih paket sesuai kebutuhan acaramu.
          </p>

          {/* View Switcher: Tabel Pembanding (Default) vs Kartu Paket */}
          <div className="flex items-center justify-center gap-2 mt-5">
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
                <Table size={14} />
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
                <LayoutGrid size={14} />
                <span>Kartu Paket</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN VIEW: TABEL PEMBANDING (Default) */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-3xl border border-stone-200/90 overflow-hidden shadow-sm max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/90">
                    <th className="p-4 sm:p-5 text-stone-500 font-medium">Fitur Paket</th>
                    {packageList.map((pkg) => {
                      const isPopular = pkg.id === 'standard';
                      return (
                        <th
                          key={pkg.id}
                          className={`p-4 sm:p-5 text-center ${
                            isPopular ? 'bg-amber-50/70 text-[#6B111F] font-bold ring-1 ring-amber-300/80' : 'text-stone-900 font-bold'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-base sm:text-lg font-serif">{pkg.name}</span>
                            {isPopular && (
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#6B111F] text-[#F5D77F] px-2 py-0.5 rounded-full">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <div className="text-sm sm:text-base font-sans font-extrabold text-[#6B111F] mt-0.5">
                            {pkg.displayPrice}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Custom Frame Polaroid</td>
                    <td className="p-4 sm:p-5 text-center font-semibold text-stone-700">1 Custom</td>
                    <td className="p-4 sm:p-5 text-center font-bold bg-amber-50/30 text-[#6B111F]">2 Custom</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-stone-900">3 Custom</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Cetak Kartu QR Fisik</td>
                    <td className="p-4 sm:p-5 text-center font-semibold text-stone-700">100 pcs</td>
                    <td className="p-4 sm:p-5 text-center font-semibold bg-amber-50/30 text-[#6B111F]">100 pcs</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-emerald-50/30">200 pcs (2x)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Masa Aktif Akses Galeri</td>
                    <td className="p-4 sm:p-5 text-center font-semibold text-stone-700">7 Hari</td>
                    <td className="p-4 sm:p-5 text-center font-bold bg-amber-50/30 text-[#6B111F]">10 Hari</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-emerald-700 bg-emerald-50/30">14 Hari</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Virtual Photobooth (Photo & Voice)</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">✓ Ya</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold bg-amber-50/30">✓ Ya</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">✓ Ya</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Kapasitas Foto</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">Unlimited</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold bg-amber-50/30">Unlimited</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">Unlimited</td>
                  </tr>
                  {/* Direct Action Buttons */}
                  <tr className="bg-stone-50/50">
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Pemesanan Langsung</td>
                    {packageList.map((pkg) => {
                      const isPopular = pkg.id === 'standard';
                      return (
                        <td key={pkg.id} className={`p-4 sm:p-5 text-center ${isPopular ? 'bg-amber-50/50' : ''}`}>
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
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 shadow-xs ${
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
          /* OPTION 2: 3-CARD GRID (Wave Header Design matching Reference Image 3) */
          <div className="flex md:grid md:grid-cols-3 gap-6 sm:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory items-stretch py-2 px-1 scroll-smooth">
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
                  className={`w-[85vw] max-w-[340px] md:w-auto flex-shrink-0 snap-center rounded-3xl bg-white flex flex-col justify-between overflow-hidden transition-all duration-300 relative ${
                    isPopular
                      ? 'border-2 border-[#C4A46C] shadow-2xl ring-2 ring-[#C4A46C]/40 transform md:-translate-y-2'
                      : 'border border-stone-200/90 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div>
                    {/* Top Wave Header */}
                    <div className={`relative pt-6 pb-10 sm:pb-12 px-6 text-white overflow-hidden ${headerGradient}`}>
                      
                      {/* Header Badge: MOST POPULAR (no star icon) or PAKET TERLENGKAP */}
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
        )}

        {/* Note / Domain Info Footer */}
        <div className="mt-12 text-center text-xs font-sans text-stone-500 max-w-xl mx-auto bg-white border border-stone-200/80 p-4 rounded-2xl shadow-xs">
          <p className="font-semibold text-stone-800 mb-1">
            📍 Domain Resmi: <code className="bg-stone-100 px-2 py-0.5 rounded text-[#6B111F] font-mono">sirklenice.com/:slug</code>
          </p>
          <p>
            Satu aplikasi untuk seluruh event. URL dan QR Code dibuat otomatis oleh tim PT Sirklen Kreasi Usaha begitu pemesanan dikonfirmasi.
          </p>
        </div>

      </div>
    </section>
  );
}
