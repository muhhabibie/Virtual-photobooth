// Service to handle saving and subscribing to photo submissions
// Supports both Firebase Cloud Persistence (Multi-device Realtime) & LocalStorage Fallback

import { db, storage } from '../config/firebase.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { ref, uploadString, uploadBytes, getDownloadURL } from 'firebase/storage';
import { compressImage } from '../utils/imageCompressor.js';

// Persist CORS-block flag in sessionStorage so fresh page loads skip Storage immediately
// without triggering preflight OPTIONS requests that always fail when CORS is not configured.
const _STORAGE_CORS_KEY = 'sirklen_storage_cors_blocked';
let isStorageDisabled = (() => {
  try { return sessionStorage.getItem(_STORAGE_CORS_KEY) === '1'; } catch(_) { return false; }
})();
let isSubmissionCloudQuotaExhausted = false;

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

// Helper to save submission to LocalStorage with automatic quota management (LRU Cache)
export function saveLocalSubmission(submission) {
  try {
    const existing = getLocalSubmissions();
    // Keep at most 30 recent items locally to avoid QuotaExceededError (5MB limit)
    const MAX_LOCAL_ITEMS = 30;
    const updated = [submission, ...existing.filter(item => item.id !== submission.id)].slice(0, MAX_LOCAL_ITEMS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    try {
      // Aggressive fallback pruning to 10 items if quota is tight
      const existing = getLocalSubmissions();
      const pruned = [submission, ...existing].slice(0, 10);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pruned));
      return pruned;
    } catch (err2) {
      console.warn("Storage quota limit reached, retaining submission in memory:", err2);
      return [submission];
    }
  }
}

// Helper to convert Blob to Base64 DataURL
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Save submission (Cloud Firebase + LocalStorage fallback)
export async function saveSubmission({ eventId, eventSlug, guestName, guestMessage, photos, stripColor, stripStyle, stripImage, voiceBlob, voiceUrl, voiceDuration, isDemo = false }) {
  let finalVoiceUrl = voiceUrl || null;
  if (voiceBlob) {
    try {
      finalVoiceUrl = await blobToBase64(voiceBlob);
    } catch (e) {
      console.warn("Failed to convert voice blob to base64:", e);
    }
  }

  // 1. Optimize and compress all photos first (~45-65KB per cut)
  // This prevents QuotaExceededError in mobile LocalStorage (5MB max) and guarantees Firestore docs remain well within 1MB.
  const rawPhotos = photos.map(p => typeof p === 'string' ? p : p.dataUrl);
  let compressedPhotos = rawPhotos;
  try {
    compressedPhotos = await Promise.all(
      rawPhotos.map(p => compressImage(p, 540, 0.78))
    );
  } catch (compErr) {
    console.warn("Photo compression fallback:", compErr);
  }

  // Also compress stripImage if present
  let compressedStripImage = stripImage;
  if (stripImage && typeof stripImage === 'string' && stripImage.startsWith('data:image')) {
    try {
      compressedStripImage = await compressImage(stripImage, 700, 0.80);
    } catch (_) {}
  }

  const submissionId = `sub_${Date.now()}`;
  const newSubmission = {
    id: submissionId,
    eventId: eventId || 'demo_event',
    eventSlug: eventSlug || 'demo',
    guestName: guestName || 'Tamu Undangan',
    message: guestMessage || '',
    photos: compressedPhotos,
    stripImage: compressedStripImage || null,
    shortDate: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    takenDate: new Date().toLocaleString('id-ID'),
    colorHex: stripColor || '#6B111F',
    stripStyle: stripStyle || 'standard',
    textHex: stripColor === '#FDFBF7' || stripColor === '#F3C5CB' ? '#6B111F' : '#F5D77F',
    hasVoice: !!finalVoiceUrl,
    voiceUrl: finalVoiceUrl,
    voiceDuration: voiceDuration || (finalVoiceUrl ? 15 : 0),
    isDemo: !!isDemo,
    createdAt: Date.now(),
  };

  // 2. Always save to LocalStorage first (with compressed photos, this always succeeds instantly!)
  saveLocalSubmission(newSubmission);

  // 3. Sync to Cloud Firestore in REAL TIME for multi-device live sync (HP -> Laptop)
  if (db && !isSubmissionCloudQuotaExhausted) {
    try {
      const cloudDoc = {
        localId: submissionId,
        eventId: newSubmission.eventId,
        eventSlug: newSubmission.eventSlug,
        guestName: newSubmission.guestName,
        message: newSubmission.message,
        photos: compressedPhotos,
        stripImage: compressedStripImage || null,
        shortDate: newSubmission.shortDate,
        takenDate: newSubmission.takenDate,
        colorHex: newSubmission.colorHex,
        stripStyle: newSubmission.stripStyle || 'standard',
        textHex: newSubmission.textHex,
        hasVoice: !!finalVoiceUrl,
        voiceUrl: finalVoiceUrl,
        voiceDuration: newSubmission.voiceDuration,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'submissions'), cloudDoc);
      newSubmission.cloudDocId = docRef.id;
    } catch (err) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
        isSubmissionCloudQuotaExhausted = true;
        console.warn("[Sirklen Cloud] Firestore quota limit reached (Spark Plan). Saved to LocalStorage.");
      } else if (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) {
        console.info("[Sirklen Cloud] Submissions saved locally (Firestore rules pending publication in Firebase Console).");
      } else {
        console.warn("[Sirklen Cloud] Submissions cloud save error:", err?.message || err);
      }
    }
  }

  return newSubmission;
}

