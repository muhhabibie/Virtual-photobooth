import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, Image as ImageIcon, Save, QrCode, Download, Check, 
  Trash2, Plus, ArrowRight, ExternalLink, Heart, Palette, Eye, Share2, Upload, Crop,
  Printer, Archive
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import { exportEventSubmissionsZip } from '../../utils/zipExport';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';
import QRCodeCanvas from '../ui/QRCodeCanvas';
import PhotoCropModal from '../ui/PhotoCropModal';
import TentCardModal from '../ui/TentCardModal';
import logoPhotobooth from '../../assets/logo photobooth.png';
import logoPhotoboothWhite from '../../assets/logo photobooth white.png';

const COLOR_PALETTES = [
  { id: 'burgundy', name: 'Royal Burgundy', hex: '#6B111F', textHex: '#F5D77F' },
  { id: 'ivory', name: 'Ivory Bliss', hex: '#FDFBF7', textHex: '#6B111F' },
  { id: 'slate', name: 'Noir Slate', hex: '#1E232A', textHex: '#E2E8F0' },
  { id: 'blush', name: 'Blush Romance', hex: '#F3C5CB', textHex: '#6B111F' },
  { id: 'antique', name: 'Antique Gold', hex: '#C4A46C', textHex: '#FFFFFF' },
];

