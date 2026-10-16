import { drawStripBotanicals, drawFrameOrnaments } from '../config/frameOrnaments';
import { getEventDisplayName, getEventFormattedDate } from './eventHeader';

/**
 * Universal Master Strip Renderer
 * Renders the 100% exact Wendy & Mark reference photostrip across ALL steps:
 * StepFrames, StepCamera (modal), StepReview, StepVoice, and StepResult (download).
 * 
 * Supports physical 2"x6" photostrip paper (1:3 ratio, 1200x3600 at 2x Retina)
 * and Polaroid (4:5 ratio) for 1 photo.
 */
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
    photoH = Math.round(photoW * 0.98); // 494 * scale
    gap = 0;
    topPad = 52 * scale;
  } else if (count === 2) {
    photoH = Math.round(photoW * 0.90);
    gap = 26 * scale;
    topPad = 48 * scale;
  } else if (count === 4) {
    photoH = Math.round(photoW * 0.545);
    gap = 16 * scale;
    topPad = 42 * scale;
  } else {
    // Standard 3 Photos (Exact Wendy & Mark Reference Format)
    photoH = Math.round(photoW * 0.725); // 365 * scale
    gap = 22 * scale;
    topPad = 48 * scale;
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

  const isLightBg = frameBg === '#FAF6F0' || frameBg === '#FDFBF7' || frameBg === '#ffffff' || frameBg === '#FFFFFF' || frameBg === '#F3C5CB';
  const accentColor = isLightBg ? '#B89F88' : (activeEvent?.customFrame?.textColor || '#F5D77F');
  const primaryTextColor = isLightBg ? '#22201E' : '#FFFFFF';

  // 2. Draw Reference Botanicals (Branch top-left & flower blossom bottom-right)
  drawStripBotanicals(ctx, totalW, totalH, accentColor, scale);

  // 2b. Header Event Title at the TOP of the strip (e.g. THE WEDDING OF SABRINA & RAKA or other events)
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

  ctx.save();
  ctx.fillStyle = primaryTextColor;
  ctx.font = `bold ${isPolaroid ? 13 * scale : 14 * scale}px 'Playfair Display', 'Cinzel', 'Cormorant Garamond', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const topTextY = (topPad / 2) + 1.5 * scale;
  ctx.fillText(topHeaderTitle, totalW / 2, topTextY);
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
      ctx.font = `${28 * scale}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText('📷', padX + photoW / 2, drawY + photoH / 2 - 8 * scale);
      ctx.fillStyle = primaryTextColor;
      ctx.font = `bold ${16 * scale}px sans-serif`;
      ctx.fillText(`Pose #${idx + 1}`, padX + photoW / 2, drawY + photoH / 2 + 24 * scale);
    }

    drawY += photoH + gap;
  }

  // 4. Spacious Footer Section (Guest Name, Divider Line 1, Date, Divider Line 2, Short Message - No Venue)
  const footerTop = topPad + (photoH * count) + (gap * Math.max(0, count - 1));
  const dateText = getEventFormattedDate(activeEvent) || '30 · 05 · 2026';
  const rawGuestName = guestName && guestName.trim() ? guestName.trim() : '';
  const guestTitle = (rawGuestName || (isWedding ? 'Tamu Undangan' : 'Pengunjung Event')).toUpperCase();
  const shortMessageText = guestMessage && guestMessage.trim() ? `“${guestMessage.trim().substring(0, 48)}”` : 'With Love';

  // 4a. Guest Name (Bold Serif, placed at the bottom, above the primary divider line)
  const nameY = footerTop + (isPolaroid ? 46 * scale : 78 * scale);
  ctx.fillStyle = primaryTextColor;
  ctx.font = `bold ${isPolaroid ? 19 * scale : 21 * scale}px 'Playfair Display', 'Cormorant Garamond', 'Cinzel', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(guestTitle, totalW / 2, nameY);

  // 4b. Primary Horizontal Divider Strip Line
  const line1Y = nameY + (isPolaroid ? 22 * scale : 28 * scale);
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.2 * scale;
  ctx.lineCap = 'round';
  const div1Width = 150 * scale;
  ctx.beginPath();
  ctx.moveTo(totalW / 2 - div1Width / 2, line1Y);
  ctx.lineTo(totalW / 2 + div1Width / 2, line1Y);
  ctx.stroke();
  ctx.restore();

  // 4c. Date Text (Under primary divider line, NO VENUE/LOCATION)
  const dateY = line1Y + (isPolaroid ? 28 * scale : 36 * scale);
  ctx.fillStyle = primaryTextColor;
  ctx.font = `bold ${14 * scale}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(dateText, totalW / 2, dateY);

  // 4d. Aesthetic Secondary Divider Line (Between Date and Short Message)
  const line2Y = dateY + (isPolaroid ? 20 * scale : 26 * scale);
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.3 * scale;
  ctx.lineCap = 'round';
  const div2Width = 85 * scale;
  ctx.beginPath();
  ctx.moveTo(totalW / 2 - div2Width / 2, line2Y);
  ctx.lineTo(totalW / 2 + div2Width / 2, line2Y);
  ctx.stroke();
  ctx.restore();

  // 4e. Short Message / Pesan Singkat (Under secondary divider line)
  const msgY = line2Y + (isPolaroid ? 24 * scale : 30 * scale);
  ctx.fillStyle = isLightBg ? '#5A4A3E' : 'rgba(255,255,255,0.92)';
  ctx.font = `italic ${isPolaroid ? 12 * scale : 13 * scale}px 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(shortMessageText, totalW / 2, msgY);

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
