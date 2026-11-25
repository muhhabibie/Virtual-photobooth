import { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { renderMasterPhotoStrip, renderBotanicalWeddingStrip } from '../../utils/stripRenderer';
import { MITUFAYA_FRAMES, getEventGraphicFrames, getCachedFrameImage } from '../../data/eventFrames';

const MAX_CACHE_ENTRIES = 120;
const thumbnailCache = new Map(); // cacheKey -> objectUrl or dataUrl
const thumbnailInFlight = new Map(); // cacheKey -> Promise<string | null>

function setCachedThumbnail(key, url) {
  if (!key || !url) return;
  if (thumbnailCache.size >= MAX_CACHE_ENTRIES && !thumbnailCache.has(key)) {
    const oldestKey = thumbnailCache.keys().next().value;
    const oldestUrl = thumbnailCache.get(oldestKey);
    thumbnailCache.delete(oldestKey);
    if (typeof oldestUrl === 'string' && oldestUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(oldestUrl);
      } catch (_) {}
    }
  }
  thumbnailCache.set(key, url);
}

function loadImageWithFallback(url) {
  return new Promise((resolve) => {
    if (!url) return resolve({ img: null, tainted: false });

    let settled = false;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };

    const timer = setTimeout(() => finish({ img: null, tainted: false }), 7000);

    const load = (useCors) => {
      const img = new Image();
      if (useCors && url.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => {
        clearTimeout(timer);
        finish({ img, tainted: !useCors && url.startsWith('http') });
      };
      img.onerror = () => {
        if (useCors && url.startsWith('http')) {
          load(false);
        } else {
          clearTimeout(timer);
          finish({ img: null, tainted: false });
        }
      };
      img.src = url;
    };

    load(true);
  });
}

async function ensureGraphicOverlayLoaded(graphicId, activeEvent) {
  const targetId = graphicId || activeEvent?.selectedGraphicFrameId;
  if (!targetId) return;
  const allFrames = [...MITUFAYA_FRAMES, ...getEventGraphicFrames(activeEvent)];
  const gFrame = allFrames.find((f) => f.id === targetId);
  if (!gFrame?.overlayUrl) return;
  const overlayImg = getCachedFrameImage(gFrame.overlayUrl);
  // Only await if browser hasn't completed fetching yet (avoid hanging when complete with naturalWidth === 0)
  if (overlayImg && !overlayImg.complete) {
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 4000);
      const done = () => {
        clearTimeout(timer);
        resolve();
      };
      overlayImg.addEventListener('load', done, { once: true });
      overlayImg.addEventListener('error', done, { once: true });
    });
  }
}

function buildThumbnailCacheKey(item, photosList, activeEvent) {
  const photosSig = photosList
    .map((p) => {
      const s = typeof p === 'string' ? p : (p?.dataUrl || '');
      return s.length > 64 ? `${s.length}:${s.slice(0, 24)}:${s.slice(-24)}` : s;
    })
    .join('|');
  return [
    item?.id || '',
    photosSig,
    item?.colorHex || item?.stripColor || '#FFFFFF',
    item?.stripStyle || 'standard',
    item?.graphicFrameId || activeEvent?.selectedGraphicFrameId || '',
    item?.guestName || '',
    item?.message || item?.guestMessage || '',
    activeEvent?.slug || '',
    activeEvent?.displayName || '',
  ].join('::');
}

