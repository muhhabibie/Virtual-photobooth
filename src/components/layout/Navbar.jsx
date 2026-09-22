import { useState, useEffect } from 'react';
import { Camera, Sparkles, Heart } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { openBooth } = useBooth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-pink-100/80 py-3' 
        : 'bg-white/80 backdrop-blur-xs border-b border-gray-100/80 py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        
        {/* Brand Logo - Wedding Exclusive */}
        <div 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group" 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#8A1828] via-[#B8233C] to-[#E5C158] flex items-center justify-center shadow-md shadow-rose-900/20 text-white font-bold text-sm sm:text-base group-hover:scale-105 transition-transform flex-shrink-0">
            💍
          </div>
          <div className="flex flex-col">
            <span className="font-script text-xl sm:text-2xl text-[#8A1828] tracking-tight leading-none">
              Sabrina & Raka
            </span>
            <span className="text-[8px] sm:text-[9px] font-bold text-amber-700 tracking-wider uppercase font-mono mt-0.5">
              Photobooth & Guestbook
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
          <a href="#beranda" className="hover:text-[#8A1828] transition-colors">Beranda</a>
          <a href="#how-to" className="hover:text-[#8A1828] transition-colors">Cara Foto</a>
          <a href="#gallery-feed" className="text-[#8A1828] font-bold hover:text-rose-950 transition-colors flex items-center gap-1.5">
            <span>Buku Tamu Live</span>
            <span className="bg-[#8A1828] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-xs">LIVE</span>
          </a>
          <a href="#guestbook" className="hover:text-[#8A1828] transition-colors">Doa & Ucapan</a>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={openBooth}
            className="group relative inline-flex items-center gap-1.5 sm:gap-2 bg-[#8A1828] hover:bg-[#6B111F] text-white text-xs sm:text-sm font-extrabold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md hover:shadow-lg transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles size={13} className="text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>Mulai Foto</span>
          </button>
        </div>

      </div>
    </header>
  );
}