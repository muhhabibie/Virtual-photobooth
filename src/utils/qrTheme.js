// Theme configurations for QR Code & Tent Cards matching guest web design aesthetics

export const QR_THEMES = {
  burgundy: {
    id: 'burgundy',
    name: 'Royal Burgundy',
    label: 'Maroon & Gold Wedding',
    qrColor: '6B111F',
    bgColor: 'FFFFFF',
    cardBg: 'bg-gradient-to-br from-[#3B060D] via-[#520C16] to-[#2B0308]',
    cardBorder: 'border-amber-400/40 shadow-rose-950/50',
    headerText: 'text-amber-200',
    titleText: 'text-white',
    subtitleText: 'text-amber-200/80',
    goldAccent: '#D4AF37',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-amber-700 text-stone-950',
    centerIcon: '💍',
    fontStyle: 'font-serif',
    canvasBgHex: '#520C16',
    canvasTextHex: '#FFFFFF',
    canvasAccentHex: '#D4AF37',
    canvasSubtextHex: '#F5D77F',
    scanInstruction: 'Arahkan kamera ponsel untuk berfoto & kirim doa',
  },
  ivory: {
    id: 'ivory',
    name: 'Ivory Bliss',
    label: 'Champagne & Rose (Ink Saver)',
    qrColor: '1A1A1A',
    bgColor: 'FFFFFF',
    cardBg: 'bg-gradient-to-br from-[#FFFDF9] via-[#FAF6F0] to-[#F3EDE2]',
    cardBorder: 'border-amber-200/80 shadow-stone-300',
    headerText: 'text-rose-900',
    titleText: 'text-stone-900',
    subtitleText: 'text-stone-600',
    goldAccent: '#C5A059',
    badgeBg: 'bg-[#6B111F] text-[#F5D77F]',
    centerIcon: '🌹',
    fontStyle: 'font-serif',
    canvasBgHex: '#FFFFFF',
    canvasTextHex: '#1A1A1A',
    canvasAccentHex: '#8A1828',
    canvasSubtextHex: '#666666',
    scanInstruction: 'Arahkan kamera ponsel untuk berfoto & kirim doa',
  },
  neon: {
    id: 'neon',
    name: 'Festival Neon',
    label: 'Concert & Music Night',
    qrColor: '120B2E',
    bgColor: 'FFFFFF',
    cardBg: 'bg-gradient-to-br from-[#0D0722] via-[#1A0B36] to-[#0A0318]',
    cardBorder: 'border-purple-500/40 shadow-purple-950/60',
    headerText: 'text-purple-300',
    titleText: 'text-white',
    subtitleText: 'text-cyan-300',
    goldAccent: '#A855F7',
    badgeBg: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    centerIcon: '⚡',
    fontStyle: 'font-sans',
    canvasBgHex: '#1A0B36',
    canvasTextHex: '#FFFFFF',
    canvasAccentHex: '#C084FC',
    canvasSubtextHex: '#A5F3FC',
    scanInstruction: 'Scan QR untuk buka virtual photobooth konser',
  },
  slate: {
    id: 'slate',
    name: 'Noir Slate',
    label: 'Exhibition & Minimal Art',
    qrColor: '0F172A',
    bgColor: 'FFFFFF',
    cardBg: 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#090D16]',
    cardBorder: 'border-slate-700/60 shadow-black/80',
    headerText: 'text-sky-400',
    titleText: 'text-slate-100',
    subtitleText: 'text-slate-400',
    goldAccent: '#38BDF8',
    badgeBg: 'bg-slate-800 text-sky-300 border border-sky-500/30',
    centerIcon: '🎨',
    fontStyle: 'font-mono',
    canvasBgHex: '#0F172A',
    canvasTextHex: '#F8FAFC',
    canvasAccentHex: '#38BDF8',
    canvasSubtextHex: '#94A3B8',
    scanInstruction: 'Scan QR Code untuk akses galeri pameran',
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
