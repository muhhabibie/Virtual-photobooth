import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, Mic, Download, Share, Loader2, AlertCircle } from 'lucide-react';
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
import { useToast } from '../ui/Toast';

export default function DownloadFormatModal({
  isOpen,
  onClose,
  photoCanvas,
  voiceUrl,
  guestName = 'Tamu Undangan',
  coupleName = 'Sabrina & Raka',
  eventName = 'The Wedding',
  isWedding = true,
  filenamePrefix = 'photobooth',
  initialMode = 'download', // 'download' | 'share'
  isDemo = false,
  onOpenDemoModal,
}) {
  const { toast } = useToast();
  const [activeMode, setActiveMode] = useState(initialMode);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatusText, setVideoStatusText] = useState('');
  const [videoError, setVideoError] = useState(null);
  const [readyShareFile, setReadyShareFile] = useState(null);
  const [readyShareLabel, setReadyShareLabel] = useState('');
  const preparedJpgFilesRef = useRef({});

  const getCanvas = () => {
    if (!photoCanvas) return null;
    return typeof photoCanvas === 'function' ? photoCanvas() : photoCanvas;
  };

  // Sync mode and pre-prepare JPG Files (raw, 4:5 feed, 9:16 story) on modal open so iOS Safari Web Share runs in gesture
  useEffect(() => {
    if (!isOpen) {
      preparedJpgFilesRef.current = {};
      setReadyShareFile(null);
      setReadyShareLabel('');
      setVideoError(null);
      return;
    }

    setActiveMode(initialMode);
    setReadyShareFile(null);
    setReadyShareLabel('');
    setVideoError(null);

    let cancelled = false;
    (async () => {
      try {
        const canvas = getCanvas();
        if (!canvas || cancelled) return;
        const shareMeta = {
          filenamePrefix,
          coupleName,
          eventName,
          guestName,
        };
        const [raw, feed, story] = await Promise.all([
          createSocialShareJpegFile(canvas, { ...shareMeta, format: 'raw', quality: 0.95 }),
          createSocialShareJpegFile(canvas, { ...shareMeta, format: 'feed', quality: 0.94 }),
          createSocialShareJpegFile(canvas, { ...shareMeta, format: 'story', quality: 0.94 }),
        ]);
        if (!cancelled) {
          preparedJpgFilesRef.current = { raw, feed, story };
        }
      } catch {
        // Fallback: generate on click
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, initialMode, filenamePrefix, coupleName, eventName, guestName]);

  if (!isOpen) return null;

  const hasVoice = Boolean(voiceUrl);
  const audioLabel = isWedding ? 'Pesan Suara & Doa Restu' : 'Pesan Suara & Ucapan';

  const getOrCreateJpgFile = async (format = 'raw') => {
    if (preparedJpgFilesRef.current?.[format]) return preparedJpgFilesRef.current[format];
    const canvas = getCanvas();
    if (!canvas) throw new Error('Canvas foto belum siap.');
    const file = await createSocialShareJpegFile(canvas, {
      format,
      filenamePrefix,
      coupleName,
      eventName,
      guestName,
      quality: format === 'raw' ? 0.95 : 0.94,
    });
    preparedJpgFilesRef.current = { ...preparedJpgFilesRef.current, [format]: file };
    return file;
  };

  // 1. Download Photo Strip Only (JPG HD)
  const handleDownloadPhoto = async () => {
    if (isDemo) {
      toast('Di mode demo tidak bisa download foto. Yuk pesan paket untuk acaramu!', 'warning');
      if (onOpenDemoModal) onOpenDemoModal();
      return;
    }
    try {
      const file = await getOrCreateJpgFile();
      triggerFileDownload(file, file.name);
      toast(`Foto strip berhasil diunduh (${file.name})`, 'success');
      onClose();
    } catch {
      toast('Canvas foto belum siap.', 'error');
    }
  };

  // 2. Download Video MP4 Story
  const handleDownloadVideo = async () => {
    if (isDemo) {
      toast('Di mode demo tidak bisa download video. Yuk pesan paket untuk acaramu!', 'warning');
      if (onOpenDemoModal) onOpenDemoModal();
      return;
    }
    const canvas = getCanvas();
    if (!canvas) {
      toast('Canvas foto belum siap.', 'error');
      return;
    }
    if (!voiceUrl) {
      toast('Rekaman audio tidak ditemukan.', 'warning');
      return;
    }

    setIsProcessingVideo(true);
    setVideoProgress(5);
    setVideoStatusText('Menyiapkan audio & visual video...');
    setVideoError(null);

    try {
      const result = await generatePhotostripVideo({
        photoCanvas: canvas,
        voiceUrl,
        guestName,
        coupleName,
        eventName,
        audioLabel,
        onProgress: (percent, text) => {
          setVideoProgress(percent);
          setVideoStatusText(text);
        },
      });

      const filename = `${sanitizeShareFilename(filenamePrefix)}_story.${result.extension}`;
      triggerFileDownload(result.blob, filename);

      toast(`Video Story berhasil diunduh (${filename})`, 'success');
      setIsProcessingVideo(false);
      onClose();
    } catch (err) {
      console.error('Video generation error:', err);
      setVideoError('Gagal memproses video pada browser ini. Silakan unduh foto strip JPG secara terpisah.');
      setIsProcessingVideo(false);
      toast('Gagal memproses video', 'error');
    }
  };

  // 3. Download Audio Voice Note Only
  const handleDownloadAudioOnly = async () => {
    if (isDemo) {
      toast('Di mode demo tidak bisa download audio. Yuk pesan paket untuk acaramu!', 'warning');
      if (onOpenDemoModal) onOpenDemoModal();
      return;
    }
    if (!voiceUrl) {
      toast('Rekaman suara tidak ditemukan.', 'warning');
      return;
    }

    try {
      const res = await fetch(voiceUrl);
      const blob = await res.blob();
      const filename = `${sanitizeShareFilename(filenamePrefix)}_suara.webm`;
      triggerFileDownload(blob, filename);
      toast(`Pesan suara berhasil diunduh (${filename})`, 'success');
      onClose();
    } catch {
      toast('Gagal mengunduh audio', 'error');
    }
  };

  // 4. Share Photo Strip / Social Card (JPG HD via Web Share API)
  const handleSharePhotoFormat = async (format = 'raw') => {
    if (isDemo) {
      toast('Di mode demo tidak bisa bagikan foto. Yuk pesan paket untuk acaramu!', 'warning');
      if (onOpenDemoModal) onOpenDemoModal();
      return;
    }
    try {
      const file = await getOrCreateJpgFile(format);
      const res = await shareFileNativeOrFallback({
        file,
        title: `${guestName} — ${coupleName}`,
        text: `Momen seru di ${coupleName}`,
      });
      if (res.status === 'shared') {
        onClose();
      } else if (res.status === 'needs_gesture') {
        setReadyShareFile(res.file);
        setReadyShareLabel(`${SOCIAL_CARD_SPECS[format]?.label || 'Foto HD'} Siap Dibagikan`);
      } else if (res.status === 'fallback_downloaded') {
        toast('Foto HD disimpan — siap diunggah ke WhatsApp atau Instagram!', 'info');
        onClose();
      }
    } catch {
      toast('Gagal menyiapkan foto untuk dibagikan.', 'error');
    }
  };

  // 5. Share Video Story + Voice Note (MP4 9:16 via Web Share API)
  const handleShareVideoWithAudio = async () => {
    if (isDemo) {
      toast('Di mode demo tidak bisa bagikan video. Yuk pesan paket untuk acaramu!', 'warning');
      if (onOpenDemoModal) onOpenDemoModal();
      return;
    }
    const canvas = getCanvas();
    if (!canvas) {
      toast('Canvas foto belum siap.', 'error');
      return;
    }
    if (!voiceUrl) {
      toast('Rekaman audio tidak ditemukan.', 'warning');
      return;
    }

    setIsProcessingVideo(true);
    setVideoProgress(5);
    setVideoStatusText('Menyiapkan video story + suara...');
    setVideoError(null);

    try {
      const result = await generatePhotostripVideo({
        photoCanvas: canvas,
        voiceUrl,
        guestName,
        coupleName,
        eventName,
        audioLabel,
        onProgress: (percent, text) => {
          setVideoProgress(percent);
          setVideoStatusText(text);
        },
      });

      const videoFile = videoBlobToShareFile(result.blob, filenamePrefix, result.extension);
      setIsProcessingVideo(false);

      const res = await shareFileNativeOrFallback({
        file: videoFile,
        title: `${guestName} — ${coupleName}`,
        text: `Pesan suara & kenangan di ${coupleName}`,
      });

      if (res.status === 'shared') {
        onClose();
      } else if (res.status === 'needs_gesture') {
        setReadyShareFile(res.file);
        setReadyShareLabel('Video Story + Audio Siap Dibagikan');
      } else if (res.status === 'fallback_downloaded') {
        toast('Video Story disimpan — siap diunggah ke IG Story, WA Status, atau TikTok!', 'info');
        onClose();
      }
    } catch (err) {
      console.error('Share video error:', err);
      setVideoError('Gagal memproses video pada browser ini. Kamu tetap bisa membagikan foto strip JPG.');
      setIsProcessingVideo(false);
      toast('Gagal memproses video', 'error');
    }
  };

  const handleTriggerReadyShare = async () => {
    if (!readyShareFile) return;
    const res = await shareFileNativeOrFallback({
      file: readyShareFile,
      title: `${guestName} — ${coupleName}`,
      text: `Kenangan di ${coupleName}`,
    });
    if (res.status === 'shared') {
      setReadyShareFile(null);
      onClose();
    } else if (res.status === 'fallback_downloaded') {
      setReadyShareFile(null);
      toast('File tersimpan — siap diunggah ke WhatsApp atau Instagram!', 'info');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[280] flex items-center justify-center p-4 selection:bg-white/20">

        {/* Backdrop (Apple Frosted Darkness) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={!isProcessingVideo ? onClose : undefined}
          className="absolute inset-0 bg-black/75 backdrop-blur-xl cursor-pointer"
        />

        {/* Modal Sheet (Apple Minimalist Glass Card) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[370px] bg-[#1C1C1E]/95 border border-white/[0.12] rounded-[28px] p-5 text-white shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden my-auto z-10 font-sans"
        >
          {/* Top Grab Indicator */}
          <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-3" />

          {/* Close Button */}
          {!isProcessingVideo && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-white/60 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer z-20"
              title="Tutup"
            >
              <X size={14} />
            </button>
          )}

          {/* Header */}
          <div className="text-center pt-1 pb-3.5">
            <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {activeMode === 'share' ? 'Bagikan Hasil Foto' : 'Simpan Hasil Foto'}
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              {activeMode === 'share'
                ? 'Kirim ke WhatsApp, IG Story, atau sosmed lainnya'
                : 'Pilih format unduhan kenangan Anda'}
            </p>
          </div>

          {/* Apple Segmented Control: Simpan | Bagikan */}
          {!isProcessingVideo && !readyShareFile && (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.07] border border-white/[0.06] mb-3.5">
              <button
                type="button"
                onClick={() => setActiveMode('download')}
                className={`py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'download'
                    ? 'bg-white text-[#1C1C1E] shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Download size={13} />
                <span>Simpan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('share')}
                className={`py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeMode === 'share'
                    ? 'bg-white text-[#1C1C1E] shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Share size={13} />
                <span>Bagikan</span>
              </button>
            </div>
          )}

          {/* Processing Video State */}
          {isProcessingVideo ? (
            <div className="py-6 px-2 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-3">
                <Loader2 size={22} className="text-white/90 animate-spin" />
              </div>

              <h4 className="text-sm font-medium text-white">
                Memproses Video Story...
              </h4>
              <p className="text-xs text-white/50 mt-1 max-w-[250px] leading-relaxed">
                {videoStatusText || 'Menyelaraskan foto dan suara...'}
              </p>

              {/* Minimal Apple Progress Track */}
              <div className="w-full bg-white/[0.08] rounded-full h-1.5 mt-4 overflow-hidden">
                <motion.div
                  className="bg-white h-full rounded-full"
                  initial={{ width: '5%' }}
                  animate={{ width: `${Math.max(5, videoProgress)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>

              <span className="text-[11px] font-mono text-white/40 mt-2">
                {videoProgress}%
              </span>
            </div>
          ) : readyShareFile ? (
            /* Safari Instant-Gesture Confirmation State after Video Render */
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
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 text-xs font-medium transition cursor-pointer"
              >
                Simpan ke Perangkat Saja
              </button>
            </div>
          ) : activeMode === 'share' ? (
            /* SHARE MODE (iOS Grouped Inset List Style) */
            <div>
              <ShareFormatOptions
                hasVoice={hasVoice}
                onSelectPhotoFormat={handleSharePhotoFormat}
                onSelectVoiceVideo={handleShareVideoWithAudio}
                onSelectWhatsAppLink={() => {
                  openWhatsAppLinkShare({
                    text: `Abadikan momen bersama di photobooth ${coupleName}! Lihat galeri:`,
                    url: window.location.href,
                  });
                  onClose();
                }}
                onCancel={onClose}
                cancelLabel="Tutup"
              />

              {videoError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2 mt-2">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{videoError}</span>
                </div>
              )}
            </div>
          ) : (
            /* DOWNLOAD MODE (iOS Grouped Inset List Style) */
            <div className="space-y-2">
              {/* Option 1: Photo Strip JPG */}
              <button
                type="button"
                onClick={handleDownloadPhoto}
                className="w-full p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.10] active:scale-[0.98] border border-white/[0.08] transition flex items-center justify-between gap-3 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/90 flex-shrink-0 group-hover:scale-105 transition">
                    <ImageIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white">
                        Foto Strip HD
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white/[0.12] text-white/70">
                        JPG
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      Ukuran 2x6 inci • Siap cetak fisik & galeri
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-white/[0.06] group-hover:bg-white/[0.16] flex items-center justify-center flex-shrink-0 text-white/60 group-hover:text-white transition">
                  <Download size={14} />
                </div>
              </button>

              {/* Option 2: Video MP4 Story (If voice note exists) */}
              {hasVoice && (
                <button
                  type="button"
                  onClick={handleDownloadVideo}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] active:scale-[0.98] border border-white/[0.14] transition flex items-center justify-between gap-3 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-sm">
                      <Video size={18} className="text-black" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-white">
                          Video Story + Suara
                        </span>
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white text-black">
                          MP4
                        </span>
                      </div>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">
                        Vertikal 9:16 • Untuk IG Story & WhatsApp
                      </p>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white/[0.08] group-hover:bg-white text-white/70 group-hover:text-black flex items-center justify-center flex-shrink-0 transition">
                    <Download size={14} />
                  </div>
                </button>
              )}

              {/* Option 3: Voice Note Audio Only */}
              {hasVoice && (
                <button
                  type="button"
                  onClick={handleDownloadAudioOnly}
                  className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.98] border border-white/[0.05] transition flex items-center justify-between gap-3 text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/70 flex-shrink-0">
                      <Mic size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-white/80">
                        Pesan Suara Saja
                      </span>
                      <p className="text-[10.5px] text-white/40 truncate">
                        File rekaman audio asli
                      </p>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white/40 group-hover:text-white transition">
                    <Download size={13} />
                  </div>
                </button>
              )}

              {/* Error Notice */}
              {videoError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-start gap-2 mt-2">
                  <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{videoError}</span>
                </div>
              )}

              {/* Bottom Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white/80 transition cursor-pointer text-center mt-2"
              >
                Tutup
              </button>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
