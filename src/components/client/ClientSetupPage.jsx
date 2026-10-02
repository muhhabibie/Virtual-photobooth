import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Image as ImageIcon, Save, Check, 
  Trash2, Plus, ExternalLink, Eye, Share2, Upload, Crop,
  Info, Sparkle, Layers
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import PhotoCropModal from '../ui/PhotoCropModal';
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
  const [heroPhotos, setHeroPhotos] = useState(event?.heroPhotos || []);
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
      <div className="min-h-screen bg-[#0F0E11] text-white flex flex-col items-center justify-center p-6 text-center">
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
    toast('Semua perubahan berhasil disimpan', 'success');
  };

  const guestUrl = `${window.location.origin}/${event.slug}`;

  const handleCopyGuestLink = () => {
    navigator.clipboard.writeText(guestUrl);
    toast('Tautan web tamu berhasil disalin', 'success');
  };

  const combinedDisplayName = (brideName && groomName) 
    ? `${brideName} & ${groomName}` 
    : (event.displayName || 'Mempelai');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={introReady ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0F0E11] text-gray-100 font-sans pb-32 selection:bg-white/20 selection:text-white relative"
    >
      {/* Subtle Monochrome Ambient Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-72 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07)_0%,transparent_70%)] pointer-events-none" />

      {/* Hidden File Input for Device Gallery Upload */}
      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*" 
        className="hidden" 
        onChange={handleFileUpload} 
      />

      {/* ================= 🌟 1. MINIMALIST TOP NAV BAR (IOS STYLE) 🌟 ================= */}
      <header className="sticky top-0 z-40 bg-[#0F0E11]/85 backdrop-blur-xl border-b border-white/10 px-4 py-3.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
              PENGATURAN ACARA
            </span>
            <h2 className="text-sm font-serif font-bold text-white tracking-wide truncate max-w-[200px] xs:max-w-[260px]">
              {combinedDisplayName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateToEvent(event.slug)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs text-stone-300 hover:text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Lihat Pratinjau Tampilan Web Tamu"
            >
              <span>Web Tamu</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= 🌟 2. MAIN CONTENT (SINGLE PAGE DOWNWARD FLOW) 🌟 ================= */}
      <main className="max-w-xl mx-auto px-4 sm:px-5 pt-5 space-y-5 relative z-10">

        {/* Group A: Hero Header Card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-sm">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
            Pengaturan Photobooth
          </h1>
          <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">
            Sesuaikan nama mempelai, tanggal pernikahan, dan foto cover prewedding yang akan menyambut tamu saat memindai kode di meja.
          </p>

          {/* Quick Guest Link Bar */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-stone-400 truncate max-w-[220px]">
              <span className="text-stone-500">Tautan:</span>
              <span className="text-white font-semibold truncate">/{event.slug}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyGuestLink}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1 transition active:scale-95 cursor-pointer"
              >
                <Share2 size={12} />
                <span>Salin</span>
              </button>
              <button
                onClick={() => navigateToEvent(event.slug)}
                className="px-3 py-1 rounded-full bg-white text-stone-950 text-xs font-bold flex items-center gap-1 hover:bg-stone-200 transition active:scale-95 cursor-pointer"
              >
                <Eye size={12} />
                <span>Buka</span>
              </button>
            </div>
          </div>
        </div>

        {/* Group B: Informasi Mempelai (iOS Grouped Fields) */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
              01 • INFORMASI MEMPELAI
            </h3>
            <span className="text-[10px] font-mono text-stone-500">
              Otomatis tercetak di foto
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-stone-300 font-medium block mb-1.5">
                Nama Mempelai Wanita
              </label>
              <input
                type="text"
                placeholder="Contoh: Sabrina"
                value={brideName}
                onChange={(e) => {
                  setBrideName(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40 transition placeholder-stone-600 font-serif"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 font-medium block mb-1.5">
                Nama Mempelai Pria
              </label>
              <input
                type="text"
                placeholder="Contoh: Raka"
                value={groomName}
                onChange={(e) => {
                  setGroomName(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40 transition placeholder-stone-600 font-serif"
              />
            </div>

            <div>
              <label className="text-xs text-stone-300 font-medium block mb-1.5">
                Tanggal Pernikahan
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => {
                  setEventDate(e.target.value);
                  setIsSaved(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-white text-sm focus:outline-none focus:border-white/40 transition font-sans"
              />
            </div>
          </div>

          {/* Live Preview Display Box */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs">
            <span className="text-stone-400">Judul Tampilan:</span>
            <span className="font-serif font-bold text-white text-sm tracking-wide">
              {combinedDisplayName}
            </span>
          </div>
        </div>

        {/* Group C: Foto Prewedding (Cover Selamat Datang Tamu) */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
              02 • FOTO PREWEDDING ({heroPhotos.length})
            </h3>
            <span className="text-[10px] font-mono text-stone-500">
              Slideshow Layar Tamu
            </span>
          </div>

          {/* Friendly UX Guidance Card */}
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <Info size={14} className="text-stone-300 flex-shrink-0" />
              <span>Panduan Format & Ukuran Foto</span>
            </div>
            <ul className="text-[11px] text-stone-400 space-y-1.5 pl-5 list-disc leading-relaxed">
              <li>
                <strong className="text-stone-200">Format yang didukung:</strong> JPG, PNG, WEBP, atau HEIC (maksimal 15 MB per file).
              </li>
              <li>
                <strong className="text-stone-200">Rasio rekomendasi:</strong> Orientasi <strong className="text-white">Portrait 3:4</strong> (atau 9:16) agar pas penuh di layar ponsel para tamu tanpa terpotong.
              </li>
              <li>
                <strong className="text-stone-200">Foto Utama:</strong> Foto urutan pertama (#1) akan otomatis menjadi cover selamat datang utama.
              </li>
            </ul>
          </div>

          {/* Photos Grid - Optimized for Mobile Touch */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {heroPhotos.map((photoUrl, idx) => (
              <div 
                key={idx}
                className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black/40 border border-white/15 group shadow-md"
              >
                <img 
                  src={photoUrl} 
                  alt={`Prewedding ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cover Badge for #1 */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[9px] font-mono text-white font-bold border border-white/20 z-10">
                    Cover Utama
                  </span>
                )}

                {/* Index Pill for Other Photos */}
                {idx > 0 && (
                  <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-stone-300 font-bold flex items-center justify-center border border-white/15 z-10">
                    {idx + 1}
                  </span>
                )}

                {/* Action Buttons Overlay (Touch-friendly) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 sm:transition-opacity flex flex-col justify-end p-2 gap-1.5 z-20">
                  <button
                    type="button"
                    onClick={() => handleStartCropExisting(idx)}
                    className="w-full py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium flex items-center justify-center gap-1 backdrop-blur-md transition cursor-pointer"
                  >
                    <Crop size={12} />
                    <span>Sesuaikan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="w-full py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-200 text-[11px] font-medium flex items-center justify-center gap-1 backdrop-blur-md transition cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Hapus</span>
                  </button>
                </div>

                {/* Mobile Always-visible Action Badges */}
                <div className="sm:hidden absolute bottom-1.5 inset-x-1.5 flex gap-1 z-10">
                  <button
                    type="button"
                    onClick={() => handleStartCropExisting(idx)}
                    className="flex-1 py-1 rounded bg-black/80 text-white text-[9px] font-medium flex items-center justify-center gap-1 backdrop-blur-xs"
                  >
                    <Crop size={10} />
                    <span>Crop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="p-1 rounded bg-red-950/80 text-red-300 flex items-center justify-center backdrop-blur-xs"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}

            {/* Big "Upload Photo" Tap Card */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] rounded-xl border border-dashed border-white/25 hover:border-white/50 bg-white/[0.02] hover:bg-white/[0.05] flex flex-col items-center justify-center p-3 text-center transition active:scale-98 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white mb-2">
                <Plus size={18} />
              </div>
              <span className="text-xs font-semibold text-white block">
                Tambah Foto
              </span>
              <span className="text-[10px] text-stone-400 mt-0.5 block">
                Pilih dari Galeri HP
              </span>
            </button>
          </div>

          {/* Optional: Add via Image URL Collapsible */}
          <div className="pt-2">
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
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white placeholder-stone-600 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3.5 py-2 rounded-xl bg-white text-stone-950 text-xs font-bold hover:bg-stone-200 transition cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Group D: Bingkai & Fitur Photobooth (Automated & Ready for Guests) */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Layers size={15} className="text-stone-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-stone-400 font-bold">
              03 • KOLEKSI BINGKAI PHOTOBOOTH
            </h3>
          </div>

          <p className="text-stone-300 text-xs leading-relaxed">
            Seluruh variasi bingkai eksklusif bertema pernikahan sudah <strong>otomatis aktif</strong>. Para tamu undangan bebas memilih bingkai favorit mereka secara langsung saat berfoto di acara:
          </p>

          {/* Clean Horizontal Scroll of Available Frames */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {FRAMES.map((f, i) => (
              <div 
                key={f.id || i}
                className="flex-shrink-0 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-stone-200 font-medium flex items-center gap-1.5"
              >
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ================= 🌟 3. STICKY BOTTOM ACTION BAR (IPHONE DOCK STYLE) 🌟 ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-[#0F0E11]/90 backdrop-blur-xl border-t border-white/10 p-3 sm:p-4 z-40">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="text-left hidden xs:block">
            <span className="text-[10px] font-mono text-stone-400 block">STATUS</span>
            <span className="text-xs font-medium text-white flex items-center gap-1">
              {isSaved ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <span className="text-stone-400">• Perubahan belum disimpan</span>
              )}
            </span>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex-1 xs:flex-none xs:px-8 py-3 rounded-full bg-white hover:bg-stone-200 active:scale-98 text-stone-950 text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
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
        title="Sesuaikan & Crop Foto Prewedding"
      />

    </motion.div>
  );
}
