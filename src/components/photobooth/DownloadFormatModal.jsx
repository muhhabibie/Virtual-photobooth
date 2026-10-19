import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, Mic, Download, Check, Sparkles, AlertCircle, Loader2, Package, FolderArchive } from 'lucide-react';
import JSZip from 'jszip';
import { generatePhotostripVideo } from '../../utils/videoGenerator';
import { useToast } from '../ui/Toast';

export default function DownloadFormatModal({
  isOpen,
  onClose,
  photoCanvas,
  photos = [],
  voiceUrl,
  guestName = 'Tamu Undangan',
  coupleName = 'Sabrina & Raka',
  eventName = 'The Wedding',
  filenamePrefix = 'photobooth',
}) {
  const { toast } = useToast();
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatusText, setVideoStatusText] = useState('');
  const [videoError, setVideoError] = useState(null);
  const [isZippingBundle, setIsZippingBundle] = useState(false);

  if (!isOpen) return null;

  // Helper to get active canvas
  const getCanvas = () => {
    if (!photoCanvas) return null;
    return typeof photoCanvas === 'function' ? photoCanvas() : photoCanvas;
  };

  // Helper to convert dataUrl or remote url to Uint8Array
  const getBinary = async (url) => {
    if (!url) return null;
    if (url.startsWith('data:')) {
      const parts = url.split(',');
      const binStr = atob(parts[1]);
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      return bytes;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fetch failed');
      const buf = await res.arrayBuffer();
      return new Uint8Array(buf);
    } catch (e) {
      return null;
    }
  };

  // 0. Download Complete Bundle: Strip + All Individual Photos (.ZIP)
  const handleDownloadBundleZip = async () => {
    const canvas = getCanvas();
    if (!canvas) {
      toast('Canvas foto belum siap.', 'error');
      return;
    }

    setIsZippingBundle(true);
    toast('Menyiapkan paket foto strip + foto asli...', 'info');

    try {
      const zip = new JSZip();

      // 1. Add Rendered Photostrip (HD JPG)
      const stripBlob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', 0.95));
      if (stripBlob) {
        const stripBuffer = await stripBlob.arrayBuffer();
        zip.file(`${filenamePrefix}_STRIP.jpg`, new Uint8Array(stripBuffer));
      }

      // 2. Add All Individual Captured Cut Photos
      const photoList = Array.isArray(photos) ? photos : [];
      for (let i = 0; i < photoList.length; i++) {
        const item = photoList[i];
        let dataUrl = '';
        if (typeof item === 'string') dataUrl = item;
        else if (item?.dataUrl) dataUrl = item.dataUrl;
        else if (item?.canvas?.toDataURL) dataUrl = item.canvas.toDataURL('image/jpeg', 0.94);

        if (dataUrl) {
          const bin = await getBinary(dataUrl);
          if (bin) {
            zip.file(`${filenamePrefix}_Foto_${i + 1}.jpg`, bin);
          }
        }
      }

      // 3. Add Voice Note (if recorded)
      if (voiceUrl) {
        try {
          const vRes = await fetch(voiceUrl);
          if (vRes.ok) {
            const vBuf = await vRes.arrayBuffer();
            zip.file(`${filenamePrefix}_suara.webm`, new Uint8Array(vBuf));
          }
        } catch (e) {
          console.warn('Voice bundle note error:', e);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenamePrefix}_Strip_dan_Foto.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      toast('Paket lengkap (Strip + Semua Foto) berhasil diunduh!', 'success');
      setIsZippingBundle(false);
      onClose();
    } catch (err) {
      console.error('ZIP bundle error:', err);
      toast('Gagal mengunduh paket ZIP', 'error');
      setIsZippingBundle(false);
    }
  };

  // 1. Download Photo Strip Only (JPG HD)
  const handleDownloadPhoto = () => {
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
      toast(`Foto strip HD berhasil diunduh (${filename})!`, 'success');
      onClose();
    }, 'image/jpeg', 0.94);
  };

  // 2. Download Photo Strip + Audio (Video MP4 Story)
  const handleDownloadVideo = async () => {
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
    setVideoStatusText('Menyiapkan audio & kanvas video...');
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
      const filename = `${filenamePrefix}_voice_story.${result.extension}`;
      a.download = filename;
      a.href = videoUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(videoUrl), 3000);

      toast(`Video MP4 bersuara berhasil diunduh (${filename})!`, 'success');
      setIsProcessingVideo(false);
      onClose();
    } catch (err) {
      console.error('Video generation error:', err);
      setVideoError('Gagal memproses video. Browser Anda mungkin membatasi perekaman video kanvas. Silakan unduh foto strip JPG dan audio secara terpisah.');
      setIsProcessingVideo(false);
      toast('Gagal memproses video', 'error');
    }
  };

  // 3. Download Audio Voice Note Only
  const handleDownloadAudioOnly = async () => {
    if (!voiceUrl) {
      toast('Rekaman suara tidak ditemukan.', 'warning');
      return;
    }

    try {
      const res = await fetch(voiceUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${filenamePrefix}_pesan_suara.webm`;
      a.download = filename;
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast(`Pesan suara berhasil diunduh (${filename})!`, 'success');
      onClose();
    } catch (e) {
      toast('Gagal mengunduh audio', 'error');
    }
  };

  const hasVoice = Boolean(voiceUrl);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[280] flex items-center justify-center p-3 sm:p-4 selection:bg-rose-900 selection:text-amber-200">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!isProcessingVideo ? onClose : undefined}
          className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-[#1C0A15] border border-[#C4A46C]/50 rounded-3xl p-5 sm:p-6 text-white shadow-2xl overflow-hidden my-auto z-10"
        >
          {/* Subtle Ambient Shimmer */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Close Button (disabled during video rendering) */}
          {!isProcessingVideo && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-90 cursor-pointer z-20"
              title="Tutup"
            >
              <X size={16} />
            </button>
          )}

          {/* Modal Header */}
          <div className="text-center pb-4 border-b border-white/10 relative z-10">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-200 tracking-tight">
              Simpan Hasil Photobooth
            </h3>
            <p className="text-xs text-stone-300 mt-1 font-sans">
              Pilih format unduhan kenangan sesuai kebutuhanmu
            </p>
          </div>

          {/* Processing Video State */}
          {isProcessingVideo ? (
            <div className="py-8 px-2 flex flex-col items-center justify-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6B111F] to-[#C4A46C] p-0.5 shadow-xl shadow-rose-950/50 mb-4 animate-spin">
                <div className="w-full h-full bg-[#1C0A15] rounded-full flex items-center justify-center">
                  <Video size={24} className="text-[#F5D77F] animate-pulse" />
                </div>
              </div>

              <h4 className="text-lg font-serif font-bold text-amber-200">
                Membuat Video Kenangan Bersuara...
              </h4>
              <p className="text-xs text-stone-300 mt-1 font-sans max-w-xs">
                {videoStatusText || 'Sedang menyelaraskan photo strip dan audio doa...'}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-black/50 rounded-full h-3 border border-white/10 mt-5 overflow-hidden p-0.5">
                <motion.div
                  className="bg-gradient-to-r from-[#C4A46C] via-[#F5D77F] to-[#C4A46C] h-full rounded-full"
                  initial={{ width: '5%' }}
                  animate={{ width: `${Math.max(5, videoProgress)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>

              <span className="text-xs font-mono font-bold text-amber-300 mt-2">
                {videoProgress}%
              </span>

              <p className="text-[11px] text-stone-400 mt-4 font-sans italic">
                Video MP4 9:16 vertikal akan otomatis terunduh begitu proses selesai.
              </p>
            </div>
          ) : (
            /* Format Selection Options */
            <div className="py-4 space-y-3 relative z-10">
              
              {/* FEATURED OPTION: Photo Strip + Semua Foto Pose (.ZIP) */}
              <div
                onClick={!isZippingBundle ? handleDownloadBundleZip : undefined}
                className="group p-4 rounded-2xl bg-gradient-to-r from-[#3A1424] via-[#2A0E1B] to-[#1C0A15] hover:brightness-110 border-2 border-amber-400/80 shadow-lg shadow-rose-950/40 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98 relative overflow-hidden"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center flex-shrink-0 font-bold group-hover:scale-105 transition shadow-sm">
                    {isZippingBundle ? (
                      <Loader2 size={20} className="animate-spin text-stone-950" />
                    ) : (
                      <Package size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-serif font-bold text-amber-200">
                        Foto Strip + Semua Foto
                      </h4>
                      <span className="text-[9.5px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                        PAKET LENGKAP .ZIP
                      </span>
                      <span className="text-[9.5px] font-sans font-bold text-amber-300 flex items-center gap-0.5">
                        <Sparkles size={10} />
                        <span>Paling Lengkap</span>
                      </span>
                    </div>
                    <p className="text-xs text-stone-200 mt-1 leading-snug font-sans">
                      Unduh <strong>foto strip berbingkai</strong> sekaligus seluruh <strong>foto asli individual per pose</strong> dalam 1 file .ZIP.
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                  <Download size={15} />
                </div>
              </div>

              {/* OPTION 2: Photo Strip Only (JPG HD - Siap Cetak) */}
              <div
                onClick={handleDownloadPhoto}
                className="group p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 hover:border-amber-400/40 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-rose-400/20 border border-amber-300/30 flex items-center justify-center flex-shrink-0 text-amber-300 group-hover:scale-105 transition">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-serif font-bold text-white group-hover:text-amber-200 transition">
                        Foto Strip Saja
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-stone-300 border border-white/10">
                        JPG HD
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1 leading-snug font-sans">
                      Resolusi tinggi 2X Retina (ukuran 2x6 inci). Sangat ideal untuk dicetak fisik atau disimpan di galeri foto HP.
                    </p>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#6B111F] group-hover:text-[#F5D77F] flex items-center justify-center flex-shrink-0 text-stone-300 transition">
                  <Download size={15} />
                </div>
              </div>

              {/* OPTION 2: Photo Strip + Audio (Video MP4 Story) - Enabled only if voice exists */}
              {hasVoice && (
                <div
                  onClick={handleDownloadVideo}
                  className="group p-4 rounded-2xl bg-gradient-to-r from-[#2F1122] to-[#200A18] hover:from-[#3D142C] hover:to-[#2B0D20] border-2 border-[#C4A46C] hover:border-[#F5D77F] shadow-lg shadow-rose-950/40 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98 relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A46C] to-[#F5D77F] flex items-center justify-center flex-shrink-0 text-[#240C17] group-hover:scale-105 transition shadow-sm">
                      <Video size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-serif font-bold text-amber-200">
                          Foto Strip + Audio
                        </h4>
                        <span className="text-[9.5px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-[#C4A46C] text-[#240C17]">
                          VIDEO MP4
                        </span>
                        <span className="text-[9.5px] font-sans font-bold text-amber-300 flex items-center gap-0.5">
                          <Sparkles size={10} />
                          <span>Rekomendasi</span>
                        </span>
                      </div>
                      <p className="text-xs text-stone-200 mt-1 leading-snug font-sans">
                        Video vertikal 9:16 bersuara dilengkapi animasi gelombang suara. Siap diupload ke <strong>WhatsApp Status, IG Story & TikTok</strong>!
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#C4A46C] to-[#F5D77F] text-[#240C17] flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                    <Download size={15} />
                  </div>
                </div>
              )}

              {/* OPTION 3: Voice Audio Only */}
              {hasVoice && (
                <div
                  onClick={handleDownloadAudioOnly}
                  className="group p-3 sm:p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Mic size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-serif font-bold text-stone-200 group-hover:text-white">
                        Audio Doa Saja
                      </h4>
                      <p className="text-[11px] text-stone-400 font-sans">
                        File rekaman pesan suara asli (.webm / .mp3)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-serif text-stone-400 group-hover:text-amber-200 flex items-center gap-1">
                    <span>Unduh</span>
                    <Download size={13} />
                  </span>
                </div>
              )}

              {/* Error Message if Video Failed */}
              {videoError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{videoError}</span>
                </div>
              )}

              {/* Notice if No Voice was recorded */}
              {!hasVoice && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-stone-300 text-xs text-center font-sans">
                  ℹ️ Sesi ini tidak menyertakan rekaman suara, sehingga hanya opsi unduh Foto Strip JPG yang tersedia.
                </div>
              )}

            </div>
          )}

          {/* Modal Footer */}
          {!isProcessingVideo && (
            <div className="pt-3 border-t border-white/10 text-center relative z-10">
              <button
                type="button"
                onClick={onClose}
                className="text-stone-400 hover:text-white text-xs font-sans py-1 px-3 transition cursor-pointer"
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
