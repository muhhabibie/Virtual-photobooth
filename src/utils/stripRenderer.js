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

  // Exact physical print aspect ratio:
  // 1 Photo = Polaroid (4:5 ratio, 1200x1500 at 2x Retina)
  // 2, 3, 4 Photos = Standard 2"x6" strip (1:3 ratio, 1200x3600 at 2x Retina)
  const isPolaroid = count === 1;
  const totalW = 600 * scale; // 1200 px at scale 2
  const totalH = (isPolaroid ? 750 : 1800) * scale; // 1500 px or 3600 px at scale 2
  const padX = 48 * scale;
  const photoW = totalW - padX * 2; // 504 * scale

  let photoH, gap, topPad;
  if (isPolaroid) {
    photoH = Math.round(photoW * 0.90); // 454 * scale -> authentic Polaroid ratio with generous bottom chin
    gap = 0;
    topPad = 56 * scale;
  } else if (count === 2) {
    photoH = Math.round(photoW * 0.95);
    gap = 26 * scale;
    topPad = 62 * scale;
  } else if (count === 4) {
    photoH = Math.round(photoW * 0.55);
    gap = 16 * scale;
    topPad = 56 * scale;
  } else {
    // Standard 3 Photos (Exact Wendy & Mark Reference Format)
    photoH = Math.round(photoW * 0.725); // 365 * scale
    gap = 22 * scale;
    topPad = 64 * scale;
  }

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
  const isWedding = (activeEvent?.eventType || 'wedding') === 'wedding';
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
  const headerBaseSize = isPolaroid ? 15.5 * scale : 17 * scale;
  ctx.font = `bold ${headerBaseSize}px 'Cinzel', 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
  fitTextSize(ctx, topHeaderTitle, totalW - 70 * scale, headerBaseSize, 12 * scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const topTextY = Math.round(topPad * 0.52);
  const headerTracking = isPolaroid ? 2.6 * scale : 3.2 * scale;
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

  // 3. Render Photo Slots with Solid Taupe Border Band (Reference Style)
  const borderBand = 6.5 * scale;
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
      ctx.font = `${30 * scale}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('📷', padX + photoW / 2, drawY + photoH / 2 - 8 * scale);
      ctx.fillStyle = primaryTextColor;
      ctx.font = `bold ${16 * scale}px sans-serif`;
      ctx.fillText(`Pose #${idx + 1}`, padX + photoW / 2, drawY + photoH / 2 + 24 * scale);
    }

    drawY += photoH + gap;
  }

  // 4. Harmonious & Balanced Footer Section
  const footerTop = topPad + (photoH * count) + (gap * Math.max(0, count - 1));
  const availableFooterH = totalH - footerTop;
  const dateText = getEventFormattedDate(activeEvent) || '30 · 05 · 2026';
  const rawGuestName = guestName && guestName.trim() ? guestName.trim() : '';
  const guestTitle = (rawGuestName || (isWedding ? 'Tamu Undangan' : 'Pengunjung Event')).toUpperCase();
  const shortMessageText = guestMessage && guestMessage.trim() ? `“${guestMessage.trim().substring(0, 52)}”` : '“With Love”';

  if (isPolaroid) {
    // ---------------- POLAROID COMPACT LUXURY FOOTER ----------------
    const footerCenter = footerTop + availableFooterH * 0.48;
    const nameY = Math.round(footerCenter - 46 * scale);
    const line1Y = Math.round(nameY + 24 * scale);
    const dateY = Math.round(line1Y + 24 * scale);
    const line2Y = Math.round(dateY + 18 * scale);
    const msgY = Math.round(line2Y + 22 * scale);

    // 4a. Guest Name
    ctx.save();
    ctx.fillStyle = primaryTextColor;
    const nameBaseSize = 24 * scale;
    ctx.font = `bold ${nameBaseSize}px 'Playfair Display', 'Cinzel', Georgia, serif`;
    fitTextSize(ctx, guestTitle, photoW - 30 * scale, nameBaseSize, 15 * scale);
    ctx.textAlign = 'center';
    drawSpacedText(ctx, guestTitle, totalW / 2, nameY, 3.0 * scale);
    ctx.restore();

    // 4b. Primary Divider Line
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.0 * scale;
    ctx.lineCap = 'round';
    const div1Width = 190 * scale;
    ctx.beginPath();
    ctx.moveTo(totalW / 2 - div1Width / 2, line1Y);
    ctx.lineTo(totalW / 2 + div1Width / 2, line1Y);
    ctx.stroke();
    // Center diamond ornament
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(totalW / 2, line1Y - 3.5 * scale);
    ctx.lineTo(totalW / 2 + 3.5 * scale, line1Y);
    ctx.lineTo(totalW / 2, line1Y + 3.5 * scale);
    ctx.lineTo(totalW / 2 - 3.5 * scale, line1Y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 4c. Date Text (Luxury Serif)
    ctx.save();
    ctx.fillStyle = primaryTextColor;
    ctx.font = `600 ${15 * scale}px 'Cinzel', 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';
    drawSpacedText(ctx, dateText, totalW / 2, dateY, 3.2 * scale);
    ctx.restore();

    // 4d. Secondary Divider Line
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.2 * scale;
    ctx.lineCap = 'round';
    const div2Width = 100 * scale;
    ctx.beginPath();
    ctx.moveTo(totalW / 2 - div2Width / 2, line2Y);
    ctx.lineTo(totalW / 2 + div2Width / 2, line2Y);
    ctx.stroke();
    ctx.restore();

    // 4e. Short Message / Wish
    ctx.save();
    ctx.fillStyle = isLightBg ? '#4E423A' : 'rgba(255,255,255,0.92)';
    const msgBaseSize = 14 * scale;
    ctx.font = `italic ${msgBaseSize}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    fitTextSize(ctx, shortMessageText, photoW - 40 * scale, msgBaseSize, 11 * scale);
    ctx.textAlign = 'center';
    ctx.fillText(shortMessageText, totalW / 2, msgY);
    ctx.restore();

  } else {
    // ---------------- 2x6 STRIP GRAND LUXURY EDITORIAL FOOTER ----------------
    // Vertically centered within footer area alongside botanical floral bloom
    const footerCenter = footerTop + availableFooterH * 0.44;
    const nameY = Math.round(footerCenter - 68 * scale);
    const line1Y = Math.round(nameY + 38 * scale);
    const dateY = Math.round(line1Y + 38 * scale);
    const line2Y = Math.round(dateY + 30 * scale);
    const msgY = Math.round(line2Y + 38 * scale);

    // 4a. Guest Name (Grand Bold Serif with generous luxury tracking)
    ctx.save();
    ctx.fillStyle = primaryTextColor;
    const nameBaseSize = 29 * scale;
    ctx.font = `bold ${nameBaseSize}px 'Playfair Display', 'Cinzel', 'Cormorant Garamond', Georgia, serif`;
    fitTextSize(ctx, guestTitle, photoW - 24 * scale, nameBaseSize, 17 * scale);
    ctx.textAlign = 'center';
    drawSpacedText(ctx, guestTitle, totalW / 2, nameY, 3.8 * scale);
    ctx.restore();

    // 4b. Primary Divider Line with Center Diamond Accent
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2.4 * scale;
    ctx.lineCap = 'round';
    const div1Width = 240 * scale;
    const diamondR = 4.5 * scale;
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
    ctx.font = `600 ${18 * scale}px 'Cinzel', 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';
    drawSpacedText(ctx, dateText, totalW / 2, dateY, 4.0 * scale);
    ctx.restore();

    // 4d. Secondary Divider Line
    ctx.save();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.4 * scale;
    ctx.lineCap = 'round';
    const div2Width = 140 * scale;
    ctx.beginPath();
    ctx.moveTo(totalW / 2 - div2Width / 2, line2Y);
    ctx.lineTo(totalW / 2 + div2Width / 2, line2Y);
    ctx.stroke();
    ctx.restore();

    // 4e. Guest Wish / Pesan Singkat (Italic Editorial Calligraphy)
    ctx.save();
    ctx.fillStyle = isLightBg ? '#4A3E38' : 'rgba(255,255,255,0.92)';
    const msgBaseSize = 18 * scale;
    ctx.font = `italic ${msgBaseSize}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
    fitTextSize(ctx, shortMessageText, photoW - 30 * scale, msgBaseSize, 12 * scale);
    ctx.textAlign = 'center';
    ctx.fillText(shortMessageText, totalW / 2, msgY);
    ctx.restore();

    // 4f. Subtle Luxury Brandmark Anchor at the Bottom
    ctx.save();
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = 0.65;
    ctx.font = `600 ${10.5 * scale}px 'Cinzel', 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';
    const brandBottomY = totalH - 38 * scale;
    drawSpacedText(ctx, '✦   S I R K L E N I C E   P H O T O B O O T H   ✦', totalW / 2, brandBottomY, 3.5 * scale);
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
