import JSZip from 'jszip';

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
 * Export all wedding photo submissions into a structured ZIP file
 * Format Penamaan: [Nama Pengunjung]_[Nama Pengantin]
 * Contoh: Haris_Sabrina & Raka.jpg
 */
export async function exportEventSubmissionsZip({ event, submissions = [], onProgress = () => {} }) {
  const zip = new JSZip();

  const coupleName = sanitizeFilename(event?.displayName) || 'Pengantin';
  const eventFolder = zip.folder(`Foto_${coupleName}`);

  // Collect all valid photo entries
  const itemsToProcess = submissions.length > 0 ? submissions : [];

  if (itemsToProcess.length === 0) {
    throw new Error('Belum ada foto yang tersimpan untuk diunduh.');
  }

  onProgress({ current: 0, total: itemsToProcess.length, message: 'Menyiapkan file foto...' });

  const nameOccurrences = new Map();
  const guestWishes = [];
  let photoCount = 0;

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
      message: `Mengompres foto dari ${cleanGuest}...`
    });

    // 1. Process Photos
    const photosList = Array.isArray(item.photos) && item.photos.length > 0
      ? item.photos
      : (item.photo ? [item.photo] : []);

    for (let pIdx = 0; pIdx < photosList.length; pIdx++) {
      const photoUrl = photosList[pIdx];
      const binary = await getAssetBinary(photoUrl);

      if (binary) {
        photoCount++;
        const photoFilename = photosList.length === 1
          ? `${baseFilename}.jpg`
          : `${baseFilename}_${pIdx + 1}.jpg`;

        eventFolder.file(photoFilename, binary);
      }
    }

    // 2. Process Voice Note (if any)
    if (item.voiceUrl || item.voiceBlob) {
      try {
        const voiceBinary = await getAssetBinary(item.voiceUrl);
        if (voiceBinary) {
          eventFolder.file(`${baseFilename}_voice.webm`, voiceBinary);
        }
      } catch (err) {
        console.warn("Gagal mengekspor audio:", err);
      }
    }

    // 3. Collect wishes for digital guestbook log
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
