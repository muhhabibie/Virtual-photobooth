import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Camera, Sparkles, Image, Smartphone, Heart, ArrowRight } from 'lucide-react';
import { useBooth } from '../../context/PhotoboothContext';

const MORE_TOOLS = [
  'Vintage Photo Booth',
  'Pinboard - Collage Maker',
  'Glow Cam',
  'AI Hairstyle Changer',
  'Background Changer',
  'Pretty Scale',
  'AI Image Upscaler',
];

export default function Features() {
  const { openBooth } = useBooth();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="fitur" className="py-20 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-5">
        
        {/* Showcase Section: Free Photo Booth Camera At Your Comfort Home */}
        <div className="bg-gradient-to-r from-pink-100/60 via-purple-50/50 to-pink-50/70 rounded-3xl p-8 sm:p-14 mb-20 border border-pink-200/50 shadow-sm flex flex-col md:flex-row items-center gap-10">
          
          {/* Left: Overlapping Cute Polaroid Cards */}
          <div className="relative w-full md:w-1/2 flex justify-center items-center py-6">
            <div className="relative w-64 h-80">
              {/* Pink Card Behind */}
              <div className="absolute left-0 top-0 w-44 h-64 bg-pink-300 p-2.5 rounded-2xl shadow-xl transform -rotate-8 border-4 border-white">
                <div className="w-full h-44 rounded-xl overflow-hidden bg-white mb-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80" alt="Girl 1" className="w-full h-full object-cover" />
                </div>
                <div className="text-center text-white font-serif italic text-xs font-bold">Sweet Moments ♡</div>
              </div>

              {/* Purple Card In Front */}
              <div className="absolute right-0 bottom-0 w-48 h-68 bg-purple-400 p-2.5 rounded-2xl shadow-2xl transform rotate-6 border-4 border-white z-10">
                <div className="w-full h-48 rounded-xl overflow-hidden bg-white mb-2 relative">
                  <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80" alt="Girl 2" className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 text-base">✨</span>
                  <span className="absolute bottom-2 left-2 text-base">🌸</span>
                </div>
                <div className="text-center text-white font-bold text-xs tracking-wider">PRETTY PHOTO</div>
              </div>
            </div>
          </div>

          {/* Right: Description & Start Action */}
          <div className="w-full md:w-1/2 text-left">
            <span className="inline-block bg-pink-200/80 text-pink-700 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full mb-3">
              Aesthetic Life4Cuts
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight mb-4">
              Free Photo Booth Camera At Your Comfort Home
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
              Recreate the fun of traditional Korean 4-cut photobooth anywhere on your laptop or mobile phone. Mix and match filter tones, custom Canva borders, expressive stickers, and save voice messages as digital audio guestbooks.
            </p>
            <button
              onClick={openBooth}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-pink-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <Camera size={18} />
              <span>Try Photo Booth Free</span>
            </button>
          </div>

        </div>

        {/* Explore More Tools Section from Reference */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center pt-4"
        >
          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-6">
            Explore More Tools
          </h3>

          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {MORE_TOOLS.map((tool) => (
              <button
                key={tool}
                onClick={openBooth}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-pink-50 border border-gray-200/80 hover:border-pink-300 text-gray-700 hover:text-pink-600 font-semibold text-xs sm:text-sm shadow-xs transition-all transform hover:-translate-y-0.5"
              >
                {tool}
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}