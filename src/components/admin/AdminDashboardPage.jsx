import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, QrCode, Trash2, Check, Lock, 
  ExternalLink, Eye, Image as ImageIcon, Upload, 
  MessageCircle, Share2, LogOut, Crop, Printer, Archive, 
  ChevronRight, ChevronLeft, Smartphone, X, Camera, Copy, Sparkles
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { PACKAGES, DEFAULT_HERO_PHOTOS, EVENT_CATEGORIES } from '../../data/mockEvents';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';
import { exportEventSubmissionsZip } from '../../utils/zipExport';
import QRCodeCanvas from '../ui/QRCodeCanvas';
import PhotoCropModal from '../ui/PhotoCropModal';
import TentCardModal from '../ui/TentCardModal';
import { useToast } from '../ui/Toast';

const PREVIEW_FRAME_THEMES = [
  { id: 'burgundy', name: 'Royal Burgundy', hex: '#6B111F', textHex: '#F5D77F', borderHex: '#8A1828' },
  { id: 'slate', name: 'Noir Slate', hex: '#2D3748', textHex: '#E2E8F0', borderHex: '#4A5568' },
  { id: 'ivory', name: 'Ivory Bliss', hex: '#FDFBF7', textHex: '#6B111F', borderHex: '#E2DDD5' },
  { id: 'gold', name: 'Antique Gold', hex: '#C4A46C', textHex: '#FFFFFF', borderHex: '#D4AF37' },
];

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
    introReady,
    replayIntro
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
  // Category Filter in Event List: 'all' | category ids
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

  // Active Event for QR Code Inspector & Tent Card & Live Preview
  const [selectedQrEvent, setSelectedQrEvent] = useState(null);
  const [selectedTentCardEvent, setSelectedTentCardEvent] = useState(null);
  const [previewModalEvent, setPreviewModalEvent] = useState(null);
  const [previewTab, setPreviewTab] = useState('hero'); // 'hero' | 'frame'
  const [previewPhotoIdx, setPreviewPhotoIdx] = useState(0);
  const [activeFrameThemeIdx, setActiveFrameThemeIdx] = useState(0);
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
      toast(`Menyiapkan arsip ZIP foto untuk ${evt.displayName}...`, 'info');
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
    toast('Foto banner acara berhasil disimpan', 'success');
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
    return found || { id: 'general', name: 'Corporate & Acara', label: 'Event' };
  };

  // ================= 🌟 SCREEN 1: ADMIN LOGIN SCREEN (WARM IVORY LUXURY) 🌟 =================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-stone-900 flex items-center justify-center p-4 selection:bg-[#6B111F]/20 selection:text-[#6B111F] relative overflow-hidden">
        {/* Soft Ambient Backdrop Light */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 235, 224, 0.9) 0%, rgba(253, 251, 247, 0.95) 60%, #FDFBF7 100%)'
          }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm rounded-3xl bg-white border border-[#EADBCC]/90 p-7 sm:p-8 text-center shadow-[0_15px_45px_rgba(107,17,31,0.06)] relative z-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EADBCC] text-[#8C7A6B] text-[10px] font-mono font-bold tracking-widest uppercase mb-4 shadow-xs">
            PORTAL ADMINISTRASI
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1.5 tracking-tight">
            Sirklen Photo Studio
          </h2>
          <p className="text-stone-600 text-xs mb-6 leading-relaxed">
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
                className={`w-full text-center tracking-[0.35em] font-mono text-lg py-2.5 px-4 rounded-2xl bg-[#FAF7F2] border ${
                  pinError ? 'border-rose-500 ring-2 ring-rose-500/20 text-rose-700' : 'border-[#E5DACB] focus:border-[#6B111F] text-stone-900'
                } placeholder-stone-400 focus:outline-none transition shadow-inner`}
              />
              {pinError && (
                <p className="text-rose-600 text-xs font-serif italic mt-2">
                  PIN salah. Masukkan 1234 atau sirklen2026.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 active:scale-98 text-[#F5D77F] border border-[#F5D77F]/30 font-serif font-bold text-xs sm:text-sm shadow-md shadow-rose-950/20 transition cursor-pointer"
            >
              Buka Dashboard Operasional
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-200/80">
            <span className="text-[10px] text-[#8C7A6B] font-mono tracking-wider">
              PT SIRKLEN KREASI USAHA • SISTEM OPERASIONAL
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ================= 🌟 SCREEN 2: DEDICATED FULLSCREEN ADMIN DASHBOARD (WARM IVORY LUXURY) 🌟 =================
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={introReady ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans pb-28 selection:bg-[#6B111F]/20 selection:text-[#6B111F] relative overflow-x-hidden"
    >
      {/* Soft Ambient Backdrop Light (Matching Client Setup Portal) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 235, 224, 0.9) 0%, rgba(253, 251, 247, 0.95) 60%, #FDFBF7 100%)'
          }}
        />
        <div 
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 pointer-events-none opacity-20 blur-[110px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(107, 17, 31, 0.6) 0%, rgba(229, 193, 88, 0.3) 50%, transparent 80%)'
          }}
        />
      </div>

      {/* ================= 🌟 TOP HEADER (LUXURY IVORY GLASS) 🌟 ================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-200/80 px-4 sm:px-8 py-3.5 shadow-[0_2px_15px_rgba(0,0,0,0.02)] relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg sm:text-xl text-stone-900 tracking-tight">
                  Sirklen Photo
                </span>
                <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EADBCC] text-[#8C7A6B] font-bold uppercase tracking-wider shadow-xs">
                  ADMIN
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-400 tracking-wider hidden sm:block">
                PT SIRKLEN KREASI USAHA • PORTAL OPERASIONAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={replayIntro}
              className="px-3.5 py-2 rounded-full bg-white hover:bg-[#FAF7F2] text-[#6B111F] border border-[#EADBCC] text-xs font-serif font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              title="Putar Ulang Animasi Intro"
            >
              <Sparkles size={13} className="text-[#C4A46C]" />
              <span className="hidden sm:inline">Animasi Intro</span>
            </button>

            <button
              onClick={() => {
                setEventType('wedding');
                setShowCreateModal(true);
              }}
              className="px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 active:scale-95 text-[#F5D77F] border border-[#F5D77F]/30 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/20 transition cursor-pointer whitespace-nowrap"
            >
              <Plus size={14} />
              <span className="hidden xs:inline">Buat Event Baru</span>
              <span className="xs:hidden">Event Baru</span>
            </button>

            <button
              onClick={() => setIsAdminAuthenticated(false)}
              className="p-2 rounded-full bg-[#FAF7F2] hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 transition cursor-pointer shadow-xs"
              title="Kunci Dashboard"
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>
      </header>

      {/* ================= 🌟 DASHBOARD BODY 🌟 ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 relative z-10 space-y-6">

        {/* 1. System Statistics Grid (Clean White Ivory Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EADBCC]/90 shadow-[0_8px_30px_rgba(107,17,31,0.03)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold block mb-1">
              TOTAL EVENT AKTIF
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {activeEventsCount}
              </span>
              <span className="text-xs text-stone-500 font-serif">Acara Berlangsung</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EADBCC]/90 shadow-[0_8px_30px_rgba(107,17,31,0.03)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block mb-1">
              SEMUA EVENT TERDAFTAR
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {events.length}
              </span>
              <span className="text-xs text-stone-500 font-serif">Klien Terdaftar</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EADBCC]/90 shadow-[0_8px_30px_rgba(107,17,31,0.03)]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C7A6B] font-bold block mb-1">
              SESI FOTO TERSIMPAN
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {savedSubmissions.length}
              </span>
              <span className="text-xs text-stone-500 font-serif">Sesi Tamu</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#EADBCC]/90 shadow-[0_8px_30px_rgba(107,17,31,0.03)] flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block mb-1">
              STATUS CLOUD ENGINE
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
              <span className="text-xs font-mono font-bold text-emerald-700 tracking-wide">
                ONLINE & TERHUBUNG
              </span>
            </div>
          </div>

        </div>

        {/* 2. Navigation Tabs & Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-stone-200/80 pb-3">
          
          {/* Main Tab Switcher */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#FAF7F2] border border-[#E5DACB]">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-[#6B111F] text-[#F5D77F] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Calendar size={13} />
              <span>Daftar Acara ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-[#6B111F] text-[#F5D77F] shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <QrCode size={13} />
              <span>Cetak QR Code</span>
            </button>
          </div>

          {/* Category Filter Pills (Zero Emojis, Clean Elegant Pills) */}
          {activeTab === 'events' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedFilterCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedFilterCategory === 'all'
                    ? 'bg-[#6B111F] text-[#F5D77F] border border-[#6B111F] shadow-xs'
                    : 'bg-white hover:bg-stone-50 text-stone-600 border border-[#EADBCC]'
                }`}
              >
                Semua
              </button>
              {EVENT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilterCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold transition cursor-pointer whitespace-nowrap ${
                    selectedFilterCategory === cat.id
                      ? 'bg-[#6B111F] text-[#F5D77F] border border-[#6B111F] shadow-xs'
                      : 'bg-white hover:bg-stone-50 text-stone-600 border border-[#EADBCC]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ================= 🌟 TAB 1: EVENTS LIST (WARM IVORY CARDS) 🌟 ================= */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-[#EADBCC]">
                <p className="text-stone-500 text-sm font-serif">Tidak ada event pada kategori ini.</p>
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
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EADBCC]/90 hover:border-[#D4AF37]/50 transition shadow-[0_8px_30px_rgba(107,17,31,0.04)]"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                      
                      {/* Left Side: Event Identity & Meta */}
                      <div className="flex-1 space-y-2.5">
                        
                        {/* Tags Strip */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category Tag */}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-[#FAF7F2] border border-[#E5DACB] text-stone-700">
                            {catMeta.name}
                          </span>

                          {/* Package Badge (Paket Spesial / Standard / Basic) */}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#6B111F]/10 border border-[#6B111F]/20 text-[#6B111F]">
                            {pkgInfo.name}
                          </span>

                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono ${
                            isExpired 
                              ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                              : 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <span>{isExpired ? 'Kedaluwarsa' : `Aktif (${daysLeft} Hari Lagi)`}</span>
                          </span>
                        </div>

                        {/* Event Title */}
                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
                          {evt.displayName}
                        </h3>

                        {/* Metadata Details */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-600 font-sans">
                          <span>
                            Tanggal: <strong className="text-stone-900 font-medium">{evt.formattedDate || evt.eventDate}</strong>
                          </span>
                          <span className="text-stone-300">•</span>
                          <span>
                            Lokasi: <strong className="text-stone-900 font-medium">{evt.venue || 'Venue Acara'}</strong>
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="font-mono text-stone-700 flex items-center gap-1">
                            Link: <strong className="text-[#6B111F]">/{evt.slug}</strong>
                            <button
                              onClick={() => handleCopyGuestLink(evt.slug)}
                              className="text-stone-400 hover:text-stone-700 p-0.5 transition cursor-pointer"
                              title="Salin Link Tamu"
                            >
                              <Copy size={12} />
                            </button>
                          </span>
                          <span className="text-stone-300">•</span>
                          <span>
                            Foto Banner: <strong className="text-stone-900 font-medium">{evt.heroPhotos?.length || 0} Foto</strong>
                          </span>
                        </div>

                      </div>

                      {/* Right Side: Professional Unified Action System */}
                      <div className="flex flex-col gap-2.5 xl:items-end w-full xl:w-auto">
                        
                        {/* Primary Row: Quick Actions */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto">
                          <button
                            onClick={() => {
                              setPreviewModalEvent(evt);
                              setPreviewTab('hero');
                              setPreviewPhotoIdx(0);
                              setActiveFrameThemeIdx(0);
                            }}
                            className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-full bg-[#FAF7F2] hover:bg-stone-100 text-stone-800 border border-[#E5DACB] text-xs font-serif font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                            title="Pratinjau tampilan layar HP tamu"
                          >
                            <Smartphone size={13} className="text-[#8C7A6B]" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleCopySetupLink(evt.slug)}
                            className="flex-1 sm:flex-none justify-center px-4 py-2 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 active:scale-95 text-[#F5D77F] border border-[#F5D77F]/30 text-xs font-serif font-bold flex items-center gap-1.5 shadow-md shadow-rose-950/15 transition cursor-pointer whitespace-nowrap"
                            title="Salin tautan setup khusus klien"
                          >
                            {copiedSlug === `setup_${evt.slug}` ? <Check size={13} className="text-emerald-300" /> : <Share2 size={13} />}
                            <span>Salin Link Setup</span>
                          </button>

                          <button
                            onClick={() => handleSendWhatsApp(evt)}
                            className="flex-1 sm:flex-none justify-center px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-xs font-serif font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs whitespace-nowrap"
                            title="Kirim pesan instruksi otomatis ke WhatsApp"
                          >
                            <MessageCircle size={13} className="text-emerald-700" />
                            <span>Kirim WA</span>
                          </button>
                        </div>

                        {/* Secondary Row: Tools & Utilities (Clean Segmented Toolbar, Fully Responsive Scroll) */}
                        <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] border border-[#E5DACB] rounded-2xl shadow-xs overflow-x-auto max-w-full no-scrollbar">
                          <button
                            onClick={() => openHeroPhotosManager(evt)}
                            className="px-2.5 py-1 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap flex-shrink-0"
                            title="Kelola foto banner prewedding / event"
                          >
                            <ImageIcon size={13} />
                            <span>Foto</span>
                          </button>

                          <div className="w-[1px] h-3.5 bg-stone-300 flex-shrink-0" />

                          <button
                            onClick={() => {
                              setSelectedQrEvent(evt);
                              setActiveTab('qr');
                            }}
                            className="px-2.5 py-1 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap flex-shrink-0"
                            title="Tampilkan QR Code"
                          >
                            <QrCode size={13} />
                            <span>QR</span>
                          </button>

                          <div className="w-[1px] h-3.5 bg-stone-300 flex-shrink-0" />

                          <button
                            onClick={() => setSelectedTentCardEvent(evt)}
                            className="px-2.5 py-1 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap flex-shrink-0"
                            title="Desain & Cetak Kartu Meja"
                          >
                            <Printer size={13} />
                            <span className="whitespace-nowrap">Cetak Meja</span>
                          </button>

                          <div className="w-[1px] h-3.5 bg-stone-300 flex-shrink-0" />

                          <button
                            onClick={() => handleDownloadEventZip(evt)}
                            disabled={zippingEventId === evt.id}
                            className="px-2.5 py-1 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap flex-shrink-0"
                            title="Unduh seluruh foto tamu (.ZIP)"
                          >
                            <Archive size={13} className={zippingEventId === evt.id ? 'animate-bounce text-amber-600' : ''} />
                            <span>ZIP</span>
                          </button>

                          <div className="w-[1px] h-3.5 bg-stone-300 flex-shrink-0" />

                          {/* View Guest Web */}
                          <button
                            onClick={() => navigateToEvent(evt.slug)}
                            className="p-1 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-white transition cursor-pointer flex-shrink-0"
                            title="Buka Tampilan Web Tamu"
                          >
                            <ExternalLink size={13} />
                          </button>

                          <div className="w-[1px] h-3.5 bg-stone-300 flex-shrink-0" />

                          {/* Delete Event */}
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus event "${evt.displayName}"?`)) {
                                deleteEvent(evt.id);
                                toast('Event berhasil dihapus', 'info');
                              }
                            }}
                            className="p-1 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer flex-shrink-0"
                            title="Hapus Event"
                          >
                            <Trash2 size={13} />
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
          <div className="max-w-md mx-auto p-6 sm:p-7 rounded-3xl bg-white border border-[#EADBCC] text-center shadow-[0_8px_30px_rgba(107,17,31,0.05)]">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C7A6B] font-bold block mb-1">
              INSPEKTOR QR CODE
            </span>
            <h3 className="text-base font-serif font-bold text-stone-900 mb-1">
              Generator Cetak Kartu Meja
            </h3>
            <p className="text-xs text-stone-600 mb-5">
              Pilih acara yang ingin dicetak kartu QR Code atau diunduh asetnya:
            </p>

            <select
              value={selectedQrEvent?.id || events[0]?.id}
              onChange={(e) => {
                const found = events.find(ev => ev.id === e.target.value);
                setSelectedQrEvent(found);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-xs font-mono mb-6 focus:outline-none focus:border-[#6B111F]"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id} className="bg-white text-stone-900">
                  {ev.displayName} ({ev.slug})
                </option>
              ))}
            </select>

            {selectedQrEvent && (
              <div className="flex flex-col items-center">
                <QRCodeCanvas 
                  event={selectedQrEvent}
                  url={`${window.location.origin}/${selectedQrEvent.slug}`} 
                  displayName={selectedQrEvent.displayName} 
                  showDownload={true} 
                  showOptions={true}
                  onOpenTentCard={() => setSelectedTentCardEvent(selectedQrEvent)}
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* ================= 🌟 MODAL: CREATE EVENT (WARM IVORY LUXURY, ZERO SLOP) 🌟 ================= */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-white border border-[#EADBCC] rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(107,17,31,0.15)] relative max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C7A6B] font-bold block mb-0.5">
                    EVENT BARU
                  </span>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                    Buat Event Photobooth Klien
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Konfigurasi jenis acara dan informasi dasar untuk tautan instan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 1. Category Selector (Clean Segmented Control, Zero Emojis) */}
              <div className="mb-5">
                <label className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider block mb-2 font-bold">
                  KATEGORI ACARA
                </label>
                <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#FAF7F2] border border-[#E5DACB]">
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
                      className={`flex-1 min-w-[95px] py-2 px-2.5 rounded-xl text-xs font-serif font-bold transition cursor-pointer text-center ${
                        eventType === cat.id
                          ? 'bg-[#6B111F] text-[#F5D77F] shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                      }`}
                    >
                      {cat.name}
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
                      <label className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider block mb-1 font-bold">
                        Mempelai Pria
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Raka"
                        value={groomName}
                        onChange={(e) => handleNameChange(e.target.value, brideName)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-xs placeholder-stone-400 focus:outline-none focus:border-[#6B111F] font-serif transition"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider block mb-1 font-bold">
                        Mempelai Wanita
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sabrina"
                        value={brideName}
                        onChange={(e) => handleNameChange(groomName, e.target.value)}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-xs placeholder-stone-400 focus:outline-none focus:border-[#6B111F] font-serif transition"
                      />
                    </div>
                  </div>
                ) : (
                  /* Non-Wedding Inputs (Concert, Exhibition, Festival) */
                  <div>
                    <label className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider block mb-1 font-bold">
                      Nama Acara / Pameran / Konser
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pestapora 2026, Void Vision, Jakcloth Fest"
                      value={eventName}
                      onChange={(e) => handleGeneralEventNameChange(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-xs placeholder-stone-400 focus:outline-none focus:border-[#6B111F] font-serif transition"
                    />
                  </div>
                )}

                {/* Venue / Location */}
                <div>
                  <label className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider block mb-1 font-bold">
                    Lokasi / Venue Acara
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gambir Expo Kemayoran Jakarta / Grand Ballroom"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-xs placeholder-stone-400 focus:outline-none focus:border-[#6B111F] font-sans transition"
                  />
                </div>

                {/* Slug Link */}
                <div>
                  <label className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider block mb-1 font-bold">
                    Slug Tautan Web
                  </label>
                  <div className="flex items-center bg-[#FAF7F2] border border-[#E5DACB] rounded-xl px-3 py-2 text-xs font-mono">
                    <span className="text-stone-400 select-none">
                      {typeof window !== 'undefined' && window.location.host ? `${window.location.host}/` : 'sirklen.id/'}
                    </span>
                    <input
                      type="text"
                      required
                      value={eventSlug}
                      onChange={(e) => setEventSlug(e.target.value)}
                      className="flex-1 bg-transparent text-[#6B111F] font-bold focus:outline-none ml-1"
                    />
                  </div>
                </div>

                {/* Date & Package */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider block mb-1 font-bold">
                      Tanggal Acara
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-xs focus:outline-none focus:border-[#6B111F] font-mono transition"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#8C7A6B] uppercase tracking-wider block mb-1 font-bold">
                      Pilihan Paket
                    </label>
                    <select
                      value={selectedPackage}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FAF7F2] border border-[#E5DACB] text-stone-900 text-xs focus:outline-none focus:border-[#6B111F] transition"
                    >
                      <option value="basic" className="bg-white text-stone-900">Basic (7 Hari • Rp 300rb)</option>
                      <option value="standard" className="bg-white text-stone-900">Standard (10 Hari • Rp 400rb)</option>
                      <option value="all_in" className="bg-white text-stone-900">Paket Spesial (14 Hari • Rp 500rb)</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-full text-stone-600 hover:text-stone-900 text-xs font-serif font-medium transition cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 active:scale-95 text-[#F5D77F] border border-[#F5D77F]/30 text-xs font-serif font-bold shadow-md shadow-rose-950/20 transition cursor-pointer"
                  >
                    Buat Event Sekarang
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 🌟 MODAL: HERO PHOTOS MANAGER (WARM IVORY LUXURY) 🌟 ================= */}
      {heroModalEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-[#EADBCC] rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(107,17,31,0.15)] relative">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8C7A6B] font-bold block mb-0.5">
                  FOTO BANNER & PREWEDDING
                </span>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Foto Banner — {heroModalEvent.displayName}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Kelola foto banner cover untuk tampilan web photobooth tamu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHeroModalEvent(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 mb-4 no-scrollbar">
              {editHeroPhotos.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#E5DACB] bg-[#FAF7F2] group shadow-xs">
                  <img src={url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                  
                  {/* Action overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#F5D77F] font-bold bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveHeroPhoto(idx)}
                        className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition active:scale-90 cursor-pointer shadow-xs"
                        title="Hapus foto ini"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleStartCropHeroPhoto(idx)}
                      className="w-full py-1.5 rounded-xl bg-black/80 hover:bg-black border border-[#F5D77F]/40 text-[#F5D77F] text-[10px] font-serif font-bold flex items-center justify-center gap-1 backdrop-blur-md active:scale-95 transition cursor-pointer"
                    >
                      <Crop size={12} />
                      <span>Sesuaikan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload File Input */}
            <div className="space-y-3 pt-3 border-t border-stone-200">
              <label className="w-full py-2.5 rounded-2xl border border-dashed border-[#8C7A6B]/50 hover:bg-[#FAF7F2] flex items-center justify-center gap-2 text-xs font-serif font-bold text-[#6B111F] cursor-pointer transition">
                <Upload size={14} />
                <span>Upload File Foto dari Perangkat</span>
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
                  placeholder="Atau tempel URL gambar..."
                  value={newPhotoUrlInput}
                  onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                  className="flex-1 bg-[#FAF7F2] border border-[#E5DACB] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-[#6B111F] font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddHeroPhotoUrl}
                  className="px-4 py-2 bg-[#6B111F] hover:bg-[#8A1828] text-[#F5D77F] text-xs font-serif font-bold rounded-xl transition cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200 mt-4">
              <button
                type="button"
                onClick={() => setHeroModalEvent(null)}
                className="px-4 py-2 rounded-full text-stone-600 hover:text-stone-900 text-xs font-serif font-medium transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveHeroPhotos}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] hover:brightness-110 text-[#F5D77F] border border-[#F5D77F]/30 text-xs font-serif font-bold shadow-md shadow-rose-950/20 transition cursor-pointer"
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

      {/* ================= 🌟 MODAL: LIVE EVENT PHONE PREVIEW (ADMIN INSPECTOR) 🌟 ================= */}
      <AnimatePresence>
        {previewModalEvent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white border border-[#EADBCC] rounded-3xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(107,17,31,0.15)] relative max-h-[95vh] flex flex-col justify-between overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="flex items-start justify-between gap-3 border-b border-stone-200 pb-3 mb-3 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-wider text-[#8C7A6B] uppercase font-bold">
                      PRATINJAU LAYAR TAMU
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EADBCC] text-stone-700">
                      /{previewModalEvent.slug}
                    </span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-stone-900 tracking-tight truncate max-w-[260px] sm:max-w-sm mt-0.5">
                    {previewModalEvent.displayName}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => navigateToEvent(previewModalEvent.slug)}
                    className="p-2 rounded-full bg-[#FAF7F2] hover:bg-stone-100 text-stone-700 border border-stone-200 transition cursor-pointer shadow-xs"
                    title="Buka Web Tamu"
                  >
                    <ExternalLink size={14} className="text-[#6B111F]" />
                  </button>
                  <button
                    onClick={() => setPreviewModalEvent(null)}
                    className="p-2 rounded-full bg-[#FAF7F2] hover:bg-stone-100 text-stone-400 hover:text-stone-800 border border-stone-200 transition cursor-pointer"
                    title="Tutup Pratinjau"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Mode Switcher Pill */}
              <div className="inline-flex items-center p-1 rounded-full bg-[#FAF7F2] border border-[#E5DACB] mx-auto mb-3 flex-shrink-0">
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

              {/* Interactive Phone Simulation Frame */}
              <div className="flex-1 min-h-0 flex items-center justify-center overflow-y-auto no-scrollbar py-1">
                <div className="relative mx-auto w-full max-w-[280px] xs:max-w-[300px] rounded-[36px] bg-stone-950 p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.25)] border-[5px] border-stone-800 select-none">
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-stone-900 rounded-full z-40 flex items-center justify-between px-2.5 pointer-events-none">
                    <div className="w-2 h-2 rounded-full bg-stone-950" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#1A1A24]" />
                  </div>

                  {/* Phone Screen Interior */}
                  <div className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden bg-[#10060E]">
                    
                    {/* TAB 1: Beranda Tamu */}
                    {previewTab === 'hero' && (() => {
                      const isWed = (previewModalEvent.eventType || 'wedding') === 'wedding';
                      const badgeText = isWed 
                        ? 'THE WEDDING CELEBRATION OF' 
                        : (previewModalEvent.eventType === 'concert' 
                            ? 'OFFICIAL FESTIVAL PHOTOBOOTH' 
                            : (previewModalEvent.eventType === 'exhibition' 
                                ? 'EXHIBITION PHOTOBOOTH' 
                                : (previewModalEvent.eventType === 'festival' 
                                    ? 'OFFICIAL EXPO PHOTOBOOTH' 
                                    : 'OFFICIAL EVENT PHOTOBOOTH')));
                      const photos = previewModalEvent.heroPhotos && previewModalEvent.heroPhotos.length > 0
                        ? previewModalEvent.heroPhotos
                        : DEFAULT_HERO_PHOTOS;

                      return (
                        <div className="w-full h-full relative flex flex-col justify-between p-4 text-center">
                          <img 
                            src={photos[previewPhotoIdx] || photos[0]} 
                            alt="Preview Backdrop" 
                            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.82] contrast-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/25 to-black/90 pointer-events-none" />

                          {/* Top Header */}
                          <div className="relative z-10 pt-5 flex flex-col items-center">
                            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-sans font-semibold text-amber-200 uppercase tracking-[0.2em] border border-white/15 shadow-sm">
                              {badgeText}
                            </span>

                            <h1 
                              style={isWed ? { 
                                fontFamily: "'Alex Brush', 'Great Vibes', cursive",
                                textShadow: '0 3px 20px rgba(0,0,0,0.9), 0 0 30px rgba(245,215,127,0.4)'
                              } : {
                                fontFamily: "'Playfair Display', Georgia, serif",
                                textShadow: '0 3px 20px rgba(0,0,0,0.9), 0 0 30px rgba(245,215,127,0.3)',
                                letterSpacing: '-0.02em'
                              }}
                              className={`${isWed ? 'text-4xl xs:text-5xl font-normal' : 'text-2xl xs:text-3xl font-serif font-black tracking-tight'} text-white leading-tight mt-1 px-1 drop-shadow-2xl`}
                            >
                              {previewModalEvent.displayName}
                            </h1>

                            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15">
                              <p className="text-[9px] text-rose-100 font-medium">
                                {previewModalEvent.formattedDate || previewModalEvent.eventDate} • {previewModalEvent.venue || 'Venue Acara'}
                              </p>
                            </div>
                          </div>

                          {/* Bottom Action Simulation */}
                          <div className="relative z-10 pb-2 space-y-2">
                            <div className="flex flex-col gap-1.5 w-full max-w-[200px] mx-auto">
                              <div className="py-2 px-3 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] text-[#F5D77F] border border-amber-300/40 text-[11px] font-serif font-bold shadow-lg flex items-center justify-center gap-1.5">
                                <Camera size={12} />
                                <span>Mulai Photobooth</span>
                              </div>
                              <div className="py-1.5 px-3 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium flex items-center justify-center">
                                Lihat Galeri Foto
                              </div>
                            </div>

                            {/* Slide Dots */}
                            {photos.length > 1 && (
                              <div className="flex items-center justify-center gap-1 pt-1">
                                {photos.map((_, i) => (
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
                      );
                    })()}

                    {/* TAB 2: Strip Foto */}
                    {previewTab === 'frame' && (() => {
                      const isWed = (previewModalEvent.eventType || 'wedding') === 'wedding';
                      const theme = PREVIEW_FRAME_THEMES[activeFrameThemeIdx] || PREVIEW_FRAME_THEMES[0];
                      const photos = previewModalEvent.heroPhotos && previewModalEvent.heroPhotos.length > 0
                        ? previewModalEvent.heroPhotos
                        : DEFAULT_HERO_PHOTOS;

                      return (
                        <div className="w-full h-full relative bg-[#F5EFEB] flex flex-col justify-between p-3 overflow-hidden text-stone-900">
                          <div className="text-center pt-3 pb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-black/70 text-white text-[8px] font-mono tracking-widest uppercase">
                              Pratinjau Hasil Strip
                            </span>
                          </div>

                          <div 
                            className="relative mx-auto w-[150px] rounded-xl shadow-2xl p-2 flex flex-col justify-between transition-colors duration-300"
                            style={{ 
                              backgroundColor: theme.hex,
                              color: theme.textHex,
                              border: `1.5px solid ${theme.borderHex}`
                            }}
                          >
                            <div className="text-center pb-1">
                              <span className="text-[6px] font-mono tracking-widest block uppercase opacity-80">
                                {isWed ? 'THE WEDDING OF' : 'OFFICIAL PHOTOBOOTH'}
                              </span>
                              <strong 
                                className="text-[9px] font-serif tracking-wide block truncate"
                                style={{ color: theme.textHex }}
                              >
                                {previewModalEvent.displayName}
                              </strong>
                            </div>

                            <div className="space-y-1.5 py-1">
                              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/20 border border-black/10">
                                <img src={photos[0] || DEFAULT_HERO_PHOTOS[0]} alt="Pose 1" className="w-full h-full object-cover" />
                              </div>
                              <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/20 border border-black/10">
                                <img src={photos[1] || photos[0] || DEFAULT_HERO_PHOTOS[1]} alt="Pose 2" className="w-full h-full object-cover" />
                              </div>
                            </div>

                            <div className="text-center pt-1 border-t border-black/10">
                              <span className="text-[6px] font-mono opacity-80">
                                {previewModalEvent.formattedDate || previewModalEvent.eventDate}
                              </span>
                            </div>
                          </div>

                          {/* Theme Controls */}
                          <div className="pt-1 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setActiveFrameThemeIdx((prev) => (prev - 1 + PREVIEW_FRAME_THEMES.length) % PREVIEW_FRAME_THEMES.length)}
                              className="p-1 rounded-full bg-white text-stone-700 shadow-sm border border-stone-200 cursor-pointer"
                            >
                              <ChevronLeft size={12} />
                            </button>
                            <span className="text-[9px] font-serif font-bold text-stone-800">
                              {theme.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveFrameThemeIdx((prev) => (prev + 1) % PREVIEW_FRAME_THEMES.length)}
                              className="p-1 rounded-full bg-white text-stone-700 shadow-sm border border-stone-200 cursor-pointer"
                            >
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Footer */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => navigateToSetup(previewModalEvent.slug)}
                  className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-stone-100 text-stone-700 text-xs font-serif font-medium border border-stone-200 transition cursor-pointer shadow-xs"
                >
                  Portal Setup Klien
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewModalEvent(null)}
                  className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#6B111F] via-[#8A1828] to-[#6B111F] text-[#F5D77F] text-xs font-serif font-bold border border-[#F5D77F]/30 transition cursor-pointer shadow-xs"
                >
                  Selesai
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