export default function ClientSetupPage() {
  const { 
    currentSlug, 
    activeEvent, 
    events, 
    updateEventConfig, 
    updateEventHeroPhotos, 
    navigateToEvent,
    navigateToAdmin,
    introReady,
    savedSubmissions
  } = useBooth();

  const { toast } = useToast();

  // If slug doesn't match an existing event, fallback to first event or show selector
  const event = activeEvent || events.find(e => e.slug === currentSlug) || events[0];

  // Local state for editing
  const [heroPhotos, setHeroPhotos] = useState(event?.heroPhotos || []);
  const [selectedColorHex, setSelectedColorHex] = useState(event?.stripColor || '#6B111F');
  const [brideName, setBrideName] = useState(event?.brideName || '');
  const [groomName, setGroomName] = useState(event?.groomName || '');
  const [eventDate, setEventDate] = useState(event?.eventDate || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'theme' | 'qr'
  const [isSaved, setIsSaved] = useState(false);

  // Tent Card & ZIP Export State
  const [showTentCardModal, setShowTentCardModal] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Photo Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [activeCropIdx, setActiveCropIdx] = useState(null); // null = add new, number = re-crop existing

  const fileInputRef = useRef(null);

  // Handle Bulk ZIP Download for the couple
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      let eventSubs = (savedSubmissions || []).filter(s => s.eventSlug === event.slug || s.eventId === event.id);
      if (eventSubs.length === 0) {
        eventSubs = MOCK_GALLERY_PHOTOS;
      }
      toast(`Menyiapkan album ZIP kenangan pernikahan ${event.displayName}...`, 'info');
      const result = await exportEventSubmissionsZip({
        event,
        submissions: eventSubs,
        onProgress: ({ message }) => {
          // progress callback
        }
      });
      toast(`File ZIP berhasil diunduh (${result.totalPhotos} foto)! 💍`, 'success');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Gagal mengunduh ZIP', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-[#12070D] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-serif font-bold text-amber-200 mb-2">Event Tidak Ditemukan</h2>
        <p className="text-gray-400 text-sm mb-4">Pastikan link setup yang Anda buka sudah benar.</p>
        <button
          onClick={navigateToAdmin}
          className="px-6 py-2.5 rounded-full bg-[#6B111F] text-amber-200 font-serif text-sm font-bold shadow-lg"
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
      // Replace existing photo at index
      setHeroPhotos(prev => prev.map((p, i) => i === activeCropIdx ? croppedBase64 : p));
      toast('Foto berhasil di-crop & disesuaikan! ✨', 'success');
    } else {
      // Add as new photo
      setHeroPhotos(prev => [...prev, croppedBase64]);
      toast('Foto baru berhasil di-crop & ditambahkan! ✨', 'success');
    }
    setCropModalOpen(false);
    setCurrentCropImage(null);
    setActiveCropIdx(null);
    setIsSaved(false);
  };

  const handleAddUrl = () => {
    if (!newPhotoUrl.trim()) return;
    // Open crop modal directly for this URL so they can frame it
    setCurrentCropImage(newPhotoUrl.trim());
    setActiveCropIdx(null);
    setCropModalOpen(true);
    setNewPhotoUrl('');
  };

  const handleRemovePhoto = (idx) => {
    setHeroPhotos((prev) => prev.filter((_, i) => i !== idx));
    setIsSaved(false);
    toast('Foto dihapus dari daftar', 'info');
  };

  // Save all changes
  const handleSaveAll = () => {
    updateEventConfig(event.id, {
      brideName,
      groomName,
      eventDate,
      heroPhotos,
      stripColor: selectedColorHex,
    });
    setIsSaved(true);
    toast('Semua perubahan berhasil disimpan & aktif! ✨', 'success');
  };

  const guestUrl = `${window.location.origin}/${event.slug}`;

  const handleCopyGuestLink = () => {
    navigator.clipboard.writeText(guestUrl);
    toast('Link photobooth tamu berhasil disalin! 📋', 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={introReady ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#0E050A] text-gray-100 font-sans pb-24 selection:bg-rose-950 selection:text-amber-200"
    >
      
      {/* ================= 🌟 TOP HEADER 🌟 ================= */}
      <header className="sticky top-0 z-40 bg-[#140810]/95 backdrop-blur-md border-b border-amber-400/20 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Pure Letter N Logo - No Square Box */}
            <img 
              src={logoPhotoboothWhite} 
              alt="Sirklen Logo" 
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain" 
            />
            <div>
              <span className="text-xs font-serif font-bold text-white block">Sirklen Photo</span>
              <span className="text-[9px] font-mono text-amber-300/80 uppercase tracking-widest block">Portal Mandiri Pengantin</span>
            </div>
          </div>

          <button
            onClick={handleSaveAll}
            className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer ${
              isSaved 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110'
            }`}
          >
            {isSaved ? <Check size={14} /> : <Save size={14} />}
            <span>{isSaved ? 'Tersimpan' : 'Simpan'}</span>
          </button>
        </div>
      </header>

      {/* ================= 🌟 MAIN CONTENT CONTAINER 🌟 ================= */}
      <main className="max-w-xl mx-auto px-4 pt-5">

        {/* Welcome Greeting Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#230C18] via-[#1A0812] to-[#12050D] border border-amber-400/30 p-5 shadow-2xl mb-6">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#8A1828]/30 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
              <Heart size={11} className="text-rose-400 fill-rose-400" />
              <span>Pernikahan {event.displayName}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
              Persiapkan Photobooth Pernikahan Kalian 💍
            </h1>
            <p className="text-gray-300 text-xs mt-1.5 leading-relaxed">
              Atur foto prewedding dan desain template photobooth yang akan dinikmati para tamu undangan di hari bahagia kalian.
            </p>

            {/* Quick Action to Test Guest View */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400">
                Link Tamu: <code className="text-amber-200">{event.slug}</code>
              </span>
              <button
                onClick={() => navigateToEvent(event.slug)}
                className="text-xs font-serif font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 transition"
              >
                <span>Lihat Web Tamu</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* ================= 🌟 NAVIGATION TABS 🌟 ================= */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-2 text-xs font-serif font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-[#6B111F] text-amber-200 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ImageIcon size={14} />
            <span>Foto Prewed</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`py-2 text-xs font-serif font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-[#6B111F] text-amber-200 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Palette size={14} />
            <span>Tema Frame</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`py-2 text-xs font-serif font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-[#6B111F] text-amber-200 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode size={14} />
            <span>Cetak QR</span>
          </button>
        </div>

        {/* ================= 🌟 TAB 1: PREWEDDING PHOTOS 🌟 ================= */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-serif font-bold text-white">Foto Carousel Utama ({heroPhotos.length})</h3>
                <p className="text-[11px] text-gray-400">Foto ini akan bergulir otomatis di layar selamat datang tamu.</p>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-serif font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
              >
                <Upload size={13} />
                <span>+ Upload Foto</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {heroPhotos.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 bg-black/40 group shadow-lg">
                  <img src={url} alt={`Prewedding ${idx + 1}`} className="w-full h-full object-cover" />
                  
                  {/* Action buttons (Clean and fully accessible on mobile) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-200 font-bold bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemovePhoto(idx)}
                        className="p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white transition active:scale-90 cursor-pointer shadow-md"
                        title="Hapus foto ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleStartCropExisting(idx)}
                      className="w-full py-1.5 rounded-xl bg-black/80 hover:bg-black border border-amber-400/60 text-amber-200 text-[10px] font-serif font-bold flex items-center justify-center gap-1.5 backdrop-blur-md active:scale-95 transition shadow-md cursor-pointer"
                    >
                      <Crop size={12} className="text-amber-300" />
                      <span>Sesuaikan / Crop</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Empty Slot */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/20 hover:border-amber-400/50 bg-white/5 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-amber-400/20 flex items-center justify-center text-gray-400 group-hover:text-amber-300 transition mb-2">
                  <Plus size={20} />
                </div>
                <span className="text-xs font-serif text-gray-300 group-hover:text-white font-medium">Pilih dari HP</span>
                <span className="text-[9px] text-gray-500 font-mono">Bisa langsung di-crop</span>
              </div>
            </div>

            {/* URL Input Fallback */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 mt-3">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1.5">Atau masukkan Link Gambar (URL):</span>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/15 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  onClick={handleAddUrl}
                  className="px-3.5 py-1.5 bg-[#6B111F] hover:bg-[#8A1828] text-amber-200 rounded-lg text-xs font-serif font-bold transition cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= 🌟 TAB 2: THEME & FRAME PREVIEW 🌟 ================= */}
        {activeTab === 'theme' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-serif font-bold text-white">Palet Warna Photostrip</h3>
              <p className="text-[11px] text-gray-400">Pilih nuansa warna bingkai yang selaras dengan tema dekorasi pernikahan kalian.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3">
                {COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => {
                      setSelectedColorHex(pal.hex);
                      setIsSaved(false);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      selectedColorHex === pal.hex
                        ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 rounded-lg border border-white/30 shadow-inner flex-shrink-0"
                      style={{ backgroundColor: pal.hex }} 
                    />
                    <div className="overflow-hidden">
                      <span className="text-xs font-serif font-bold text-white block truncate">{pal.name}</span>
                      <span className="text-[9px] font-mono text-gray-400 uppercase">{pal.hex}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Frame Preview with Dynamic Wedding Names */}
            <div className="p-4 rounded-2xl bg-black/60 border border-amber-400/20 shadow-xl text-center">
              <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-widest block mb-2">
                ✦ LIVE PREVIEW BINGKAI PHOTOSTRIP ✦
              </span>

              {/* Simulated Strip Box */}
              <div 
                className="max-w-[220px] mx-auto rounded-xl p-3 shadow-2xl transition-colors duration-300 border border-white/20"
                style={{ backgroundColor: selectedColorHex }}
              >
                {/* Frame Header */}
                <div className="py-1">
                  <p 
                    className="text-[9px] font-mono tracking-widest uppercase font-bold"
                    style={{ color: selectedColorHex === '#FDFBF7' || selectedColorHex === '#F3C5CB' ? '#6B111F' : '#F5D77F' }}
                  >
                    THE WEDDING OF
                  </p>
                  <p 
                    className="text-sm font-serif italic font-bold mt-0.5"
                    style={{ color: selectedColorHex === '#FDFBF7' ? '#6B111F' : '#FFFFFF' }}
                  >
                    {event.displayName}
                  </p>
                </div>

                {/* 3 Dummy Photos */}
                <div className="space-y-1.5 my-2">
                  {[1, 2, 3].map((num) => (
                    <div 
                      key={num} 
                      className="aspect-[4/3] rounded-lg bg-black/30 border border-white/20 flex flex-col items-center justify-center p-2 text-white/60"
                    >
                      <Camera size={16} />
                      <span className="text-[8px] font-mono mt-0.5">Pose #{num}</span>
                    </div>
                  ))}
                </div>

                {/* Frame Footer */}
                <div className="pt-1">
                  <p 
                    className="text-[8px] font-serif italic"
                    style={{ color: selectedColorHex === '#FDFBF7' ? '#6B111F' : 'rgba(255,255,255,0.7)' }}
                  >
                    With Love & Blessings,
                  </p>
                  <p 
                    className="text-[10px] font-serif font-bold"
                    style={{ color: selectedColorHex === '#FDFBF7' || selectedColorHex === '#F3C5CB' ? '#6B111F' : '#F5D77F' }}
                  >
                    Tamu Undangan
                  </p>
                  <p 
                    className="text-[7.5px] font-mono text-gray-400 mt-0.5"
                  >
                    {event.formattedDate}
                  </p>
                </div>
              </div>

              <p className="text-[10px] font-mono text-gray-400 mt-3">
                Nama kedua mempelai dan tanggal otomatis tercetak di setiap foto yang diambil tamu.
              </p>
            </div>
          </div>
        )}

        {/* ================= 🌟 TAB 3: QR CODE CARD DOWNLOAD 🌟 ================= */}
        {activeTab === 'qr' && (
          <div className="flex flex-col items-center text-center space-y-4">
            <div>
              <h3 className="text-sm font-serif font-bold text-white">Kartu QR Code Meja Tamu</h3>
              <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                Cetak kartu ini dan letakkan di meja tamu atau buku tamu. Tamu cukup scan kamera HP untuk langsung berfoto.
              </p>
            </div>

            {/* Live QR Card Component */}
            <QRCodeCanvas 
              url={guestUrl} 
              displayName={event.displayName} 
              showDownload={true} 
            />

            {/* Quick Actions: Tent Card & ZIP Album Download */}
            <div className="w-full max-w-xs space-y-2 pt-2">
              <button
                onClick={() => setShowTentCardModal(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-stone-950 text-xs font-serif font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition cursor-pointer"
              >
                <Printer size={15} />
                <span>Desain & Cetak Kartu Meja (Tent Card)</span>
              </button>

              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="w-full py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-400/40 text-purple-200 text-xs font-serif font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Archive size={15} className={isZipping ? 'animate-bounce' : ''} />
                <span>{isZipping ? 'Mengompres Album...' : 'Unduh Seluruh Foto Tamu (.ZIP)'}</span>
              </button>
            </div>

            {/* Share Guest Link Button */}
            <div className="w-full max-w-xs space-y-2">
              <button
                onClick={handleCopyGuestLink}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 text-xs font-serif font-bold flex items-center justify-center gap-2 border border-amber-400/30 transition cursor-pointer"
              >
                <Share2 size={14} />
                <span>Salin Link Photobooth Tamu</span>
              </button>

              <button
                onClick={() => navigateToEvent(event.slug)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#6B111F] to-[#8A1828] text-amber-200 text-xs font-serif font-bold flex items-center justify-center gap-2 border border-amber-400/40 shadow-lg transition cursor-pointer"
              >
                <Eye size={14} />
                <span>Buka Web Photobooth Tamu</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ================= 🌟 BOTTOM FLOATING SAVE BAR 🌟 ================= */}
      <div className="fixed bottom-0 inset-x-0 bg-[#12070D]/95 backdrop-blur-md border-t border-white/10 p-3 z-40">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[10px] font-mono text-gray-400 block">Status:</span>
            <span className="text-xs font-serif font-bold text-amber-200">
              {isSaved ? '✦ Semua Perubahan Aktif' : '⚡ Belum Disimpan'}
            </span>
          </div>

          <button
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-serif font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
          >
            <Check size={14} />
            <span>Simpan & Terapkan Sekarang</span>
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

      {/* ================= 🌟 MODAL: PRINTABLE TABLE TENT CARD 🌟 ================= */}
      <TentCardModal
        isOpen={showTentCardModal}
        onClose={() => setShowTentCardModal(false)}
        event={event}
      />

    </motion.div>
  );
}
