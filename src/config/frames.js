// Frame definitions specifically designed for Luxury Wedding events
// The Wedding of Sabrina & Raka
export const FRAMES = [
  {
    id: 'wedding-classic-burgundy',
    name: '💍 Royal Burgundy Gold',
    draw(ctx, w, h) {
      ctx.fillStyle = '#6B111F';
      ctx.fillRect(0, 0, w, h * 0.16);
      ctx.fillStyle = '#4A0812';
      ctx.fillRect(0, h * 0.84, w, h * 0.16);
      
      // Gold ornate border
      ctx.strokeStyle = '#E5C158';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(5, 5, w - 10, h - 10);
      ctx.lineWidth = 0.8;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      
      // Top header
      ctx.fillStyle = '#F5D77F';
      ctx.font = `bold ${w * 0.042}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('THE WEDDING OF', w / 2, h * 0.075);
      
      ctx.font = `italic ${w * 0.056}px "Alex Brush", cursive, serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('Sabrina & Raka', w / 2, h * 0.13);

      // Bottom footer
      ctx.fillStyle = '#F5D77F';
      ctx.font = `${w * 0.04}px Georgia, serif`;
      ctx.fillText('10 • 05 • 2026', w / 2, h * 0.94);
    },
  },
  {
    id: 'floral-blush-romance',
    name: '🌸 Blush Floral Romance',
    draw(ctx, w, h) {
      const gt = ctx.createLinearGradient(0, 0, 0, h * 0.26);
      gt.addColorStop(0, 'rgba(255, 235, 240, 0.9)');
      gt.addColorStop(1, 'transparent');
      ctx.fillStyle = gt;
      ctx.fillRect(0, 0, w, h * 0.26);

      const gb = ctx.createLinearGradient(0, h * 0.74, 0, h);
      gb.addColorStop(0, 'transparent');
      gb.addColorStop(1, 'rgba(255, 235, 240, 0.95)');
      ctx.fillStyle = gb;
      ctx.fillRect(0, h * 0.74, w, h * 0.26);

      ctx.font = `${w * 0.09}px serif`;
      ctx.fillText('🌸', 6, h * 0.1);
      ctx.fillText('🌺', w - w * 0.14, h * 0.1);
      ctx.fillText('🌹', 6, h * 0.97);
      ctx.fillText('🌷', w - w * 0.14, h * 0.97);

      ctx.fillStyle = '#8A1828';
      ctx.font = `italic bold ${w * 0.06}px "Alex Brush", cursive, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Sabrina & Raka', w / 2, h * 0.095);

      ctx.fillStyle = '#D4478E';
      ctx.font = `italic ${w * 0.042}px Georgia, serif`;
      ctx.fillText('Happy Wedding & With Love ♡', w / 2, h * 0.965);
    },
  },
  {
    id: 'gold-champagne-luxury',
    name: '✨ Champagne Gold Luxury',
    draw(ctx, w, h) {
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, w - 20, h - 20);

      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, 'rgba(212,175,55,0)');
      g.addColorStop(0.5, 'rgba(212,175,55,0.22)');
      g.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h * 0.14);
      ctx.fillStyle = 'rgba(212,175,55,0.18)';
      ctx.fillRect(0, h * 0.86, w, h * 0.14);

      ctx.fillStyle = '#D4AF37';
      ctx.font = `${w * 0.08}px serif`;
      ctx.fillText('•', 6, 32);
      ctx.fillText('•', w - 34, 32);
      ctx.fillText('•', 6, h - 6);
      ctx.fillText('•', w - 34, h - 6);

      ctx.font = `bold ${w * 0.044}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('SABRINA & RAKA', w / 2, h * 0.09);

      ctx.font = `italic ${w * 0.04}px Georgia, serif`;
      ctx.fillText('Precious Wedding Moments', w / 2, h * 0.965);
    },
  },
  {
    id: 'vintage-noir-gold',
    name: '🖤 Minimalist Noir Gold',
    draw(ctx, w, h) {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h * 0.14);
      ctx.fillRect(0, h * 0.86, w, h * 0.14);
      
      ctx.strokeStyle = '#E2B857';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      ctx.fillStyle = '#E2B857';
      ctx.font = `bold ${w * 0.042}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('WEDDING CELEBRATION', w / 2, h * 0.09);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `italic ${w * 0.05}px Georgia, serif`;
      ctx.fillText('Sabrina & Raka • 2026', w / 2, h * 0.96);
    },
  },
  {
    id: 'botanical-garden-sage',
    name: '🌿 Sage Botanical Garden',
    draw(ctx, w, h) {
      const gt = ctx.createLinearGradient(0, 0, 0, h * 0.22);
      gt.addColorStop(0, 'rgba(40,75,55,0.75)');
      gt.addColorStop(1, 'transparent');
      ctx.fillStyle = gt;
      ctx.fillRect(0, 0, w, h * 0.22);

      const gb = ctx.createLinearGradient(0, h * 0.78, 0, h);
      gb.addColorStop(0, 'transparent');
      gb.addColorStop(1, 'rgba(40,75,55,0.85)');
      ctx.fillStyle = gb;
      ctx.fillRect(0, h * 0.78, w, h * 0.22);

      ctx.strokeStyle = '#A3E635';
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, w - 10, h - 10);

      ctx.font = `${w * 0.08}px serif`;
      ctx.fillText('🌿', 4, h * 0.1);
      ctx.fillText('🍃', w - w * 0.12, h * 0.1);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold italic ${w * 0.05}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillText('The Wedding of Sabrina & Raka', w / 2, h * 0.09);

      ctx.fillStyle = '#D9F99D';
      ctx.font = `${w * 0.04}px Georgia, serif`;
      ctx.fillText('🌿 Together Forever in Love 🌿', w / 2, h * 0.96);
    },
  },
  {
    id: 'film-strip-wedding',
    name: '🎞️ Life4Cuts Wedding Strip',
    draw(ctx, w, h) {
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.fillRect(0, 0, w, h * 0.11);
      ctx.fillRect(0, h * 0.89, w, h * 0.11);
      
      ctx.fillStyle = 'white';
      const holes = 6;
      const hw = w / (holes * 2);
      for (let i = 0; i < holes; i++) {
        const x = (i * 2 + 0.5) * hw;
        ctx.beginPath();
        ctx.arc(x + hw / 2, h * 0.055, hw * 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + hw / 2, h * 0.945, hw * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#F5D77F';
      ctx.font = `bold ${w * 0.042}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('▷ SABRINA & RAKA WEDDING ◁', w / 2, h * 0.97);
    },
  },
];