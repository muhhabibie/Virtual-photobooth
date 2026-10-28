// Service to synchronize event configuration and hero slideshow photos across devices
// Integrates LocalStorage (offline instant cache) + Firebase Firestore (cloud multi-device sync)

import { db } from '../config/firebase.js';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

const EVENTS_STORAGE_KEY = 'sirklen_photo_events_db';

// Delete event from Cloud Firestore
export async function deleteEventFromCloud(slug) {
  if (!db || !slug) return;
  try {
    const eventRef = doc(db, 'events', slug.toLowerCase().trim());
    await deleteDoc(eventRef);
  } catch (err) {
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

// Helper to save events to LocalStorage
export function saveLocalEvents(events) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.warn("Failed to save events to LocalStorage (possibly quota exceeded):", e);
  }
}

// Save or update single event to Cloud Firestore + LocalStorage
export async function syncEventToCloud(event) {
  if (!event || !event.slug) return;

  // 1. Sync to Cloud Firestore if connected
  if (db) {
    try {
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
        heroPhotos: event.heroPhotos || [],
        templateIds: event.templateIds || [],
        customFrame: event.customFrame || null,
        expiresAt: event.expiresAt || (Date.now() + 14 * 86400 * 1000),
        updatedAt: Date.now(),
      };

      const eventRef = doc(db, 'events', event.slug.toLowerCase().trim());
      await setDoc(eventRef, cleanEvent, { merge: true });
    } catch (err) {
      if (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) {
        console.info("[Sirklen Sync] Firestore rules pending publication in Firebase Console. LocalStorage active.");
      } else {
        console.warn("[Sirklen Sync] Event cloud sync fallback to local:", err?.message || err);
      }
    }
  }
}

// Subscribe to real-time events stream from Cloud Firestore
export function subscribeCloudEvents(onEventsUpdate) {
  if (!db) return () => {};

  try {
    const eventsCol = collection(db, 'events');
    const unsubscribe = onSnapshot(eventsCol, (snapshot) => {
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
      } catch (err) {
        console.warn("Error processing cloud events snapshot:", err);
      }
    }, (err) => {
      if (err?.code === 'permission-denied' || err?.message?.includes('Missing or insufficient permissions')) {
        console.info("[Sirklen Sync] Firestore events real-time sync waiting for published rules in Firebase Console. LocalStorage active.");
      } else {
        console.warn("[Sirklen Sync] Firestore events subscription fallback:", err?.message || err);
      }
    });

    return unsubscribe;
  } catch (e) {
    return () => {};
  }
}
