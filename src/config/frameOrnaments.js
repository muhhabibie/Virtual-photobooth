// Frame Ornaments & Vector Canvas Drawing System
// Supports both crisp vector canvas presets and user-uploaded transparent PNG/images

export const PRESET_ORNAMENTS = [
  {
    id: 'rings',
    name: 'Cincin Kawin',
    category: 'wedding',
    defaultScale: 1.0,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.09;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = size * 0.15;

      const r = size * 0.32;
      // Left Ring
      ctx.beginPath();
      ctx.arc(-r * 0.45, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Right Ring
      ctx.beginPath();
      ctx.arc(r * 0.45, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Diamond on right ring
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(r * 0.45, -r - size * 0.14);
      ctx.lineTo(r * 0.45 + size * 0.1, -r - size * 0.04);
      ctx.lineTo(r * 0.45, -r + size * 0.02);
      ctx.lineTo(r * 0.45 - size * 0.1, -r - size * 0.04);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'floral-corner',
    name: 'Bunga Sudut',
    category: 'floral',
    defaultScale: 1.1,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.05;

      // Central bloom
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        const px = Math.cos(angle) * (size * 0.22);
        const py = Math.sin(angle) * (size * 0.22);
        ctx.beginPath();
        ctx.arc(px, py, size * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Sprigs / Leaves
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(size * 0.2, 0);
      ctx.quadraticCurveTo(size * 0.45, -size * 0.2, size * 0.5, -size * 0.05);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, size * 0.2);
      ctx.quadraticCurveTo(-size * 0.2, size * 0.45, -size * 0.05, size * 0.5);
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: 'royal-crest',
    name: 'Mahkota Emas',
    category: 'luxury',
    defaultScale: 1.0,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.06;
      ctx.lineJoin = 'round';

      const w = size * 0.55;
      const h = size * 0.35;

      ctx.beginPath();
      ctx.moveTo(-w, h);
      ctx.lineTo(w, h);
      ctx.lineTo(w * 0.85, -h * 0.6);
      ctx.lineTo(w * 0.4, h * 0.1);
      ctx.lineTo(0, -h);
      ctx.lineTo(-w * 0.4, h * 0.1);
      ctx.lineTo(-w * 0.85, -h * 0.6);
      ctx.closePath();
      ctx.stroke();

      // Jewels
      const dots = [
        [0, -h - size * 0.06],
        [-w * 0.85, -h * 0.6 - size * 0.06],
        [w * 0.85, -h * 0.6 - size * 0.06],
      ];
      dots.forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, size * 0.06, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  },
  {
    id: 'ribbon',
    name: 'Pita Elegan',
    category: 'wedding',
    defaultScale: 1.0,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.07;
      ctx.lineCap = 'round';

      // Knot center
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Left loop
      ctx.beginPath();
      ctx.moveTo(-size * 0.1, 0);
      ctx.bezierCurveTo(-size * 0.4, -size * 0.35, -size * 0.55, -size * 0.1, -size * 0.45, size * 0.1);
      ctx.bezierCurveTo(-size * 0.35, size * 0.25, -size * 0.15, size * 0.1, -size * 0.1, 0);
      ctx.stroke();

      // Right loop
      ctx.beginPath();
      ctx.moveTo(size * 0.1, 0);
      ctx.bezierCurveTo(size * 0.4, -size * 0.35, size * 0.55, -size * 0.1, size * 0.45, size * 0.1);
      ctx.bezierCurveTo(size * 0.35, size * 0.25, size * 0.15, size * 0.1, size * 0.1, 0);
      ctx.stroke();

      // Tails
      ctx.beginPath();
      ctx.moveTo(-size * 0.08, size * 0.12);
      ctx.quadraticCurveTo(-size * 0.25, size * 0.35, -size * 0.35, size * 0.55);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(size * 0.08, size * 0.12);
      ctx.quadraticCurveTo(size * 0.25, size * 0.35, size * 0.35, size * 0.55);
      ctx.stroke();

      ctx.restore();
    }
  },
  {
    id: 'sparkles',
    name: 'Bintang Sparkle',
    category: 'festive',
    defaultScale: 1.0,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = color;

      // 4-point star generator
      const drawStar = (sx, sy, r) => {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
          const aInner = a + Math.PI / 4;
          ctx.lineTo(sx + Math.cos(aInner) * (r * 0.25), sy + Math.sin(aInner) * (r * 0.25));
        }
        ctx.closePath();
        ctx.fill();
      };

      drawStar(0, 0, size * 0.45);
      drawStar(size * 0.38, -size * 0.3, size * 0.22);
      drawStar(-size * 0.35, size * 0.28, size * 0.18);

      ctx.restore();
    }
  },
  {
    id: 'double-heart',
    name: 'Dua Hati',
    category: 'wedding',
    defaultScale: 1.0,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.06;

      const drawHeart = (hx, hy, s, fill = true) => {
        ctx.save();
        ctx.translate(hx, hy);
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s * 0.6, -s * 0.2, -s * 0.6, -s * 0.8, 0, -s * 0.5);
        ctx.bezierCurveTo(s * 0.6, -s * 0.8, s * 0.6, -s * 0.2, 0, s * 0.3);
        ctx.closePath();
        if (fill) ctx.fill();
        else ctx.stroke();
        ctx.restore();
      };

      drawHeart(-size * 0.18, 0, size * 0.5, true);
      drawHeart(size * 0.18, -size * 0.1, size * 0.42, false);

      ctx.restore();
    }
  },
  {
    id: 'olive-wreath',
    name: 'Daun Botani',
    category: 'floral',
    defaultScale: 1.0,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.05;

      // Stem arch
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.4, Math.PI * 0.6, Math.PI * 1.4);
      ctx.stroke();

      // Leaves along the stem
      for (let i = 0; i < 5; i++) {
        const angle = Math.PI * 0.7 + i * 0.15;
        const lx = Math.cos(angle) * (size * 0.4);
        const ly = Math.sin(angle) * (size * 0.4);

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle + Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(size * 0.1, 0, size * 0.1, size * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
    }
  },
  {
    id: 'flourish-baroque',
    name: 'Ukiran Klasik',
    category: 'luxury',
    defaultScale: 1.1,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.06;
      ctx.lineCap = 'round';

      // Left scroll
      ctx.beginPath();
      ctx.moveTo(-size * 0.45, 0);
      ctx.bezierCurveTo(-size * 0.3, -size * 0.25, -size * 0.1, size * 0.25, 0, 0);
      ctx.bezierCurveTo(size * 0.1, -size * 0.25, size * 0.3, size * 0.25, size * 0.45, 0);
      ctx.stroke();

      // Center diamond
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.12);
      ctx.lineTo(size * 0.08, 0);
      ctx.lineTo(0, size * 0.12);
      ctx.lineTo(-size * 0.08, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }
];