// Delete submission from LocalStorage and Cloud Firestore
export async function deleteSubmission(submissionId) {
  if (!submissionId) return false;

  // 1. Remove from LocalStorage
  try {
    const existing = getLocalSubmissions();
    const updated = existing.filter(item => item.id !== submissionId && item.localId !== submissionId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to delete submission from LocalStorage:", e);
  }

  // 2. Remove from Cloud Firestore
  if (db && !isSubmissionCloudQuotaExhausted) {
    try {
      await deleteDoc(doc(db, 'submissions', submissionId));
    } catch (err) {
      console.warn("[Sirklen Cloud] Failed to delete submission from Firestore:", err?.message || err);
    }
  }

  return true;
}

// Subscribe to real-time submissions stream
export function subscribeSubmissions(callback) {
  // Always trigger immediate initial callback with local data
  try {
    callback(getLocalSubmissions());
  } catch (e) {
    console.warn("Initial local submissions callback error:", e);
  }

  if (db && !isSubmissionCloudQuotaExhausted) {
    try {
      const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
      let unsubscribe = null;
      unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          const cloudData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const localData = getLocalSubmissions();
          
          // Deduplicate items between Firestore & LocalStorage (by localId, id, or guestName+takenDate)
          const seen = new Set();
          const merged = [];
          for (const item of [...cloudData, ...localData]) {
            const key = item.localId || item.id || `${item.guestName}_${item.takenDate}`;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(item);
            }
          }
          callback(merged);
        } catch (err) {
          console.warn("Error processing submissions snapshot:", err);
          callback(getLocalSubmissions());
        }
      }, (err) => {
        if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
          isSubmissionCloudQuotaExhausted = true;
          console.warn("[Sirklen Cloud] Firestore quota limit reached. Pausing live subscription; running on LocalStorage.");
          if (unsubscribe) {
            try { unsubscribe(); } catch (_) {}
          }
        } else if (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) {
          console.info("[Sirklen Cloud] Submissions live stream waiting for published rules in Firebase Console. LocalStorage active.");
        } else {
          console.warn("[Sirklen Cloud] Submissions subscription fallback:", err?.message || err);
        }
        callback(getLocalSubmissions());
      });

      return () => {
        if (unsubscribe) {
          try { unsubscribe(); } catch (_) {}
        }
      };
    } catch (e) {
      return () => {};
    }
  } else {
    return () => {};
  }
}
