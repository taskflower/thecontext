// src/store/uiStore.types.ts
import { TabName, ViewMode } from "@/types";

export interface UIState {
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