// Helper image cache for user-uploaded PNG ornaments on canvas
const imageCache = new Map();

export function getLoadedImage(src) {
  if (!src) return null;
  if (imageCache.has(src)) {
    return imageCache.get(src);
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  imageCache.set(src, img);
  return img;
}

// Master canvas renderer for drawing all ornaments onto any photostrip canvas
export function drawFrameOrnaments(ctx, canvasW, canvasH, ornaments = [], fallbackColor = '#F5D77F', scaleMultiplier = 1) {
  if (!ornaments || !Array.isArray(ornaments) || ornaments.length === 0) return;

  const baseUnit = Math.min(canvasW, canvasH) * 0.12 * scaleMultiplier;

  ornaments.forEach(item => {
    if (!item) return;
    const posX = (item.x ?? 0.5) * canvasW;
    const posY = (item.y ?? 0.5) * canvasH;
    const itemScale = item.scale || 1.0;
    const itemSize = baseUnit * itemScale;
    const itemColor = item.color || fallbackColor;
    const rotation = (item.rotation || 0) * (Math.PI / 180);

    ctx.save();

    if (item.type === 'image' && item.src) {
      // User-uploaded PNG / sticker image
      ctx.translate(posX, posY);
      if (rotation) ctx.rotate(rotation);

      const img = getLoadedImage(item.src);
      if (img && img.complete && img.naturalWidth) {
        const aspect = img.naturalWidth / img.naturalHeight;
        let drawW = itemSize * 1.6;
        let drawH = drawW / aspect;
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      }
    } else {
      // Vector preset
      const preset = PRESET_ORNAMENTS.find(p => p.id === (item.presetId || item.id));
      if (preset && typeof preset.render === 'function') {
        if (rotation) {
          ctx.translate(posX, posY);
          ctx.rotate(rotation);
          preset.render(ctx, 0, 0, itemSize, itemColor);
        } else {
          preset.render(ctx, posX, posY, itemSize, itemColor);
        }
      }
    }

    ctx.restore();
  });
}

// Quick helper to render a single preset ornament onto a small preview canvas
export function renderOrnamentToCanvas(canvas, presetId, color = '#F5D77F', size = 32) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const preset = PRESET_ORNAMENTS.find(p => p.id === presetId);
  if (preset && typeof preset.render === 'function') {
    preset.render(ctx, canvas.width / 2, canvas.height / 2, size, color);
  }
}
