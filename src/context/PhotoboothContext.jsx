import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { subscribeSubmissions, saveSubmission, getLocalSubmissions, deleteSubmission as removeSubmissionService } from '../services/submissionService';
import { syncEventToCloud, subscribeCloudEvents, saveLocalEvents, deleteEventFromCloud } from '../services/eventService';
import { INITIAL_EVENTS, PACKAGES, DEFAULT_HERO_PHOTOS, DEMO_EVENT } from '../data/mockEvents';
import { renderMasterPhotoStrip, renderBotanicalWeddingStrip } from '../utils/stripRenderer';

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
      if (rawPath === 'setup' || rawPath.startsWith('setup/')) {
        const setupSlug = rawPath.replace(/^setup\/?/, '').trim();
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
      return { route: 'event', slug: rawPath, isDemo: false };
    } catch (e) {
      return { route: 'invalid', slug: '', isDemo: false };
    }
  }, []);

  const [routeState, setRouteState] = useState(resolveRouteFromUrl);

  // Browser navigation is handled comprehensively below with modal & photobooth step integration

  const currentRoute = routeState.route; // 'admin' | 'setup' | 'event' | 'invalid'
  const currentSlug = routeState.slug;
  const isDemo = routeState.isDemo || currentSlug === 'demo';

  // Active Event Object
  const activeEvent = useMemo(() => {
    if (isDemo || currentSlug === 'demo') {
      return DEMO_EVENT;
    }
    if (!currentSlug) return null;
    const found = events.find(evt => evt.slug.toLowerCase() === currentSlug.toLowerCase());
    if (!found && currentSlug.toLowerCase() === 'cfd') {
      return INITIAL_EVENTS.find(e => e.slug === 'cfd') || INITIAL_EVENTS[0];
    }
    return found || null;
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

    setEvents(prev => {
      const next = [newEvt, ...prev];
      saveLocalEvents(next);
      return next;
    });
    syncEventToCloud(newEvt);
    return newEvt;
  }, []);

  const deleteEvent = useCallback((eventId) => {
    setEvents(prev => {
      const target = prev.find(e => e.id === eventId);
      if (target?.slug) {
        deleteEventFromCloud(target.slug);
      }
      const next = prev.filter(e => e.id !== eventId);
      saveLocalEvents(next);
      return next;
    });
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

        const oldSlug = e.slug;
        const newSlug = updates.slug ? updates.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '') : oldSlug;
        if (oldSlug && newSlug && oldSlug !== newSlug) {
          deleteEventFromCloud(oldSlug);
        }
        updatedEvent = {
          ...e,
          ...updates,
          slug: newSlug,
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
  const [stripStyle, setStripStyle] = useState('standard'); // 'standard' | 'botanical-wedding'

  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [selectedTimer, setSelectedTimer] = useState(3);

  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const [boothOpen, setBoothOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [currentStep, setCurrentStepState] = useState('frames');
  const isPopstateHandlingRef = useRef(false);
  // Track how many history entries booth has pushed so closeBooth() can jump past them all
  const boothHistoryDepthRef = useRef(0);
  const isClosingBoothRef = useRef(false);

  // Initialize base state on mount if not already tagged
  useEffect(() => {
    try {
      if (!window.history.state || !window.history.state.__sirklen__) {
        window.history.replaceState({ __sirklen__: true, type: 'root' }, '');
      }
    } catch (e) {}
  }, []);

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
    setStripStyle('standard');
    setSelectedFrameIndex(0);
    setSelectedTimer(3);
    setCapturedPhotos([]);
    setSelectedPhotoIndex(0);
    setVoiceBlob(null);
    setVoiceUrl(null);
    setVoiceDuration(0);
    setCurrentStepState('frames');
  }, []);

  const openBooth = useCallback(() => {
    if (isEventExpired) return;
    isClosingBoothRef.current = false;
    const defaultBg = activeEvent?.customFrame?.bgColor || '#FFFFFF';
    setStripColor(defaultBg);
    setCapturedPhotos([]);        // Fresh session: clear previous photos!
    setSelectedPhotoIndex(0);
    setVoiceBlob(null);
    setVoiceUrl(null);
    setVoiceDuration(0);
    setBoothOpen(true);
    setCurrentStepState('frames');
    boothHistoryDepthRef.current = 1; // reset depth; 1 = the 'frames' entry we push below

    try {
      window.history.pushState({ __sirklen__: true, type: 'booth', step: 'frames' }, '');
    } catch (e) {}
  }, [isEventExpired, activeEvent]);

  const closeBooth = useCallback(() => {
    isClosingBoothRef.current = true;
    setBoothOpen(false);
    setCurrentStepState('frames'); // reset to frames for next session
    setCapturedPhotos([]);        // Reset photos so opening booth next time is fresh
    setSelectedPhotoIndex(0);
    setVoiceBlob(null);
    setVoiceUrl(null);
    setVoiceDuration(0);
    try {
      const depth = boothHistoryDepthRef.current;
      boothHistoryDepthRef.current = 0;
      if (depth > 0) {
        // Jump back past ALL booth history entries in one go
        window.history.go(-depth);
      } else if (window.history.state && window.history.state.type === 'booth') {
        window.history.back();
      }
    } catch (e) {}

    setTimeout(() => {
      isClosingBoothRef.current = false;
      setBoothOpen(false);
      setCurrentStepState('frames');
    }, 350);
  }, []);

  const setCurrentStep = useCallback((nextStep) => {
    setCurrentStepState(nextStep);
    if (!isPopstateHandlingRef.current) {
      try {
        window.history.pushState({ __sirklen__: true, type: 'booth', step: nextStep }, '');
        boothHistoryDepthRef.current += 1; // track depth so closeBooth can go(-depth)
      } catch (e) {}
    }
  }, []);

  // Step order: frames → camera → review → voice → result
  // Back order:  result → voice → review → camera → frames → dashboard(closeBooth)
  const goBack = useCallback(() => {
    try {
      window.history.back();
    } catch (e) {
      // Fallback if history API not available
      if (currentStep === 'result') setCurrentStepState('voice');
      else if (currentStep === 'voice') setCurrentStepState('review');
      else if (currentStep === 'review') setCurrentStepState('camera');
      else if (currentStep === 'camera') setCurrentStepState('frames');
      else closeBooth();
    }
  }, [currentStep, closeBooth]);

  const openGalleryModal = useCallback(() => {
    setGalleryModalOpen(true);
    try {
      window.history.pushState({ __sirklen__: true, type: 'gallery' }, '');
    } catch (e) {}
  }, []);

  const closeGalleryModal = useCallback(() => {
    setGalleryModalOpen(false);
    try {
      if (window.history.state && window.history.state.type === 'gallery') {
        window.history.back();
      }
    } catch (e) {}
  }, []);

  // Complete Browser Navigation Listener (Hardware Back Button / Gesture on Mobile)
  useEffect(() => {
    const handlePopState = (e) => {
      if (isClosingBoothRef.current) {
        setBoothOpen(false);
        setCurrentStepState('frames');
        return;
      }

      isPopstateHandlingRef.current = true;
      const state = e.state;

      if (state && state.__sirklen__) {
        if (state.type === 'booth') {
          // Guard: if state requests review/voice/result but no photos exist, default to frames
          const stepRequiresPhotos = state.step === 'review' || state.step === 'voice' || state.step === 'result';
          const safeStep = (stepRequiresPhotos && (!capturedPhotos || capturedPhotos.length === 0))
            ? 'frames'
            : (state.step || 'frames');

          setBoothOpen(true);
          setGalleryModalOpen(false);
          setCurrentStepState(safeStep);
        } else if (state.type === 'gallery') {
          setGalleryModalOpen(true);
          setBoothOpen(false);
        } else if (state.type === 'route') {
          setBoothOpen(false);
          setGalleryModalOpen(false);
          setCurrentStepState('frames');
          setRouteState(resolveRouteFromUrl());
        } else if (state.type === 'root') {
          setBoothOpen(false);
          setGalleryModalOpen(false);
          setCurrentStepState('frames');
          setRouteState(resolveRouteFromUrl());
        }
      } else {
        setBoothOpen(false);
        setGalleryModalOpen(false);
        setCurrentStepState('frames');
        boothHistoryDepthRef.current = 0; // booth fully exited via HW back
        setRouteState(resolveRouteFromUrl());
      }

      setTimeout(() => {
        isPopstateHandlingRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [resolveRouteFromUrl, capturedPhotos]);

  // 4. Submissions Real-time Database (Multi-Device Live Stream)
  const [savedSubmissions, setSavedSubmissions] = useState(() => getLocalSubmissions());

  useEffect(() => {
    // Always subscribe to live stream for real-time multi-device sync (HP <-> Laptop)
    const unsubscribe = subscribeSubmissions((items) => {
      setSavedSubmissions(items);
    });
    return () => unsubscribe();
  }, []);

  const submitSession = useCallback(async (extraData = {}) => {
    if (capturedPhotos.length === 0 || isEventExpired) return null;

    let stripImage = extraData?.stripImage || null;
    if (!stripImage) {
      try {
        const offCanvas = document.createElement('canvas');
        if (stripStyle === 'botanical-wedding') {
          renderBotanicalWeddingStrip(offCanvas, {
            photos: capturedPhotos,
            targetCount: capturedPhotos.length,
            guestName,
            guestMessage,
            activeEvent,
            scale: 2,
          });
        } else {
          renderMasterPhotoStrip(offCanvas, {
            photos: capturedPhotos,
            targetCount: capturedPhotos.length,
            stripColor,
            guestName,
            guestMessage,
            activeEvent,
            scale: 2,
          });
        }
        stripImage = offCanvas.toDataURL('image/jpeg', 0.88);
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
      stripStyle,
      stripImage,
      voiceBlob: extraData?.voiceBlob !== undefined ? extraData.voiceBlob : voiceBlob,
      voiceUrl: extraData?.voiceUrl !== undefined ? extraData.voiceUrl : voiceUrl,
      voiceDuration: extraData?.voiceDuration !== undefined ? extraData.voiceDuration : voiceDuration,
      isDemo: isDemo,
    });

    // Immediately update local React state with the newly created submission
    // This ensures visitor gallery updates IMMEDIATELY without waiting or requiring a manual page refresh!
    if (result) {
      setSavedSubmissions(prev => {
        const filtered = prev.filter(s => s.id !== result.id && s.id !== result.localId);
        return [result, ...filtered];
      });
    }

    return result;
  }, [capturedPhotos, isEventExpired, activeEvent, currentSlug, guestName, guestMessage, stripColor, stripStyle, voiceBlob, voiceUrl, voiceDuration, isDemo]);

  // Delete submission from local & cloud (with real-time multi-device sync)
  const deleteSubmission = useCallback(async (submissionId, localId) => {
    try {
      const targetId = submissionId || localId;
      const targetLocalId = localId || submissionId;

      if (typeof targetId === 'string' && (targetId.startsWith('mock_') || targetId.startsWith('user-latest') || targetId.startsWith('user-submission'))) {
        try {
          const raw = localStorage.getItem('sirklen_hidden_mock_submissions') || '[]';
          const list = JSON.parse(raw);
          if (!list.includes(targetId)) {
            list.push(targetId);
            localStorage.setItem('sirklen_hidden_mock_submissions', JSON.stringify(list));
          }
        } catch (e) {}
      }
      await removeSubmissionService(targetId, targetLocalId);
      setSavedSubmissions(prev => prev.filter(s => 
        s.id !== targetId && 
        s.id !== targetLocalId && 
        s.localId !== targetId && 
        s.localId !== targetLocalId
      ));
      return true;
    } catch (e) {
      console.error("Failed to delete submission:", e);
      return false;
    }
  }, []);

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
      stripStyle, setStripStyle,
      selectedFrameIndex, setSelectedFrameIndex,
      selectedTimer, setSelectedTimer,
      capturedPhotos, addPhoto, setCapturedPhotos,
      selectedPhotoIndex, setSelectedPhotoIndex,
      voiceBlob, setVoiceBlob,
      voiceUrl, setVoiceUrl,
      voiceDuration, setVoiceDuration,
      savedSubmissions, submitSession, deleteSubmission,
      boothOpen, setBoothOpen, openBooth, closeBooth, goBack,
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