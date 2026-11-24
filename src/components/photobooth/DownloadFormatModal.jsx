import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, Mic, Download, Loader2, AlertCircle } from 'lucide-react';
import { generatePhotostripVideo } from '../../utils/videoGenerator';
import { useToast } from '../ui/Toast';

export default function DownloadFormatModal({
  isOpen,
  onClose,
  photoCanvas,
  voiceUrl,
  guestName = 'Tamu Undangan',
  coupleName = 'Sabrina & Raka',
  eventName = 'The Wedding',
  filenamePrefix = 'photobooth',
  isDemo = false,
  onOpenDemoModal,
}) {
  const { toast } = useToast();
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatusText, setVideoStatusText] = useState('');
  const [videoError, setVideoError] = useState(null);

  if (!isOpen) return null;

  const getCanvas = () => {
    if (!photoCanvas) return null;
    return typeof photoCanvas === 'function' ? photoCanvas() : photoCanvas;
  };

  // 1. Download Photo Strip Only (JPG HD)
  const handleDownloadPhoto = () => {
    if (isDemo) {
      toast('Di mode demo tidak bisa download foto. Yuk pesan paket untuk acaramu!', 'warning');
      if (onOpenDemoModal) onOpenDemoModal();
      return;
    }
    const canvas = getCanvas();
    if (!canvas) {
      toast('Canvas foto belum siap.', 'error');
      return;
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${filenamePrefix}_photostrip.jpg`;
      a.download = filename;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast(`Foto strip berhasil diunduh (${filename})`, 'success');
      onClose();
    }, 'image/jpeg', 0.94);
  };

  // 2. Download Photo Strip + Audio (Video MP4 Story)
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
        onProgress: (percent, text) => {
          setVideoProgress(percent);
          setVideoStatusText(text);
        },
      });

      const videoUrl = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      const filename = `${filenamePrefix}_story.${result.extension}`;
      a.download = filename;
      a.href = videoUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(videoUrl), 3000);

      toast(`Video MP4 berhasil diunduh (${filename})`, 'success');
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${filenamePrefix}_suara.webm`;
      a.download = filename;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast(`Pesan suara berhasil diunduh (${filename})`, 'success');
      onClose();
    } catch (e) {
      toast('Gagal mengunduh audio', 'error');
    }
  };

  const hasVoice = Boolean(voiceUrl);

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
          <div className="text-center pt-1 pb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              Simpan Hasil Foto
            </h3>
            <p className="text-xs text-white/50 mt-0.5">
              Pilih format unduhan kenangan Anda
            </p>
          </div>

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
          ) : (
            /* Format Selection (iOS Grouped Inset List Style) */
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
