// ─────────────────────────────────────────────────────────────────────────────
// SIRKLEN LUXURY TABLE QR CARD RENDERER (KERTAS BERGERIGI / DECKLED EDGE PAPER)
// ─────────────────────────────────────────────────────────────────────────────
// Generates high-definition (300 DPI) print-ready table cards with authentic
// handmade deckled edge paper contours, luxury editorial typography, gold foil
// hairline borders, and an aesthetic QR code with a center monogram emblem.
// ─────────────────────────────────────────────────────────────────────────────

import { getEventFormattedDate, getEventDisplayName } from './eventHeader';

/** Helper to draw text with custom letter-spacing */
function drawSpacedText(ctx, text, x, y, spacing = 0) {
  if (!text) return;
  if (!spacing || spacing === 0) {
    ctx.fillText(text, x, y);
    return;
  }
  const chars = String(text).split('');
  let totalW = 0;
  for (let i = 0; i < chars.length; i++) {
    totalW += ctx.measureText(chars[i]).width + (i < chars.length - 1 ? spacing : 0);
  }
  let startX = x;
  if (ctx.textAlign === 'center') startX = x - totalW / 2;
  else if (ctx.textAlign === 'right') startX = x - totalW;

  const originalAlign = ctx.textAlign;
  ctx.textAlign = 'left';
  let curX = startX;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], curX, y);
    curX += ctx.measureText(chars[i]).width + spacing;
  }
  ctx.textAlign = originalAlign;
}

/** Helper to fit text within a maxWidth */
function fitTextSize(ctx, text, maxW, baseSize, minSize = 14) {
  let size = baseSize;
  const match = ctx.font.match(/^(.*?)(\d+(?:\.\d+)?px)(.*)$/);
  if (!match) return size;
  const prefix = match[1];
  const suffix = match[3];

  ctx.font = `${prefix}${size}px${suffix}`;
  while (ctx.measureText(text).width > maxW && size > minSize) {
    size -= 1;
    ctx.font = `${prefix}${size}px${suffix}`;
  }
  return size;
}

/** Draw luxury four-point diamond corner flourishes */
function drawCornerDiamond(ctx, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size * 0.7, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size * 0.7, y);
  ctx.closePath();
  ctx.fill();

  // Subtle accent dot
  ctx.beginPath();
  ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();
}

/**
 * Draw an authentic deckled paper contour (kertas bergerigi) with micro-fibrous variations.
 */
function drawDeckledPaper(ctx, x, y, w, h, options = {}) {
  const {
    bgColorTop = '#FCFAF6',
    bgColorBottom = '#F4EDE2',
    borderColor = '#D6C8B4',
    roughness = 3.5,
    segmentLength = 7,
    innerMargin = 22,
    goldBorder = '#C5A059'
  } = options;

  ctx.save();
  ctx.beginPath();

  // Deterministic pseudo-random generator
  let seed = 12345;
  const pseudoRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) - 0.5;
  };

  // Top edge (left to right)
  ctx.moveTo(x, y);
  for (let px = x; px <= x + w; px += segmentLength) {
    const dy = pseudoRandom() * roughness;
    ctx.lineTo(px, y + dy);
  }
  // Right edge (top to bottom)
  for (let py = y; py <= y + h; py += segmentLength) {
    const dx = pseudoRandom() * roughness;
    ctx.lineTo(x + w + dx, py);
  }
  // Bottom edge (right to left)
  for (let px = x + w; px >= x; px -= segmentLength) {
    const dy = pseudoRandom() * roughness;
    ctx.lineTo(px, y + h + dy);
  }
  // Left edge (bottom to top)
  for (let py = y + h; py >= y; py -= segmentLength) {
    const dx = pseudoRandom() * roughness;
    ctx.lineTo(x + dx, py);
  }
  ctx.closePath();

  // Realistic paper drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  
  // Paper background fill
  const paperGrad = ctx.createLinearGradient(x, y, x, y + h);
  paperGrad.addColorStop(0, bgColorTop);
  paperGrad.addColorStop(1, bgColorBottom);
  ctx.fillStyle = paperGrad;
  ctx.fill();

  // Reset shadow for crisp lines
  ctx.shadowColor = 'transparent';

  // Deckle perimeter fiber stroke
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Inner Double Hairline Gold Foil Border
  const im = innerMargin;
  ctx.strokeStyle = goldBorder;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(x + im, y + im, w - im * 2, h - im * 2);

  // Secondary thin hairline
  const im2 = innerMargin + 6;
  ctx.strokeStyle = `${goldBorder}45`;
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + im2, y + im2, w - im2 * 2, h - im2 * 2);

  // Corner Diamond Accents
  const cornerSize = 4.5;
  drawCornerDiamond(ctx, x + im, y + im, cornerSize, goldBorder);
  drawCornerDiamond(ctx, x + w - im, y + im, cornerSize, goldBorder);
  drawCornerDiamond(ctx, x + im, y + h - im, cornerSize, goldBorder);
  drawCornerDiamond(ctx, x + w - im, y + h - im, cornerSize, goldBorder);

  ctx.restore();
}

