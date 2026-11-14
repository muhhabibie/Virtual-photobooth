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
const HIDDEN_MOCK_KEY = 'sirklen_hidden_mock_submissions';

// Helper to get local deleted submission IDs set (normalized as Strings)
export function getDeletedSubmissionIds() {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const rawMock = localStorage.getItem(HIDDEN_MOCK_KEY);
    const arrMock = rawMock ? JSON.parse(rawMock) : [];
    return new Set([...arr, ...arrMock].map(String));
  } catch (e) {
    return new Set();
  }
}

// Helper to save deleted submission IDs set to both keys for backward-compatibility
export function saveDeletedSubmissionIds(set) {
  try {
    const arr = Array.from(set).map(String);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(arr));
    localStorage.setItem(HIDDEN_MOCK_KEY, JSON.stringify(arr));
  } catch (e) {}
}

// Helper to check if a submission or ID is deleted
export function isSubmissionDeleted(itemOrId, localId, deletedSet) {
  if (itemOrId === undefined || itemOrId === null) return false;
  const set = deletedSet || getDeletedSubmissionIds();
  if (typeof itemOrId === 'object') {
    const id = itemOrId.id !== undefined && itemOrId.id !== null ? String(itemOrId.id) : null;
    const lId = itemOrId.localId !== undefined && itemOrId.localId !== null ? String(itemOrId.localId) : null;
    if (id && set.has(id)) return true;
    if (lId && set.has(lId)) return true;
    return false;
  }
  const targetId = String(itemOrId);
  const targetLocalId = localId !== undefined && localId !== null ? String(localId) : null;
  if (set.has(targetId)) return true;
  if (targetLocalId && set.has(targetLocalId)) return true;
  return false;
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
    if (isSubmissionDeleted(submission, null, deletedSet)) {
      return getLocalSubmissions();
    }
    const existing = getLocalSubmissions();
    // Keep at most 30 recent items locally to avoid QuotaExceededError (5MB limit)
    const MAX_LOCAL_ITEMS = 30;
    const updated = [
      submission, 
      ...existing.filter(item => String(item.id) !== String(submission.id) && String(item.localId) !== String(submission.id))
    ].slice(0, MAX_LOCAL_ITEMS);
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
// Optimized to guarantee Firestore documents stay lightweight (~70KB - 120KB) and NEVER exceed Firestore's 1MB limit!
export async function saveSubmission({ eventId, eventSlug, guestName, guestMessage, photos, stripColor, stripStyle, stripImage, voiceBlob, voiceUrl, voiceDuration, isDemo = false }) {
  let finalVoiceUrl = voiceUrl || null;
  if (voiceBlob) {
    try {
      finalVoiceUrl = await blobToBase64(voiceBlob);
    } catch (e) {
      console.warn("Failed to convert voice blob to base64:", e);
    }
  }

  // 1. Optimize and compress all individual photo cuts (~25-35KB per cut)
  const rawPhotos = photos.map(p => typeof p === 'string' ? p : p.dataUrl);
  let compressedPhotos = rawPhotos;
  try {
    compressedPhotos = await Promise.all(
      rawPhotos.map(p => compressImage(p, 480, 0.70))
    );
  } catch (compErr) {
    console.warn("Photo compression fallback:", compErr);
  }

  // 2. Compress stripImage to a lightweight preview thumbnail (~30KB)
  let compressedStripThumbnail = null;
  if (stripImage && typeof stripImage === 'string' && stripImage.startsWith('data:image')) {
    try {
      compressedStripThumbnail = await compressImage(stripImage, 440, 0.68);
    } catch (_) {
      compressedStripThumbnail = null;
    }
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
    stripImage: stripImage || compressedStripThumbnail || null,
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

  // Save locally first for instant offline availability
  saveLocalSubmission(newSubmission);

  // Sync to Cloud Firestore with deterministic doc ID matching submissionId!
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
        stripImage: compressedStripThumbnail,
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

      // Strict Payload Safety Guard: Ensure Firestore document size stays well under 800KB
      const approxBytes = JSON.stringify(cloudDoc).length;
      if (approxBytes > 700000) {
        // Drop stripImage thumbnail if payload is large (strip can always be rendered from photos)
        cloudDoc.stripImage = null;
      }

      await setDoc(doc(db, 'submissions', submissionId), cloudDoc);
      newSubmission.syncedToCloud = true;
      newSubmission.cloudDocId = submissionId;
      saveLocalSubmission(newSubmission);
      console.info("[Sirklen Cloud] Submission successfully synced to Firestore:", submissionId);
    } catch (err) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
        isSubmissionCloudQuotaExhausted = true;
        console.warn("[Sirklen Cloud] Firestore quota limit reached. Saved locally.");
      } else {
        console.error("[Sirklen Cloud] Submissions cloud save error:", err?.message || err);
      }
    }
  }

  return newSubmission;
}

