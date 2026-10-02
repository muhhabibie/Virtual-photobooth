import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar, QrCode, Trash2, Check, Lock, 
  ExternalLink, Eye, Image as ImageIcon, Upload, 
  MessageCircle, Share2, LogOut, Crop, Printer, Archive, 
  ChevronRight, ChevronLeft, Smartphone, X, Camera, Copy
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
      toast('Login Admin Berhasil. Selamat datang di Portal Sirklen.', 'success');
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
    toast(`Event "${newEvt.displayName}" berhasil dibuat`, 'success');
  };

  // Copy Setup Link for Event Host / Couple
  const handleCopySetupLink = (slug) => {
    const fullUrl = `${window.location.origin}/setup/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(`setup_${slug}`);
    toast('Link Setup berhasil disalin', 'success');
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
    toast('Tautan web pengunjung berhasil disalin', 'success');
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
      toast(`Menyiapkan arsip ZIP untuk ${evt.displayName}...`, 'info');
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

  // ================= 🌟 SCREEN 1: ADMIN LOGIN SCREEN (MINIMALIST OBSIDIAN) 🌟 =================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090B] text-zinc-100 flex items-center justify-center p-4 selection:bg-zinc-800 selection:text-white relative">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm rounded-2xl bg-[#121215] border border-zinc-800 p-7 sm:p-8 text-center shadow-2xl relative z-10"
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[10px] font-mono font-medium tracking-wider mb-4">
            ADMIN CONSOLE
          </div>

          <h2 className="text-xl font-sans font-bold text-white mb-1.5 tracking-tight">
            Sirklen Admin
          </h2>
          <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
            Masukkan PIN keamanan untuk mengelola seluruh event dan operasional photobooth.
          </p>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={12}
                placeholder="PIN Keamanan"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                autoFocus
                className={`w-full text-center tracking-[0.35em] font-mono text-lg py-2.5 px-4 rounded-xl bg-zinc-900/90 border ${
                  pinError ? 'border-rose-500 ring-1 ring-rose-500/30 text-rose-200' : 'border-zinc-700 focus:border-zinc-400 text-white'
                } placeholder-zinc-600 focus:outline-none transition`}
              />
              {pinError && (
                <p className="text-rose-400 text-xs font-sans mt-2">
                  PIN salah. Masukkan 1234 atau sirklen2026.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-white hover:bg-zinc-200 active:scale-98 text-black font-sans font-semibold text-xs shadow-sm transition cursor-pointer"
            >
              Masuk Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800/80">
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
              Sirklen Photobooth Engine
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ================= 🌟 SCREEN 2: DEDICATED FULLSCREEN ADMIN DASHBOARD 🌟 =================
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={introReady ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#09090B] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white pb-24 relative"
    >
      {/* ================= 🌟 TOP HEADER 🌟 ================= */}
      <header className="sticky top-0 z-40 bg-[#09090B]/90 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold text-lg text-white tracking-tight">
              Sirklen
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/80 text-zinc-300 font-medium tracking-wider">
              ADMIN
            </span>
            <span className="hidden sm:inline text-xs text-zinc-500 font-normal">
              Event & Booth Management
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEventType('wedding');
                setShowCreateModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 active:scale-95 text-black text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Buat Event</span>
            </button>

            <button
              onClick={() => setIsAdminAuthenticated(false)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
              title="Kunci Dashboard"
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>
      </header>

      {/* ================= 🌟 DASHBOARD BODY 🌟 ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 relative z-10 space-y-6">

        {/* 1. System Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-[#111114] border border-zinc-800/90 shadow-xs">
            <span className="text-xs font-medium text-zinc-400 block mb-1">
              Event Aktif
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-sans font-semibold text-white tracking-tight">
                {activeEventsCount}
              </span>
              <span className="text-xs text-zinc-500">Acara</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#111114] border border-zinc-800/90 shadow-xs">
            <span className="text-xs font-medium text-zinc-400 block mb-1">
              Total Event Terdaftar
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-sans font-semibold text-white tracking-tight">
                {events.length}
              </span>
              <span className="text-xs text-zinc-500">Klien</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#111114] border border-zinc-800/90 shadow-xs">
            <span className="text-xs font-medium text-zinc-400 block mb-1">
              Sesi Foto Tersimpan
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-sans font-semibold text-white tracking-tight">
                {savedSubmissions.length}
              </span>
              <span className="text-xs text-zinc-500">Sesi Tamu</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#111114] border border-zinc-800/90 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-medium text-zinc-400 block mb-1">
              Status Sistem
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              <span className="text-xs font-mono font-medium text-emerald-400">
                Online & Terhubung
              </span>
            </div>
          </div>

        </div>

        {/* 2. Navigation Tabs & Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-zinc-800/80 pb-3">
          
          {/* Main Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>Daftar Acara ({events.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <QrCode size={13} />
              <span>Cetak QR Code</span>
            </button>
          </div>

          {/* Category Filter Pills (Zero Emojis, Clean Text) */}
          {activeTab === 'events' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedFilterCategory('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedFilterCategory === 'all'
                    ? 'bg-zinc-800 text-white border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                Semua
              </button>
              {EVENT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilterCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                    selectedFilterCategory === cat.id
                      ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ================= 🌟 TAB 1: EVENTS LIST (EXECUTIVE SAAS CARDS) 🌟 ================= */}
        {activeTab === 'events' && (
          <div className="space-y-3.5">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[#111114] border border-zinc-800">
                <p className="text-zinc-400 text-xs">Tidak ada event pada kategori ini.</p>
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
                    className="p-5 sm:p-6 rounded-2xl bg-[#111114] border border-zinc-800/90 hover:border-zinc-700/80 transition shadow-sm"
                  >
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                      
                      {/* Left Side: Event Identity & Meta */}
                      <div className="flex-1 space-y-2.5">
                        
                        {/* Tags Strip */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Category Tag */}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-800/90 border border-zinc-700/80 text-zinc-300">
                            {catMeta.name}
                          </span>

                          {/* Package Badge (Paket Spesial / Standard / Basic) */}
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-800/60 border border-zinc-700/60 text-zinc-300">
                            {pkgInfo.name}
                          </span>

                          {/* Status Badge */}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono ${
                            isExpired 
                              ? 'bg-rose-950/40 border border-rose-800/40 text-rose-300' 
                              : 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                            <span>{isExpired ? 'Kedaluwarsa' : `Aktif (${daysLeft} Hari Lagi)`}</span>
                          </span>
                        </div>

                        {/* Event Title */}
                        <h3 className="text-xl sm:text-2xl font-sans font-bold text-white tracking-tight">
                          {evt.displayName}
                        </h3>

                        {/* Metadata Details */}
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-zinc-400 font-sans">
                          <span>
                            Tanggal: <strong className="text-zinc-200 font-medium">{evt.formattedDate || evt.eventDate}</strong>
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span>
                            Lokasi: <strong className="text-zinc-200 font-medium">{evt.venue || 'Venue Acara'}</strong>
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span className="font-mono text-zinc-300 flex items-center gap-1">
                            Link: <strong className="text-zinc-100">/{evt.slug}</strong>
                            <button
                              onClick={() => handleCopyGuestLink(evt.slug)}
                              className="text-zinc-500 hover:text-zinc-200 p-0.5 transition cursor-pointer"
                              title="Salin Link Tamu"
                            >
                              <Copy size={12} />
                            </button>
                          </span>
                          <span className="text-zinc-600">•</span>
                          <span>
                            Foto Banner: <strong className="text-zinc-200 font-medium">{evt.heroPhotos?.length || 0} Foto</strong>
                          </span>
                        </div>

                      </div>

                      {/* Right Side: Professional Unified Action System */}
                      <div className="flex flex-col gap-2.5 xl:items-end">
                        
                        {/* Primary Row: Quick Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPreviewModalEvent(evt);
                              setPreviewTab('hero');
                              setPreviewPhotoIdx(0);
                              setActiveFrameThemeIdx(0);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Pratinjau tampilan layar HP tamu"
                          >
                            <Smartphone size={14} className="text-zinc-400" />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleCopySetupLink(evt.slug)}
                            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Salin tautan setup khusus klien"
                          >
                            {copiedSlug === `setup_${evt.slug}` ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} className="text-zinc-400" />}
                            <span>Salin Link Setup</span>
                          </button>

                          <button
                            onClick={() => handleSendWhatsApp(evt)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Kirim pesan instruksi otomatis ke WhatsApp"
                          >
                            <MessageCircle size={14} className="text-emerald-400" />
                            <span>Kirim WA</span>
                          </button>
                        </div>

                        {/* Secondary Row: Tools & Utilities (Clean Segmented Toolbar) */}
                        <div className="flex items-center gap-1 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl">
                          <button
                            onClick={() => openHeroPhotosManager(evt)}
                            className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Kelola foto banner prewedding / event"
                          >
                            <ImageIcon size={13} />
                            <span>Foto</span>
                          </button>

                          <div className="w-[1px] h-3.5 bg-zinc-800" />

                          <button
                            onClick={() => {
                              setSelectedQrEvent(evt);
                              setActiveTab('qr');
                            }}
                            className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Tampilkan QR Code"
                          >
                            <QrCode size={13} />
                            <span>QR</span>
                          </button>

                          <div className="w-[1px] h-3.5 bg-zinc-800" />

                          <button
                            onClick={() => setSelectedTentCardEvent(evt)}
                            className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Desain & Cetak Kartu Meja"
                          >
                            <Printer size={13} />
                            <span>Cetak Meja</span>
                          </button>

                          <div className="w-[1px] h-3.5 bg-zinc-800" />

                          <button
                            onClick={() => handleDownloadEventZip(evt)}
                            disabled={zippingEventId === evt.id}
                            className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                            title="Unduh seluruh foto tamu (.ZIP)"
                          >
                            <Archive size={13} className={zippingEventId === evt.id ? 'animate-bounce text-amber-300' : ''} />
                            <span>ZIP</span>
                          </button>

                          <div className="w-[1px] h-3.5 bg-zinc-800" />

                          {/* View Guest Web */}
                          <button
                            onClick={() => navigateToEvent(evt.slug)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                            title="Buka Tampilan Web Tamu"
                          >
                            <ExternalLink size={13} />
                          </button>

                          <div className="w-[1px] h-3.5 bg-zinc-800" />

                          {/* Delete Event */}
                          <button
                            onClick={() => {
                              if (confirm(`Yakin ingin menghapus event "${evt.displayName}"?`)) {
                                deleteEvent(evt.id);
                                toast('Event berhasil dihapus', 'info');
                              }
                            }}
                            className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition cursor-pointer"
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
          <div className="max-w-md mx-auto p-6 sm:p-7 rounded-2xl bg-[#111114] border border-zinc-800 text-center shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-medium block mb-1">
              QR CODE MEJA
            </span>
            <h3 className="text-base font-sans font-bold text-white mb-1">
              Generator Cetak Kartu QR
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Pilih acara yang ingin dicetak kartu QR Code atau diunduh asetnya:
            </p>

            <select
              value={selectedQrEvent?.id || events[0]?.id}
              onChange={(e) => {
                const found = events.find(ev => ev.id === e.target.value);
                setSelectedQrEvent(found);
              }}
              className="w-full py-2.5 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-mono mb-6 focus:outline-none focus:border-zinc-500"
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id} className="bg-zinc-900 text-white">
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

      {/* ================= 🌟 MODAL: CREATE EVENT (CLEAN, NO EMOJIS, NO AI SLOP) 🌟 ================= */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
                <div>
                  <h3 className="text-base sm:text-lg font-sans font-semibold text-white">
                    Buat Event Baru
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Konfigurasi photobooth untuk klien atau acara baru.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 1. Category Selector (Clean Segmented Control, Zero Emojis) */}
              <div className="mb-5">
                <label className="text-xs font-medium text-zinc-300 block mb-2">
                  Kategori Acara
                </label>
                <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
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
                      className={`flex-1 min-w-[95px] py-1.5 px-2.5 rounded-lg text-xs font-medium transition cursor-pointer text-center ${
                        eventType === cat.id
                          ? 'bg-zinc-800 text-white shadow-xs border border-zinc-700 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
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
                      <label className="text-xs font-medium text-zinc-300 block mb-1">
                        Mempelai Pria
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Raka"
                        value={groomName}
                        onChange={(e) => handleNameChange(e.target.value, brideName)}
                        className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-zinc-300 block mb-1">
                        Mempelai Wanita
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Sabrina"
                        value={brideName}
                        onChange={(e) => handleNameChange(groomName, e.target.value)}
                        className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                      />
                    </div>
                  </div>
                ) : (
                  /* Non-Wedding Inputs (Concert, Exhibition, Festival) */
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                      Nama Acara / Pameran / Konser
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pestapora 2026, Void Vision, Jakcloth Fest"
                      value={eventName}
                      onChange={(e) => handleGeneralEventNameChange(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    />
                  </div>
                )}

                {/* Venue / Location */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Lokasi / Venue Acara
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Gambir Expo Kemayoran Jakarta / Grand Ballroom"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                  />
                </div>

                {/* Slug Link */}
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Slug Tautan Web
                  </label>
                  <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono">
                    <span className="text-zinc-500 select-none">
                      {typeof window !== 'undefined' && window.location.host ? `${window.location.host}/` : 'sirklen.id/'}
                    </span>
                    <input
                      type="text"
                      required
                      value={eventSlug}
                      onChange={(e) => setEventSlug(e.target.value)}
                      className="flex-1 bg-transparent text-white focus:outline-none font-medium ml-1"
                    />
                  </div>
                </div>

                {/* Date & Package */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                      Tanggal Acara
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-300 block mb-1">
                      Pilihan Paket
                    </label>
                    <select
                      value={selectedPackage}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition"
                    >
                      <option value="basic" className="bg-zinc-900 text-white">Basic (7 Hari • Rp 300rb)</option>
                      <option value="standard" className="bg-zinc-900 text-white">Standard (10 Hari • Rp 400rb)</option>
                      <option value="all_in" className="bg-zinc-900 text-white">Paket Spesial (14 Hari • Rp 500rb)</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-medium transition cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 active:scale-95 text-black text-xs font-semibold shadow-sm transition cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div>
                <h3 className="text-base font-sans font-semibold text-white">
                  Foto Banner — {heroModalEvent.displayName}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Kelola foto banner cover untuk tampilan web photobooth tamu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHeroModalEvent(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Photo Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1 mb-4 no-scrollbar">
              {editHeroPhotos.map((url, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group shadow-sm">
                  <img src={url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                  
                  {/* Action overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/60 sm:opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-zinc-200 font-medium bg-black/60 px-2 py-0.5 rounded-full border border-white/10">
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
                      className="w-full py-1.5 rounded-lg bg-black/80 hover:bg-black border border-white/20 text-white text-[11px] font-medium flex items-center justify-center gap-1 backdrop-blur-md active:scale-95 transition cursor-pointer"
                    >
                      <Crop size={12} />
                      <span>Sesuaikan</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload File Input */}
            <div className="space-y-3 pt-3 border-t border-zinc-800">
              <label className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50 flex items-center justify-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer transition">
                <Upload size={14} />
                <span>Upload File Foto</span>
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
                  placeholder="Tempel tautan URL gambar..."
                  value={newPhotoUrlInput}
                  onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddHeroPhotoUrl}
                  className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800 mt-4">
              <button
                type="button"
                onClick={() => setHeroModalEvent(null)}
                className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white text-xs font-medium transition cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSaveHeroPhotos}
                className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-sm transition cursor-pointer"
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl relative max-h-[95vh] flex flex-col justify-between overflow-hidden"
            >
              {/* Modal Top Bar */}
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3 mb-3 flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-medium">
                      PRATINJAU LAYAR TAMU
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                      /{previewModalEvent.slug}
                    </span>
                  </div>
                  <h3 className="text-base font-sans font-bold text-white tracking-tight truncate max-w-[260px] sm:max-w-sm mt-0.5">
                    {previewModalEvent.displayName}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => navigateToEvent(previewModalEvent.slug)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition cursor-pointer"
                    title="Buka Web Tamu"
                  >
                    <ExternalLink size={14} />
                  </button>
                  <button
                    onClick={() => setPreviewModalEvent(null)}
                    className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition cursor-pointer"
                    title="Tutup Pratinjau"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Mode Switcher Pill */}
              <div className="flex items-center justify-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mx-auto mb-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewTab('hero')}
                  className={`px-3.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    previewTab === 'hero'
                      ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Beranda Tamu
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('frame')}
                  className={`px-3.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    previewTab === 'frame'
                      ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Hasil Strip Foto
                </button>
              </div>

              {/* Interactive Phone Simulation Frame */}
              <div className="flex-1 min-h-0 flex items-center justify-center overflow-y-auto no-scrollbar py-1">
                <div className="relative mx-auto w-full max-w-[280px] xs:max-w-[300px] rounded-[36px] bg-zinc-950 p-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.6)] border-[4px] border-zinc-800 select-none">
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-900 rounded-full z-40 flex items-center justify-between px-2.5 pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-950" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                  </div>

                  {/* Phone Screen Interior */}
                  <div className="relative w-full aspect-[9/16] rounded-[28px] overflow-hidden bg-zinc-900">
                    
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
                            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-sans font-medium text-zinc-300 uppercase tracking-wider border border-white/10">
                              {badgeText}
                            </span>

                            <h1 
                              style={isWed ? { 
                                fontFamily: "'Alex Brush', 'Great Vibes', cursive",
                                textShadow: '0 3px 20px rgba(0,0,0,0.9)'
                              } : {
                                fontFamily: "'Playfair Display', Georgia, serif",
                                textShadow: '0 3px 20px rgba(0,0,0,0.9)',
                                letterSpacing: '-0.02em'
                              }}
                              className={`${isWed ? 'text-4xl xs:text-5xl font-normal' : 'text-2xl xs:text-3xl font-serif font-black tracking-tight'} text-white leading-tight mt-1 px-1 drop-shadow-2xl`}
                            >
                              {previewModalEvent.displayName}
                            </h1>

                            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15">
                              <p className="text-[9px] text-zinc-200 font-medium">
                                {previewModalEvent.formattedDate || previewModalEvent.eventDate} • {previewModalEvent.venue || 'Venue Acara'}
                              </p>
                            </div>
                          </div>

                          {/* Bottom Action Simulation */}
                          <div className="relative z-10 pb-2 space-y-2">
                            <div className="flex flex-col gap-1.5 w-full max-w-[200px] mx-auto">
                              <div className="py-2 px-3 rounded-full bg-white text-black text-[11px] font-sans font-semibold shadow-lg flex items-center justify-center gap-1.5">
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
                                        ? 'w-4 h-1.5 bg-white' 
                                        : 'w-1.5 h-1.5 bg-white/40'
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
                        <div className="w-full h-full relative bg-[#F4F4F5] flex flex-col justify-between p-3 overflow-hidden text-zinc-900">
                          <div className="text-center pt-3 pb-1">
                            <span className="px-2.5 py-0.5 rounded-full bg-black/80 text-white text-[8px] font-mono tracking-wider uppercase">
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
                              className="p-1 rounded-full bg-white text-zinc-700 shadow-sm border border-zinc-200 cursor-pointer"
                            >
                              <ChevronLeft size={12} />
                            </button>
                            <span className="text-[9px] font-sans font-semibold text-zinc-800">
                              {theme.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveFrameThemeIdx((prev) => (prev + 1) % PREVIEW_FRAME_THEMES.length)}
                              className="p-1 rounded-full bg-white text-zinc-700 shadow-sm border border-zinc-200 cursor-pointer"
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
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => navigateToSetup(previewModalEvent.slug)}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition cursor-pointer"
                >
                  Portal Setup Klien
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewModalEvent(null)}
                  className="px-4 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition cursor-pointer shadow-xs"
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
