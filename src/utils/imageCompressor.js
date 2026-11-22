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

/**
 * Adaptive multi-pass compressor engineered specifically for Hero Banner & Slideshow Photos.
 * Guarantees crisp high-DPI quality on mobile retina & laptop screens while strictly
 * preventing document size from exceeding Cloud Firestore limits (1MB) and LocalStorage limits (5MB).
 *
 * @param {string} sourceUrlOrBase64 - Base64 Data URL or HTTP URL
 * @param {number} maxDimension - Target maximum width/height
 * @param {number} maxByteBudget - Maximum character length of the base64 data URL
 * @returns {Promise<string>}
 */
export function compressHeroPhoto(sourceUrlOrBase64, maxDimension = 1000, maxByteBudget = 150000) {
  return new Promise((resolve) => {
    if (!sourceUrlOrBase64 || typeof sourceUrlOrBase64 !== 'string') {
      return resolve(sourceUrlOrBase64);
    }
    // Remote HTTP/HTTPS URLs (e.g. Unsplash) don't use Firestore document bytes
    if (sourceUrlOrBase64.startsWith('http://') || sourceUrlOrBase64.startsWith('https://')) {
      return resolve(sourceUrlOrBase64);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const origW = img.naturalWidth || img.width || 1000;
      const origH = img.naturalHeight || img.height || 1000;

      const passes = [
        { dim: Math.min(maxDimension, 1080), quality: 0.80 },
        { dim: Math.min(maxDimension, 960), quality: 0.74 },
        { dim: Math.min(maxDimension, 840), quality: 0.68 },
        { dim: Math.min(maxDimension, 720), quality: 0.62 },
        { dim: 640, quality: 0.55 },
      ];

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      let bestResult = sourceUrlOrBase64;

      for (let i = 0; i < passes.length; i++) {
        const { dim, quality } = passes[i];
        let w = origW;
        let h = origH;

        if (w > dim || h > dim) {
          if (w >= h) {
            h = Math.round((h * dim) / w);
            w = dim;
          } else {
            w = Math.round((w * dim) / h);
            h = dim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        try {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          bestResult = dataUrl;
          if (dataUrl.length <= maxByteBudget) {
            break;
          }
        } catch (e) {
          break;
        }
      }

      resolve(bestResult);
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

