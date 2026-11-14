// Service to handle saving, subscribing to, and deleting photo submissions
// Supports True Multi-Device Real-Time Sync (Cloud Firestore) & LocalStorage Fallback

import { db, storage } from '../config/firebase.js';
import { 
  collection, doc, setDoc, deleteDoc, getDocs, where, 
  onSnapshot, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { compressImage } from '../utils/imageCompressor.js';

let isSubmissionCloudQuotaExhausted = false;

const LOCAL_STORAGE_KEY = 'wedding_photobooth_submissions';
const DELETED_IDS_KEY = 'sirklen_deleted_submission_ids';

// Helper to get local deleted submission IDs set
export function getDeletedSubmissionIds() {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

// Helper to save deleted submission IDs set
export function saveDeletedSubmissionIds(set) {
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
}

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
    const deletedSet = getDeletedSubmissionIds();
    if (deletedSet.has(submission.id) || deletedSet.has(submission.localId)) {
      return getLocalSubmissions();
    }
    const existing = getLocalSubmissions();
    // Keep at most 30 recent items locally to avoid QuotaExceededError (5MB limit)
    const MAX_LOCAL_ITEMS = 30;
    const updated = [submission, ...existing.filter(item => item.id !== submission.id && item.localId !== submission.id)].slice(0, MAX_LOCAL_ITEMS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    try {
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

  const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newSubmission = {
    id: submissionId,
    localId: submissionId,
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
    syncedToCloud: false,
  };

  // 2. Save locally first
  saveLocalSubmission(newSubmission);

  // 3. Sync to Cloud Firestore with deterministic doc ID matching submissionId!
  // This guarantees that HP and Laptop always share the exact same ID!
  if (db && !isSubmissionCloudQuotaExhausted) {
    try {
      const cloudDoc = {
        id: submissionId,
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

      await setDoc(doc(db, 'submissions', submissionId), cloudDoc);
      newSubmission.syncedToCloud = true;
      newSubmission.cloudDocId = submissionId;
      saveLocalSubmission(newSubmission);
    } catch (err) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
        isSubmissionCloudQuotaExhausted = true;
        console.warn("[Sirklen Cloud] Firestore quota limit reached. Saved locally.");
      } else {
        console.warn("[Sirklen Cloud] Submissions cloud save error:", err?.message || err);
      }
    }
  }

  return newSubmission;
}

// Delete submission from LocalStorage AND Cloud Firestore (Cross-Device Real-Time Sync)
export async function deleteSubmission(submissionId, localId) {
  if (!submissionId && !localId) return false;

  const targetId = submissionId || localId;
  const targetLocalId = localId || submissionId;

  // 1. Record in local deleted set to ensure it never resurfaces locally
  const deletedSet = getDeletedSubmissionIds();
  deletedSet.add(targetId);
  deletedSet.add(targetLocalId);
  saveDeletedSubmissionIds(deletedSet);

  // 2. Remove immediately from local storage
  try {
    const existing = getLocalSubmissions();
    const updated = existing.filter(item => 
      item.id !== targetId && 
      item.id !== targetLocalId && 
      item.localId !== targetId && 
      item.localId !== targetLocalId
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to delete submission from LocalStorage:", e);
  }

  // 3. Remove from Cloud Firestore and broadcast tombstone so all connected devices purge it!
  if (db && !isSubmissionCloudQuotaExhausted) {
    try {
      // a. Delete directly by document ID
      try {
        await deleteDoc(doc(db, 'submissions', targetId));
      } catch (_) {}

      if (targetLocalId && targetLocalId !== targetId) {
        try {
          await deleteDoc(doc(db, 'submissions', targetLocalId));
        } catch (_) {}
      }

      // b. Also search by localId field to clean up any legacy documents created with auto-IDs
      try {
        const q1 = query(collection(db, 'submissions'), where('localId', '==', targetId));
        const snaps1 = await getDocs(q1);
        for (const d of snaps1.docs) {
          await deleteDoc(d.ref);
        }

        if (targetLocalId && targetLocalId !== targetId) {
          const q2 = query(collection(db, 'submissions'), where('localId', '==', targetLocalId));
          const snaps2 = await getDocs(q2);
          for (const d of snaps2.docs) {
            await deleteDoc(d.ref);
          }
        }
      } catch (qErr) {
        console.warn("Firestore query delete error:", qErr);
      }

      // c. Broadcast tombstone in 'deleted_submissions' collection!
      // This is the magic key for cross-device real-time sync:
      // Any other device (Laptop or HP) listening to this will immediately purge its local cache!
      await setDoc(doc(db, 'deleted_submissions', targetId), {
        id: targetId,
        localId: targetLocalId,
        deletedAt: serverTimestamp(),
      });
      if (targetLocalId && targetLocalId !== targetId) {
        await setDoc(doc(db, 'deleted_submissions', targetLocalId), {
          id: targetLocalId,
          localId: targetId,
          deletedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.warn("[Sirklen Cloud] Error deleting from Firestore:", err?.message || err);
    }
  }

  return true;
}

// Subscribe to real-time submissions stream with cross-device deletion sync
export function subscribeSubmissions(callback) {
  // Always trigger immediate initial callback with local data (filtered by deleted IDs)
  try {
    const deletedSet = getDeletedSubmissionIds();
    const local = getLocalSubmissions().filter(item => 
      !deletedSet.has(item.id) && !deletedSet.has(item.localId)
    );
    callback(local);
  } catch (e) {
    console.warn("Initial local submissions callback error:", e);
  }

  if (!db || isSubmissionCloudQuotaExhausted) {
    return () => {};
  }

  let unsubSubmissions = null;
  let unsubDeleted = null;

  try {
    // 1. Real-time listener on deleted_submissions (Notified immediately when ANY device deletes a photo)
    const qDeleted = query(collection(db, 'deleted_submissions'));
    unsubDeleted = onSnapshot(qDeleted, (deletedSnap) => {
      try {
        const deletedSet = getDeletedSubmissionIds();
        let changed = false;
        deletedSnap.forEach(d => {
          const data = d.data();
          if (data.id && !deletedSet.has(data.id)) {
            deletedSet.add(data.id);
            changed = true;
          }
          if (data.localId && !deletedSet.has(data.localId)) {
            deletedSet.add(data.localId);
            changed = true;
          }
          if (d.id && !deletedSet.has(d.id)) {
            deletedSet.add(d.id);
            changed = true;
          }
        });

        if (changed) {
          saveDeletedSubmissionIds(deletedSet);
          // Purge deleted items from local storage on this device immediately!
          const existing = getLocalSubmissions();
          const cleaned = existing.filter(item => !deletedSet.has(item.id) && !deletedSet.has(item.localId));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
        }
      } catch (err) {
        console.warn("Error processing deleted submissions snapshot:", err);
      }
    }, (err) => {
      console.warn("Deleted submissions stream warning:", err?.message || err);
    });

    // 2. Real-time listener on active submissions
    const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
    unsubSubmissions = onSnapshot(q, (snapshot) => {
      try {
        const deletedSet = getDeletedSubmissionIds();

        // Extract valid cloud items
        const cloudData = [];
        snapshot.docs.forEach(docSnap => {
          const data = docSnap.data();
          const docId = docSnap.id;
          const localId = data.localId;
          // If this doc was deleted, ignore it
          if (deletedSet.has(docId) || (localId && deletedSet.has(localId)) || data.isDeleted) {
            return;
          }
          cloudData.push({ id: docId, ...data });
        });

        // Get local submissions (already filtered by deletedSet)
        const localData = getLocalSubmissions().filter(item => 
          !deletedSet.has(item.id) && !deletedSet.has(item.localId)
        );

        const seen = new Set();
        const merged = [];

        // Add all cloud data first (Cloud is the authoritative source of truth for multi-device sync)
        for (const item of cloudData) {
          const key = item.localId || item.id || `${item.guestName}_${item.takenDate}`;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
          }
        }

        // Only merge local items that were genuinely created offline and NOT yet synced.
        // If an item was ALREADY synced to cloud before, but is now missing from cloud:
        // That means it was DELETED by another device (e.g. Laptop admin)! Do NOT resurrect it!
        for (const item of localData) {
          const key = item.localId || item.id || `${item.guestName}_${item.takenDate}`;
          if (!seen.has(key)) {
            if (item.syncedToCloud) {
              // It was deleted on another device! Purge from local state!
              deletedSet.add(item.id);
              if (item.localId) deletedSet.add(item.localId);
            } else {
              seen.add(key);
              merged.push(item);
            }
          }
        }

        // Keep local storage clean
        saveDeletedSubmissionIds(deletedSet);
        try {
          const toStoreLocally = [...merged].slice(0, 30);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toStoreLocally));
        } catch (_) {}

        callback(merged);
      } catch (err) {
        console.warn("Error processing submissions snapshot:", err);
        callback(getLocalSubmissions());
      }
    }, (err) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
        isSubmissionCloudQuotaExhausted = true;
        console.warn("[Sirklen Cloud] Firestore quota limit reached. Pausing live subscription; running on LocalStorage.");
        if (unsubSubmissions) {
          try { unsubSubmissions(); } catch (_) {}
        }
      } else {
        console.warn("[Sirklen Cloud] Submissions subscription fallback:", err?.message || err);
      }
      callback(getLocalSubmissions());
    });

    return () => {
      if (unsubSubmissions) {
        try { unsubSubmissions(); } catch (_) {}
      }
      if (unsubDeleted) {
        try { unsubDeleted(); } catch (_) {}
      }
    };
  } catch (e) {
    return () => {};
  }
}