async function renderThumbnailToUrl(item, photosList, activeEvent) {
  const [loadedResults] = await Promise.all([
    Promise.all(
      photosList.map((src) => {
        const url = typeof src === 'string' ? src : (src?.dataUrl || '');
        return loadImageWithFallback(url);
      })
    ),
    ensureGraphicOverlayLoaded(item.graphicFrameId, activeEvent),
  ]);

  const validEntries = loadedResults.filter((r) => r.img);
  if (validEntries.length === 0) {
    if (item.stripImage && item.stripImage.length > 1000) {
      return { url: item.stripImage, tainted: false, validPhotos: [] };
    }
    return { url: null, tainted: false, validPhotos: [] };
  }

  const validPhotos = validEntries.map((r) => ({
    canvas: r.img,
    dataUrl: r.img.src,
  }));
  const isTainted = validEntries.some((r) => r.tainted);

  const offCanvas = document.createElement('canvas');
  if (item.stripStyle === 'botanical-wedding') {
    renderBotanicalWeddingStrip(offCanvas, {
      photos: validPhotos,
      targetCount: validPhotos.length,
      guestName: item.guestName,
      guestMessage: item.message || item.guestMessage,
      activeEvent,
      scale: 0.75,
    });
  } else {
    renderMasterPhotoStrip(offCanvas, {
      photos: validPhotos,
      targetCount: validPhotos.length,
      stripColor: item.colorHex || item.stripColor || '#FFFFFF',
      guestName: item.guestName,
      guestMessage: item.message || item.guestMessage,
      activeEvent,
      graphicFrameId: item.graphicFrameId || null,
      scale: 0.75,
    });
  }

  if (isTainted) {
    return { url: null, tainted: true, validPhotos, offCanvas };
  }

  try {
    const blob = await new Promise((resolve) => offCanvas.toBlob(resolve, 'image/jpeg', 0.88));
    if (blob) {
      return { url: URL.createObjectURL(blob), tainted: false, validPhotos };
    }
    const dataUrl = offCanvas.toDataURL('image/jpeg', 0.88);
    return { url: dataUrl, tainted: false, validPhotos };
  } catch {
    return { url: null, tainted: true, validPhotos, offCanvas };
  }
}

export default function PhotostripThumbnail({
  item,
  activeEvent,
  className = '',
  onClick,
  showVoiceBadge = true,
  deferRender = false,
}) {
  const canvasRef = useRef(null);

  const photosList = item
    ? (Array.isArray(item.photos) && item.photos.length > 0
      ? item.photos
      : (item.photo ? [item.photo] : []))
    : [];

  const cacheKey = item ? buildThumbnailCacheKey(item, photosList, activeEvent) : '';

  const [renderedSrc, setRenderedSrc] = useState(() => {
    if (!item) return null;
    if (cacheKey && thumbnailCache.has(cacheKey)) {
      return thumbnailCache.get(cacheKey);
    }
    if (photosList.length === 0 && item.stripImage && item.stripImage.length > 1000) {
      return item.stripImage;
    }
    return null;
  });
  const [taintedReady, setTaintedReady] = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);

  useEffect(() => {
    if (!item) return;

    if (cacheKey && thumbnailCache.has(cacheKey)) {
      setRenderedSrc(thumbnailCache.get(cacheKey));
      setRenderFailed(false);
      return;
    }

    if (photosList.length === 0) {
      if (item.stripImage && item.stripImage.length > 1000) {
        setRenderedSrc(item.stripImage);
      } else {
        setRenderFailed(true);
      }
      return;
    }

    if (deferRender) return;

    let isMounted = true;
    setTaintedReady(false);
    setRenderFailed(false);

    let renderPromise = thumbnailInFlight.get(cacheKey);
    if (!renderPromise) {
      renderPromise = renderThumbnailToUrl(item, photosList, activeEvent)
        .then((res) => {
          if (res?.url) {
            setCachedThumbnail(cacheKey, res.url);
          }
          return res;
        })
        .finally(() => {
          thumbnailInFlight.delete(cacheKey);
        });
      thumbnailInFlight.set(cacheKey, renderPromise);
    }

    renderPromise.then((res) => {
      if (!isMounted) return;
      if (res?.url) {
        setRenderedSrc(res.url);
      } else if (res?.tainted && res.offCanvas && canvasRef.current) {
        const dest = canvasRef.current;
        dest.width = res.offCanvas.width;
        dest.height = res.offCanvas.height;
        const dCtx = dest.getContext('2d');
        dCtx?.drawImage(res.offCanvas, 0, 0);
        setTaintedReady(true);
      } else {
        setRenderFailed(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cacheKey, deferRender]);

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
          loading="eager"
          decoding="async"
        />
      ) : (
        <div
          className={`w-full ${taintedReady ? '' : 'aspect-[1/2.2]'} bg-[#1a0f14] flex items-center justify-center relative overflow-hidden`}
        >
          {!taintedReady && !renderFailed && (
            <div className="absolute inset-0 bg-gradient-to-b from-[#24101A] via-[#170B11] to-[#24101A] animate-pulse pointer-events-none" />
          )}
          {renderFailed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-xs font-serif text-[#F5D77F]/80 font-semibold line-clamp-2">
                {item.guestName || 'Kenangan Tamu'}
              </span>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`w-full h-auto object-contain group-hover:scale-[1.02] transition-transform duration-300 ${
              taintedReady ? 'block' : 'hidden'
            }`}
          />
        </div>
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
