import JSZip from 'jszip';
import { renderMasterPhotoStrip } from './stripRenderer';

/**
 * Sanitize strings for safe filesystem filenames across Windows, macOS, and Linux
 */
export function sanitizeFilename(str) {
  if (!str) return '';
  return str
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Convert Data URL (Base64) or remote HTTP URL into an ArrayBuffer / Uint8Array
 */
async function getAssetBinary(url) {
  if (!url) return null;

  // Case 1: Base64 Data URL
  if (url.startsWith('data:')) {
    const parts = url.split(',');
    const binaryStr = atob(parts[1]);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  }

  // Case 2: Remote URL (Firebase Storage / Unsplash / Web)
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    return new Uint8Array(buffer);
  } catch (err) {
    // Canvas fallback if remote CORS is restricted
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || 600;
          canvas.height = img.naturalHeight || 800;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) return resolve(null);
            const reader = new FileReader();
            reader.onloadend = () => {
              const resStr = reader.result;
              const b64 = resStr.split(',')[1];
              const bin = atob(b64);
              const u8 = new Uint8Array(bin.length);
              for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
              resolve(u8);
            };
            reader.readAsDataURL(blob);
          }, 'image/jpeg', 0.95);
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
}

/**
 * Render complete Photostrip canvas for a guest submission if not pre-rendered
 */
async function renderSubmissionStrip(item, event) {
  try {
    const photosList = Array.isArray(item.photos) && item.photos.length > 0
      ? item.photos
      : (item.photo ? [item.photo] : []);

    if (photosList.length === 0) return null;

    // Preload image elements to ensure canvas renders with actual pixels
    const loadedImgs = await Promise.all(
      photosList.map(src => {
        return new Promise((resolve) => {
          if (!src) return resolve(null);
          const url = typeof src === 'string' ? src : (src.dataUrl || src.canvas?.toDataURL?.() || '');
          if (!url) return resolve(null);
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        });
      })
    );

    const validPhotoObjects = loadedImgs
      .filter(Boolean)
      .map(img => ({ canvas: img, dataUrl: img.src }));

    if (validPhotoObjects.length === 0) return null;

    const canvas = document.createElement('canvas');
    renderMasterPhotoStrip(canvas, {
      photos: validPhotoObjects,
      targetCount: validPhotoObjects.length,
      stripColor: item.colorHex || item.stripColor || '#FFFFFF',
      guestName: item.guestName,
      guestMessage: item.message || item.guestMessage,
      activeEvent: event,
      scale: 2,
    });

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(() => resolve(null));
      }, 'image/jpeg', 0.95);
    });
  } catch (err) {
    console.warn('Failed to render strip for submission:', err);
    return null;
  }
}

/**
 * Export all wedding photo submissions into a structured ZIP file
 * Format Penamaan: [Nama Pengunjung]_[Nama Pengantin]
 * Berisi: Foto Strip Jadi (_STRIP.jpg) + Seluruh Foto Asli Pose (_Foto_X.jpg)
 */
