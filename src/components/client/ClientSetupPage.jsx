import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Image as ImageIcon, Save, Check, 
  Trash2, Plus, ExternalLink, Eye, Share2, Upload, Crop,
  Info, Layers, Move
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

  // Form State - Mempelai Pria (groom) first, then Mempelai Wanita (bride)
  const [heroPhotos, setHeroPhotos] = useState(event?.heroPhotos || DEFAULT_HERO_PHOTOS);
  const [groomName, setGroomName] = useState(event?.groomName || 'Raka');
  const [brideName, setBrideName] = useState(event?.brideName || 'Sabrina');
  const [eventDate, setEventDate] = useState(event?.eventDate || '2026-05-30');
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
      groomName,
      brideName,
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

  // Mempelai Pria duluan, baru Mempelai Wanita (Raka & Sabrina)
  const combinedDisplayName = (groomName && brideName) 
    ? `${groomName} & ${brideName}` 
    : (event.displayName || 'Mempelai');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-36 selection:bg-[#6B111F]/20 selection:text-[#6B111F] relative overflow-x-hidden"
    >
      {/* ================= 🌌 LUXURY WARM AMBIENT BACKDROP 🌌 ================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Warm Champagne & Silk Radial Glow */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 235, 224, 0.9) 0%, rgba(253, 251, 247, 0.95) 60%, #FDFBF7 100%)'
          }}
        />

        {/* Gentle Top Burgundy Light Accenting Header */}
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
              PORTAL PENGANTIN
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
              ATUR PHOTOBOOTH PERNIKAHAN
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Persiapkan Sambutan Tamu
            </h1>
            <p className="text-stone-600 text-xs mt-1.5 leading-relaxed">
              Atur nama kedua mempelai dan foto prewedding yang akan menyambut seluruh tamu undangan saat memindai QR code di meja resepsi.
            </p>

            {/* Quick Guest Link Bar (Inspired by Lampiran 2 Undangan Box) */}
            <div className="mt-4 pt-3.5 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono text-stone-600 truncate max-w-[220px]">
                <span className="text-stone-400">Tautan:</span>
                <span className="text-[#6B111F] font-bold truncate">/{event.slug}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyGuestLink}
                  className="px-3 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-medium flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                >
                  <Share2 size={12} className="text-[#8C7A6B]" />
                  <span>Salin</span>
                </button>
                <button
                  onClick={() => navigateToEvent(event.slug)}
                  className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 text-[#F5D77F] border border-[#F5D77F]/30 text-xs font-serif font-bold flex items-center gap-1 shadow-md shadow-rose-950/15 transition active:scale-95 cursor-pointer"
                >
                  <Eye size={12} />
                  <span>Buka Web</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Group B: Informasi Mempelai (Mempelai Pria Dulu Baru Wanita) */}
        <div className="rounded-3xl bg-white border border-[#EADBCC]/80 p-5 sm:p-6 shadow-[0_8px_30px_rgba(107,17,31,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6B111F] font-bold">
              01 • INFORMASI MEMPELAI
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              Tercetak di foto tamu
            </span>
          </div>

          <div className="space-y-3.5">
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

            {/* 3. Tanggal Pernikahan */}
            <div>
              <label className="text-xs text-stone-700 font-medium block mb-1.5">
                Tanggal Pernikahan
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

        {/* Group C: Foto Prewedding (Landscape & Portrait Responsive) */}
        <div className="rounded-3xl bg-white border border-[#EADBCC]/80 p-5 sm:p-6 shadow-[0_8px_30px_rgba(107,17,31,0.04)] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6B111F] font-bold">
              02 • FOTO PREWEDDING ({heroPhotos.length})
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              Slideshow Layar Tamu
            </span>
          </div>

          {/* Friendly UX Guidance: Landscape & Portrait Information */}
          <div className="rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-serif font-bold text-stone-900">
              <Info size={15} className="text-[#6B111F] flex-shrink-0" />
              <span>Panduan Format Foto (Landscape & Portrait)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-3 rounded-xl bg-white border border-[#EADBCC]/70 space-y-1 shadow-xs">
                <span className="font-semibold text-[#6B111F] flex items-center gap-1.5">
                  Foto Landscape (Mendatar)
                </span>
                <p className="text-stone-600 leading-relaxed">
                  Format paling umum dari fotografer. Sangat cocok! Bagian tengah kedua mempelai akan otomatis menjadi fokus di layar ponsel para tamu.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#EADBCC]/70 space-y-1 shadow-xs">
                <span className="font-semibold text-[#8A1828] flex items-center gap-1.5">
                  Foto Portrait (Tegak)
                </span>
                <p className="text-stone-600 leading-relaxed">
                  Juga sangat bagus karena otomatis mengisi penuh layar ponsel para tamu dari atas ke bawah.
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
                Unggah Foto Prewedding
              </span>
              <span className="text-[10.5px] text-stone-500 mt-0.5 block">
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

        {/* Group D: Bingkai & Fitur Photobooth (Automated & Ready for Guests) */}
        <div className="rounded-3xl bg-white border border-[#EADBCC]/80 p-5 sm:p-6 shadow-[0_8px_30px_rgba(107,17,31,0.04)] space-y-3">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Layers size={15} className="text-[#6B111F]" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#6B111F] font-bold">
              03 • KOLEKSI BINGKAI PHOTOBOOTH
            </h3>
          </div>

          <p className="text-stone-600 text-xs leading-relaxed">
            Seluruh koleksi bingkai pernikahan sudah <strong>otomatis aktif</strong>. Para tamu undangan bebas memilih variasi bingkai eksklusif favorit mereka secara langsung saat berfoto di acara:
          </p>

          {/* Clean Horizontal Scroll of Available Frames */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {FRAMES.map((f, i) => (
              <div 
                key={f.id || i}
                className="flex-shrink-0 px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EADBCC] text-xs text-stone-800 font-serif flex items-center gap-1.5 shadow-xs"
              >
                <span>{f.name}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ================= 🌟 3. STICKY BOTTOM ACTION BAR (LUXURY IVORY GLASS DOCK) 🌟 ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-stone-200/90 p-3 sm:p-4 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="text-left hidden xs:block">
            <span className="text-[9.5px] font-mono text-[#8C7A6B] block uppercase tracking-wider font-semibold">
              STATUS PENGATURAN
            </span>
            <span className="text-xs font-medium text-stone-800 flex items-center gap-1.5 mt-0.5">
              {isSaved ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Tersimpan & Aktif</span>
                </>
              ) : (
                <span className="text-amber-800">• Perubahan belum disimpan</span>
              )}
            </span>
          </div>

          <button
            onClick={handleSaveAll}
            className="flex-1 xs:flex-none xs:px-9 py-3 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:from-[#520C16] hover:to-[#520C16] active:scale-98 text-[#F5D77F] border border-[#F5D77F]/40 text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 transition cursor-pointer"
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
