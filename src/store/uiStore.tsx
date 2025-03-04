// src/store/uiStore.tsx - updated for router compatibility
import { create } from "zustand";
import { TabName, ViewMode } from "@/types";

interface UIState {
  // UI State
  activeTab: TabName;
  viewMode: ViewMode;
  showNewScenarioModal: boolean;
  showNewDocumentModal: boolean;
  currentFolder: string; // Still needed for NewDocumentModal
  selectedDocument: string | null;

  // UI Actions
  setActiveTab: (tab: TabName) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleNewScenarioModal: () => void;
  toggleNewDocumentModal: () => void;
  navigateToFolder: (folderId: string) => void; // Kept for backward compatibility
  selectDocument: (documentId: string | null) => void;
  
  // Task handling
  connectTaskWithSteps: (taskId: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial UI state
  activeTab: "dashboard",
  viewMode: "cards",
  showNewScenarioModal: false,
  showNewDocumentModal: false,
  currentFolder: "root",
  selectedDocument: null,

  // UI Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  toggleNewScenarioModal: () =>
    set((state) => ({ showNewScenarioModal: !state.showNewScenarioModal })),
    
  toggleNewDocumentModal: () =>
    set((state) => ({ showNewDocumentModal: !state.showNewDocumentModal })),
    
  // Keep this for backward compatibility
  // Note: This method is now deprecated. Use react-router navigation instead.
  navigateToFolder: (folderId) => {
    console.log(`[DEPRECATED] navigateToFolder called with: ${folderId}`);
    console.log('Please use react-router navigation instead');
    set({ currentFolder: folderId });
  },
  
  selectDocument: (documentId) => set({ selectedDocument: documentId }),
  
  // Task handling - placeholder implementation
  connectTaskWithSteps: (taskId) => {
    console.log("connectTaskWithSteps:", taskId);
    // Actual implementation would use wizardStore.openWizard(taskId)
  }
}));