import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Download, Share, Image as ImageIcon, ChevronRight, Volume2, Search, X, Calendar, Clock, Camera, Archive, Video, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';
import { getDeletedSubmissionIds, isSubmissionDeleted } from '../../services/submissionService';
import { useToast } from '../ui/Toast';
import { exportEventSubmissionsZip } from '../../utils/zipExport';
import SpotifyVoicePlayer from '../ui/SpotifyVoicePlayer';
import { MOCK_GALLERY_PHOTOS } from '../../data/mockGalleryData';
import { getEventHeaderTitle, getEventDisplayName } from '../../utils/eventHeader';
import PhotostripThumbnail from './PhotostripThumbnail';
import { renderMasterPhotoStrip, renderBotanicalWeddingStrip } from '../../utils/stripRenderer';
import { MITUFAYA_FRAMES, getEventGraphicFrames, getCachedFrameImage } from '../../data/eventFrames';
import { generatePhotostripVideo } from '../../utils/videoGenerator';
import {
  SOCIAL_CARD_SPECS,
  sanitizeShareFilename,
  triggerFileDownload,
  createSocialShareJpegFile,
  videoBlobToShareFile,
  shareFileNativeOrFallback,
  openWhatsAppLinkShare,
} from '../../utils/shareMedia';
import ShareFormatOptions from '../ui/ShareFormatOptions';
import PriceListModal from '../ui/PriceListModal';

/**
 * Renders a full-resolution (2x Retina) photostrip canvas from raw submission photos,
 * awaiting web fonts and any graphic overlay image before returning the canvas.
 */
async function renderHighResStripCanvas(item, activeEvent) {
  const photosList = Array.isArray(item?.photos) && item.photos.length > 0
    ? item.photos
    : (item?.photo ? [item.photo] : []);

  if (photosList.length === 0) return null;

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {}
  }

  const loadedImgs = await Promise.all(
    photosList.map((src) => new Promise((res) => {
      if (!src) return res(null);
      const url = typeof src === 'string' ? src : (src?.dataUrl || '');
      if (!url) return res(null);
      const img = new Image();
      if (url.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = url;
    }))
  );

  const valid = loadedImgs.filter(Boolean).map((img) => ({ canvas: img, dataUrl: img.src }));
  if (valid.length === 0) return null;

  // Ensure graphic frame overlay PNG is completely loaded before offscreen canvas draw
  const graphicId = item.graphicFrameId || null;
  if (graphicId) {
    const allFrames = [...MITUFAYA_FRAMES, ...getEventGraphicFrames(activeEvent)];
    const gFrame = allFrames.find((f) => f.id === graphicId);
    if (gFrame?.overlayUrl) {
      const overlayImg = getCachedFrameImage(gFrame.overlayUrl);
      if (overlayImg && (!overlayImg.complete || overlayImg.naturalWidth === 0)) {
        await new Promise((resolve) => {
          overlayImg.addEventListener('load', resolve, { once: true });
          overlayImg.addEventListener('error', resolve, { once: true });
        });
      }
    }
  }

  const offCanvas = document.createElement('canvas');
  if (item.stripStyle === 'botanical-wedding') {
    renderBotanicalWeddingStrip(offCanvas, {
      photos: valid,
      targetCount: valid.length,
      guestName: item.guestName,
      guestMessage: item.message || item.guestMessage,
      activeEvent,
      scale: 2,
    });
  } else {
    renderMasterPhotoStrip(offCanvas, {
      photos: valid,
      targetCount: valid.length,
      stripColor: item.colorHex || item.stripColor || '#6B111F',
      guestName: item.guestName,
      guestMessage: item.message || item.guestMessage,
      activeEvent,
      graphicFrameId: graphicId,
      scale: 2,
    });
  }

  return offCanvas;
}

