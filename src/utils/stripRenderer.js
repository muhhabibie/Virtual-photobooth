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
  const monoH = 15 * scale;
  const monoW = monoH * (339 / 515); // ~9.9 * scale
  const barH = 15 * scale;
  const gap = 7 * scale;

  // Measure 'sirklenice' brand text
  const brandFont = `600 ${13.5 * scale}px 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif`;
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
  const shortMessageText = hasCustomMsg ? `“${rawMsg.substring(0, 52)}”` : '';

  // Venue / Location from activeEvent
  const venueText = (activeEvent?.venue || activeEvent?.location || (isCFD ? 'IDJEN BOULEVARD' : (isWedding ? 'PASADENA, CA' : 'SPECIAL EVENT'))).toUpperCase();

  const totalW = 600 * scale; // 1200 px at scale 2
  const padX = 46 * scale;
  const photoW = totalW - padX * 2; // 508 * scale

  // Layout Sizing: Header with Brand Logo + Event Name requires topPad ~88 * scale
  const topPad = 88 * scale;
  let photoH, gap, footerH;

  if (isPolaroid) {
    // 1 Photo (Classic Polaroid ~1:1.15)
    photoH = Math.round(photoW * 0.88); // 447 * scale
    gap = 0;
    footerH = (hasCustomMsg ? 154 : 126) * scale;
  } else if (count === 2) {
    // 2 Photos (Duo Strip)
    photoH = Math.round(photoW * 0.70); // 355 * scale
    gap = 16 * scale;
    footerH = (hasCustomMsg ? 154 : 126) * scale;
  } else if (count === 4) {
    // 4 Photos (Classic 4-pose 2x6 strip)
    photoH = Math.round(photoW * 0.64); // 325 * scale
    gap = 14 * scale;
    footerH = (hasCustomMsg ? 154 : 126) * scale;
  } else {
    // Standard 3 Photos (Classic 3-pose strip)
    photoH = Math.round(photoW * 0.70); // 355 * scale
    gap = 16 * scale;
    footerH = (hasCustomMsg ? 154 : 126) * scale;
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
  const brandCenterY = 30 * scale;
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
  const eventTitleY = 60 * scale;
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
  // Sequence according to user drawing:
  // - Nama Tamu
  // - Garis Pemisah (Divider Line with center diamond)
  // - Tanggal: 15 - 11 - 2026
  // - Lokasi: IDJEN BOULEVARD
  // - User words / message (if present)
  const footerTop = topPad + (photoH * count) + (gap * Math.max(0, count - 1));

  // Date determination: Always format as DD - MM - YYYY (e.g. 15 - 11 - 2026)
  const dateText = getEventFormattedDate(activeEvent) || (isCFD ? '15 - 11 - 2026' : '15 - 11 - 2026');

  // Guest Name Determination
  const rawGuestName = guestName && guestName.trim() ? guestName.trim() : '';
  let guestTitle = '';
  if (rawGuestName) {
    guestTitle = rawGuestName.toUpperCase();
  } else if (isCFD) {
    guestTitle = 'NAMA TAMU';
  } else if (isWedding) {
    const bride = activeEvent?.brideName;
    const groom = activeEvent?.groomName;
    guestTitle = (bride && groom) ? `${groom} & ${bride}`.toUpperCase() : 'NAMA TAMU';
  } else {
    guestTitle = 'NAMA TAMU';
  }

  // Exact vertical positions relative to footerTop
  const nameY = footerTop + 33 * scale;
  const line1Y = nameY + 20 * scale;
  const dateY = line1Y + 23 * scale;
  const venueY = dateY + 19 * scale;
  const msgY = venueY + 23 * scale;

  // 4a. Guest Name ("Nama Tamu")
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const nameBaseSize = (isPolaroid ? 23 : 25) * scale;
  ctx.font = `bold ${nameBaseSize}px 'Cinzel', 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
  fitTextSize(ctx, guestTitle, photoW - 20 * scale, nameBaseSize, 15 * scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, guestTitle, totalW / 2, nameY, 2.8 * scale);
  ctx.restore();

  // 4b. Divider Line with Center Diamond Accent
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.6 * scale;
  ctx.lineCap = 'round';
  const div1Width = (isPolaroid ? 180 : 210) * scale;
  const diamondR = 3.6 * scale;
  // Left segment
  ctx.beginPath();
  ctx.moveTo(totalW / 2 - div1Width / 2, line1Y);
  ctx.lineTo(totalW / 2 - diamondR - 4 * scale, line1Y);
  ctx.stroke();
  // Right segment
  ctx.beginPath();
  ctx.moveTo(totalW / 2 + diamondR + 4 * scale, line1Y);
  ctx.lineTo(totalW / 2 + div1Width / 2, line1Y);
  ctx.stroke();
  // Center diamond accent
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(totalW / 2, line1Y - diamondR);
  ctx.lineTo(totalW / 2 + diamondR, line1Y);
  ctx.lineTo(totalW / 2, line1Y + diamondR);
  ctx.lineTo(totalW / 2 - diamondR, line1Y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 4c. Date Text (e.g. 15 - 11 - 2026)
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const dateBaseSize = (isPolaroid ? 14 : 15.5) * scale;
  ctx.font = `bold ${dateBaseSize}px 'Cinzel', 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, dateText, totalW / 2, dateY, 3.2 * scale);
  ctx.restore();

  // 4d. Venue / Location Text (e.g. IDJEN BOULEVARD)
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const venueBaseSize = (isPolaroid ? 12 : 13.5) * scale;
  ctx.font = `bold ${venueBaseSize}px 'Cinzel', 'Playfair Display', sans-serif`;
  fitTextSize(ctx, venueText, photoW - 40 * scale, venueBaseSize, 10 * scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, venueText, totalW / 2, venueY, 2.8 * scale);
  ctx.restore();

  // 4e. Guest Words / Message (in quotes if present)
  if (hasCustomMsg) {
    ctx.save();
    ctx.fillStyle = primaryTextColor;
    const msgBaseSize = (isPolaroid ? 15 : 16.5) * scale;
    ctx.font = `italic 600 ${msgBaseSize}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    fitTextSize(ctx, shortMessageText, photoW - 36 * scale, msgBaseSize, 12 * scale);
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
