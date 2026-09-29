import { useState, useMemo } from 'react';
import { 
  X, Plus, Calendar, QrCode, Copy, Trash2, Check, Lock, 
  ExternalLink, Sparkles, Layers, ShieldCheck, Clock, Eye, AlertTriangle, RefreshCw, Image as ImageIcon, Upload
} from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';
import { PACKAGES, DEFAULT_HERO_PHOTOS } from '../../data/mockEvents';
import QRCodeCanvas from '../ui/QRCodeCanvas';
import { FRAMES } from '../../config/frames';
import logoPhotobooth from '../../assets/logo photobooth.png';

export default function AdminDashboardModal() {
  const { 
    adminModalOpen, 
    closeAdminModal, 
    events, 
    createEvent, 
    deleteEvent, 
    toggleExpireEvent,
    updateEventHeroPhotos,
    savedSubmissions,
    navigateToSlug
  } = useBooth();

  // Admin Security Authentication PIN State
  const [adminPinInput, setAdminPinInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Hero Photos Manager Modal State
  const [heroModalEvent, setHeroModalEvent] = useState(null);
  const [editHeroPhotos, setEditHeroPhotos] = useState([]);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');

  // Active Tab inside Dashboard: 'events' | 'qr' | 'templates' | 'submissions'
  const [activeTab, setActiveTab] = useState('events');

  // Form State for "Create Event"
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groomName, setGroomName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [eventPin, setEventPin] = useState('');
  const [selectedFrames, setSelectedFrames] = useState(['wedding-classic', 'gold-luxury']);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // Active Event for QR Code Inspector
  const [selectedQrEvent, setSelectedQrEvent] = useState(null);

  // Auto-generate slug when Groom/Bride names change
  const handleNameChange = (groom, bride) => {
    setGroomName(groom);
    setBrideName(bride);
    const cleanGroom = (groom || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const cleanBride = (bride || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (cleanGroom || cleanBride) {
      const generated = [cleanBride, cleanGroom].filter(Boolean).join('-');
      setEventSlug(generated);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === '1234' || adminPinInput === 'sirklen2026') {
      setIsAdminAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!groomName || !brideName || !eventSlug) return;

    const newEvt = createEvent({
      groomName,
      brideName,
      slug: eventSlug,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      package: selectedPackage,
      pin: eventPin,
      templateIds: selectedFrames,
    });

    setShowCreateModal(false);
    setGroomName('');
    setBrideName('');
    setEventSlug('');
    setEventPin('');
    setSelectedQrEvent(newEvt);
    setActiveTab('qr');
  };

  const handleCopyLink = (slug) => {
    const fullUrl = `${window.location.origin}/?event=${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  if (!adminModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none font-sans animate-fadeIn">
      
      <div className="w-full max-w-4xl bg-[#140810] border border-amber-400/30 rounded-3xl text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#1C0A15]/80 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white p-1 shadow flex items-center justify-center">
              <img src={logoPhotobooth} alt="Sirklen Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-amber-200">
                Dashboard Admin Sirklen Photo
              </h3>
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                PT Sirklen Kreasi Usaha • sirklen.my.id
              </p>
            </div>
          </div>

          <button
            onClick={closeAdminModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Security Login PIN Prompt */}
        {!isAdminAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center text-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-amber-400/50 flex items-center justify-center shadow-xl mb-4">
              <img src={logoPhotobooth} alt="Sirklen Logo" className="w-full h-full object-contain" />
            </div>

            <h3 className="text-xl font-serif font-bold text-white">
              Akses Portal Admin PT Sirklen Kreasi Usaha
            </h3>

            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Masukkan PIN Keamanan Admin untuk mengelola event, membuat QR Code, dan mengkonfigurasi paket.
            </p>

            <form onSubmit={handleAdminLogin} className="mt-6 w-full max-w-xs flex flex-col gap-3">
              <input
                type="password"
                placeholder="Masukkan PIN Admin (Default: 1234)"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-amber-400/40 text-center font-mono text-lg text-amber-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-300"
                autoFocus
              />

              {pinError && (
                <span className="text-xs text-rose-400 font-medium">
                  PIN salah! Gunakan PIN default: <code className="bg-black px-1.5 py-0.5 rounded text-amber-300">1234</code>
                </span>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6B111F] to-[#8A1828] text-amber-200 font-serif font-bold text-sm border border-amber-400/40 shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer"
              >
                Masuk ke Dashboard Admin
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs Bar */}
            <div className="px-5 py-2.5 bg-black/50 border-b border-white/10 flex items-center justify-between gap-2 flex-shrink-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'events'
                      ? 'bg-gradient-to-r from-[#6B111F] to-[#8A1828] text-amber-200 border border-amber-400/50 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Calendar size={13} />
                  <span>Daftar Event ({events.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('qr')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'qr'
                      ? 'bg-gradient-to-r from-[#6B111F] to-[#8A1828] text-amber-200 border border-amber-400/50 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <QrCode size={13} />
                  <span>Generator QR Code</span>
                </button>

                <button
                  onClick={() => setActiveTab('templates')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-serif font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'templates'
                      ? 'bg-gradient-to-r from-[#6B111F] to-[#8A1828] text-amber-200 border border-amber-400/50 shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Layers size={13} />
                  <span>Desain Frame ({FRAMES.length})</span>
                </button>
              </div>

              {/* Create Event Trigger */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition cursor-pointer flex-shrink-0"
              >
                <Plus size={14} />
                <span>Buat Event Baru</span>
              </button>
            </div>

            {/* Dashboard Content Body */}
            <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
              
              {/* TAB 1: EVENTS MANAGER */}
              {activeTab === 'events' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 font-mono">
                      Daftar seluruh event virtual photobooth di Sirklen Photo.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map((evt) => {
                      const isExpired = Date.now() > evt.expiresAt;
                      const pkgInfo = PACKAGES[evt.package] || PACKAGES.standard;
                      const evtSubmissions = savedSubmissions.filter(s => s.eventId === evt.id || !s.eventId);

                      return (
                        <div
                          key={evt.id}
                          className={`rounded-2xl p-4 border transition flex flex-col justify-between gap-3 ${
                            isExpired 
                              ? 'bg-black/40 border-rose-900/50 opacity-75' 
                              : 'bg-[#1D0C18]/90 border-amber-400/30 hover:border-amber-300'
                          }`}
                        >
                          <div>
                            {/* Card Top Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-base font-serif font-bold text-amber-200">
                                  {evt.displayName}
                                </h4>
                                <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                                  URL: <span className="text-amber-100 font-bold">sirklen.my.id/{evt.slug}</span>
                                </p>
                              </div>

                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                                isExpired
                                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              }`}>
                                {isExpired ? 'EXPIRED' : 'AKTIF'}
                              </span>
                            </div>

                            {/* Event Details Grid */}
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/10 font-sans">
                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase font-mono">Paket</span>
                                <span className="font-bold text-amber-300">{pkgInfo.name} ({pkgInfo.formattedPrice})</span>
                              </div>

                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase font-mono">Tanggal Acara</span>
                                <span className="text-white">{evt.formattedDate}</span>
                              </div>

                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase font-mono">Status Masa Aktif</span>
                                <span className={isExpired ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                                  {isExpired ? 'Kadaluarsa' : `${pkgInfo.activeDays} Hari Aktif`}
                                </span>
                              </div>

                              <div>
                                <span className="text-gray-400 block text-[9px] uppercase font-mono">PIN Private</span>
                                <span className="text-gray-300">{evt.pin ? `🔐 ${evt.pin}` : 'Public (Tanpa PIN)'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons Bar */}
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleCopyLink(evt.slug)}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                                title="Salin URL Event"
                              >
                                {copiedSlug === evt.slug ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                <span>{copiedSlug === evt.slug ? 'Tersalin!' : 'Salin URL'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedQrEvent(evt);
                                  setActiveTab('qr');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                                title="Lihat QR Code"
                              >
                                <QrCode size={11} />
                                <span>QR Code</span>
                              </button>

                              <button
                                onClick={() => {
                                  setHeroModalEvent(evt);
                                  setEditHeroPhotos(evt.heroPhotos || DEFAULT_HERO_PHOTOS);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border border-emerald-500/30"
                                title="Ubah Foto Background Hero Pengantin"
                              >
                                <ImageIcon size={11} />
                                <span>Foto Hero ({evt.heroPhotos?.length || DEFAULT_HERO_PHOTOS.length})</span>
                              </button>

                              <button
                                onClick={() => {
                                  closeAdminModal();
                                  navigateToSlug(evt.slug);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                                title="Buka Halaman Event"
                              >
                                <Eye size={11} />
                                <span>Buka Event</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => toggleExpireEvent(evt.id)}
                                className="p-1 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 transition cursor-pointer"
                                title={isExpired ? 'Aktifkan Kembali Event' : 'Paksa Expire Sekarang'}
                              >
                                <RefreshCw size={12} />
                              </button>

                              <button
                                onClick={() => deleteEvent(evt.id)}
                                className="p-1 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 transition cursor-pointer"
                                title="Hapus Event Ini"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: QR CODE GENERATOR */}
              {activeTab === 'qr' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-full max-w-md bg-black/40 p-4 rounded-2xl border border-white/10 text-center">
                    <label className="text-xs font-mono text-amber-200 uppercase font-bold block mb-2">
                      Pilih Event untuk Generate Kartu Cetak QR Code:
                    </label>
                    <select
                      value={selectedQrEvent?.id || ''}
                      onChange={(e) => {
                        const evt = events.find(item => item.id === e.target.value);
                        setSelectedQrEvent(evt);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1C0A15] border border-amber-400/40 text-amber-200 font-serif font-bold text-sm focus:outline-none"
                    >
                      <option value="">-- Pilih Event Wedding --</option>
                      {events.map(evt => (
                        <option key={evt.id} value={evt.id}>
                          {evt.displayName} (sirklen.my.id/{evt.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedQrEvent ? (
                    <div className="flex flex-col items-center gap-3">
                      <QRCodeCanvas
                        url={`${window.location.origin}/?event=${selectedQrEvent.slug}`}
                        displayName={selectedQrEvent.displayName}
                        size={260}
                        showDownload={true}
                      />

                      <div className="bg-black/50 p-4 rounded-2xl border border-amber-400/30 text-center max-w-sm">
                        <span className="text-xs font-serif font-bold text-amber-300 block mb-1">
                          Pilihan Kartu Cetak QR Code
                        </span>
                        <p className="text-[11px] text-gray-300 font-sans">
                          Paket <strong className="text-white">{selectedQrEvent.package.toUpperCase()}</strong> include{' '}
                          <strong className="text-amber-200">{PACKAGES[selectedQrEvent.package]?.qrCardsCount || 100} Lembar Kartu QR Code</strong> Siap Cetak untuk Meja Tamu.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 font-mono text-xs">
                      Silakan pilih event di atas untuk melihat preview QR Code.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CUSTOM TEMPLATES MANAGER */}
              {activeTab === 'templates' && (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400 font-mono">
                    Koleksi Desain Template Custom Frame yang Siap Diberikan Kepada Klien.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FRAMES.map((frm) => (
                      <div key={frm.id} className="bg-[#1C0A15] p-3 rounded-2xl border border-amber-400/20 text-center flex flex-col items-center justify-between">
                        <span className="text-2xl mb-1">{frm.name.split(' ')[0]}</span>
                        <span className="text-xs font-serif font-bold text-amber-200 truncate w-full">
                          {frm.name}
                        </span>
                        <span className="text-[9px] font-mono text-gray-400 mt-1 uppercase">
                          ID: {frm.id}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* CREATE EVENT MODAL OVERLAY */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[220] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1C0A15] border border-amber-400/50 rounded-3xl p-5 text-white shadow-2xl animate-scaleIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-serif font-bold text-amber-200">
                Buat Event Virtual Photobooth Baru
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs font-sans">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Nama Pengantin Pria & Wanita</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Pengantin Pria (ex: Raka)"
                    value={groomName}
                    onChange={(e) => handleNameChange(e.target.value, brideName)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-300"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nama Pengantin Wanita (ex: Sabrina)"
                    value={brideName}
                    onChange={(e) => handleNameChange(groomName, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">URL Slug (Otomatis)</label>
                <div className="flex items-center bg-black/60 border border-amber-400/40 rounded-xl px-3 py-2">
                  <span className="text-gray-400 font-mono text-[11px] flex-shrink-0">sirklen.my.id/</span>
                  <input
                    type="text"
                    value={eventSlug}
                    onChange={(e) => setEventSlug(e.target.value)}
                    className="w-full bg-transparent font-mono font-bold text-amber-200 focus:outline-none text-xs ml-1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Pilih Paket Layanan</label>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-amber-400/40 text-amber-200 font-serif font-bold text-xs focus:outline-none"
                >
                  <option value="basic">Paket Basic (Rp 300k - Aktif 7 Hari)</option>
                  <option value="standard">Paket Standard (Rp 400k - Aktif 10 Hari)</option>
                  <option value="all_in">Paket All-In (Rp 500k - Aktif 14 Hari)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Tanggal Pernikahan / Acara</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">PIN Akses Galeri (Opsional - Kosongkan jika Public)</label>
                <input
                  type="text"
                  placeholder="Contoh: 1234"
                  value={eventPin}
                  onChange={(e) => setEventPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-serif font-bold text-xs shadow-lg active:scale-95 transition cursor-pointer"
                >
                  Simpan & Generate Event
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* HERO PHOTOS MANAGER MODAL OVERLAY */}
      {heroModalEvent && (
        <div className="fixed inset-0 z-[230] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1C0A15] border border-amber-400/50 rounded-3xl p-5 text-white shadow-2xl animate-scaleIn flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-serif font-bold text-amber-200">
                  Ubah Foto Background Hero Pengantin
                </h3>
                <p className="text-[10px] font-mono text-gray-400">
                  {heroModalEvent.displayName} (sirklen.my.id/{heroModalEvent.slug})
                </p>
              </div>
              <button
                onClick={() => setHeroModalEvent(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Current Photos Grid */}
            <div>
              <label className="block text-xs font-mono text-gray-300 font-bold mb-2">
                Foto Carousel Hero saat ini ({editHeroPhotos.length} foto):
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {editHeroPhotos.map((url, idx) => (
                  <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-white/20 group">
                    <img src={url} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditHeroPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow hover:scale-110 transition cursor-pointer"
                      title="Hapus foto ini"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Photos (File Upload or URL Input) */}
            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-serif font-bold text-amber-300">
                Tambah Foto Pengantin Baru:
              </label>

              {/* Option A: File Upload */}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1">
                  1. Upload Foto dari HP / Laptop:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setEditHeroPhotos(prev => [...prev, evt.target.result]);
                        }
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="w-full text-xs text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400/20 file:text-amber-200 hover:file:bg-amber-400/30 cursor-pointer"
                />
              </div>

              {/* Option B: Image URL */}
              <div>
                <label className="block text-[10px] font-mono text-gray-400 mb-1">
                  2. Atau Masukkan URL Gambar Direct:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newPhotoUrlInput}
                    onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder:text-gray-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPhotoUrlInput.trim()) {
                        setEditHeroPhotos(prev => [...prev, newPhotoUrlInput.trim()]);
                        setNewPhotoUrlInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-200 border border-amber-400/40 text-xs font-bold hover:bg-amber-500/30 transition cursor-pointer flex-shrink-0"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Save */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setHeroModalEvent(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  updateEventHeroPhotos(heroModalEvent.id, editHeroPhotos);
                  setHeroModalEvent(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold shadow-lg cursor-pointer"
              >
                Simpan Perubahan Foto
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
