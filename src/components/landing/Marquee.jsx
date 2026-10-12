import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import { DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';

// Authentic Photostrip Frame Themes for Wedding Showcase
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
  const { openBooth, activeEvent } = useBooth();
  const duplicated = [...FRAME_PREVIEWS, ...FRAME_PREVIEWS];

  const isWedding = (activeEvent?.eventType || 'wedding') === 'wedding';
  const eventTitle = activeEvent?.displayName || 'Sabrina & Raka';
  const eventDate = activeEvent?.formattedDate || '10 · MEI · 2026';
  const eventPhotos = (activeEvent?.heroPhotos && activeEvent.heroPhotos.length > 0)
    ? activeEvent.heroPhotos
    : DEFAULT_HERO_PHOTOS;

  return (
    <div className="relative w-full overflow-hidden py-2 select-none">
      {/* Subtle soft edge gradient on wide screens only (never obstructing cards on mobile) */}
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

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
                  {isWedding ? 'THE WEDDING OF' : 'OFFICIAL PHOTOBOOTH'}
                </p>
                <h3 
                  style={{ 
                    color: card.textHex,
                    fontFamily: isWedding ? "'Alex Brush', 'Great Vibes', cursive" : "'Playfair Display', Georgia, serif" 
                  }}
                  className="text-xs sm:text-base font-script leading-none mt-0.5 truncate px-1"
                >
                  {eventTitle}
                </h3>
              </div>

              {/* Center Photo Slots (Menampilkan foto sampel prewedding mempelai yang nyata & elegan) */}
              <div className="relative flex-1 my-1.5 w-full flex flex-col gap-1.5 min-h-0 justify-center">
                {Array.from({ length: card.slots }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="w-full flex-1 rounded-md sm:rounded-lg overflow-hidden relative bg-black/20 shadow-inner group-hover:scale-[1.01] transition-transform"
                  >
                    <img 
                      src={eventPhotos[idx % eventPhotos.length]} 
                      alt={`Pose ${idx + 1}`}
                      className="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.02]"
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Signature & Theme Name */}
              <div className={`text-center pt-1 pb-0.5 border-t ${dividerColor} flex-shrink-0`}>
                <p className="text-[7.5px] sm:text-[8.5px] font-serif italic opacity-90" style={{ color: card.textHex }}>
                  {isWedding ? 'With Love & Blessings,' : 'Memories & Moments,'}
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
                <p className="text-[7px] sm:text-[7.5px] font-mono opacity-80 mt-0.5 tracking-wider truncate px-1" style={{ color: card.textHex }}>
                  {eventDate}
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}