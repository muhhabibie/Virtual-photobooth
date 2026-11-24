// Special Graphic Frames for Events (e.g. Mitufaya 8th Anniversary)
// 600x1800 native canvas resolution (standard 2x6 photobooth strip proportion, 1200x3600 at 2x retina)

export const MITUFAYA_FRAMES = [
  {
    id: 'mitufaya-cosmic-4',
    name: 'Cosmic Beauty',
    subName: '4 Pose • Cloud & Stars',
    badge: '4 FOTO',
    slots: 4,
    aspect: '2x6',
    previewUrl: '/frames/mitufaya_frame_1_preview.jpg',
    overlayUrl: '/frames/mitufaya_frame_1_overlay.png',
    slotBoxes: [
      { x: 80, y: 145, w: 435, h: 265 },   // Pose 1 (Rounded Rect)
      { x: 65, y: 475, w: 470, h: 310 },   // Pose 2 (Cloud)
      { x: 80, y: 850, w: 435, h: 265 },   // Pose 3 (Rounded Rect)
      { x: 65, y: 1180, w: 470, h: 310 }   // Pose 4 (Cloud)
    ],
    accentColor: '#D84984',
    themeHex: '#E65C9C',
    styleName: 'COSMIC BEAUTY 8TH',
  },
  {
    id: 'mitufaya-stamp-3',
    name: 'Pastel Memories',
    subName: '3 Pose • Stamp & Halftone',
    badge: '3 FOTO',
    slots: 3,
    aspect: '2x6',
    previewUrl: '/frames/mitufaya_frame_2_preview.jpg',
    overlayUrl: '/frames/mitufaya_frame_2_overlay.png',
    slotBoxes: [
      { x: 100, y: 270, w: 400, h: 245 },  // Pose 1 (Stamp)
      { x: 100, y: 692, w: 400, h: 245 },  // Pose 2 (Stamp)
      { x: 100, y: 1115, w: 400, h: 245 }  // Pose 3 (Stamp)
    ],
    accentColor: '#4E8A57',
    themeHex: '#88C290',
    styleName: 'PASTEL MEMORIES STAMP',
  },
  {
    id: 'mitufaya-botanical-3',
    name: 'Botanical Limit 8',
    subName: '3 Pose • Green Leaf & Y2K',
    badge: '3 FOTO',
    slots: 3,
    aspect: '2x6',
    previewUrl: '/frames/mitufaya_frame_3_preview.jpg',
    overlayUrl: '/frames/mitufaya_frame_3_overlay.png',
    slotBoxes: [
      { x: 72, y: 125, w: 425, h: 355 },  // Pose 1
      { x: 72, y: 608, w: 425, h: 355 },  // Pose 2
      { x: 72, y: 1098, w: 425, h: 355 }  // Pose 3
    ],
    accentColor: '#254E22',
    themeHex: '#2E5828',
    styleName: 'BOTANICAL LIMIT 8',
  }
];

// Helper to get active graphic frames for an event
export function getEventGraphicFrames(activeEvent) {
  const slug = (activeEvent?.slug || '').toLowerCase();
  const name = (activeEvent?.displayName || activeEvent?.eventName || '').toLowerCase();
  if (slug.includes('mitufaya') || name.includes('mitufaya')) {
    return MITUFAYA_FRAMES;
  }
  if (activeEvent?.graphicFrames && Array.isArray(activeEvent.graphicFrames)) {
    return activeEvent.graphicFrames;
  }
  return [];
}

// In-memory cache for fast, synchronous canvas rendering
const frameImageCache = new Map();

export function getCachedFrameImage(url) {
  if (!url) return null;
  if (frameImageCache.has(url)) {
    return frameImageCache.get(url);
  }
  if (typeof window === 'undefined') return null;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = url;
  frameImageCache.set(url, img);
  return img;
}

// Preload all frames into browser cache
export function preloadEventFrames() {
  if (typeof window === 'undefined') return;
  MITUFAYA_FRAMES.forEach(f => {
    getCachedFrameImage(f.overlayUrl);
    getCachedFrameImage(f.previewUrl);
  });
}
