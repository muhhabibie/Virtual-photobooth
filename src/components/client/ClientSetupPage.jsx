import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Image as ImageIcon, Save,
  Trash2, Plus, ExternalLink, Eye, Share2, Upload, Crop,
  Info, Move, ChevronLeft, ChevronRight, Smartphone
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import PhotoCropModal from '../ui/PhotoCropModal';
import { DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';

const PREVIEW_FRAME_THEMES = [
  { id: 'burgundy', name: 'Royal Burgundy', hex: '#6B111F', textHex: '#F5D77F', borderHex: '#8A1828' },
  { id: 'slate', name: 'Noir Slate', hex: '#2D3748', textHex: '#E2E8F0', borderHex: '#4A5568' },
  { id: 'ivory', name: 'Ivory Bliss', hex: '#FDFBF7', textHex: '#6B111F', borderHex: '#E2DDD5' },
  { id: 'gold', name: 'Antique Gold', hex: '#C4A46C', textHex: '#FFFFFF', borderHex: '#D4AF37' },
];

function formatIndoDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthName = months[parseInt(m, 10) - 1] || m;
    return `${parseInt(d, 10)} ${monthName} ${y}`;
  } catch (e) {
    return dateStr;
  }
}

export default function ClientSetupPage() {
  const { 
    currentSlug, 
    activeEvent, 
    events, 
    updateEventConfig, 
    navigateToEvent,
    navigateToAdmin,
    introReady
  } = useBooth();

  const { toast } = useToast();

  // If slug doesn't match an existing event, fallback to first event
  const event = activeEvent || events.find(e => e.slug === currentSlug) || events[0];
  const isWedding = (event?.eventType || 'wedding') === 'wedding';

  // Form State
  const [heroPhotos, setHeroPhotos] = useState(event?.heroPhotos || DEFAULT_HERO_PHOTOS);
  const [eventName, setEventName] = useState(event?.eventName || (isWedding ? '' : (event?.displayName || '')));
  const [groomName, setGroomName] = useState(event?.groomName || 'Raka');
  const [brideName, setBrideName] = useState(event?.brideName || 'Sabrina');
  const [venue, setVenue] = useState(event?.venue || (isWedding ? 'Grand Ballroom Jakarta' : 'Venue Acara'));
  const [eventDate, setEventDate] = useState(event?.eventDate || '2026-05-30');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Live Preview State (Live Simulator)
  const [previewTab, setPreviewTab] = useState('hero'); // 'hero' | 'frame'
  const [previewPhotoIdx, setPreviewPhotoIdx] = useState(0);
  const [activeFrameThemeIdx, setActiveFrameThemeIdx] = useState(0);

  // Photo Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [activeCropIdx, setActiveCropIdx] = useState(null); // null = add new, number = re-crop existing

  const fileInputRef = useRef(null);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-serif font-bold text-[#6B111F] mb-2">Event Tidak Ditemukan</h2>
        <p className="text-stone-600 text-sm mb-4">Pastikan tautan pengaturan yang Anda buka sudah benar.</p>
        <button
          onClick={navigateToAdmin}
          className="px-6 py-2.5 rounded-full bg-[#6B111F] text-amber-100 font-semibold text-xs transition"
        >
          Buka Dashboard Admin
        </button>
      </div>
    );
  }

  // Handle uploading photos from device - opens Crop modal
  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (eventResult) => {
      const base64Url = eventResult.target.result;
      setCurrentCropImage(base64Url);
      setActiveCropIdx(null); // adding new photo
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Re-crop an existing photo
  const handleStartCropExisting = (idx) => {
    setCurrentCropImage(heroPhotos[idx]);
    setActiveCropIdx(idx);
    setCropModalOpen(true);
  };

  // When crop is finished in modal
  const handleCropComplete = (croppedBase64) => {
    if (activeCropIdx !== null) {
      setHeroPhotos(prev => prev.map((p, i) => i === activeCropIdx ? croppedBase64 : p));
      toast('Foto berhasil disesuaikan', 'success');
    } else {
      setHeroPhotos(prev => [...prev, croppedBase64]);
      toast('Foto baru berhasil ditambahkan', 'success');
    }
    setCropModalOpen(false);
    setCurrentCropImage(null);
    setActiveCropIdx(null);
    setIsSaved(false);
  };

  // Make any photo the #1 Cover Photo
  const handleSetCoverPhoto = (idx) => {
    if (idx === 0) return;
    setHeroPhotos(prev => {
      const copy = [...prev];
      const selected = copy.splice(idx, 1)[0];
      return [selected, ...copy];
    });
    setPreviewPhotoIdx(0);
    setIsSaved(false);
    toast('Foto dijadikan Cover Utama', 'success');
  };

  const handleAddUrl = () => {
    if (!newPhotoUrl.trim()) return;
    setCurrentCropImage(newPhotoUrl.trim());
    setActiveCropIdx(null);
    setCropModalOpen(true);
    setNewPhotoUrl('');
    setShowUrlInput(false);
  };

  const handleRemovePhoto = (idx) => {
    setHeroPhotos((prev) => prev.filter((_, i) => i !== idx));
    setIsSaved(false);
    toast('Foto dihapus', 'info');
  };

  // Save all changes
  const handleSaveAll = () => {
    updateEventConfig(event.id, {
      eventType: event.eventType || 'wedding',
      eventName,
      groomName,
      brideName,
      venue,
      eventDate,
      heroPhotos,
    });
    setIsSaved(true);
    toast('Semua perubahan berhasil disimpan & langsung aktif di web utama!', 'success');
  };

  const guestUrl = `${window.location.origin}/${event.slug}`;

  const handleCopyGuestLink = () => {
    navigator.clipboard.writeText(guestUrl);
    toast('Tautan web tamu berhasil disalin', 'success');
  };

  // Display Name logic: wedding = groom & bride, non-wedding = eventName
  const combinedDisplayName = isWedding
    ? ((groomName && brideName) ? `${groomName} & ${brideName}` : (groomName || brideName || event.displayName || 'Mempelai'))
    : (eventName || event.displayName || 'Event');

  const formattedDisplayDate = formatIndoDate(eventDate) || event.formattedDate || '30 Mei 2026';
  const activeStripTheme = PREVIEW_FRAME_THEMES[activeFrameThemeIdx] || PREVIEW_FRAME_THEMES[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-36 selection:bg-[#6B111F]/20 selection:text-[#6B111F] relative overflow-x-hidden"
    >
      {/* ================= 🌌 LUXURY WARM AMBIENT BACKDROP 🌌 ================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 235, 224, 0.9) 0%, rgba(253, 251, 247, 0.95) 60%, #FDFBF7 100%)'
          }}
        />

        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-3xl h-80 pointer-events-none opacity-20 blur-[110px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(107, 17, 31, 0.6) 0%, rgba(229, 193, 88, 0.3) 50%, transparent 80%)'
          }}
        />
      </div>

      {/* Hidden File Input for Device Gallery Upload */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileUpload} 
      />

      {/* ================= 🌟 1. MINIMALIST TOP NAV BAR (LUXURY IVORY GLASS) 🌟 ================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-200/80 px-4 py-3.5 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-[#8C7A6B] uppercase font-bold">
              {isWedding ? 'PORTAL PENGANTIN' : 'PORTAL PENYELENGGARA'}
            </span>
            <h2 className="text-sm font-serif font-bold text-stone-900 tracking-wide truncate max-w-[200px] xs:max-w-[280px]">
              {combinedDisplayName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToEvent(event.slug)}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-stone-100 border border-stone-200 text-xs font-serif font-medium text-stone-800 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
              title="Lihat Pratinjau Tampilan Web Tamu"
            >
              <span>Web Tamu</span>
              <ExternalLink size={12} className="text-[#6B111F]" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= 🌟 2. MAIN CONTENT (IPHONE DOWNWARD FLOW) 🌟 ================= */}
      <main className="max-w-xl mx-auto px-4 sm:px-5 pt-5 space-y-5 relative z-10">

        {/* Group A: Hero Greeting Card */}
        <div className="rounded-3xl bg-white border border-[#EADBCC]/80 p-5 sm:p-6 shadow-[0_8px_30px_rgba(107,17,31,0.04)] relative overflow-hidden">
          <div className="relative z-10">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.25em] text-[#8C7A6B] mb-1 font-bold">
              {isWedding ? 'ATUR PHOTOBOOTH PERNIKAHAN' : 'ATUR PHOTOBOOTH ACARA'}
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              {isWedding ? 'Persiapkan Sambutan Tamu' : 'Persiapkan Display Photobooth Acara'}
            </h1>
            <p className="text-stone-600 text-xs mt-1.5 leading-relaxed">
              {isWedding 
                ? 'Atur nama kedua mempelai dan foto prewedding yang akan menyambut seluruh tamu undangan saat memindai QR code di meja resepsi.'
                : 'Atur nama acara, lokasi venue, serta foto display/poster yang menyambut pengunjung saat memindai QR code di photobooth event.'}
            </p>

            {/* Quick Guest Link Bar */}
            <div className="mt-4 pt-3.5 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-stone-600 truncate max-w-[220px]">
                <span className="text-stone-400">Tautan:</span>
                <span className="text-[#6B111F] font-bold truncate">/{event.slug}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyGuestLink}
                  className="px-3 py-1 rounded-full bg-[#FAF7F2] hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Share2 size={12} className="text-[#8C7A6B]" />
                  <span>Salin</span>
                </button>
                <button
                  onClick={() => navigateToEvent(event.slug)}
                  className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 text-[#F5D77F] border border-[#F5D77F]/30 text-xs font-serif font-bold flex items-center gap-1 shadow-md shadow-rose-950/15 transition active:scale-95 cursor-pointer"
                >
                  <Eye size={12} />
                  <span>Buka Web</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 📱 GROUP LIVE PREVIEW (GAMBARAN LAYAR TAMU LANGSUNG) 📱 ================= */}
        <div className="rounded-3xl bg-white border border-[#EADBCC]/90 p-5 sm:p-6 shadow-[0_12px_35px_rgba(107,17,31,0.06)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C7A6B] font-bold block">
                SIMULASI LANGSUNG
              </span>
              <h3 className="text-sm font-serif font-bold text-stone-900">
                Gambaran di Layar HP Tamu
              </h3>
            </div>

            {/* Toggle Preview Mode */}
            <div className="inline-flex p-1 rounded-full bg-[#FAF7F2] border border-[#E5DACB] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPreviewTab('hero')}
                className={`px-3.5 py-1 rounded-full text-xs font-serif font-bold transition cursor-pointer ${
                  previewTab === 'hero' 
                    ? 'bg-[#6B111F] text-[#F5D77F] shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Beranda Tamu
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('frame')}
                className={`px-3.5 py-1 rounded-full text-xs font-serif font-bold transition cursor-pointer ${
                  previewTab === 'frame' 
                    ? 'bg-[#6B111F] text-[#F5D77F] shadow-xs' 
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Hasil Strip Foto
              </button>
            </div>
          </div>

          {/* Interactive Phone Simulation Frame */}
          <div className="relative mx-auto w-full max-w-[320px] xs:max-w-[330px] rounded-[36px] bg-stone-950 p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] border-[5px] border-stone-800 select-none">
            {/* iPhone Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-stone-900 rounded-full z-40 flex items-center justify-between px-2.5 pointer-events-none">
              <div className="w-2 h-2 rounded-full bg-stone-950" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A24]" />
            </div>

            {/* Phone Screen Interior */}
            <div className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden bg-[#10060E]">
              
              {/* TAB 1: Beranda Sambutan Tamu (Event Hero) */}
              {previewTab === 'hero' && (
                <div className="w-full h-full relative flex flex-col justify-between p-4 text-center">
                  {/* Backdrop Photo (Updates Live from Cover Photo) */}
                  <img 
                    src={heroPhotos[previewPhotoIdx] || heroPhotos[0] || DEFAULT_HERO_PHOTOS[0]} 
                    alt="Preview Backdrop" 
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.82] contrast-105"
                  />

                  {/* Romantic Shadow Vignettes */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/25 to-black/90 pointer-events-none" />

                  {/* Top Wedding Names & Header */}
                  <div className="relative z-10 pt-5 flex flex-col items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-sans font-semibold text-amber-200 uppercase tracking-[0.2em] border border-white/15 shadow-sm">
                      {isWedding 
                        ? 'THE WEDDING CELEBRATION OF' 
                        : (event.eventType === 'concert' 
                            ? 'OFFICIAL FESTIVAL PHOTOBOOTH' 
                            : (event.eventType === 'exhibition' 
                                ? 'EXHIBITION PHOTOBOOTH' 
                                : (event.eventType === 'festival' 
                                    ? 'OFFICIAL EXPO PHOTOBOOTH' 
                                    : 'OFFICIAL EVENT PHOTOBOOTH')))}
                    </span>

                    {/* Live Couple Calligraphy or Modern Bold Display */}
                    <h1 
                      style={isWedding ? { 
                        fontFamily: "'Alex Brush', 'Great Vibes', cursive",
                        textShadow: '0 3px 20px rgba(0,0,0,0.9), 0 0 30px rgba(245,215,127,0.4)'
                      } : {
                        fontFamily: "'Playfair Display', Georgia, serif",
                        textShadow: '0 3px 20px rgba(0,0,0,0.9), 0 0 30px rgba(245,215,127,0.3)',
                        letterSpacing: '-0.02em'
                      }}
                      className={`${isWedding ? 'text-4xl xs:text-5xl font-normal' : 'text-2xl xs:text-3xl font-serif font-black tracking-tight'} text-white leading-tight mt-1 px-1 drop-shadow-2xl`}
                    >
                      {combinedDisplayName}
                    </h1>

                    {/* Live Date & Venue */}
                    <div className="mt-1 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15">
                      <p className="text-[9.5px] text-rose-100 font-medium">
                        {formattedDisplayDate} • {venue || event.venue || (isWedding ? 'Grand Ballroom Jakarta' : 'Venue Acara')}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Photobooth Action Buttons Simulation */}
                  <div className="relative z-10 pb-2 space-y-2">
                    <div className="flex flex-col gap-1.5 w-full max-w-[220px] mx-auto">
                      <div className="py-2 px-3 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] text-[#F5D77F] border border-amber-300/40 text-[11px] font-serif font-bold shadow-lg flex items-center justify-center gap-1.5">
                        <Camera size={12} />
                        <span>Mulai Photobooth</span>
                      </div>
                      <div className="py-1.5 px-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium flex items-center justify-center">
                        Lihat Galeri Foto
                      </div>
                    </div>

                    {/* Prewedding Slide Dots Preview */}
                    {heroPhotos.length > 1 && (
                      <div className="flex items-center justify-center gap-1 pt-1">
                        {heroPhotos.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setPreviewPhotoIdx(i)}
                            className={`rounded-full transition-all cursor-pointer ${
                              i === previewPhotoIdx 
                                ? 'w-4 h-1.5 bg-[#F5D77F]' 
                                : 'w-1.5 h-1.5 bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Hasil Strip Foto Tamu (Frame Preview) */}
              {previewTab === 'frame' && (
                <div className="w-full h-full relative bg-[#F5EFEB] flex flex-col justify-between p-3.5 overflow-hidden">
                  {/* Subtle Studio Light */}
                  <div className="absolute inset-0 bg-radial from-white/70 to-transparent pointer-events-none" />

                  {/* Mode Badge at Top */}
                  <div className="relative z-10 text-center pt-4 pb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[8px] font-mono tracking-widest uppercase">
                      Pratinjau Hasil Strip
                    </span>
                  </div>

                  {/* Photobooth Strip Mockup */}
                  <div 
                    className="relative z-10 mx-auto w-[160px] xs:w-[170px] rounded-xl shadow-2xl p-2 flex flex-col justify-between transition-colors duration-300"
                    style={{ 
                      backgroundColor: activeStripTheme.hex,
                      color: activeStripTheme.textHex,
                      border: `1.5px solid ${activeStripTheme.borderHex}`
                    }}
                  >
                    {/* Header Strip */}
                    <div className="text-center pb-1">
                      <span className="text-[6.5px] font-mono tracking-widest block uppercase opacity-80">
                        {isWedding ? 'THE WEDDING OF' : 'OFFICIAL PHOTOBOOTH'}
                      </span>
                      <strong 
                        className="text-[9.5px] font-serif tracking-wide block truncate"
                        style={{ color: activeStripTheme.textHex }}
                      >
                        {combinedDisplayName}
                      </strong>
                    </div>

                    {/* Photo Cuts (Simulated Guest Poses with Prewedding Photos) */}
                    <div className="space-y-1.5 py-1">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/20 border border-black/10">
                        <img 
                          src={heroPhotos[0] || DEFAULT_HERO_PHOTOS[0]} 
                          alt="Pose 1" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/20 border border-black/10">
                        <img 
                          src={heroPhotos[1] || heroPhotos[0] || DEFAULT_HERO_PHOTOS[1]} 
                          alt="Pose 2" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>

                    {/* Footer Strip */}
                    <div className="text-center pt-1 border-t border-black/10">
                      <span className="text-[6.5px] font-mono opacity-80">
                        {formattedDisplayDate}
                      </span>
                    </div>
                  </div>

                  {/* Theme Switcher Controls */}
                  <div className="relative z-10 pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveFrameThemeIdx((prev) => (prev - 1 + PREVIEW_FRAME_THEMES.length) % PREVIEW_FRAME_THEMES.length)}
                      className="p-1 rounded-full bg-white text-stone-700 shadow-sm border border-stone-200 cursor-pointer"
                      title="Tema Sebelumnya"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <span className="text-[10px] font-serif font-bold text-stone-800">
                      {activeStripTheme.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveFrameThemeIdx((prev) => (prev + 1) % PREVIEW_FRAME_THEMES.length)}
                      className="p-1 rounded-full bg-white text-stone-700 shadow-sm border border-stone-200 cursor-pointer"
                      title="Tema Berikutnya"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Friendly UX Caption */}
          <p className="text-stone-500 text-[11px] text-center max-w-sm mx-auto leading-relaxed pt-1">
            Simulasi di atas langsung bereaksi saat Anda mengubah nama atau foto di bawah. Hasil inilah yang akan tampil di ponsel para tamu.
          </p>
        </div>

        {/* Group B: Informasi Mempelai atau Acara */}
        <div className="rounded-3xl bg-white border border-[#EADBCC]/80 p-5 sm:p-6 shadow-[0_8px_30px_rgba(107,17,31,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6B111F] font-bold">
              {isWedding ? '01 • INFORMASI MEMPELAI' : '01 • INFORMASI ACARA & LOKASI'}
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              Tercetak di foto tamu
            </span>
          </div>

          <div className="space-y-3.5">
            {isWedding ? (
              <>
                {/* 1. Mempelai Pria First */}
                <div>
                  <label className="text-xs text-stone-700 font-medium block mb-1.5">
                    Nama Panggilan Mempelai Pria
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Raka"
                    value={groomName}
                    onChange={(e) => {
                      setGroomName(e.target.value);
                      setIsSaved(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-sm focus:outline-none focus:border-[#6B111F] focus:bg-white focus:ring-2 focus:ring-[#6B111F]/10 transition placeholder-stone-400 font-serif"
                  />
                </div>

                {/* 2. Mempelai Wanita Second */}
                <div>
                  <label className="text-xs text-stone-700 font-medium block mb-1.5">
                    Nama Panggilan Mempelai Wanita
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sabrina"
                    value={brideName}
                    onChange={(e) => {
                      setBrideName(e.target.value);
                      setIsSaved(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-sm focus:outline-none focus:border-[#6B111F] focus:bg-white focus:ring-2 focus:ring-[#6B111F]/10 transition placeholder-stone-400 font-serif"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Nama Acara */}
                <div>
                  <label className="text-xs text-stone-700 font-medium block mb-1.5">
                    Nama Acara / Festival / Pameran
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pestapora 2026 / Void Vision Exhibition / Jakcloth Fest"
                    value={eventName}
                    onChange={(e) => {
                      setEventName(e.target.value);
                      setIsSaved(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-sm focus:outline-none focus:border-[#6B111F] focus:bg-white focus:ring-2 focus:ring-[#6B111F]/10 transition placeholder-stone-400 font-serif"
                  />
                </div>

                {/* Lokasi / Venue */}
                <div>
                  <label className="text-xs text-stone-700 font-medium block mb-1.5">
                    Lokasi / Venue Acara
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gambir Expo Kemayoran Jakarta / Spazio Hall Surabaya"
                    value={venue}
                    onChange={(e) => {
                      setVenue(e.target.value);
                      setIsSaved(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-sm focus:outline-none focus:border-[#6B111F] focus:bg-white focus:ring-2 focus:ring-[#6B111F]/10 transition placeholder-stone-400 font-sans"
                  />
                </div>
              </>
            )}

            {/* Tanggal */}
            <div>
              <label className="text-xs text-stone-700 font-medium block mb-1.5">
                {isWedding ? 'Tanggal Pernikahan' : 'Tanggal Penyelenggaraan'}
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-sm focus:outline-none focus:border-[#6B111F] focus:bg-white focus:ring-2 focus:ring-[#6B111F]/10 transition font-sans"
              />
            </div>
          </div>

          {/* Live Preview Display Box (Matching Lampiran 2 Pill Style) */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8EB] border border-[#F5E2B8] flex items-center justify-between text-xs">
            <span className="text-[#8C6D32] font-medium">Judul di Layar Tamu:</span>
            <span className="font-serif font-bold text-[#6B111F] text-base tracking-wide">
              {combinedDisplayName}
            </span>
          </div>
        </div>

        {/* Group C: Foto Prewedding atau Display Event */}
        <div className="rounded-3xl bg-white border border-[#EADBCC]/80 p-5 sm:p-6 shadow-[0_8px_30px_rgba(107,17,31,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6B111F] font-bold">
              {isWedding ? `02 • FOTO PREWEDDING (${heroPhotos.length})` : `02 • FOTO COVER & DISPLAY ACARA (${heroPhotos.length})`}
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              Slideshow Layar Tamu
            </span>
          </div>

          {/* Friendly UX Guidance: Landscape & Portrait Information */}
          <div className="rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-stone-900">
              <Info size={15} className="text-[#6B111F] flex-shrink-0" />
              <span>{isWedding ? 'Panduan Format Foto (Landscape & Portrait)' : 'Panduan Foto / Poster Acara (Landscape & Portrait)'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-3 rounded-xl bg-white border border-[#EADBCC]/70 space-y-1 shadow-xs">
                <span className="font-semibold text-[#6B111F] flex items-center gap-1.5">
                  Foto Landscape (Mendatar)
                </span>
                <p className="text-stone-600 leading-relaxed">
                  {isWedding 
                    ? 'Format paling umum dari fotografer. Sangat cocok! Bagian tengah kedua mempelai akan otomatis menjadi fokus di layar ponsel para tamu.'
                    : 'Format mendatar atau dokumentasi stage/venue. Area tengah otomatis menjadi fokus utama di ponsel pengunjung.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#EADBCC]/70 space-y-1 shadow-xs">
                <span className="font-semibold text-[#8A1828] flex items-center gap-1.5">
                  Foto Portrait (Tegak)
                </span>
                <p className="text-stone-600 leading-relaxed">
                  {isWedding 
                    ? 'Juga sangat bagus karena otomatis mengisi penuh layar ponsel para tamu dari atas ke bawah.'
                    : 'Format poster resmi atau flyer line-up. Otomatis mengisi layar smartphone pengunjung secara presisi.'}
                </p>
              </div>
            </div>

            <div className="text-[10.5px] font-mono text-stone-500 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-stone-200/60">
              <span>Format: JPG, PNG, WEBP, atau kamera HP (Maks. 15 MB)</span>
              <span className="text-[#6B111F] font-semibold">Foto #1 otomatis jadi Cover Pembuka</span>
            </div>
          </div>

          {/* Photos Cards - Wide Aspect Ratio for Landscape & Portrait Harmony */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {heroPhotos.map((photoUrl, idx) => (
              <div 
                key={idx}
                className={`relative aspect-[16/11] rounded-2xl overflow-hidden bg-stone-100 border transition shadow-sm group ${
                  idx === 0 
                    ? 'border-[#6B111F] ring-2 ring-[#6B111F]/20 shadow-[0_4px_20px_rgba(107,17,31,0.12)]' 
                    : 'border-stone-200'
                }`}
              >
                {/* Image Display */}
                <img 
                  src={photoUrl} 
                  alt={`Prewedding ${idx + 1}`}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />

                {/* Top Overlay Badges */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-20 pointer-events-none">
                  {idx === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6B111F] text-[9.5px] font-mono text-[#F5D77F] font-bold border border-[#F5D77F]/30 shadow-md">
                      Cover Utama #1
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9.5px] font-mono text-white font-bold border border-white/15 shadow-sm">
                      Foto #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Bottom Action Controls (Always accessible & comfortable on mobile) */}
                <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/85 via-black/60 to-transparent flex items-center justify-between gap-1.5 z-20">
                  {idx !== 0 ? (
                    <button
                      type="button"
                      onClick={() => handleSetCoverPhoto(idx)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-[10.5px] font-serif font-semibold text-stone-900 border border-stone-200 shadow-sm transition active:scale-95 cursor-pointer"
                      title="Jadikan foto pembuka utama"
                    >
                      Jadikan Cover
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-200 pl-1 font-medium">
                      Cover Aktif
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleStartCropExisting(idx)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 text-[10.5px] font-serif font-medium flex items-center gap-1 shadow-sm border border-stone-200 transition active:scale-95 cursor-pointer"
                      title="Sesuaikan posisi foto (Landscape / Portrait)"
                    >
                      <Crop size={11} className="text-[#6B111F]" />
                      <span>Sesuaikan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-sm transition active:scale-95 cursor-pointer"
                      title="Hapus foto"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Big "Upload Photo" Tap Card */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[16/11] rounded-2xl border-2 border-dashed border-[#EADBCC] hover:border-[#6B111F] bg-[#FAF7F2] hover:bg-[#F5EFEB] flex flex-col items-center justify-center p-4 text-center transition active:scale-98 cursor-pointer shadow-xs group"
            >
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#6B111F] mb-2 border border-[#EADBCC] group-hover:scale-105 transition shadow-xs">
                <Plus size={20} />
              </div>
              <span className="text-xs font-serif font-bold text-stone-900 block">
                {isWedding ? 'Unggah Foto Prewedding' : 'Unggah Foto / Poster Acara'}
              </span>
              <span className="text-[10.5px] text-stone-500 mt-0.5 block">
                {isWedding ? 'Bisa Foto Landscape maupun Portrait' : 'Format Poster, Stage, atau Dokumentasi'}
              </span>
            </button>
          </div>

          {/* Optional: Add via Image URL Collapsible */}
          <div className="pt-1">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="text-[11px] text-stone-500 hover:text-[#6B111F] underline transition"
              >
                + Atau masukkan tautan gambar (URL)
              </button>
            ) : (
              <div className="flex gap-2 items-center pt-1">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#EADBCC] text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#6B111F] font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3.5 py-2 rounded-xl bg-[#6B111F] hover:bg-[#8A1828] text-[#F5D77F] border border-[#F5D77F]/30 text-xs font-serif font-bold transition cursor-pointer shadow-xs"
                >
                  Tambah
                </button>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* ================= 🌟 3. STICKY BOTTOM ACTION BAR (LUXURY IVORY GLASS DOCK) 🌟 ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-[#EADBCC]/90 px-4 pt-2.5 pb-3 sm:pb-3.5 z-40 shadow-[0_-8px_30px_rgba(107,17,31,0.06)]">
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          
          {/* Micro Status Bar (Full Width - Never Truncated) */}
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[#8C7A6B] font-semibold">
              STATUS SISTEM
            </span>
            <span>
              {isSaved ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Tersimpan & Aktif di Web Tamu
                </span>
              ) : (
                <span className="text-amber-800 font-medium flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Perubahan belum disimpan
                </span>
              )}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigateToEvent(event.slug)}
              className="px-4 py-2.5 sm:py-3 rounded-full bg-[#FAF7F2] hover:bg-stone-100 active:scale-95 border border-[#EADBCC] text-stone-800 text-xs sm:text-sm font-serif font-medium flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap flex-shrink-0"
              title="Buka Tampilan Web Tamu Utama"
            >
              <Eye size={14} className="text-[#6B111F]" />
              <span>Web Tamu</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="flex-1 py-2.5 sm:py-3 px-6 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] active:scale-95 text-[#F5D77F] border border-[#F5D77F]/40 text-xs sm:text-sm font-serif font-bold flex items-center justify-center shadow-md shadow-rose-950/20 transition cursor-pointer whitespace-nowrap tracking-wide"
            >
              <span>Simpan Pengaturan</span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= 🌟 PHOTO CROP MODAL 🌟 ================= */}
      <PhotoCropModal
        isOpen={cropModalOpen}
        imageUrl={currentCropImage}
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setCropModalOpen(false);
          setCurrentCropImage(null);
          setActiveCropIdx(null);
        }}
        title={isWedding ? 'Sesuaikan Foto Prewedding (Landscape / Portrait)' : 'Sesuaikan Foto / Poster Acara (Landscape / Portrait)'}
      />

    </motion.div>
  );
}
