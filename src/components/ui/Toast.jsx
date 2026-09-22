import { useState, createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'default') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const colors = {
    default: 'bg-[#1C1C1E]/95 border border-white/20 text-white',
    success: 'bg-[#122218]/95 border border-emerald-400/40 text-emerald-200',
    error: 'bg-[#261014]/95 border border-rose-500/40 text-rose-200',
    info: 'bg-[#1C0D17]/95 border border-amber-300/40 text-amber-200',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`${colors[t.type] || colors.default} backdrop-blur-md px-5 py-2.5 rounded-full text-xs font-medium font-sans tracking-wide shadow-2xl flex items-center gap-3 pointer-events-auto min-w-[220px] justify-between animate-fade-up`}
          >
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100 p-0.5 cursor-pointer">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx || { toast: (msg) => alert(msg) };
}