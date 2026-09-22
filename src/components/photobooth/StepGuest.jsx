import { UserCircle, ArrowRight } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { useToast } from '../ui/Toast';

export default function StepGuest() {
  const { guestName, setGuestName, guestMessage, setGuestMessage, setCurrentStep } = useBooth();
  const { toast } = useToast();

  const handleNext = () => {
    if (!guestName.trim()) {
      toast('Masukkan nama kamu dulu ya!', 'error');
      return;
    }
    setCurrentStep('frames');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[480px] p-6 max-w-md mx-auto w-full">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center mb-5 shadow-lg shadow-pink-500/30">
        <UserCircle size={36} className="text-white" />
      </div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Halo! Siapa Kamu? 👋</h2>
      <p className="text-gray-500 text-center mb-8 text-sm leading-relaxed">
        Isi data diri singkat untuk melengkapi foto dan pesanmu di guestbook.
      </p>

      <div className="w-full space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Nama Lengkap <span className="text-pink-500">*</span>
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="Contoh: Naufal / Sarah..."
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleNext()}
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            Pesan / Doa Ucapan <span className="text-gray-400 font-normal">(opsional)</span>
          </label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Tulis ucapan selamat atau doa terbaikmu..."
            value={guestMessage}
            onChange={e => setGuestMessage(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={handleNext}
        className="btn-pink w-full mt-8 !py-3.5 text-base justify-center shadow-lg shadow-pink-500/25"
      >
        <span>Lanjut Pilih Bingkai</span>
      </button>
    </div>
  );
}