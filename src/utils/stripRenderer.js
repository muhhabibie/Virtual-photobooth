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
    topPad = 45 * scale;
  } else if (count === 2) {
    photoH = Math.round(photoW * 0.90);
    gap = 26 * scale;
    topPad = 40 * scale;
  } else if (count === 4) {
    photoH = Math.round(photoW * 0.545);
    gap = 16 * scale;
    topPad = 28 * scale;
  } else {
    // Standard 3 Photos (Exact Wendy & Mark Reference Format)
    photoH = Math.round(photoW * 0.725); // 365 * scale
    gap = 22 * scale;
    topPad = 36 * scale;
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

  // 4. Spacious Footer Section (Names, Divider Line, Date, Venue, Wishes)
  const footerTop = topPad + (photoH * count) + (gap * Math.max(0, count - 1));
  const rawDisplayName = getEventDisplayName(activeEvent, activeEvent?.slug);
  const coupleName = (rawDisplayName || 'WENDY & MARK').toUpperCase();
  const dateText = getEventFormattedDate(activeEvent) || '12.03.2023';
  const venueText = (activeEvent?.venue || 'PASADENA, CA').toUpperCase();
  const guestTitle = guestName && guestName.trim() ? guestName.trim() : 'Tamu Undangan';

  // 4a. Couple / Event Name (Bold All-Caps Serif)
  const nameY = footerTop + (isPolaroid ? 54 * scale : 95 * scale);
  ctx.fillStyle = primaryTextColor;
  ctx.font = `bold ${isPolaroid ? 20 * scale : 22 * scale}px 'Playfair Display', 'Cormorant Garamond', 'Cinzel', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.fillText(coupleName, totalW / 2, nameY);

  // 4b. Horizontal Divider Strip Line
  const lineY = nameY + (isPolaroid ? 26 * scale : 34 * scale);
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.2 * scale;
  ctx.lineCap = 'round';
  const divWidth = 160 * scale;
  ctx.beginPath();
  ctx.moveTo(totalW / 2 - divWidth / 2, lineY);
  ctx.lineTo(totalW / 2 + divWidth / 2, lineY);
  ctx.stroke();
  ctx.restore();

  // 4c. Date Text
  const dateY = lineY + (isPolaroid ? 34 * scale : 44 * scale);
  ctx.fillStyle = primaryTextColor;
  ctx.font = `bold ${14 * scale}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(dateText, totalW / 2, dateY);

  // 4d. Venue / City Text
  const venueY = dateY + 28 * scale;
  ctx.font = `bold ${12.5 * scale}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(venueText, totalW / 2, venueY);

  // 4e. Dedicated Space for Sentence / Kalimat / Doa Restu
  const msgY = venueY + (isPolaroid ? 34 * scale : 44 * scale);
  if (guestMessage && guestMessage.trim()) {
    ctx.fillStyle = isLightBg ? '#5A4A3E' : 'rgba(255,255,255,0.92)';
    ctx.font = `italic ${12 * scale}px Georgia, serif`;
    ctx.fillText(`“${guestMessage.trim().substring(0, 48)}”`, totalW / 2, msgY);

    ctx.fillStyle = isLightBg ? '#8C7A6B' : 'rgba(255,255,255,0.75)';
    ctx.font = `bold ${10 * scale}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(`— ${guestTitle}`, totalW / 2, msgY + 26 * scale);
  } else {
    ctx.fillStyle = isLightBg ? '#7A6A5E' : 'rgba(255,255,255,0.85)';
    ctx.font = `italic ${11.5 * scale}px Georgia, serif`;
    ctx.fillText(`With Love, ${guestTitle}`, totalW / 2, msgY);
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
