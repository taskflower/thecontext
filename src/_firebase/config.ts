// src/_firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Sprawdzenie czy używamy mocków czy prawdziwego Firebase
export const USE_MOCKS = import.meta.env.VITE_USE_FIREBASE_MOCKS === 'true' || !import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-domain.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCDEF123456"
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
export let analytics;
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