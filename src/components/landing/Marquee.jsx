import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';

// Authentic Photostrip Frame Themes for Wedding Showcase (Pure Frame Preview - Empty Slots, No Photos)
const FRAME_PREVIEWS = [
  {
    id: 1,
    name: 'Burgundy Royal',
    colorHex: '#6B111F',
    textHex: '#F5D77F',
    borderHex: 'border-white/20',
    slots: 3
  },
  {
    id: 2,
    name: 'Ivory Elegance',
    colorHex: '#FDFBF7',
    textHex: '#6B111F',
    borderHex: 'border-[#6B111F]/25',
    slots: 2
  },
  {
    id: 3,
    name: 'Slate Modern',
    colorHex: '#2D3748',
    textHex: '#E2E8F0',
    borderHex: 'border-white/20',
    slots: 4
  },
  {
    id: 4,
    name: 'Blush Romance',
    colorHex: '#F3C5CB',
    textHex: '#6B111F',
    borderHex: 'border-[#6B111F]/25',
    slots: 2
  },
  {
    id: 5,
    name: 'Champagne Gold',
    colorHex: '#C4A46C',
    textHex: '#FFFFFF',
    borderHex: 'border-white/20',
    slots: 3
  },
  {
    id: 6,
    name: 'Classic Vintage',
    colorHex: '#5E0915',
    textHex: '#F5D77F',
    borderHex: 'border-white/20',
    slots: 2
  },
  {
    id: 7,
    name: 'Midnight Dark',
    colorHex: '#120B18',
    textHex: '#F5D77F',
    borderHex: 'border-white/20',
    slots: 3
  },
  {
    id: 8,
    name: 'Sage Botanical',
    colorHex: '#26402E',
    textHex: '#E2F5D5',
    borderHex: 'border-white/20',
    slots: 2
  }
];

export default function Marquee() {
  const { openBooth } = useBooth();
  const duplicated = [...FRAME_PREVIEWS, ...FRAME_PREVIEWS];

  return (
    <div className="relative w-full overflow-hidden py-4 select-none">
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="marquee-track flex items-center gap-4">
        {duplicated.map((card, i) => {
          const isLight = card.colorHex === '#FDFBF7' || card.colorHex === '#F3C5CB';
          const dividerColor = isLight ? 'border-[#6B111F]/20' : 'border-white/15';

          return (
            <div
              key={`${card.id}-${i}`}
              onClick={openBooth}
              style={{ backgroundColor: card.colorHex }}
              className={`relative flex-shrink-0 w-44 xs:w-48 sm:w-56 h-[320px] sm:h-[370px] rounded-2xl sm:rounded-3xl p-3 shadow-xl border ${card.borderHex} transform transition-all hover:scale-105 duration-300 flex flex-col justify-between group cursor-pointer`}
              title="Klik untuk memilih bingkai ini"
            >
              {/* Top Header Calligraphy */}
              <div className={`text-center pt-0.5 pb-1 border-b ${dividerColor} flex-shrink-0`}>
                <p 
                  style={{ color: card.textHex }}
                  className="text-[6.5px] sm:text-[7.5px] font-serif font-bold uppercase tracking-widest"
                >
                  THE WEDDING OF
                </p>
                <h3 
                  style={{ 
                    color: card.textHex,
                    fontFamily: "'Alex Brush', 'Great Vibes', cursive" 
                  }}
                  className="text-xs sm:text-base font-script leading-none mt-0.5"
                >
                  Sabrina & Raka
                </h3>
              </div>

              {/* Center Empty Photo Slot Cutouts (Pure Frame Preview - No Photos) */}
              <div className="relative flex-1 my-1.5 w-full flex flex-col gap-1.5 min-h-0 justify-center">
                {Array.from({ length: card.slots }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-full flex-1 rounded-md sm:rounded-lg overflow-hidden border shadow-inner flex items-center justify-center transition-all ${
                      isLight 
                        ? 'bg-[#EAE5DC] border-[#6B111F]/15' 
                        : 'bg-black/35 border-white/15'
                    }`}
                  >
                    <span className="text-[8.5px] sm:text-[9.5px] font-mono font-bold tracking-widest opacity-40 uppercase" style={{ color: card.textHex }}>
                      Pose #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bottom Signature & Theme Name */}
              <div className={`text-center pt-1 pb-0.5 border-t ${dividerColor} flex-shrink-0`}>
                <p className="text-[7.5px] sm:text-[8.5px] font-serif italic opacity-90" style={{ color: card.textHex }}>
                  With Love & Blessings,
                </p>
                <h4 
                  style={{ 
                    color: card.textHex,
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" 
                  }}
                  className="text-xs sm:text-sm font-serif font-bold italic leading-tight my-0.5 tracking-wide drop-shadow-xs truncate px-1"
                >
                  {card.name}
                </h4>
                <p className="text-[7px] sm:text-[7.5px] font-mono opacity-80 mt-0.5 tracking-wider" style={{ color: card.textHex }}>
                  10 · MEI · 2026
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}