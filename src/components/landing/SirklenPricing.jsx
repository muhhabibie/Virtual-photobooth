import { Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { PACKAGES } from '../../data/mockEvents';

export default function SirklenPricing({ onOrderClick }) {
  const packageList = Object.values(PACKAGES);

  return (
    <section id="paket" className="py-16 sm:py-24 bg-[#FDFBF7] text-gray-900 select-none relative overflow-hidden">
      
      {/* Soft Wedding Aura Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#6B111F]/10 border border-[#6B111F]/20 text-[#6B111F] text-[11px] font-mono font-bold tracking-widest uppercase mb-3">
            <ShoppingBag size={12} />
            <span>PAKET LAYANAN DIGITAL</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
            Pilihan Paket Sirklen Photo
          </h2>

          <p className="text-gray-600 text-sm sm:text-base font-sans mt-3">
            Solusi Virtual Photobooth serba otomatis tanpa install aplikasi untuk pernikahan & acara spesial Anda.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {packageList.map((pkg) => {
            const isPopular = pkg.id === 'standard';
            return (
              <div
                key={pkg.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${
                  isPopular
                    ? 'bg-gradient-to-b from-[#1C0A15] via-[#2D1022] to-[#160810] text-white shadow-2xl ring-2 ring-[#C4A46C] transform md:-translate-y-2'
                    : 'bg-white border border-rose-100 text-gray-900 shadow-xl hover:shadow-2xl'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 inset-x-0 flex justify-center">
                    <span className="bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] text-[#240C17] text-[10px] font-mono font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                      {pkg.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Card Header */}
                  <div className="border-b pb-6 border-current/10">
                    <h3 className={`text-xl font-serif font-bold ${isPopular ? 'text-amber-200' : 'text-[#6B111F]'}`}>
                      Paket {pkg.name}
                    </h3>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">
                        {pkg.formattedPrice}
                      </span>
                      <span className={`text-xs font-sans ${isPopular ? 'text-gray-300' : 'text-gray-500'}`}>
                        / acara
                      </span>
                    </div>

                    <p className={`text-xs font-mono mt-2 ${isPopular ? 'text-amber-200/80' : 'text-rose-800'}`}>
                      Galeri aktif selama {pkg.activeDays} Hari
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="py-6 space-y-3.5">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isPopular ? 'bg-amber-400/20 text-amber-300' : 'bg-rose-100 text-[#6B111F]'
                        }`}>
                          <Check size={12} className="stroke-[3]" />
                        </div>
                        <span className={isPopular ? 'text-gray-200 font-medium' : 'text-gray-700'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Order Button */}
                <div className="pt-4 border-t border-current/10">
                  <button
                    onClick={() => onOrderClick(pkg)}
                    className={`w-full py-3.5 rounded-2xl font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer ${
                      isPopular
                        ? 'bg-gradient-to-r from-[#C4A46C] via-[#F5D77F] to-[#C4A46C] text-[#1C0A15] hover:brightness-110 shadow-amber-900/40'
                        : 'bg-[#6B111F] hover:bg-[#520C16] text-[#F5D77F] shadow-rose-950/20'
                    }`}
                  >
                    <ShoppingBag size={16} />
                    <span>Pesan via Lynk.id</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Note / Domain Info Footer */}
        <div className="mt-12 text-center text-xs font-sans text-gray-500 max-w-xl mx-auto bg-white/80 backdrop-blur-xs border border-rose-100 p-4 rounded-2xl shadow-sm">
          <p className="font-semibold text-gray-800 mb-1">
            📍 Domain Resmi: <code className="bg-rose-50 px-2 py-0.5 rounded text-[#6B111F] font-mono">sirklenice.com/:slug</code>
          </p>
          <p>
            Satu aplikasi untuk seluruh event. URL dan QR Code dibuat otomatis oleh tim PT Sirklen Kreasi Usaha begitu pemesanan dikonfirmasi.
          </p>
        </div>

      </div>
    </section>
  );
}
