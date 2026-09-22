/**
 * AR Accessories & Crown Filters for Photobooth with Real-Time Face Mesh Tracking
 * 
 * Supports:
 * - 👑 Royal Wedding Crown (Attached to forehead top, scales & rotates with head tilt)
 * - 🌸 Romantic Floral Tiara (Attached to hairline arch)
 * - 🕶️ Luxury Gold Sunglasses (Attached to eye line & bridge)
 * - ✨ Celestial Angel Halo (Floating dynamically above head)
 * - 🎀 Burgundy Pearl Ribbon (Attached to upper head)
 * - 💖 Heart & Sparkles Aura (Floating around face perimeter)
 * - 🐱 Diamond Cat Ears (Attached to top corners of head with cheek blush)
 */

export const AR_ACCESSORIES = [
  {
    id: 'none',
    name: 'Natural',
    icon: '✨',
    category: 'basic',
    description: 'Tanpa aksesoris AR'
  },
  {
    id: 'royal-crown',
    name: 'Royal Crown',
    icon: '👑',
    category: 'crown',
    description: 'Mahkota Emas Pengantin Mewah'
  },
  {
    id: 'floral-tiara',
    name: 'Floral Tiara',
    icon: '🌸',
    category: 'crown',
    description: 'Mahkota Bunga Mawar & Sakura'
  },
  {
    id: 'gold-glasses',
    name: 'Gold Shades',
    icon: '🕶️',
    category: 'glasses',
    description: 'Kacamata Pesta Elegan Emas'
  },
  {
    id: 'angel-halo',
    name: 'Star Halo',
    icon: '⭐',
    category: 'halo',
    description: 'Halo Bintang & Kilau Malaikat'
  },
  {
    id: 'pearl-ribbon',
    name: 'Pearl Ribbon',
    icon: '🎀',
    category: 'headwear',
    description: 'Pita Beludru & Mutiara Vintage'
  },
  {
    id: 'heart-aura',
    name: 'Heart Aura',
    icon: '💖',
    category: 'aura',
    description: 'Kelap-kelip Hati & Cinta'
  },
  {
    id: 'cat-ears',
    name: 'Cat Ears',
    icon: '🐱',
    category: 'cute',
    description: 'Telinga Kucing Gold & Blush Pipi'
  }
];

/**
 * Convert normalized MediaPipe landmark to mirrored canvas coordinate
 */
export function mapLandmarkToCanvas(landmark, canvasW, canvasH, videoW, videoH) {
  const vw = videoW || 640;
  const vh = videoH || 480;

  // Object-fit: cover scaling
  const scale = Math.max(canvasW / vw, canvasH / vh);
  const offsetX = (canvasW - vw * scale) / 2;
  const offsetY = (canvasH - vh * scale) / 2;

  // Mirrored horizontal position for selfie camera
  const pixelX = (1 - landmark.x) * vw;
  const pixelY = landmark.y * vh;

  return {
    x: pixelX * scale + offsetX,
    y: pixelY * scale + offsetY,
    z: (landmark.z || 0) * scale,
  };
}

/**
 * Draw 4-point diamond sparkle
 */
function drawSparkle(ctx, cx, cy, radius, color = '#FFF') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const x1 = cx + Math.cos(angle) * radius;
    const y1 = cy + Math.sin(angle) * radius;
    const x2 = cx + Math.cos(angle + Math.PI / 4) * (radius * 0.28);
    const y2 = cy + Math.sin(angle + Math.PI / 4) * (radius * 0.28);
    if (i === 0) ctx.moveTo(x1, y1);
    else ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw heart shape
 */
function drawHeart(ctx, x, y, size, color = '#FF69B4', rotation = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size / 30, size / 30);
  ctx.fillStyle = color;
  ctx.shadowColor = 'rgba(255, 105, 180, 0.6)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-15, -15, -25, 5, 0, 25);
  ctx.bezierCurveTo(25, 5, 15, -15, 0, 0);
  ctx.fill();
  ctx.restore();
}

/**
 * Draw AR accessory attached to a single detected face with realistic human proportions
 */
