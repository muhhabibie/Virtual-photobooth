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
  },
  {
    id: 9,
    name: 'Pasadena Botanical',
    colorHex: '#FFFFFF',
    textHex: '#2B2826',
    borderHex: 'border-[#C4A482]/40',
    slots: 3
  }
];

export default function Marquee() {
  const { openBooth, activeEvent, setStripColor } = useBooth();
  const trackRef = useRef(null);
  const containerRef = useRef(null);

  // Quadruple duplicated list for 100% seamless, uninterrupted infinite sliding
  const duplicated = [...FRAME_PREVIEWS, ...FRAME_PREVIEWS, ...FRAME_PREVIEWS, ...FRAME_PREVIEWS];

  const isWedding = (activeEvent?.eventType || 'wedding') === 'wedding';
  const bride = activeEvent?.brideName;
  const groom = activeEvent?.groomName;
  const coupleName = (bride && groom) ? `${groom} & ${bride}` : (activeEvent?.displayName || 'Sabrina & Raka');
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
          const isLight = card.colorHex === '#FDFBF7' || card.colorHex === '#F3C5CB' || card.colorHex === '#FFFFFF';
          const botanicalColor = isLight ? '#B89F88' : card.textHex;

          return (
            <div
              key={`${card.id}-${i}`}
              onClick={() => {
                // If user dragged more than 6px, ignore click so it only acts as swipe
                if (dragDistanceRef.current < 6) {
                  if (setStripColor) setStripColor(card.colorHex);
                  openBooth();
                }
              }}
              style={{ backgroundColor: card.colorHex }}
              className={`relative flex-shrink-0 w-44 xs:w-48 sm:w-52 h-auto min-h-[520px] xs:min-h-[550px] sm:min-h-[590px] rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-xl border ${card.borderHex} transform transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group/card cursor-pointer select-none overflow-hidden`}
              title="Klik untuk memilih bingkai ini"
            >
              {/* Top-Left Botanical Vine Branch (Matching Master Photostrip Style) */}
              <svg 
                className="absolute top-0 left-0 w-12 sm:w-16 h-36 sm:h-44 pointer-events-none opacity-45 z-0" 
                viewBox="0 0 60 160" 
                fill="none" 
                stroke={botanicalColor} 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Main trailing stem */}
                <path d="M 12,0 C 22,25 28,55 18,90 C 8,125 15,145 10,160" />
                {/* Secondary delicate branch */}
                <path d="M 22,42 C 36,60 42,85 36,110" />
                {/* Botanical leaves with central veins */}
                <path d="M 14,14 C 20,13 26,17 28,24 C 22,27 16,23 14,14 Z" />
                <path d="M 14,14 L 26,22" />
                <path d="M 17,28 C 11,26 6,31 4,37 C 10,40 16,36 17,28 Z" />
                <path d="M 17,28 L 5,36" />
                <path d="M 25,48 C 34,46 41,52 44,60 C 36,63 29,59 25,48 Z" />
                <path d="M 25,48 L 42,58" />
                <path d="M 37,75 C 47,75 53,83 55,92 C 46,94 40,88 37,75 Z" />
                <path d="M 37,75 L 53,90" />
                <path d="M 37,98 C 45,102 48,110 47,118 C 40,118 36,110 37,98 Z" />
                <path d="M 37,98 L 46,116" />
                <path d="M 20,70 C 13,72 8,80 7,88 C 14,89 19,81 20,70 Z" />
                <path d="M 20,70 L 8,87" />
                <path d="M 15,105 C 22,108 26,116 26,124 C 19,125 15,117 15,105 Z" />
                <path d="M 15,105 L 25,122" />
                <path d="M 11,135 C 6,138 4,146 5,153 C 11,152 13,145 11,135 Z" />
                <path d="M 11,135 L 5,151" />
              </svg>

              {/* Bottom-Right Botanical Floral Blossom & Sprigs (Matching Master Photostrip Style) */}
              <svg 
                className="absolute bottom-1 right-1 w-16 sm:w-20 h-16 sm:h-20 pointer-events-none opacity-45 z-0" 
                viewBox="0 0 80 80" 
                fill="none" 
                stroke={botanicalColor} 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Upward sprig stems trailing along footer */}
                <path d="M 52,48 C 50,30 58,16 54,2" />
                <path d="M 52,28 C 42,20 38,10 40,0" />
                {/* Sprig leaves with central veins */}
                <path d="M 54,16 C 62,13 68,17 70,24 C 63,26 57,22 54,16 Z" />
                <path d="M 54,16 L 68,23" />
                <path d="M 43,20 C 35,17 30,21 28,27 C 35,29 40,26 43,20 Z" />
                <path d="M 43,20 L 29,26" />
                <path d="M 58,62 C 65,65 70,72 68,78 C 61,77 58,70 58,62 Z" />
                <path d="M 58,62 L 67,76" />
                {/* Center blossom pistil & stamen */}
                <circle cx="52" cy="52" r="3.5" />
                <circle cx="52" cy="46" r="1" fill={botanicalColor} />
                <circle cx="57" cy="49" r="1" fill={botanicalColor} />
                <circle cx="56" cy="56" r="1" fill={botanicalColor} />
                <circle cx="50" cy="58" r="1" fill={botanicalColor} />
                <circle cx="46" cy="53" r="1" fill={botanicalColor} />
                <circle cx="47" cy="47" r="1" fill={botanicalColor} />
                {/* Outer sculpted petals with texture folds */}
                <path d="M 44,45 C 42,33 52,28 60,33 C 63,42 56,47 48,46" />
                <path d="M 58,45 C 68,42 74,49 71,58 C 63,61 58,55 57,51" />
                <path d="M 57,56 C 63,65 59,73 50,72 C 45,66 48,59 52,57" />
                <path d="M 47,57 C 39,63 32,58 35,49 C 41,45 46,50 48,55" />
                <path d="M 46,47 C 38,44 38,34 47,34 C 52,38 50,44 47,47" />
                {/* Delicate petal vein accents */}
                <path d="M 52,43 L 52,35" />
                <path d="M 57,50 L 64,48" />
                <path d="M 54,56 L 55,63" />
                <path d="M 47,53 L 41,56" />
                <path d="M 48,47 L 43,41" />
              </svg>

              {/* Top Header with Brand & Event Name (Matching stripRenderer.js) */}
              <div className="text-center pt-0.5 pb-1 flex-shrink-0 z-10">
                <div className="flex items-center justify-center gap-1 opacity-80 mb-0.5" style={{ color: card.textHex }}>
                  <span className="text-[10px] sm:text-[11px] font-mono font-black tracking-widest">N</span>
                  <span className="text-[9px] sm:text-[10px] opacity-40">|</span>
                  <span className="text-[11px] sm:text-[12px] font-semibold italic tracking-[0.12em]" style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}>sirklenice</span>
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
              <div className="relative my-auto w-full flex flex-col gap-1.5 sm:gap-2 justify-center z-10 py-1">
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

              {/* Bottom Section: Matching Image 2 Professional Wedding Layout */}
              <div className="text-center pt-1.5 sm:pt-2 pb-1 flex-shrink-0 flex flex-col items-center w-full z-10">
                {/* Prefix label removed */}

                {/* Main Script Name (Image 2 style) */}
                <h4 
                  className="text-base sm:text-lg font-normal leading-tight my-0.5 px-1 truncate max-w-full"
                  style={{ 
                    color: card.textHex,
                    fontFamily: "'Great Vibes', 'Alex Brush', cursive",
                    textShadow: '0 1px 6px rgba(0,0,0,0.08)'
                  }}
                >
                  {isWedding ? coupleName : 'Nama Tamu'}
                </h4>

                {/* Event Badge */}
                <span 
                  className="text-[6.5px] sm:text-[7.5px] font-black tracking-[0.24em] uppercase leading-tight opacity-90"
                  style={{ color: card.textHex, fontFamily: "'Cinzel', Georgia, serif" }}
                >
                  {isWedding ? 'WEDDING' : (activeEvent?.eventName || 'EVENT').toUpperCase()}
                </span>

                {/* Divider Line with Center Diamond Accent */}
                <div className="flex items-center justify-center gap-1 my-0.5 w-14 sm:w-16" style={{ color: isLight ? '#B89F88' : card.textHex }}>
                  <div className="flex-1 h-[1px] opacity-50 bg-current" />
                  <div className="w-1.5 h-1.5 rotate-45 opacity-80 bg-current flex-shrink-0" />
                  <div className="flex-1 h-[1px] opacity-50 bg-current" />
                </div>

                {/* Date */}
                <span className="text-[6.5px] sm:text-[7.5px] font-mono font-bold tracking-wider opacity-85 block leading-tight" style={{ color: card.textHex }}>
                  {activeEvent?.slug === 'cfd' ? '15 - 11 - 2026' : (activeEvent?.eventDate ? activeEvent.eventDate.split('-').reverse().join(' - ') : '15 - 11 - 2026')}
                </span>

                {/* Venue */}
                <span className="text-[5.5px] sm:text-[6.5px] font-sans font-bold uppercase tracking-widest opacity-80 block leading-tight mt-0.5" style={{ color: card.textHex }}>
                  {activeEvent?.venue || 'IDJEN BOULEVARD'}
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
