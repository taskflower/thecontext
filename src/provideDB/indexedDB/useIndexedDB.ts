// src/provideDB/indexedDB/useIndexedDB.ts
export interface StoredItem {
  id: string;
  type: "lesson" | "quiz" | "project";
  title: string;
  content: any;
  timestamp: number;
}
