/**
 * Shared media export & Web Share API utilities for Photobooth strips and videos.
 */

export function sanitizeShareFilename(str, fallback = 'photobooth') {
  const clean = (str || '')
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_');
  return clean || fallback;
}

export function triggerFileDownload(blobOrUrl, filename) {
  let objectUrl = null;
  let href = blobOrUrl;

  if (blobOrUrl instanceof Blob) {
    objectUrl = URL.createObjectURL(blobOrUrl);
    href = objectUrl;
  }

  if (!href) return false;

  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (objectUrl) {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
  }
  return true;
}

export const SOCIAL_CARD_SPECS = {
  feed: { width: 1080, height: 1350, suffix: 'ig_feed_4x5', label: 'Instagram Feed (4:5)' },
  story: { width: 1080, height: 1920, suffix: 'story_9x16', label: 'Story IG & Status WA (9:16)' },
  raw: { suffix: 'photostrip', label: 'Foto Strip Asli' },
};

function drawRoundedRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Wraps any photo strip canvas inside a social-ready 4:5 (Instagram Feed)
 * or 9:16 (IG Story / WA Status) editorial card so platforms never crop photos.
 */
export function renderSocialCardCanvas(
  photoCanvas,
  {
    format = 'story',
    coupleName = '',
    eventName = '',
    guestName = '',
  } = {}
) {
  if (!photoCanvas || format === 'raw' || !SOCIAL_CARD_SPECS[format]?.width) {
    return photoCanvas;
  }

  const { width, height } = SOCIAL_CARD_SPECS[format];
  const isFeed = format === 'feed';

  const cardCanvas = document.createElement('canvas');
  cardCanvas.width = width;
  cardCanvas.height = height;
  const ctx = cardCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Luxury dark burgundy-plum base gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#12070D');
  bgGrad.addColorStop(0.5, '#220B19');
  bgGrad.addColorStop(1, '#10050B');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Cross-browser ambient blurred backdrop (downscale + upscale works on iOS Safari too)
  const blurBuffer = document.createElement('canvas');
  blurBuffer.width = 36;
  blurBuffer.height = 64;
  const bCtx = blurBuffer.getContext('2d');
  bCtx.imageSmoothingEnabled = true;
  bCtx.drawImage(photoCanvas, 0, 0, blurBuffer.width, blurBuffer.height);

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.drawImage(blurBuffer, -80, -80, width + 160, height + 160);
  ctx.restore();

  // 3. Soft radial gold glow + edge vignette
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.45,
    40,
    width / 2,
    height * 0.5,
    width * 0.85
  );
  radialGlow.addColorStop(0, 'rgba(245, 215, 127, 0.14)');
  radialGlow.addColorStop(1, 'rgba(8, 2, 6, 0.52)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 4. Minimal top header (avoid duplicate title)
  const cleanEvent = (eventName || '').trim();
  const cleanCouple = (coupleName || '').trim();
  const hasHeader = Boolean(cleanEvent || cleanCouple);
  const isDuplicateHeader = !cleanEvent || cleanEvent.toLowerCase() === cleanCouple.toLowerCase();

  if (hasHeader) {
    ctx.textAlign = 'center';
    if (!isDuplicateHeader) {
      ctx.save();
      ctx.fillStyle = 'rgba(196, 164, 108, 0.9)';
      ctx.font = `600 ${isFeed ? 15 : 18}px "Cinzel", "Playfair Display", Georgia, serif`;
      ctx.fillText(cleanEvent.toUpperCase(), width / 2, isFeed ? 52 : 84);
      ctx.restore();

      ctx.fillStyle = '#F5D77F';
      ctx.font = `700 ${isFeed ? 28 : 34}px "Playfair Display", Georgia, serif`;
      ctx.fillText(cleanCouple, width / 2, isFeed ? 88 : 128);
    } else {
      ctx.fillStyle = '#F5D77F';
      ctx.font = `700 ${isFeed ? 28 : 34}px "Playfair Display", Georgia, serif`;
      ctx.fillText(cleanCouple || cleanEvent, width / 2, isFeed ? 74 : 112);
    }
  }

  // 5. Crisp centered photo strip inside safe area (100% uncropped)
  const topSafeY = hasHeader ? (isFeed ? 116 : 168) : (isFeed ? 48 : 96);
  const cleanGuest = (guestName || '').trim();
  const bottomSafeY = height - (cleanGuest ? (isFeed ? 68 : 112) : (isFeed ? 48 : 96));
  const maxStripHeight = bottomSafeY - topSafeY;
  const maxStripWidth = isFeed ? 930 : 860;
  const stripRatio = photoCanvas.width / photoCanvas.height;

  let drawW = maxStripHeight * stripRatio;
  let drawH = maxStripHeight;
  if (drawW > maxStripWidth) {
    drawW = maxStripWidth;
    drawH = maxStripWidth / stripRatio;
  }

  const drawX = Math.round((width - drawW) / 2);
  const drawY = Math.round(topSafeY + (maxStripHeight - drawH) / 2);
  const cornerRadius = 22;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 16;
  drawRoundedRectPath(ctx, drawX, drawY, drawW, drawH, cornerRadius);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.clip();
  ctx.drawImage(photoCanvas, drawX, drawY, drawW, drawH);
  ctx.restore();

  ctx.save();
  drawRoundedRectPath(ctx, drawX, drawY, drawW, drawH, cornerRadius);
  ctx.strokeStyle = 'rgba(245, 215, 127, 0.35)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // 6. Subtle bottom guest signature
  if (cleanGuest) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245, 215, 127, 0.72)';
    ctx.font = `500 ${isFeed ? 16 : 19}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(cleanGuest, width / 2, height - (isFeed ? 28 : 54));
  }

  return cardCanvas;
}

export async function createSocialShareJpegFile(
  stripCanvas,
  {
    format = 'raw',
    filenamePrefix = 'photobooth',
    coupleName = '',
    eventName = '',
    guestName = '',
    quality = 0.95,
  } = {}
) {
  const targetCanvas =
    format === 'raw'
      ? stripCanvas
      : renderSocialCardCanvas(stripCanvas, { format, coupleName, eventName, guestName });

  const suffix = SOCIAL_CARD_SPECS[format]?.suffix || 'photostrip';
  const filename = `${sanitizeShareFilename(filenamePrefix)}_${suffix}.jpg`;
  return canvasToJpegFile(targetCanvas, filename, quality);
}

export async function canvasToJpegFile(canvas, filename, quality = 0.95) {
  if (!canvas) throw new Error('Canvas belum tersedia.');
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Gagal mengonversi foto ke JPG.');
  return new File([blob], filename, { type: 'image/jpeg' });
}

export function videoBlobToShareFile(blob, filenamePrefix, extension = 'mp4') {
  if (!blob) throw new Error('File video belum tersedia.');
  const ext = extension || (blob.type?.includes('webm') ? 'webm' : 'mp4');
  // Clean MIME type without codec parameters for maximum OS Share Sheet compatibility
  const cleanMime = ext === 'webm' ? 'video/webm' : 'video/mp4';
  const filename = `${sanitizeShareFilename(filenamePrefix)}_story.${ext}`;
  return new File([blob], filename, { type: cleanMime });
}

export function canNativeShareFile(file) {
  if (typeof navigator === 'undefined' || !file) return false;
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') {
    return false;
  }
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * Shares a File via the device's native Share Sheet (WhatsApp, IG Stories, TikTok, etc.).
 * Handles user cancellation, Safari gesture-expiry (`NotAllowedError`), and desktop download fallback.
 */
export async function shareFileNativeOrFallback({ file, title, text }) {
  if (!file) throw new Error('File tidak tersedia untuk dibagikan.');

  if (canNativeShareFile(file)) {
    try {
      await navigator.share({
        files: [file],
        title: title || 'Photo Strip',
        text: text || '',
      });
      return { status: 'shared' };
    } catch (err) {
      if (err?.name === 'AbortError') {
        return { status: 'cancelled' };
      }
      if (err?.name === 'NotAllowedError') {
        return { status: 'needs_gesture', file };
      }
      // Other runtime errors fall through to safe file download
    }
  }

  triggerFileDownload(file, file.name);
  return { status: 'fallback_downloaded', file };
}

export function openWhatsAppLinkShare({ text, url }) {
  const fullText = [text, url].filter(Boolean).join(' ').trim();
  const waUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}
