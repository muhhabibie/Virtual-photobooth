import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';

export default function InvalidCodePage() {
  const { navigateToDemo } = useBooth();

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 flex flex-col items-center justify-center p-6 selection:bg-neutral-200 relative font-sans select-none">
      {/* Container */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-sm w-full flex flex-col items-center text-center"
      >
        {/* Clean Polaroid Photo Frame SVG Illustration */}
        <div className="relative w-40 h-48 flex items-center justify-center mb-5">
          <svg 
            viewBox="0 0 200 240" 
            className="w-full h-full drop-shadow-sm text-neutral-400"
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Outer Polaroid Frame */}
            <path d="M 30,20 L 170,20 L 170,220 L 30,220 Z" fill="white" stroke="#262626" strokeWidth="2.5" />

            {/* Inner Photo Box */}
            <rect x="42" y="32" width="116" height="130" fill="#F5F5F4" stroke="#78716C" strokeWidth="1.5" />

            {/* Broken Tear Line through Polaroid */}
            <path 
              d="M 100,20 L 112,60 L 88,95 L 115,135 L 85,175 L 105,220" 
              stroke="#1C1917" 
              strokeWidth="2" 
              strokeDasharray="4 3"
              fill="none" 
            />

            {/* Photo Tear Crack Effect Lines */}
            <path d="M 88,95 L 75,90" stroke="#A8A29E" strokeWidth="1.5" />
            <path d="M 115,135 L 130,130" stroke="#A8A29E" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Invalid Code
          </h1>
          <p className="text-neutral-500 text-sm font-normal">
            Please Scan the QR Code
          </p>
        </div>

        {/* Professional Action Button (Clean, No AI Sparkles) */}
        <div className="mt-7">
          <button
            onClick={navigateToDemo}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-medium tracking-wide shadow-sm hover:shadow transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <span>Coba Mode Demo</span>
            <ArrowRight size={14} className="text-neutral-400" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
