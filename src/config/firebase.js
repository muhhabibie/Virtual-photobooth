// Firebase configuration
// Replace with your own Firebase credentials from https://console.firebase.google.com
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // Put real Firebase API Key here
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

// Safe initialization: Only connect to Cloud Firestore if real credentials are provided
let app = null, db = null, storage = null;
try {
  if (
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" && 
    firebaseConfig.apiKey !== "AIzaSyBXwuiEMIbV5eM8Qjf3h02Z_rM5DKWq72E" &&
    firebaseConfig.projectId
  ) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
  }
} catch (e) {
  console.warn("Firebase initialization bypassed. Falling back to LocalStorage:", e);
}

export { db, storage };
