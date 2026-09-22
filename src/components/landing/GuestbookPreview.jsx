import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, Camera, Volume2, Sparkles, MessageCircle, Star, ThumbsUp, ChevronRight, Heart } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';

const REVIEWS_ROW_1 = [
  { name: 'Andi Prasetyo', time: '2 Hari yang Lalu', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', text: 'Selamat menempuh hidup baru Sabrina & Raka! Hasil fotonya estetik banget dengan bingkai wedding burgundy ✨', helpful: 45, tag: 'Royal Wedding' },
  { name: 'Siti Rahmawati', time: 'Kemarin', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', text: 'Terharu banget bisa ninggalin doa lewat pesan suara. Semoga langgeng dan samawa till jannah yaa 💕', helpful: 38, tag: 'Floral Romance' },
  { name: 'Dimas Kurniawan', time: '3 Hari yang Lalu', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', text: 'Praktis banget tinggal scan QR dari undangan atau meja resepsi langsung foto dengan filter iPhone! ⭐⭐⭐⭐⭐', helpful: 52, tag: 'Wedding Strip' },
  { name: 'Naufal & Sarah', time: '1 Hari yang Lalu', avatar: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=150&auto=format&fit=crop&q=80', text: 'Happy wedding sahabatku! Suka banget sama fitur filter glow dan hasil cetak 4-cutnya!', helpful: 64, tag: 'Gold Luxury' },
];

const REVIEWS_ROW_2 = [
  { name: 'Alifia Zahra', time: '4 Hari yang Lalu', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', text: 'Kualitas fotonya jernih banget saat didownload. Semoga Sabrina & Raka bahagia selalu! 🌸', helpful: 29, tag: 'Blush Romance' },
  { name: 'Budi Santoso', time: '5 Hari yang Lalu', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', text: 'Buku tamu digitalnya keren banget! Suara doa dari semua teman tersimpan abadi 💍', helpful: 41, tag: 'Doa Suara' },
  { name: 'Rina Kartika', time: '2 Hari yang Lalu', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', text: 'Filter Black & White weddingnya mewah banget! Happy Wedding Sabrina & Raka! 🎉', helpful: 33, tag: 'Classic Noir' },
  { name: 'Farhan Maulana', time: 'Seminggu yang Lalu', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', text: 'Semua tamu di meja kami heboh berfoto bareng. Sukses acaranya dan selamat berbahagia! 🥂', helpful: 50, tag: 'Wedding Guest' },
];

const romanticTransition = {
  duration: 1.1,
  ease: [0.22, 1, 0.36, 1],
};

function ReviewCard({ review }) {
  return (
    <div className="w-80 bg-white rounded-2xl p-4 shadow-sm border border-rose-100 flex flex-col justify-between flex-shrink-0 mx-2 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <img src={review.avatar} alt={review.name} className="w-8 h-8 rounded-full object-cover border border-rose-200 shadow-2xs" />
            <div>
              <h4 className="font-bold text-gray-900 text-xs leading-tight">{review.name}</h4>
              <span className="text-[10px] text-gray-400">{review.time}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#8A1828] bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-mono">
            {review.tag}
          </span>
        </div>

        {/* 5 Stars */}
        <div className="flex text-amber-400 text-xs gap-0.5 mb-1.5">
          {'★★★★★'}
        </div>

        {/* Review text */}
        <p className="text-gray-700 text-xs leading-relaxed line-clamp-3 italic">
          "{review.text}"
        </p>
      </div>

      {/* Helpful tag */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-2.5 pt-2 border-t border-gray-100">
        <Heart size={11} className="text-[#8A1828] fill-[#8A1828]" />
        <span><b>{review.helpful}</b> orang terharu dengan doa ini</span>
      </div>
    </div>
  );
}

export default function GuestbookPreview() {
  const { openBooth } = useBooth();

  return (
    <section id="guestbook" className="py-20 bg-rose-50/30 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* Section Header with Bi-directional Smooth Fade & Rise */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={romanticTransition}
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4"
        >
          <div>
            <span className="inline-block bg-rose-100 text-[#8A1828] text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full mb-2 font-mono">
              Doa & Ucapan Tamu Undangan
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Cerita & Doa untuk Sabrina & Raka 💍
            </h2>
          </div>
          <button
            onClick={openBooth}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8A1828] hover:text-rose-950 bg-white hover:bg-rose-50 border border-rose-200 px-5 py-2.5 rounded-full transition-all self-start md:self-auto shadow-xs"
          >
            <span>Kirim Doa Sekarang</span>
            <ChevronRight size={16} />
          </button>
        </motion.div>

        {/* 2-Row Horizontal Auto-Sliding Reviews */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={romanticTransition}
          className="flex flex-col gap-3.5 overflow-hidden -mx-5 px-5"
        >
          {/* Row 1 - Sliding Right to Left */}
          <div className="marquee-track-h cursor-pointer">
            {[...REVIEWS_ROW_1, ...REVIEWS_ROW_1].map((r, i) => (
              <ReviewCard key={i} review={r} />
            ))}
          </div>

          {/* Row 2 - Sliding Reverse */}
          <div className="marquee-track-h-rev cursor-pointer">
            {[...REVIEWS_ROW_2, ...REVIEWS_ROW_2].map((r, i) => (
              <ReviewCard key={i} review={r} />
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}