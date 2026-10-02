import { useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'default') => {
    const id = Date.now() + Math.random();
    // Keep max 1 active notification to prevent visual clutter
    setToasts(prev => [...prev.slice(-1), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
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
        className="fixed top-4 inset-x-0 z-[300] flex flex-col items-center pointer-events-none px-4"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.97 }}
              transition={{ 
                type: 'spring', 
                stiffness: 450, 
                damping: 32,
                mass: 0.7
              }}
              onClick={() => dismiss(t.id)}
              className="pointer-events-auto cursor-pointer select-none px-4 py-2 rounded-full bg-[#18181B]/95 backdrop-blur-xl border border-white/10 text-stone-200 text-xs font-normal tracking-wide shadow-[0_8px_24px_rgba(0,0,0,0.5)] active:scale-98 transition"
            >
              <span>{t.message}</span>
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