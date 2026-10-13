// Utility to compress and resize user-uploaded images to lightweight, crisp web JPEGs
// Prevents QuotaExceededError in LocalStorage & ensures instant loading across all devices

export function compressImage(sourceUrlOrBase64, maxDimension = 1280, quality = 0.84) {
  return new Promise((resolve) => {
    if (!sourceUrlOrBase64 || typeof sourceUrlOrBase64 !== 'string') {
      return resolve(sourceUrlOrBase64);
    }
    // External HTTP URLs don't need base64 compression
    if (sourceUrlOrBase64.startsWith('http://') || sourceUrlOrBase64.startsWith('https://')) {
      return resolve(sourceUrlOrBase64);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let w = img.naturalWidth || img.width || 1200;
      let h = img.naturalHeight || img.height || 800;

      if (w > maxDimension || h > maxDimension) {
        if (w >= h) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      try {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        resolve(sourceUrlOrBase64);
      }
    };
    img.onerror = () => resolve(sourceUrlOrBase64);
    img.src = sourceUrlOrBase64;
  });
}

// Utility to resize and optimize user-uploaded transparent ornament PNGs/stickers
export function compressOrnament(sourceUrlOrBase64, maxDimension = 500) {
  return new Promise((resolve) => {
    if (!sourceUrlOrBase64 || typeof sourceUrlOrBase64 !== 'string') {
      return resolve(sourceUrlOrBase64);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let w = img.naturalWidth || img.width || 500;
      let h = img.naturalHeight || img.height || 500;

      if (w > maxDimension || h > maxDimension) {
        if (w >= h) {
          h = Math.round((h * maxDimension) / w);
          w = maxDimension;
        } else {
          w = Math.round((w * maxDimension) / h);
          h = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      try {
        // Preserve PNG transparency so logos and stickers stay transparent
        const compressed = canvas.toDataURL('image/png');
        resolve(compressed);
      } catch (e) {
        resolve(sourceUrlOrBase64);
      }
    };
    img.onerror = () => resolve(sourceUrlOrBase64);
    img.src = sourceUrlOrBase64;
  });
}

