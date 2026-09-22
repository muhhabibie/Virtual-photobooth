import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ArrowLeft, RefreshCw, Timer, Disc, Camera, ArrowRight, 
  Sparkles, Sliders, Check, Trash2, X, ChevronRight, Image as ImageIcon,
  Crown, Flower2, Glasses, Star, Heart, Smile, Wand2, Sparkle, SlidersHorizontal,
  Infinity as InfinityIcon, Type, ChevronDown, Zap, ZapOff, Eye
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useCamera } from '../../hooks/useCamera';
import { useFaceMesh } from '../../hooks/useFaceMesh';
import { useToast } from '../ui/Toast';
import { AR_ACCESSORIES, drawAccessoryOverlay } from '../../config/accessories';

const ACCESSORY_ICONS = {
  'none': { icon: Wand2, color: 'text-amber-200' },
  'royal-crown': { icon: Crown, color: 'text-amber-400' },
  'floral-tiara': { icon: Flower2, color: 'text-pink-300' },
  'gold-glasses': { icon: Glasses, color: 'text-amber-300' },
  'angel-halo': { icon: Star, color: 'text-yellow-300' },
  'pearl-ribbon': { icon: Sparkle, color: 'text-amber-200' },
  'heart-aura': { icon: Heart, color: 'text-rose-400 fill-rose-400/30' },
  'cat-ears': { icon: Smile, color: 'text-amber-300' },
};

const CAMERA_FILTERS = [
  { id: 'natural', label: 'NATURAL' },
  { id: 'soft-warm', label: 'SOFT WARM' },
  { id: 'mono-classic', label: 'MONO CLASSIC' },
  { id: 'vintage', label: 'VINTAGE' },
  { id: 'bright-glow', label: 'BRIGHT GLOW' },
];

const COLOR_THEMES = [
  { id: 'burgundy', name: 'Burgundy', hex: '#6B111F', textHex: '#F5D77F' },
  { id: 'ivory', name: 'Ivory', hex: '#FDFBF7', borderHex: '#E2DDD5', textHex: '#6B111F' },
  { id: 'slate', name: 'Slate', hex: '#2D3748', textHex: '#E2E8F0' },
  { id: 'blush', name: 'Blush', hex: '#F3C5CB', textHex: '#6B111F' },
  { id: 'antique', name: 'Antique', hex: '#C4A46C', textHex: '#FFFFFF' },
];

