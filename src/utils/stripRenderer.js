import { drawStripBotanicals, drawFrameOrnaments } from '../config/frameOrnaments';
import { getEventDisplayName, getEventFormattedDate } from './eventHeader';

/**
 * Universal Master Strip Renderer
 * Renders the high-end Wendy & Mark reference photostrip with luxurious typography:
 * StepFrames, StepCamera (modal), StepReview, StepVoice, and StepResult (download).
 * 
 * Supports physical 2"x6" photostrip paper (1:3 ratio, 1200x3600 at 2x Retina)
 * and Polaroid (4:5 ratio) for 1 photo.
 */

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
function fitTextSize(ctx, text, maxW, baseSize, minSize = 12) {
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

  // Check if custom guest message is present
  const rawMsg = guestMessage && guestMessage.trim() ? guestMessage.trim() : '';
  const hasCustomMsg = Boolean(rawMsg && rawMsg !== 'With Love' && rawMsg !== '“With Love”');
  const shortMessageText = hasCustomMsg ? `“${rawMsg.substring(0, 52)}”` : '';

  // Venue / Location from activeEvent (defaults to PASADENA, CA matching Reference Image 1)
  const venueText = (activeEvent?.venue || activeEvent?.location || activeEvent?.city || (isWedding ? 'PASADENA, CA' : 'SPECIAL EVENT PHOTOBOOTH')).toUpperCase();

  const totalW = 600 * scale; // 1200 px at scale 2
  const padX = 46 * scale;
  const photoW = totalW - padX * 2; // 508 * scale (84.7% photo width, matching Image 1)

  // Spacing and dimensions dynamically tailored for 1, 2, 3, and 4 photos:
  // Eliminates dead space completely; photos occupy ~72-78% of height, footer is tight and compact.
  let photoH, gap, topPad, footerH;

  if (isPolaroid) {
    // 1 Photo (Classic Polaroid ~1:1.15)
    photoH = Math.round(photoW * 0.88); // 447 * scale
    gap = 0;
    topPad = 46 * scale;
    footerH = (hasCustomMsg ? 180 : 158) * scale;
  } else if (count === 2) {
    // 2 Photos (Duo Strip ~1:1.63)
    photoH = Math.round(photoW * 0.74); // 376 * scale (~4:3 landscape ratio)
    gap = 20 * scale;
    topPad = 48 * scale;
    footerH = (hasCustomMsg ? 182 : 160) * scale;
  } else if (count === 4) {
    // 4 Photos (Classic 4-pose 2x6 strip ~1:2.75)
    photoH = Math.round(photoW * 0.68); // 345 * scale
    gap = 16 * scale;
    topPad = 48 * scale;
    footerH = (hasCustomMsg ? 182 : 160) * scale;
  } else {
    // Standard 3 Photos (Exact Wendy & Mark Reference Format ~1:2.23)
    photoH = Math.round(photoW * 0.72); // 366 * scale
    gap = 18 * scale;
    topPad = 48 * scale;
    footerH = (hasCustomMsg ? 182 : 160) * scale;
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

  // 2. Draw Reference Botanicals (Branch top-left & flower blossom bottom-right)
  drawStripBotanicals(ctx, totalW, totalH, accentColor, scale);

  // 2b. Header Event Title at the TOP of the strip (e.g. THE WEDDING OF SABRINA & RAKA)
  let topHeaderTitle = '';
  if (isWedding) {
    const bride = activeEvent?.brideName;
    const groom = activeEvent?.groomName;
    const couple = (bride && groom) ? `${bride} & ${groom}` : (getEventDisplayName(activeEvent, activeEvent?.slug) || 'Sabrina & Raka');
    topHeaderTitle = `THE WEDDING OF ${couple}`.toUpperCase();
  } else {
    topHeaderTitle = (activeEvent?.eventName || activeEvent?.displayName || getEventDisplayName(activeEvent, activeEvent?.slug) || 'OFFICIAL EVENT PHOTOBOOTH').toUpperCase();
  }

  // Render Top Header with Grand Luxury Serif & Generous Letter-Spacing
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const headerBaseSize = isPolaroid ? 13.5 * scale : 14.5 * scale;
  ctx.font = `bold ${headerBaseSize}px 'Cinzel', 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
  fitTextSize(ctx, topHeaderTitle, totalW - 70 * scale, headerBaseSize, 11 * scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const topTextY = Math.round(topPad * 0.52);
  const headerTracking = isPolaroid ? 2.4 * scale : 2.8 * scale;
  drawSpacedText(ctx, topHeaderTitle, totalW / 2, topTextY, headerTracking);
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

  // 3. Render Photo Slots with Solid Taupe Border Band (Reference Mat)
  const borderBand = 5.5 * scale;
  let drawY = topPad;

  for (let idx = 0; idx < count; idx++) {
    const photo = photos[idx];

    // Solid Taupe Frame Band (Reference Mat)
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

  // 4. Harmonious & Balanced Footer Section (Ref: Image 1 Wendy & Mark)
  const footerTop = topPad + (photoH * count) + (gap * Math.max(0, count - 1));
  const dateText = getEventFormattedDate(activeEvent) || '30 · 05 · 2026';
  
  // Title determination: Guest name if entered; otherwise Bride & Groom / Event name
  const rawGuestName = guestName && guestName.trim() ? guestName.trim() : '';
  let guestTitle = '';
  if (rawGuestName) {
    guestTitle = rawGuestName.toUpperCase();
  } else if (isWedding) {
    const bride = activeEvent?.brideName;
    const groom = activeEvent?.groomName;
    guestTitle = (bride && groom) ? `${bride} & ${groom}`.toUpperCase() : (getEventDisplayName(activeEvent, activeEvent?.slug) || 'WENDY & MARK').toUpperCase();
  } else {
    guestTitle = (getEventDisplayName(activeEvent, activeEvent?.slug) || 'SPECIAL GUEST').toUpperCase();
  }

  // Exact vertical positions relative to footerTop (tight, elegant & full layout)
  const nameY = footerTop + 38 * scale;
  const line1Y = nameY + 22 * scale;
  const dateY = line1Y + 24 * scale;
  const venueY = dateY + 20 * scale;
  const msgY = venueY + 21 * scale;

  // 4a. Guest / Couple Title (Grand Luxury Serif matching Image 1)
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const nameBaseSize = (isPolaroid ? 27 : 30) * scale;
  ctx.font = `bold ${nameBaseSize}px 'Cinzel', 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
  fitTextSize(ctx, guestTitle, photoW - 20 * scale, nameBaseSize, 17 * scale);
  ctx.textAlign = 'center';
  drawSpacedText(ctx, guestTitle, totalW / 2, nameY, 3.4 * scale);
  ctx.restore();

  // 4b. Primary Divider Line with Center Diamond Accent
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.8 * scale;
  ctx.lineCap = 'round';
  const div1Width = (isPolaroid ? 190 : 220) * scale;
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
  // Center luxury diamond ornament
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(totalW / 2, line1Y - diamondR);
  ctx.lineTo(totalW / 2 + diamondR, line1Y);
  ctx.lineTo(totalW / 2, line1Y + diamondR);
  ctx.lineTo(totalW / 2 - diamondR, line1Y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 4c. Date Text (Sophisticated Roman / Serif with Wide Tracking)
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const dateBaseSize = (isPolaroid ? 15 : 16.5) * scale;
  ctx.font = `bold ${dateBaseSize}px 'Cinzel', 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  drawSpacedText(ctx, dateText, totalW / 2, dateY, 3.4 * scale);
  ctx.restore();

  // 4d. Venue / Location Text (Crisp Subtitle matching "PASADENA, CA" in Image 1)
  ctx.save();
  ctx.fillStyle = primaryTextColor;
  const venueBaseSize = (isPolaroid ? 13 : 14) * scale;
  ctx.font = `bold ${venueBaseSize}px 'Cinzel', 'Playfair Display', sans-serif`;
  fitTextSize(ctx, venueText, photoW - 40 * scale, venueBaseSize, 10 * scale);
  ctx.textAlign = 'center';
  drawSpacedText(ctx, venueText, totalW / 2, venueY, 3.0 * scale);
  ctx.restore();

  // 4e. Guest Wish / Message (if present)
  if (hasCustomMsg) {
    ctx.save();
    ctx.fillStyle = isLightBg ? '#4A3E38' : 'rgba(255,255,255,0.92)';
    const msgBaseSize = (isPolaroid ? 13.5 : 14.5) * scale;
    ctx.font = `italic ${msgBaseSize}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    fitTextSize(ctx, shortMessageText, photoW - 30 * scale, msgBaseSize, 11 * scale);
    ctx.textAlign = 'center';
    ctx.fillText(shortMessageText, totalW / 2, msgY);
    ctx.restore();
  }

  // 5. Outer Frame Border (if customized)
  if (activeEvent?.customFrame?.borderColor) {
    ctx.strokeStyle = activeEvent.customFrame.borderColor;
    ctx.lineWidth = 4 * scale;
    ctx.strokeRect(2 * scale, 2 * scale, totalW - 4 * scale, totalH - 4 * scale);
  }

  // 6. Bride's Custom Positioned Ornaments (if any)
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
