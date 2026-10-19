/**
 * Sirklen Photo - Audiogram / Photostrip Video Generator
 * Combines high-resolution photo strip canvas with recorded voice message
 * into a vertical 9:16 MP4 / WebM video with animated audio equalizer.
 */

export async function generatePhotostripVideo({
  photoCanvas,
  voiceUrl,
  guestName = 'Tamu Undangan',
  coupleName = 'Sabrina & Raka',
  eventName = 'The Wedding',
  onProgress = () => {},
}) {
  if (!photoCanvas) {
    throw new Error('Canvas photo strip tidak tersedia.');
  }
  if (!voiceUrl) {
    throw new Error('Rekaman suara tidak tersedia.');
  }

  // 1. Setup AudioContext & Decode Audio Data
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtxClass) {
    throw new Error('AudioContext tidak didukung di browser ini.');
  }
  const audioCtx = new AudioCtxClass();
  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  onProgress(10, 'Memuat rekaman suara...');
  const audioRes = await fetch(voiceUrl);
  const audioArrayBuffer = await audioRes.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer);

  const durationSec = Math.max(1, audioBuffer.duration);

  // 2. Setup Audio Graph: BufferSource -> Analyser -> MediaStreamDestination
  const sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;
  const bufferLength = analyser.frequencyBinCount;
  const frequencyData = new Uint8Array(bufferLength);

  const destNode = audioCtx.createMediaStreamDestination();
  sourceNode.connect(analyser);
  analyser.connect(destNode);

  // 3. Setup 9:16 Vertical Video Canvas (720 x 1280 - Story / Reels / WhatsApp Status)
  const vCanvas = document.createElement('canvas');
  vCanvas.width = 720;
  vCanvas.height = 1280;
  const ctx = vCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 4. Capture Stream from Canvas
  const fps = 30;
  const canvasStream = vCanvas.captureStream ? vCanvas.captureStream(fps) : null;
  if (!canvasStream) {
    audioCtx.close();
    throw new Error('canvas.captureStream tidak didukung di browser ini.');
  }

  // Combine video track + audio track
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...destNode.stream.getAudioTracks(),
  ]);

  // 5. Select Best Supported Video MIME Type
  let mimeType = 'video/mp4';
  let extension = 'mp4';

  if (typeof MediaRecorder !== 'undefined') {
    if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
      mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';
      extension = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
      extension = 'mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
      mimeType = 'video/webm;codecs=vp9,opus';
      extension = 'webm';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
      mimeType = 'video/webm;codecs=vp8,opus';
      extension = 'webm';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
      extension = 'webm';
    }
  }

  const chunks = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: 3000000, // 3 Mbps for crisp video quality
  });

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    let animId = null;
    let startTime = null;

    // Helper: draw rounded rect
    const drawRoundedRect = (c, x, y, width, height, radius) => {
      c.beginPath();
      c.moveTo(x + radius, y);
      c.lineTo(x + width - radius, y);
      c.quadraticCurveTo(x + width, y, x + width, y + radius);
      c.lineTo(x + width, y + height - radius);
      c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      c.lineTo(x + radius, y + height);
      c.quadraticCurveTo(x, y + height, x, y + height - radius);
      c.lineTo(x, y + radius);
      c.quadraticCurveTo(x, y, x + radius, y);
      c.closePath();
    };

    // Render loop
    const renderFrame = () => {
      if (!startTime) startTime = performance.now();
      const elapsedSec = (performance.now() - startTime) / 1000;
      const progress = Math.min(100, Math.round((elapsedSec / durationSec) * 100));
      onProgress(15 + Math.round(progress * 0.8), `Merekam video (${Math.min(durationSec, elapsedSec.toFixed(1))}s / ${durationSec.toFixed(1)}s)...`);

      analyser.getByteFrequencyData(frequencyData);

      // --- 1. Draw Luxury Dark Gradient Background ---
      const bgGrad = ctx.createLinearGradient(0, 0, 720, 1280);
      bgGrad.addColorStop(0, '#12070D');
      bgGrad.addColorStop(0.5, '#220B19');
      bgGrad.addColorStop(1, '#10050B');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 720, 1280);

      // --- 2. Ambient Blurred Backdrop of the Photo Strip ---
      ctx.save();
      ctx.globalAlpha = 0.22;
      ctx.filter = 'blur(40px)';
      ctx.drawImage(photoCanvas, -60, -60, 840, 1400);
      ctx.restore();

      // Top soft lighting overlay
      const radialGlow = ctx.createRadialGradient(360, 200, 50, 360, 400, 600);
      radialGlow.addColorStop(0, 'rgba(245, 215, 127, 0.12)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, 720, 1280);

      // --- 3. Header Text: Event & Couple Name ---
      ctx.textAlign = 'center';
      ctx.fillStyle = '#C4A46C';
      ctx.font = '600 14px "Cinzel", "Playfair Display", serif';
      ctx.letterSpacing = '4px';
      ctx.fillText(eventName.toUpperCase(), 360, 54);

      ctx.fillStyle = '#F5D77F';
      ctx.font = '700 24px "Playfair Display", serif';
      ctx.fillText(coupleName, 360, 84);

      // --- 4. Render Photo Strip (Crisp High-Res in Center) ---
      // Calculate strip dimensions to fit gracefully between header (90px) and bottom audio bar (1120px)
      const maxStripHeight = 960;
      const maxStripWidth = 520;
      const stripRatio = photoCanvas.width / photoCanvas.height;

      let drawW = maxStripHeight * stripRatio;
      let drawH = maxStripHeight;
      if (drawW > maxStripWidth) {
        drawW = maxStripWidth;
        drawH = maxStripWidth / stripRatio;
      }

      const drawX = (720 - drawW) / 2;
      const drawY = 105;

      // Soft drop shadow under photo strip
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetY = 15;

      // Clip photo strip with rounded corners
      drawRoundedRect(ctx, drawX, drawY, drawW, drawH, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.clip();
      ctx.drawImage(photoCanvas, drawX, drawY, drawW, drawH);
      ctx.restore();

      // Delicate gold frame border around photo strip
      ctx.save();
      drawRoundedRect(ctx, drawX, drawY, drawW, drawH, 16);
      ctx.strokeStyle = 'rgba(245, 215, 127, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // --- 5. Bottom Audio Visualizer & Guest Card ---
      const cardY = 1090;
      const cardH = 145;
      const cardW = 640;
      const cardX = (720 - cardW) / 2;

      // Glassmorphic Card Background
      ctx.save();
      drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 24);
      ctx.fillStyle = 'rgba(28, 12, 22, 0.88)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(196, 164, 108, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Guest Info & Voice Note Label
      ctx.textAlign = 'left';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Pesan Suara & Doa Restu`, cardX + 24, cardY + 36);

      ctx.fillStyle = '#C4A46C';
      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Dari: ${guestName}`, cardX + 24, cardY + 58);

      // Current Time vs Total Time
      const formatMmSs = (sec) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      };
      ctx.textAlign = 'right';
      ctx.fillStyle = '#F5D77F';
      ctx.font = '600 13px monospace';
      ctx.fillText(`${formatMmSs(Math.min(elapsedSec, durationSec))} / ${formatMmSs(durationSec)}`, cardX + cardW - 24, cardY + 46);

      // Animated Frequency Bars (Equalizer)
      const barsCount = 28;
      const barSpacing = 4;
      const totalBarsWidth = cardW - 48;
      const barWidth = (totalBarsWidth - (barsCount - 1) * barSpacing) / barsCount;
      const barBaseY = cardY + cardH - 24;

      for (let i = 0; i < barsCount; i++) {
        // Map frequency data index
        const freqIndex = Math.floor((i / barsCount) * bufferLength);
        const freqVal = frequencyData[freqIndex] || 0;
        // Calculate animated bar height (min 4px, max 42px)
        const barHeight = Math.max(4, (freqVal / 255) * 44);
        const barX = cardX + 24 + i * (barWidth + barSpacing);
        const barY = barBaseY - barHeight;

        // Gradient for equalizer bars
        const barGrad = ctx.createLinearGradient(0, barY, 0, barBaseY);
        barGrad.addColorStop(0, '#F5D77F');
        barGrad.addColorStop(1, '#8C1628');
        ctx.fillStyle = barGrad;

        drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 2);
        ctx.fill();
      }

      // Continue animating until audio ends
      if (elapsedSec < durationSec + 0.3) {
        animId = requestAnimationFrame(renderFrame);
      }
    };

    recorder.onstop = () => {
      if (animId) cancelAnimationFrame(animId);
      audioCtx.close();
      onProgress(98, 'Memfinalisasi file video...');

      const videoBlob = new Blob(chunks, { type: mimeType });
      resolve({
        blob: videoBlob,
        mimeType,
        extension,
      });
    };

    recorder.onerror = (e) => {
      if (animId) cancelAnimationFrame(animId);
      audioCtx.close();
      reject(e);
    };

    // When audio finishes, stop recorder gracefully
    sourceNode.onended = () => {
      setTimeout(() => {
        try {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        } catch (err) {
          console.warn('Recorder stop error:', err);
        }
      }, 400);
    };

    // Start recording & audio playback
    recorder.start(100);
    sourceNode.start(0);
    animId = requestAnimationFrame(renderFrame);
  });
}
