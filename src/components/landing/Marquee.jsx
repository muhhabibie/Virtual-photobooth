import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';

// Authentic Photostrip Frame Themes for Event / Wedding Showcase
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
  const scrollRef = useRef(null);

  // Triple duplicated list for seamless looping and effortless multi-direction swipe
  const duplicated = [...FRAME_PREVIEWS, ...FRAME_PREVIEWS, ...FRAME_PREVIEWS];

  const isWedding = (activeEvent?.eventType || 'wedding') === 'wedding';
  const eventTitle = activeEvent?.displayName || 'Car Free Day Malang';
  const eventDate = activeEvent?.formattedDate || '15 November 2026';
  const eventPhotos = (activeEvent?.heroPhotos && activeEvent.heroPhotos.length > 0)
    ? activeEvent.heroPhotos
    : DEFAULT_HERO_PHOTOS;

  // Interaction State for Touch Swipe & Mouse Drag
  const [isInteracting, setIsInteracting] = useState(false);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);
  const hasDragged = useRef(false);

  // Initialize scroll position in the middle for infinite feel
  useEffect(() => {
    if (scrollRef.current) {
      const oneThird = scrollRef.current.scrollWidth / 3;
      scrollRef.current.scrollLeft = oneThird;
    }
  }, []);

  // Continuous Gentle Auto-Scroll when user is NOT touching or dragging
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const step = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      if (scrollRef.current && !isInteracting) {
        // Smooth frame-rate independent drift (~35px per second)
        scrollRef.current.scrollLeft += (35 * dt) / 1000;

        // Loop seamlessly
        const oneThird = scrollRef.current.scrollWidth / 3;
        if (scrollRef.current.scrollLeft >= oneThird * 2) {
          scrollRef.current.scrollLeft -= oneThird;
        } else if (scrollRef.current.scrollLeft <= 10) {
          scrollRef.current.scrollLeft += oneThird;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isInteracting]);

  // Mouse Drag Handlers for Laptop / Desktop
  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    isMouseDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
    setIsInteracting(true);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.3;
    if (Math.abs(walk) > 5) {
      hasDragged.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    setTimeout(() => {
      hasDragged.current = false;
      setIsInteracting(false);
    }, 60);
  };

  // Chevron Navigation Buttons for Laptop
  const handleScrollBtn = (direction) => {
    if (!scrollRef.current) return;
    setIsInteracting(true);
    const amount = direction === 'left' ? -260 : 260;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(() => setIsInteracting(false), 900);
  };

  return (
    <div className="relative w-full overflow-hidden py-2 select-none group">
      {/* Edge Gradients for polished aesthetic */}
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Navigation Arrows for Laptop / Desktop */}
      <button
        type="button"
        onClick={() => handleScrollBtn('left')}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-xl border border-stone-200/80 items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer active:scale-95"
        title="Geser Kiri"
      >
        <ChevronLeft size={20} className="text-[#6B111F]" />
      </button>

      <button
        type="button"
        onClick={() => handleScrollBtn('right')}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-xl border border-stone-200/80 items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer active:scale-95"
        title="Geser Kanan"
      >
        <ChevronRight size={20} className="text-[#6B111F]" />
      </button>

      {/* Swipeable & Draggable Scroll Track */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setTimeout(() => setIsInteracting(false), 1200)}
        className="flex items-center gap-4 overflow-x-auto scrollbar-none px-4 sm:px-8 py-2 cursor-grab active:cursor-grabbing touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {duplicated.map((card, i) => {
          const isLight = card.colorHex === '#FDFBF7' || card.colorHex === '#F3C5CB';
          const dividerColor = isLight ? 'border-[#6B111F]/20' : 'border-white/15';

          return (
            <div
              key={`${card.id}-${i}`}
              onClick={() => {
                if (!hasDragged.current) {
                  openBooth();
                }
              }}
              style={{ backgroundColor: card.colorHex }}
              className={`relative flex-shrink-0 w-44 xs:w-48 sm:w-56 h-[320px] sm:h-[370px] rounded-2xl sm:rounded-3xl p-3 shadow-xl border ${card.borderHex} transform transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between group/card cursor-pointer select-none`}
              title="Klik untuk memilih bingkai ini"
            >
              {/* Top Header with Brand & Event Name */}
              <div className={`text-center pt-0.5 pb-1 border-b ${dividerColor} flex-shrink-0`}>
                <div className="flex items-center justify-center gap-1 opacity-80 mb-0.5" style={{ color: card.textHex }}>
                  <span className="text-[6.5px] sm:text-[7.5px] font-mono font-black tracking-widest">N</span>
                  <span className="text-[6px] opacity-40">|</span>
                  <span className="text-[6.5px] sm:text-[7.5px] font-sans font-semibold">sirklenice</span>
                </div>
                <p 
                  style={{ color: card.textHex }}
                  className="text-[6px] sm:text-[7px] font-serif font-bold uppercase tracking-widest opacity-85"
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

              {/* Center Photo Slots */}
              <div className="relative flex-1 my-1.5 w-full flex flex-col gap-1.5 min-h-0 justify-center">
                {Array.from({ length: card.slots }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="w-full flex-1 rounded-md sm:rounded-lg overflow-hidden relative bg-black/20 shadow-inner group-hover/card:scale-[1.01] transition-transform"
                  >
                    <img 
                      src={eventPhotos[idx % eventPhotos.length]} 
                      alt={`Pose ${idx + 1}`}
                      draggable={false}
                      className="w-full h-full object-cover object-center filter brightness-[0.95] contrast-[1.02] pointer-events-none select-none"
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
