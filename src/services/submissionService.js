// Service to handle saving and subscribing to photo submissions
// Supports both Firebase Cloud Persistence (Multi-device Realtime) & LocalStorage Fallback

import { db, storage } from '../config/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';

const LOCAL_STORAGE_KEY = 'wedding_photobooth_submissions';

// Helper to get local submissions
export function getLocalSubmissions() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// Helper to save submission to LocalStorage
export function saveLocalSubmission(submission) {
  try {
    const existing = getLocalSubmissions();
    const updated = [submission, ...existing];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
    return [];
  }
}

// Save submission (Cloud Firebase + LocalStorage fallback)
export async function saveSubmission({ guestName, guestMessage, photos, stripColor, voiceBlob, voiceUrl }) {
  const newSubmission = {
    id: `sub_${Date.now()}`,
    guestName: guestName || 'Tamu Undangan',
    message: guestMessage || '',
    photos: photos.map(p => typeof p === 'string' ? p : p.dataUrl),
    shortDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    takenDate: new Date().toLocaleString('id-ID'),
    colorHex: stripColor || '#6B111F',
    textHex: stripColor === '#FDFBF7' || stripColor === '#F3C5CB' ? '#6B111F' : '#F5D77F',
    hasVoice: !!(voiceBlob || voiceUrl),
    voiceUrl: voiceUrl || null,
    createdAt: Date.now(),
  };

  // Always save to LocalStorage first
  saveLocalSubmission(newSubmission);

  // If Firebase Database (Firestore) is initialized, sync to Cloud
  if (db) {
    try {
      let uploadedPhotoUrls = newSubmission.photos;

      // Try uploading to Storage if enabled
      if (storage) {
        try {
          const cloudUrls = [];
          for (let i = 0; i < photos.length; i++) {
            const photoData = typeof photos[i] === 'string' ? photos[i] : photos[i].dataUrl;
            const photoRef = ref(storage, `photos/${newSubmission.id}_${i}.jpg`);
            await uploadString(photoRef, photoData, 'data_url');
            const downloadUrl = await getDownloadURL(photoRef);
            cloudUrls.push(downloadUrl);
          }
          if (cloudUrls.length === photos.length) {
            uploadedPhotoUrls = cloudUrls;
          }
        } catch (stErr) {
          console.warn("Storage upload bypassed, storing direct dataUrl in Firestore:", stErr);
        }
      }

      const cloudDoc = {
        guestName: newSubmission.guestName,
        message: newSubmission.message,
        photos: uploadedPhotoUrls,
        shortDate: newSubmission.shortDate,
        takenDate: newSubmission.takenDate,
        colorHex: newSubmission.colorHex,
        textHex: newSubmission.textHex,
        hasVoice: !!newSubmission.voiceUrl,
        voiceUrl: newSubmission.voiceUrl,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'submissions'), cloudDoc);
    } catch (err) {
      console.warn("Firebase cloud save fallback to local:", err);
    }
  }

  return newSubmission;
}

// Subscribe to real-time submissions stream
export function subscribeSubmissions(callback) {
  if (db) {
    try {
      const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const cloudData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const localData = getLocalSubmissions();
        const merged = [...cloudData, ...localData];
        callback(merged);
      }, (err) => {
        console.warn("Firestore subscription error:", err);
        callback(getLocalSubmissions());
      });
    } catch (e) {
      callback(getLocalSubmissions());
      return () => {};
    }
  } else {
    callback(getLocalSubmissions());
    return () => {};
  }
}
