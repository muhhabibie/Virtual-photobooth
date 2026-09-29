import { useRef } from 'react';
import { Download, QrCode } from 'lucide-react';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function QRCodeCanvas({ url, displayName, size = 240, showDownload = true }) {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=6B111F&bgcolor=ffffff`;
  const containerRef = useRef(null);

  const handleDownload = async () => {
    try {
      const resp = await fetch(qrImageUrl);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `QR_Sirklen_${displayName.replace(/\s+/g, '_')}.png`;
      a.href = blobUrl;
      a.click();
    } catch (e) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-rose-100 shadow-xl max-w-xs text-center">
      
      {/* Brand Header on Card */}
      <div className="flex flex-col items-center">
        <img src={logoPhotobooth} alt="Sirklen Photo" className="w-8 h-8 object-contain mb-1" />
        <span className="text-[10px] font-mono tracking-widest text-[#6B111F] font-bold uppercase">
          PT SIRKLEN KREASI USAHA
        </span>
        <h4 className="text-base font-serif font-bold text-gray-900 mt-0.5">
          Sirklen Photo
        </h4>
        <p className="text-xs text-rose-800 font-serif italic mt-0.5">
          {displayName}
        </p>
      </div>

      {/* QR Code Container */}
      <div className="p-3 bg-gradient-to-br from-[#FDFBF7] to-amber-50/50 rounded-xl border border-amber-200/60 shadow-inner flex items-center justify-center relative">
        <img 
          src={qrImageUrl} 
          alt={`QR Code ${displayName}`} 
          className="w-48 h-48 object-contain rounded-lg shadow-sm"
        />
      </div>

      {/* Link text */}
      <div className="w-full bg-amber-50/60 border border-amber-200/50 rounded-lg py-1 px-2">
        <p className="text-[10px] font-mono text-gray-600 truncate">
          {url}
        </p>
      </div>

      {showDownload && (
        <button
          onClick={handleDownload}
          className="w-full py-2 rounded-xl bg-[#6B111F] hover:bg-[#520C16] text-[#F5D77F] text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
        >
          <Download size={14} />
          <span>Download Cetak QR Code</span>
        </button>
      )}

    </div>
  );
}
