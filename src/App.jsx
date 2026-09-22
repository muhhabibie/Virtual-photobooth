import Hero from './components/landing/Hero';
import EventGalleryFeed from './components/landing/EventGalleryFeed';
import HowItWorks from './components/landing/HowItWorks';
import PhotoboothModal from './components/photobooth/PhotoboothModal';
import FullGalleryModal from './components/gallery/FullGalleryModal';
import IntroSplashLoader from './components/ui/IntroSplashLoader';
import { PhotoboothProvider } from './context/PhotoboothContext';
import { ToastProvider } from './components/ui/Toast';

export default function App() {
  return (
    <ToastProvider>
      <PhotoboothProvider>
        <IntroSplashLoader />
        <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-rose-100 selection:text-[#6B111F]">
          <main>
            <Hero />
            <EventGalleryFeed />
            <HowItWorks />
          </main>
          <PhotoboothModal />
          <FullGalleryModal />
        </div>
      </PhotoboothProvider>
    </ToastProvider>
  );
}