import { drawStripBotanicals, drawFrameOrnaments } from '../config/frameOrnaments';
import { getEventDisplayName, getEventFormattedDate } from './eventHeader';

/**
 * Universal Master Strip Renderer
 * Updated to official Sirklenice standard layout:
 * 1. Top center: Monogram [N] | sirklenice brand
 * 2. Sub-header: Event Name (e.g. Car Free Day Malang / Wedding)
 * 3. Photo slots (1, 2, 3, or 4 photos) with refined border mat
 * 4. Below photo: Guest Name ("Nama Tamu" or actual guest name)
 * 5. Horizontal divider line with center diamond accent
 * 6. Date: 15 - 11 - 2026
 * 7. Location: IDJEN BOULEVARD
 * 8. Guest message/words in quotes if present: "kata-kata hari ini"
 */

// Helper to draw the official Sirklen Monogram [N] + | + sirklenice brand logo
function drawSirklenBrandHeader(ctx, totalW, topCenterY, color, scale) {
  ctx.save();
  // Monogram N geometry (viewBox 339x515, bounds 108..447 and 20..535)
  const monoH = 22 * scale;
  const monoW = monoH * (339 / 515); // ~9.9 * scale
  const barH = 22 * scale;
  const gap = 10 * scale;

  // Measure 'sirklenice' brand text
  const brandFont = `italic 600 ${20 * scale}px 'Cormorant Garamond', 'Playfair Display', 'Libre Baskerville', Georgia, serif`;
  ctx.font = brandFont;
  const textMetrics = ctx.measureText('sirklenice');
  const textW = textMetrics.width;

  const totalBrandW = monoW + gap + (1.2 * scale) + gap + textW;
  const startX = (totalW - totalBrandW) / 2;

  // 1. Draw Vector Monogram N
  const s = monoH / 515;
  const monoX0 = startX - 108 * s;
  const monoY0 = (topCenterY - monoH / 2) - 20 * s;

  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(monoX0, monoY0);
  ctx.scale(s, s);

  // Bottom dot
  ctx.fillRect(108, 475, 75, 60);
  // Top dot
  ctx.fillRect(372, 20, 75, 58);
  // Main glyph N
  ctx.beginPath();
  ctx.moveTo(108, 107);
  ctx.lineTo(183, 107);
  ctx.lineTo(372, 333);
  ctx.lineTo(372, 107);
  ctx.lineTo(447, 107);
  ctx.lineTo(447, 445);
  ctx.lineTo(372, 445);
  ctx.lineTo(183, 220);
  ctx.lineTo(183, 445);
  ctx.lineTo(108, 445);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. Draw Vertical Divider Bar '|'
  const barX = startX + monoW + gap;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(barX, topCenterY - barH / 2);
  ctx.lineTo(barX, topCenterY + barH / 2);
  ctx.stroke();

  // 3. Draw 'sirklenice' Text
  const textX = barX + gap;
  ctx.fillStyle = color;
  ctx.font = brandFont;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('sirklenice', textX, topCenterY);

  ctx.restore();
}

// Helper to draw text with letter-spacing (luxury tracking) with fallback support
function drawSpacedText(ctx, text, x, y, letterSpacing = 0) {
  if (!text) return;
  if ('letterSpacing' in ctx && typeof letterSpacing === 'number' && letterSpacing > 0) {
    try {
      ctx.letterSpacing = `${letterSpacing}px`;
      ctx.fillText(text, x, y);
      ctx.letterSpacing = '0px';
      return;
    } catch (e) {
      // Fallback if browser throws on ctx.letterSpacing
    }
  }

  if (letterSpacing <= 0) {
    ctx.fillText(text, x, y);
    return;
  }

  const chars = Array.from(text);
  const totalCharWidth = chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0);
  const totalWidth = totalCharWidth + (chars.length - 1) * letterSpacing;

  let currentX = x - totalWidth / 2;
  const originalAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  for (const ch of chars) {
    ctx.fillText(ch, currentX, y);
    currentX += ctx.measureText(ch).width + letterSpacing;
  }
  ctx.textAlign = originalAlign;
}

// Helper to dynamically scale down font size if text is too wide
function fitTextSize(ctx, text, maxW, baseSize, minSize = 11) {
  let size = baseSize;
  ctx.font = ctx.font.replace(/\d+(\.\d+)?px/, `${size}px`);
  while (size > minSize && ctx.measureText(text).width > maxW) {
    size -= 1;
    ctx.font = ctx.font.replace(/\d+(\.\d+)?px/, `${size}px`);
  }
  return size;
}