export default function StepCamera() {
  const { 
    targetPhotoCount, 
    stripColor, 
    selectedTimer, 
    guestName,
    guestMessage,
    addPhoto, 
    capturedPhotos, 
    setCapturedPhotos,
    setCurrentStep, 
    closeBooth 
  } = useBooth();

  const { start, stop, toggle } = useCamera();
  const { toast } = useToast();

  const videoRef = useRef(null);
  const viewportRef = useRef(null);
  const arCanvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const [captureMode, setCaptureMode] = useState('manual'); // 'manual' | 'auto'
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('natural');
  const [selectedAccessory, setSelectedAccessory] = useState('royal-crown'); // Default to Royal Crown
  const [controlTab, setControlTab] = useState('accessories'); // 'accessories' | 'filters'
  const [showPreviewModal, setShowPreviewModal] = useState(false); // Full photo strip preview modal
  const [showTooltip, setShowTooltip] = useState(true); // Pop-up speech bubble state above bottom left button
  const [facingMode, setFacingMode] = useState('user'); // 'user' | 'environment'

  const accessoryRefs = useRef({});
  const filterRefs = useRef({});

  // Active theme matched to the chosen stripColor
  const currentTheme = COLOR_THEMES.find(c => c.hex.toLowerCase() === (stripColor || '').toLowerCase()) || COLOR_THEMES[0];
  const isLight = currentTheme.hex === '#FDFBF7' || currentTheme.hex === '#F3C5CB';

  // Real-time 60 FPS FaceMesh Tracking
  const { facesRef, isReady: isFaceMeshReady } = useFaceMesh(videoRef, selectedAccessory !== 'none');

  // Auto-show pop-up tooltip whenever new photos exist
  useEffect(() => {
    if (capturedPhotos.length > 0) {
      setShowTooltip(true);
    }
  }, [capturedPhotos.length]);

  // Smoothly center the active AR accessory or tone filter in the carousel view (Instagram Style)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (controlTab === 'accessories' && selectedAccessory) {
        const el = accessoryRefs.current[selectedAccessory];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      } else if (controlTab === 'filters' && selectedFilter) {
        const el = filterRefs.current[selectedFilter];
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [selectedAccessory, selectedFilter, controlTab]);

  // Initialize camera
  const initCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await start('user');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setCameraError(true);
    }
  }, [start]);

  useEffect(() => {
    initCamera();
    return () => {
      stop();
    };
  }, [initCamera, stop]);

  // Keep Canvas resolution synchronized ONLY on resize
  useEffect(() => {
    const canvas = arCanvasRef.current;
    const vp = viewportRef.current;
    if (!canvas || !vp) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = vp.clientWidth || 360;
      const h = vp.clientHeight || 480;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(vp);

    return () => resizeObserver.disconnect();
  }, []);

  // Silky Smooth 60 FPS AR Face Tracking Render Loop
  useEffect(() => {
    const canvas = arCanvasRef.current;
    const vp = viewportRef.current;
    const video = videoRef.current;
    if (!canvas || !vp) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const displayW = vp.clientWidth || 360;
      const displayH = vp.clientHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, displayW, displayH);

        if (selectedAccessory && selectedAccessory !== 'none') {
          const vw = video?.videoWidth || 640;
          const vh = video?.videoHeight || 480;
          const currentFaces = facesRef.current || [];

          drawAccessoryOverlay(ctx, displayW, displayH, selectedAccessory, currentFaces, vw, vh);
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [selectedAccessory, facesRef]);

  // Photography filter CSS string
  const getFilterCss = () => {
    switch (selectedFilter) {
      case 'soft-warm':
        return 'sepia(20%) saturate(120%) brightness(105%) contrast(102%)';
      case 'mono-classic':
        return 'grayscale(100%) contrast(118%) brightness(98%)';
      case 'vintage':
        return 'sepia(35%) contrast(110%) saturate(120%) brightness(102%)';
      case 'bright-glow':
        return 'brightness(112%) contrast(104%) saturate(112%)';
      default:
        return 'brightness(103%) contrast(102%) saturate(105%)';
    }
  };

  // Capture single photo from viewfinder with EXACT WYSIWYG object-cover crop + AR Face Tracking baked in
  const doCapture = useCallback(() => {
    const video = videoRef.current;
    const vp = viewportRef.current;
    if (!vp) return;

    const w = vp.clientWidth || 720;
    const h = vp.clientHeight || 960;

    const canvas = document.createElement('canvas');
    canvas.width = w * 2;
    canvas.height = h * 2;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.filter = getFilterCss();

    const vw = video?.videoWidth || 640;
    const vh = video?.videoHeight || 480;

    const isUserFacing = facingMode === 'user';

    if (video && video.videoWidth && video.videoHeight) {
      const scale = Math.max(canvas.width / vw, canvas.height / vh);
      const sWidth = canvas.width / scale;
      const sHeight = canvas.height / scale;
      const sx = (vw - sWidth) / 2;
      const sy = (vh - sHeight) / 2;

      ctx.save();
      if (isUserFacing) {
        ctx.scale(-1, 1);
        ctx.drawImage(video, sx, sy, sWidth, sHeight, -canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    } else if (video && video.srcObject) {
      ctx.save();
      if (isUserFacing) {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#1A050B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.filter = 'none';

    if (selectedAccessory && selectedAccessory !== 'none') {
      const currentFaces = facesRef.current || [];
      drawAccessoryOverlay(ctx, canvas.width, canvas.height, selectedAccessory, currentFaces, vw, vh);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    addPhoto({ dataUrl, canvas });

    // Shutter flash animation
    const flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;background:white;z-index:50;animation:flashOut 0.35s forwards;pointer-events:none;';
    vp.appendChild(flash);
    setTimeout(() => flash.remove(), 380);
  }, [selectedFilter, selectedAccessory, addPhoto, facesRef, facingMode]);

  // Automatically navigate to review step when target photos reached
  useEffect(() => {
    if (capturedPhotos.length >= targetPhotoCount && !capturing) {
      const timer = setTimeout(() => {
        stop();
        setCurrentStep('review');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [capturedPhotos.length, targetPhotoCount, capturing, stop, setCurrentStep]);

  // Handle Photo Delete inside preview modal
  const handleDeletePhoto = (index) => {
    const updated = capturedPhotos.filter((_, i) => i !== index);
    setCapturedPhotos(updated);
    if (updated.length === 0) {
      setShowPreviewModal(false);
    }
    toast(`Foto Pose ${index + 1} berhasil dihapus`, 'default');
  };

  // Shutter Trigger
  const handleShutterClick = async () => {
    if (capturing) return;

    if (capturedPhotos.length >= targetPhotoCount) {
      stop();
      setCurrentStep('review');
      return;
    }

    if (captureMode === 'manual') {
      setCapturing(true);
      for (let i = selectedTimer; i > 0; i--) {
        setCountdown(i);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);
      doCapture();
      setCapturing(false);
    } else {
      setCapturing(true);
      const remaining = targetPhotoCount - capturedPhotos.length;
      for (let shot = 0; shot < remaining; shot++) {
        for (let i = selectedTimer; i > 0; i--) {
          setCountdown(i);
          await new Promise(r => setTimeout(r, 1000));
        }
        setCountdown(null);
        doCapture();
        if (shot < remaining - 1) {
          await new Promise(r => setTimeout(r, 1200));
        }
      }
      setCapturing(false);
    }
  };

  const handleToggleCamera = async () => {
    try {
      const stream = await toggle();
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      toast('Gagal memutar kamera', 'error');
    }
  };

  const currentCount = capturedPhotos.length;
  const isComplete = currentCount >= targetPhotoCount;
  const nextPhotoNum = Math.min(targetPhotoCount, currentCount + 1);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] bg-black text-white select-none overflow-hidden flex flex-col justify-between p-1.5 sm:p-2.5 pb-[max(env(safe-area-inset-bottom),8px)] z-[100]">
      
      {/* ================= 🌟 ROMANTIC WEDDING STUDIO AMBIENT AURA 🌟 ================= */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-75 blur-[90px] transition-all duration-700"
        style={{
          background: `radial-gradient(circle at center, ${currentTheme.hex}CC 0%, rgba(138, 24, 40, 0.40) 50%, rgba(10, 5, 8, 0.95) 85%)`
        }}
      />

      {/* ================= 🌟 1. INSTAGRAM STORY TOP HEADER BAR 🌟 ================= */}
      <div className="relative z-30 flex items-center justify-between w-full max-w-md mx-auto flex-shrink-0 pt-1 px-2 pb-1">
        {/* Left: Close X Button */}
        <button
          onClick={() => { stop(); setCurrentStep('frames'); }}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:scale-90 transition cursor-pointer shadow-md"
          title="Tutup & Kembali"
        >
          <X size={20} />
        </button>

        {/* Center: Pose Counter Badge */}
        <div className="px-4 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-amber-200 text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center shadow-md">
          <span>POSE {nextPhotoNum} / {targetPhotoCount}</span>
        </div>

        {/* Right: Empty Spacer */}
        <div className="w-10 h-10 pointer-events-none" />
      </div>

      {/* ================= 🌟 2. INSTAGRAM STORY VIEWFINDER WITH ROMANTIC FRAME 🌟 ================= */}
      <div className="flex-1 min-h-0 w-full max-w-sm sm:max-w-md mx-auto relative flex flex-col justify-center items-center py-1 overflow-hidden z-10">
        
        {/* Snug & Comfortable Frame Viewport Container */}
        <div 
          style={{ 
            backgroundColor: currentTheme.hex,
            border: currentTheme.borderHex ? `2px solid ${currentTheme.borderHex}` : '1px solid rgba(255,255,255,0.15)'
          }}
          className="relative w-full h-[58vh] sm:h-[62vh] max-h-[520px] rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl shadow-black flex flex-col items-center justify-between transition-all duration-300 my-auto overflow-hidden"
        >
          
          {/* Top Calligraphy Sub-Header */}
          <div className="text-center pb-1.5 flex-shrink-0 z-10 w-full">
            <p 
              className="text-[8px] sm:text-[9.5px] font-mono font-bold uppercase tracking-widest"
              style={{ color: isLight ? '#8C7A6B' : (currentTheme.textHex || '#F5D77F') }}
            >
              ✦ THE WEDDING OF ✦
            </p>
          </div>

          {/* Center Cutout Window (Full-width WYSIWYG Camera Stream) */}
          <div 
            ref={viewportRef}
            className="relative flex-1 min-h-0 w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black shadow-inner flex items-center justify-center border border-black/40"
          >
            {/* Camera Video Stream */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none', filter: getFilterCss() }}
            />

            {/* Live 60 FPS AR Face-Tracked Canvas Overlay */}
            <canvas
              ref={arCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
            />

            {/* Camera Error / Fallback */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#120910] z-20">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-1.5">
                  <Camera size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-0.5">Kamera Tidak Tersedia</h4>
                <button
                  onClick={initCamera}
                  className="px-4 py-1 rounded-full border border-amber-500/50 bg-amber-950/40 text-amber-200 text-[10px] font-bold cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Countdown Large Numeral */}
            {countdown !== null && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                <span className="text-8xl font-black text-amber-300 animate-ping font-mono drop-shadow-2xl">
                  {countdown}
                </span>
              </div>
            )}

          </div>

          {/* Bottom Frame Chin Preview */}
          <div className="text-center pt-2 pb-0.5 flex-shrink-0 flex flex-col items-center w-full">
            <h3 
              style={{ 
                color: isLight ? '#3A2D28' : (currentTheme.textHex || '#F5D77F'),
                fontFamily: "'Alex Brush', 'Great Vibes', 'Playfair Display', cursive" 
              }}
              className="text-xs sm:text-sm font-serif italic leading-tight"
            >
              Sabrina & Raka
            </h3>
            <p 
              className="text-[7px] sm:text-[8px] font-mono tracking-widest mt-0.5"
              style={{ color: isLight ? '#8C7A6B' : 'rgba(245, 215, 127, 0.85)' }}
            >
              30 · 05 · 2026
            </p>
            <h4 
              style={{ color: isLight ? '#5A4A3E' : '#FFFFFF' }}
              className="text-[10px] sm:text-xs font-sans font-bold leading-tight mt-0.5 tracking-wide truncate max-w-full px-1"
            >
              {guestName && guestName.trim() ? guestName.trim() : 'Tamu Undangan (Kamu)'}
            </h4>
          </div>

        </div>

      </div>

      {/* ================= 🌟 3. INSTAGRAM STORY FILTER CIRCLES CAROUSEL 🌟 ================= */}
      <div className="relative z-30 flex flex-col items-center w-full max-w-md mx-auto flex-shrink-0 my-1">
        
        {/* Lens Carousel (Dynamic AR Lenses or Tone Filters) */}
        {controlTab === 'accessories' ? (
          <div className="w-full overflow-x-auto no-scrollbar py-2 flex justify-start items-center touch-pan-x snap-x snap-mandatory scroll-smooth">
            <div className="flex items-center gap-3.5 min-w-max px-[calc(50vw-28px)] sm:px-[calc(200px-28px)]">
              {AR_ACCESSORIES.map(acc => {
                const isActive = selectedAccessory === acc.id;
                const IconComp = ACCESSORY_ICONS[acc.id]?.icon || Crown;
                const iconColor = ACCESSORY_ICONS[acc.id]?.color || 'text-amber-300';
                return (
                  <button
                    key={acc.id}
                    ref={el => (accessoryRefs.current[acc.id] = el)}
                    onClick={() => {
                      setSelectedAccessory(acc.id);
                      if (isActive && !isComplete && !capturing) {
                        handleShutterClick();
                      }
                    }}
                    className={`flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer snap-center flex-shrink-0 ${
                      isActive ? 'scale-110 opacity-100 z-20' : 'scale-90 opacity-45 hover:opacity-85 hover:scale-100'
                    }`}
                  >
                    <div
                      className={`rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'w-14 h-14 sm:w-16 sm:h-16 ring-4 ring-white ring-offset-2 ring-offset-black bg-gradient-to-br from-amber-500/50 via-amber-600/60 to-rose-950/80 shadow-[0_0_30px_rgba(255,255,255,0.65)]'
                          : 'w-10 h-10 sm:w-11 sm:h-11 bg-black/70 border border-white/20'
                      }`}
                    >
                      <IconComp size={isActive ? 24 : 16} className={isActive ? 'text-white drop-shadow-lg' : iconColor} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar py-2 flex justify-start items-center touch-pan-x snap-x snap-mandatory scroll-smooth">
            <div className="flex items-center gap-3 min-w-max px-[calc(50vw-36px)] sm:px-[calc(200px-36px)]">
              {CAMERA_FILTERS.map(filter => {
                const isActive = selectedFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    ref={el => (filterRefs.current[filter.id] = el)}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`text-[10.5px] tracking-wider font-bold uppercase px-4 py-1.5 rounded-full backdrop-blur-md transition-all duration-300 cursor-pointer snap-center flex-shrink-0 ${
                      isActive
                        ? 'border-2 border-white ring-2 ring-amber-300 bg-gradient-to-r from-amber-900/90 to-rose-900/90 text-white shadow-[0_0_20px_rgba(255,255,255,0.5)] scale-110 opacity-100'
                        : 'bg-black/70 border border-white/20 text-gray-400 hover:text-white opacity-50 scale-95'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ================= 🌟 4. INSTAGRAM BOTTOM CONTROL DOCK WITH POP-UP SPEECH BUBBLE 🌟 ================= */}
      <div className="relative z-30 w-full max-w-md mx-auto pt-1 pb-1 px-2 flex items-center justify-between gap-3 flex-shrink-0">
        
        {/* Left: Gallery Thumbnail Card with Floating Pop-up Bubble */}
        <div className="relative flex-shrink-0">
          
          {/* 🌟 POP-UP SPEECH BUBBLE TOOLTIP ("Lihat preview foto Anda di sini") 🌟 */}
          {capturedPhotos.length > 0 && showTooltip && (
            <div className="absolute -top-13 -left-1 z-50 animate-bounce pointer-events-auto flex flex-col items-start min-w-max">
              <button
                onClick={() => {
                  setShowPreviewModal(true);
                }}
                className="bg-[#1C0D17]/95 border border-amber-400/90 text-amber-200 px-3 py-1.5 rounded-xl shadow-[0_4px_25px_rgba(245,215,127,0.4)] text-[11px] font-bold flex items-center gap-1.5 cursor-pointer hover:scale-105 transition backdrop-blur-md"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Lihat preview foto anda disini 📸</span>
                <ChevronRight size={12} className="text-amber-300 ml-0.5" />
              </button>
              {/* Downward triangle tail */}
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-amber-400/90 ml-5 -mt-[1px]" />
            </div>
          )}

          <button
            onClick={() => {
              setShowPreviewModal(true);
            }}
            className="w-11 h-11 rounded-xl bg-[#1C1C1E] border border-amber-400/50 overflow-hidden flex items-center justify-center text-white text-xs font-mono font-bold shadow-lg active:scale-95 transition cursor-pointer relative group"
            title="Buka Preview Foto & Strip"
          >
            {capturedPhotos.length > 0 ? (
              <>
                <img 
                  src={capturedPhotos[capturedPhotos.length - 1].dataUrl} 
                  alt="Hasil Foto" 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300" 
                />
                {/* Counter Pill Badge */}
                <div className="absolute bottom-0 right-0 bg-amber-400 text-black text-[8px] font-black px-1 py-0.1 rounded-tl-md font-mono shadow-sm">
                  {capturedPhotos.length}/{targetPhotoCount}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-amber-300 font-mono">0/{targetPhotoCount}</span>
              </div>
            )}
          </button>
        </div>

        {/* Center: Instagram Info Pill (Filter Name display & Reset X) */}
        <div className="flex-1 bg-[#1C1C1E] border border-white/15 rounded-full px-3 py-2 flex items-center justify-between text-xs text-white shadow-lg max-w-[210px] min-w-0">
          <span className="font-bold text-[11px] uppercase tracking-wider text-amber-100 truncate flex-1 text-center pl-2">
            {controlTab === 'accessories' 
              ? (AR_ACCESSORIES.find(a => a.id === selectedAccessory)?.name || 'N.O.W')
              : (CAMERA_FILTERS.find(f => f.id === selectedFilter)?.label || 'NATURAL')
            }
          </span>

          <button 
            onClick={() => {
              setSelectedAccessory('none');
              setSelectedFilter('natural');
            }}
            className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white/80 transition flex-shrink-0 ml-1 cursor-pointer"
            title="Reset Filter"
          >
            <X size={12} />
          </button>
        </div>

        {/* Right: Next / Proceed Button or Flip Camera */}
        {isComplete ? (
          <button
            onClick={() => { stop(); setCurrentStep('review'); }}
            className="w-11 h-11 rounded-full bg-[#6B111F] border border-amber-400/60 text-amber-200 flex items-center justify-center shadow-lg active:scale-95 transition cursor-pointer flex-shrink-0"
            title="Lanjut ke Peninjauan"
          >
            <ArrowRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleToggleCamera}
            className="w-11 h-11 rounded-full bg-[#1C1C1E] border border-white/20 text-white flex items-center justify-center shadow-lg active:scale-90 transition cursor-pointer flex-shrink-0"
            title="Putar Kamera"
          >
            <RefreshCw size={18} />
          </button>
        )}

      </div>

      {/* ================= 🌟 5. VERTICAL PHOTO STRIP PREVIEW MODAL 🌟 ================= */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[160] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-xs sm:max-w-sm rounded-2xl bg-[#170A12] border border-amber-400/40 p-4 text-white shadow-2xl flex flex-col items-center gap-3 max-h-[92vh] overflow-y-auto no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between w-full pb-2 border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-xs font-serif font-bold text-amber-300 uppercase tracking-widest">
                  Preview Strip Foto
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {capturedPhotos.length} dari {targetPhotoCount} Pose Terambil
                </span>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition cursor-pointer"
                title="Tutup Preview"
              >
                <X size={16} />
              </button>
            </div>

            {/* Photo Strip Miniature Vertical Preview (Matching Real Photobooth Output Strip) */}
            <div 
              style={{ backgroundColor: currentTheme.hex }}
              className="w-44 xs:w-48 sm:w-52 rounded-2xl p-3 border border-white/20 shadow-2xl flex flex-col justify-between transition-all my-1"
            >
              {/* Strip Top Header */}
              <div className="text-center pb-1.5 border-b border-white/10">
                <p 
                  className="text-[6.5px] sm:text-[7.5px] font-serif font-bold uppercase tracking-wider"
                  style={{ color: isLight ? '#8C7A6B' : (currentTheme.textHex || '#F5D77F') }}
                >
                  ✦ THE WEDDING OF ✦
                </p>
                <h3 
                  style={{ 
                    color: isLight ? '#3A2D28' : (currentTheme.textHex || '#F5D77F'),
                    fontFamily: "'Alex Brush', 'Great Vibes', cursive" 
                  }}
                  className="text-xs sm:text-sm font-serif italic leading-none mt-0.5"
                >
                  Sabrina & Raka
                </h3>
              </div>

              {/* Vertical Stack of Photo Slots */}
              <div className="flex flex-col gap-2 py-2 max-h-[360px] overflow-y-auto no-scrollbar">
                {Array.from({ length: targetPhotoCount }).map((_, idx) => {
                  const photo = capturedPhotos[idx];
                  return (
                    <div
                      key={idx}
                      className={`relative w-full rounded-lg overflow-hidden border border-black/80 bg-black/40 shadow-inner flex-shrink-0 ${
                        targetPhotoCount === 1 ? 'aspect-[4/5]' : 'aspect-[3/4]'
                      }`}
                    >
                      {photo ? (
                        <>
                          <img 
                            src={photo.dataUrl} 
                            alt={`Pose ${idx + 1}`} 
                            className="w-full h-full object-cover object-center" 
                          />
                          {/* Pose Badge Top Left */}
                          <div className="absolute top-1.5 left-1.5 bg-black/70 text-amber-200 text-[8px] font-bold px-1.5 py-0.5 rounded-full font-mono z-20">
                            Pose {idx + 1}
                          </div>
                          {/* Trash Icon Button Top Right for Direct Deletion */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhoto(idx);
                            }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 border border-white text-white flex items-center justify-center text-xs font-bold shadow-lg active:scale-90 transition cursor-pointer z-30"
                            title="Hapus foto ini"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-2">
                          <Camera size={16} className="opacity-40 mb-1 text-white" />
                          <span className="text-[9px] font-mono text-gray-300">Pose {idx + 1}</span>
                          <span className="text-[8px] text-amber-300/80 mt-0.5 font-sans">Belum difoto</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Strip Footer */}
              <div className="text-center pt-2 border-t border-white/10">
                <h4 
                  style={{ color: isLight ? '#5A4A3E' : '#FFFFFF' }}
                  className="text-[10px] font-sans font-bold leading-tight truncate px-1"
                >
                  {guestName && guestName.trim() ? guestName.trim() : 'Tamu Undangan (Kamu)'}
                </h4>
                <p 
                  className="text-[7px] font-mono tracking-widest mt-0.5"
                  style={{ color: isLight ? '#8C7A6B' : 'rgba(245, 215, 127, 0.85)' }}
                >
                  30 · 05 · 2026
                </p>
              </div>
            </div>

            {/* Modal Bottom Action Button */}
            <div className="w-full pt-1">
              {!isComplete ? (
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
                >
                  <Camera size={14} />
                  <span>Lanjut Foto Pose {nextPhotoNum}</span>
                </button>
              ) : (
                <button
                  onClick={() => { stop(); setCurrentStep('review'); }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
                >
                  <Check size={14} />
                  <span>Selesai & Lihat Strip</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}