import { useState } from 'react';
import { Check, ShoppingBag, ArrowRight, MessageCircle, Star, Crown, LayoutGrid, Table } from 'lucide-react';
import { PACKAGES, CONTACT_LINKS } from '../../data/mockEvents';

export default function SirklenPricing({ onOrderClick }) {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const packageList = Object.values(PACKAGES);

  return (
    <section id="paket" className="py-16 sm:py-24 bg-[#FBF9F5] text-stone-900 select-none relative overflow-hidden">
      
      {/* Soft Wedding Aura Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header (Inspired by Lampiran 2 & 3: Simple, Transparent Pricing) */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#6B111F]/10 border border-[#6B111F]/20 text-[#6B111F] text-[11px] font-mono font-bold tracking-widest uppercase mb-3">
            <ShoppingBag size={12} />
            <span>Sirklenice Photobooth</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">
            Paket Photobooth Virtual
          </h2>

          <p className="text-stone-600 text-sm sm:text-base font-sans mt-3">
            Harga transparan tanpa biaya tersembunyi. Solusi serba otomatis tanpa install aplikasi untuk pernikahan & acara spesial Anda.
          </p>

          {/* View Toggle on Mobile & Desktop (Cards vs Table) */}
          <div className="flex items-center justify-center gap-2 mt-5">
            <div className="inline-flex p-1 bg-stone-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Kartu Paket</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Table size={14} />
                <span>Tabel Perbandingan</span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: 3-CARD SIDE-BY-SIDE / RESPONSIVE GRID */}
        {viewMode === 'cards' ? (
          <div className="flex md:grid md:grid-cols-3 gap-5 lg:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory items-stretch py-2 px-1 scroll-smooth">
            {packageList.map((pkg) => {
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
                  className={`w-[85vw] max-w-[340px] md:w-auto flex-shrink-0 snap-center rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                    isPopular
                      ? 'bg-gradient-to-b from-[#6B111F] via-[#520C18] to-[#3B0710] text-white shadow-2xl shadow-rose-950/30 ring-2 ring-[#C4A46C] transform md:-translate-y-2'
                      : 'bg-white border border-stone-200/90 text-stone-900 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Top Badges */}
                  {isPopular && (
                    <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                      <span className="bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] text-[#240C17] text-[10px] font-mono font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  {isSpecial && (
                    <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                      <span className="bg-rose-50 border border-rose-200 text-[#6B111F] text-[10px] font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                        {pkg.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Card Header */}
                    <div className={`border-b pb-5 ${isPopular ? 'border-white/10' : 'border-stone-100'}`}>
                      <div className="flex items-center gap-1.5">
                        {isSpecial && <Crown size={16} className="text-[#6B111F]" />}
                        {isPopular && <Star size={16} className="text-amber-300 fill-amber-300" />}
                        <h3 className={`text-2xl font-serif font-bold ${isPopular ? 'text-amber-200' : 'text-stone-900'}`}>
                          {pkg.name}
                        </h3>
                      </div>

                      <p className={`text-xs mt-1.5 min-h-[36px] leading-relaxed ${isPopular ? 'text-stone-200' : 'text-stone-500'}`}>
                        {shortDesc}
                      </p>

                      <div className="mt-4 flex items-baseline gap-1">
                        <span className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight ${isPopular ? 'text-white' : 'text-stone-900'}`}>
                          {pkg.formattedPrice}
                        </span>
                        <span className={`text-xs font-sans ${isPopular ? 'text-amber-200/80' : 'text-stone-500'}`}>
                          / acara
                        </span>
                      </div>

                      <span className={`inline-block text-[11px] font-mono px-3 py-0.5 rounded-full mt-2 font-medium ${
                        isPopular ? 'bg-white/10 text-amber-200' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {pkg.displayPrice} • Akses {pkg.activeDays} hari
                      </span>
                    </div>

                    {/* Feature Checklist */}
                    <ul className="py-6 space-y-3">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isPopular ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <Check size={12} className="stroke-[3]" />
                          </div>
                          <span className={`leading-snug ${isPopular ? 'text-stone-100 font-medium' : 'text-stone-700'}`}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Single Primary CTA + WhatsApp Consultation (No duplicate footer buttons!) */}
                  <div className={`pt-4 border-t flex flex-col gap-2 ${isPopular ? 'border-white/10' : 'border-stone-100'}`}>
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
                      className={`w-full py-3.5 rounded-2xl font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer ${
                        isPopular
                          ? 'bg-gradient-to-r from-[#F5D77F] via-[#E5C158] to-[#C4A46C] text-[#240C17] hover:brightness-105 shadow-amber-950/20'
                          : isSpecial
                          ? 'bg-[#6B111F] hover:bg-[#520C16] text-[#F5D77F]'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      <ShoppingBag size={15} />
                      <span>Pesan Paket {pkg.name}</span>
                      <ArrowRight size={14} />
                    </a>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Halo Sirklen Photo, saya ingin memesan Paket ${pkg.name} (${pkg.displayPrice}) untuk acara saya.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-2 text-center text-xs font-sans font-medium flex items-center justify-center gap-1.5 transition ${
                        isPopular ? 'text-amber-200/90 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <MessageCircle size={14} className="text-[#25D366]" />
                      <span>Konsultasi WhatsApp</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: FULL SIDE-BY-SIDE COMPARISON TABLE */
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80">
                    <th className="p-4 sm:p-5 text-stone-500 font-medium">Fitur & Layanan</th>
                    {packageList.map((pkg) => {
                      const isPopular = pkg.id === 'standard';
                      return (
                        <th
                          key={pkg.id}
                          className={`p-4 sm:p-5 text-center ${
                            isPopular ? 'bg-amber-50/80 text-[#6B111F] font-bold ring-1 ring-amber-300' : 'text-stone-900 font-bold'
                          }`}
                        >
                          <div className="text-base sm:text-lg font-serif">{pkg.name}</div>
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
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Virtual Photobooth (Photo & Voice)</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">✓ Ya</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold bg-amber-50/30">✓ Ya</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">✓ Ya</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Template Polaroid & Custom Frame</td>
                    <td className="p-4 sm:p-5 text-center font-semibold">1 Custom</td>
                    <td className="p-4 sm:p-5 text-center font-semibold bg-amber-50/30 text-[#6B111F]">2 Custom</td>
                    <td className="p-4 sm:p-5 text-center font-semibold">3 Custom</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Cetak Kartu QR Fisik</td>
                    <td className="p-4 sm:p-5 text-center">100 pcs</td>
                    <td className="p-4 sm:p-5 text-center bg-amber-50/30 font-semibold text-[#6B111F]">100 pcs</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">200 pcs (2x)</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Kapasitas Foto</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">Unlimited</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold bg-amber-50/30">Unlimited</td>
                    <td className="p-4 sm:p-5 text-center text-emerald-600 font-bold">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Masa Aktif Akses Galeri</td>
                    <td className="p-4 sm:p-5 text-center">7 Hari</td>
                    <td className="p-4 sm:p-5 text-center bg-amber-50/30 font-bold text-[#6B111F]">10 Hari</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-emerald-700">14 Hari</td>
                  </tr>
                  <tr className="bg-stone-50/50">
                    <td className="p-4 sm:p-5 font-medium text-stone-900">Tindakan Pemesanan</td>
                    {packageList.map((pkg) => {
                      const isPopular = pkg.id === 'standard';
                      return (
                        <td key={pkg.id} className={`p-4 sm:p-5 text-center ${isPopular ? 'bg-amber-50/50' : ''}`}>
                          <a
                            href={CONTACT_LINKS.lynkId}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
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
