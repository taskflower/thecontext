// src/store/uiStore.tsx - poprawiona wersja
import { create } from "zustand";
import { TabName, ViewMode } from "@/types";

interface UIState {
  // Stan UI
  activeTab: TabName;
  viewMode: ViewMode;
  showNewProjectModal: boolean;
  showNewDocumentModal: boolean;
  currentFolder: string;
  selectedDocument: string | null;
  // Usuwamy activeTaskId stąd, bo jest już w wizardStore

  // Akcje UI
  setActiveTab: (tab: TabName) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleNewProjectModal: () => void;
  toggleNewDocumentModal: () => void;
  navigateToFolder: (folderId: string) => void;
  selectDocument: (documentId: string | null) => void;
  // Usuwamy setActiveTask stąd, bo jest już w wizardStore
  
  // Nowa metoda do obsługi kroków
  connectTaskWithSteps: (taskId: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Początkowy stan UI
  activeTab: "dashboard",
  viewMode: "cards",
  showNewProjectModal: false,
  showNewDocumentModal: false,
  currentFolder: "root",
  selectedDocument: null,

  // Akcje UI
  setActiveTab: (tab) => set({ activeTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleNewProjectModal: () =>
    set((state) => ({ showNewProjectModal: !state.showNewProjectModal })),
  toggleNewDocumentModal: () =>
    set((state) => ({ showNewDocumentModal: !state.showNewDocumentModal })),
  navigateToFolder: (folderId) => set({ currentFolder: folderId }),
  selectDocument: (documentId) => set({ selectedDocument: documentId }),
  
  // Implementacja connectTaskWithSteps, która będzie używać wizardStore
  connectTaskWithSteps: (taskId) => {
    // To jest tylko placeholder - faktyczna implementacja 
    // powinna używać funkcji openWizard z wizardStore
    console.log("connectTaskWithSteps:", taskId);
    // Tutaj powinno być coś w stylu: wizardStore.openWizard(taskId);
    // Ale to zaimplementujemy w TaskListNavigator.tsx
  }
}));