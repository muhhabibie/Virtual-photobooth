import SirklenHeader from './components/landing/SirklenHeader';
import EventHero from './components/landing/EventHero';
import EventGalleryFeed from './components/landing/EventGalleryFeed';
import HowItWorks from './components/landing/HowItWorks';
import PhotoboothModal from './components/photobooth/PhotoboothModal';
import FullGalleryModal from './components/gallery/FullGalleryModal';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import ClientSetupPage from './components/client/ClientSetupPage';
import IntroSplashLoader from './components/ui/IntroSplashLoader';
import { PhotoboothProvider, useBooth } from './context/PhotoboothContext';
import { ToastProvider } from './components/ui/Toast';

function AppContent() {
  const { activeEvent, currentRoute } = useBooth();

  // 1. Client Setup Portal (/setup/:slug)
  if (currentRoute === 'setup') {
    return <ClientSetupPage />;
  }

  // 2. Admin Portal (/admin or root /)
  if (currentRoute === 'admin' || !activeEvent) {
    return <AdminDashboardPage />;
  }

  // 3. Wedding Guest Photobooth Landing (/:slug)
  return (
    <div className="min-h-screen bg-[#12070D] text-gray-100 font-sans selection:bg-rose-900 selection:text-amber-200">
      <SirklenHeader />
      
      <main>
        <EventHero />
        <EventGalleryFeed />
        <HowItWorks />
      </main>

      <PhotoboothModal />
      <FullGalleryModal />
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