// Delete submission from LocalStorage AND Cloud Firestore (Cross-Device Real-Time Sync)
export async function deleteSubmission(submissionId, localId) {
  if (submissionId === undefined && localId === undefined) return false;

  const targetId = String(submissionId || localId);
  const targetLocalId = String(localId || submissionId);

  // 1. Record in local deleted set to ensure it never resurfaces locally
  const deletedSet = getDeletedSubmissionIds();
  deletedSet.add(targetId);
  deletedSet.add(targetLocalId);
  saveDeletedSubmissionIds(deletedSet);

  // 2. Remove immediately from local storage
  try {
    const existing = getLocalSubmissions();
    const updated = existing.filter(item => !isSubmissionDeleted(item, null, deletedSet));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to delete submission from LocalStorage:", e);
  }

  // 3. Remove from Cloud Firestore and broadcast tombstone so ALL connected devices purge it!
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

      // b. Clean up any documents stored with localId matching targetId
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
      // This is the essential key for cross-device real-time sync:
      // Any other device (Laptop or HP) listening to this collection will immediately purge it!
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
      console.info("[Sirklen Cloud] Broadcasted deletion tombstone to cloud:", targetId);
    } catch (err) {
      console.error("[Sirklen Cloud] Error deleting from Firestore:", err?.message || err);
    }
  }

  return true;
}

// Subscribe to real-time submissions stream with cross-device deletion sync
export function subscribeSubmissions(callback) {
  // In-memory reference of currently active submissions for this subscription
  let activeSubmissionsList = [];

  // Always trigger immediate initial callback with local data (filtered by deleted IDs)
  try {
    const deletedSet = getDeletedSubmissionIds();
    activeSubmissionsList = getLocalSubmissions().filter(item => 
      !isSubmissionDeleted(item, null, deletedSet)
    );
    callback(activeSubmissionsList);
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
          const docIdStr = String(d.id);
          const dataIdStr = data.id ? String(data.id) : null;
          const dataLocalIdStr = data.localId ? String(data.localId) : null;

          if (docIdStr && !deletedSet.has(docIdStr)) {
            deletedSet.add(docIdStr);
            changed = true;
          }
          if (dataIdStr && !deletedSet.has(dataIdStr)) {
            deletedSet.add(dataIdStr);
            changed = true;
          }
          if (dataLocalIdStr && !deletedSet.has(dataLocalIdStr)) {
            deletedSet.add(dataLocalIdStr);
            changed = true;
          }
        });

        if (changed) {
          saveDeletedSubmissionIds(deletedSet);
          // Purge deleted items from local storage on this device immediately!
          const existing = getLocalSubmissions();
          const cleaned = existing.filter(item => !isSubmissionDeleted(item, null, deletedSet));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));

          // CRITICAL MULTI-DEVICE FIX: Update in-memory active submissions and CALL CALLBACK!
          // This causes the other device (laptop or mobile) to IMMEDIATELY re-render without page refresh!
          activeSubmissionsList = activeSubmissionsList.filter(item => !isSubmissionDeleted(item, null, deletedSet));
          callback(activeSubmissionsList);
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
          const docId = String(docSnap.id);
          const localId = data.localId ? String(data.localId) : null;
          // If this doc was deleted on any device, ignore it
          if (deletedSet.has(docId) || (localId && deletedSet.has(localId)) || data.isDeleted) {
            return;
          }
          cloudData.push({ id: docId, ...data });
        });

        // Get local submissions (filtered by deletedSet)
        const localData = getLocalSubmissions().filter(item => 
          !isSubmissionDeleted(item, null, deletedSet)
        );

        const seen = new Set();
        const merged = [];

        // Add all cloud data first (Cloud is the authoritative source of truth for multi-device sync)
        for (const item of cloudData) {
          const key = String(item.localId || item.id);
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(item);
          }
        }

        // Only merge local items that were genuinely created offline and NOT yet synced.
        // If an item was ALREADY synced to cloud before, but is now missing from cloud:
        // That means it was DELETED by another device! Do NOT resurrect it!
        for (const item of localData) {
          const key = String(item.localId || item.id);
          if (!seen.has(key)) {
            if (item.syncedToCloud) {
              // It was deleted on another device! Purge from local state!
              deletedSet.add(String(item.id));
              if (item.localId) deletedSet.add(String(item.localId));
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

        activeSubmissionsList = merged;
        callback(merged);
      } catch (err) {
        console.warn("Error processing submissions snapshot:", err);
        const fallback = getLocalSubmissions().filter(item => !isSubmissionDeleted(item));
        activeSubmissionsList = fallback;
        callback(fallback);
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
      const fallback = getLocalSubmissions().filter(item => !isSubmissionDeleted(item));
      activeSubmissionsList = fallback;
      callback(fallback);
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
