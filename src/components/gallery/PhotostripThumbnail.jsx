import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { renderMasterPhotoStrip } from '../../utils/stripRenderer';

export default function PhotostripThumbnail({ 
  item, 
  activeEvent, 
  className = "", 
  onClick, 
  showVoiceBadge = true 
}) {
  const canvasRef = useRef(null);
  const [renderedSrc, setRenderedSrc] = useState(item?.stripImage || null);

  useEffect(() => {
    if (!item) return;

    if (item.stripImage) {
      setRenderedSrc(item.stripImage);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const photosList = Array.isArray(item.photos) && item.photos.length > 0
      ? item.photos
      : (item.photo ? [item.photo] : []);

    if (photosList.length === 0) return;

    let isMounted = true;

    Promise.all(
      photosList.map((src) => {
        return new Promise((resolve) => {
          if (!src) return resolve(null);
          const url = typeof src === 'string' ? src : (src?.dataUrl || '');
          if (!url) return resolve(null);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        });
      })
    ).then((loadedImgs) => {
      if (!isMounted || !canvasRef.current) return;
      const validPhotos = loadedImgs.filter(Boolean).map((img) => ({
        canvas: img,
        dataUrl: img.src,
      }));

      if (validPhotos.length === 0) return;

      renderMasterPhotoStrip(canvasRef.current, {
        photos: validPhotos,
        targetCount: validPhotos.length,
        stripColor: item.colorHex || item.stripColor || '#6B111F',
        guestName: item.guestName,
        guestMessage: item.message || item.guestMessage,
        activeEvent: activeEvent,
        scale: 1.5,
      });

      try {
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.88);
        if (isMounted) setRenderedSrc(dataUrl);
      } catch (e) {
        // Fallback: canvas stays displayed directly
      }
    });

    return () => {
      isMounted = false;
    };
  }, [item, activeEvent]);

  if (!item) return null;

  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden group rounded-2xl shadow-xl transition-all duration-300 ${className}`}
    >
      {renderedSrc ? (
        <img
          src={renderedSrc}
          alt={`Photo strip ${item.guestName || 'Tamu'}`}
          className="w-full h-auto object-contain block group-hover:scale-[1.02] transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-auto object-contain block group-hover:scale-[1.02] transition-transform duration-300"
        />
      )}

      {/* Voice Badge overlay if submission has audio note */}
      {showVoiceBadge && (item.hasVoice || item.voiceUrl) && (
        <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[#F5D77F] border border-[#F5D77F]/40 text-[8px] sm:text-[9px] font-mono flex items-center gap-1 shadow-lg z-20 pointer-events-none">
          <Volume2 size={10} className="animate-pulse" />
          <span>Doa</span>
        </span>
      )}
    </div>
  );
}
