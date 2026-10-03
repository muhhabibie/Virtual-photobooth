// Theme configurations for QR Code & Tent Cards matching kisahkan / bespoke photobooth references

export const QR_THEMES = {
  burgundy: {
    id: 'burgundy',
    name: 'Royal Burgundy',
    label: 'Maroon & Gold Wedding',
    qrColor: '520C16',
    bgColor: 'FFFFFF',
    cardBg: 'bg-[#4A0811]',
    overlayGradient: 'from-[#4A0811]/70 via-[#3B060D]/85 to-[#240307]/95',
    cardBorder: 'border-amber-400/45 shadow-rose-950/60',
    headerText: 'text-amber-200',
    titleText: 'text-[#FFFFFF]',
    subtitleText: 'text-amber-200/90',
    goldAccent: '#D4AF37',
    flourishClass: 'text-amber-300/45',
    fontStyle: 'font-serif',
    canvasBgHex: '#3B060D',
    canvasOverlayRgb: '59, 6, 13',
    canvasTextHex: '#FFFFFF',
    canvasAccentHex: '#D4AF37',
    canvasSubtextHex: '#F5D77F',
    scanInstruction: 'Arahkan kamera ponsel untuk berfoto & kirim doa',
    poeticQuoteLines: [
      'Hand in hand side by side',
      'We walk through life together',
      'Sharing moments and creating memories that will last forever',
      'فِي الدُّنْيَا وَالْآخِرَةِ',
      'In this world and the next'
    ]
  },
  ivory: {
    id: 'ivory',
    name: 'Ivory Bliss',
    label: 'Champagne & Rose (Ink Saver)',
    qrColor: '1A1A1A',
    bgColor: 'FFFFFF',
    cardBg: 'bg-[#FAF6F0]',
    overlayGradient: 'from-[#FAF6F0]/85 via-[#F3EDE2]/92 to-[#E8DEC8]/98',
    cardBorder: 'border-amber-400/50 shadow-stone-400/30',
    headerText: 'text-rose-900',
    titleText: 'text-stone-900',
    subtitleText: 'text-stone-700',
    goldAccent: '#C5A059',
    flourishClass: 'text-amber-700/35',
    fontStyle: 'font-serif',
    canvasBgHex: '#FAF6F0',
    canvasOverlayRgb: '250, 246, 240',
    canvasTextHex: '#1A1A1A',
    canvasAccentHex: '#8A1828',
    canvasSubtextHex: '#555555',
    scanInstruction: 'Arahkan kamera ponsel untuk berfoto & kirim doa',
    poeticQuoteLines: [
      'Hand in hand side by side',
      'We walk through life together',
      'Sharing moments and creating memories that will last forever',
      'فِي الدُّنْيَا وَالْآخِرَةِ',
      'In this world and the next'
    ]
  },
  neon: {
    id: 'neon',
    name: 'Festival Neon',
    label: 'Concert & Music Night',
    qrColor: '120B2E',
    bgColor: 'FFFFFF',
    cardBg: 'bg-[#12072B]',
    overlayGradient: 'from-[#12072B]/70 via-[#1A0B36]/85 to-[#0A0318]/96',
    cardBorder: 'border-purple-500/50 shadow-purple-950/80',
    headerText: 'text-purple-300',
    titleText: 'text-white',
    subtitleText: 'text-cyan-300',
    goldAccent: '#A855F7',
    flourishClass: 'text-purple-300/40',
    fontStyle: 'font-sans',
    canvasBgHex: '#12072B',
    canvasOverlayRgb: '18, 7, 43',
    canvasTextHex: '#FFFFFF',
    canvasAccentHex: '#C084FC',
    canvasSubtextHex: '#A5F3FC',
    scanInstruction: 'Scan QR untuk buka virtual photobooth konser',
    poeticQuoteLines: [
      'LOUD MUSIC • BRIGHT LIGHTS • UNFORGETTABLE MEMORIES',
      'Scan to capture your night at the booth'
    ]
  },
  slate: {
    id: 'slate',
    name: 'Noir Slate',
    label: 'Exhibition & Minimal Art',
    qrColor: '0F172A',
    bgColor: 'FFFFFF',
    cardBg: 'bg-[#0B1120]',
    overlayGradient: 'from-[#0B1120]/75 via-[#0F172A]/88 to-[#060A14]/98',
    cardBorder: 'border-slate-700/70 shadow-black/90',
    headerText: 'text-sky-400',
    titleText: 'text-slate-100',
    subtitleText: 'text-slate-400',
    goldAccent: '#38BDF8',
    flourishClass: 'text-sky-400/35',
    fontStyle: 'font-mono',
    canvasBgHex: '#0B1120',
    canvasOverlayRgb: '11, 17, 32',
    canvasTextHex: '#F8FAFC',
    canvasAccentHex: '#38BDF8',
    canvasSubtextHex: '#94A3B8',
    scanInstruction: 'Scan QR Code untuk akses galeri pameran',
    poeticQuoteLines: [
      'ART • PERSPECTIVE • MOMENTS IN TIME',
      'Scan QR Code to enter the virtual exhibition'
    ]
  }
};

export function resolveEventQrTheme(event, selectedTheme = 'auto') {
  if (selectedTheme && selectedTheme !== 'auto' && QR_THEMES[selectedTheme]) {
    return QR_THEMES[selectedTheme];
  }
  const eventType = event?.eventType || 'wedding';
  if (eventType === 'concert' || eventType === 'festival') return QR_THEMES.neon;
  if (eventType === 'exhibition') return QR_THEMES.slate;
  return QR_THEMES.burgundy;
}
