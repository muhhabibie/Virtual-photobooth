// Firebase configuration
// User can replace with their own Firebase credentials
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBXwuiEMIbV5eM8Qjf3h02Z_rM5DKWq72E",
  authDomain: "notesapp-fbb6e.firebaseapp.com",
  projectId: "notesapp-fbb6e",
  storageBucket: "notesapp-fbb6e.firebasestorage.app",
  messagingSenderId: "1054916046669",
  appId: "1:1054916046669:web:584b29a2939425309d5104",
  measurementId: "G-VTJSM3B4KZ"
};

// Safe initialization that doesn't crash if config is placeholder
let app, db = null, storage = null;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (e) {
  console.warn("Firebase init failed or placeholder config used:", e);
}

export { db, storage };
