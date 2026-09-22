/**
 * Snapchat Camera Kit Configuration
 *
 * Cara mendapatkan API Token & Lens ID:
 * 1. Buka https://developers.snap.com dan login dengan akun Snapchat.
 * 2. Buat project baru di "Camera Kit" -> "Web".
 * 3. Dapatkan API Token dan masukkan di `apiToken` di bawah.
 * 4. Buat / pilih Lens di Snap Lens Studio atau Lens Repository, lalu masukkan Lens ID & Group ID.
 */

export const SNAP_CONFIG = {
  // Masukkan API Token dari Snap Developer Portal
  apiToken: import.meta.env.VITE_SNAP_API_TOKEN || "YOUR_SNAP_CAMERA_KIT_API_TOKEN",
  
  // Group ID lensa yang sudah di-publish
  groupId: import.meta.env.VITE_SNAP_GROUP_ID || "YOUR_SNAP_GROUP_ID",

  // Daftar Lensa Snapchat yang tersedia di Photobooth
  lenses: [
    {
      id: 'none',
      name: 'Normal',
      icon: '✨',
      lensId: null,
      description: 'Kamera natural tanpa filter'
    },
    {
      id: 'beauty-glow',
      name: 'Beauty Glow',
      icon: '🌸',
      lensId: 'LENS_ID_BEAUTY_GLOW',
      description: 'Mencerahkan dan menghaluskan kulit'
    },
    {
      id: 'cute-bunny',
      name: 'Cute Bunny',
      icon: '🐰',
      lensId: 'LENS_ID_CUTE_BUNNY',
      description: 'Telinga kelinci & blush on pipi'
    },
    {
      id: 'retro-shades',
      name: 'Retro Shades',
      icon: '🕶️',
      lensId: 'LENS_ID_RETRO_SHADES',
      description: 'Kacamata hitam gaya vintage 90s'
    },
    {
      id: '90s-film',
      name: '90s Film',
      icon: '🎞️',
      lensId: 'LENS_ID_90S_FILM',
      description: 'Efek analog kamera film estetik'
    },
    {
      id: 'star-sparkles',
      name: 'Glitter Stars',
      icon: '⭐',
      lensId: 'LENS_ID_GLITTER_STARS',
      description: 'Kelap-kelip bintang berkilau di sekitar wajah'
    }
  ]
};