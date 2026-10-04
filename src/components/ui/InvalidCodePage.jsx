import { motion } from 'framer-motion';
import { useBooth } from '../../context/PhotoboothContext';

export default function InvalidCodePage() {
  const { navigateToAdmin } = useBooth();

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 selection:bg-rose-100 selection:text-rose-900 relative font-sans">
      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full flex flex-col items-center text-center space-y-6"
      >
        {/* Broken Polaroid Photo Frame SVG Illustration */}
        <div className="relative w-48 h-56 flex items-center justify-center my-4">
          <svg 
            viewBox="0 0 200 240" 
            className="w-full h-full drop-shadow-md text-gray-400"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Outer Polaroid Frame */}
            <path d="M 30,20 L 170,20 L 170,220 L 30,220 Z" fill="white" stroke="#333" strokeWidth="2.5" />

            {/* Inner Photo Box */}
            <rect x="42" y="32" width="116" height="130" fill="#E5E7EB" stroke="#6B7280" strokeWidth="1.5" />

            {/* Broken Tear Line through Polaroid */}
            <path 
              d="M 100,20 L 112,60 L 88,95 L 115,135 L 85,175 L 105,220" 
              stroke="#111827" 
              strokeWidth="2" 
              strokeDasharray="4 3"
              fill="none" 
            />

            {/* Photo Tear Crack Effect Lines */}
            <path d="M 88,95 L 75,90" stroke="#9CA3AF" strokeWidth="1.5" />
            <path d="M 115,135 L 130,130" stroke="#9CA3AF" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Invalid Code
          </h1>
          <p className="text-gray-500 text-base font-normal">
            Please Scan the QR Code
          </p>
        </div>

        {/* Info Box */}
        <div className="pt-6 w-full">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700">Petunjuk Akses Photobooth:</p>
            <p>Silakan gunakan kamera HP Anda untuk memindai Meja QR Code yang disediakan oleh panitia / pengantin di lokasi acara.</p>
          </div>
        </div>

        {/* Discreet Link to Admin Portal */}
        <div className="pt-8">
          <button
            onClick={navigateToAdmin}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-4 cursor-pointer"
          >
            Masuk Portal Admin / Panitia
          </button>
        </div>
      </motion.div>
    </div>
  );
}
