import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Check, RotateCw, ZoomIn, ZoomOut, Move, Crop, RefreshCw
} from 'lucide-react';

const ASPECT_RATIOS = [
  { id: '16:9', name: '16:9 Landscape', ratio: 16 / 9, desc: 'Mendatar / Layar Lebar' },
  { id: '4:3', name: '4:3 Landscape', ratio: 4 / 3, desc: 'Standar Kamera' },
  { id: '3:4', name: '3:4 Portrait', ratio: 3 / 4, desc: 'Tegak / Layar HP' },
  { id: '1:1', name: '1:1 Persegi', ratio: 1 / 1, desc: 'Bujur Sangkar' },
  { id: '9:16', name: '9:16 Story', ratio: 9 / 16, desc: 'Layar Penuh HP' },
];

export default function PhotoCropModal({ 
  isOpen, 
  imageUrl, 
  onCropComplete, 
  onCancel,
  title = "Sesuaikan / Crop Foto Pengantin"
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [selectedRatioId, setSelectedRatioId] = useState('3:4');
  
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const initialPinchDistRef = useRef(null);
  const initialZoomRef = useRef(1);

  // Selected aspect ratio object
  const currentRatioObj = ASPECT_RATIOS.find(r => r.id === selectedRatioId) || ASPECT_RATIOS[0];

  // Calculate box dimensions inside viewport based on container width & ratio
  const [boxSize, setBoxSize] = useState({ width: 270, height: 360 });

  // Reset state when new image opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setImgLoaded(false);
    }
  }, [isOpen, imageUrl]);

  // Adjust box dimensions based on screen size and selected ratio
  useEffect(() => {
    const updateSize = () => {
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      
      // Maximum bounds available for the crop box
      const maxW = Math.min(screenW - 48, 360);
      const maxH = Math.min(screenH - 300, 440);

      const r = currentRatioObj.ratio;
      let w = maxW;
      let h = w / r;

      if (h > maxH) {
        h = maxH;
        w = h * r;
      }

      setBoxSize({ width: Math.round(w), height: Math.round(h) });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [currentRatioObj]);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });
    setImgLoaded(true);
    // If photo is landscape, default to 16:9 or 4:3
    if (naturalWidth > naturalHeight) {
      setSelectedRatioId('16:9');
    } else {
      setSelectedRatioId('3:4');
    }
  };

  // Base rendered image dimensions to cover the crop box
  const getBaseRenderSize = useCallback(() => {
    if (!imgDimensions.width || !imgDimensions.height) return { w: boxSize.width, h: boxSize.height };
    
    // Check if rotation swaps aspect
    const isRotated = rotation === 90 || rotation === 270;
    const effectiveW = isRotated ? imgDimensions.height : imgDimensions.width;
    const effectiveH = isRotated ? imgDimensions.width : imgDimensions.height;

    const scaleToCover = Math.max(boxSize.width / effectiveW, boxSize.height / effectiveH);
    return {
      w: Math.round(imgDimensions.width * scaleToCover),
      h: Math.round(imgDimensions.height * scaleToCover)
    };
  }, [imgDimensions, boxSize, rotation]);

  // Pointer / Touch drag handling
  const handlePointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const dx = e.clientX - lastPointerPosRef.current.x;
    const dy = e.clientY - lastPointerPosRef.current.y;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    setPan(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Touch Pinch-to-zoom handling for mobile
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      initialPinchDistRef.current = dist;
      initialZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialPinchDistRef.current) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = dist / initialPinchDistRef.current;
      const newZoom = Math.min(3, Math.max(1, initialZoomRef.current * factor));
      setZoom(Number(newZoom.toFixed(2)));
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistRef.current = null;
  };

  // Rotate 90° Clockwise
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    setPan({ x: 0, y: 0 }); // Re-center
  };

  // Reset to default
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // High-Resolution Export
  const handleApplyCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    // Export Resolution: target 1200px width for HD crisp display
    const exportW = 1200;
    const exportH = Math.round(exportW / currentRatioObj.ratio);

    const canvas = document.createElement('canvas');
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const baseSize = getBaseRenderSize();
    const factor = exportW / boxSize.width;

    ctx.save();
    // Move to center of canvas + applied pan
    ctx.translate(exportW / 2 + pan.x * factor, exportH / 2 + pan.y * factor);
    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);
    // Apply zoom
    ctx.scale(zoom, zoom);

    // Draw image centered
    const drawW = baseSize.w * factor;
    const drawH = baseSize.h * factor;
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    const croppedBase64 = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedBase64);
  };

  if (!isOpen || !imageUrl) return null;

  const baseSize = getBaseRenderSize();

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 select-none touch-none overflow-hidden">
      
      {/* ================= 🌟 TOP HEADER 🌟 ================= */}
      <div className="w-full max-w-lg flex items-center justify-between pb-2 border-b border-white/10 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Crop size={15} />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-serif font-bold text-white leading-tight">
              {title}
            </h3>
            <span className="text-[9.5px] font-mono text-gray-400 block">
              Geser foto & atur perbesaran untuk posisi terbaik
            </span>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-90"
        >
          <X size={16} />
        </button>
      </div>

      {/* ================= 🌟 CENTER INTERACTIVE CROP VIEWPORT 🌟 ================= */}
      <div 
        ref={containerRef}
        className="flex-1 w-full max-w-lg flex flex-col items-center justify-center relative py-2 overflow-hidden"
      >
        {/* Hidden original image for reference & drawing */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Source to crop"
          crossOrigin="anonymous"
          onLoad={handleImageLoad}
          className="hidden"
        />

        {/* The Crop Box Frame */}
        <div
          style={{ width: boxSize.width, height: boxSize.height }}
          className="relative rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_20px_rgba(245,215,127,0.25)] bg-[#11060D] cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Transforming Image Container */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`
            }}
          >
            <div
              style={{
                width: baseSize.w,
                height: baseSize.h,
                transform: `rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease-out'
              }}
              className="flex items-center justify-center flex-shrink-0"
            >
              <img
                src={imageUrl}
                alt="Crop preview"
                className="w-full h-full object-cover pointer-events-none select-none"
              />
            </div>
          </div>

          {/* Rule of Thirds Grid Guidelines */}
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10 opacity-30">
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-r border-b border-white" />
            <div className="border-b border-white" />
            <div className="border-r border-white" />
            <div className="border-r border-white" />
            <div />
          </div>

          {/* Corner Guides */}
          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-300 pointer-events-none z-10" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-300 pointer-events-none z-10" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-300 pointer-events-none z-10" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-300 pointer-events-none z-10" />

          {/* Touch Helper Badge */}
          <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none z-10">
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-mono text-amber-200/90 border border-white/10">
              ✦ Geser / Cubit layar untuk zoom ✦
            </span>
          </div>
        </div>
      </div>

      {/* ================= 🌟 BOTTOM TOOLBAR & CONTROLS 🌟 ================= */}
      <div className="w-full max-w-lg space-y-3 z-20 pt-2 border-t border-white/10">
        
        {/* Aspect Ratio Selector Pills */}
        <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {ASPECT_RATIOS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedRatioId(item.id);
                setPan({ x: 0, y: 0 });
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-serif font-bold transition whitespace-nowrap cursor-pointer ${
                selectedRatioId === item.id
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                  : 'bg-white/10 text-gray-300 hover:text-white'
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* Zoom & Rotate Controls */}
        <div className="flex items-center justify-between gap-3 bg-black/50 p-2 rounded-2xl border border-white/10">
          
          {/* Zoom Slider */}
          <div className="flex-1 flex items-center gap-2 px-2">
            <button
              onClick={() => setZoom(prev => Math.max(1, +(prev - 0.1).toFixed(2)))}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition"
              title="Perkecil"
            >
              <ZoomOut size={16} />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
            />

            <button
              onClick={() => setZoom(prev => Math.min(3, +(prev + 0.1).toFixed(2)))}
              className="p-1 rounded-lg text-gray-400 hover:text-white transition"
              title="Perbesar"
            >
              <ZoomIn size={16} />
            </button>

            <span className="text-[10px] font-mono text-amber-200 min-w-[32px] text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>

          <div className="w-[1px] h-6 bg-white/20" />

          {/* Rotate 90° Button */}
          <button
            onClick={handleRotate}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-xs font-serif flex items-center gap-1 transition active:scale-95 cursor-pointer"
            title="Putar 90 Derajat"
          >
            <RotateCw size={14} />
            <span className="text-[10px] font-mono">{rotation}°</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition"
            title="Reset Posisi & Zoom"
          >
            <RefreshCw size={14} />
          </button>

        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={onCancel}
            className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs font-serif font-bold transition active:scale-95 cursor-pointer"
          >
            Batal
          </button>

          <button
            onClick={() => onCropComplete(imageUrl)}
            className="py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-serif font-bold transition active:scale-95 cursor-pointer text-center px-1"
            title="Gunakan foto landscape/portrait asli tanpa crop"
          >
            Pakai Asli
          </button>

          <button
            onClick={handleApplyCrop}
            className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 text-black text-xs font-serif font-bold flex items-center justify-center gap-1 shadow-lg shadow-amber-400/25 active:scale-95 transition cursor-pointer"
          >
            <Check size={14} />
            <span>Terapkan</span>
          </button>
        </div>

      </div>

    </div>
  );
}
