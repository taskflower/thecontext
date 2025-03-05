// src/store/uiStore.tsx
import { create } from "zustand";
import { UIState } from "./uiStore.types";

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