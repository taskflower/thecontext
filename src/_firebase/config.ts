// src/_firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Analytics, getAnalytics, isSupported } from 'firebase/analytics';

// Zmieniamy na false, ponieważ usunęliśmy mechanizm mocków
export const USE_MOCKS = false;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicjalizacja Firebase
const app = initializeApp(firebaseConfig);

// Inicjalizacja usług Firebase
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Dodajemy scope'y dla Google Drive
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

export const db = getFirestore(app);
export const storage = getStorage(app);

// Bezpieczna inicjalizacja Analytics (tylko gdy jest wspierane w środowisku)
export let analytics: Analytics;
// Inicjalizacja Analytics w sposób asynchroniczny
(async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn('Firebase Analytics not supported in this environment', error);
  }
})();