import React, { lazy, Suspense } from 'react';
import SirklenHeader from './components/landing/SirklenHeader';
import EventHero from './components/landing/EventHero';
import EventGalleryFeed from './components/landing/EventGalleryFeed';
import HowItWorks from './components/landing/HowItWorks';
import SirklenPricing from './components/landing/SirklenPricing';
import PhotoboothModal from './components/photobooth/PhotoboothModal';
import FullGalleryModal from './components/gallery/FullGalleryModal';
import InvalidCodePage from './components/ui/InvalidCodePage';
import IntroSplashLoader from './components/ui/IntroSplashLoader';
import { PhotoboothProvider, useBooth } from './context/PhotoboothContext';
import { ToastProvider } from './components/ui/Toast';

const AdminDashboardPage = lazy(() => import('./components/admin/AdminDashboardPage'));
const ClientSetupPage = lazy(() => import('./components/client/ClientSetupPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#12070D] flex flex-col items-center justify-center gap-3 text-amber-200 font-sans">
    <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs uppercase tracking-widest text-amber-200/60">Memuat Sistem Sirklen...</span>
  </div>
);

function AppContent() {
  const { activeEvent, currentRoute, isDemo } = useBooth();

  // 1. Client Setup Portal (/setup/:slug)
  if (currentRoute === 'setup') {
    return (
      <Suspense fallback={<PageLoader />}>
        <ClientSetupPage />
      </Suspense>
    );
  }

  // 2. Admin Portal (/admin)
  if (currentRoute === 'admin') {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminDashboardPage />
      </Suspense>
    );
  }

  // 3. Invalid Code / Scan QR Page (Root / without QR scan, or non-existent event slug)
  if (currentRoute === 'invalid' || !activeEvent) {
    return <InvalidCodePage />;
  }

  const isDemoMode = isDemo || Boolean(activeEvent?.isDemo) || activeEvent?.slug === 'demo' || activeEvent?.slug === 'sabrina-raka';

  // 4. Wedding Guest Photobooth Landing (/:slug)
  return (
    <div className="min-h-screen bg-[#12070D] text-gray-100 font-sans selection:bg-rose-900 selection:text-amber-200">
      <SirklenHeader />
      
      <main>
        <EventHero />
        <EventGalleryFeed />
        {isDemoMode && <SirklenPricing />}
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