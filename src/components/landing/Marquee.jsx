import { useRef, useState, useEffect, useCallback } from 'react';
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
    slots: 3
  },
  {
    id: 3,
    name: 'Slate Modern',
    colorHex: '#2D3748',
    textHex: '#E2E8F0',
    borderHex: 'border-white/20',
    slots: 3
  },
  {
    id: 4,
    name: 'Blush Romance',
    colorHex: '#F3C5CB',
    textHex: '#6B111F',
    borderHex: 'border-[#6B111F]/25',
    slots: 3
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
    slots: 3
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
    slots: 3
  }
];

export default function Marquee() {
  const { openBooth, activeEvent } = useBooth();
  const trackRef = useRef(null);
  const containerRef = useRef(null);

  // Quadruple duplicated list for 100% seamless, uninterrupted infinite sliding
  const duplicated = [...FRAME_PREVIEWS, ...FRAME_PREVIEWS, ...FRAME_PREVIEWS, ...FRAME_PREVIEWS];

  const isWedding = (activeEvent?.eventType || 'wedding') === 'wedding';
  const eventTitle = activeEvent?.displayName || 'Car Free Day Malang';
  const eventDate = activeEvent?.formattedDate || '15 November 2026';
  const eventPhotos = (activeEvent?.heroPhotos && activeEvent.heroPhotos.length > 0)
    ? activeEvent.heroPhotos
    : DEFAULT_HERO_PHOTOS;

  // Real-time Gesture & Motion Coordinates
  const currentXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const singleSetWidthRef = useRef(0);
  const [isHovered, setIsHovered] = useState(false);

  // Measure single set width for seamless infinite modulo wrapping
  const updateMetrics = useCallback(() => {
    if (trackRef.current) {
      singleSetWidthRef.current = trackRef.current.scrollWidth / 4;
    }
  }, []);

  useEffect(() => {
    updateMetrics();
    window.addEventListener('resize', updateMetrics);
    return () => window.removeEventListener('resize', updateMetrics);
  }, [updateMetrics]);

  // CONTINUOUS SLIDING FROM RIGHT TO LEFT (Infinite Smooth Hardware-Accelerated Marquee)
  useEffect(() => {
    let animId;

    const animate = (time) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      // Auto-slide to the left continuously when NOT actively dragged by hand/mouse
      if (!isDraggingRef.current && trackRef.current) {
        // Continuous sliding speed: 50px/sec (slows down to 22px/sec on desktop hover for easy reading)
        const speed = isHovered ? 22 : 50;
        currentXRef.current -= speed * dt;

        // Wrap around seamlessly without any visual jumps
        const setWidth = singleSetWidthRef.current || (trackRef.current.scrollWidth / 4);
        if (setWidth > 0) {
          while (currentXRef.current <= -setWidth * 2) {
            currentXRef.current += setWidth;
          }
          while (currentXRef.current > -setWidth) {
            currentXRef.current -= setWidth;
          }
        }

        trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  // TOUCH SWIPE (MOBILE) & MOUSE DRAG (LAPTOP) HANDLERS
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    dragDistanceRef.current = 0;
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    startXRef.current = e.clientX;
    dragDistanceRef.current += Math.abs(deltaX);

    currentXRef.current += deltaX;

    // Wrap around while dragging so user can swipe infinitely in either direction
    const setWidth = singleSetWidthRef.current || (trackRef.current ? trackRef.current.scrollWidth / 4 : 0);
    if (setWidth > 0) {
      while (currentXRef.current <= -setWidth * 2) {
        currentXRef.current += setWidth;
      }
      while (currentXRef.current > -setWidth) {
        currentXRef.current -= setWidth;
      }
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    lastTimeRef.current = performance.now();
  };

  // Step scroll buttons for Laptop users
  const handleStepScroll = (direction) => {
    const shift = direction === 'left' ? 260 : -260;
    currentXRef.current += shift;
    const setWidth = singleSetWidthRef.current || (trackRef.current ? trackRef.current.scrollWidth / 4 : 0);
    if (setWidth > 0) {
      while (currentXRef.current <= -setWidth * 2) {
        currentXRef.current += setWidth;
      }
      while (currentXRef.current > -setWidth) {
        currentXRef.current -= setWidth;
      }
    }
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      trackRef.current.style.transform = `translate3d(${currentXRef.current}px, 0, 0)`;
      setTimeout(() => {
        if (trackRef.current) trackRef.current.style.transition = '';
      }, 400);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden py-3 select-none group cursor-grab active:cursor-grabbing touch-pan-y"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handlePointerUp();
      }}
    >
      {/* Edge Gradient Voids for luxury aesthetic */}
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Navigation Chevrons for Laptop / Desktop */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleStepScroll('left');
        }}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-stone-800 shadow-xl border border-stone-200/80 items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer active:scale-95"
        title="Geser Kiri"
      >
        <ChevronLeft size={20} className="text-[#6B111F]" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleStepScroll('right');
        }}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-stone-800 shadow-xl border border-stone-200/80 items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 cursor-pointer active:scale-95"
        title="Geser Kanan"
      >
        <ChevronRight size={20} className="text-[#6B111F]" />
      </button>

      {/* Infinite Hardware-Accelerated Sliding Track (Always moving right to left + 100% swipeable) */}
      <div
        ref={trackRef}
        className="flex items-center gap-4 py-2 px-4 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {duplicated.map((card, i) => {
          const isLight = card.colorHex === '#FDFBF7' || card.colorHex === '#F3C5CB';
          const dividerColor = isLight ? 'border-[#6B111F]/20' : 'border-white/15';

          return (
            <div
              key={`${card.id}-${i}`}
              onClick={() => {
                // If user dragged more than 6px, ignore click so it only acts as swipe
                if (dragDistanceRef.current < 6) {
                  openBooth();
                }
              }}
              style={{ backgroundColor: card.colorHex }}
              className={`relative flex-shrink-0 w-44 xs:w-48 sm:w-56 h-[440px] xs:h-[470px] sm:h-[510px] rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-xl border ${card.borderHex} transform transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group/card cursor-pointer select-none overflow-hidden`}
              title="Klik untuk memilih bingkai ini"
            >
              {/* Subtle Vector Botanical Corner Accents */}
              <svg className="absolute -top-1 -left-1 w-8 sm:w-10 h-16 sm:h-20 pointer-events-none opacity-40 z-0" viewBox="0 0 50 80" fill="none" stroke={card.textHex} strokeWidth="1.2" strokeLinecap="round">
                <path d="M 5,0 Q 15,25 8,45 Q 3,60 5,75" />
                <path d="M 6,10 Q 18,12 16,5 Q 12,3 6,10" />
                <path d="M 10,22 Q 22,25 20,18 Q 15,16 10,22" />
                <path d="M 8,36 Q 20,40 18,32 Q 13,30 8,36" />
                <path d="M 6,52 Q 16,58 15,50 Q 10,48 6,52" />
              </svg>

              <svg className="absolute -bottom-1 -right-1 w-8 sm:w-10 h-8 sm:h-10 pointer-events-none opacity-40 z-0" viewBox="0 0 50 50" fill="none" stroke={card.textHex} strokeWidth="1.2">
                <circle cx="32" cy="32" r="4.5" />
                <path d="M 32,27 C 32,20 38,20 38,27 C 38,32 32,32 32,27 Z" />
                <path d="M 37,32 C 44,32 44,38 37,38 C 32,38 32,32 37,32 Z" />
                <path d="M 32,37 C 32,44 26,44 26,37 C 26,32 32,32 32,37 Z" />
                <path d="M 27,32 C 20,32 20,26 27,26 C 32,26 32,32 27,32 Z" />
              </svg>

              {/* Top Header with Brand & Event Name (Matching stripRenderer.js) */}
              <div className="text-center pt-0.5 pb-1 flex-shrink-0 z-10">
                <div className="flex items-center justify-center gap-1 opacity-80 mb-0.5" style={{ color: card.textHex }}>
                  <span className="text-[7px] sm:text-[8px] font-mono font-black tracking-widest">N</span>
                  <span className="text-[6.5px] sm:text-[7.5px] opacity-40">|</span>
                  <span className="text-[6.5px] sm:text-[7.5px] font-sans font-semibold">sirklenice</span>
                </div>
                <h3 
                  style={{ 
                    color: card.textHex,
                    fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" 
                  }}
                  className="text-[8.5px] sm:text-[10px] font-bold uppercase tracking-[0.14em] leading-tight truncate px-1"
                >
                  {activeEvent?.slug === 'cfd' ? 'Car Free Day Malang' : (activeEvent?.eventName || activeEvent?.displayName || eventTitle)}
                </h3>
              </div>

              {/* Center Photo Slots (Standard 3-pose photostrip with authentic 4:3 HP capture aspect ratio & mat border) */}
              <div className="relative my-auto w-full flex flex-col gap-1.5 sm:gap-2 justify-center z-10">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="w-full aspect-[4/3] rounded-md sm:rounded-lg overflow-hidden relative shadow-xs p-0.5"
                    style={{ backgroundColor: isLight ? '#B89F88' : 'rgba(255,255,255,0.22)' }}
                  >
                    <div className="w-full h-full rounded-[4px] sm:rounded-[6px] overflow-hidden bg-black/20">
                      <img 
                        src={eventPhotos[idx % eventPhotos.length] || DEFAULT_HERO_PHOTOS[idx % DEFAULT_HERO_PHOTOS.length]} 
                        alt={`Pose ${idx + 1}`}
                        draggable={false}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_HERO_PHOTOS[idx % DEFAULT_HERO_PHOTOS.length] || DEFAULT_HERO_PHOTOS[0];
                        }}
                        className="w-full h-full object-cover object-center filter brightness-[0.97] contrast-[1.02] pointer-events-none select-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Section: Nama Tamu, Divider with Diamond, Date, Venue, Quote & Theme Name */}
              <div className="text-center pt-1 pb-0.5 flex-shrink-0 flex flex-col items-center w-full z-10">
                {/* Guest Name */}
                <strong 
                  className="text-[8px] sm:text-[9.5px] font-serif font-bold tracking-[0.14em] uppercase block leading-none"
                  style={{ 
                    color: card.textHex,
                    fontFamily: "'Playfair Display', 'Cinzel', Georgia, serif" 
                  }}
                >
                  NAMA TAMU
                </strong>

                {/* Divider Line with Center Diamond Accent */}
                <div className="flex items-center justify-center gap-1 my-0.5 sm:my-1 w-16 sm:w-20" style={{ color: card.textHex }}>
                  <div className="flex-1 h-[1px] opacity-40 bg-current" />
                  <div className="w-1.5 h-1.5 rotate-45 opacity-70 bg-current flex-shrink-0" />
                  <div className="flex-1 h-[1px] opacity-40 bg-current" />
                </div>

                {/* Date */}
                <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold tracking-wider opacity-85 block leading-tight" style={{ color: card.textHex }}>
                  {activeEvent?.slug === 'cfd' ? '15 - 11 - 2026' : (activeEvent?.eventDate ? activeEvent.eventDate.split('-').reverse().join(' - ') : '15 - 11 - 2026')}
                </span>

                {/* Venue */}
                <span className="text-[5.5px] sm:text-[6.5px] font-sans font-bold uppercase tracking-widest opacity-80 block leading-tight mt-0.5" style={{ color: card.textHex }}>
                  {activeEvent?.venue || 'IDJEN BOULEVARD'}
                </span>

                {/* Quote */}
                <span className="text-[5px] sm:text-[6px] font-serif italic opacity-75 block leading-tight mt-0.5" style={{ color: card.textHex }}>
                  “kata-kata hari ini”
                </span>

                {/* Theme Name Badge */}
                <div className="mt-1 px-2 py-0.5 rounded-full border border-current/25 text-[6px] sm:text-[7px] font-mono uppercase tracking-widest opacity-70" style={{ color: card.textHex }}>
                  {card.name}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
