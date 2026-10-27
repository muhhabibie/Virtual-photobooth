import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Image as ImageIcon, Save,
  Trash2, Plus, ExternalLink, Eye, Share2, Upload, Crop,
  Info, Move, ChevronLeft, ChevronRight, Smartphone,
  Palette, Sparkles, Sliders, RotateCw, ZoomIn, ZoomOut, Check, Layers, X,
  Download, FolderArchive, Package, Loader2, MessageCircle
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';
import PhotoCropModal from '../ui/PhotoCropModal';
import { DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';
import { compressImage, compressOrnament } from '../../utils/imageCompressor';
import { PRESET_ORNAMENTS, renderOrnamentToCanvas } from '../../config/frameOrnaments';
import { exportEventSubmissionsZip } from '../../utils/zipExport';

const BORDER_PRESET_COLORS = [
  { name: 'Pasadena Botanical', bg: '#FFFFFF', text: '#2B2826', border: '#C4A482' },
  { name: 'Royal Burgundy', bg: '#6B111F', text: '#F5D77F', border: '#8A1828' },
  { name: 'Ivory Bliss', bg: '#FDFBF7', text: '#6B111F', border: '#E2DDD5' },
  { name: 'Antique Gold', bg: '#C4A46C', text: '#FFFFFF', border: '#D4AF37' },
  { name: 'Noir Slate', bg: '#2D3748', text: '#E2E8F0', border: '#4A5568' },
  { name: 'Blush Rose', bg: '#F3C5CB', text: '#6B111F', border: '#E8B4B8' },
  { name: 'Sage Botanical', bg: '#26402E', text: '#E2F5D5', border: '#3B5943' },
  { name: 'Midnight Dark', bg: '#120B18', text: '#F5D77F', border: '#2D1B36' },
  { name: 'Deep Emerald', bg: '#0F382A', text: '#E5D5AA', border: '#1C5440' },
  { name: 'Pure White', bg: '#FFFFFF', text: '#1E1E1E', border: '#E5E7EB' },
];

const TEXT_PRESET_COLORS = [
  { name: 'Gold Luxury', hex: '#F5D77F' },
  { name: 'Ivory White', hex: '#FDFBF7' },
  { name: 'Rose Gold', hex: '#E8B4B8' },
  { name: 'Royal Wine', hex: '#6B111F' },
  { name: 'Charcoal Black', hex: '#1E1E1E' },
  { name: 'Soft Sage', hex: '#D1E7DD' },
];

function OrnamentBadge({ presetId, color, size = 32 }) {
  const canvasRef = useRef(null);
  const isDivider = presetId && presetId.startsWith('divider-');
  const canvasW = isDivider ? size * 3.4 : size * 1.5;
  const canvasH = size * 1.5;

  useEffect(() => {
    if (canvasRef.current) {
      renderOrnamentToCanvas(canvasRef.current, presetId, color, size);
    }
  }, [presetId, color, size]);

  return (
    <canvas 
      ref={canvasRef} 
      width={canvasW} 
      height={canvasH} 
      className="pointer-events-none max-w-full max-h-full object-contain" 
    />
  );
}

const PREVIEW_FRAME_THEMES = BORDER_PRESET_COLORS.map((c, i) => ({
  id: `theme_${i}`,
  name: c.name,
  hex: c.bg,
  textHex: c.text,
  borderHex: c.border
}));

const MAX_HERO_PHOTOS = 5;

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
    introReady,
    savedSubmissions
  } = useBooth();

  const { toast } = useToast();

  // Match existing event or construct dynamic auto-event for new slug
  const matchedEvent = activeEvent || events.find(e => (e.slug || '').toLowerCase() === (currentSlug || '').toLowerCase());
  const isNewSlugEvent = Boolean(currentSlug && currentSlug !== 'setup' && currentSlug !== 'demo' && !matchedEvent);

  const event = useMemo(() => {
    if (matchedEvent) return matchedEvent;
    if (isNewSlugEvent) {
      const cleanSlug = currentSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
      const defaultTitle = paramEvent || cleanSlug.replace(/-/g, ' ');
      return {
        id: 'evt_' + cleanSlug,
        slug: cleanSlug,
        eventType: 'wedding',
        eventName: defaultTitle,
        displayName: defaultTitle,
        groomName: paramGroom || '',
        brideName: paramBride || '',
        venue: paramVenue || 'Wedding Venue',
        eventDate: paramDate || new Date().toISOString().split('T')[0],
        heroPhotos: DEFAULT_HERO_PHOTOS,
        submissions: [],
        isAutoCreated: true
      };
    }
    return events[0];
  }, [matchedEvent, isNewSlugEvent, currentSlug, paramEvent, paramGroom, paramBride, paramVenue, paramDate, events]);
  const isWedding = (event?.eventType || 'wedding') === 'wedding';

  // Photo Submissions & ZIP Export State
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const eventSubmissions = (savedSubmissions || []).filter(
    s => s.eventSlug === event?.slug || s.eventId === event?.id
  );
  const totalSubmissionsCount = eventSubmissions.length;
  const effectiveSubmissions = totalSubmissionsCount > 0 ? eventSubmissions : (event?.submissions || MOCK_GALLERY_PHOTOS);

  // Parse Lynk.id Query Parameters if redirected from purchase
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const paramGroom = searchParams.get('groom') || searchParams.get('pria') || searchParams.get('pengantin_pria');
  const paramBride = searchParams.get('bride') || searchParams.get('wanita') || searchParams.get('pengantin_wanita');
  const paramEvent = searchParams.get('event') || searchParams.get('acara') || searchParams.get('nama_acara') || searchParams.get('nama');
  const paramVenue = searchParams.get('venue') || searchParams.get('lokasi') || searchParams.get('tempat');
  const paramDate = searchParams.get('date') || searchParams.get('tanggal') || searchParams.get('tgl');
  const paramPhone = searchParams.get('wa') || searchParams.get('phone') || searchParams.get('nohp') || searchParams.get('hp');
  const isFromLynkId = searchParams.get('from') === 'lynkid' || searchParams.has('lynkid') || searchParams.get('source') === 'lynkid' || Boolean(searchParams.get('setup') && (paramGroom || paramEvent));

  // Form State
  const [heroPhotos, setHeroPhotos] = useState(event?.heroPhotos || DEFAULT_HERO_PHOTOS);
  const [eventName, setEventName] = useState(paramEvent || event?.eventName || (isWedding ? '' : (event?.displayName || '')));
  const [groomName, setGroomName] = useState(paramGroom || event?.groomName || 'Raka');
  const [brideName, setBrideName] = useState(paramBride || event?.brideName || 'Sabrina');
  const [venue, setVenue] = useState(paramVenue || event?.venue || (isWedding ? 'Grand Ballroom Jakarta' : 'Venue Acara'));
  const [eventDate, setEventDate] = useState(paramDate || event?.eventDate || '2026-05-30');
  const [clientPhone, setClientPhone] = useState(paramPhone || '');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleDownloadAllZip = async () => {
    if (isZipping) return;
    setIsZipping(true);
    setZipProgress(10);
    const eventTitle = isWedding ? `${groomName} & ${brideName}` : (eventName || event?.displayName || 'Event');
    try {
      toast(`Menyiapkan arsip ZIP foto untuk ${eventTitle}...`, 'info');
      const result = await exportEventSubmissionsZip({
        event: {
          ...event,
          displayName: eventTitle
        },
        submissions: effectiveSubmissions,
        onProgress: (p) => setZipProgress(p),
      });
      toast(`Arsip foto berhasil diunduh (${result.totalPhotos} foto)`, 'success');
    } catch (err) {
      console.error('Failed to export ZIP:', err);
      toast(err.message || 'Gagal mengunduh arsip ZIP', 'error');
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // Custom Frame & Ornament State (Desain Mandiri Pengantin)
  const [frameBgColor, setFrameBgColor] = useState(event?.customFrame?.bgColor || '#6B111F');
  const [frameTextColor, setFrameTextColor] = useState(event?.customFrame?.textColor || '#F5D77F');
  const [frameBorderColor, setFrameBorderColor] = useState(event?.customFrame?.borderColor || '#8A1828');
  const [frameOrnaments, setFrameOrnaments] = useState(event?.customFrame?.ornaments || []);
  const [activeOrnId, setActiveOrnId] = useState(null);
  const [studioTab, setStudioTab] = useState('presets'); // 'presets' | 'upload' | 'palette'

  // Live Preview State (Live Simulator)
  const [previewTab, setPreviewTab] = useState('hero'); // 'hero' | 'frame'
  const [previewPhotoIdx, setPreviewPhotoIdx] = useState(0);
  const [activeFrameThemeIdx, setActiveFrameThemeIdx] = useState(0);

  // Photo Crop Modal State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropImage, setCurrentCropImage] = useState(null);
  const [activeCropIdx, setActiveCropIdx] = useState(null); // null = add new, number = re-crop existing

  const fileInputRef = useRef(null);
  const ornamentFileInputRef = useRef(null);
  const stripPreviewRef = useRef(null);

  // Keep state synchronized if active event changes
  useEffect(() => {
    if (event?.customFrame) {
      if (event.customFrame.bgColor) setFrameBgColor(event.customFrame.bgColor);
      if (event.customFrame.textColor) setFrameTextColor(event.customFrame.textColor);
      if (event.customFrame.borderColor) setFrameBorderColor(event.customFrame.borderColor);
      if (Array.isArray(event.customFrame.ornaments)) setFrameOrnaments(event.customFrame.ornaments);
    }
  }, [event?.id]);

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
    if (heroPhotos.length >= MAX_HERO_PHOTOS) {
      toast(`Maksimal ${MAX_HERO_PHOTOS} foto slide. Hapus salah satu foto terlebih dahulu jika ingin mengganti.`, 'warning');
      e.target.value = '';
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = async (eventResult) => {
      const base64Url = eventResult.target.result;
      const optimized = await compressImage(base64Url, 1600, 0.88);
      setCurrentCropImage(optimized);
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
      if (heroPhotos.length >= MAX_HERO_PHOTOS) {
        toast(`Maksimal ${MAX_HERO_PHOTOS} foto slide`, 'warning');
        return;
      }
      setHeroPhotos(prev => [...prev.slice(0, MAX_HERO_PHOTOS - 1), croppedBase64]);
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
    if (heroPhotos.length >= MAX_HERO_PHOTOS) {
      toast(`Maksimal ${MAX_HERO_PHOTOS} foto slide. Hapus salah satu foto terlebih dahulu jika ingin mengganti.`, 'warning');
      return;
    }
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

  // ================= 🎨 FRAME ORNAMENT & COLOR HANDLERS 🎨 =================
  const handleStartDragOrnament = (e, ornId) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveOrnId(ornId);

    const stripEl = stripPreviewRef.current;
    if (!stripEl) return;

    const onPointerMove = (moveEv) => {
      moveEv.preventDefault();
      const rect = stripEl.getBoundingClientRect();
      const rawX = (moveEv.clientX - rect.left) / rect.width;
      const rawY = (moveEv.clientY - rect.top) / rect.height;

      const clampedX = Math.max(0.04, Math.min(0.96, Number(rawX.toFixed(3))));
      const clampedY = Math.max(0.04, Math.min(0.96, Number(rawY.toFixed(3))));

      setFrameOrnaments(prev => prev.map(item => item.id === ornId ? { ...item, x: clampedX, y: clampedY } : item));
      setIsSaved(false);
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleAddPresetOrnament = (presetId) => {
    const preset = PRESET_ORNAMENTS.find(p => p.id === presetId);
    const isDivider = preset?.category === 'divider';
    const newOrn = {
      id: 'orn_' + Date.now(),
      type: 'preset',
      presetId,
      name: preset?.name || 'Ornamen',
      x: 0.5,
      y: isDivider 
        ? (frameOrnaments.some(o => o.y < 0.25) ? 0.86 : 0.16) 
        : (frameOrnaments.length === 0 ? 0.08 : (frameOrnaments.length % 2 === 1 ? 0.92 : 0.5)),
      scale: preset?.defaultScale || 1.0,
      rotation: 0,
      color: frameTextColor
    };
    setFrameOrnaments(prev => [...prev, newOrn]);
    setActiveOrnId(newOrn.id);
    setIsSaved(false);
    toast(`${preset?.name || 'Ornamen'} ditambahkan! Silakan geser langsung pada bingkai.`, 'success');
  };

  const handleUploadOrnament = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast('Format file harus berupa gambar (PNG direkomendasikan)', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      const compressed = await compressOrnament(base64, 480);
      const newOrn = {
        id: 'orn_' + Date.now(),
        type: 'image',
        name: file.name,
        src: compressed,
        x: 0.5,
        y: 0.5,
        scale: 1.0,
        rotation: 0
      };
      setFrameOrnaments(prev => [...prev, newOrn]);
      setActiveOrnId(newOrn.id);
      setIsSaved(false);
      toast('Gambar ornamen / monogram berhasil diunggah! Geser posisi langsung pada strip.', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteOrnament = (id) => {
    setFrameOrnaments(prev => prev.filter(o => o.id !== id));
    if (activeOrnId === id) setActiveOrnId(null);
    setIsSaved(false);
    toast('Ornamen dihapus', 'info');
  };

  const handleScaleOrnament = (id, delta) => {
    setFrameOrnaments(prev => prev.map(o => {
      if (o.id !== id) return o;
      const newScale = Math.max(0.4, Math.min(2.5, Number(((o.scale || 1.0) + delta).toFixed(2))));
      return { ...o, scale: newScale };
    }));
    setIsSaved(false);
  };

  const handleRotateOrnament = (id, delta) => {
    setFrameOrnaments(prev => prev.map(o => {
      if (o.id !== id) return o;
      const newRot = ((o.rotation || 0) + delta) % 360;
      return { ...o, rotation: newRot };
    }));
    setIsSaved(false);
  };

  const handleSetPresetPosition = (id, posKey) => {
    const POS = {
      'top-left': { x: 0.12, y: 0.05 },
      'top-center': { x: 0.50, y: 0.05 },
      'top-divider': { x: 0.50, y: 0.16 },
      'top-right': { x: 0.88, y: 0.05 },
      'center': { x: 0.50, y: 0.50 },
      'bottom-divider': { x: 0.50, y: 0.86 },
      'bottom-left': { x: 0.12, y: 0.95 },
      'bottom-center': { x: 0.50, y: 0.95 },
      'bottom-right': { x: 0.88, y: 0.95 },
    };
    const target = POS[posKey] || { x: 0.5, y: 0.5 };
    setFrameOrnaments(prev => prev.map(o => o.id === id ? { ...o, ...target } : o));
    setIsSaved(false);
  };

  const handleApplyPalette = (palette) => {
    setFrameBgColor(palette.bg);
    setFrameTextColor(palette.text);
    setFrameBorderColor(palette.border);
    // Update vector ornaments color to match accent
    setFrameOrnaments(prev => prev.map(o => o.type === 'preset' ? { ...o, color: palette.text } : o));
    setIsSaved(false);
    toast(`Warna diterapkan: ${palette.name}`, 'success');
  };

  // Save all changes
  const handleSaveAll = async () => {
    toast('Menyimpan pengaturan...', 'info');
    // Ensure all hero photos are capped at 5 and compressed to lightweight web JPEGs
    const limitedPhotos = heroPhotos.slice(0, MAX_HERO_PHOTOS);
    const compressedPhotos = await Promise.all(
      limitedPhotos.map(photo => compressImage(photo, 1280, 0.84))
    );
    setHeroPhotos(compressedPhotos);

    if (event?.isAutoCreated || !events.some(e => e.id === event?.id || e.slug === event?.slug)) {
      if (typeof createEvent === 'function') {
        createEvent({
          slug: event.slug,
          eventType: event.eventType || 'wedding',
          eventName,
          groomName,
          brideName,
          venue,
          eventDate,
          heroPhotos: compressedPhotos,
          customFrame: {
            bgColor: frameBgColor,
            textColor: frameTextColor,
            borderColor: frameBorderColor,
            ornaments: frameOrnaments,
          }
        });
      }
    } else {
      updateEventConfig(event.id, {
      eventType: event.eventType || 'wedding',
      eventName,
      groomName,
      brideName,
      venue,
      eventDate,
      heroPhotos: compressedPhotos,
      customFrame: {
        bgColor: frameBgColor,
        textColor: frameTextColor,
        borderColor: frameBorderColor,
        ornaments: frameOrnaments,
      }
      });
    }
    setIsSaved(true);
    toast('Semua perubahan berhasil disimpan & langsung aktif di web tamu!', 'success');
  };

  const guestUrl = event.slug === 'demo' ? `${window.location.origin}/` : `${window.location.origin}/${event.slug}?qr=1`;
  const setupUrl = typeof window !== 'undefined' ? `${window.location.origin}/setup/${event.slug}` : `/setup/${event.slug}`;

  const handleCopyGuestLink = () => {
    navigator.clipboard.writeText(guestUrl);
    toast('Tautan web tamu berhasil disalin', 'success');
  };

  const handleSendSetupToWhatsApp = () => {
    const coupleOrTitle = isWedding ? `${groomName} & ${brideName}` : (eventName || 'Acara Saya');
    const msg = `Halo Sirklen Photo! 📸\n\nSaya telah melakukan pemesanan via Lynk.id untuk acara *${coupleOrTitle}*.\n\nBerikut tautan dashboard setup saya:\n🔗 ${setupUrl}\n\nTautan tamu photobooth:\n🎉 ${guestUrl}\n\nMohon disimpan ya!`;
    const targetWa = (clientPhone || '').replace(/\D/g, '');
    const waUrl = targetWa 
      ? `https://wa.me/${targetWa}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    toast('Membuka WhatsApp...', 'success');
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
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:brightness-110 active:scale-95 text-white text-xs font-serif font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-60"
              title="Unduh Seluruh Foto Tamu (.ZIP)"
            >
              {isZipping ? (
                <Loader2 size={13} className="animate-spin text-amber-200" />
              ) : (
                <FolderArchive size={13} className="text-amber-200" />
              )}
              <span className="hidden xs:inline">{isZipping ? `Mengarsip ${zipProgress}%` : 'Unduh ZIP'}</span>
              <span className="xs:hidden">{isZipping ? `${zipProgress}%` : 'ZIP'}</span>
            </button>

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

        {/* Portal Pemesanan & Simpan Link ke WhatsApp */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-[#1C2826] to-[#120B18] border border-emerald-500/40 p-4 sm:p-5 shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-300 mt-0.5">
                <Sparkles size={20} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  PORTAL SETUP AKTIF
                </span>
                <h3 className="text-sm sm:text-base font-serif font-bold text-white">
                  Studio Desain Photobooth Acaramu
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-300 font-sans leading-relaxed">
                  Simpan link setup ini ke WhatsApp agar kamu bisa kembali mendesain & mengecek foto tamu kapan saja.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSendSetupToWhatsApp}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-sans font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition cursor-pointer flex-shrink-0"
            >
              <MessageCircle size={15} />
              <span>Simpan ke WhatsApp</span>
            </button>
          </div>
        </div>

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
                  onClick={handleSendSetupToWhatsApp}
                  className="px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                  title="Kirim tautan ke WhatsApp"
                >
                  <MessageCircle size={12} className="text-[#25D366]" />
                  <span>Kirim WA</span>
                </button>
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

        {/* ================= 📦 ARSIP & HASIL UNDUHAN FOTO TAMU (.ZIP) 📦 ================= */}
        <div className="rounded-3xl bg-gradient-to-br from-[#FAF7F2] via-white to-[#F6EFE9] border border-[#EADBCC] p-5 sm:p-6 shadow-[0_8px_30px_rgba(107,17,31,0.05)] relative overflow-hidden">
          {/* Subtle Ambient Background Accent */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-amber-200/25 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-200 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <FolderArchive size={11} className="text-amber-700" />
                  <span>ARSIP HASIL PHOTOBOOTH</span>
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  {totalSubmissionsCount > 0 ? `${totalSubmissionsCount} strip foto tamu` : 'Siap unduh'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 tracking-tight">
                Unduh Seluruh Strip Foto Tamu (.ZIP)
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Unduh seluruh strip foto kenangan tamu berbingkai (HD Print Ready 300 DPI) dan rekaman suara doa ucapan dalam satu file .ZIP terorganisir.
              </p>
            </div>

            <div className="flex flex-col sm:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:brightness-110 active:scale-95 text-white font-serif font-bold text-xs shadow-md shadow-amber-950/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isZipping ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-amber-200" />
                    <span>Mengarsip ({zipProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Package size={15} className="text-amber-300" />
                    <span>Unduh Semua Strip Foto (.ZIP)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigateToEvent(event.slug)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 font-serif text-[11px] font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Eye size={13} className="text-stone-500" />
                <span>Lihat Galeri Live</span>
              </button>
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

                  {/* Photobooth Strip Mockup (Live Synchronized with Bride's Custom Studio) */}
                  <div 
                    className="relative z-10 mx-auto w-[160px] xs:w-[170px] rounded-xl shadow-2xl p-2 flex flex-col justify-between transition-colors duration-300"
                    style={{ 
                      backgroundColor: frameBgColor,
                      color: frameTextColor,
                      border: `1.5px solid ${frameBorderColor}`
                    }}
                  >
                    {/* Live Ornaments Overlay */}
                    {frameOrnaments.map(orn => (
                      <div
                        key={orn.id}
                        style={{
                          position: 'absolute',
                          left: `${orn.x * 100}%`,
                          top: `${orn.y * 100}%`,
                          transform: `translate(-50%, -50%) rotate(${orn.rotation || 0}deg) scale(${(orn.scale || 1) * 0.72})`,
                          pointerEvents: 'none',
                          zIndex: 25
                        }}
                      >
                        {orn.type === 'image' ? (
                          <img src={orn.src} alt="" className="w-7 h-7 object-contain drop-shadow-xs" />
                        ) : (
                          <OrnamentBadge presetId={orn.presetId} color={orn.color || frameTextColor} size={22} />
                        )}
                      </div>
                    ))}

                      {/* Photo Cuts with Solid Taupe Border Band (Reference Wendy & Mark Style) */}
                      <div className="space-y-1 pt-0.5 pb-1 relative z-10">
                        <div className="p-0.5 rounded-lg shadow-xs" style={{ backgroundColor: frameBorderColor || '#B89F88' }}>
                          <div className="aspect-[4/3] rounded-md overflow-hidden bg-black/10">
                            <img 
                              src={heroPhotos[0] || DEFAULT_HERO_PHOTOS[0]} 
                              alt="Pose 1" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </div>
                        <div className="p-0.5 rounded-lg shadow-xs" style={{ backgroundColor: frameBorderColor || '#B89F88' }}>
                          <div className="aspect-[4/3] rounded-md overflow-hidden bg-black/10">
                            <img 
                              src={heroPhotos[1] || heroPhotos[0] || DEFAULT_HERO_PHOTOS[1]} 
                              alt="Pose 2" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </div>
                        <div className="p-0.5 rounded-lg shadow-xs" style={{ backgroundColor: frameBorderColor || '#B89F88' }}>
                          <div className="aspect-[4/3] rounded-md overflow-hidden bg-black/10">
                            <img 
                              src={heroPhotos[2] || heroPhotos[0] || DEFAULT_HERO_PHOTOS[2] || DEFAULT_HERO_PHOTOS[0]} 
                              alt="Pose 3" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Spacious Footer (Reference Layout: Names, Divider Line, Date & Kalimat Space) */}
                      <div className="text-center pt-2 pb-1 relative z-10 flex flex-col items-center">
                        <strong 
                          className="text-[10px] font-serif font-black tracking-widest block uppercase truncate max-w-full"
                          style={{ color: frameTextColor }}
                        >
                          {combinedDisplayName.toUpperCase()}
                        </strong>
                        {/* Horizontal Divider Line */}
                        <div 
                          className="w-12 h-[1.2px] my-1 rounded-full"
                          style={{ backgroundColor: frameBorderColor || '#C4A482' }}
                        />
                        <span className="text-[6.5px] font-mono font-bold block" style={{ color: frameTextColor }}>
                          {formattedDisplayDate}
                        </span>
                        <span className="text-[6px] font-sans uppercase tracking-wider block opacity-75 truncate max-w-full" style={{ color: frameTextColor }}>
                          {venue || 'PASADENA, CA'}
                        </span>
                        {/* Dedicated Sentence / Kalimat Space */}
                        <span className="text-[5.5px] font-serif italic mt-1 text-[#8C7A6B] block">
                          “With Love, Tamu Undangan”
                        </span>
                      </div>
                    </div>

                  {/* Sync Status Badge */}
                  <div className="relative z-10 pt-2 flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    <span className="text-[9.5px] font-mono uppercase tracking-wider text-stone-700 font-semibold">
                      Desain Kustom Mempelai • Terhubung
                    </span>
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
              {isWedding ? `02 • FOTO PREWEDDING (${heroPhotos.length}/${MAX_HERO_PHOTOS})` : `02 • FOTO COVER & DISPLAY ACARA (${heroPhotos.length}/${MAX_HERO_PHOTOS})`}
            </h3>
            <span className="text-[10px] font-mono text-stone-400">
              Maks. {MAX_HERO_PHOTOS} Slide Tamu
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
              <span>Format: JPG, PNG, WEBP (Maksimal 5 foto slide)</span>
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

            {/* Big "Upload Photo" Tap Card or Limit Reached Notice */}
            {heroPhotos.length < MAX_HERO_PHOTOS ? (
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
                  Tersisa {MAX_HERO_PHOTOS - heroPhotos.length} dari {MAX_HERO_PHOTOS} slot foto
                </span>
              </button>
            ) : (
              <div className="aspect-[16/11] rounded-2xl border-2 border-dashed border-amber-300/80 bg-amber-50/40 flex flex-col items-center justify-center p-4 text-center shadow-xs">
                <div className="w-10 h-10 rounded-full bg-white border border-amber-200 flex items-center justify-center text-[#6B111F] mb-2 shadow-xs">
                  <ImageIcon size={18} />
                </div>
                <span className="text-xs font-serif font-bold text-stone-800 block">
                  Maksimal 5 Foto Tercapai
                </span>
                <span className="text-[10px] text-stone-500 mt-1 max-w-[210px] leading-tight block">
                  Hapus salah satu foto jika ingin mengganti dengan foto slide baru.
                </span>
              </div>
            )}
          </div>

          {/* Optional: Add via Image URL Collapsible */}
          <div className="pt-1">
            {heroPhotos.length < MAX_HERO_PHOTOS ? (
              !showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-[11px] text-stone-500 hover:text-[#6B111F] underline transition cursor-pointer"
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
              )
            ) : (
              <span className="text-[10.5px] text-stone-400 italic">
                Batas maksimal 5 foto slide sudah tercapai.
              </span>
            )}
          </div>
        </div>

        {/* ================= 🎨 GROUP 03: DESAIN MANDIRI BINGKAI & ORNAMEN PHOTOSTRIP (DINONAKTIFKAN SEMENTARA) 🎨 ================= */}
        {false && (
        <div className="rounded-3xl bg-white border border-[#EADBCC]/90 p-5 sm:p-7 shadow-[0_12px_35px_rgba(107,17,31,0.06)] space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#6B111F] text-[10px] font-mono uppercase tracking-wider font-bold border border-amber-200/80 mb-1">
                <Palette size={12} className="text-[#6B111F]" />
                <span>03 • STUDIO KUSTOMISASI BINGKAI & ORNAMEN</span>
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                Desain Mandiri Bingkai & Ornamen Photostrip
              </h3>
              <p className="text-xs text-stone-500 max-w-xl mt-0.5 leading-relaxed">
                Ubah warna tema bingkai, sesuaikan warna aksen teks, serta tambahkan ornamen hiasan (cincin, bunga, mahkota, pita) atau unggah monogram inisial Anda sendiri. 
                <strong className="text-stone-700 ml-1">Ornamen dapat digeser bebas dengan sentuhan jari atau mouse!</strong>
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <span className="text-[11px] font-mono text-stone-500 bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#EADBCC]">
                {frameOrnaments.length} ornamen aktif
              </span>
            </div>
          </div>

          {/* Studio Workspace Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ================= 📱 LEFT: KANVAS STRIP INTERAKTIF (DRAGGABLE STAGE) 📱 ================= */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full text-center pb-2">
                <span className="text-[11px] font-serif font-bold text-stone-800 block">
                  Kanvas Photostrip Interaktif
                </span>
                <span className="text-[10px] text-stone-400 block">
                  Sentuh & geser ornamen di bawah untuk mengubah posisi
                </span>
              </div>

              {/* Strip Container (Draggable Surface) */}
              <div 
                ref={stripPreviewRef}
                style={{ 
                  backgroundColor: frameBgColor,
                  color: frameTextColor,
                  border: `2.5px solid ${frameBorderColor}`
                }}
                className="relative w-[230px] xs:w-[250px] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.25)] p-3 flex flex-col justify-between overflow-hidden select-none transition-colors duration-300 min-h-[690px] aspect-[1/3]"
              >
                {/* Subtle Luxury Gradient Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20 pointer-events-none" />

                {/* Simulated Poses Cutouts with Solid Taupe Frame Border Band (Exact Reference Style) */}
                <div className="space-y-2 pt-1 pb-1 relative z-10 pointer-events-none">
                  <div className="p-1 rounded-xl shadow-xs" style={{ backgroundColor: frameBorderColor || '#B89F88' }}>
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/10">
                      <img 
                        src={heroPhotos[0] || DEFAULT_HERO_PHOTOS[0]} 
                        alt="Pose 1" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                  <div className="p-1 rounded-xl shadow-xs" style={{ backgroundColor: frameBorderColor || '#B89F88' }}>
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/10">
                      <img 
                        src={heroPhotos[1] || heroPhotos[0] || DEFAULT_HERO_PHOTOS[1]} 
                        alt="Pose 2" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                  <div className="p-1 rounded-xl shadow-xs" style={{ backgroundColor: frameBorderColor || '#B89F88' }}>
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-black/10">
                      <img 
                        src={heroPhotos[2] || heroPhotos[0] || DEFAULT_HERO_PHOTOS[2] || DEFAULT_HERO_PHOTOS[0]} 
                        alt="Pose 3" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                </div>

                {/* Spacious Footer (Reference Layout: Names, Divider Line, Date, Venue, Kalimat Space) */}
                <div className="text-center pt-2.5 pb-2 relative z-10 pointer-events-none flex flex-col items-center">
                  <strong 
                    className="text-[13px] font-serif font-black tracking-widest block uppercase truncate max-w-full drop-shadow-xs"
                    style={{ color: frameTextColor }}
                  >
                    {combinedDisplayName.toUpperCase()}
                  </strong>
                  {/* Horizontal Divider Line */}
                  <div 
                    className="w-16 h-[1.5px] my-1.5 rounded-full"
                    style={{ backgroundColor: frameBorderColor || '#C4A482' }}
                  />
                  <span className="text-[9px] font-mono font-bold block" style={{ color: frameTextColor }}>
                    {formattedDisplayDate}
                  </span>
                  <span className="text-[8px] font-sans uppercase tracking-wider block opacity-75 truncate max-w-full" style={{ color: frameTextColor }}>
                    {venue || 'PASADENA, CA'}
                  </span>
                  {/* Dedicated Space for Sentences / Doa Restu */}
                  <span className="text-[7.5px] font-serif italic mt-1.5 text-[#8C7A6B] block">
                    “Ruang Doa & Ucapan Tamu Undangan...”
                  </span>
                </div>

                {/* ================= 🎯 DRAGGABLE ORNAMENTS ON STRIP 🎯 ================= */}
                {frameOrnaments.map(orn => {
                  const isActive = activeOrnId === orn.id;
                  return (
                    <div
                      key={orn.id}
                      onPointerDown={(e) => handleStartDragOrnament(e, orn.id)}
                      onClick={(e) => { e.stopPropagation(); setActiveOrnId(orn.id); }}
                      style={{
                        position: 'absolute',
                        left: `${(orn.x ?? 0.5) * 100}%`,
                        top: `${(orn.y ?? 0.5) * 100}%`,
                        transform: `translate(-50%, -50%) rotate(${orn.rotation || 0}deg) scale(${orn.scale || 1.0})`,
                        touchAction: 'none',
                        cursor: 'grab',
                        zIndex: isActive ? 40 : 30
                      }}
                      className={`transition-[box-shadow] duration-150 select-none ${
                        isActive 
                          ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-black/60 rounded-xl p-1 bg-amber-400/20 shadow-xl' 
                          : 'hover:scale-105 active:cursor-grabbing'
                      }`}
                      title="Klik untuk memilih & geser posisi"
                    >
                      {orn.type === 'image' ? (
                        <img 
                          src={orn.src} 
                          alt="Ornamen kustom" 
                          className="w-11 h-11 object-contain pointer-events-none drop-shadow-md"
                        />
                      ) : (
                        <OrnamentBadge 
                          presetId={orn.presetId} 
                          color={orn.color || frameTextColor} 
                          size={32} 
                        />
                      )}

                      {/* Active Indicator Pin */}
                      {isActive && (
                        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-amber-400 border border-black flex items-center justify-center text-[7px] text-black font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>

              {/* Inspector Controls for Active Ornament */}
              {activeOrnId ? (
                (() => {
                  const currentOrn = frameOrnaments.find(o => o.id === activeOrnId);
                  if (!currentOrn) return null;
                  return (
                    <div className="w-full max-w-[270px] mt-3.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] space-y-2.5 shadow-sm text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                        <span className="font-serif font-bold text-stone-900 flex items-center gap-1.5">
                          <Move size={12} className="text-[#6B111F]" />
                          <span>{currentOrn.name || 'Ornamen Terpilih'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrnament(currentOrn.id)}
                          className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                          title="Hapus ornamen ini"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Scale Controls */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-stone-600">Ukuran:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleScaleOrnament(currentOrn.id, -0.15)}
                            className="p-1 rounded-md bg-white border border-stone-200 hover:bg-stone-50 cursor-pointer"
                            title="Perkecil"
                          >
                            <ZoomOut size={12} />
                          </button>
                          <span className="font-mono text-[10px] w-9 text-center font-bold text-stone-800">
                            {Math.round((currentOrn.scale || 1.0) * 100)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => handleScaleOrnament(currentOrn.id, 0.15)}
                            className="p-1 rounded-md bg-white border border-stone-200 hover:bg-stone-50 cursor-pointer"
                            title="Perbesar"
                          >
                            <ZoomIn size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Rotate Controls */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-stone-600">Putaran:</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRotateOrnament(currentOrn.id, -15)}
                            className="px-1.5 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] hover:bg-stone-50 cursor-pointer"
                          >
                            -15°
                          </button>
                          <span className="font-mono text-[10px] w-9 text-center font-bold text-stone-800">
                            {currentOrn.rotation || 0}°
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRotateOrnament(currentOrn.id, 15)}
                            className="px-1.5 py-0.5 rounded-md bg-white border border-stone-200 text-[10px] hover:bg-stone-50 cursor-pointer"
                          >
                            +15°
                          </button>
                        </div>
                      </div>

                      {/* Quick Position Preset Buttons */}
                      <div className="pt-1 border-t border-stone-200/60">
                        <span className="text-[10px] text-stone-500 font-medium block mb-1">
                          Posisi Cepat:
                        </span>
                        {currentOrn.presetId?.startsWith('divider-') ? (
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'top-divider')}
                              className="py-1.5 px-1 rounded-md bg-white border border-stone-200 text-[9.5px] hover:bg-amber-50 cursor-pointer text-center font-medium"
                              title="Posisikan di bawah nama pengantin"
                            >
                              Bawah Nama
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'center')}
                              className="py-1.5 px-1 rounded-md bg-white border border-stone-200 text-[9.5px] hover:bg-amber-50 cursor-pointer text-center font-medium"
                              title="Posisikan di antara dua frame foto"
                            >
                              Antar Foto
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'bottom-divider')}
                              className="py-1.5 px-1 rounded-md bg-white border border-stone-200 text-[9.5px] hover:bg-amber-50 cursor-pointer text-center font-medium"
                              title="Posisikan di atas tanggal acara"
                            >
                              Atas Tanggal
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'top-left')}
                              className="py-1 px-1 rounded-md bg-white border border-stone-200 text-[9px] hover:bg-amber-50 cursor-pointer"
                            >
                              Kiri Atas
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'top-center')}
                              className="py-1 px-1 rounded-md bg-white border border-stone-200 text-[9px] hover:bg-amber-50 cursor-pointer"
                            >
                              Tengah Atas
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'top-right')}
                              className="py-1 px-1 rounded-md bg-white border border-stone-200 text-[9px] hover:bg-amber-50 cursor-pointer"
                            >
                              Kanan Atas
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'bottom-left')}
                              className="py-1 px-1 rounded-md bg-white border border-stone-200 text-[9px] hover:bg-amber-50 cursor-pointer"
                            >
                              Kiri Bawah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'bottom-center')}
                              className="py-1 px-1 rounded-md bg-white border border-stone-200 text-[9px] hover:bg-amber-50 cursor-pointer"
                            >
                              Tengah Bawah
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetPresetPosition(currentOrn.id, 'bottom-right')}
                              className="py-1 px-1 rounded-md bg-white border border-stone-200 text-[9px] hover:bg-amber-50 cursor-pointer"
                            >
                              Kanan Bawah
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })()
              ) : (
                <div className="w-full max-w-[270px] mt-3.5 p-2.5 rounded-xl bg-[#FAF7F2] border border-dashed border-[#EADBCC] text-center">
                  <span className="text-[10.5px] text-stone-500">
                    💡 Sentuh ornamen pada strip untuk mengatur skala, putaran & posisi cepat.
                  </span>
                </div>
              )}

            </div>

            {/* ================= 🎛️ RIGHT: STUDIO CONTROL TABS 🎛️ ================= */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Studio Tabs Navigation */}
              <div className="flex rounded-2xl bg-[#FAF7F2] p-1 border border-[#EADBCC]">
                <button
                  type="button"
                  onClick={() => setStudioTab('palette')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    studioTab === 'palette'
                      ? 'bg-white text-[#6B111F] shadow-sm border border-[#EADBCC]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Palette size={13} />
                  <span>Warna Bingkai</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudioTab('presets')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    studioTab === 'presets'
                      ? 'bg-white text-[#6B111F] shadow-sm border border-[#EADBCC]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>Ornamen Preset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStudioTab('upload')}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    studioTab === 'upload'
                      ? 'bg-white text-[#6B111F] shadow-sm border border-[#EADBCC]'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Upload size={13} />
                  <span>Unggah Gambar/Logo</span>
                </button>
              </div>

              {/* ================= TAB 1: WARNA & PALET BINGKAI ================= */}
              {studioTab === 'palette' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#8C7A6B] font-bold mb-2">
                      Koleksi Palet Mewah Rekomendasi
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                      {BORDER_PRESET_COLORS.map((palette, i) => {
                        const isCurrent = frameBgColor === palette.bg;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleApplyPalette(palette)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                              isCurrent
                                ? 'bg-[#6B111F]/5 border-[#6B111F] shadow-xs'
                                : 'bg-[#FAF7F2] border-[#EADBCC] hover:bg-stone-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Swatch Trio */}
                              <div className="flex -space-x-1.5">
                                <span 
                                  className="w-5 h-5 rounded-full border border-white shadow-xs inline-block" 
                                  style={{ backgroundColor: palette.bg }} 
                                />
                                <span 
                                  className="w-5 h-5 rounded-full border border-white shadow-xs inline-block" 
                                  style={{ backgroundColor: palette.text }} 
                                />
                              </div>
                              <div>
                                <span className="text-xs font-serif font-bold text-stone-900 block leading-tight">
                                  {palette.name}
                                </span>
                                <span className="text-[9.5px] font-mono text-stone-500">
                                  {palette.bg}
                                </span>
                              </div>
                            </div>
                            {isCurrent && (
                              <Check size={14} className="text-[#6B111F] flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Hex Color Pickers */}
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EADBCC] space-y-3">
                    <h4 className="text-xs font-serif font-bold text-stone-900">
                      Pilihan Warna Khusus (Kustom Bebas)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Background Color */}
                      <div className="p-2.5 rounded-xl bg-white border border-[#EADBCC]">
                        <label className="text-[11px] text-stone-600 block mb-1 font-medium">
                          Warna Bingkai
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={frameBgColor}
                            onChange={(e) => { setFrameBgColor(e.target.value); setIsSaved(false); }}
                            className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input 
                            type="text" 
                            value={frameBgColor}
                            onChange={(e) => { setFrameBgColor(e.target.value); setIsSaved(false); }}
                            className="w-full text-xs font-mono px-2 py-1 rounded-md border border-stone-200 text-stone-800"
                          />
                        </div>
                      </div>

                      {/* 2. Text & Accent Color */}
                      <div className="p-2.5 rounded-xl bg-white border border-[#EADBCC]">
                        <label className="text-[11px] text-stone-600 block mb-1 font-medium">
                          Warna Teks & Aksen
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={frameTextColor}
                            onChange={(e) => { setFrameTextColor(e.target.value); setIsSaved(false); }}
                            className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input 
                            type="text" 
                            value={frameTextColor}
                            onChange={(e) => { setFrameTextColor(e.target.value); setIsSaved(false); }}
                            className="w-full text-xs font-mono px-2 py-1 rounded-md border border-stone-200 text-stone-800"
                          />
                        </div>
                      </div>

                      {/* 3. Border Line Color */}
                      <div className="p-2.5 rounded-xl bg-white border border-[#EADBCC]">
                        <label className="text-[11px] text-stone-600 block mb-1 font-medium">
                          Warna Garis Tepi
                        </label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={frameBorderColor}
                            onChange={(e) => { setFrameBorderColor(e.target.value); setIsSaved(false); }}
                            className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer p-0.5 bg-white"
                          />
                          <input 
                            type="text" 
                            value={frameBorderColor}
                            onChange={(e) => { setFrameBorderColor(e.target.value); setIsSaved(false); }}
                            className="w-full text-xs font-mono px-2 py-1 rounded-md border border-stone-200 text-stone-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: KOLEKSI ORNAMEN PRESET ================= */}
              {studioTab === 'presets' && (
                <div className="space-y-5">
                  {/* Category 1: Garis Pembatas (Dividers) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#6B111F]" />
                        <h5 className="text-xs font-mono uppercase tracking-wider text-[#6B111F] font-bold">
                          Garis Pembatas Photostrip (Dividers)
                        </h5>
                      </div>
                      <span className="text-[10px] text-stone-400">
                        Pemisah judul / sela antar foto
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {PRESET_ORNAMENTS.filter(p => p.category === 'divider').map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleAddPresetOrnament(preset.id)}
                          className="p-3 rounded-2xl bg-[#FAF7F2] hover:bg-stone-50 border border-[#EADBCC] hover:border-[#6B111F] flex items-center justify-between transition cursor-pointer shadow-xs active:scale-98 group text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-16 h-10 rounded-xl bg-stone-900/90 flex items-center justify-center p-1 shadow-xs group-hover:scale-105 transition flex-shrink-0">
                              <OrnamentBadge 
                                presetId={preset.id} 
                                color={frameTextColor || '#F5D77F'} 
                                size={20} 
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-serif font-bold text-stone-900 block truncate leading-tight">
                                {preset.name}
                              </span>
                              <span className="text-[9.5px] text-stone-500 block truncate">
                                Garis pembatas horizontal
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] text-[#6B111F] font-bold px-2 py-1 rounded-lg bg-rose-50 border border-rose-200/60 flex items-center gap-1 flex-shrink-0 ml-2">
                            <Plus size={10} /> Pasang
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: Simbol & Hiasan Sudut */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        <h5 className="text-xs font-mono uppercase tracking-wider text-stone-800 font-bold">
                          Simbol & Ornamen Sudut
                        </h5>
                      </div>
                      <span className="text-[10.5px] text-stone-400">
                        Klik untuk memasang
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {PRESET_ORNAMENTS.filter(p => p.category !== 'divider').map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleAddPresetOrnament(preset.id)}
                          className="p-3 rounded-2xl bg-[#FAF7F2] hover:bg-stone-50 border border-[#EADBCC] hover:border-[#6B111F] flex flex-col items-center justify-center text-center transition cursor-pointer shadow-xs active:scale-95 group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-stone-900/90 flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition">
                            <OrnamentBadge 
                              presetId={preset.id} 
                              color={frameTextColor || '#F5D77F'} 
                              size={28} 
                            />
                          </div>
                          <span className="text-xs font-serif font-bold text-stone-900 block leading-tight">
                            {preset.name}
                          </span>
                          <span className="text-[9.5px] text-[#6B111F] font-semibold mt-1 flex items-center gap-1">
                            <Plus size={10} /> Tambah
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 italic pt-1">
                    ✨ Ornamen vektor otomatis mengikuti warna teks/aksen yang Anda pilih dan tidak akan pecah saat diunduh tamu.
                  </p>
                </div>
              )}

              {/* ================= TAB 3: UNGGAH GAMBAR / LOGO SENDIRI ================= */}
              {studioTab === 'upload' && (
                <div className="space-y-4">
                  {/* Hidden File Input */}
                  <input
                    ref={ornamentFileInputRef}
                    type="file"
                    accept="image/png,image/webp,image/svg+xml,image/jpeg"
                    className="hidden"
                    onChange={handleUploadOrnament}
                  />

                  {/* Upload Drop Zone Card */}
                  <button
                    type="button"
                    onClick={() => ornamentFileInputRef.current?.click()}
                    className="w-full p-6 rounded-2xl border-2 border-dashed border-[#EADBCC] hover:border-[#6B111F] bg-[#FAF7F2] hover:bg-stone-50 flex flex-col items-center justify-center text-center transition active:scale-98 cursor-pointer shadow-xs group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6B111F] mb-2.5 border border-[#EADBCC] group-hover:scale-110 transition shadow-xs">
                      <Upload size={22} />
                    </div>
                    <span className="text-sm font-serif font-bold text-stone-900 block">
                      Unggah Logo, Monogram, atau Stiker PNG
                    </span>
                    <span className="text-xs text-stone-500 mt-1 max-w-sm block">
                      Format PNG dengan latar transparan sangat direkomendasikan agar menyatu anggun di atas bingkai.
                    </span>
                    <span className="mt-3 px-3.5 py-1 rounded-full bg-[#6B111F] text-[#F5D77F] text-xs font-serif font-bold border border-[#F5D77F]/30 shadow-xs">
                      Pilih Gambar dari Perangkat
                    </span>
                  </button>

                  {/* List of Custom Uploaded Ornaments */}
                  {frameOrnaments.filter(o => o.type === 'image').length > 0 && (
                    <div className="space-y-2 pt-1">
                      <h5 className="text-xs font-mono uppercase tracking-wider text-[#8C7A6B] font-bold">
                        Gambar / Logo yang Telah Diunggah
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {frameOrnaments.filter(o => o.type === 'image').map(orn => (
                          <div 
                            key={orn.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${
                              activeOrnId === orn.id ? 'bg-amber-50 border-amber-300' : 'bg-white border-[#EADBCC]'
                            }`}
                          >
                            <div 
                              className="flex items-center gap-2.5 cursor-pointer flex-1"
                              onClick={() => setActiveOrnId(orn.id)}
                            >
                              <img src={orn.src} alt="" className="w-9 h-9 object-contain rounded-md bg-stone-100 p-0.5" />
                              <div className="truncate">
                                <span className="text-xs font-medium text-stone-900 block truncate">
                                  {orn.name || 'Gambar Kustom'}
                                </span>
                                <span className="text-[10px] text-stone-500 font-mono">
                                  Skala: {Math.round((orn.scale || 1.0) * 100)}%
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrnament(orn.id)}
                              className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2 leading-relaxed">
                    <Info size={15} className="text-[#6B111F] flex-shrink-0 mt-0.5" />
                    <span>
                      Logo atau inisial pengantin yang Anda pasang akan otomatis muncul di pratinjau kamera tamu serta tercetak pada hasil strip foto beresolusi tinggi yang diunduh.
                    </span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
        )}

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
