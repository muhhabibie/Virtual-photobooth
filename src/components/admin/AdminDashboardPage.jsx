import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Calendar, QrCode, Copy, Trash2, Check, Lock, 
  ExternalLink, Layers, ShieldCheck, Clock, Eye, AlertTriangle, RefreshCw, 
  Image as ImageIcon, Upload, MessageCircle, Share2, LogOut, Crop,
  Printer, Download, Archive
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { PACKAGES, DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';
import { exportEventSubmissionsZip } from '../../utils/zipExport';
import QRCodeCanvas from '../ui/QRCodeCanvas';
import PhotoCropModal from '../ui/PhotoCropModal';
import TentCardModal from '../ui/TentCardModal';
import logoPhotobooth from '../../assets/logo photobooth.png';
import logoPhotoboothWhite from '../../assets/logo photobooth white.png';
import { useToast } from '../ui/Toast';

export default function AdminDashboardPage() {
  const { 
    events, 
    createEvent, 
    deleteEvent, 
    toggleExpireEvent,
    updateEventHeroPhotos,
    savedSubmissions,
    navigateToEvent,
    navigateToSetup,
    introReady
  } = useBooth();

  const { toast } = useToast();

  // Admin Security Authentication PIN State
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Hero Photos Manager Modal State
  const [heroModalEvent, setHeroModalEvent] = useState(null);
  const [editHeroPhotos, setEditHeroPhotos] = useState([]);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');

  // Photo Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [activeCropIdx, setActiveCropIdx] = useState(null); // null = new photo, number = existing photo

  // Active Tab inside Dashboard: 'events' | 'qr' | 'submissions'
  const [activeTab, setActiveTab] = useState('events');

  // Form State for "Create Event"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [eventPin, setEventPin] = useState('');
  const [selectedFrames, setSelectedFrames] = useState(['wedding-classic', 'gold-luxury']);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Active Event for QR Code Inspector & Tent Card
  const [selectedQrEvent, setSelectedQrEvent] = useState(null);
  const [selectedTentCardEvent, setSelectedTentCardEvent] = useState(null);
  const [zippingEventId, setZippingEventId] = useState(null);

  // Auto-generate slug when Groom/Bride names change
  const handleNameChange = (groom, bride) => {
    setGroomName(groom);
    setBrideName(bride);
    const cleanGroom = (groom || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const cleanBride = (bride || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (cleanGroom || cleanBride) {
      const generated = [cleanBride, cleanGroom].filter(Boolean).join('-');
      setEventSlug(generated);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === '1234' || adminPinInput === 'sirklen2026') {
      setIsAdminAuthenticated(true);
      setPinError(false);
      toast('Login Admin Berhasil! Selamat datang di Portal Sirklen.', 'success');
    } else {
      setPinError(true);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!groomName || !brideName || !eventSlug) return;

    const newEvt = createEvent({
      groomName,
      brideName,
      slug: eventSlug,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      package: selectedPackage,
      pin: eventPin,
      templateIds: selectedFrames,
    });

    setShowCreateModal(false);
    setGroomName('');
    setBrideName('');
    setEventSlug('');
    setEventPin('');
    setSelectedQrEvent(newEvt);
    toast(`Event ${newEvt.displayName} berhasil dibuat!`, 'success');
  };

  // Copy Setup Link for the Couple
  const handleCopySetupLink = (slug) => {
    const fullUrl = `${window.location.origin}/setup/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(`setup_${slug}`);
    toast('Link Setup Pengantin berhasil disalin! Kirimkan ke WhatsApp pengantin.', 'success');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  // Send WhatsApp to the Couple with pre-filled message
  const handleSendWhatsApp = (evt) => {
    const setupUrl = `${window.location.origin}/setup/${evt.slug}`;
    const text = `Halo Kak ${evt.displayName}! 💍✨\n\nTerima kasih telah mempercayakan photobooth pernikahan kalian kepada *Sirklen Photo*.\n\nSilakan buka link berikut dari HP untuk mengunggah foto prewedding & memilih desain bingkai photobooth kalian:\n👉 ${setupUrl}\n\nJika ada pertanyaan, kami siap membantu ya! 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copy Guest Link
  const handleCopyGuestLink = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(`guest_${slug}`);
    toast('Link tamu berhasil disalin!', 'success');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  // Download all photos in ZIP with custom naming: [Nama Pengunjung]_[Nama Pengantin]
  const handleDownloadEventZip = async (evt) => {
    setZippingEventId(evt.id);
    try {
      let eventSubs = (savedSubmissions || []).filter(s => s.eventSlug === evt.slug || s.eventId === evt.id);
      if (eventSubs.length === 0) {
        eventSubs = MOCK_GALLERY_PHOTOS;
      }
      toast(`Menyiapkan file ZIP foto kenangan untuk ${evt.displayName}...`, 'info');
      const result = await exportEventSubmissionsZip({
        event: evt,
        submissions: eventSubs,
        onProgress: ({ message }) => {
          // progress callback
        }
      });
      toast(`File ZIP berhasil diunduh (${result.totalPhotos} foto)`, 'success');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Gagal mengunduh ZIP', 'error');
    } finally {
      setZippingEventId(null);
    }
  };

  // Open Hero Photos Manager Modal
  const openHeroPhotosManager = (evt) => {
    setHeroModalEvent(evt);
    setEditHeroPhotos([...(evt.heroPhotos || DEFAULT_HERO_PHOTOS)]);
    setNewPhotoUrlInput('');
  };

  const handleAddHeroPhotoUrl = () => {
    if (!newPhotoUrlInput.trim()) return;
    // Open crop modal for this URL
    setCurrentCropImage(newPhotoUrlInput.trim());
    setActiveCropIdx(null);
    setCropModalOpen(true);
    setNewPhotoUrlInput('');
  };

  const handleUploadHeroPhotoFiles = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target.result;
      setCurrentCropImage(base64Url);
      setActiveCropIdx(null); // adding new
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Re-crop existing hero photo
  const handleStartCropHeroPhoto = (idx) => {
    setCurrentCropImage(editHeroPhotos[idx]);
    setActiveCropIdx(idx);
    setCropModalOpen(true);
  };

  const handleCropCompleteHeroPhoto = (croppedBase64) => {
    if (activeCropIdx !== null) {
      setEditHeroPhotos(prev => prev.map((p, i) => i === activeCropIdx ? croppedBase64 : p));
      toast('Foto berhasil di-crop & disesuaikan!', 'success');
    } else {
      setEditHeroPhotos(prev => [...prev, croppedBase64]);
      toast('Foto baru berhasil di-crop & ditambahkan!', 'success');
    }
    setCropModalOpen(false);
    setCurrentCropImage(null);
    setActiveCropIdx(null);
  };

  const handleRemoveHeroPhoto = (idx) => {
    setEditHeroPhotos(prev => prev.filter((_, i) => i !== idx));
    toast('Foto dihapus dari daftar', 'info');
  };

  const handleSaveHeroPhotos = () => {
    if (!heroModalEvent) return;
    updateEventHeroPhotos(heroModalEvent.id, editHeroPhotos);
    setHeroModalEvent(null);
    toast('Foto prewedding berhasil diperbarui!', 'success');
  };

  // ================= 🔒 SCREEN 1: ADMIN PIN LOGIN 🔒 =================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E050A] text-white flex flex-col items-center justify-center p-4 selection:bg-rose-900 selection:text-amber-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={introReady ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm p-6 sm:p-8 bg-[#180A12] border border-amber-400/30 rounded-3xl shadow-2xl text-center relative overflow-hidden"
        >
          
          {/* Pure Letter N Logo - No Square Box */}
          <img 
            src={logoPhotoboothWhite} 
            alt="Sirklen Photo" 
            className="w-14 h-14 object-contain mx-auto mb-4 drop-shadow-md select-none" 
          />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-200 text-[10px] font-mono font-bold tracking-widest uppercase mb-3">
            <ShieldCheck size={12} />
            <span>PORTAL ADMIN KHUSUS</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1">
            Sirklen Photo Admin
          </h2>
          <p className="text-gray-400 text-xs mb-6">
            Masukkan PIN Keamanan untuk membuka dashboard operasional Sirklen.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={12}
                placeholder="Masukkan PIN (Default: 1234)"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                autoFocus
                className={`w-full text-center tracking-[0.3em] font-mono text-lg py-3 px-4 rounded-xl bg-black/60 border ${
                  pinError ? 'border-red-500 ring-2 ring-red-500/30' : 'border-amber-400/40 focus:border-amber-400'
                } text-amber-200 placeholder-gray-500 focus:outline-none transition`}
              />
              {pinError && (
                <p className="text-red-400 text-xs font-serif italic mt-2">
                  PIN salah. Masukkan 1234 atau sirklen2026.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 text-amber-200 font-serif font-bold text-sm border border-amber-400/50 shadow-lg active:scale-95 transition cursor-pointer"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <p className="text-[10px] text-gray-500 font-mono mt-6">
            PT SIRKLEN KREASI USAHA • SISTEM SAAS PHOTOBOOTH
          </p>
        </motion.div>
      </div>
    );
  }

  // ================= 🌟 SCREEN 2: DEDICATED FULLSCREEN ADMIN DASHBOARD 🌟 =================
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={introReady ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-[#0C0409] text-gray-100 font-sans selection:bg-rose-950 selection:text-amber-200 pb-16"
    >
      
      {/* ================= 🌟 TOP HEADER 🌟 ================= */}
      <header className="sticky top-0 z-40 bg-[#160810]/95 backdrop-blur-md border-b border-amber-400/20 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* Pure Letter N Logo - No Square Box */}
            <img 
              src={logoPhotoboothWhite} 
              alt="Sirklen Photo" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain" 
            />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-base sm:text-lg text-white">Sirklen Photo</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold uppercase">
                  ADMIN PORTAL
                </span>
              </div>
              <span className="text-[9.5px] font-mono text-gray-400 uppercase tracking-widest block">
                PT SIRKLEN KREASI USAHA • OPERASIONAL SISTEM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-serif font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>+ Buat Event Klien</span>
            </button>

            <button
              onClick={() => setIsAdminAuthenticated(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
              title="Kunci Dashboard"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </header>

      {/* ================= 🌟 DASHBOARD BODY 🌟 ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">

        {/* System Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-[#160810] border border-amber-400/20 shadow-lg">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">Total Event Aktif</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1 block">
              {events.filter(e => Date.now() <= e.expiresAt).length} Event
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#160810] border border-amber-400/20 shadow-lg">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Semua Klien Terdaftar</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1 block">
              {events.length} Klien
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#160810] border border-amber-400/20 shadow-lg">
            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest block">Foto Tamu Tersimpan</span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1 block">
              {savedSubmissions.length} Sesi
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#160810] border border-amber-400/20 shadow-lg">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Status Server</span>
            <span className="text-sm font-mono font-bold text-emerald-400 mt-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE & TERKONEKSI
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'events'
                ? 'bg-[#6B111F] text-amber-200 border border-amber-400/40 shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Calendar size={14} />
            <span>Daftar Event & Pengantin ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'bg-[#6B111F] text-amber-200 border border-amber-400/40 shadow-md'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <QrCode size={14} />
            <span>Cetak QR Code Meja</span>
          </button>
        </div>

        {/* ================= 🌟 TAB 1: EVENTS LIST 🌟 ================= */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {events.map((evt) => {
              const isExpired = Date.now() > evt.expiresAt;
              const daysLeft = Math.ceil((evt.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
              const pkgInfo = PACKAGES[evt.package] || PACKAGES.standard;

              return (
                <div 
                  key={evt.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#170912] border border-amber-400/20 hover:border-amber-400/40 transition shadow-xl"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-white">
                          {evt.displayName}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-amber-200 border border-amber-400/30">
                          {pkgInfo.name}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          isExpired 
                            ? 'bg-red-500/20 border-red-500/40 text-red-300' 
                            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        }`}>
                          {isExpired ? 'KEDALUWARSA' : `AKTIF (${daysLeft} Hari Lagi)`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-mono">
                        <span>Tanggal: <strong className="text-gray-200">{evt.formattedDate || evt.eventDate}</strong></span>
                        <span>•</span>
                        <span>Slug: <strong className="text-amber-200 font-bold">{evt.slug}</strong></span>
                        <span>•</span>
                        <span>Foto Hero: <strong className="text-gray-200">{evt.heroPhotos?.length || 0} Foto</strong></span>
                      </div>
                    </div>

                    {/* Quick Action Buttons for Admin */}
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Copy Setup Link for Bride & Groom */}
                      <button
                        onClick={() => handleCopySetupLink(evt.slug)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 text-xs font-serif font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                        title="Salin link setup khusus pengantin untuk dikirim ke WA pengantin"
                      >
                        {copiedSlug === `setup_${evt.slug}` ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                        <span>Salin Link Setup Pengantin</span>
                      </button>

                      {/* WhatsApp Button */}
                      <button
                        onClick={() => handleSendWhatsApp(evt)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 text-xs font-serif font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                        title="Kirim pesan otomatis ke WhatsApp pengantin"
                      >
                        <MessageCircle size={14} />
                        <span>Kirim WA</span>
                      </button>

                      {/* Manage Prewedding Photos */}
                      <button
                        onClick={() => openHeroPhotosManager(evt)}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-serif font-medium flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <ImageIcon size={14} />
                        <span>Kelola Foto</span>
                      </button>

                      {/* QR Code Inspector */}
                      <button
                        onClick={() => {
                          setSelectedQrEvent(evt);
                          setActiveTab('qr');
                        }}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-serif font-medium flex items-center gap-1.5 transition cursor-pointer"
                        title="Lihat QR Code"
                      >
                        <QrCode size={14} />
                        <span>QR</span>
                      </button>

                      {/* Print Table Tent Card */}
                      <button
                        onClick={() => setSelectedTentCardEvent(evt)}
                        className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="Desain & Cetak Kartu Meja (Tent Card Siap Cetak)"
                      >
                        <Printer size={14} />
                        <span>Cetak Meja</span>
                      </button>

                      {/* Download All Photos ZIP */}
                      <button
                        onClick={() => handleDownloadEventZip(evt)}
                        disabled={zippingEventId === evt.id}
                        className="px-3 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 border border-purple-400/40 text-purple-200 text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer"
                        title="Unduh seluruh foto & ucapan tamu (.ZIP) dengan format Nama Pengunjung_Nama Pengantin"
                      >
                        <Archive size={14} className={zippingEventId === evt.id ? 'animate-bounce' : ''} />
                        <span>{zippingEventId === evt.id ? 'Mengompres...' : 'Unduh ZIP'}</span>
                      </button>

                      {/* View Guest Booth */}
                      <button
                        onClick={() => navigateToEvent(evt.slug)}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 transition cursor-pointer"
                        title="Buka Halaman Photobooth Tamu"
                      >
                        <ExternalLink size={15} />
                      </button>

                      {/* Delete Event */}
                      <button
                        onClick={() => {
                          if (confirm(`Yakin ingin menghapus event ${evt.displayName}?`)) {
                            deleteEvent(evt.id);
                            toast('Event berhasil dihapus', 'info');
                          }
                        }}
                        className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 transition cursor-pointer"
                        title="Hapus Event"
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= 🌟 TAB 2: QR CODE CARD PRINT INSPECTOR 🌟 ================= */}
        {activeTab === 'qr' && (
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-[#170912] border border-amber-400/20 text-center shadow-2xl">
            <h3 className="text-base font-serif font-bold text-white mb-1">
              Generator Cetak Kartu QR Code Meja
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Pilih event pengantin yang ingin dicetak kartu QR Code-nya:
            </p>

            <select
              value={selectedQrEvent?.id || events[0]?.id}
              onChange={(e) => {
                const found = events.find(ev => ev.id === e.target.value);
                setSelectedQrEvent(found);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-black/60 border border-white/20 text-amber-200 text-xs font-mono mb-6 focus:outline-none focus:border-amber-400"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id} className="bg-gray-900 text-white">
                  {ev.displayName} ({ev.slug})
                </option>
              ))}
            </select>

            {selectedQrEvent && (
              <div className="flex flex-col items-center">
                <QRCodeCanvas 
                  url={`${window.location.origin}/${selectedQrEvent.slug}`} 
                  displayName={selectedQrEvent.displayName} 
                  showDownload={true} 
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* ================= 🌟 MODAL: CREATE EVENT 🌟 ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#180A13] border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            
            <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-1">
              Buat Event Photobooth Klien Baru 💍
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Masukkan data kedua mempelai. Slug link otomatis ter-generate.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Nama Pria (Groom)</label>
                  <input
                    type="text"
                    required
                    placeholder="Raka"
                    value={groomName}
                    onChange={(e) => handleNameChange(e.target.value, brideName)}
                    className="w-full py-2 px-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400 font-serif"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Nama Wanita (Bride)</label>
                  <input
                    type="text"
                    required
                    placeholder="Sabrina"
                    value={brideName}
                    onChange={(e) => handleNameChange(groomName, e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400 font-serif"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Slug URL Acara</label>
                <div className="flex items-center gap-1 bg-black/50 border border-white/15 rounded-xl px-3 py-1.5 font-mono text-xs text-amber-200">
                  <span className="text-gray-500">{typeof window !== 'undefined' && window.location.host ? `${window.location.host}/` : 'sirklenice.com/'}</span>
                  <input
                    type="text"
                    required
                    value={eventSlug}
                    onChange={(e) => setEventSlug(e.target.value)}
                    className="flex-1 bg-transparent text-amber-200 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Tanggal Acara</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase block mb-1">Pilihan Paket</label>
                  <select
                    value={selectedPackage}
                    onChange={(e) => setSelectedPackage(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs focus:outline-none focus:border-amber-400 font-serif"
                  >
                    <option value="basic">Paket Basic (7 Hari)</option>
                    <option value="standard">Paket Standard (10 Hari)</option>
                    <option value="allin">Paket All-In (14 Hari)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-serif transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-serif font-bold shadow-lg transition"
                >
                  Buat Event Sekarang
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= 🌟 MODAL: HERO PHOTOS MANAGER 🌟 ================= */}
      {heroModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#180A13] border border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-1">
              Kelola Foto Prewedding — {heroModalEvent.displayName}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Upload foto prewedding dari laptop/HP atau masukkan URL gambar langsung.
            </p>

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1 mb-4 no-scrollbar">
              {editHeroPhotos.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 bg-black/40 group shadow-md">
                  <img src={url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                  
                  {/* Action overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-200 font-bold bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveHeroPhoto(idx)}
                        className="p-1.5 rounded-full bg-red-600/90 hover:bg-red-700 text-white transition active:scale-90 cursor-pointer shadow-md"
                        title="Hapus foto ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleStartCropHeroPhoto(idx)}
                      className="w-full py-1.5 rounded-xl bg-black/80 hover:bg-black border border-amber-400/60 text-amber-200 text-[10px] font-serif font-bold flex items-center justify-center gap-1 backdrop-blur-md active:scale-95 transition shadow-md cursor-pointer"
                    >
                      <Crop size={12} className="text-amber-300" />
                      <span>Sesuaikan / Crop</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload File Input */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <label className="w-full py-2.5 rounded-xl border border-dashed border-amber-400/50 hover:bg-amber-400/10 flex items-center justify-center gap-2 text-xs font-serif font-bold text-amber-200 cursor-pointer transition">
                <Upload size={14} />
                <span>+ Upload File Foto dari Komputer / HP</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadHeroPhotoFiles}
                />
              </label>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Atau tempel link gambar (URL)..."
                  value={newPhotoUrlInput}
                  onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                  className="flex-1 bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddHeroPhotoUrl}
                  className="px-4 py-2 bg-[#6B111F] hover:bg-[#8A1828] text-amber-200 text-xs font-serif font-bold rounded-xl transition"
                >
                  Tambah URL
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/10 mt-4">
              <button
                type="button"
                onClick={() => setHeroModalEvent(null)}
                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white text-xs font-serif transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveHeroPhotos}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black text-xs font-serif font-bold shadow-lg transition"
              >
                Simpan Foto
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 🌟 MODAL: PHOTO CROPPER 🌟 ================= */}
      <PhotoCropModal
        isOpen={cropModalOpen}
        imageUrl={currentCropImage}
        onCropComplete={handleCropCompleteHeroPhoto}
        onCancel={() => {
          setCropModalOpen(false);
          setCurrentCropImage(null);
          setActiveCropIdx(null);
        }}
        title="Sesuaikan & Crop Foto Hero Prewedding"
      />

      {/* ================= 🌟 MODAL: PRINTABLE TABLE TENT CARD 🌟 ================= */}
      <TentCardModal
        isOpen={!!selectedTentCardEvent}
        onClose={() => setSelectedTentCardEvent(null)}
        event={selectedTentCardEvent}
      />

    </motion.div>
  );
}
