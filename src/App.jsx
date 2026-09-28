import SirklenHeader from './components/landing/SirklenHeader';
import SirklenMasterLanding from './components/landing/SirklenMasterLanding';
import EventHero from './components/landing/EventHero';
import EventGalleryFeed from './components/landing/EventGalleryFeed';
import HowItWorks from './components/landing/HowItWorks';
import PhotoboothModal from './components/photobooth/PhotoboothModal';
import FullGalleryModal from './components/gallery/FullGalleryModal';
import AdminDashboardModal from './components/admin/AdminDashboardModal';
import IntroSplashLoader from './components/ui/IntroSplashLoader';
import { PhotoboothProvider, useBooth } from './context/PhotoboothContext';
import { ToastProvider } from './components/ui/Toast';

function AppContent() {
  const { activeEvent } = useBooth();

  return (
    <div className="min-h-screen bg-[#12070D] text-gray-100 font-sans selection:bg-rose-900 selection:text-amber-200">
      <SirklenHeader />
      
      <main>
        {activeEvent ? (
          <>
            <EventHero />
            <EventGalleryFeed />
            <HowItWorks />
          </>
        ) : (
          <SirklenMasterLanding />
        )}
      </main>

      <PhotoboothModal />
      <FullGalleryModal />
      <AdminDashboardModal />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <PhotoboothProvider>
        <IntroSplashLoader />
        <AppContent />
      </PhotoboothProvider>
    </ToastProvider>
  );
}