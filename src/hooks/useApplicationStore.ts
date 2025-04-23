// src/hooks/useApplicationStore.ts
import { create } from 'zustand';

import { Workspace } from '@/types';
import { useContextStore } from './useContextStore';
import { firebaseService } from '@/_firebase/firebase';

interface Application {
  id: string;
  name: string;
  description?: string;
  workspaces: Workspace[];
}

interface ApplicationState {
  applications: Application[];
  isLoading: boolean;
  error: string | null;
  currentApplicationId: string | null;
  
  // Akcje
  fetchApplications: () => Promise<void>;
  fetchApplicationById: (id: string) => Promise<void>;
  selectApplication: (id: string | null) => void;
  getCurrentApplication: () => Application | undefined;
  
  // Stan pobierania
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  isLoading: false,
  error: null,
  currentApplicationId: null,
  
  // Pobierz wszystkie aplikacje
  fetchApplications: async () => {
    try {
      set({ isLoading: true, error: null });
      const applications = await firebaseService.getApplications();
      set({ applications, isLoading: false });
    } catch (error) {
      console.error('Error fetching applications:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch applications', 
        isLoading: false 
      });
    }
  },
  
  // Pobierz szczegóły konkretnej aplikacji
  fetchApplicationById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const application = await firebaseService.getApplicationById(id);
      
      if (!application) {
        throw new Error(`Application with ID ${id} not found`);
      }
      
      set((state) => {
        // Aktualizuj istniejące aplikacje lub dodaj nową
        const exists = state.applications.some(app => app.id === id);
        let updatedApplications = [...state.applications];
        
        if (exists) {
          updatedApplications = updatedApplications.map(app => 
            app.id === id ? application : app
          );
        } else {
          updatedApplications.push(application);
        }
        
        return { 
          applications: updatedApplications,
          currentApplicationId: id,
          isLoading: false 
        };
      });
      
      // Inicjalizuj konteksty dla workspaces
      if (application.workspaces && application.workspaces.length > 0) {
        const contexts: Record<string, any> = {};
        application.workspaces.forEach(ws => {
          contexts[ws.id] = ws.initialContext || {};
        });
        useContextStore.getState().setContexts(contexts);
      }
      
    } catch (error) {
      console.error('Error fetching application:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch application details', 
        isLoading: false 
      });
    }
  },
  
  // Wybierz aplikację
  selectApplication: (id: string | null) => {
    set({ currentApplicationId: id });
    
    if (id) {
      // Automatycznie ładuj dane aplikacji jeśli nie zostały jeszcze pobrane
      const application = get().applications.find(app => app.id === id);
      if (!application || !application.workspaces) {
        get().fetchApplicationById(id);
      }
    }
  },
  
  // Pobierz aktualną aplikację
  getCurrentApplication: () => {
    const { applications, currentApplicationId } = get();
    return applications.find(app => app.id === currentApplicationId);
  },
  
  // Ustawienie stanu ładowania
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  // Ustawienie błędu
  setError: (error: string | null) => set({ error }),
}));