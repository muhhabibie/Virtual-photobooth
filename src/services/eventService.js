// Service to synchronize event configuration and hero slideshow photos across devices
// Integrates LocalStorage (offline instant cache) + Firebase Firestore (cloud multi-device sync)

import { db } from '../config/firebase.js';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { compressHeroPhoto } from '../utils/imageCompressor.js';

const EVENTS_STORAGE_KEY = 'sirklen_photo_events_db';

// Circuit breaker for Firebase Firestore quota limits
let isEventCloudQuotaExhausted = false;

// Delete event from Cloud Firestore
export async function deleteEventFromCloud(slug) {
  if (!db || !slug || isEventCloudQuotaExhausted) return;
  try {
    const eventRef = doc(db, 'events', slug.toLowerCase().trim());
    await deleteDoc(eventRef);
  } catch (err) {
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
      isEventCloudQuotaExhausted = true;
      console.warn("[Sirklen Sync] Firestore quota limit reached (Spark Plan). Switched to LocalStorage.");
      return;
    }
    console.warn("[Sirklen Sync] Failed to delete event from Firestore:", err?.message || err);
  }
}

// Helper to get local events
export function getLocalEvents(fallbackEvents = []) {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : fallbackEvents;
  } catch (e) {
    return fallbackEvents;
  }
}

// Helper to save events to LocalStorage with automatic quota protection
export function saveLocalEvents(events) {
  if (!events || !Array.isArray(events)) return;
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn("LocalStorage quota reached, pruning local event cache:", e);
    try {
      // Keep up to 10 events, strip heavy heroPhotos from older events in local cache
      const trimmed = events.slice(0, 10).map((evt, idx) => {
        if (idx < 2) return evt;
        return {
          ...evt,
          heroPhotos: (evt.heroPhotos || []).slice(0, 1)
        };
      });
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err2) {
      try {
        const minimal = events.slice(0, 5).map(evt => ({
          id: evt.id,
          slug: evt.slug,
          displayName: evt.displayName,
          eventName: evt.eventName,
          eventType: evt.eventType,
          eventDate: evt.eventDate
        }));
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(minimal));
      } catch (_) {}
    }
  }
}

// Save or update single event to Cloud Firestore + LocalStorage
export async function syncEventToCloud(event) {
  if (!event || !event.slug || isEventCloudQuotaExhausted) return false;

  // 1. Sync to Cloud Firestore if connected
  if (db) {
    try {
      // Guarantee hero photos are strictly compressed within budget before Firestore setDoc
      let safeHeroPhotos = event.heroPhotos || [];
      if (Array.isArray(safeHeroPhotos) && safeHeroPhotos.length > 0) {
        const photoBudget = Math.floor(700000 / Math.max(safeHeroPhotos.length, 1));
        safeHeroPhotos = await Promise.all(
          safeHeroPhotos.slice(0, 5).map(p => compressHeroPhoto(p, 1000, photoBudget))
        );
      }

      const cleanEvent = {
        id: event.id || `evt_${event.slug}`,
        slug: event.slug,
        eventType: event.eventType || 'wedding',
        eventName: event.eventName || '',
        displayName: event.displayName || '',
        groomName: event.groomName || '',
        brideName: event.brideName || '',
        venue: event.venue || '',
        eventDate: event.eventDate || '',
        formattedDate: event.formattedDate || '',
        package: event.package || 'standard',
        pin: event.pin || '',
        heroPhotos: safeHeroPhotos,
        templateIds: event.templateIds || [],
        customFrame: event.customFrame || null,
        hideHeroTextOverlay: event.hideHeroTextOverlay !== undefined ? !!event.hideHeroTextOverlay : null,
        expiresAt: event.expiresAt || (Date.now() + 14 * 86400 * 1000),
        updatedAt: Date.now(),
      };

      const eventRef = doc(db, 'events', event.slug.toLowerCase().trim());
      await setDoc(eventRef, cleanEvent, { merge: true });
      return true;
    } catch (err) {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
        isEventCloudQuotaExhausted = true;
        console.warn("[Sirklen Sync] Firestore quota limit reached (Spark Plan). Switched to LocalStorage.");
        return false;
      }
      if (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) {
        console.info("[Sirklen Sync] Firestore rules pending publication in Firebase Console. LocalStorage active.");
      } else {
        console.warn("[Sirklen Sync] Event cloud sync fallback to local:", err?.message || err);
      }
      return false;
    }
  }
  return false;
}

// Subscribe to real-time events stream from Cloud Firestore
export function subscribeCloudEvents(onEventsUpdate, onReady) {
  if (!db || isEventCloudQuotaExhausted) {
    if (typeof onReady === 'function') onReady();
    return () => {};
  }

  try {
    const eventsCol = collection(db, 'events');
    let unsubscribe = null;
    let initialFired = false;
    unsubscribe = onSnapshot(eventsCol, (snapshot) => {
      try {
        const cloudEvents = [];
        snapshot.forEach((docSnap) => {
          if (docSnap.exists()) {
            cloudEvents.push(docSnap.data());
          }
        });
        if (cloudEvents.length > 0) {
          onEventsUpdate(cloudEvents);
        }
        if (!initialFired && typeof onReady === 'function') {
          initialFired = true;
          onReady();
        }
      } catch (err) {
        console.warn("Error processing cloud events snapshot:", err);
        if (!initialFired && typeof onReady === 'function') {
          initialFired = true;
          onReady();
        }
      }
    }, (err) => {
      if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
        isEventCloudQuotaExhausted = true;
        console.warn("[Sirklen Sync] Firestore quota limit reached (Spark Plan). Real-time subscription paused; using LocalStorage.");
        if (unsubscribe) {
          try { unsubscribe(); } catch (_) {}
        }
        if (!initialFired && typeof onReady === 'function') {
          initialFired = true;
          onReady();
        }
        return;
      }
      if (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) {
        console.info("[Sirklen Sync] Firestore events real-time sync waiting for published rules in Firebase Console. LocalStorage active.");
      } else {
        console.warn("[Sirklen Sync] Firestore events subscription fallback:", err?.message || err);
      }
      if (!initialFired && typeof onReady === 'function') {
        initialFired = true;
        onReady();
      }
    });

    return () => {
      if (unsubscribe) {
        try { unsubscribe(); } catch (_) {}
      }
    };
  } catch (e) {
    if (typeof onReady === 'function') onReady();
    return () => {};
  }
}
