import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { subscribeSubmissions, saveSubmission, getLocalSubmissions } from '../services/submissionService';
import { syncEventToCloud, subscribeCloudEvents, saveLocalEvents } from '../services/eventService';
import { INITIAL_EVENTS, PACKAGES, DEFAULT_HERO_PHOTOS, DEMO_EVENT } from '../data/mockEvents';
import { renderMasterPhotoStrip } from '../utils/stripRenderer';

const PhotoboothContext = createContext(null);

const EVENTS_STORAGE_KEY = 'sirklen_photo_events_db';

export function PhotoboothProvider({ children }) {
  // 1. Events Database State (Persisted in LocalStorage / Fallback to INITIAL_EVENTS)
  const [events, setEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
      let parsed = raw ? JSON.parse(raw) : INITIAL_EVENTS;

      const initialMap = new Map(INITIAL_EVENTS.map(e => [e.slug.toLowerCase(), e]));

      let updated = parsed.map(evt => {
        const initMatch = initialMap.get((evt.slug || '').toLowerCase());
        if (initMatch) {
          return {
            ...initMatch,
            ...evt,
            eventType: evt.eventType || initMatch.eventType,
            displayName: evt.displayName || initMatch.displayName,
            eventName: evt.eventName || initMatch.eventName,
            heroPhotos: (evt.heroPhotos && evt.heroPhotos.length > 0) ? evt.heroPhotos : initMatch.heroPhotos,
            customFrame: evt.customFrame || initMatch.customFrame || null,
          };
        }
        return evt;
      });

      const existingSlugs = new Set(updated.map(e => (e.slug || '').toLowerCase()));
      INITIAL_EVENTS.forEach(initEvt => {
        if (!existingSlugs.has(initEvt.slug.toLowerCase())) {
          updated.push(initEvt);
        }
      });

      return updated.map(evt => {
        if (evt.groomName && evt.brideName && evt.displayName === `${evt.brideName} & ${evt.groomName}`) {
          return { ...evt, displayName: `${evt.groomName} & ${evt.brideName}` };
        }
        return evt;
      });
    } catch (e) {
      return INITIAL_EVENTS;
    }
  });

  // Save events to local storage whenever updated
  useEffect(() => {
    saveLocalEvents(events);
  }, [events]);

  // Subscribe to real-time events stream from Cloud Firestore (cross-device sync)
  useEffect(() => {
    const unsubscribe = subscribeCloudEvents((cloudEvents) => {
      setEvents(prev => {
        const cloudMap = new Map(cloudEvents.map(c => [c.slug.toLowerCase(), c]));
        let hasChanges = false;
        const merged = prev.map(evt => {
          const match = cloudMap.get(evt.slug.toLowerCase());
          if (match) {
            hasChanges = true;
            return {
              ...evt,
              ...match,
              heroPhotos: (match.heroPhotos && match.heroPhotos.length > 0) ? match.heroPhotos : evt.heroPhotos,
            };
          }
          return evt;
        });

        cloudEvents.forEach(c => {
          if (!merged.some(e => e.slug.toLowerCase() === c.slug.toLowerCase())) {
            hasChanges = true;
            merged.push(c);
          }
        });

        if (hasChanges) {
          saveLocalEvents(merged);
          return merged;
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, []);

  // Intro Animation State for synchronizing staggered content reveals
  const [introReady, setIntroReady] = useState(false);
  const [introKey, setIntroKey] = useState(0);

  const replayIntro = useCallback(() => {
    setIntroReady(false);
    setIntroKey(prev => prev + 1);
  }, []);

  // 2. Multi-Route Architecture Resolver ('admin' | 'setup' | 'event' | 'invalid')
  const resolveRouteFromUrl = useCallback(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('admin') === '1') {
        return { route: 'admin', slug: '', isDemo: false };
      }
      const setupQuery = params.get('setup');
      if (setupQuery) {
        return { route: 'setup', slug: setupQuery.toLowerCase().trim(), isDemo: false };
      }
      const eventQuery = params.get('event') || params.get('slug') || params.get('e');
      if (eventQuery) {
        const cleanSlug = eventQuery.toLowerCase().trim();
        if (cleanSlug === 'demo') {
          return { route: 'event', slug: 'demo', isDemo: true };
        }
        return { route: 'event', slug: cleanSlug, isDemo: false };
      }

      const rawPath = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase().trim();
      if (rawPath === 'admin') {
        return { route: 'admin', slug: '', isDemo: false };
      }
      if (rawPath.startsWith('setup/')) {
        const setupSlug = rawPath.replace(/^setup\//, '').trim();
        return { route: 'setup', slug: setupSlug, isDemo: false };
      }

      // Root path '/' (sirklenice.com) or '/demo' is the DEMO MODE!
      // In Demo Mode: no database connection, running completely on local storage
      if (!rawPath || rawPath === 'demo') {
        return { route: 'event', slug: 'demo', isDemo: true };
      }

      // Real event route (e.g. /sabrina-raka, /pestapora)
      // Check if accessed with valid QR code scan:
      const hasQrParam = params.get('qr') === '1' || 
                         params.get('qr') === 'true' || 
                         params.get('source') === 'qr' || 
                         params.get('scan') === '1' || 
                         params.get('scan') === 'true' || 
                         params.has('code');

      let isSessionScanned = false;
      try {
        isSessionScanned = sessionStorage.getItem(`qr_scanned_${rawPath}`) === '1';
      } catch (e) {}

      if (hasQrParam) {
        try {
          sessionStorage.setItem(`qr_scanned_${rawPath}`, '1');
        } catch (e) {}
        return { route: 'event', slug: rawPath, isDemo: false };
      }

      if (isSessionScanned) {
        return { route: 'event', slug: rawPath, isDemo: false };
      }

      // If accessed directly without QR scan -> show InvalidCodePage ("Please Scan the QR Code")
      return { route: 'invalid', slug: rawPath, isDemo: false };
    } catch (e) {
      return { route: 'invalid', slug: '', isDemo: false };
    }
  }, []);

  const [routeState, setRouteState] = useState(resolveRouteFromUrl);

  // Sync with browser navigation (Back / Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(resolveRouteFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [resolveRouteFromUrl]);

  const currentRoute = routeState.route; // 'admin' | 'setup' | 'event' | 'invalid'
  const currentSlug = routeState.slug;
  const isDemo = routeState.isDemo || currentSlug === 'demo';

  // Active Event Object
  const activeEvent = useMemo(() => {
    if (isDemo || currentSlug === 'demo') {
      return DEMO_EVENT;
    }
    if (!currentSlug) return null;
    return events.find(evt => evt.slug.toLowerCase() === currentSlug) || null;
  }, [events, currentSlug, isDemo]);

  // Expiry Check
  const isEventExpired = useMemo(() => {
    if (isDemo) return false;
    if (!activeEvent) return false;
    return Date.now() > activeEvent.expiresAt;
  }, [activeEvent, isDemo]);

  // PIN Authentication State for Private Events
  const [authenticatedPins, setAuthenticatedPins] = useState({});

  const isPinAuthenticated = useMemo(() => {
    if (isDemo) return true;
    if (!activeEvent || !activeEvent.pin) return true;
    return !!authenticatedPins[activeEvent.id];
  }, [activeEvent, authenticatedPins, isDemo]);

  const verifyEventPin = useCallback((pinInput) => {
    if (isDemo || !activeEvent) return true;
    if (!activeEvent.pin || activeEvent.pin === pinInput) {
      setAuthenticatedPins(prev => ({ ...prev, [activeEvent.id]: true }));
      return true;
    }
    return false;
  }, [activeEvent, isDemo]);

  // Navigation Helpers (PushState with clean URL)
  const navigateToAdmin = useCallback(() => {
    setRouteState({ route: 'admin', slug: '', isDemo: false });
    try {
      window.history.pushState({}, '', '/admin');
    } catch (e) {}
  }, []);

  const navigateToSetup = useCallback((slug) => {
    const clean = (slug || '').toLowerCase().trim();
    setRouteState({ route: 'setup', slug: clean, isDemo: false });
    try {
      window.history.pushState({}, '', `/setup/${clean}`);
    } catch (e) {}
  }, []);

  const navigateToDemo = useCallback(() => {
    setRouteState({ route: 'event', slug: 'demo', isDemo: true });
    try {
      window.history.pushState({}, '', '/');
    } catch (e) {}
  }, []);

  const navigateToEvent = useCallback((slug, asQr = true) => {
    const clean = (slug || '').toLowerCase().trim();
    if (!clean || clean === 'demo') {
      navigateToDemo();
      return;
    }
    if (asQr) {
      try {
        sessionStorage.setItem(`qr_scanned_${clean}`, '1');
      } catch (e) {}
    }
    setRouteState({ route: 'event', slug: clean, isDemo: false });
    try {
      window.history.pushState({}, '', `/${clean}${asQr ? '?qr=1' : ''}`);
    } catch (e) {}
  }, [navigateToDemo]);

  const navigateToSlug = navigateToEvent;
  const resetToMasterHome = navigateToAdmin;

  // Backwards compatibility for Admin triggers
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const openAdminModal = useCallback(() => {
    navigateToAdmin();
  }, [navigateToAdmin]);
  const closeAdminModal = useCallback(() => {
    setAdminModalOpen(false);
  }, []);

  // Event Management (Create, Edit, Delete, Expire, Update Hero Photos)
  const createEvent = useCallback(({ 
    eventType = 'wedding',
    eventName = '',
    groomName = '', 
    brideName = '', 
    venue = '',
    slug, 
    eventDate, 
    package: pkgKey, 
    pin, 
    templateIds, 
    heroPhotos 
  }) => {
    const pkg = PACKAGES[pkgKey] || PACKAGES.standard;
    const activeDays = pkg.activeDays || 10;
    const now = Date.now();

    const isWedding = eventType === 'wedding';
    const cleanGroom = (groomName || '').trim();
    const cleanBride = (brideName || '').trim();
    const cleanEventName = (eventName || '').trim();
    
    let computedDisplayName = cleanEventName;
    if (isWedding) {
      computedDisplayName = (cleanGroom && cleanBride) 
        ? `${cleanGroom} & ${cleanBride}` 
        : (cleanEventName || cleanGroom || cleanBride || 'Mempelai');
    } else if (!computedDisplayName) {
      computedDisplayName = 'Special Event';
    }

    const newEvt = {
      id: `evt_${now}`,
      slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''),
      eventType: eventType || 'wedding',
      eventName: cleanEventName,
      groomName: cleanGroom,
      brideName: cleanBride,
      displayName: computedDisplayName,
      eventDate: eventDate || new Date().toISOString().split('T')[0],
      formattedDate: new Date(eventDate || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      venue: (venue || '').trim() || (isWedding ? 'Wedding Venue' : 'Event Venue'),
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
    setEvents(prev => {
      let updatedEvent = null;
      const next = prev.map(e => {
        if (e.id === eventId || e.slug === eventId) {
          updatedEvent = {
            ...e,
            heroPhotos: newPhotoUrls
          };
          return updatedEvent;
        }
        return e;
      });
      saveLocalEvents(next);
      if (updatedEvent) {
        syncEventToCloud(updatedEvent);
      }
      return next;
    });
  }, []);

  const updateEventConfig = useCallback((eventId, updates) => {
    setEvents(prev => {
      let updatedEvent = null;
      const next = prev.map(e => {
        if (e.id === eventId || e.slug === eventId) {
        const eventType = updates.eventType !== undefined ? updates.eventType : (e.eventType || 'wedding');
        const isWedding = eventType === 'wedding';
        const groom = updates.groomName !== undefined ? updates.groomName : (e.groomName || '');
        const bride = updates.brideName !== undefined ? updates.brideName : (e.brideName || '');
        const eventName = updates.eventName !== undefined ? updates.eventName : (e.eventName || '');
        const venue = updates.venue !== undefined ? updates.venue : (e.venue || '');

        let displayName = updates.displayName;
        if (!displayName) {
          if (isWedding && groom && bride) {
            displayName = `${groom} & ${bride}`;
          } else if (eventName) {
            displayName = eventName;
          } else {
            displayName = e.displayName;
          }
        }

        const eventDate = updates.eventDate !== undefined ? updates.eventDate : e.eventDate;
        const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : e.formattedDate;

        updatedEvent = {
          ...e,
          ...updates,
          eventType,
          eventName,
          groomName: groom,
          brideName: bride,
          venue,
          displayName,
          eventDate,
          formattedDate
        };
        return updatedEvent;
      }
      return e;
    });
    saveLocalEvents(next);
    if (updatedEvent) {
      syncEventToCloud(updatedEvent);
    }
    return next;
  });
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
  const [targetPhotoCount, setTargetPhotoCount] = useState(3);
  const [stripColor, setStripColor] = useState('#FFFFFF');
  const [stripColorName, setStripColorName] = useState('Botanical');

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
    setStripColor('#FFFFFF');
    setStripColorName('Botanical');
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
    const defaultBg = activeEvent?.customFrame?.bgColor || '#FFFFFF';
    setStripColor(defaultBg);
    setBoothOpen(true);
    setCurrentStep('frames');
  }, [isEventExpired, activeEvent]);

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
    if (isDemo) {
      // In Demo Mode: read exclusively from LocalStorage without connecting to Firestore
      const local = getLocalSubmissions().filter(s => s.eventSlug === 'demo' || s.isDemo);
      setSavedSubmissions(local);
      return;
    }

    const unsubscribe = subscribeSubmissions((items) => {
      setSavedSubmissions(items);
    });
    return () => unsubscribe();
  }, [isDemo]);

  const submitSession = useCallback(async (extraData = {}) => {
    if (capturedPhotos.length === 0 || isEventExpired) return null;

    let stripImage = extraData?.stripImage || null;
    if (!stripImage) {
      try {
        const offCanvas = document.createElement('canvas');
        renderMasterPhotoStrip(offCanvas, {
          photos: capturedPhotos,
          targetCount: capturedPhotos.length,
          stripColor,
          guestName,
          guestMessage,
          activeEvent,
          scale: 2,
        });
        stripImage = offCanvas.toDataURL('image/jpeg', 0.92);
      } catch (e) {
        console.warn('Failed to pre-render stripImage in submitSession:', e);
      }
    }

    const result = await saveSubmission({
      eventId: activeEvent?.id || (isDemo ? 'event_demo' : 'master'),
      eventSlug: activeEvent?.slug || currentSlug || (isDemo ? 'demo' : 'master'),
      guestName: guestName || activeEvent?.displayName || 'Tamu Undangan',
      guestMessage,
      photos: capturedPhotos,
      stripColor,
      stripImage,
      voiceBlob,
      voiceUrl,
      isDemo: isDemo,
    });
    const updatedLocal = getLocalSubmissions();
    if (isDemo) {
      setSavedSubmissions(updatedLocal.filter(s => s.eventSlug === 'demo' || s.isDemo));
    } else {
      setSavedSubmissions(updatedLocal);
    }
    return result;
  }, [capturedPhotos, isEventExpired, activeEvent, currentSlug, guestName, guestMessage, stripColor, voiceBlob, voiceUrl, isDemo]);

  return (
    <PhotoboothContext.Provider value={{
      events,
      currentRoute,
      currentSlug,
      isDemo,
      activeEvent,
      isEventExpired,
      isPinAuthenticated,
      verifyEventPin,
      adminModalOpen,
      openAdminModal,
      closeAdminModal,
      navigateToAdmin,
      navigateToSetup,
      navigateToDemo,
      navigateToEvent,
      navigateToSlug,
      resetToMasterHome,
      createEvent,
      deleteEvent,
      toggleExpireEvent,
      updateEventHeroPhotos,
      updateEventConfig,
      introReady,
      setIntroReady,
      introKey,
      replayIntro,

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
      customFrame: activeEvent?.customFrame || null,
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