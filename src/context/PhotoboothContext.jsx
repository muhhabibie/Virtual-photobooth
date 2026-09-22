import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeSubmissions, saveSubmission, getLocalSubmissions } from '../services/submissionService';

const PhotoboothContext = createContext(null);

export function PhotoboothProvider({ children }) {
  // Guest info with automatic URL Parameter Detection (?to=Nama+Tamu or ?name=Nama)
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
  const [isUrlIdentified, setIsUrlIdentified] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return !!(params.get('to') || params.get('name') || params.get('guest') || params.get('u'));
    } catch (e) {
      return false;
    }
  });

  // Photo layout / count target: 1 (Single/Polaroid), 2 (Duo), 3 (Trio), 4 (Classic 4-Cut Strip)
  const [targetPhotoCount, setTargetPhotoCount] = useState(4);

  // Strip Color Theme: 'burgundy' | 'ivory' | 'slate' | 'blush' | 'antique'
  const [stripColor, setStripColor] = useState('#6B111F');
  const [stripColorName, setStripColorName] = useState('Burgundy');

  // Custom frame support
  const [customFrames, setCustomFrames] = useState([]);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);

  // Timer
  const [selectedTimer, setSelectedTimer] = useState(3);

  // Captured photos array: [{ dataUrl, canvas }]
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Voice note
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceUrl, setVoiceUrl] = useState(null);

  // Modal open state
  const [boothOpen, setBoothOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);

  // Current step: 'frames' | 'camera' | 'voice' | 'result'
  const [currentStep, setCurrentStep] = useState('frames');

  const addPhoto = useCallback((photoData) => {
    setCapturedPhotos(prev => {
      const next = [...prev, photoData];
      setSelectedPhotoIndex(next.length - 1);
      return next;
    });
  }, []);

  const addCustomFrame = useCallback((frameObj) => {
    setCustomFrames(prev => [...prev, frameObj]);
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
    setBoothOpen(true);
    setCurrentStep('frames');
  }, []);

  const closeBooth = useCallback(() => {
    setBoothOpen(false);
  }, []);

  const openGalleryModal = useCallback(() => {
    setGalleryModalOpen(true);
  }, []);

  const closeGalleryModal = useCallback(() => {
    setGalleryModalOpen(false);
  }, []);

  // Realtime Submissions state
  const [savedSubmissions, setSavedSubmissions] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeSubmissions((items) => {
      setSavedSubmissions(items);
    });
    return () => unsubscribe();
  }, []);

  const submitSession = useCallback(async () => {
    if (capturedPhotos.length === 0) return null;
    const result = await saveSubmission({
      guestName,
      guestMessage,
      photos: capturedPhotos,
      stripColor,
      voiceBlob,
      voiceUrl
    });
    setSavedSubmissions(getLocalSubmissions());
    return result;
  }, [guestName, guestMessage, capturedPhotos, stripColor, voiceBlob, voiceUrl]);

  return (
    <PhotoboothContext.Provider value={{
      guestName, setGuestName,
      guestMessage, setGuestMessage,
      isUrlIdentified,
      targetPhotoCount, setTargetPhotoCount,
      stripColor, setStripColor,
      stripColorName, setStripColorName,
      customFrames, addCustomFrame,
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