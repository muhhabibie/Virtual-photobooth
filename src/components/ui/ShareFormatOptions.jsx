import { Image as ImageIcon, Video, MessageCircle, ChevronRight, Smartphone, Frame } from 'lucide-react';

/**
 * Shared Apple-style grouped option list for choosing social-ready share formats.
 */
export default function ShareFormatOptions({
  hasVoice = false,
  onSelectPhotoFormat,
  onSelectVoiceVideo,
  onSelectWhatsAppLink,
  onCancel,
  cancelLabel = 'Batal',
}) {
  const photoChoices = [
    {
      id: 'feed',
      title: 'Instagram Feed',
      badge: '4:5',
      subtitle: 'Anti-terpotong, pas di Feed & Carousel',
      Icon: Frame,
    },
    {
      id: 'story',
      title: 'Story IG & Status WA',
      badge: '9:16',
      subtitle: 'Foto layar penuh siap unggah Story',
      Icon: Smartphone,
    },
    {
      id: 'raw',
      title: 'Foto Strip Asli',
      badge: 'JPG HD',
      subtitle: 'Ukuran strip asli untuk Chat WA & cetak',
      Icon: ImageIcon,
    },
  ];

  return (
    <div className="space-y-2">
      {photoChoices.map(({ id, title, badge, subtitle, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelectPhotoFormat(id)}
          className="w-full p-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.10] active:scale-[0.98] border border-white/[0.08] transition flex items-center justify-between gap-3 text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-white/90 flex-shrink-0 group-hover:scale-105 transition">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-white">
                  {title}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white/[0.12] text-white/75">
                  {badge}
                </span>
              </div>
              <p className="text-[11px] text-white/50 truncate mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/40 group-hover:text-white flex-shrink-0 transition" />
        </button>
      ))}

      {hasVoice && (
        <button
          type="button"
          onClick={onSelectVoiceVideo}
          className="w-full p-3.5 rounded-2xl bg-white/[0.09] hover:bg-white/[0.14] active:scale-[0.98] border border-white/[0.16] transition flex items-center justify-between gap-3 text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white text-[#1C1C1E] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-sm">
              <Video size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-white">
                  Story IG + Audio Doa
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white text-[#1C1C1E]">
                  Video 9:16
                </span>
              </div>
              <p className="text-[11px] text-white/55 truncate mt-0.5">
                Video vertikal dengan rekaman suara
              </p>
            </div>
          </div>
          <ChevronRight size={16} className="text-white/60 group-hover:text-white flex-shrink-0 transition" />
        </button>
      )}

      <button
        type="button"
        onClick={onSelectWhatsAppLink}
        className="w-full p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] active:scale-[0.98] border border-white/[0.06] transition flex items-center justify-between gap-3 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/75 flex-shrink-0">
            <MessageCircle size={15} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-white/85">
              Kirim Link ke WhatsApp
            </span>
            <p className="text-[10.5px] text-white/45 truncate">
              Bagikan tautan galeri langsung via WA
            </p>
          </div>
        </div>
        <ChevronRight size={15} className="text-white/35 group-hover:text-white flex-shrink-0 transition" />
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="w-full py-2.5 rounded-xl text-xs font-medium text-white/50 hover:text-white/80 transition cursor-pointer text-center mt-1"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