export function drawAccessoryOnFace(ctx, canvasW, canvasH, landmarks, videoW, videoH, accessoryId) {
  if (!landmarks || landmarks.length < 468) return;

  // Key Face Landmarks:
  // 10: Forehead top / hairline center
  // 152: Chin tip
  // 33: Eye outer (MediaPipe raw left) -> On mirrored canvas: Right eye outer
  // 263: Eye outer (MediaPipe raw right) -> On mirrored canvas: Left eye outer
  // 168: Between eyes / nose root (bridge of glasses)
  // 345 & 116: Left & Right cheekbones

  const ptForehead = mapLandmarkToCanvas(landmarks[10], canvasW, canvasH, videoW, videoH);
  const ptChin = mapLandmarkToCanvas(landmarks[152], canvasW, canvasH, videoW, videoH);
  const ptEyeL = mapLandmarkToCanvas(landmarks[263], canvasW, canvasH, videoW, videoH);
  const ptEyeR = mapLandmarkToCanvas(landmarks[33], canvasW, canvasH, videoW, videoH);
  const ptNoseRoot = mapLandmarkToCanvas(landmarks[168], canvasW, canvasH, videoW, videoH);
  const ptCheekL = mapLandmarkToCanvas(landmarks[345], canvasW, canvasH, videoW, videoH);
  const ptCheekR = mapLandmarkToCanvas(landmarks[116], canvasW, canvasH, videoW, videoH);

  // Calculate face geometry
  const eyeDx = ptEyeR.x - ptEyeL.x;
  const eyeDy = ptEyeR.y - ptEyeL.y;
  const eyeDist = Math.hypot(eyeDx, eyeDy);

  // Head Roll Angle (tilt)
  const angle = Math.atan2(eyeDy, eyeDx);

  ctx.save();

  switch (accessoryId) {
    case 'royal-crown': {
      // 👑 ROYAL CROWN: Proportionally sized (1.25x eye distance) and resting on hair above forehead
      const crownW = eyeDist * 1.25;
      const crownH = crownW * 0.38;

      ctx.save();
      ctx.translate(ptForehead.x, ptForehead.y);
      ctx.rotate(angle);
      // Lift crown up so it sits gracefully on top of the hair
      ctx.translate(0, -crownH * 0.75);

      // Gold gradient
      const goldGrad = ctx.createLinearGradient(-crownW / 2, 0, crownW / 2, 0);
      goldGrad.addColorStop(0, '#D4AF37');
      goldGrad.addColorStop(0.2, '#FFF2A3');
      goldGrad.addColorStop(0.5, '#F3E5AB');
      goldGrad.addColorStop(0.8, '#FFF2A3');
      goldGrad.addColorStop(1, '#B8860B');

      ctx.fillStyle = goldGrad;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.75)';
      ctx.shadowBlur = 10;

      // Bottom curved band
      ctx.beginPath();
      ctx.ellipse(0, crownH * 0.38, crownW * 0.46, crownH * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crown Peaks / Spires
      ctx.beginPath();
      ctx.moveTo(-crownW * 0.44, crownH * 0.35);
      // Left outer spire
      ctx.lineTo(-crownW * 0.42, -crownH * 0.2);
      ctx.lineTo(-crownW * 0.28, crownH * 0.1);
      // Left mid spire
      ctx.lineTo(-crownW * 0.22, -crownH * 0.45);
      ctx.lineTo(-crownW * 0.1, crownH * 0.05);
      // Center Grand Royal Spire
      ctx.lineTo(0, -crownH * 0.75);
      ctx.lineTo(crownW * 0.1, crownH * 0.05);
      // Right mid spire
      ctx.lineTo(crownW * 0.22, -crownH * 0.45);
      ctx.lineTo(crownW * 0.28, crownH * 0.1);
      // Right outer spire
      ctx.lineTo(crownW * 0.42, -crownH * 0.2);
      ctx.lineTo(crownW * 0.44, crownH * 0.35);
      ctx.closePath();
      ctx.fill();

      // Gold outline
      ctx.strokeStyle = '#FFE066';
      ctx.lineWidth = Math.max(1.8, crownW * 0.012);
      ctx.stroke();

      // Spire Jewels
      const spires = [
        { x: -crownW * 0.42, y: -crownH * 0.2, r: crownW * 0.032, color: '#E63946' },
        { x: -crownW * 0.22, y: -crownH * 0.45, r: crownW * 0.042, color: '#48CAE4' },
        { x: 0, y: -crownH * 0.75, r: crownW * 0.058, color: '#E63946' },
        { x: crownW * 0.22, y: -crownH * 0.45, r: crownW * 0.042, color: '#48CAE4' },
        { x: crownW * 0.42, y: -crownH * 0.2, r: crownW * 0.032, color: '#E63946' },
      ];

      spires.forEach(sp => {
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Glint
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(sp.x - sp.r * 0.3, sp.y - sp.r * 0.3, sp.r * 0.35, 0, Math.PI * 2);
        ctx.fill();
      });

      // Pearls on Band
      for (let i = -4; i <= 4; i++) {
        const px = i * (crownW * 0.095);
        const py = crownH * 0.36 + (1 - Math.cos((i / 4) * (Math.PI / 4))) * crownH * 0.07;
        ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#E63946';
        ctx.beginPath();
        ctx.arc(px, py, crownW * 0.024, 0, Math.PI * 2);
        ctx.fill();
      }

      // Sparkles
      drawSparkle(ctx, -crownW * 0.45, -crownH * 0.35, crownW * 0.055, '#FFE066');
      drawSparkle(ctx, crownW * 0.45, -crownH * 0.35, crownW * 0.055, '#FFE066');
      drawSparkle(ctx, 0, -crownH * 0.95, crownW * 0.07, '#FFFFFF');

      ctx.restore();
      break;
    }

    case 'floral-tiara': {
      // 🌸 FLORAL TIARA: Follows hairline arch above forehead
      const tiaraW = eyeDist * 1.35;

      ctx.save();
      ctx.translate(ptForehead.x, ptForehead.y);
      ctx.rotate(angle);
      ctx.translate(0, -tiaraW * 0.32);

      // Green vine arch
      ctx.strokeStyle = '#70A060';
      ctx.lineWidth = Math.max(2.5, tiaraW * 0.018);
      ctx.beginPath();
      ctx.arc(0, tiaraW * 0.4, tiaraW * 0.5, -Math.PI * 0.78, -Math.PI * 0.22);
      ctx.stroke();

      // Golden leaf accents
      const leafAngles = [-0.72, -0.6, -0.48, -0.38, -0.28];
      leafAngles.forEach(ang => {
        const lx = Math.cos(Math.PI * ang) * tiaraW * 0.52;
        const ly = tiaraW * 0.4 + Math.sin(Math.PI * ang) * tiaraW * 0.52;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.ellipse(0, -tiaraW * 0.04, tiaraW * 0.02, tiaraW * 0.04, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Blossoms
      const flowers = [
        { ang: -0.74, size: tiaraW * 0.08, color: '#FFAFCC', center: '#FFF' },
        { ang: -0.63, size: tiaraW * 0.1, color: '#FFC8DD', center: '#FFB703' },
        { ang: -0.5, size: tiaraW * 0.13, color: '#FF758F', center: '#FFF0F5' },
        { ang: -0.37, size: tiaraW * 0.1, color: '#FFC8DD', center: '#FFB703' },
        { ang: -0.26, size: tiaraW * 0.08, color: '#FFAFCC', center: '#FFF' },
      ];

      flowers.forEach(fl => {
        const fx = Math.cos(Math.PI * fl.ang) * tiaraW * 0.5;
        const fy = tiaraW * 0.4 + Math.sin(Math.PI * fl.ang) * tiaraW * 0.5;

        ctx.save();
        ctx.translate(fx, fy);
        ctx.fillStyle = fl.color;
        ctx.shadowColor = 'rgba(255, 117, 143, 0.6)';
        ctx.shadowBlur = 8;

        for (let p = 0; p < 5; p++) {
          const pAngle = (p * Math.PI * 2) / 5;
          ctx.beginPath();
          ctx.arc(
            Math.cos(pAngle) * (fl.size * 0.5),
            Math.sin(pAngle) * (fl.size * 0.5),
            fl.size * 0.42,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        ctx.fillStyle = fl.center;
        ctx.beginPath();
        ctx.arc(0, 0, fl.size * 0.28, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      drawSparkle(ctx, -tiaraW * 0.4, 0, tiaraW * 0.045, '#FFC8DD');
      drawSparkle(ctx, tiaraW * 0.4, 0, tiaraW * 0.045, '#FFC8DD');

      ctx.restore();
      break;
    }

    case 'gold-glasses': {
      // 🕶️ GOLD SHADES: Sleek, perfectly proportioned to user's eye line (1.35x eye distance)
      const glassesW = eyeDist * 1.35;
      const lensW = glassesW * 0.36;
      const lensH = lensW * 0.68;
      const gap = glassesW * 0.12;

      ctx.save();
      ctx.translate(ptNoseRoot.x, ptNoseRoot.y);
      ctx.rotate(angle);

      const gold = ctx.createLinearGradient(-glassesW / 2, 0, glassesW / 2, 0);
      gold.addColorStop(0, '#B8860B');
      gold.addColorStop(0.3, '#FFF2A3');
      gold.addColorStop(0.5, '#FFD700');
      gold.addColorStop(0.7, '#FFF2A3');
      gold.addColorStop(1, '#B8860B');

      [-1, 1].forEach(side => {
        const lx = side * (lensW / 2 + gap / 2);

        // Lens body
        const lensGrad = ctx.createLinearGradient(lx - lensW / 2, -lensH / 2, lx + lensW / 2, lensH / 2);
        lensGrad.addColorStop(0, 'rgba(30, 20, 10, 0.88)');
        lensGrad.addColorStop(0.6, 'rgba(80, 50, 20, 0.84)');
        lensGrad.addColorStop(1, 'rgba(20, 15, 10, 0.92)');

        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.roundRect(lx - lensW / 2, -lensH / 2, lensW, lensH, [lensH * 0.3, lensH * 0.3, lensH * 0.5, lensH * 0.5]);
        ctx.fill();

        // Rim
        ctx.strokeStyle = gold;
        ctx.lineWidth = Math.max(2, glassesW * 0.016);
        ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
        ctx.shadowBlur = 6;
        ctx.stroke();

        // Reflective glint
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(lx - lensW / 2, -lensH / 2, lensW, lensH, [lensH * 0.3, lensH * 0.3, lensH * 0.5, lensH * 0.5]);
        ctx.clip();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(lx - lensW * 0.35, -lensH);
        ctx.lineTo(lx - lensW * 0.05, -lensH);
        ctx.lineTo(lx + lensW * 0.1, lensH * 1.2);
        ctx.lineTo(lx - lensW * 0.2, lensH * 1.2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // Bridge
      ctx.strokeStyle = gold;
      ctx.lineWidth = Math.max(2.5, glassesW * 0.018);
      ctx.beginPath();
      ctx.arc(0, -lensH * 0.12, gap * 0.65, Math.PI * 0.85, Math.PI * 0.15, true);
      ctx.stroke();

      // Top Bar
      ctx.beginPath();
      ctx.moveTo(-gap * 0.9, -lensH * 0.42);
      ctx.lineTo(gap * 0.9, -lensH * 0.42);
      ctx.stroke();

      drawSparkle(ctx, -glassesW * 0.42, -lensH * 0.3, glassesW * 0.05, '#FFFFFF');
      drawSparkle(ctx, glassesW * 0.42, -lensH * 0.3, glassesW * 0.045, '#FFE066');

      ctx.restore();
      break;
    }

    case 'angel-halo': {
      // ✨ ANGEL HALO: Floating dynamically above head
      const haloRx = eyeDist * 0.85;
      const haloRy = haloRx * 0.26;

      ctx.save();
      ctx.translate(ptForehead.x, ptForehead.y);
      ctx.rotate(angle);
      ctx.translate(0, -eyeDist * 1.05);

      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 18;

      ctx.strokeStyle = '#FFF2A3';
      ctx.lineWidth = Math.max(3.5, haloRx * 0.07);
      ctx.beginPath();
      ctx.ellipse(0, 0, haloRx, haloRy, -0.05, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(1.8, haloRx * 0.03);
      ctx.beginPath();
      ctx.ellipse(0, 0, haloRx, haloRy, -0.05, 0, Math.PI * 2);
      ctx.stroke();

      drawSparkle(ctx, -haloRx * 1.1, haloRy * 0.2, haloRx * 0.12, '#FFE066');
      drawSparkle(ctx, haloRx * 1.15, -haloRy * 0.4, haloRx * 0.11, '#FFE066');
      drawSparkle(ctx, 0, -haloRy * 2, haloRx * 0.14, '#FFFFFF');

      ctx.restore();
      break;
    }

    case 'pearl-ribbon': {
      // 🎀 PEARL RIBBON: Attached right on hair/forehead
      const bowW = eyeDist * 1.1;
      const bowH = bowW * 0.36;

      ctx.save();
      ctx.translate(ptForehead.x, ptForehead.y);
      ctx.rotate(angle);
      ctx.translate(0, -bowH * 0.7);

      const velvet = ctx.createLinearGradient(-bowW / 2, -bowH / 2, bowW / 2, bowH / 2);
      velvet.addColorStop(0, '#520C16');
      velvet.addColorStop(0.5, '#8C1D2F');
      velvet.addColorStop(1, '#520C16');

      ctx.fillStyle = velvet;
      ctx.shadowColor = 'rgba(107, 17, 31, 0.6)';
      ctx.shadowBlur = 8;

      // Loops
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-bowW * 0.3, -bowH * 0.6, -bowW * 0.6, -bowH * 0.3, -bowW * 0.45, 0);
      ctx.bezierCurveTo(-bowW * 0.6, bowH * 0.3, -bowW * 0.3, bowH * 0.6, 0, 0);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(bowW * 0.3, -bowH * 0.6, bowW * 0.6, -bowH * 0.3, bowW * 0.45, 0);
      ctx.bezierCurveTo(bowW * 0.6, bowH * 0.3, bowW * 0.3, bowH * 0.6, 0, 0);
      ctx.fill();

      // Tails
      ctx.fillStyle = '#6B111F';
      ctx.beginPath();
      ctx.moveTo(-bowW * 0.1, bowH * 0.2);
      ctx.lineTo(-bowW * 0.3, bowH * 1.2);
      ctx.lineTo(-bowW * 0.2, bowH * 1.15);
      ctx.lineTo(0, bowH * 0.3);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(bowW * 0.1, bowH * 0.2);
      ctx.lineTo(bowW * 0.3, bowH * 1.2);
      ctx.lineTo(bowW * 0.2, bowH * 1.15);
      ctx.lineTo(0, bowH * 0.3);
      ctx.fill();

      // Gold Trim & Center Pearl
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = Math.max(1.5, bowW * 0.012);
      ctx.stroke();

      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(0, 0, bowW * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFDF5';
      ctx.shadowColor = '#FFFFFF';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, bowW * 0.06, 0, Math.PI * 2);
      ctx.fill();

      drawSparkle(ctx, -bowW * 0.38, -bowH * 0.3, bowW * 0.06, '#FFD700');
      drawSparkle(ctx, bowW * 0.38, -bowH * 0.3, bowW * 0.06, '#FFD700');

      ctx.restore();
      break;
    }

    case 'heart-aura': {
      // 💖 HEART AURA: Positioned dynamically around user's face
      ctx.save();
      ctx.translate(ptNoseRoot.x, ptNoseRoot.y);
      ctx.rotate(angle);

      const hScale = eyeDist * 0.85;
      const hearts = [
        { x: -hScale * 1.1, y: -hScale * 0.6, size: hScale * 0.28, color: '#FF4D6D', rot: -0.2 },
        { x: hScale * 1.1, y: -hScale * 0.5, size: hScale * 0.3, color: '#FF758F', rot: 0.25 },
        { x: -hScale * 0.9, y: hScale * 0.4, size: hScale * 0.22, color: '#FF8FA3', rot: -0.15 },
        { x: hScale * 0.9, y: hScale * 0.5, size: hScale * 0.24, color: '#FF4D6D', rot: 0.18 },
        { x: 0, y: -hScale * 1.2, size: hScale * 0.34, color: '#FF0054', rot: 0 },
      ];

      hearts.forEach(hItem => {
        drawHeart(ctx, hItem.x, hItem.y, hItem.size, hItem.color, hItem.rot);
      });

      drawSparkle(ctx, -hScale * 0.6, -hScale * 0.9, hScale * 0.12, '#FFD700');
      drawSparkle(ctx, hScale * 0.6, -hScale * 0.9, hScale * 0.12, '#FFD700');

      ctx.restore();
      break;
    }

    case 'cat-ears': {
      // 🐱 CAT EARS & BLUSH: Ears attached to head corners, blush on cheeks
      const earSpan = eyeDist * 0.65;
      const earW = eyeDist * 0.32;
      const earH = eyeDist * 0.36;

      ctx.save();
      ctx.translate(ptForehead.x, ptForehead.y);
      ctx.rotate(angle);
      ctx.translate(0, -earH * 0.4);

      const gold = ctx.createLinearGradient(-earSpan, 0, earSpan, 0);
      gold.addColorStop(0, '#B8860B');
      gold.addColorStop(0.5, '#FFE066');
      gold.addColorStop(1, '#B8860B');

      [-1, 1].forEach(side => {
        const ex = side * earSpan;

        ctx.fillStyle = 'rgba(255, 230, 240, 0.45)';
        ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(ex - earW / 2, earH * 0.2);
        ctx.lineTo(ex + side * earW * 0.1, -earH);
        ctx.lineTo(ex + earW / 2, earH * 0.2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = gold;
        ctx.lineWidth = Math.max(2.5, eyeDist * 0.016);
        ctx.stroke();

        ctx.fillStyle = '#FF99C8';
        ctx.beginPath();
        ctx.moveTo(ex - earW * 0.28, earH * 0.1);
        ctx.lineTo(ex + side * earW * 0.08, -earH * 0.7);
        ctx.lineTo(ex + earW * 0.28, earH * 0.1);
        ctx.closePath();
        ctx.fill();

        drawSparkle(ctx, ex + side * earW * 0.1, -earH, eyeDist * 0.05, '#FFFFFF');
      });

      ctx.restore();

      // Cheek Blush on exact cheek landmarks
      const blushR = eyeDist * 0.22;
      [ptCheekL, ptCheekR].forEach(pt => {
        const blushGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, blushR);
        blushGrad.addColorStop(0, 'rgba(255, 105, 180, 0.45)');
        blushGrad.addColorStop(1, 'rgba(255, 105, 180, 0)');
        ctx.fillStyle = blushGrad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, blushR, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    default:
      break;
  }

  ctx.restore();
}

/**
 * Fallback static drawing when no face is currently in view
 */
function drawFallbackAccessory(ctx, w, h, accessoryId) {
  const cx = w * 0.5;
  const cy = accessoryId === 'gold-glasses' ? h * 0.38 : h * 0.17;
  const dummyEyeDist = w * 0.28;

  const dummyLandmarks = new Array(468).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0 }));
  dummyLandmarks[10] = { x: 0.5, y: cy / h, z: 0 };
  dummyLandmarks[152] = { x: 0.5, y: (cy + dummyEyeDist * 1.6) / h, z: 0 };
  dummyLandmarks[263] = { x: 0.44, y: (cy + dummyEyeDist * 0.6) / h, z: 0 };
  dummyLandmarks[33] = { x: 0.56, y: (cy + dummyEyeDist * 0.6) / h, z: 0 };
  dummyLandmarks[168] = { x: 0.5, y: (cy + dummyEyeDist * 0.6) / h, z: 0 };
  dummyLandmarks[345] = { x: 0.42, y: (cy + dummyEyeDist * 0.9) / h, z: 0 };
  dummyLandmarks[116] = { x: 0.58, y: (cy + dummyEyeDist * 0.9) / h, z: 0 };

  drawAccessoryOnFace(ctx, w, h, dummyLandmarks, w, h, accessoryId);
}

/**
 * Universal AR Accessory overlay render entrypoint
 */
export function drawAccessoryOverlay(ctx, w, h, accessoryId, faces = [], videoW = 640, videoH = 480) {
  if (!accessoryId || accessoryId === 'none') return;

  if (faces && faces.length > 0) {
    // Draw for ALL detected people in frame!
    faces.forEach(faceLandmarks => {
      drawAccessoryOnFace(ctx, w, h, faceLandmarks, videoW, videoH, accessoryId);
    });
  } else {
    // Fallback if face is temporarily out of frame
    drawFallbackAccessory(ctx, w, h, accessoryId);
  }
}