function getNowIndonesianDate() {
  const now = new Date();
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} • ${hours}:${minutes} WIB`;
}

function getNowShortDate() {
  const now = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];
  return `${now.getDate()} · ${months[now.getMonth()]} · ${now.getFullYear()}`;
}

export default function FullGalleryModal() {
  const { 
    galleryModalOpen, 
    closeGalleryModal, 
    openBooth, 
    capturedPhotos, 
    guestName,
    guestMessage,
    stripColor,
    voiceUrl,
    voiceDuration,
    activeEvent,
    isDemo,
    savedSubmissions,
  } = useBooth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all'); // 'all' | '1-cut' | '2-cut' | '4-cut'
  const [likes, setLikes] = useState({});
  const [fullFrameModal, setFullFrameModal] = useState(null);
  const [isZipping, setIsZipping] = useState(false);
  const [isDownloadingStrip, setIsDownloadingStrip] = useState(false);
  const [isDownloadingVideo, setIsDownloadingVideo] = useState(false);
  const [actionSheetMode, setActionSheetMode] = useState(null); // null | 'share' | 'download'
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatusText, setVideoStatusText] = useState('');
  const [readyShareFile, setReadyShareFile] = useState(null);
  const [readyShareLabel, setReadyShareLabel] = useState('');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const preparedFileRef = useRef({ id: null, canvas: null, files: {} });
  const [hiddenMockIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sirklen_hidden_mock_submissions') || '[]');
    } catch {
      return [];
    }
  });
  const isDemoMode = Boolean(isDemo || activeEvent?.isDemo || activeEvent?.slug === 'demo');

  const getModalFilenames = (item) => {
    const guest = sanitizeShareFilename(item?.guestName, 'Tamu');
    const couple = sanitizeShareFilename(activeEvent?.displayName, 'Event');
    return {
      jpgName: `${guest}_${couple}.jpg`,
      prefix: `${guest}_${couple}`,
    };
  };

  // Pre-render HD & social-ready JPG Files when opening a photo so navigator.share fires synchronously on iOS Safari
  useEffect(() => {
    setActionSheetMode(null);
    setReadyShareFile(null);
    setReadyShareLabel('');
    setVideoProgress(0);
    setVideoStatusText('');
    preparedFileRef.current = { id: null, canvas: null, files: {} };

    if (!fullFrameModal) return;

    let cancelled = false;
    (async () => {
      try {
        const offCanvas = await renderHighResStripCanvas(fullFrameModal, activeEvent);
        if (!offCanvas || cancelled) return;

        const { prefix } = getModalFilenames(fullFrameModal);
        const shareMeta = {
          filenamePrefix: prefix,
          coupleName: getEventDisplayName(activeEvent) || 'Photobooth Event',
          eventName: getEventHeaderTitle(activeEvent) || '',
          guestName: fullFrameModal.guestName || '',
        };

        const [raw, feed, story] = await Promise.all([
          createSocialShareJpegFile(offCanvas, { ...shareMeta, format: 'raw', quality: 0.96 }),
          createSocialShareJpegFile(offCanvas, { ...shareMeta, format: 'feed', quality: 0.94 }),
          createSocialShareJpegFile(offCanvas, { ...shareMeta, format: 'story', quality: 0.94 }),
        ]);

        if (!cancelled) {
          preparedFileRef.current = {
            id: fullFrameModal.id,
            canvas: offCanvas,
            files: { raw, feed, story },
          };
        }
      } catch (e) {
        // Silent fallback: will render on demand if needed
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fullFrameModal, activeEvent]);

  const getOrCreateJpgFile = async (item, format = 'raw') => {
    const cached = preparedFileRef.current;
    if (cached?.id === item.id && cached?.files?.[format]) {
      return cached.files[format];
    }

    const offCanvas =
      cached?.id === item.id && cached?.canvas
        ? cached.canvas
        : await renderHighResStripCanvas(item, activeEvent);

    if (!offCanvas) return null;

    const { prefix } = getModalFilenames(item);
    const file = await createSocialShareJpegFile(offCanvas, {
      format,
      filenamePrefix: prefix,
      coupleName: getEventDisplayName(activeEvent) || 'Photobooth Event',
      eventName: getEventHeaderTitle(activeEvent) || '',
      guestName: item.guestName || '',
      quality: format === 'raw' ? 0.96 : 0.94,
    });

    preparedFileRef.current = {
      id: item.id,
      canvas: offCanvas,
      files: { ...(cached?.id === item.id ? cached.files : {}), [format]: file },
    };
    return file;
  };

  const handleDownloadStripHd = async () => {
    if (!fullFrameModal) return;
    if (isDemoMode) {
      toast('Di mode demo tidak bisa download foto. Yuk pesan paket untuk acaramu!', 'warning');
      setShowPriceModal(true);
      return;
    }
    setIsDownloadingStrip(true);
    try {
      const { jpgName } = getModalFilenames(fullFrameModal);
      const file = await getOrCreateJpgFile(fullFrameModal);
      if (file) {
        triggerFileDownload(file, jpgName);
      } else {
        const fallbackUrl = fullFrameModal.stripImage || fullFrameModal.photos?.[0];
        if (!fallbackUrl) {
          toast('Foto tidak tersedia untuk diunduh.', 'error');
          return;
        }
        triggerFileDownload(fallbackUrl, jpgName);
      }
      setActionSheetMode(null);
      toast(`Photo strip HD berhasil diunduh (${jpgName})!`, 'success');
    } catch (e) {
      console.error('HD strip download error:', e);
      toast('Gagal memproses photo strip HD.', 'error');
    } finally {
      setIsDownloadingStrip(false);
    }
  };

  const handleDownloadVoiceVideo = async () => {
    if (!fullFrameModal) return;
    if (isDemoMode) {
      toast('Di mode demo tidak bisa download video. Yuk pesan paket untuk acaramu!', 'warning');
      setShowPriceModal(true);
      return;
    }
    setIsDownloadingVideo(true);
    setVideoProgress(8);
    setVideoStatusText('Menyiapkan video story...');

    try {
      const offCanvas = await renderHighResStripCanvas(fullFrameModal, activeEvent);
      if (!offCanvas) throw new Error('Tidak ada foto untuk dirender ke video.');

      const isWeddingEvent = (activeEvent?.eventType || 'wedding') === 'wedding';
      const result = await generatePhotostripVideo({
        photoCanvas: offCanvas,
        voiceUrl: fullFrameModal.voiceUrl,
        guestName: fullFrameModal.guestName || 'Tamu',
        coupleName: activeEvent?.displayName || 'Event',
        eventName: activeEvent?.eventName || activeEvent?.displayName || 'Event',
        audioLabel: isWeddingEvent ? 'Pesan Suara & Doa Restu' : 'Pesan Suara & Ucapan',
        onProgress: (p, txt) => {
          setVideoProgress(p);
          setVideoStatusText(txt);
        },
      });

      const guest = sanitizeShareFilename(fullFrameModal.guestName, 'Tamu');
      const filename = `${guest}_voice_story.${result.extension}`;
      triggerFileDownload(result.blob, filename);
      setActionSheetMode(null);
      toast(`Video Story + Suara berhasil diunduh (${filename})!`, 'success');
    } catch (err) {
      console.error('Video download error:', err);
      toast('Gagal memproses video bersuara.', 'error');
    } finally {
      setIsDownloadingVideo(false);
      setVideoProgress(0);
    }
  };

  const handleSharePhotoFormat = async (format = 'raw') => {
    if (!fullFrameModal) return;
    if (isDemoMode) {
      toast('Di mode demo tidak bisa bagikan foto. Yuk pesan paket untuk acaramu!', 'warning');
      setShowPriceModal(true);
      return;
    }
    try {
      const file = await getOrCreateJpgFile(fullFrameModal, format);
      if (!file) {
        toast('Foto belum siap dibagikan.', 'error');
        return;
      }
      const eventTitle = activeEvent?.displayName || 'Photobooth Event';
      const res = await shareFileNativeOrFallback({
        file,
        title: `${fullFrameModal.guestName || 'Tamu'} — ${eventTitle}`,
        text: `Momen seru di ${eventTitle}`,
      });
      if (res.status === 'shared') {
        setActionSheetMode(null);
      } else if (res.status === 'needs_gesture') {
        setReadyShareFile(res.file);
        setReadyShareLabel(`${SOCIAL_CARD_SPECS[format]?.label || 'Foto HD'} Siap Dibagikan`);
        setActionSheetMode('share');
      } else if (res.status === 'fallback_downloaded') {
        setActionSheetMode(null);
        toast('Foto HD disimpan — siap diunggah ke WhatsApp atau Instagram!', 'info');
      }
    } catch (e) {
      console.error('Share photo error:', e);
      toast('Gagal membagikan foto.', 'error');
    }
  };

  const handleSharePhotoWithVoice = async () => {
    if (!fullFrameModal) return;
    if (isDemoMode) {
      toast('Di mode demo tidak bisa bagikan video. Yuk pesan paket untuk acaramu!', 'warning');
      setShowPriceModal(true);
      return;
    }
    setIsDownloadingVideo(true);
    setVideoProgress(8);
    setVideoStatusText('Menyiapkan video story + suara...');

    try {
      const offCanvas = await renderHighResStripCanvas(fullFrameModal, activeEvent);
      if (!offCanvas) throw new Error('Foto tidak tersedia.');

      const isWeddingEvent = (activeEvent?.eventType || 'wedding') === 'wedding';
      const result = await generatePhotostripVideo({
        photoCanvas: offCanvas,
        voiceUrl: fullFrameModal.voiceUrl,
        guestName: fullFrameModal.guestName || 'Tamu',
        coupleName: activeEvent?.displayName || 'Event',
        eventName: activeEvent?.eventName || activeEvent?.displayName || 'Event',
        audioLabel: isWeddingEvent ? 'Pesan Suara & Doa Restu' : 'Pesan Suara & Ucapan',
        onProgress: (p, txt) => {
          setVideoProgress(p);
          setVideoStatusText(txt);
        },
      });

      const { prefix } = getModalFilenames(fullFrameModal);
      const videoFile = videoBlobToShareFile(result.blob, prefix, result.extension);
      const eventTitle = activeEvent?.displayName || 'Photobooth Event';

      const res = await shareFileNativeOrFallback({
        file: videoFile,
        title: `${fullFrameModal.guestName || 'Tamu'} — ${eventTitle}`,
        text: `Pesan suara & kenangan di ${eventTitle}`,
      });

      if (res.status === 'shared') {
        setActionSheetMode(null);
      } else if (res.status === 'needs_gesture') {
        setReadyShareFile(res.file);
        setReadyShareLabel('Video Story + Audio Siap Dibagikan');
      } else if (res.status === 'fallback_downloaded') {
        setActionSheetMode(null);
        toast('Video Story disimpan — siap diunggah ke IG Story, WA Status, atau TikTok!', 'info');
      }
    } catch (err) {
      console.error('Share video error:', err);
      toast('Gagal menyiapkan video untuk dibagikan.', 'error');
    } finally {
      setIsDownloadingVideo(false);
      setVideoProgress(0);
    }
  };

  const handleTriggerReadyShare = async () => {
    if (!readyShareFile) return;
    const eventTitle = activeEvent?.displayName || 'Photobooth Event';
    const res = await shareFileNativeOrFallback({
      file: readyShareFile,
      title: `${fullFrameModal?.guestName || 'Tamu'} — ${eventTitle}`,
      text: `Momen seru di ${eventTitle}`,
    });
    if (res.status === 'shared') {
      setReadyShareFile(null);
      setActionSheetMode(null);
    } else if (res.status === 'fallback_downloaded') {
      setReadyShareFile(null);
      setActionSheetMode(null);
      toast('File tersimpan — siap diunggah ke WhatsApp atau Instagram!', 'info');
    }
  };

  // Intercept phone back button when zoomed photo modal is active
  useEffect(() => {
    if (!fullFrameModal) return;
    try {
      window.history.pushState({ __sirklen__: true, type: 'gallery_photo' }, '');
    } catch (e) {}

    const handlePhotoPop = () => {
      setFullFrameModal(null);
    };

    window.addEventListener('popstate', handlePhotoPop, { once: true });
    return () => {
      window.removeEventListener('popstate', handlePhotoPop);
    };
  }, [fullFrameModal]);



  // Real-time user submission card
  const userSubmission = useMemo(() => {
    if (!capturedPhotos || capturedPhotos.length === 0) return null;
    return {
      id: 'user-latest-live',
      guestName: guestName || 'Tamu Undangan (Kamu)',
      takenDate: getNowIndonesianDate(),
      shortDate: getNowShortDate(),
      photos: capturedPhotos.map(p => p.dataUrl),
      type: capturedPhotos.length === 1 ? 'polaroid' : `${capturedPhotos.length}-cut`,
      colorHex: stripColor || '#6B111F',
      textHex: stripColor === '#FDFBF7' || stripColor === '#F3C5CB' ? '#6B111F' : '#F5D77F',
      hasVoice: !!voiceUrl,
      voiceUrl: voiceUrl,
      voiceDuration: voiceDuration || 15,
      message: guestMessage && guestMessage.trim() ? guestMessage.trim() : '',
      likes: 1,
    };
  }, [capturedPhotos, guestName, stripColor, voiceUrl, voiceDuration, guestMessage]);

  // Filter real-time savedSubmissions by active event
  const eventSubmissions = useMemo(() => {
    if (!savedSubmissions || savedSubmissions.length === 0) return [];
    if (!activeEvent) return savedSubmissions;
    const currentSlug = activeEvent.slug;
    const isDemoEvent = currentSlug === 'demo' || currentSlug === 'sabrina-raka' || currentSlug === 'raka-sabrina' || !currentSlug;
    return savedSubmissions.filter(sub => {
      if (sub.eventId && activeEvent.id && sub.eventId === activeEvent.id) return true;
      if (sub.eventSlug && currentSlug && sub.eventSlug === currentSlug) return true;
      if (isDemoEvent && (sub.eventSlug === 'demo' || sub.eventSlug === 'sabrina-raka' || sub.eventSlug === 'raka-sabrina' || !sub.eventSlug)) {
        return true;
      }
      return false;
    });
  }, [savedSubmissions, activeEvent]);

  // Base list fallback (mock items only for default demo wedding)
  const baseList = useMemo(() => {
    const deletedSet = getDeletedSubmissionIds();
    if (eventSubmissions.length > 0) {
      return eventSubmissions.filter(sub => !isSubmissionDeleted(sub, null, deletedSet) && !hiddenMockIds.includes(sub.id));
    }
    if (!activeEvent || activeEvent.slug === 'sabrina-raka' || activeEvent.slug === 'raka-sabrina' || activeEvent.slug === 'demo' || activeEvent.isDemo || isDemo) {
      return MOCK_GALLERY_PHOTOS.filter(sub => !isSubmissionDeleted(sub.id, null, deletedSet) && !hiddenMockIds.includes(sub.id));
    }
    return [];
  }, [eventSubmissions, activeEvent, isDemo, hiddenMockIds]);

  const fullList = useMemo(() => {
    const deletedSet = getDeletedSubmissionIds();
    if (!userSubmission || isSubmissionDeleted(userSubmission, null, deletedSet) || hiddenMockIds.includes(userSubmission.id)) return baseList;
    return [userSubmission, ...baseList.filter(s => s.id !== userSubmission.id)];
  }, [userSubmission, baseList, hiddenMockIds]);

  // Handle Bulk ZIP Download from Full Gallery
  const handleDownloadZip = async () => {
    if (isDemoMode) {
      toast('Di mode demo tidak bisa download foto. Yuk pesan paket untuk acaramu!', 'warning');
      setShowPriceModal(true);
      return;
    }
    setIsZipping(true);
    try {
      const eventToUse = activeEvent || { displayName: 'Raka & Sabrina', slug: 'sabrina-raka' };
      const itemsToExport = fullList;
      toast(`Menyiapkan file ZIP foto kenangan untuk ${eventToUse.displayName}...`, 'info');
      const result = await exportEventSubmissionsZip({
        event: eventToUse,
        submissions: itemsToExport,
      });
      toast(`File ZIP berhasil diunduh (${result.totalPhotos} foto)! 📦`, 'success');
    } catch (err) {
      console.error(err);
      toast(err.message || 'Gagal mengunduh ZIP', 'error');
    } finally {
      setIsZipping(false);
    }
  };

  if (!galleryModalOpen) return null;

  // Search & Category Type Filter
  const filteredList = fullList.filter(item => {
    const matchesSearch = item.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const count = item.photos ? item.photos.length : 1;
    let matchesType = true;
    if (activeTypeFilter === '1-cut') matchesType = count === 1;
    if (activeTypeFilter === '2-cut') matchesType = count === 2;
    if (activeTypeFilter === '4-cut') matchesType = count >= 3;

    return matchesSearch && matchesType;
  });

  const toggleLike = (id, e) => {
    e.stopPropagation();
    setLikes(prev => {
      const isLiked = !prev[id];
      if (isLiked) toast('❤️ Kamu menyukai foto ini!', 'info');
      return { ...prev, [id]: isLiked };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] w-full h-[100dvh] max-h-[100dvh] bg-[#0C0409] text-white flex flex-col font-sans select-none overflow-hidden animate-fadeIn">
      
      {/* ================= 🌟 1. LUXURY DARK GLASS TOP NAVIGATION BAR 🌟 ================= */}
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 bg-[#14060E]/85 backdrop-blur-xl border-b border-[#C4A46C]/30 flex-shrink-0 z-30 shadow-[0_10px_30px_rgba(0,0,0,0.7)]">
        <button
          onClick={closeGalleryModal}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white hover:text-[#F5D77F] flex items-center gap-1.5 active:scale-95 transition cursor-pointer backdrop-blur-md shadow-sm"
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>

        <button
          onClick={() => {
            closeGalleryModal();
            openBooth();
          }}
          className="btn-pink text-xs px-4 sm:px-5 py-1.5 sm:py-2 shadow-lg shadow-rose-950/50"
        >
          <span>Ambil Foto</span>
        </button>
      </div>

      {/* ================= 🌟 2. SCROLLABLE GALLERY BODY WITH CONTINUOUS BURGUNDY-GOLD RADIANCE 🌟 ================= */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 sm:pb-28 no-scrollbar bg-[#0E050A] text-white relative">
        
        {/* Layer 1: Top Golden Halo Beam */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1200px] h-[550px] pointer-events-none z-0 rounded-full opacity-60 blur-[120px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245, 215, 127, 0.40) 0%, rgba(168, 30, 50, 0.35) 50%, transparent 80%)'
          }}
        />

        {/* Layer 2: Central Ambient Deep Crimson Spotlight Blooming Behind Grid */}
        <div 
          className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] max-w-[1300px] h-[800px] sm:h-[950px] pointer-events-none z-0 rounded-full opacity-80 blur-[140px] sm:blur-[170px]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(168, 30, 50, 0.70) 0%, rgba(115, 18, 33, 0.45) 45%, rgba(196, 164, 108, 0.20) 75%, transparent 92%)'
          }}
        />
        
        {/* ================= 🌟 GRAND EDITORIAL LUXURY HERO BANNER WITH PROGRESSIVE GRADIENT BLUR FADE 🌟 ================= */}
        <div className="relative w-full min-h-[380px] xs:min-h-[420px] sm:min-h-[480px] pt-8 sm:pt-12 pb-16 sm:pb-20 flex flex-col items-center justify-center overflow-hidden">
          
          {/* Couple Photo Background with Multi-Layer Progressive Blur & Color Mask Dissolve */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Base Image */}
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&auto=format&fit=crop&q=85"
              alt="The Wedding of Sabrina & Raka"
              className="w-full h-full object-cover object-top filter brightness-85 contrast-105 transform scale-102"
            />

            {/* Top Soft Vignette */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/85 via-black/45 to-transparent z-10" />

            {/* Progressive Blur Overlay Layer (Gradually blurs the photo from mid to bottom) */}
            <div 
              className="absolute inset-x-0 bottom-0 h-4/5 backdrop-blur-[8px] sm:backdrop-blur-[12px] z-10"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%)',
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.8) 70%, rgba(0,0,0,1) 100%)'
              }}
            />

            {/* Multi-Stop Color Dissolve Layer (Smoothly fades the blurred photo into #0E050A background) */}
            <div 
              className="absolute inset-0 z-20"
              style={{
                background: `linear-gradient(to bottom, 
                  rgba(14, 5, 10, 0.15) 0%, 
                  rgba(14, 5, 10, 0.35) 25%, 
                  rgba(14, 5, 10, 0.70) 55%, 
                  rgba(14, 5, 10, 0.92) 80%, 
                  #0E050A 100%
                )`
              }}
            />
          </div>

          {/* Grand Gold Calligraphy Header ("Galeri Pengunjung") */}
          <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-xl mx-auto my-auto pointer-events-none">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 py-1.5 rounded-full bg-[#180A12]/85 backdrop-blur-xl border border-[#C4A46C]/50 shadow-xl shadow-amber-950/40 mb-2 sm:mb-3">
              <span 
                style={{ fontFamily: "'Cinzel', Georgia, serif" }}
                className="text-[9px] sm:text-[10px] font-bold tracking-[0.28em] text-[#F5D77F] uppercase"
              >
                MOMENTS & GUESTBOOK
              </span>
            </div>

            {/* Grand Gold Calligraphy: Galeri Pengunjung */}
            <h2 
              className="text-4xl xs:text-5xl sm:text-7xl md:text-8xl font-normal leading-tight my-1 drop-shadow-2xl select-none pt-1 pb-1 px-2 overflow-visible text-center"
              style={{ 
                fontFamily: "'Great Vibes', 'Alex Brush', cursive",
                background: 'linear-gradient(135deg, #FFFFFF 10%, #FFF2CC 40%, #F5D77F 70%, #D4AF37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.9)) drop-shadow(0 0 35px rgba(245,215,127,0.45))'
              }}
            >
              Galeri Pengunjung
            </h2>

            {/* Subtitle Divider & Quote */}
            <div className="flex items-center justify-center gap-3 my-1 w-full max-w-sm">
              <div className="h-px bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent flex-1" />
              <span className="text-[9px] font-serif tracking-[0.25em] text-[#F5D77F] uppercase font-bold">
                {getEventHeaderTitle(activeEvent)} {getEventDisplayName(activeEvent).toUpperCase()}
              </span>
              <div className="h-px bg-gradient-to-r from-transparent via-[#C4A46C]/60 to-transparent flex-1" />
            </div>

            <p className="text-[11px] sm:text-xs text-amber-100/90 font-serif italic max-w-md px-4 mt-1 leading-snug drop-shadow">
              "Setiap senyuman, doa restu, dan kenangan manis yang terabadikan abadi dari seluruh tamu tercinta."
            </p>

            {/* Date & Collection Count Pill */}
            <div className="mt-3 flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/65 backdrop-blur-xl border border-amber-400/40 shadow-xl text-xs text-amber-200 font-serif">
                <Calendar size={12} className="text-[#F5D77F]" />
                <span>{fullList.length} Koleksi Photo Strip & Ucapan Doa Tamu</span>
              </div>
            </div>

          </div>

        </div>

        {/* ================= 🌟 3. DARK GLASS SEARCH BAR & FILTER TABS 🌟 ================= */}
        <div className="w-full max-w-md sm:max-w-lg mx-auto px-3.5 sm:px-4 relative z-30 -mt-6 sm:-mt-8 mb-6 sm:mb-8 flex flex-col gap-2.5">
          <div className="bg-[#1C0816]/85 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-[0_14px_45px_rgba(0,0,0,0.85),0_0_25px_rgba(245,215,127,0.18)] border border-[#C4A46C]/60 flex items-center gap-3 transition-all hover:border-[#F5D77F]">
            <Search size={16} className="text-[#F5D77F] ml-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Cari nama tamu atau ucapan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-3 py-1.5 bg-transparent text-xs sm:text-sm text-white placeholder-amber-100/50 outline-none font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-amber-200/60 hover:text-white mr-2 text-xs flex-shrink-0 p-1 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills (Filter by Strip Length/Pose Count) - Mobile Touch Scroll Friendly */}
          <div className="w-full overflow-x-auto no-scrollbar py-1 px-1 flex justify-start sm:justify-center">
            <div className="flex items-center gap-1.5 min-w-max px-1">
              {[
                { id: 'all', label: 'Semua Strip' },
                { id: '1-cut', label: '1 Foto (Polaroid)' },
                { id: '2-cut', label: '2 Foto (Duo)' },
                { id: '4-cut', label: '4 Cut Classic' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-[10.5px] sm:text-[11px] font-bold transition-all cursor-pointer flex-shrink-0 ${
                    activeTypeFilter === tab.id
                      ? 'bg-gradient-to-r from-[#6B111F] to-[#8A1828] text-[#F5D77F] border border-amber-400/60 shadow-lg scale-105'
                      : 'bg-black/60 border border-white/15 text-gray-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= 🌟 4. PINTEREST MASONRY COLUMNS GRID 🌟 ================= */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          
          {filteredList.length === 0 ? (
            <div className="text-center py-16 bg-[#180812]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-amber-400/30 flex items-center justify-center text-3xl mx-auto mb-3">
                🔍
              </div>
              <h3 className="text-base font-serif font-bold text-white mb-1">Foto Tidak Ditemukan</h3>
              <p className="text-xs text-gray-400">Coba ubah kata kunci pencarian atau filter tipe strip.</p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3.5 sm:gap-5 space-y-3.5 sm:space-y-5">
              {filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setFullFrameModal(item)}
                  className="break-inside-avoid inline-block w-full mb-3.5 sm:mb-5 cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
                >
                  <PhotostripThumbnail
                    item={item}
                    activeEvent={activeEvent}
                    className="w-full shadow-[0_14px_45px_rgba(0,0,0,0.85),0_0_20px_rgba(245,215,127,0.12)] border border-white/20 hover:border-amber-400/60"
                  />
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* ================= 🌟 5. FULL LIGHTBOX: DIRECT PHOTOSTRIP FRAME (FULL-SCREEN SCROLLABLE) 🌟 ================= */}
      <AnimatePresence>
        {fullFrameModal && (() => {
          const modalIsLight = fullFrameModal.colorHex === '#FAF6F0' || fullFrameModal.colorHex === '#FDFBF7' || fullFrameModal.colorHex === '#ffffff' || fullFrameModal.colorHex === '#F3C5CB';
          const modalTextColor = modalIsLight ? '#3A2D28' : (fullFrameModal.textHex || '#F5D77F');
          const modalSubTextColor = modalIsLight ? '#8C7A6B' : 'rgba(245, 215, 127, 0.8)';
          const modalGuestColor = modalIsLight ? '#5A4A3E' : '#FFFFFF';
          const modalDividerColor = modalIsLight ? 'border-[#D9CFC4]' : 'border-white/20';
          const modalBorderColor = modalIsLight ? 'border-[#D4C5B0]' : 'border-white/25';

          const modalRawMsg = fullFrameModal.message ? fullFrameModal.message.trim() : '';
          const modalTruncatedMsg = modalRawMsg.length > 70 ? `${modalRawMsg.slice(0, 70).trim()}...` : modalRawMsg;

          return (
            <div 
              className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md overflow-y-auto no-scrollbar flex flex-col items-center p-3 sm:p-6 animate-fadeIn cursor-pointer"
              onClick={(e) => {
                if (e.target === e.currentTarget) setFullFrameModal(null);
              }}
            >
              {/* Floating Close Button */}
              <button
                onClick={() => {
                    setFullFrameModal(null);
                    try {
                      if (window.history.state?.type === 'gallery_photo') {
                        window.history.back();
                      }
                    } catch (e) {}
                  }}
                className="fixed top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-base font-bold backdrop-blur-md border border-white/25 transition active:scale-95 cursor-pointer z-50 shadow-2xl"
                title="Tutup"
              >
                <X size={18} />
              </button>

              {/* Direct Photostrip Container (Interactive wrapper, centered with margin-auto) */}
              <div 
                className="relative w-full max-w-[280px] xs:max-w-[310px] sm:max-w-[330px] my-auto flex flex-col items-center gap-2.5 sm:gap-3 py-6 sm:py-8 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Exact Physical Photostrip with Full Frame Header, All Photo Cuts & Footer */}
                <div className="w-full shadow-2xl rounded-2xl overflow-hidden border border-white/20">
                  <PhotostripThumbnail
                    item={fullFrameModal}
                    activeEvent={activeEvent}
                    showVoiceBadge={false}
                    className="w-full"
                  />
                </div>

                {/* Guest Message Card (Clean floating pill) */}
                {fullFrameModal.message && (
                  <div className="w-full px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/15 text-xs text-rose-100 italic text-center shadow-lg">
                    "{fullFrameModal.message}"
                  </div>
                )}

                {/* Attached Spotify-style Voice Note Audio Player */}
                {(fullFrameModal.hasVoice || fullFrameModal.voiceUrl) && (
                  <div className="w-full">
                    <SpotifyVoicePlayer
                      voiceUrl={fullFrameModal.voiceUrl}
                      guestName={fullFrameModal.guestName}
                      totalDuration={fullFrameModal.voiceDuration || 12}
                    />
                  </div>
                )}

                {/* Apple-Minimalist Action Bar (Bagikan & Unduh HD) */}
                {(() => {
                  const hasVoiceNote = Boolean(fullFrameModal.hasVoice || fullFrameModal.voiceUrl);
                  return (
                    <div className="w-full mt-1 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (isDemoMode) {
                            toast('Di mode demo tidak bisa bagikan foto. Yuk pesan paket untuk acaramu!', 'warning');
                            setShowPriceModal(true);
                            return;
                          }
                          setReadyShareFile(null);
                          setActionSheetMode('share');
                        }}
                        disabled={isDownloadingStrip || isDownloadingVideo}
                        className="h-11 px-4 rounded-2xl bg-white hover:bg-white/90 text-[#1C1C1E] text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition active:scale-[0.97] cursor-pointer disabled:opacity-60"
                      >
                        <Share size={15} strokeWidth={2.2} />
                        <span>Bagikan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (isDemoMode) {
                            toast('Di mode demo tidak bisa download foto. Yuk pesan paket untuk acaramu!', 'warning');
                            setShowPriceModal(true);
                            return;
                          }
                          if (hasVoiceNote) {
                            setReadyShareFile(null);
                            setActionSheetMode('download');
                          } else {
                            handleDownloadStripHd();
                          }
                        }}
                        disabled={isDownloadingStrip || isDownloadingVideo}
                        className="h-11 px-4 rounded-2xl bg-white/[0.12] hover:bg-white/[0.18] text-white border border-white/[0.18] text-xs sm:text-[13px] font-medium flex items-center justify-center gap-2 backdrop-blur-md transition active:scale-[0.97] cursor-pointer disabled:opacity-60"
                      >
                        {isDownloadingStrip ? (
                          <Loader2 size={15} className="animate-spin text-white/80" />
                        ) : (
                          <Download size={15} strokeWidth={2} />
                        )}
                        <span>Unduh HD</span>
                      </button>
                    </div>
                  );
                })()}

              </div>

              {/* Apple Glass Action Sheet (Pilih Format Bagikan / Unduh) */}
              <AnimatePresence>
                {actionSheetMode && (
                  <div
                    className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-3 sm:p-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDownloadingVideo) {
                        setActionSheetMode(null);
                        setReadyShareFile(null);
                      }
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 24, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 24, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      onClick={(e) => e.stopPropagation()}
                      className="relative w-full max-w-[360px] bg-[#1C1C1E]/95 border border-white/[0.12] rounded-[28px] p-5 text-white shadow-[0_24px_64px_rgba(0,0,0,0.85)] z-10 font-sans mb-2 sm:mb-0"
                    >
                      <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-3" />

                      {!isDownloadingVideo && (
                        <button
                          type="button"
                          onClick={() => {
                            setActionSheetMode(null);
                            setReadyShareFile(null);
                          }}
                          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-white/60 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer"
                          title="Tutup"
                        >
                          <X size={14} />
                        </button>
                      )}

                      <div className="text-center pt-0.5 pb-4">
                        <h3 className="text-base font-semibold text-white tracking-tight">
                          {actionSheetMode === 'share' ? 'Bagikan Kenangan' : 'Unduh Kenangan'}
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">
                          {actionSheetMode === 'share'
                            ? 'Pilih format yang ingin dibagikan ke sosmed'
                            : 'Pilih format file yang ingin disimpan'}
                        </p>
                      </div>

                      {isDownloadingVideo ? (
                        <div className="py-5 px-2 flex flex-col items-center text-center">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3">
                            <Loader2 size={22} className="text-white/90 animate-spin" />
                          </div>
                          <h4 className="text-sm font-medium text-white">
                            Menyiapkan Video Story...
                          </h4>
                          <p className="text-xs text-white/50 mt-1 max-w-[250px]">
                            {videoStatusText || 'Menggabungkan foto dan rekaman suara...'}
                          </p>
                          <div className="w-full bg-white/[0.08] rounded-full h-1.5 mt-4 overflow-hidden">
                            <motion.div
                              className="bg-white h-full rounded-full"
                              initial={{ width: '8%' }}
                              animate={{ width: `${Math.max(8, videoProgress)}%` }}
                              transition={{ ease: 'easeOut', duration: 0.2 }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-white/40 mt-2">
                            {videoProgress}%
                          </span>
                        </div>
                      ) : readyShareFile ? (
                        <div className="py-3 flex flex-col items-center text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-white text-[#1C1C1E] flex items-center justify-center shadow-lg">
                            <Share size={20} strokeWidth={2.2} />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-white">
                              {readyShareLabel || 'Siap Dibagikan'}
                            </h4>
                            <p className="text-xs text-white/55 mt-1 max-w-[260px]">
                              Ketuk tombol di bawah untuk membuka menu bagikan ke WhatsApp, IG Story, atau TikTok.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleTriggerReadyShare}
                            className="w-full py-3 rounded-2xl bg-white hover:bg-white/90 text-[#1C1C1E] text-xs sm:text-[13px] font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer shadow-lg"
                          >
                            <Share size={15} />
                            <span>Bagikan Sekarang</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              triggerFileDownload(readyShareFile, readyShareFile.name);
                              toast('File berhasil disimpan ke perangkat.', 'success');
                            }}
                            className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 text-xs font-medium transition cursor-pointer"
                          >
                            Simpan ke Perangkat Saja
                          </button>
                        </div>
                      ) : actionSheetMode === 'share' ? (
                        <ShareFormatOptions
                          hasVoice={Boolean(fullFrameModal.hasVoice || fullFrameModal.voiceUrl)}
                          onSelectPhotoFormat={handleSharePhotoFormat}
                          onSelectVoiceVideo={handleSharePhotoWithVoice}
                          onSelectWhatsAppLink={() => {
                            const eventTitle = activeEvent?.displayName || 'Photobooth Event';
                            openWhatsAppLinkShare({
                              text: `Lihat foto strip dari ${fullFrameModal.guestName || 'tamu'} di ${eventTitle}:`,
                              url: window.location.href,
                            });
                            setActionSheetMode(null);
                          }}
                          onCancel={() => {
                            setActionSheetMode(null);
                            setReadyShareFile(null);
                          }}
                          cancelLabel="Batal"
                        />
                      ) : (
                        <div className="space-y-2">
                          {/* Download Choice 1: Hanya Foto Strip */}
                          <button
                            type="button"
                            onClick={handleDownloadStripHd}
                            className="w-full p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.10] active:scale-[0.98] border border-white/[0.08] transition flex items-center justify-between gap-3 text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/90 flex-shrink-0">
                                <ImageIcon size={18} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[13px] font-medium text-white">
                                    Hanya Foto Strip
                                  </span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white/[0.12] text-white/70">
                                    JPG HD
                                  </span>
                                </div>
                                <p className="text-[11px] text-white/50 truncate mt-0.5">
                                  Ukuran cetak & galeri resolusi tinggi
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-white/40 group-hover:text-white flex-shrink-0 transition" />
                          </button>

                          {/* Download Choice 2: Foto + Audio Doa (Video Story 9:16) */}
                          <button
                            type="button"
                            onClick={handleDownloadVoiceVideo}
                            className="w-full p-3.5 rounded-2xl bg-white/[0.09] hover:bg-white/[0.14] active:scale-[0.98] border border-white/[0.16] transition flex items-center justify-between gap-3 text-left group cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-white text-[#1C1C1E] flex items-center justify-center flex-shrink-0 shadow-sm">
                                <Video size={18} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[13px] font-medium text-white">
                                    Foto + Audio Doa
                                  </span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white text-[#1C1C1E]">
                                    9:16
                                  </span>
                                </div>
                                <p className="text-[11px] text-white/55 truncate mt-0.5">
                                  Video vertikal 9:16 dengan rekaman suara
                                </p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-white/60 group-hover:text-white flex-shrink-0 transition" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActionSheetMode(null);
                              setReadyShareFile(null);
                            }}
                            className="w-full py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white/80 transition cursor-pointer text-center mt-1"
                          >
                            Batal
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </div>
          );
      })()}
      </AnimatePresence>

      {/* Demo Mode Price List Modal */}
      <PriceListModal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        notice="Di mode demo tidak bisa download foto. Yuk pesan paket photobooth untuk acaramu agar seluruh tamu bisa berfoto & mengunduh sepuasnya!"
      />

    </div>
  );
}