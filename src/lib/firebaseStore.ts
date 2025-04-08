// src/lib/firebaseStore.ts
import { create } from "zustand";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  QueryDocumentSnapshot,
} from "@firebase/firestore";

import { db } from "@/firebase/config";
import { Workspace } from "./store";

interface FirebaseStoreState {
  syncWorkspacesToFirebase: (userId: string) => Promise<Workspace[]>;
  createWorkspace: (userId: string, workspace: Workspace) => Promise<string>;
  updateWorkspace: (
    workspaceId: string,
    updates: Partial<Workspace>
  ) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
}

export const useFirebaseStore = create<FirebaseStoreState>(() => ({
  syncWorkspacesToFirebase: async (userId) => {
    try {
      // Query workspaces for the specific user
      const q = query(
        collection(db, "workspaces"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);

      // Convert Firebase documents to Workspace type
      const workspaces: Workspace[] = querySnapshot.docs.map(
        (doc: QueryDocumentSnapshot) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Workspace)
      );

      return workspaces;
    } catch (error) {
      console.error("Error syncing workspaces:", error);
      return [];
    }
  },

  createWorkspace: async (userId, workspace) => {
    try {
      // Add user ID to the workspace document
      const workspaceWithUserId = {
        ...workspace,
        userId: userId,
      };

      // Add new workspace to Firestore
      const docRef = await addDoc(
        collection(db, "workspaces"),
        workspaceWithUserId
      );

      return docRef.id;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error;
    }
  },

  updateWorkspace: async (workspaceId, updates) => {
    try {
      const workspaceRef = doc(db, "workspaces", workspaceId);
      await updateDoc(workspaceRef, updates);
    } catch (error) {
      console.error("Error updating workspace:", error);
      throw error;
    }
  },

  deleteWorkspace: async (workspaceId) => {
    try {
      const workspaceRef = doc(db, "workspaces", workspaceId);
      await deleteDoc(workspaceRef);
    } catch (error) {
      console.error("Error deleting workspace:", error);
      throw error;
    }
  },
}));