/**
 * Format a vanity domain display without ugly protocol, www, or query parameters.
 * e.g. "https://www.sirklenice.com/cfd?qr=1" -> "sirklenice.com/cfd"
 */
export function formatVanityDomain(url, slug = '') {
  if (!url) return slug ? `sirklenice.com/${slug}` : 'sirklenice.com';
  try {
    const parsed = new URL(url);
    const host = parsed.host.replace(/^www\./, '');
    const path = parsed.pathname === '/' ? (slug ? `/${slug}` : '') : parsed.pathname;
    return `${host}${path}`.toLowerCase();
  } catch (e) {
    return slug ? `sirklenice.com/${slug}` : 'sirklenice.com';
  }
}

/**
 * Main Table QR Card Renderer.
 * Renders an ultra-luxurious, printable table tent card with deckled edges.
 */
export async function renderTableQrCard(canvas, {
  event = null,
  url = '',
  themeKey = 'ivory',
  scale = 2,
}) {
  if (!canvas) return;

  const totalW = 600 * scale;
  const totalH = 880 * scale;

  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Base canvas background (transparent or subtle desk shadow)
  ctx.clearRect(0, 0, totalW, totalH);

  // Event info
  const isWedding = (event?.eventType || 'wedding') === 'wedding';
  const bride = event?.brideName;
  const groom = event?.groomName;
  const couple = (bride && groom) ? `${groom} & ${bride}` : (getEventDisplayName(event, event?.slug) || 'Sabrina & Raka');
  const title = event?.displayName || couple || 'Sirklen Photo Event';
  const eventSubtitle = isWedding 
    ? 'THE WEDDING CELEBRATION OF' 
    : (event?.eventType === 'concert' || event?.eventType === 'festival'
        ? 'OFFICIAL EVENT PHOTOBOOTH' 
        : 'SPECIAL EVENT PHOTOBOOTH');
  const dateText = getEventFormattedDate(event) || '15 • 11 • 2026';
  const venueText = (event?.venue || (isWedding ? 'WEDDING CELEBRATION' : 'IDJEN BOULEVARD')).toUpperCase();

  // Target URL & Clean Vanity Domain
  const targetUrl = url || (event ? `${window.location.origin}/${event.slug || ''}?qr=1` : window.location.href);
  const vanityUrl = formatVanityDomain(targetUrl, event?.slug);

  // Theme configuration
  const isDark = themeKey === 'burgundy' || themeKey === 'slate' || themeKey === 'neon';
  const isSage = themeKey === 'sage';

  let paperBgTop = '#FDFCFA';
  let paperBgBottom = '#F5EDE2';
  let deckleBorder = '#D6C8B4';
  let goldAccent = '#C5A059';
  let textPrimary = '#25201D';
  let textSecondary = '#7A6B5D';
  let qrMatBg = '#FFFFFF';
  let qrCodeColor = '1F1C1A';

  if (themeKey === 'burgundy') {
    paperBgTop = '#420A13';
    paperBgBottom = '#2B040B';
    deckleBorder = '#5C1420';
    goldAccent = '#E5C158';
    textPrimary = '#FFFFFF';
    textSecondary = '#F5D77F';
    qrCodeColor = '3B060D';
  } else if (themeKey === 'slate') {
    paperBgTop = '#1E293B';
    paperBgBottom = '#0F172A';
    deckleBorder = '#334155';
    goldAccent = '#38BDF8';
    textPrimary = '#F8FAFC';
    textSecondary = '#94A3B8';
    qrCodeColor = '0F172A';
  } else if (isSage) {
    paperBgTop = '#2A4233';
    paperBgBottom = '#1A2E22';
    deckleBorder = '#3B5943';
    goldAccent = '#E2F5D5';
    textPrimary = '#FFFFFF';
    textSecondary = '#C2E5B5';
    qrCodeColor = '1A2E22';
  }

  // 1. Draw Organic Deckled Paper (Kertas Bergerigi)
  const padX = 26 * scale;
  const padY = 24 * scale;
  const cardW = totalW - padX * 2;
  const cardH = totalH - padY * 2;

  drawDeckledPaper(ctx, padX, padY, cardW, cardH, {
    bgColorTop: paperBgTop,
    bgColorBottom: paperBgBottom,
    borderColor: deckleBorder,
    roughness: 3.2 * scale,
    segmentLength: 6 * scale,
    innerMargin: 20 * scale,
    goldBorder: goldAccent
  });

  const centerCX = totalW / 2;

  // 2. Brand Monogram Header (Top-most)
  const brandY = 82 * scale;
  ctx.save();
  ctx.fillStyle = textSecondary;
  ctx.font = `bold ${10 * scale}px 'Cinzel', 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, 'Ń  |  S I R K L E N   P H O T O', centerCX, brandY, 2.5 * scale);
  ctx.restore();

  // 3. Event Subtitle (e.g. "THE WEDDING CELEBRATION OF")
  const subY = 120 * scale;
  ctx.save();
  ctx.fillStyle = goldAccent;
  ctx.font = `600 ${11 * scale}px 'Cinzel', 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, eventSubtitle, centerCX, subY, 2.8 * scale);
  ctx.restore();

  // 4. Main Event Title (Large Luxury Editorial Serif)
  const titleY = 168 * scale;
  ctx.save();
  ctx.fillStyle = textPrimary;
  const titleBaseSize = 34 * scale;
  ctx.font = `italic 700 ${titleBaseSize}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
  fitTextSize(ctx, title, cardW - 60 * scale, titleBaseSize, 20 * scale);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(title, centerCX, titleY);
  ctx.restore();

  // 5. Date & Venue Details
  const detailsY = 204 * scale;
  ctx.save();
  ctx.fillStyle = textSecondary;
  ctx.font = `600 ${11 * scale}px 'Cinzel', 'Playfair Display', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const fullDetails = `${dateText}   ✦   ${venueText}`;
  drawSpacedText(ctx, fullDetails, centerCX, detailsY, 2.0 * scale);
  ctx.restore();

  // Subtle separator line
  ctx.save();
  ctx.strokeStyle = `${goldAccent}55`;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(centerCX - 90 * scale, 226 * scale);
  ctx.lineTo(centerCX + 90 * scale, 226 * scale);
  ctx.stroke();
  drawCornerDiamond(ctx, centerCX, 226 * scale, 3.5 * scale, goldAccent);
  ctx.restore();

  // 6. Aesthetic QR Code Card
  // High-contrast pure white container with rounded corners & gold outline
  const qrBoxSize = 340 * scale;
  const qrBoxX = (totalW - qrBoxSize) / 2;
  const qrBoxY = 252 * scale;
  const qrRadius = 22 * scale;

  ctx.save();
  // QR container shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = 18 * scale;
  ctx.shadowOffsetY = 6 * scale;
  ctx.fillStyle = qrMatBg;

  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrRadius);
    ctx.fill();
  } else {
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
  }

  // Gold stroke outline around QR box
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = goldAccent;
  ctx.lineWidth = 2.5 * scale;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrRadius);
    ctx.stroke();
  } else {
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);
  }
  ctx.restore();

  // 7. Load & Draw the QR Code Image
  const qrInnerPad = 24 * scale;
  const qrImgSize = qrBoxSize - qrInnerPad * 2;
  const qrImgX = qrBoxX + qrInnerPad;
  const qrImgY = qrBoxY + qrInnerPad;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(targetUrl)}&color=${qrCodeColor}&bgcolor=ffffff&margin=1`;

  await new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, qrImgX, qrImgY, qrImgSize, qrImgSize);

      // 8. Draw Center Monogram Emblem on the QR Code!
      // Luxury circular emblem (16% of QR size - 100% scan-safe via Level M/H error correction)
      const emblemR = 26 * scale;
      const emblemCX = qrImgX + qrImgSize / 2;
      const emblemCY = qrImgY + qrImgSize / 2;

      ctx.save();
      // Outer gold circle
      ctx.beginPath();
      ctx.arc(emblemCX, emblemCY, emblemR, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = goldAccent;
      ctx.lineWidth = 2.2 * scale;
      ctx.stroke();

      // Inner thin gold circle
      ctx.beginPath();
      ctx.arc(emblemCX, emblemCY, emblemR - 3.5 * scale, 0, Math.PI * 2);
      ctx.strokeStyle = `${goldAccent}77`;
      ctx.lineWidth = 1 * scale;
      ctx.stroke();

      // Center Monogram "Ń"
      ctx.fillStyle = isDark ? '#3B060D' : '#2A2421';
      ctx.font = `italic bold ${20 * scale}px 'Playfair Display', 'Cinzel', Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Ń', emblemCX, emblemCY);
      ctx.restore();

      resolve();
    };
    img.onerror = () => {
      // Fallback placeholder if offline
      ctx.fillStyle = '#EEE';
      ctx.fillRect(qrImgX, qrImgY, qrImgSize, qrImgSize);
      ctx.fillStyle = '#333';
      ctx.font = `${14 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('QR Code Ready', qrImgX + qrImgSize / 2, qrImgY + qrImgSize / 2);
      resolve();
    };
    img.src = qrImageUrl;
  });

  // 9. Scanning Call-To-Action (Instruction)
  const ctaBoxY = qrBoxY + qrBoxSize + 28 * scale;
  ctx.save();
  ctx.fillStyle = textPrimary;
  ctx.font = `bold ${13.5 * scale}px 'Cinzel', 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  drawSpacedText(ctx, 'ARAHKAN KAMERA HP KE KODE QR', centerCX, ctaBoxY, 1.8 * scale);

  ctx.fillStyle = textSecondary;
  ctx.font = `italic 500 ${12 * scale}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillText('Pindai langsung untuk berfoto • Tanpa download aplikasi', centerCX, ctaBoxY + 22 * scale);
  ctx.restore();

  // 10. Footer Vanity Link (Clean, elegant, NO raw https/query params!)
  const footerPillY = ctaBoxY + 56 * scale;
  ctx.save();
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
  const pillW = 280 * scale;
  const pillH = 30 * scale;
  const pillX = centerCX - pillW / 2;

  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(pillX, footerPillY, pillW, pillH, pillH / 2);
    ctx.fill();
    ctx.strokeStyle = `${goldAccent}55`;
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
  }

  ctx.fillStyle = textSecondary;
  ctx.font = `600 ${10.5 * scale}px 'Plus Jakarta Sans', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  drawSpacedText(ctx, vanityUrl, centerCX, footerPillY + pillH / 2, 1.0 * scale);
  ctx.restore();
}

/**
 * Direct Instant Download of the Table QR Card as high-resolution PNG.
 */
export async function downloadTableQrCard(canvas, filename = 'KartuMeja_Photobooth.png') {
  if (!canvas) return false;
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve(true);
    }, 'image/png');
  });
}
