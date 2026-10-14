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
  },
  // ================= 📏 DECORATIVE DIVIDER LINES (GARIS PEMBATAS) 📏 =================
  {
    id: 'divider-luxury-gem',
    name: 'Garis Permata',
    category: 'divider',
    defaultScale: 1.8,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.04;
      ctx.lineCap = 'round';

      const w = size * 1.5;
      const centerGap = size * 0.26;

      // Left horizontal line
      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.lineTo(-centerGap, 0);
      ctx.stroke();

      // Right horizontal line
      ctx.beginPath();
      ctx.moveTo(centerGap, 0);
      ctx.lineTo(w, 0);
      ctx.stroke();

      // Flanking dots
      ctx.beginPath();
      ctx.arc(-centerGap * 0.65, 0, size * 0.045, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerGap * 0.65, 0, size * 0.045, 0, Math.PI * 2);
      ctx.fill();

      // Center diamond gem
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.18);
      ctx.lineTo(size * 0.15, 0);
      ctx.lineTo(0, size * 0.18);
      ctx.lineTo(-size * 0.15, 0);
      ctx.closePath();
      ctx.fill();

      // Inner jewel highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.045, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'divider-floral-vine',
    name: 'Garis Ranting Daun',
    category: 'divider',
    defaultScale: 1.8,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.038;
      ctx.lineCap = 'round';

      const w = size * 1.5;

      // Central stem
      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.lineTo(w, 0);
      ctx.stroke();

      // Leaves along the stem
      const leafCount = 6;
      for (let i = 1; i <= leafCount; i++) {
        const factor = i / (leafCount + 1);
        const lx = -w + factor * (w * 2);
        if (Math.abs(lx) < size * 0.25) continue; // Keep center clear for bloom
        const isUp = i % 2 === 0;
        const ly = isUp ? -size * 0.04 : size * 0.04;
        const angle = isUp ? -0.4 : 0.4;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.1, size * 0.045, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Center flower bud / accent
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.09, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.035, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'divider-calligraphy',
    name: 'Garis Kaligrafi',
    category: 'divider',
    defaultScale: 1.8,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.045;
      ctx.lineCap = 'round';

      const w = size * 1.45;

      // Left flourish wave
      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.bezierCurveTo(-w * 0.65, -size * 0.22, -w * 0.35, size * 0.22, -size * 0.12, 0);
      ctx.stroke();

      // Right flourish wave
      ctx.beginPath();
      ctx.moveTo(size * 0.12, 0);
      ctx.bezierCurveTo(w * 0.35, -size * 0.22, w * 0.65, size * 0.22, w, 0);
      ctx.stroke();

      // Center romantic heart
      ctx.beginPath();
      const hs = size * 0.22;
      ctx.moveTo(0, hs * 0.35);
      ctx.bezierCurveTo(-hs * 0.7, -hs * 0.3, -hs * 0.7, -hs * 0.9, 0, -hs * 0.55);
      ctx.bezierCurveTo(hs * 0.7, -hs * 0.9, hs * 0.7, -hs * 0.3, 0, hs * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'divider-double-line',
    name: 'Garis Ganda Bintang',
    category: 'divider',
    defaultScale: 1.8,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = size * 0.035;
      ctx.lineCap = 'round';

      const w = size * 1.5;
      const gapY = size * 0.06;
      const centerGap = size * 0.22;

      // Top line
      ctx.beginPath();
      ctx.moveTo(-w, -gapY);
      ctx.lineTo(-centerGap, -gapY);
      ctx.moveTo(centerGap, -gapY);
      ctx.lineTo(w, -gapY);
      ctx.stroke();

      // Bottom line (slightly shorter for luxury stationery feel)
      ctx.lineWidth = size * 0.022;
      ctx.beginPath();
      ctx.moveTo(-w * 0.85, gapY);
      ctx.lineTo(-centerGap, gapY);
      ctx.moveTo(centerGap, gapY);
      ctx.lineTo(w * 0.85, gapY);
      ctx.stroke();

      // Center luxury 4-point star
      ctx.beginPath();
      const sr = size * 0.15;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * sr, Math.sin(a) * sr);
        const aInner = a + Math.PI / 4;
        ctx.lineTo(Math.cos(aInner) * (sr * 0.28), Math.sin(aInner) * (sr * 0.28));
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },
  {
    id: 'divider-dotted-pearl',
    name: 'Garis Mutiara',
    category: 'divider',
    defaultScale: 1.8,
    render: (ctx, x, y, size, color) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = color;

      const w = size * 1.45;
      const count = 13;
      const step = (w * 2) / (count - 1);

      for (let i = 0; i < count; i++) {
        const dx = -w + i * step;
        const distRatio = Math.abs(dx) / w; // 0 (center) to 1 (edges)
        const r = size * (0.085 - distRatio * 0.045);
        ctx.beginPath();
        ctx.arc(dx, 0, Math.max(size * 0.025, r), 0, Math.PI * 2);
        ctx.fill();
      }

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

// Quick helper to render a single preset ornament onto a preview canvas
export function renderOrnamentToCanvas(canvas, presetId, color = '#F5D77F', size = 32) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const preset = PRESET_ORNAMENTS.find(p => p.id === presetId);
  if (preset && typeof preset.render === 'function') {
    const isDivider = preset.category === 'divider';
    const renderSize = isDivider ? size * 0.72 : size;
    preset.render(ctx, canvas.width / 2, canvas.height / 2, renderSize, color);
  }
}

