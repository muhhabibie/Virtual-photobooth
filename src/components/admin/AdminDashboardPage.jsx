import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, QrCode, Trash2, Check, Lock, 
  ExternalLink, ShieldCheck, Eye, 
  Image as ImageIcon, Upload, MessageCircle, Share2, LogOut, Crop,
  Printer, Archive, Music, Palette, Tent, Building2, Tag,
  ChevronRight, Sparkles, Filter
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { PACKAGES, DEFAULT_HERO_PHOTOS, EVENT_CATEGORIES } from '../../data/mockEvents';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';
import { exportEventSubmissionsZip } from '../../utils/zipExport';
import QRCodeCanvas from '../ui/QRCodeCanvas';
import PhotoCropModal from '../ui/PhotoCropModal';
import TentCardModal from '../ui/TentCardModal';
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
  const [activeCropIdx, setActiveCropIdx] = useState(null);

  // Active Tab inside Dashboard: 'events' | 'qr'
  const [activeTab, setActiveTab] = useState('events');
  // Category Filter in Event List: 'all' | 'wedding' | 'concert' | 'exhibition' | 'festival'
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');

  // Form State for "Create Event"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventType, setEventType] = useState('wedding');
  const [eventName, setEventName] = useState('');
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('all_in');
  const [eventPin, setEventPin] = useState('');
  const [selectedFrames, setSelectedFrames] = useState(['wedding-classic', 'gold-luxury']);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Active Event for QR Code Inspector & Tent Card
  const [selectedQrEvent, setSelectedQrEvent] = useState(null);
  const [selectedTentCardEvent, setSelectedTentCardEvent] = useState(null);
  const [zippingEventId, setZippingEventId] = useState(null);

  // Auto-generate slug when Event Name or Groom/Bride names change
  const handleNameChange = (groom, bride) => {
    setGroomName(groom);
    setBrideName(bride);
    const cleanGroom = (groom || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const cleanBride = (bride || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (cleanGroom || cleanBride) {
      const generated = [cleanGroom, cleanBride].filter(Boolean).join('-');
      setEventSlug(generated);
    }
  };

  const handleGeneralEventNameChange = (name) => {
    setEventName(name);
    const clean = (name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setEventSlug(clean);
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
    const isWedding = eventType === 'wedding';

    if (isWedding && (!groomName || !brideName)) {
      toast('Mohon isi nama kedua mempelai', 'error');
      return;
    }
    if (!isWedding && !eventName) {
      toast('Mohon isi nama acara / pameran / konser', 'error');
      return;
    }
    if (!eventSlug) {
      toast('Mohon isi slug URL acara', 'error');
      return;
    }

    const newEvt = createEvent({
      eventType,
      eventName,
      groomName,
      brideName,
      venue: eventVenue,
      slug: eventSlug,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      package: selectedPackage,
      pin: eventPin,
      templateIds: selectedFrames,
    });

    setShowCreateModal(false);
    setEventName('');
    setGroomName('');
    setBrideName('');
    setEventVenue('');
    setEventSlug('');
    setEventPin('');
    setSelectedQrEvent(newEvt);
    toast(`Event "${newEvt.displayName}" berhasil dibuat!`, 'success');
  };

  // Copy Setup Link for Event Host / Couple
  const handleCopySetupLink = (slug) => {
    const fullUrl = `${window.location.origin}/setup/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(`setup_${slug}`);
    toast('Link Setup berhasil disalin! Kirimkan ke penyelenggara/pengantin.', 'success');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  // Send WhatsApp to Client with pre-filled message
  const handleSendWhatsApp = (evt) => {
    const setupUrl = `${window.location.origin}/setup/${evt.slug}`;
    const role = evt.eventType === 'wedding' ? 'Kak' : 'Rekan Penyelenggara';
    const text = `Halo ${role} ${evt.displayName}!\n\nTerima kasih telah mempercayakan photobooth acara kepada *Sirklen Photo*.\n\nSilakan buka tautan berikut untuk mengunggah foto cover/banner & menyesuaikan informasi photobooth:\n👉 ${setupUrl}\n\nJika ada pertanyaan, tim kami siap membantu ya! 🙏`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Copy Guest Link
  const handleCopyGuestLink = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(`guest_${slug}`);
    toast('Tautan web pengunjung berhasil disalin!', 'success');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  // Download all photos in ZIP with custom naming
  const handleDownloadEventZip = async (evt) => {
    setZippingEventId(evt.id);
    try {
      let eventSubs = (savedSubmissions || []).filter(s => s.eventSlug === evt.slug || s.eventId === evt.id);
      if (eventSubs.length === 0) {
        eventSubs = MOCK_GALLERY_PHOTOS;
      }
      toast(`Menyiapkan arsip ZIP foto kenangan untuk ${evt.displayName}...`, 'info');
      const result = await exportEventSubmissionsZip({
        event: evt,
        submissions: eventSubs,
      });
      toast(`File ZIP berhasil diunduh (${result.totalPhotos} foto)`, 'success');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Gagal mengunduh ZIP', 'error');
    } finally {
      setZippingEventId(null);
    }
  };

  // Hero Photos Manager Modal Handlers
  const openHeroPhotosManager = (evt) => {
    setHeroModalEvent(evt);
    setEditHeroPhotos([...(evt.heroPhotos || DEFAULT_HERO_PHOTOS)]);
    setNewPhotoUrlInput('');
  };

  const handleAddHeroPhotoUrl = () => {
    if (!newPhotoUrlInput.trim()) return;
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
      setActiveCropIdx(null);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStartCropHeroPhoto = (idx) => {
    setCurrentCropImage(editHeroPhotos[idx]);
    setActiveCropIdx(idx);
    setCropModalOpen(true);
  };

  const handleCropCompleteHeroPhoto = (croppedBase64) => {
    if (activeCropIdx !== null) {
      setEditHeroPhotos(prev => prev.map((img, i) => i === activeCropIdx ? croppedBase64 : img));
    } else {
      setEditHeroPhotos(prev => [...prev, croppedBase64]);
    }
    setCropModalOpen(false);
    setCurrentCropImage(null);
    setActiveCropIdx(null);
    toast('Foto berhasil disesuaikan', 'success');
  };

  const handleRemoveHeroPhoto = (idx) => {
    setEditHeroPhotos(prev => prev.filter((_, i) => i !== idx));
    toast('Foto dihapus', 'info');
  };

  const handleSaveHeroPhotos = () => {
    if (!heroModalEvent) return;
    updateEventHeroPhotos(heroModalEvent.id, editHeroPhotos);
    setHeroModalEvent(null);
    toast('Foto banner acara berhasil diperbarui', 'success');
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (selectedFilterCategory === 'all') return events;
    return events.filter(e => (e.eventType || 'wedding') === selectedFilterCategory);
  }, [events, selectedFilterCategory]);

  const activeEventsCount = useMemo(() => {
    return events.filter(e => Date.now() <= e.expiresAt).length;
  }, [events]);

  // Helper for category badge
  const getCategoryMeta = (typeKey) => {
    const found = EVENT_CATEGORIES.find(c => c.id === typeKey);
    return found || { id: 'general', name: 'Acara Khusus', icon: '🎪', label: 'Event' };
  };

  // ================= 🌟 SCREEN 1: ADMIN LOGIN SCREEN (LUXURY MINIMALIST OBSIDIAN) 🌟 =================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A070B] text-stone-100 flex items-center justify-center p-4 selection:bg-[#6B111F] selection:text-[#F5D77F] relative overflow-hidden">
        {/* Soft Ambient Backdrop Light */}
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] pointer-events-none opacity-25 blur-[140px]"
          style={{ background: 'radial-gradient(circle, rgba(107,17,31,0.9) 0%, rgba(245,215,127,0.3) 50%, transparent 70%)' }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm rounded-3xl bg-[#140E16]/90 border border-stone-800/90 p-7 sm:p-9 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative z-10 backdrop-blur-xl"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B111F] to-[#2B060C] border border-[#F5D77F]/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-950/40">
            <Lock size={22} className="text-[#F5D77F]" />
          </div>

          <span className="text-[10px] font-mono tracking-[0.25em] text-[#C4A46C] uppercase font-bold block mb-1">
            PORTAL ADMINISTRASI
          </span>
          <h2 className="text-xl font-serif font-bold text-white mb-2">
            Sirklen Photo Studio
          </h2>
          <p className="text-stone-400 text-xs mb-6 leading-relaxed">
            Masukkan PIN Keamanan untuk membuka dashboard operasional manajemen event.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={12}
                placeholder="PIN (Default: 1234)"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                autoFocus
                className={`w-full text-center tracking-[0.35em] font-mono text-lg py-3 px-4 rounded-xl bg-black/60 border ${
                  pinError ? 'border-red-500 ring-2 ring-red-500/20 text-red-200' : 'border-stone-700/80 focus:border-[#F5D77F]/80 text-[#F5D77F]'
                } placeholder-stone-600 focus:outline-none transition shadow-inner`}
              />
              {pinError && (
                <p className="text-rose-400 text-xs font-serif italic mt-2">
                  PIN salah. Masukkan 1234 atau sirklen2026.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 active:scale-98 text-[#F5D77F] border border-[#F5D77F]/40 font-serif font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/30 transition cursor-pointer"
            >
              Buka Dashboard Operasional
            </button>
          </form>

          <p className="text-[10px] text-stone-500 font-mono mt-7 pt-4 border-t border-stone-800/80">
            PT SIRKLEN KREASI USAHA • SAAS PHOTOBOOTH
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
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#0C090E] text-stone-100 font-sans selection:bg-[#6B111F] selection:text-[#F5D77F] pb-24 relative"
    >
      {/* Ambient Lighting */}
      <div 
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[380px] pointer-events-none opacity-20 blur-[150px] z-0"
        style={{ background: 'radial-gradient(circle, rgba(107,17,31,0.8) 0%, rgba(196,164,108,0.25) 50%, transparent 80%)' }}
      />

      {/* ================= 🌟 TOP HEADER (LUXURY GLASS) 🌟 ================= */}
      <header className="sticky top-0 z-40 bg-[#120D15]/90 backdrop-blur-xl border-b border-stone-800/80 px-4 sm:px-8 py-3.5 shadow-sm relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <img 
              src={logoPhotoboothWhite} 
              alt="Sirklen Photo" 
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain" 
            />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-base sm:text-lg text-white tracking-wide">
                  Sirklen Photo
                </span>
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#6B111F]/50 border border-[#F5D77F]/30 text-[#F5D77F] font-bold uppercase tracking-wider">
                  ADMIN PORTAL
                </span>
              </div>
              <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block">
                PT SIRKLEN KREASI USAHA • SISTEM OPERASIONAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEventType('wedding');
                setShowCreateModal(true);
              }}
              className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 active:scale-95 text-[#F5D77F] border border-[#F5D77F]/40 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/30 transition cursor-pointer"
            >
              <Plus size={15} />
              <span>Buat Event Baru</span>
            </button>

            <button
              onClick={() => setIsAdminAuthenticated(false)}
              className="p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 hover:text-white border border-stone-700/60 transition cursor-pointer shadow-xs"
              title="Kunci Dashboard"
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>
      </header>

      {/* ================= 🌟 DASHBOARD BODY 🌟 ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-7 relative z-10 space-y-6">

        {/* 1. System Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-3xl bg-[#140E16]/85 border border-stone-800/90 shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono text-[#C4A46C] uppercase tracking-wider block font-semibold">
              TOTAL EVENT AKTIF
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {activeEventsCount}
              </span>
              <span className="text-xs text-stone-400 font-serif">Acara</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-[#140E16]/85 border border-stone-800/90 shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-semibold">
              SEMUA EVENT TERDAFTAR
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {events.length}
              </span>
              <span className="text-xs text-stone-400 font-serif">Klien</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-[#140E16]/85 border border-stone-800/90 shadow-lg backdrop-blur-md">
            <span className="text-[10px] font-mono text-[#C4A46C] uppercase tracking-wider block font-semibold">
              SESI FOTO TERSIMPAN
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                {savedSubmissions.length}
              </span>
              <span className="text-xs text-stone-400 font-serif">Sesi Tamu</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-[#140E16]/85 border border-stone-800/90 shadow-lg backdrop-blur-md flex flex-col justify-between">
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-semibold">
              STATUS CLOUD ENGINE
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-xs font-mono font-bold text-emerald-400 tracking-wide">
                ONLINE & TERHUBUNG
              </span>
            </div>
          </div>

        </div>

        {/* 2. Navigation Tabs & Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-b border-stone-800/80 pb-3">
          
          {/* Main Tab Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-full text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-[#6B111F] text-[#F5D77F] border border-[#F5D77F]/30 shadow-md shadow-rose-950/20'
                  : 'bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <Calendar size={13} />
              <span>Daftar Acara & Klien ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`px-4 py-2 rounded-full text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-[#6B111F] text-[#F5D77F] border border-[#F5D77F]/30 shadow-md shadow-rose-950/20'
                  : 'bg-stone-900/80 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              <QrCode size={13} />
              <span>Cetak QR Code Meja</span>
            </button>
          </div>

          {/* Category Filter Pills (When on Events Tab) */}
          {activeTab === 'events' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedFilterCategory('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedFilterCategory === 'all'
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              {EVENT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilterCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    selectedFilterCategory === cat.id
                      ? 'bg-[#6B111F]/60 text-[#F5D77F] border border-[#F5D77F]/30 shadow-xs'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ================= 🌟 TAB 1: EVENTS LIST (EXECUTIVE SAAS CARDS) 🌟 ================= */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-[#140E16]/80 border border-stone-800">
                <p className="text-stone-400 text-sm font-serif">Tidak ada event pada kategori ini.</p>
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const isExpired = Date.now() > evt.expiresAt;
                const daysLeft = Math.ceil((evt.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
                const pkgInfo = PACKAGES[evt.package] || PACKAGES.all_in;
                const catMeta = getCategoryMeta(evt.eventType || 'wedding');

                return (
                  <div 
                    key={evt.id}
                    className="p-5 sm:p-6 rounded-3xl bg-[#130E16]/90 border border-stone-800/90 hover:border-stone-700 transition shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                      
                      {/* Left Side: Event Identity & Meta */}
                      <div className="flex-1 space-y-2">
                        
                        {/* Tags Strip */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category Tag */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-800/90 border border-stone-700 text-stone-200">
                            <span>{catMeta.icon}</span>
                            <span>{catMeta.name}</span>
                          </span>

                          {/* Package Badge (Paket Spesial / Standard / Basic) */}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6B111F]/40 border border-[#F5D77F]/30 text-[#F5D77F]">
                            {pkgInfo.name}
                          </span>

                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                            isExpired 
                              ? 'bg-rose-950/60 border border-rose-700/40 text-rose-300' 
                              : 'bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 font-semibold'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                            <span>{isExpired ? 'Kedaluwarsa' : `Aktif (${daysLeft} Hari Lagi)`}</span>
                          </span>
                        </div>

                        {/* Event Title */}
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                          {evt.displayName}
                        </h3>

                        {/* Metadata Details */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3.5 text-xs text-stone-400 font-sans">
                          <span>
                            Tanggal: <strong className="text-stone-200 font-medium">{evt.formattedDate || evt.eventDate}</strong>
                          </span>
                          <span className="text-stone-700">•</span>
                          <span>
                            Lokasi: <strong className="text-stone-200 font-medium">{evt.venue || 'Venue Acara'}</strong>
                          </span>
                          <span className="text-stone-700">•</span>
                          <span className="font-mono text-stone-300">
                            Slug: <strong className="text-[#F5D77F]">/{evt.slug}</strong>
                          </span>
                          <span className="text-stone-700">•</span>
                          <span>
                            Foto Banner: <strong className="text-stone-200 font-medium">{evt.heroPhotos?.length || 0} Foto</strong>
                          </span>
                        </div>

                      </div>

                      {/* Right Side: Professional Unified Action System */}
                      <div className="flex flex-col gap-2.5 xl:items-end">
                        
                        {/* Primary Row: Setup Outreach Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopySetupLink(evt.slug)}
                            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 active:scale-95 text-[#F5D77F] border border-[#F5D77F]/40 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/20 transition cursor-pointer whitespace-nowrap"
                            title="Salin tautan setup khusus klien untuk dikirim ke WhatsApp"
                          >
                            {copiedSlug === `setup_${evt.slug}` ? <Check size={14} className="text-emerald-300" /> : <Share2 size={14} />}
                            <span>Salin Link Setup</span>
                          </button>

                          <button
                            onClick={() => handleSendWhatsApp(evt)}
                            className="px-4 py-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-600/50 text-emerald-300 text-xs font-serif font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer whitespace-nowrap shadow-xs"
                            title="Kirim pesan instruksi otomatis ke WhatsApp"
                          >
                            <MessageCircle size={14} />
                            <span>Kirim WA</span>
                          </button>
                        </div>

                        {/* Secondary Row: Tools & Utilities */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() => openHeroPhotosManager(evt)}
                            className="px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Kelola foto banner prewedding / event"
                          >
                            <ImageIcon size={13} className="text-stone-400" />
                            <span>Foto</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedQrEvent(evt);
                              setActiveTab('qr');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Tampilkan QR Code"
                          >
                            <QrCode size={13} className="text-stone-400" />
                            <span>QR</span>
                          </button>

                          <button
                            onClick={() => setSelectedTentCardEvent(evt)}
                            className="px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Desain & Cetak Kartu Meja (Tent Card Siap Cetak)"
                          >
                            <Printer size={13} className="text-stone-400" />
                            <span>Cetak Meja</span>
                          </button>

                          <button
                            onClick={() => handleDownloadEventZip(evt)}
                            disabled={zippingEventId === evt.id}
                            className="px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Unduh seluruh foto tamu (.ZIP)"
                          >
                            <Archive size={13} className={zippingEventId === evt.id ? 'animate-bounce text-amber-300' : 'text-stone-400'} />
                            <span>ZIP</span>
                          </button>

                          {/* View Guest Web */}
                          <button
                            onClick={() => navigateToEvent(evt.slug)}
                            className="p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition cursor-pointer"
                            title="Buka Tampilan Web Tamu"
                          >
                            <ExternalLink size={14} />
                          </button>

                          {/* Delete Event */}
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus event "${evt.displayName}"?`)) {
                                deleteEvent(evt.id);
                                toast('Event berhasil dihapus', 'info');
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/40 transition cursor-pointer"
                            title="Hapus Event"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ================= 🌟 TAB 2: QR CODE CARD PRINT INSPECTOR 🌟 ================= */}
        {activeTab === 'qr' && (
          <div className="max-w-md mx-auto p-6 sm:p-7 rounded-3xl bg-[#140E16]/90 border border-stone-800/90 text-center shadow-2xl backdrop-blur-xl">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4A46C] font-bold block mb-1">
              INSPEKTOR QR CODE
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-1">
              Generator Cetak Kartu Meja
            </h3>
            <p className="text-xs text-stone-400 mb-5">
              Pilih acara yang ingin dicetak kartu QR Code atau diunduh asetnya:
            </p>

            <select
              value={selectedQrEvent?.id || events[0]?.id}
              onChange={(e) => {
                const found = events.find(ev => ev.id === e.target.value);
                setSelectedQrEvent(found);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-black/60 border border-stone-700 text-[#F5D77F] text-xs font-mono mb-6 focus:outline-none focus:border-[#F5D77F]"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id} className="bg-stone-900 text-white">
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

      {/* ================= 🌟 MODAL: CREATE EVENT (MULTI-CATEGORY) 🌟 ================= */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#140E16] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <span className="text-[9.5px] font-mono uppercase tracking-[0.25em] text-[#C4A46C] font-bold block mb-1">
                EVENT BARU
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-white mb-1">
                Buat Event Photobooth Klien
              </h3>
              <p className="text-xs text-stone-400 mb-5 leading-relaxed">
                Pilih jenis acara dan masukkan informasi untuk membuat tautan photobooth instan.
              </p>

              {/* 1. Category Selector Pills */}
              <div className="mb-5">
                <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2 font-semibold">
                  JENIS ACARA
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EVENT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setEventType(cat.id);
                        if (cat.id !== 'wedding' && !eventName) {
                          setEventName(cat.placeholder.split(',')[0]);
                          handleGeneralEventNameChange(cat.placeholder.split(',')[0]);
                        }
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition cursor-pointer flex flex-col gap-1 ${
                        eventType === cat.id
                          ? 'bg-[#6B111F]/50 border-[#F5D77F]/50 text-white shadow-xs'
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-xs font-serif font-bold">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Dynamic Inputs based on Category */}
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                
                {eventType === 'wedding' ? (
                  /* Wedding Inputs (Groom & Bride) */
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1 font-semibold">
                        Mempelai Pria (Groom)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Raka"
                        value={groomName}
                        onChange={(e) => handleNameChange(e.target.value, brideName)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-black/60 border border-stone-700/80 text-white text-xs focus:outline-none focus:border-[#F5D77F] font-serif"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1 font-semibold">
                        Mempelai Wanita (Bride)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sabrina"
                        value={brideName}
                        onChange={(e) => handleNameChange(groomName, e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-black/60 border border-stone-700/80 text-white text-xs focus:outline-none focus:border-[#F5D77F] font-serif"
                      />
                    </div>
                  </div>
                ) : (
                  /* Non-Wedding Inputs (Concert, Exhibition, Festival) */
                  <div>
                    <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1 font-semibold">
                      Nama Acara / Festival / Pameran
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pestapora 2026, Void Vision, Jakcloth Fest"
                      value={eventName}
                      onChange={(e) => handleGeneralEventNameChange(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-black/60 border border-stone-700/80 text-white text-xs focus:outline-none focus:border-[#F5D77F] font-serif"
                    />
                  </div>
                )}

                {/* Venue / Location */}
                <div>
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1 font-semibold">
                    Lokasi / Venue Acara
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gambir Expo Kemayoran Jakarta / Grand Ballroom"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-black/60 border border-stone-700/80 text-white text-xs focus:outline-none focus:border-[#F5D77F] font-sans"
                  />
                </div>

                {/* Slug Link */}
                <div>
                  <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1 font-semibold">
                    Slug Tautan Web
                  </label>
                  <div className="flex items-center gap-1 bg-black/60 border border-stone-700/80 rounded-xl px-3.5 py-2 font-mono text-xs text-[#F5D77F]">
                    <span className="text-stone-500">
                      {typeof window !== 'undefined' && window.location.host ? `${window.location.host}/` : 'sirklenice.com/'}
                    </span>
                    <input
                      type="text"
                      required
                      value={eventSlug}
                      onChange={(e) => setEventSlug(e.target.value)}
                      className="flex-1 bg-transparent text-[#F5D77F] focus:outline-none font-bold"
                    />
                  </div>
                </div>

                {/* Date & Package */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1 font-semibold">
                      Tanggal Acara
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-black/60 border border-stone-700/80 text-white text-xs focus:outline-none focus:border-[#F5D77F] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1 font-semibold">
                      Pilihan Paket
                    </label>
                    <select
                      value={selectedPackage}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl bg-black/60 border border-stone-700/80 text-white text-xs focus:outline-none focus:border-[#F5D77F] font-sans"
                    >
                      <option value="basic" className="bg-stone-900 text-white">Basic (7 Hari • Rp 300rb)</option>
                      <option value="standard" className="bg-stone-900 text-white">Standard (10 Hari • Rp 400rb)</option>
                      <option value="all_in" className="bg-stone-900 text-white">Paket Spesial (14 Hari • Rp 500rb)</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-800 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-full text-stone-400 hover:text-white text-xs font-serif transition"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 active:scale-95 text-[#F5D77F] border border-[#F5D77F]/40 text-xs font-serif font-bold shadow-lg transition cursor-pointer"
                  >
                    Buat Event Sekarang
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 🌟 MODAL: HERO PHOTOS MANAGER 🌟 ================= */}
      {heroModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#140E16] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <span className="text-[9.5px] font-mono uppercase tracking-[0.25em] text-[#C4A46C] font-bold block mb-1">
              BANNER & PREWEDDING
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-white mb-1">
              Kelola Foto Acara — {heroModalEvent.displayName}
            </h3>
            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              Upload foto cover/banner dari perangkat atau masukkan URL gambar langsung.
            </p>

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1 mb-4 no-scrollbar">
              {editHeroPhotos.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-stone-700 bg-black/40 group shadow-md">
                  <img src={url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                  
                  {/* Action overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#F5D77F] font-bold bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveHeroPhoto(idx)}
                        className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition active:scale-90 cursor-pointer shadow-md"
                        title="Hapus foto ini"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleStartCropHeroPhoto(idx)}
                      className="w-full py-1.5 rounded-xl bg-black/80 hover:bg-black border border-[#F5D77F]/60 text-[#F5D77F] text-[10px] font-serif font-bold flex items-center justify-center gap-1 backdrop-blur-md active:scale-95 transition shadow-md cursor-pointer"
                    >
                      <Crop size={12} className="text-[#F5D77F]" />
                      <span>Sesuaikan / Crop</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload File Input */}
            <div className="space-y-3 pt-3 border-t border-stone-800">
              <label className="w-full py-2.5 rounded-xl border border-dashed border-[#F5D77F]/40 hover:bg-white/5 flex items-center justify-center gap-2 text-xs font-serif font-bold text-[#F5D77F] cursor-pointer transition">
                <Upload size={14} />
                <span>+ Upload File Foto dari HP / Komputer</span>
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
                  className="flex-1 bg-black/50 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F5D77F] font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddHeroPhotoUrl}
                  className="px-4 py-2 bg-[#6B111F] hover:bg-[#8A1828] text-[#F5D77F] text-xs font-serif font-bold rounded-xl transition"
                >
                  Tambah URL
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-stone-800 mt-4">
              <button
                type="button"
                onClick={() => setHeroModalEvent(null)}
                className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-serif transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveHeroPhotos}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 text-[#F5D77F] border border-[#F5D77F]/40 text-xs font-serif font-bold shadow-lg transition"
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
        title="Sesuaikan & Crop Foto Banner Acara"
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
