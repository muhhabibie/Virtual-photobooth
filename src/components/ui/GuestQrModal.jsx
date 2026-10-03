import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Printer, Share2, Sparkles } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import QRCodeCanvas from './QRCodeCanvas';
import TentCardModal from './TentCardModal';

export default function GuestQrModal({ isOpen, onClose }) {
  const { activeEvent } = useBooth();
  const [showTentCard, setShowTentCard] = useState(false);

  if (!isOpen || !activeEvent) return null;

  const eventUrl = `${window.location.origin}/${activeEvent.slug}`;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none overflow-y-auto">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl p-5 sm:p-7 shadow-2xl text-white my-auto flex flex-col items-center"
          >
            
            {/* Top Modal Navigation Header */}
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <QrCode size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-amber-200">
                    Kode QR Acara
                  </h3>
                  <p className="text-[10px] font-mono text-stone-400">
                    {activeEvent.displayName}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white transition cursor-pointer"
                title="Tutup"
              >
                <X size={16} />
              </button>
            </div>

            {/* Aesthetic QR Canvas Component */}
            <div className="w-full py-2">
              <QRCodeCanvas
                event={activeEvent}
                url={eventUrl}
                displayName={activeEvent.displayName}
                showDownload={true}
                showOptions={true}
                onOpenTentCard={() => setShowTentCard(true)}
              />
            </div>

            {/* Card Meja Button Shortcut */}
            <div className="w-full mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Sparkles size={12} className="text-amber-400" />
                <span>Ingin cetak kartu meja event?</span>
              </span>
              <button
                onClick={() => setShowTentCard(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[11px] font-serif font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Printer size={13} />
                <span>Kartu Meja Tent Card</span>
              </button>
            </div>

          </motion.div>
        </div>
      </AnimatePresence>

      {/* Tent Card Modal Generator */}
      <TentCardModal
        isOpen={showTentCard}
        onClose={() => setShowTentCard(false)}
        event={activeEvent}
      />
    </>
  );
}
