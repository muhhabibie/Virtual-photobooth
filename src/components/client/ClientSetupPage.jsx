import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Image as ImageIcon, Save, Check, 
  Trash2, Plus, ExternalLink, Eye, Share2, Upload, Crop,
  Info, Sparkle, Layers, Star, Move
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import PhotoCropModal from '../ui/PhotoCropModal';
import { DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';
import { FRAMES } from '../../config/frames';

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

  // Form State
  const [heroPhotos, setHeroPhotos] = useState(event?.heroPhotos || DEFAULT_HERO_PHOTOS);
  const [brideName, setBrideName] = useState(event?.brideName || '');
  const [groomName, setGroomName] = useState(event?.groomName || '');
  const [eventDate, setEventDate] = useState(event?.eventDate || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Photo Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [activeCropIdx, setActiveCropIdx] = useState(null); // null = add new, number = re-crop existing

  const fileInputRef = useRef(null);

  if (!event) {
    return (
      <div className="min-h-screen bg-[#12070D] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-serif font-bold text-white mb-2">Event Tidak Ditemukan</h2>
        <p className="text-gray-400 text-sm mb-4">Pastikan tautan pengaturan yang Anda buka sudah benar.</p>
        <button
          onClick={navigateToAdmin}
          className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs transition"
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
    setIsSaved(false);
    toast('Foto dijadikan Cover Utama pembuka tamu 💍', 'success');
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
      brideName,
      groomName,
      eventDate,
      heroPhotos,
    });
    setIsSaved(true);
    toast('Semua perubahan berhasil disimpan & aktif ✨', 'success');
  };

  const guestUrl = `${window.location.origin}/${event.slug}`;

  const handleCopyGuestLink = () => {
    navigator.clipboard.writeText(guestUrl);
    toast('Tautan web tamu berhasil disalin', 'success');
  };

  const combinedDisplayName = (brideName && groomName) 
    ? `${brideName} & ${groomName}` 
    : (event.displayName || 'Mempelai');

  const backgroundPhoto = heroPhotos[0] || DEFAULT_HERO_PHOTOS[0];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={introReady ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#10060E] text-gray-100 font-sans pb-36 selection:bg-rose-900 selection:text-amber-200 relative overflow-x-hidden"
    >
      {/* ================= 🌌 CINEMATIC PHOTOGRAPHIC BACKDROP (IDENTIK DENGAN WEB TAMU) 🌌 ================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Dreamy Blurred Prewedding Photograph */}
        <img 
          src={backgroundPhoto} 
          alt="Backdrop" 
          className="w-full h-full object-cover filter brightness-[0.24] contrast-105 blur-[36px] scale-110 transition-all duration-1000"
        />

        {/* Multi-Stop Atmospheric Ambient Color Gradient Dissolve */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: `radial-gradient(ellipse at 50% 10%, rgba(138, 24, 40, 0.45) 0%, rgba(26, 8, 18, 0.70) 50%, rgba(14, 5, 11, 0.95) 100%)`
          }}
        />

        {/* Top Warm Golden Light Beam */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 pointer-events-none z-10 opacity-70 blur-[90px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245, 215, 127, 0.22) 0%, rgba(180, 40, 65, 0.15) 50%, transparent 80%)'
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

      {/* ================= 🌟 1. MINIMALIST TOP NAV BAR (IOS GLASS STYLE) 🌟 ================= */}
      <header className="sticky top-0 z-40 bg-[#140812]/80 backdrop-blur-2xl border-b border-white/10 px-4 py-3.5 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-[#F5D77F] uppercase font-semibold">
              PENGATURAN ACARA
            </span>
            <h2 className="text-sm font-serif font-bold text-white tracking-wide truncate max-w-[200px] xs:max-w-[280px]">
              {combinedDisplayName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToEvent(event.slug)}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs text-amber-100 hover:text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer backdrop-blur-md"
              title="Lihat Pratinjau Tampilan Web Tamu"
            >
              <span>Web Tamu</span>
              <ExternalLink size={12} className="text-[#F5D77F]" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= 🌟 2. MAIN CONTENT (IPHONE DOWNWARD FLOW) 🌟 ================= */}
      <main className="max-w-xl mx-auto px-4 sm:px-5 pt-5 space-y-5 relative z-10">

        {/* Group A: Hero Greeting Card */}
        <div className="rounded-3xl bg-[#1C0A17]/75 backdrop-blur-2xl border border-white/12 p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.65)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-[#8A1828]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-block text-[10px] font-mono uppercase tracking-[0.25em] text-[#F5D77F] mb-1 font-semibold">
              PORTAL MANDIRI PENGANTIN
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              Persiapkan Photobooth Pernikahan
            </h1>
            <p className="text-rose-100/75 text-xs mt-1.5 leading-relaxed">
              Atur foto prewedding dan nama kedua mempelai yang akan menyambut seluruh tamu undangan saat memindai QR code di meja.
            </p>

            {/* Quick Guest Link Bar */}
            <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-stone-300 truncate max-w-[220px]">
                <span className="text-stone-400">Tautan:</span>
                <span className="text-[#F5D77F] font-bold truncate">/{event.slug}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyGuestLink}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-stone-200 text-xs font-medium flex items-center gap-1 transition active:scale-95 cursor-pointer backdrop-blur-md"
                >
                  <Share2 size={12} />
                  <span>Salin</span>
                </button>
                <button
                  onClick={() => navigateToEvent(event.slug)}
                  className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 text-[#F5D77F] border border-[#F5D77F]/30 text-xs font-serif font-bold flex items-center gap-1 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <Eye size={12} />
                  <span>Buka Web</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Group B: Informasi Mempelai (iOS Grouped Fields) */}
        <div className="rounded-3xl bg-[#1C0A17]/75 backdrop-blur-2xl border border-white/12 p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.65)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#F5D77F] font-bold">
              01 • INFORMASI MEMPELAI
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              Tercetak di foto tamu
            </span>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs text-rose-100/90 font-medium block mb-1.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400/60 transition placeholder-stone-500 font-serif"
              />
            </div>

            <div>
              <label className="text-xs text-rose-100/90 font-medium block mb-1.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400/60 transition placeholder-stone-500 font-serif"
              />
            </div>

            <div>
              <label className="text-xs text-rose-100/90 font-medium block mb-1.5">
                Tanggal Pernikahan
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 text-white text-sm focus:outline-none focus:border-amber-400/60 transition font-sans"
              />
            </div>
          </div>

          {/* Live Preview Display Box */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs">
            <span className="text-stone-400">Judul di Layar Tamu:</span>
            <span className="font-serif font-bold text-[#F5D77F] text-sm tracking-wide">
              {combinedDisplayName}
            </span>
          </div>
        </div>

        {/* Group C: Foto Prewedding (Landscape & Portrait Responsive) */}
        <div className="rounded-3xl bg-[#1C0A17]/75 backdrop-blur-2xl border border-white/12 p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.65)] space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#F5D77F] font-bold">
              02 • FOTO PREWEDDING ({heroPhotos.length})
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              Slideshow Layar Tamu
            </span>
          </div>

          {/* Friendly UX Guidance: Landscape & Portrait Information */}
          <div className="rounded-2xl bg-black/45 border border-white/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-white">
              <Info size={15} className="text-[#F5D77F] flex-shrink-0" />
              <span>Panduan Format Foto (Landscape & Portrait)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="font-semibold text-[#F5D77F] flex items-center gap-1.5">
                  🖼️ Foto Landscape (Mendatar)
                </span>
                <p className="text-stone-300/80 leading-relaxed">
                  Format paling umum dari fotografer. Sangat cocok! Bagian tengah kedua mempelai akan otomatis menjadi fokus di layar ponsel para tamu.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                <span className="font-semibold text-rose-200 flex items-center gap-1.5">
                  📱 Foto Portrait (Tegak)
                </span>
                <p className="text-stone-300/80 leading-relaxed">
                  Juga sangat bagus karena otomatis mengisi penuh layar ponsel para tamu dari atas ke bawah.
                </p>
              </div>
            </div>

            <div className="text-[10.5px] font-mono text-stone-400 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-white/5">
              <span>Format: JPG, PNG, WEBP, atau kamera HP (Maks. 15 MB)</span>
              <span className="text-amber-300/80">★ Foto #1 otomatis jadi Cover Pembuka</span>
            </div>
          </div>

          {/* Photos Cards - Wide Aspect Ratio for Landscape & Portrait Harmony */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {heroPhotos.map((photoUrl, idx) => (
              <div 
                key={idx}
                className={`relative aspect-[16/11] rounded-2xl overflow-hidden bg-black/60 border transition shadow-md group ${
                  idx === 0 
                    ? 'border-[#F5D77F]/60 ring-1 ring-[#F5D77F]/40 shadow-[0_0_15px_rgba(245,215,127,0.15)]' 
                    : 'border-white/15'
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
                    <span className="px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md text-[9.5px] font-mono text-[#F5D77F] font-bold border border-[#F5D77F]/50 flex items-center gap-1 shadow-lg">
                      <Star size={10} className="fill-[#F5D77F]" />
                      <span>Cover Utama #1</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9.5px] font-mono text-stone-300 font-bold border border-white/15 shadow-sm">
                      Foto #{idx + 1}
                    </span>
                  )}
                </div>

                {/* Bottom Action Controls (Always accessible & comfortable on mobile) */}
                <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex items-center justify-between gap-1.5 z-20">
                  {idx !== 0 ? (
                    <button
                      type="button"
                      onClick={() => handleSetCoverPhoto(idx)}
                      className="px-2.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/90 text-[10.5px] font-serif font-semibold text-amber-200 border border-white/20 backdrop-blur-md transition active:scale-95 cursor-pointer flex items-center gap-1"
                      title="Jadikan foto pembuka utama"
                    >
                      <Star size={11} />
                      <span>Jadikan Cover</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-stone-400 pl-1">
                      Cover Aktif
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleStartCropExisting(idx)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[10.5px] font-serif font-medium flex items-center gap-1 backdrop-blur-md border border-white/20 transition active:scale-95 cursor-pointer"
                      title="Sesuaikan posisi foto (Landscape / Portrait)"
                    >
                      <Crop size={11} />
                      <span>Sesuaikan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="p-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/30 backdrop-blur-md transition active:scale-95 cursor-pointer"
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
              className="aspect-[16/11] rounded-2xl border-2 border-dashed border-white/20 hover:border-amber-400/50 bg-black/35 hover:bg-black/50 flex flex-col items-center justify-center p-4 text-center transition active:scale-98 cursor-pointer shadow-inner"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-[#F5D77F] mb-2 border border-white/15">
                <Plus size={20} />
              </div>
              <span className="text-xs font-serif font-bold text-white block">
                Unggah Foto Prewedding
              </span>
              <span className="text-[10.5px] text-stone-300 mt-0.5 block">
                Bisa Foto Landscape maupun Portrait
              </span>
            </button>
          </div>

          {/* Optional: Add via Image URL Collapsible */}
          <div className="pt-1">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="text-[11px] text-stone-400 hover:text-white underline transition"
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
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-stone-500 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3.5 py-2 rounded-xl bg-[#6B111F] hover:bg-[#8A1828] text-amber-200 border border-amber-400/30 text-xs font-serif font-bold transition cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Group D: Bingkai & Fitur Photobooth (Automated & Ready for Guests) */}
        <div className="rounded-3xl bg-[#1C0A17]/75 backdrop-blur-2xl border border-white/12 p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.65)] space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Layers size={15} className="text-[#F5D77F]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#F5D77F] font-bold">
              03 • KOLEKSI BINGKAI PHOTOBOOTH
            </h3>
          </div>

          <p className="text-rose-100/80 text-xs leading-relaxed">
            Seluruh koleksi bingkai pernikahan sudah <strong>otomatis aktif</strong>. Para tamu undangan bebas memilih variasi bingkai eksklusif favorit mereka secara langsung saat berfoto di acara:
          </p>

          {/* Clean Horizontal Scroll of Available Frames */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {FRAMES.map((f, i) => (
              <div 
                key={f.id || i}
                className="flex-shrink-0 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-stone-200 font-serif flex items-center gap-1.5 shadow-sm"
              >
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ================= 🌟 3. STICKY BOTTOM ACTION BAR (IPHONE DOCK STYLE) 🌟 ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-[#140812]/90 backdrop-blur-2xl border-t border-white/12 p-3 sm:p-4 z-40 shadow-2xl">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="text-left hidden xs:block">
            <span className="text-[9.5px] font-mono text-[#F5D77F] block uppercase tracking-wider">STATUS PENGATURAN</span>
            <span className="text-xs font-medium text-white flex items-center gap-1.5 mt-0.5">
              {isSaved ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Tersimpan & Aktif</span>
                </>
              ) : (
                <span className="text-amber-200/80">• Perubahan belum disimpan</span>
              )}
            </span>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex-1 xs:flex-none xs:px-9 py-3 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] active:scale-98 text-[#F5D77F] border border-[#F5D77F]/40 text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 shadow-xl shadow-rose-950/60 transition cursor-pointer"
          >
            <Check size={16} />
            <span>Simpan Pengaturan</span>
          </button>
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
        title="Sesuaikan Foto Prewedding (Landscape / Portrait)"
      />

    </motion.div>
  );
}
