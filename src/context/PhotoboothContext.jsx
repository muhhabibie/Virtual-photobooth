import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { subscribeSubmissions, saveSubmission, getLocalSubmissions } from '../services/submissionService';
import { INITIAL_EVENTS, PACKAGES, DEFAULT_HERO_PHOTOS } from '../data/mockEvents';

const PhotoboothContext = createContext(null);

const EVENTS_STORAGE_KEY = 'sirklen_photo_events_db';

export function PhotoboothProvider({ children }) {
  // 1. Events Database State (Persisted in LocalStorage / Fallback to INITIAL_EVENTS)
  const [events, setEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : INITIAL_EVENTS;
    } catch (e) {
      return INITIAL_EVENTS;
    }
  });

  // Save events whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn("Failed to persist events:", e);
    }
  }, [events]);

  // 2. Active Slug Resolver (Reads path e.g. /sabrina-raka or query ?event=sabrina-raka)
  const [currentSlug, setCurrentSlug] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const querySlug = params.get('event') || params.get('slug') || params.get('e');
      if (querySlug) return querySlug.toLowerCase().trim();

      const path = window.location.pathname.replace(/^\//, '').toLowerCase().trim();
      return path && path !== 'admin' ? path : '';
    } catch (e) {
      return '';
    }
  });

  // Active Event Object
  const activeEvent = useMemo(() => {
    if (!currentSlug) return null;
    return events.find(evt => evt.slug.toLowerCase() === currentSlug) || null;
  }, [events, currentSlug]);

  // Expiry Check
  const isEventExpired = useMemo(() => {
    if (!activeEvent) return false;
    return Date.now() > activeEvent.expiresAt;
  }, [activeEvent]);

  // PIN Authentication State for Private Events
  const [authenticatedPins, setAuthenticatedPins] = useState({});

  const isPinAuthenticated = useMemo(() => {
    if (!activeEvent || !activeEvent.pin) return true;
    return !!authenticatedPins[activeEvent.id];
  }, [activeEvent, authenticatedPins]);

  const verifyEventPin = useCallback((pinInput) => {
    if (!activeEvent) return true;
    if (!activeEvent.pin || activeEvent.pin === pinInput) {
      setAuthenticatedPins(prev => ({ ...prev, [activeEvent.id]: true }));
      return true;
    }
    return false;
  }, [activeEvent]);

  // Admin Modal Open State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const openAdminModal = useCallback(() => setAdminModalOpen(true), []);
  const closeAdminModal = useCallback(() => setAdminModalOpen(false), []);

  // Navigation Helpers
  const navigateToSlug = useCallback((slug) => {
    setCurrentSlug(slug);
    try {
      const newUrl = `${window.location.origin}/?event=${slug}`;
      window.history.pushState({}, '', newUrl);
    } catch (e) {}
  }, []);

  const resetToMasterHome = useCallback(() => {
    setCurrentSlug('');
    try {
      window.history.pushState({}, '', window.location.origin);
    } catch (e) {}
  }, []);

  // Event Management (Create, Edit, Delete, Expire, Update Hero Photos)
  const createEvent = useCallback(({ groomName, brideName, slug, eventDate, package: pkgKey, pin, templateIds, heroPhotos }) => {
    const pkg = PACKAGES[pkgKey] || PACKAGES.standard;
    const activeDays = pkg.activeDays || 10;
    const now = Date.now();

    const newEvt = {
      id: `evt_${now}`,
      slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''),
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      displayName: `${brideName.trim()} & ${groomName.trim()}`,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      formattedDate: new Date(eventDate || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      venue: 'Wedding Venue',
      package: pkgKey,
      pin: pin || '',
      templateIds: templateIds || ['wedding-classic', 'gold-luxury'],
      heroPhotos: heroPhotos && heroPhotos.length > 0 ? heroPhotos : DEFAULT_HERO_PHOTOS,
      expiresAt: now + activeDays * 86400 * 1000,
      createdAt: now,
    };

    setEvents(prev => [newEvt, ...prev]);
    return newEvt;
  }, []);

  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  const toggleExpireEvent = useCallback((eventId) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const isNowExpired = Date.now() > e.expiresAt;
        return {
          ...e,
          expiresAt: isNowExpired ? Date.now() + 7 * 86400 * 1000 : Date.now() - 1000
        };
      }
      return e;
    }));
  }, []);

  const updateEventHeroPhotos = useCallback((eventId, newPhotoUrls) => {
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          heroPhotos: newPhotoUrls
        };
      }
      return e;
    }));
  }, []);

  // 3. Guest Info & Photobooth State
  const [guestName, setGuestName] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlName = params.get('to') || params.get('name') || params.get('guest') || params.get('u');
      return urlName ? decodeURIComponent(urlName.replace(/\+/g, ' ')).trim() : '';
    } catch (e) {
      return '';
    }
  });

  const [guestMessage, setGuestMessage] = useState('');
  const [targetPhotoCount, setTargetPhotoCount] = useState(4);
  const [stripColor, setStripColor] = useState('#6B111F');
  const [stripColorName, setStripColorName] = useState('Burgundy');

  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [selectedTimer, setSelectedTimer] = useState(3);

  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);

  const [boothOpen, setBoothOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState('frames');

  const addPhoto = useCallback((photoData) => {
    setCapturedPhotos(prev => {
      const next = [...prev, photoData];
      setSelectedPhotoIndex(next.length - 1);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlName = params.get('to') || params.get('name') || params.get('guest') || params.get('u');
      setGuestName(urlName ? decodeURIComponent(urlName.replace(/\+/g, ' ')).trim() : '');
    } catch (e) {
      setGuestName('');
    }
    setGuestMessage('');
    setStripColor('#6B111F');
    setStripColorName('Burgundy');
    setSelectedFrameIndex(0);
    setSelectedTimer(3);
    setCapturedPhotos([]);
    setSelectedPhotoIndex(0);
    setVoiceBlob(null);
    setVoiceUrl(null);
    setCurrentStep('frames');
  }, []);

  const openBooth = useCallback(() => {
    if (isEventExpired) return;
    setBoothOpen(true);
    setCurrentStep('frames');
  }, [isEventExpired]);

  const closeBooth = useCallback(() => {
    setBoothOpen(false);
  }, []);

  const openGalleryModal = useCallback(() => {
    setGalleryModalOpen(true);
  }, []);

  const closeGalleryModal = useCallback(() => {
    setGalleryModalOpen(false);
  }, []);

  // 4. Submissions Real-time Database
  const [savedSubmissions, setSavedSubmissions] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeSubmissions((items) => {
      setSavedSubmissions(items);
    });
    return () => unsubscribe();
  }, []);

  const submitSession = useCallback(async () => {
    if (capturedPhotos.length === 0 || isEventExpired) return null;
    const result = await saveSubmission({
      eventId: activeEvent?.id || 'master',
      eventSlug: activeEvent?.slug || currentSlug || 'master',
      guestName: guestName || activeEvent?.displayName || 'Tamu Undangan',
      guestMessage,
      photos: capturedPhotos,
      stripColor,
      voiceBlob,
      voiceUrl
    });
    setSavedSubmissions(getLocalSubmissions());
    return result;
  }, [capturedPhotos, isEventExpired, activeEvent, currentSlug, guestName, guestMessage, stripColor, voiceBlob, voiceUrl]);

  return (
    <PhotoboothContext.Provider value={{
      events,
      currentSlug,
      activeEvent,
      isEventExpired,
      isPinAuthenticated,
      verifyEventPin,
      adminModalOpen,
      openAdminModal,
      closeAdminModal,
      navigateToSlug,
      resetToMasterHome,
      createEvent,
      deleteEvent,
      toggleExpireEvent,
      updateEventHeroPhotos,

      guestName, setGuestName,
      guestMessage, setGuestMessage,
      targetPhotoCount, setTargetPhotoCount,
      stripColor, setStripColor,
      stripColorName, setStripColorName,
      selectedFrameIndex, setSelectedFrameIndex,
      selectedTimer, setSelectedTimer,
      capturedPhotos, addPhoto, setCapturedPhotos,
      selectedPhotoIndex, setSelectedPhotoIndex,
      voiceBlob, setVoiceBlob,
      voiceUrl, setVoiceUrl,
      savedSubmissions, submitSession,
      boothOpen, setBoothOpen, openBooth, closeBooth,
      galleryModalOpen, openGalleryModal, closeGalleryModal,
      currentStep, setCurrentStep,
      reset,
    }}>
      {children}
    </PhotoboothContext.Provider>
  );
}

export function useBooth() {
  const ctx = useContext(PhotoboothContext);
  if (!ctx) throw new Error('useBooth must be used within PhotoboothProvider');
  return ctx;
}