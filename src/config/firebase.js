// Firebase configuration for Photobooth Cloud Database
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBXwuiEMIbV5eM8QjF3h02Z_rM5DKWq72E",
  authDomain: "notesapp-fbb6e.firebaseapp.com",
  projectId: "notesapp-fbb6e",
  storageBucket: "notesapp-fbb6e.firebasestorage.app",
  messagingSenderId: "1054916046669",
  appId: "1:1054916046669:web:584b29a2939425309d5104",
  measurementId: "G-VTJSM3B4KZ"
};

// Safe initialization: Connect to Cloud Firestore & Storage with real credentials
let app = null, db = null, storage = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    try {
      storage = getStorage(app);
    } catch (stErr) {
      console.warn("Storage init warning:", stErr);
    }
  }
} catch (e) {
  console.warn("Firebase initialization bypassed. Falling back to LocalStorage:", e);
}

export { db, storage };
