import { useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'default') => {
    const id = Date.now() + Math.random();
    // Keep max 2 active notifications to prevent visual clutter
    setToasts(prev => [...prev.slice(-1), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2800);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Top Center Notification Container (Slides Down from Top) */}
      <div 
        aria-live="polite"
        className="fixed top-4 inset-x-0 z-[300] flex flex-col items-center gap-2 pointer-events-none px-4"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ 
                type: 'spring', 
                stiffness: 450, 
                damping: 32,
                mass: 0.7
              }}
              onClick={() => dismiss(t.id)}
              className="pointer-events-auto cursor-pointer select-none max-w-sm w-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#18181B]/95 backdrop-blur-xl border border-white/12 text-stone-100 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:bg-[#202024] active:scale-98 transition-colors"
            >
              {/* Simple subtle icon indicator */}
              {t.type === 'success' && (
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={2.5} />
                </span>
              )}
              {t.type === 'error' && (
                <span className="w-5 h-5 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle size={12} strokeWidth={2.5} />
                </span>
              )}
              {t.type === 'info' && (
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
                  <Info size={12} strokeWidth={2.5} />
                </span>
              )}
              {t.type === 'default' && (
                <span className="w-2 h-2 rounded-full bg-white/60 shrink-0 mx-0.5" />
              )}

              {/* Toast Message */}
              <span className="text-xs font-medium text-stone-200 tracking-normal pr-1">
                {t.message}
              </span>

              {/* Subtle close button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(t.id);
                }}
                className="p-1 -mr-1 text-stone-400 hover:text-white rounded-full transition-colors cursor-pointer"
                aria-label="Tutup notifikasi"
              >
                <X size={11} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || { toast: (msg) => alert(msg) };
}