export async function exportEventSubmissionsZip({ event, submissions = [], onProgress = () => {} }) {
  const zip = new JSZip();

  const coupleName = sanitizeFilename(event?.displayName) || 'Pengantin';
  const eventFolder = zip.folder(`Foto_${coupleName}`);
  const stripFolder = eventFolder.folder('Strip_Photobooth');
  const individualFolder = eventFolder.folder('Foto_Individual');
  const audioFolder = eventFolder.folder('Rekaman_Suara');

  // Collect all valid photo entries
  const itemsToProcess = submissions.length > 0 ? submissions : [];

  if (itemsToProcess.length === 0) {
    throw new Error('Belum ada foto yang tersimpan untuk diunduh.');
  }

  onProgress({ current: 0, total: itemsToProcess.length, message: 'Menyiapkan file foto...' });

  const nameOccurrences = new Map();
  const guestWishes = [];
  let photoCount = 0;
  let stripCount = 0;

  for (let idx = 0; idx < itemsToProcess.length; idx++) {
    const item = itemsToProcess[idx];
    const rawGuest = item.guestName || `Tamu_${idx + 1}`;
    const cleanGuest = sanitizeFilename(rawGuest) || `Tamu_${idx + 1}`;

    // Manage duplicate guest names (e.g. Haris, Haris (2))
    const currentCount = nameOccurrences.get(cleanGuest) || 0;
    nameOccurrences.set(cleanGuest, currentCount + 1);

    const suffix = currentCount > 0 ? ` (${currentCount + 1})` : '';
    // Format wajib: Nama Pengunjung_Nama Pengantin
    const baseFilename = `${cleanGuest}${suffix}_${coupleName}`;

    onProgress({
      current: idx + 1,
      total: itemsToProcess.length,
      message: `Mengompres foto & strip dari ${cleanGuest}...`
    });

    // 1. Process Finished Photostrip (Hasil Strip Photobooth)
    let stripBinary = null;
    if (item.stripUrl || item.stripPhoto) {
      stripBinary = await getAssetBinary(item.stripUrl || item.stripPhoto);
    }
    if (!stripBinary) {
      stripBinary = await renderSubmissionStrip(item, event);
    }

    if (stripBinary) {
      stripCount++;
      const stripFilename = `${baseFilename}_STRIP.jpg`;
      stripFolder.file(stripFilename, stripBinary);
      eventFolder.file(stripFilename, stripBinary);
    }

    // 2. Process Individual Cut Photos (Foto-foto Pose Asli)
    const photosList = Array.isArray(item.photos) && item.photos.length > 0
      ? item.photos
      : (item.photo ? [item.photo] : []);

    for (let pIdx = 0; pIdx < photosList.length; pIdx++) {
      const photoItem = photosList[pIdx];
      const photoUrl = typeof photoItem === 'string' ? photoItem : (photoItem.dataUrl || photoItem.url || '');
      const binary = await getAssetBinary(photoUrl);

      if (binary) {
        photoCount++;
        const photoFilename = photosList.length === 1
          ? `${baseFilename}_Foto.jpg`
          : `${baseFilename}_Foto_${pIdx + 1}.jpg`;

        individualFolder.file(photoFilename, binary);
        eventFolder.file(photoFilename, binary);
      }
    }

    // 3. Process Voice Note (if any)
    if (item.voiceUrl || item.voiceBlob) {
      try {
        const voiceBinary = await getAssetBinary(item.voiceUrl);
        if (voiceBinary) {
          const voiceFilename = `${baseFilename}_voice.webm`;
          audioFolder.file(voiceFilename, voiceBinary);
          eventFolder.file(voiceFilename, voiceBinary);
        }
      } catch (err) {
        console.warn("Gagal mengekspor audio:", err);
      }
    }

    // 4. Collect wishes for digital guestbook log
    if (item.message && item.message.trim()) {
      guestWishes.push({
        name: cleanGuest,
        date: item.takenDate || item.shortDate || new Date().toLocaleDateString('id-ID'),
        message: item.message.trim(),
        hasVoice: !!(item.voiceUrl || item.voiceBlob)
      });
    }
  }

  // 4. Create Digital Guestbook Text Summary inside ZIP
  const recapLines = [
    '========================================================================',
    '       REKAP BUKU TAMU DIGITAL & VIRTUAL PHOTOBOOTH SIRKLEN PHOTO       ',
    '========================================================================',
    `Pernikahan   : ${event?.displayName || coupleName}`,
    `Tanggal Acara: ${event?.formattedDate || event?.eventDate || '-' }`,
    `Venue        : ${event?.venue || '-'}`,
    `Total Sesi   : ${itemsToProcess.length} Tamu`,
    `Total Foto   : ${photoCount} Foto`,
    `Website Acara: https://sirklenice.com/${event?.slug || ''}`,
    '========================================================================\n',
  ];

  if (guestWishes.length > 0) {
    recapLines.push('DAFTAR UCAPAN & DOA RESTU TAMU:\n');
    guestWishes.forEach((w, i) => {
      recapLines.push(`[${i + 1}] ${w.name} (${w.date})`);
      recapLines.push(`    "${w.message}"`);
      if (w.hasVoice) {
        recapLines.push(`    🎙️ Rekaman suara tersimpan: ${w.name}_${coupleName}_voice.webm`);
      }
      recapLines.push('------------------------------------------------------------------------');
    });
  } else {
    recapLines.push('Belum ada ucapan tertulis yang tersimpan.');
  }

  eventFolder.file(`Daftar_Doa_Restu_${coupleName}.txt`, recapLines.join('\n'));

  // 5. Generate Final ZIP Blob
  onProgress({ current: itemsToProcess.length, total: itemsToProcess.length, message: 'Menyusun file ZIP...' });

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });

  // 6. Trigger Browser Download
  const zipFilename = `Foto_Kenangan_${coupleName}.zip`;
  const blobUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);

  return {
    success: true,
    totalPhotos: photoCount,
    totalSubmissions: itemsToProcess.length,
    filename: zipFilename,
  };
}
