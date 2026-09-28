// Mock Events Database for Sirklen Photo SaaS (PT Sirklen Kreasi Usaha)
// Domain format: sirklen.my.id/:slug

export const PACKAGES = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 300000,
    formattedPrice: 'Rp 300.000',
    templatesCount: 1,
    qrCardsCount: 100,
    activeDays: 7,
    features: [
      'Virtual Photobooth (Photo + Voice)',
      '1 Custom Template Desain',
      '100 Kartu Cetak QR Code',
      'Unlimited Upload & Download',
      'Galeri Aktif 7 Hari'
    ]
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 400000,
    formattedPrice: 'Rp 400.000',
    templatesCount: 2,
    qrCardsCount: 100,
    activeDays: 10,
    badge: 'PALING POPULER',
    features: [
      'Virtual Photobooth (Photo + Voice)',
      '2 Custom Template Desain',
      '100 Kartu Cetak QR Code',
      'Unlimited Upload & Download',
      'Galeri Aktif 10 Hari',
      'Pin Akses Private Galeri'
    ]
  },
  all_in: {
    id: 'all_in',
    name: 'All-In',
    price: 500000,
    formattedPrice: 'Rp 500.000',
    templatesCount: 3,
    qrCardsCount: 200,
    activeDays: 14,
    features: [
      'Virtual Photobooth (Photo + Voice)',
      '3 Custom Template Desain',
      '200 Kartu Cetak QR Code',
      'Unlimited Upload & Download',
      'Galeri Aktif 14 Hari',
      'Pin Akses Private Galeri',
      'Priority Customer Support 24/7'
    ]
  }
};

const NOW = Date.now();
const DAY_MS = 86400 * 1000;

export const DEFAULT_HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1600&auto=format&fit=crop&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1600&auto=format&fit=crop&q=85',
];

export const INITIAL_EVENTS = [
  {
    id: 'event_sabrina_raka',
    slug: 'sabrina-raka',
    brideName: 'Sabrina',
    groomName: 'Raka',
    displayName: 'Sabrina & Raka',
    eventDate: '2026-05-30',
    formattedDate: '30 Mei 2026',
    venue: 'Grand Ballroom Jakarta',
    package: 'all_in',
    pin: '',
    templateIds: ['wedding-classic', 'floral-romantic', 'gold-luxury'],
    heroPhotos: DEFAULT_HERO_PHOTOS,
    expiresAt: NOW + 14 * DAY_MS,
    createdAt: NOW - 2 * DAY_MS,
  },
  {
    id: 'event_dimas_aulia',
    slug: 'dimas-aulia',
    brideName: 'Aulia',
    groomName: 'Dimas',
    displayName: 'Dimas & Aulia',
    eventDate: '2026-06-15',
    formattedDate: '15 Juni 2026',
    venue: 'Glass House Bandung',
    package: 'standard',
    pin: '1234',
    templateIds: ['vintage-rose', 'midnight-blue'],
    heroPhotos: DEFAULT_HERO_PHOTOS,
    expiresAt: NOW + 10 * DAY_MS,
    createdAt: NOW - 1 * DAY_MS,
  },
  {
    id: 'event_expired_demo',
    slug: 'budi-[#expired]',
    brideName: 'Siti',
    groomName: 'Budi',
    displayName: 'Budi & Siti (Contoh Expired)',
    eventDate: '2026-01-01',
    formattedDate: '01 Januari 2026',
    venue: 'Hotel Majapahit Surabaya',
    package: 'basic',
    pin: '',
    templateIds: ['celebration'],
    heroPhotos: DEFAULT_HERO_PHOTOS,
    expiresAt: NOW - 1 * DAY_MS, // Expired yesterday
    createdAt: NOW - 10 * DAY_MS,
  }
];