// Dedicated Reference Botanical Corner Line Art (Top-Left Vine Branch & Bottom-Right Blossom)
export function drawStripBotanicals(ctx, w, h, color = '#C4A482', scale = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.35 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // --- Top-Left Botanical Vine Branch ---
  ctx.beginPath();
  ctx.moveTo(6 * scale, 6 * scale);
  ctx.bezierCurveTo(24 * scale, 16 * scale, 32 * scale, 38 * scale, 16 * scale, 75 * scale);
  ctx.bezierCurveTo(8 * scale, 100 * scale, 18 * scale, 130 * scale, 12 * scale, 165 * scale);
  ctx.stroke();

  // Top-left Leaves along branch
  const topLeaves = [
    { x: 16 * scale, y: 20 * scale, angle: 0.35, len: 14 * scale, w: 6 * scale },
    { x: 28 * scale, y: 35 * scale, angle: -0.55, len: 16 * scale, w: 7 * scale },
    { x: 24 * scale, y: 55 * scale, angle: 0.85, len: 15 * scale, w: 6.5 * scale },
    { x: 14 * scale, y: 88 * scale, angle: -0.65, len: 16 * scale, w: 7 * scale },
    { x: 16 * scale, y: 115 * scale, angle: 0.75, len: 14 * scale, w: 6 * scale },
    { x: 13 * scale, y: 145 * scale, angle: -0.45, len: 13 * scale, w: 5.5 * scale },
  ];
  topLeaves.forEach(lf => {
    ctx.save();
    ctx.translate(lf.x, lf.y);
    ctx.rotate(lf.angle);
    ctx.beginPath();
    ctx.ellipse(lf.len / 2, 0, lf.len / 2, lf.w / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(lf.len * 0.8, 0);
    ctx.stroke();
    ctx.restore();
  });

  // --- Bottom-Right Botanical Floral Bloom ---
  const bx = w - 8 * scale;
  const by = h - 8 * scale;

  // Stems reaching up into footer area
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.bezierCurveTo(bx - 28 * scale, by - 35 * scale, bx - 55 * scale, by - 75 * scale, bx - 45 * scale, by - 110 * scale);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bx - 18 * scale, by - 28 * scale);
  ctx.bezierCurveTo(bx - 42 * scale, by - 40 * scale, bx - 75 * scale, by - 50 * scale, bx - 98 * scale, by - 58 * scale);
  ctx.stroke();

  // Flower blossom center at (bx - 45 * scale, by - 110 * scale)
  const fx = bx - 45 * scale;
  const fy = by - 110 * scale;
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - 0.3;
    const px = fx + Math.cos(angle) * (13 * scale);
    const py = fy + Math.sin(angle) * (13 * scale);
    ctx.beginPath();
    ctx.ellipse(px, py, 11 * scale, 6.5 * scale, angle, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(fx, fy, 3.5 * scale, 0, Math.PI * 2);
  ctx.stroke();

  // Bottom-right Leaves
  const botLeaves = [
    { x: bx - 14 * scale, y: by - 16 * scale, angle: -1.2, len: 17 * scale, w: 7.5 * scale },
    { x: bx - 35 * scale, y: by - 38 * scale, angle: -2.1, len: 19 * scale, w: 8 * scale },
    { x: bx - 65 * scale, y: by - 48 * scale, angle: -2.6, len: 17 * scale, w: 7 * scale },
    { x: bx - 42 * scale, y: by - 70 * scale, angle: -0.9, len: 15 * scale, w: 6.5 * scale },
    { x: bx - 50 * scale, y: by - 90 * scale, angle: -1.8, len: 14 * scale, w: 6 * scale },
  ];
  botLeaves.forEach(lf => {
    ctx.save();
    ctx.translate(lf.x, lf.y);
    ctx.rotate(lf.angle);
    ctx.beginPath();
    ctx.ellipse(lf.len / 2, 0, lf.len / 2, lf.w / 2, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(lf.len * 0.8, 0);
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();
}

