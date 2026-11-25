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
