// src/provideDB/index.ts

// Types
export { BaseProvider } from "./types";

// Firebase
export { default as FirebaseProvider } from "./firebase/firebase";
export { auth, googleProvider, db, storage } from "./firebase/config";

// IndexedDB
export { default as IndexedDBProvider } from "./indexedDB/indexedDB";
export { ConfigDatabase, configDB } from "./indexedDB/config";
export type { ConfigRecord } from "./indexedDB/config";
