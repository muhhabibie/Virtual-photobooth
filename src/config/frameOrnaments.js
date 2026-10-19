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
// Sized and scaled 100% proportionally to match the Wendy & Mark reference photostrip
export function drawStripBotanicals(ctx, w, h, color = '#B89F88', scale = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.7 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = scale; // base unit scale (where 1 unit = 1px on 600x1800 canvas)

  // Helper to draw an organic pointed botanical leaf with center vein
  const drawLeaf = (x, y, angle, length, width) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(length * 0.35, -width * 0.72, length * 0.75, -width * 0.58, length, 0);
    ctx.bezierCurveTo(length * 0.75, width * 0.58, length * 0.35, width * 0.72, 0, 0);
    ctx.stroke();
    // Center vein
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length * 0.88, 0);
    ctx.stroke();
    ctx.restore();
  };

  // ================= 🌿 1. TOP-LEFT BOTANICAL VINE BRANCH (Ref: Wendy & Mark) 🌿 =================
  // Main trailing branch curving from top edge down along Photo 1 (spanning ~400px at scale 1)
  ctx.beginPath();
  ctx.moveTo(20 * s, 0);
  ctx.bezierCurveTo(42 * s, 40 * s, 52 * s, 95 * s, 32 * s, 155 * s);
  ctx.bezierCurveTo(14 * s, 210 * s, 25 * s, 275 * s, 16 * s, 340 * s);
  ctx.bezierCurveTo(10 * s, 380 * s, 18 * s, 415 * s, 12 * s, 450 * s);
  ctx.stroke();

  // Secondary delicate offshoot stem
  ctx.beginPath();
  ctx.moveTo(40 * s, 70 * s);
  ctx.bezierCurveTo(68 * s, 100 * s, 78 * s, 140 * s, 70 * s, 180 * s);
  ctx.stroke();

  // Top-left leaves along the branch (exact placement as reference)
  const topLeaves = [
    { x: 25 * s, y: 22 * s, angle: 0.35, len: 28 * s, w: 11 * s },
    { x: 38 * s, y: 50 * s, angle: -0.65, len: 32 * s, w: 12.5 * s },
    { x: 46 * s, y: 85 * s, angle: 0.85, len: 30 * s, w: 12 * s },
    { x: 68 * s, y: 120 * s, angle: 0.45, len: 28 * s, w: 11 * s },
    { x: 72 * s, y: 165 * s, angle: 1.15, len: 26 * s, w: 10 * s },
    { x: 32 * s, y: 140 * s, angle: -0.80, len: 30 * s, w: 12 * s },
    { x: 18 * s, y: 195 * s, angle: 0.70, len: 28 * s, w: 11 * s },
    { x: 23 * s, y: 250 * s, angle: -0.55, len: 27 * s, w: 10.5 * s },
    { x: 18 * s, y: 310 * s, angle: 0.60, len: 25 * s, w: 10 * s },
    { x: 14 * s, y: 370 * s, angle: -0.45, len: 22 * s, w: 9 * s },
    { x: 13 * s, y: 430 * s, angle: 0.40, len: 20 * s, w: 8 * s },
  ];
  topLeaves.forEach(lf => drawLeaf(lf.x, lf.y, lf.angle, lf.len, lf.w));

  // ================= 🌸 2. BOTTOM-RIGHT FLORAL & BOTANICAL BLOOM (Ref: Wendy & Mark) 🌸 =================
  // Reusable helper to draw the detailed open botanical flower blossom (Magnolia / Wild Rose)
  const drawFlowerBlossom = (cx, cy, scaleMult = 1) => {
    // Outer layer of 5 rounded petals with delicate folds
    const petalCount = 5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i * Math.PI * 2) / petalCount - 0.25;
      const px = cx + Math.cos(angle) * (28 * s * scaleMult);
      const py = cy + Math.sin(angle) * (28 * s * scaleMult);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.scale(scaleMult, scaleMult);
      ctx.beginPath();
      ctx.moveTo(-18 * s, -15 * s);
      ctx.bezierCurveTo(-7 * s, -30 * s, 7 * s, -30 * s, 18 * s, -15 * s);
      ctx.bezierCurveTo(26 * s, 9 * s, -26 * s, 9 * s, -18 * s, -15 * s);
      ctx.stroke();
      // Inner petal texture lines
      ctx.beginPath();
      ctx.moveTo(0, -24 * s);
      ctx.lineTo(0, -7 * s);
      ctx.stroke();
      ctx.restore();
    }

    // Inner layer of 4 overlapping petals
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4 + 0.35;
      const px = cx + Math.cos(angle) * (15 * s * scaleMult);
      const py = cy + Math.sin(angle) * (15 * s * scaleMult);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);
      ctx.scale(scaleMult, scaleMult);
      ctx.beginPath();
      ctx.moveTo(-11 * s, -11 * s);
      ctx.bezierCurveTo(-3 * s, -20 * s, 3 * s, -20 * s, 11 * s, -11 * s);
      ctx.bezierCurveTo(14 * s, 5 * s, -14 * s, 5 * s, -11 * s, -11 * s);
      ctx.stroke();
      ctx.restore();
    }

    // Flower Pistil / Stamen center
    ctx.beginPath();
    ctx.arc(cx, cy, 7 * s * scaleMult, 0, Math.PI * 2);
    ctx.stroke();
    for (let a = 0; a < Math.PI * 2; a += 0.8) {
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * (10 * s * scaleMult), cy + Math.sin(a) * (10 * s * scaleMult), 1.3 * s * scaleMult, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const isPolaroid = h < 1000 * s;

  if (isPolaroid) {
    // Polaroid Mode: Fit beautifully in the bottom-right footer chin
    const fx = w - 74 * s;
    const fy = h - 85 * s;

    // Upward delicate stem towards guest message
    ctx.beginPath();
    ctx.moveTo(fx, fy - 18 * s);
    ctx.bezierCurveTo(w - 55 * s, fy - 55 * s, w - 38 * s, fy - 95 * s, w - 46 * s, fy - 140 * s);
    ctx.stroke();

    // Downward stem towards bottom edge
    ctx.beginPath();
    ctx.moveTo(fx + 8 * s, fy + 18 * s);
    ctx.bezierCurveTo(w - 52 * s, h - 50 * s, w - 42 * s, h - 28 * s, w - 22 * s, h - 12 * s);
    ctx.stroke();

    // Leaves for Polaroid
    const polLeaves = [
      { x: w - 54 * s, y: fy - 45 * s, angle: -0.65, len: 20 * s, w: 8 * s },
      { x: w - 40 * s, y: fy - 85 * s, angle: 0.45, len: 18 * s, w: 7 * s },
      { x: w - 46 * s, y: fy - 130 * s, angle: -0.5, len: 16 * s, w: 6.5 * s },
      { x: w - 48 * s, y: h - 45 * s, angle: 0.85, len: 18 * s, w: 7.5 * s },
      { x: w - 28 * s, y: h - 20 * s, angle: 0.60, len: 16 * s, w: 6.5 * s },
    ];
    polLeaves.forEach(lf => drawLeaf(lf.x, lf.y, lf.angle, lf.len, lf.w));

    drawFlowerBlossom(fx, fy, 0.68);
    ctx.restore();
    return;
  }

  // Standard Strip Mode: Exact Wendy & Mark reference placement
  // Main flower center position (situated in the lower right footer area beside Pasadena, CA)
  const fx = w - 135 * s;
  const fy = h - 315 * s;

  // Stems trailing UPWARDS into the names & divider area
  ctx.beginPath();
  ctx.moveTo(fx + 22 * s, fy - 28 * s);
  ctx.bezierCurveTo(w - 78 * s, fy - 115 * s, w - 52 * s, fy - 220 * s, w - 88 * s, fy - 325 * s);
  ctx.stroke();

  // Secondary upward stem branch
  ctx.beginPath();
  ctx.moveTo(w - 72 * s, fy - 170 * s);
  ctx.bezierCurveTo(w - 42 * s, fy - 230 * s, w - 46 * s, fy - 285 * s, w - 78 * s, fy - 350 * s);
  ctx.stroke();

  // Stems trailing DOWNWARDS to bottom-right corner
  ctx.beginPath();
  ctx.moveTo(fx + 12 * s, fy + 38 * s);
  ctx.bezierCurveTo(w - 92 * s, h - 230 * s, w - 68 * s, h - 145 * s, w - 35 * s, h - 35 * s);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w - 82 * s, h - 190 * s);
  ctx.bezierCurveTo(w - 115 * s, h - 135 * s, w - 105 * s, h - 75 * s, w - 72 * s, h - 18 * s);
  ctx.stroke();

  // Leaves along the upward stem (reaching beside Date, Divider, and "WENDY & MARK")
  const upLeaves = [
    { x: w - 90 * s, y: fy - 65 * s, angle: -0.65, len: 34 * s, w: 13 * s },
    { x: w - 65 * s, y: fy - 130 * s, angle: 0.45, len: 32 * s, w: 12 * s },
    { x: w - 58 * s, y: fy - 190 * s, angle: -0.85, len: 36 * s, w: 14 * s },  // Beside Date
    { x: w - 44 * s, y: fy - 250 * s, angle: 0.35, len: 32 * s, w: 12.5 * s }, // Beside Divider
    { x: w - 62 * s, y: fy - 295 * s, angle: -0.75, len: 30 * s, w: 11.5 * s }, // Beside Names
    { x: w - 78 * s, y: fy - 345 * s, angle: -0.40, len: 26 * s, w: 10 * s },   // Top tip beside names
  ];
  upLeaves.forEach(lf => drawLeaf(lf.x, lf.y, lf.angle, lf.len, lf.w));

  // Leaves along the downward stem towards bottom corner
  const downLeaves = [
    { x: w - 100 * s, y: h - 250 * s, angle: 2.1, len: 32 * s, w: 13 * s },
    { x: w - 75 * s, y: h - 190 * s, angle: 0.85, len: 36 * s, w: 14 * s },
    { x: w - 110 * s, y: h - 145 * s, angle: 2.3, len: 30 * s, w: 12 * s },
    { x: w - 62 * s, y: h - 105 * s, angle: 0.95, len: 32 * s, w: 13 * s },
    { x: w - 85 * s, y: h - 60 * s, angle: 2.1, len: 28 * s, w: 11 * s },
    { x: w - 46 * s, y: h - 42 * s, angle: 0.70, len: 24 * s, w: 9.5 * s },
  ];
  downLeaves.forEach(lf => drawLeaf(lf.x, lf.y, lf.angle, lf.len, lf.w));

  drawFlowerBlossom(fx, fy, 1.0);

  ctx.restore();
}

