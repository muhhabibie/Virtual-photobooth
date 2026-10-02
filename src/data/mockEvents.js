// Mock Events Database for Sirklen Photo SaaS (PT Sirklen Kreasi Usaha)
// Domain format: sirklenice.com/:slug

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
    name: 'Paket Spesial',
    price: 500000,
    formattedPrice: 'Rp 500.000',
    templatesCount: 3,
    qrCardsCount: 200,
    activeDays: 14,
    badge: 'PAKET TERLENGKAP',
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

export const EVENT_CATEGORIES = [
  { id: 'wedding', name: 'Pernikahan', icon: '💍', label: 'Wedding', placeholder: 'The Wedding Celebration' },
  { id: 'concert', name: 'Konser & Musik', icon: '🎵', label: 'Konser / Festival Musik', placeholder: 'Pestapora, Synchronize Fest, dll' },
  { id: 'exhibition', name: 'Pameran Seni', icon: '🎨', label: 'Art Exhibition / Galeri', placeholder: 'Void Vision, Art Jakarta, dll' },
  { id: 'festival', name: 'Bazaar / Expo', icon: '🎪', label: 'Clothing Expo / Bazaar', placeholder: 'Jakcloth, Brightspot, dll' },
  { id: 'general', name: 'Komunitas / Kantor', icon: '🏢', label: 'Corporate / Gathering', placeholder: 'Annual Gathering, Launching, dll' },
];

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
    id: 'event_pestapora',
    slug: 'pestapora',
    eventType: 'concert',
    eventName: 'Pestapora 2026',
    displayName: 'Pestapora 2026',
    eventDate: '2026-09-25',
    formattedDate: '25 September 2026',
    venue: 'Gambir Expo Kemayoran Jakarta',
    package: 'all_in',
    pin: '',
    templateIds: ['wedding-classic', 'midnight-blue', 'celebration'],
    heroPhotos: [
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&auto=format&fit=crop&q=85',
    ],
    expiresAt: NOW + 14 * DAY_MS,
    createdAt: NOW - 1 * DAY_MS,
  },
  {
    id: 'event_void_vision',
    slug: 'void-vision',
    eventType: 'exhibition',
    eventName: 'Void Vision Exhibition',
    displayName: 'Void Vision',
    eventDate: '2026-07-18',
    formattedDate: '18 Juli 2026',
    venue: 'Spazio Hall Surabaya',
    package: 'standard',
    pin: '',
    templateIds: ['film-strip', 'midnight-blue'],
    heroPhotos: [
      'https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=1600&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=85',
    ],
    expiresAt: NOW + 10 * DAY_MS,
    createdAt: NOW - 2 * DAY_MS,
  },
  {
    id: 'event_jakcloth',
    slug: 'jakcloth',
    eventType: 'festival',
    eventName: 'Jakcloth Year End Fest',
    displayName: 'Jakcloth Fest',
    eventDate: '2026-12-20',
    formattedDate: '20 Desember 2026',
    venue: 'Senayan Park Jakarta',
    package: 'all_in',
    pin: '',
    templateIds: ['celebration', 'gold-luxury'],
    heroPhotos: [
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1600&auto=format&fit=crop&q=85',
    ],
    expiresAt: NOW + 14 * DAY_MS,
    createdAt: NOW - 3 * DAY_MS,
  },
  {
    id: 'event_sabrina_raka',
    slug: 'sabrina-raka',
    eventType: 'wedding',
    eventName: 'The Wedding of Raka & Sabrina',
    groomName: 'Raka',
    brideName: 'Sabrina',
    displayName: 'Raka & Sabrina',
    eventDate: '2026-05-30',
    formattedDate: '30 Mei 2026',
    venue: 'Grand Ballroom Jakarta',
    package: 'all_in',
    pin: '',
    templateIds: ['wedding-classic', 'floral-romantic', 'gold-luxury'],
    heroPhotos: DEFAULT_HERO_PHOTOS,
    expiresAt: NOW + 14 * DAY_MS,
    createdAt: NOW - 4 * DAY_MS,
  },
  {
    id: 'event_dimas_aulia',
    slug: 'dimas-aulia',
    eventType: 'wedding',
    eventName: 'The Wedding of Dimas & Aulia',
    groomName: 'Dimas',
    brideName: 'Aulia',
    displayName: 'Dimas & Aulia',
    eventDate: '2026-06-15',
    formattedDate: '15 Juni 2026',
    venue: 'Glass House Bandung',
    package: 'standard',
    pin: '1234',
    templateIds: ['vintage-rose', 'midnight-blue'],
    heroPhotos: DEFAULT_HERO_PHOTOS,
    expiresAt: NOW + 10 * DAY_MS,
    createdAt: NOW - 5 * DAY_MS,
  }
];