export function renderMasterPhotoStrip(canvas, {
  photos = [],
  targetCount = 3,
  stripColor = '#FFFFFF',
  guestName = '',
  guestMessage = '',
  activeEvent = null,
  filterCss = 'none',
  scale = 2,
}) {
  if (!canvas) return;

  const count = targetCount || (photos.length > 0 ? photos.length : 3);
  const isPolaroid = count === 1;
  const isWedding = (activeEvent?.eventType || 'wedding') === 'wedding';
  const isCFD = (activeEvent?.slug || '').toLowerCase() === 'cfd' ||
                (activeEvent?.eventName || '').toLowerCase().includes('cfd') ||
                (activeEvent?.eventName || '').toLowerCase().includes('car free day');

  // Check if custom guest message is present
  const rawMsg = guestMessage && guestMessage.trim() ? guestMessage.trim() : '';
  const hasCustomMsg = Boolean(rawMsg && rawMsg !== 'With Love' && rawMsg !== '“With Love”');
  const shortMessageText = hasCustomMsg ? `\u201C${rawMsg.substring(0, 52)}\u201D` : '';

  // Venue / Location from activeEvent
  const venueText = (activeEvent?.venue || activeEvent?.location || (isCFD ? 'IDJEN BOULEVARD' : (isWedding ? 'PASADENA, CA' : 'SPECIAL EVENT'))).toUpperCase();

  const totalW = 600 * scale; // 1200 px at scale 2
  const padX = 46 * scale;
  const photoW = totalW - padX * 2; // 508 * scale

  // Layout Sizing: Header with Brand Logo + Event Name requires topPad ~88 * scale
  const topPad = 96 * scale;
  let photoH, gap, footerH;

  if (isPolaroid) {
    // 1 Photo (Classic Polaroid ~1:1.15)
    photoH = Math.round(photoW * 0.88); // 447 * scale
    gap = 0;
    footerH = (hasCustomMsg ? 195 : 168) * scale;
  } else if (count === 2) {
    // 2 Photos (Duo Strip - 4:3 Standard)
    photoH = Math.round(photoW * 0.75); // 381 * scale (4:3)
    gap = 16 * scale;
    footerH = (hasCustomMsg ? 195 : 168) * scale;
  } else if (count === 4) {
    // 4 Photos (Classic 4-pose 2x6 strip)
    photoH = Math.round(photoW * 0.64); // 325 * scale
    gap = 14 * scale;
    footerH = (hasCustomMsg ? 195 : 168) * scale;
  } else {
    // Standard 3 Photos (Classic 3-pose strip - True 4:3 Professional Photobooth Ratio)
    photoH = Math.round(photoW * 0.75); // 381 * scale (4:3)
    gap = 16 * scale;
    footerH = (hasCustomMsg ? 195 : 168) * scale;
  }

  const totalH = topPad + (photoH * count) + (gap * Math.max(0, count - 1)) + footerH;

  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Background Fill
  const frameBg = stripColor || '#FFFFFF';
  ctx.fillStyle = frameBg;
  ctx.fillRect(0, 0, totalW, totalH);

  // Luminance & Color Theme Determination
  const lightColors = ['#FAF6F0', '#FDFBF7', '#FFFFFF', '#F3C5CB', '#E2DDD5', '#FFF'];
  const isLightBg = lightColors.includes(frameBg.toUpperCase()) || frameBg.toLowerCase() === '#ffffff';
  const accentColor = isLightBg ? '#B89F88' : (activeEvent?.customFrame?.textColor || '#F5D77F');
  const primaryTextColor = isLightBg ? '#22201E' : '#FFFFFF';

  // 1b. Signature Botanical Ornaments (Top-Left Vine Branch & Bottom-Right Floral Blossom)
  // Always drawn on the standard Sirklen frame to match live camera viewfinder, unless explicitly disabled
  const showBotanicals = activeEvent?.customFrame?.botanicals !== false;
  if (showBotanicals) {
    drawStripBotanicals(ctx, totalW, totalH, accentColor, scale);
  }

  // 2a. TOP BRAND HEADER: Logo N | Sirklenice (Top-most Center)
  const brandCenterY = 34 * scale;
  drawSirklenBrandHeader(ctx, totalW, brandCenterY, primaryTextColor, scale);

  // 2b. TOP SUB-HEADER: Event Name / Wedding (Centered below Brand Logo)
  let topEventName = '';
  if (isCFD) {
    topEventName = 'Car Free Day Malang';
  } else if (isWedding) {
    const bride = activeEvent?.brideName;
    const groom = activeEvent?.groomName;
    const couple = (bride && groom) ? `${groom} & ${bride}` : (getEventDisplayName(activeEvent, activeEvent?.slug) || 'Raka & Sabrina');
    topEventName = `The Wedding of ${couple}`;
  } else {
    topEventName = activeEvent?.eventName || activeEvent?.displayName || getEventDisplayName(activeEvent, activeEvent?.slug) || 'Car Free Day Malang';
  }

  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const titleBaseSize = isPolaroid ? 14.5 * scale : 15.5 * scale;
  ctx.font = `bold ${titleBaseSize}px 'Cinzel', 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
  fitTextSize(ctx, topEventName, photoW - 20 * scale, titleBaseSize, 11 * scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const eventTitleY = 68 * scale;
  drawSpacedText(ctx, topEventName, totalW / 2, eventTitleY, 2.0 * scale);
  ctx.restore();

  // Center-crop helper to prevent any photo distortion
  const drawCover = (imgEl, dx, dy, dw, dh) => {
    const srcW = imgEl.width || imgEl.naturalWidth;
    const srcH = imgEl.height || imgEl.naturalHeight;
    if (!srcW || !srcH) return;
    const r = Math.max(dw / srcW, dh / srcH);
    const nw = dw / r;
    const nh = dh / r;
    const sx = (srcW - nw) / 2;
    const sy = (srcH - nh) / 2;
    ctx.drawImage(imgEl, sx, sy, nw, nh, dx, dy, dw, dh);
  };

  // 3. Render Photo Slots with Refined Border Band (Mat Border)
  const borderBand = 5 * scale;
  let drawY = topPad;

  for (let idx = 0; idx < count; idx++) {
    const photo = photos[idx];

    // Solid Frame Band (Mat Border)
    ctx.fillStyle = accentColor;
    ctx.fillRect(padX - borderBand, drawY - borderBand, photoW + borderBand * 2, photoH + borderBand * 2);

    if (photo && (photo.canvas || photo.dataUrl)) {
      ctx.save();
      if (filterCss && filterCss !== 'none') {
        ctx.filter = filterCss;
      }

      if (photo.canvas) {
        drawCover(photo.canvas, padX, drawY, photoW, photoH);
      } else if (photo.dataUrl) {
        const img = new Image();
        img.src = photo.dataUrl;
        drawCover(img, padX, drawY, photoW, photoH);
      }
      ctx.restore();
    } else {
      // Placeholder box (for preview before photo is captured)
      ctx.fillStyle = isLightBg ? '#F4EFEA' : 'rgba(0,0,0,0.35)';
      ctx.fillRect(padX, drawY, photoW, photoH);
      ctx.fillStyle = accentColor;
      ctx.font = `${28 * scale}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷', padX + photoW / 2, drawY + photoH / 2 - 10 * scale);
      ctx.fillStyle = primaryTextColor;
      ctx.font = `bold ${15 * scale}px sans-serif`;
      ctx.fillText(`Pose #${idx + 1}`, padX + photoW / 2, drawY + photoH / 2 + 18 * scale);
    }

    drawY += photoH + gap;
  }

  // 4. FOOTER SECTION (Below Photos)
  // Professional Wedding Photobooth Layout inspired by premium photo strip design:
  // - [Prefix label: MR. & MRS / NAMA TAMU label small caps]  <- top label
  // - Guest Name in large script/calligraphy font              <- main calligraphy name
  // - [WEDDING / EVENT TYPE] bold caps                        <- event type badge
  // - Divider line with center diamond                         <- separator
  // - Date: 15 - 11 - 2026                                   <- date
  // - Venue: IDJEN BOULEVARD                                  <- venue
  // - Guest message (if present)                              <- message
  const footerTop = topPad + (photoH * count) + (gap * Math.max(0, count - 1));

  // Date determination: Always format as DD - MM - YYYY
  const dateText = getEventFormattedDate(activeEvent) || '15 - 11 - 2026';

  // Guest Name Determination (raw display, not all-caps for calligraphy)
  const rawGuestName = guestName && guestName.trim() ? guestName.trim() : '';
  let guestScriptName = '';  // For large calligraphy script display
  let prefixLabel = '';      // "MR. & MRS" / "NAMA TAMU" etc
  let eventBadge = '';       // "WEDDING" / "CAR FREE DAY" etc

  if (rawGuestName) {
    // Real guest provided - display their name in calligraphy
    guestScriptName = rawGuestName;
    prefixLabel = isWedding ? 'MR. & MRS' : 'NAMA TAMU';
    eventBadge = isWedding ? 'WEDDING' : (activeEvent?.eventName || 'EVENT').toUpperCase();
  } else if (isCFD) {
    guestScriptName = 'Nama Tamu';
    prefixLabel = 'NAMA TAMU';
    eventBadge = 'CAR FREE DAY';
  } else if (isWedding) {
    const bride = activeEvent?.brideName;
    const groom = activeEvent?.groomName;
    // Show couple name in calligraphy style: "Raka & Sabrina"
    guestScriptName = (bride && groom) ? `${groom} & ${bride}` : 'Nama Pasangan';
    prefixLabel = 'MR. & MRS';
    eventBadge = 'WEDDING';
  } else {
    guestScriptName = activeEvent?.displayName || activeEvent?.eventName || 'Nama Tamu';
    prefixLabel = 'NAMA TAMU';
    eventBadge = (activeEvent?.eventName || 'EVENT').toUpperCase();
  }

  // ── Vertical layout positions ──
  // Layer 1: prefix label (small caps)        footerTop + 20
  // Layer 2: script name (large calligraphy)  footerTop + 42
  // Layer 3: event badge (bold caps)          footerTop + 75
  // Layer 4: divider line                     footerTop + 92
  // Layer 5: date                             footerTop + 112
  // Layer 6: venue                            footerTop + 130
  // Layer 7: message (optional)               footerTop + 152
  const prefixY   = footerTop + 22 * scale; // kept for reference but not drawn
  const scriptY   = footerTop + 50 * scale;
  const badgeY    = footerTop + 90 * scale;
  const divY      = footerTop + 106 * scale;
  const dateY     = footerTop + 126 * scale;
  const venueY    = footerTop + 144 * scale;
  const msgY      = footerTop + 166 * scale;

  // 4a. Prefix Label removed by design — only calligraphy name shown

  // 4b. Guest Name in Large Script/Calligraphy (like "Licona" in example)
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const scriptBaseSize = (isPolaroid ? 42 : 46) * scale;
  ctx.font = `${scriptBaseSize}px 'Great Vibes', 'Alex Brush', 'Dancing Script', cursive`;
  const fittedScriptSize = fitTextSize(ctx, guestScriptName, photoW - 30 * scale, scriptBaseSize, 24 * scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(guestScriptName, totalW / 2, scriptY);
  ctx.restore();

  // 4c. Event Badge ("WEDDING" / "CAR FREE DAY") — bold uppercase, prominent
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const badgeSize = (isPolaroid ? 13 : 15) * scale;
  ctx.font = `900 ${badgeSize}px 'Cinzel', 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, eventBadge, totalW / 2, badgeY, 4.0 * scale);
  ctx.restore();

  // 4d. Divider Line with Center Diamond Accent
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.4 * scale;
  ctx.lineCap = 'round';
  const div1Width = (isPolaroid ? 160 : 190) * scale;
  const diamondR = 3.0 * scale;
  // Left segment
  ctx.beginPath();
  ctx.moveTo(totalW / 2 - div1Width / 2, divY);
  ctx.lineTo(totalW / 2 - diamondR - 4 * scale, divY);
  ctx.stroke();
  // Right segment
  ctx.beginPath();
  ctx.moveTo(totalW / 2 + diamondR + 4 * scale, divY);
  ctx.lineTo(totalW / 2 + div1Width / 2, divY);
  ctx.stroke();
  // Center diamond accent
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(totalW / 2, divY - diamondR);
  ctx.lineTo(totalW / 2 + diamondR, divY);
  ctx.lineTo(totalW / 2, divY + diamondR);
  ctx.lineTo(totalW / 2 - diamondR, divY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 4e. Date Text (e.g. 15 - 11 - 2026)
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const dateBaseSize = (isPolaroid ? 12.5 : 14) * scale;
  ctx.font = `bold ${dateBaseSize}px 'Cinzel', 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, dateText, totalW / 2, dateY, 3.0 * scale);
  ctx.restore();

  // 4f. Venue / Location Text
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const venueBaseSize = (isPolaroid ? 11 : 12) * scale;
  ctx.font = `bold ${venueBaseSize}px 'Cinzel', 'Playfair Display', sans-serif`;
  fitTextSize(ctx, venueText, photoW - 40 * scale, venueBaseSize, 9 * scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, venueText, totalW / 2, venueY, 2.5 * scale);
  ctx.restore();

  // 4g. Guest Words / Message (in quotes if present)
  if (hasCustomMsg) {
    ctx.save();
    ctx.fillStyle = accentColor;
    const msgBaseSize = (isPolaroid ? 13 : 14) * scale;
    ctx.font = `italic 500 ${msgBaseSize}px 'Great Vibes', 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    fitTextSize(ctx, shortMessageText, photoW - 36 * scale, msgBaseSize, 10 * scale);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(shortMessageText, totalW / 2, msgY);
    ctx.restore();
  }

  // 5. Outer Frame Border (if customized)
  if (activeEvent?.customFrame?.borderColor) {
    ctx.strokeStyle = activeEvent.customFrame.borderColor;
    ctx.lineWidth = 4 * scale;
    ctx.strokeRect(2 * scale, 2 * scale, totalW - 4 * scale, totalH - 4 * scale);
  }

  // 6. Custom Positioned Ornaments (if any)
  if (activeEvent?.customFrame?.ornaments && activeEvent.customFrame.ornaments.length > 0) {
    drawFrameOrnaments(
      ctx,
      totalW,
      totalH,
      activeEvent.customFrame.ornaments,
      activeEvent.customFrame.textColor || accentColor,
      scale
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// BOTANICAL WEDDING STRIP RENDERER
// Style: White background, sage green photo border, watercolor botanical
// flowers (green leaves + blush roses), gold geometric hexagon frame in footer,
// large calligraphy guest name, MR. & MRS prefix, WEDDING badge, full date.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Draw a watercolor-style geometric hexagonal/diamond frame outline in footer.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx  center X
 * @param {number} cy  center Y
 * @param {number} rx  half-width radius
 * @param {number} ry  half-height radius
 * @param {string} color gold stroke color
 * @param {number} lw   line width
 */
function drawGeoHexFrame(ctx, cx, cy, rx, ry, color, lw) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // 8-point geometric diamond/hexagon shape
  const pts = [
    [cx,      cy - ry],           // top
    [cx + rx * 0.5, cy - ry * 0.6],  // top-right shoulder
    [cx + rx, cy],                // right
    [cx + rx * 0.5, cy + ry * 0.6],  // bottom-right shoulder
    [cx,      cy + ry],           // bottom
    [cx - rx * 0.5, cy + ry * 0.6],  // bottom-left shoulder
    [cx - rx, cy],                // left
    [cx - rx * 0.5, cy - ry * 0.6],  // top-left shoulder
  ];
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.stroke();
  // Inner slightly smaller frame for depth
  ctx.lineWidth = lw * 0.45;
  ctx.globalAlpha = 0.45;
  const f = 0.88;
  const pts2 = pts.map(([x, y]) => [cx + (x - cx) * f, cy + (y - cy) * f]);
  ctx.beginPath();
  ctx.moveTo(pts2[0][0], pts2[0][1]);
  for (let i = 1; i < pts2.length; i++) ctx.lineTo(pts2[i][0], pts2[i][1]);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/** Draw simple vector botanical leaves cluster (top-left or bottom-right) */
function drawBotanicalLeaves(ctx, cx, cy, size, flip, color) {
  ctx.save();
  ctx.translate(cx, cy);
  if (flip) ctx.scale(-1, -1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.025;
  ctx.lineCap = 'round';

  // Draw several leaf shapes
  const leaves = [
    { angle: -0.4, len: size * 0.9, w: size * 0.22 },
    { angle: 0.1,  len: size * 1.0, w: size * 0.26 },
    { angle: 0.55, len: size * 0.85, w: size * 0.20 },
    { angle: 0.95, len: size * 0.70, w: size * 0.18 },
    { angle: -0.9, len: size * 0.65, w: size * 0.16 },
  ];
  for (const { angle, len, w } of leaves) {
    ctx.save();
    ctx.rotate(angle);
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(w * 0.6, -len * 0.3, w * 0.4, -len * 0.75, 0, -len);
    ctx.bezierCurveTo(-w * 0.4, -len * 0.75, -w * 0.6, -len * 0.3, 0, 0);
    ctx.fill();
    // midrib vein
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -len * 0.9);
    ctx.stroke();
    ctx.restore();
  }
  // Stem tendril
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(size * 0.4, size * 0.2, size * 0.6, size * 0.5, size * 0.3, size * 0.75);
  ctx.stroke();
  ctx.restore();
}

/** Draw a simple vector rose/bloom */
function drawBotanicalRose(ctx, cx, cy, r, petalColor, centerColor) {
  ctx.save();
  ctx.translate(cx, cy);
  const petals = 6;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const px = Math.cos(a) * r * 0.55;
    const py = Math.sin(a) * r * 0.55;
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = petalColor;
    ctx.beginPath();
    ctx.ellipse(px, py, r * 0.5, r * 0.35, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // Inner petals
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + 0.3;
    const px = Math.cos(a) * r * 0.28;
    const py = Math.sin(a) * r * 0.28;
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = petalColor;
    ctx.beginPath();
    ctx.ellipse(px, py, r * 0.3, r * 0.22, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // Center
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = centerColor;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.18, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Botanical Wedding Strip Renderer
 * Replicates the "Licona Wedding" style: white background, sage green photo border,
 * watercolor botanical overlay, gold geometric hexagon frame, calligraphy name.
 */
export function renderBotanicalWeddingStrip(canvas, {
  photos = [],
  targetCount = 3,
  guestName = '',
  guestMessage = '',
  activeEvent = null,
  filterCss = 'none',
  scale = 2,
}) {
  if (!canvas) return;

  const count = targetCount || (photos.length > 0 ? photos.length : 3);
  const isPolaroid = count === 1;

  // Colors
  const bgColor     = '#FFFFFF';
  const borderColor = '#4A7C59';    // sage green photo border
  const goldColor   = '#B8912A';    // antique gold for geo frame + text
  const leafColor   = '#3D6B4F';    // darker green leaves
  const roseColor   = '#E8B4B8';    // blush pink rose petals
  const roseCtr     = '#D4919A';    // rose center
  const textDark    = '#3D3020';    // dark brown for WEDDING / date text
  const scriptColor = '#8B6914';    // warm gold for name script

  const totalW  = 600 * scale;
  const padX    = 44 * scale;
  const photoW  = totalW - padX * 2;
  const topPad  = 40 * scale;       // small top margin (botanical at top)

  let photoH, gap, footerH;
  if (isPolaroid) {
    photoH  = Math.round(photoW * 0.88);
    gap     = 0;
    footerH = 240 * scale;
  } else if (count === 2) {
    photoH  = Math.round(photoW * 0.75);
    gap     = 14 * scale;
    footerH = 240 * scale;
  } else if (count === 4) {
    photoH  = Math.round(photoW * 0.62);
    gap     = 12 * scale;
    footerH = 230 * scale;
  } else {
    // 3 photos (standard)
    photoH  = Math.round(photoW * 0.75);
    gap     = 14 * scale;
    footerH = 240 * scale;
  }

  const totalH = topPad + (photoH * count) + (gap * Math.max(0, count - 1)) + footerH;

  canvas.width  = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. White background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, totalW, totalH);

  // 2. Thin outer border line
  ctx.save();
  ctx.strokeStyle = '#DDDDDD';
  ctx.lineWidth = 1 * scale;
  ctx.strokeRect(1 * scale, 1 * scale, totalW - 2 * scale, totalH - 2 * scale);
  ctx.restore();

  // 3. Center-cover draw helper
  const drawCover = (imgEl, dx, dy, dw, dh) => {
    const srcW = imgEl.width || imgEl.naturalWidth;
    const srcH = imgEl.height || imgEl.naturalHeight;
    if (!srcW || !srcH) return;
    const r = Math.max(dw / srcW, dh / srcH);
    const nw = dw / r, nh = dh / r;
    const sx = (srcW - nw) / 2, sy = (srcH - nh) / 2;
    ctx.drawImage(imgEl, sx, sy, nw, nh, dx, dy, dw, dh);
  };

  // 4. Photo slots with sage-green border
  const borderBand = 5 * scale;
  let drawY = topPad;

  for (let idx = 0; idx < count; idx++) {
    // Sage green mat border
    ctx.fillStyle = borderColor;
    ctx.fillRect(padX - borderBand, drawY - borderBand, photoW + borderBand * 2, photoH + borderBand * 2);

    const photo = photos[idx];
    if (photo && (photo.canvas || photo.dataUrl)) {
      ctx.save();
      if (filterCss && filterCss !== 'none') {
        ctx.filter = filterCss;
      }
      if (photo.canvas) {
        drawCover(photo.canvas, padX, drawY, photoW, photoH);
      } else if (photo.dataUrl) {
        const img = new Image();
        img.src = photo.dataUrl;
        drawCover(img, padX, drawY, photoW, photoH);
      }
      ctx.restore();
    } else {
      // Placeholder
      ctx.fillStyle = '#F7F5F2';
      ctx.fillRect(padX, drawY, photoW, photoH);
      ctx.fillStyle = borderColor;
      ctx.font = `${28 * scale}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📷', padX + photoW / 2, drawY + photoH / 2 - 10 * scale);
      ctx.fillStyle = '#666';
      ctx.font = `bold ${15 * scale}px sans-serif`;
      ctx.fillText(`Pose #${idx + 1}`, padX + photoW / 2, drawY + photoH / 2 + 18 * scale);
    }
    drawY += photoH + gap;
  }

  // ── FOOTER SECTION ──
  const footerTop = topPad + (photoH * count) + (gap * Math.max(0, count - 1));
  const footerCX  = totalW / 2;
  const footerCY  = footerTop + footerH * 0.5;

  // 5. Botanical leaves — top-left cluster
  const leafSize = 55 * scale;
  drawBotanicalLeaves(ctx, padX * 0.6, footerTop + leafSize * 0.6, leafSize, false, leafColor);
  // bottom-right cluster (flipped)
  drawBotanicalLeaves(ctx, totalW - padX * 0.6, footerTop + footerH - leafSize * 0.4, leafSize, true, leafColor);
  // Extra small leaves
  drawBotanicalLeaves(ctx, padX * 1.5, footerTop + footerH * 0.78, leafSize * 0.6, false, leafColor);
  drawBotanicalLeaves(ctx, totalW - padX * 1.5, footerTop + footerH * 0.22, leafSize * 0.6, true, leafColor);

  // 6. Blush roses
  const roseR = 18 * scale;
  drawBotanicalRose(ctx, padX * 1.1, footerTop + footerH * 0.3, roseR, roseColor, roseCtr);
  drawBotanicalRose(ctx, padX * 2.0, footerTop + footerH * 0.55, roseR * 0.75, roseColor, roseCtr);
  drawBotanicalRose(ctx, totalW - padX * 1.1, footerTop + footerH * 0.68, roseR, roseColor, roseCtr);
  drawBotanicalRose(ctx, totalW - padX * 2.0, footerTop + footerH * 0.42, roseR * 0.75, roseColor, roseCtr);
  // small accent roses near center frame
  drawBotanicalRose(ctx, padX * 3.5,          footerTop + footerH * 0.14, roseR * 0.55, roseColor, roseCtr);
  drawBotanicalRose(ctx, totalW - padX * 3.5, footerTop + footerH * 0.84, roseR * 0.55, roseColor, roseCtr);

  // 7. Gold geometric hexagon frame (centered in footer)
  const geoRX = 195 * scale;
  const geoRY = 88 * scale;
  drawGeoHexFrame(ctx, footerCX, footerCY, geoRX, geoRY, goldColor, 1.6 * scale);

  // 7b. Golden intertwined heart on the left of the name (matching reference image)
  ctx.save();
  const heartX = footerCX - geoRX * 0.92;
  const heartY = footerCY - 14 * scale;
  const heartS = 24 * scale;
  ctx.translate(heartX, heartY);
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 1.8 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Outer heart
  ctx.beginPath();
  ctx.moveTo(0, heartS * 0.3);
  ctx.bezierCurveTo(-heartS * 0.52, -heartS * 0.22, -heartS * 0.65, heartS * 0.45, 0, heartS * 0.88);
  ctx.bezierCurveTo(heartS * 0.65, heartS * 0.45, heartS * 0.52, -heartS * 0.22, 0, heartS * 0.3);
  ctx.stroke();
  // Inner heart
  ctx.lineWidth = 1.1 * scale;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(0, heartS * 0.36);
  ctx.bezierCurveTo(-heartS * 0.36, -heartS * 0.08, -heartS * 0.45, heartS * 0.45, 0, heartS * 0.76);
  ctx.bezierCurveTo(heartS * 0.45, heartS * 0.45, heartS * 0.36, -heartS * 0.08, 0, heartS * 0.36);
  ctx.stroke();
  ctx.restore();

  // 8. Text inside the frame
  // 8a. "MR. & MRS" prefix — small elegant gold caps
  ctx.save();
  ctx.fillStyle = goldColor;
  ctx.font = `600 ${(isPolaroid ? 10 : 12) * scale}px 'Cinzel', 'Cormorant Garamond', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = `${3 * scale}px`;
  ctx.fillText('MR. & MRS', footerCX, footerCY - 48 * scale);
  ctx.letterSpacing = '0px';
  ctx.restore();

  // 8b. Guest name in large gold script calligraphy
  const rawGuestName = guestName && guestName.trim() ? guestName.trim() : '';
  const isWedding = (activeEvent?.eventType || 'wedding') === 'wedding';
  let scriptName = rawGuestName;
  if (!scriptName) {
    const bride = activeEvent?.brideName;
    const groom = activeEvent?.groomName;
    scriptName = (bride && groom) ? `${groom} & ${bride}` : (activeEvent?.displayName || 'Nama Tamu');
  }

  ctx.save();
  ctx.fillStyle = scriptColor;
  const scriptBase = (isPolaroid ? 52 : 58) * scale;
  ctx.font = `${scriptBase}px 'Great Vibes', 'Alex Brush', 'Dancing Script', cursive`;
  // Auto-shrink if too wide
  let scriptSize = scriptBase;
  while (scriptSize > 28 * scale && ctx.measureText(scriptName).width > geoRX * 1.6) {
    scriptSize -= 2 * scale;
    ctx.font = `${scriptSize}px 'Great Vibes', 'Alex Brush', 'Dancing Script', cursive`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(scriptName, footerCX, footerCY + 8 * scale);
  ctx.restore();

  // 8c. "WEDDING" bold caps in dark text
  ctx.save();
  ctx.fillStyle = textDark;
  ctx.font = `900 ${(isPolaroid ? 14 : 16) * scale}px 'Cinzel', 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = `${4 * scale}px`;
  ctx.fillText('WEDDING', footerCX, footerCY + 36 * scale);
  ctx.letterSpacing = '0px';
  ctx.restore();

  // 8d. Full date, e.g. "NOVEMBER 20TH 2021"
  const now = new Date();
  let dateStr = 'NOVEMBER 20TH 2026';
  if (activeEvent?.eventDate) {
    const d = new Date(activeEvent.eventDate);
    if (!isNaN(d)) {
      const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
                      'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
      const day = d.getDate();
      const suffix = day === 1 || day === 21 || day === 31 ? 'ST' :
                     day === 2 || day === 22 ? 'ND' :
                     day === 3 || day === 23 ? 'RD' : 'TH';
      dateStr = `${months[d.getMonth()]} ${day}${suffix} ${d.getFullYear()}`;
    }
  } else {
    const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
                    'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    const day = now.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'ST' :
                   day === 2 || day === 22 ? 'ND' :
                   day === 3 || day === 23 ? 'RD' : 'TH';
    dateStr = `${months[now.getMonth()]} ${day}${suffix} ${now.getFullYear()}`;
  }

  ctx.save();
  ctx.fillStyle = textDark;
  ctx.font = `bold ${(isPolaroid ? 11 : 12.5) * scale}px 'Cinzel', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = `${2 * scale}px`;
  ctx.fillText(dateStr, footerCX, footerCY + 56 * scale);
  ctx.letterSpacing = '0px';
  ctx.restore();

  // 9. Watercolor gold scattered dots accent inside frame area
  ctx.save();
  const dots = [
    [-140, -55], [130, -60], [-160, 10], [155, 15],
    [-100, 60], [95, 65], [-60, -72], [55, -68],
  ];
  for (const [dx, dy] of dots) {
    ctx.globalAlpha = 0.35 + Math.random() * 0.2;
    ctx.fillStyle = goldColor;
    const r2 = (1.5 + Math.random() * 2) * scale;
    ctx.beginPath();
    ctx.arc(footerCX + dx * scale, footerCY + dy * scale, r2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 10. Top botanical decorative touch — small leaf at top center
  drawBotanicalLeaves(ctx, totalW * 0.15, topPad * 0.5, leafSize * 0.5, false, leafColor);
  drawBotanicalLeaves(ctx, totalW * 0.85, topPad * 0.5, leafSize * 0.5, true, leafColor);
}
