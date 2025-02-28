// src/pages/tasks/TaskFlow/uiStore.tsx
import { create } from "zustand";
import { useDataStore } from "./dataStore";
import { Step, TabName, ViewMode } from "@/types";


interface UIState {
  // UI state
  activeTab: TabName;
  viewMode: ViewMode;
  showNewProjectModal: boolean;
  showNewDocumentModal: boolean;
  currentFolder: string;
  selectedDocument: string | null;

  // Step-related UI state
  activeTaskId: string | null;
  activeStepId: string | null;
  showStepWizard: boolean;

  // UI actions
  setActiveTab: (tab: TabName) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleNewProjectModal: () => void;
  toggleNewDocumentModal: () => void;
  navigateToFolder: (folderId: string) => void;
  selectDocument: (documentId: string | null) => void;

  // Step-related UI actions
  setActiveTask: (taskId: string | null) => void;
  setActiveStep: (stepId: string | null) => void;
  toggleStepWizard: () => void;
  moveToNextStep: (taskId: string) => void;
  moveToPreviousStep: (taskId: string) => void;
  connectTaskWithSteps: (taskId: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial UI state
  activeTab: "dashboard",
  viewMode: "cards",
  showNewProjectModal: false,
  showNewDocumentModal: false,
  currentFolder: "root",
  selectedDocument: null,

  // Initial step-related UI state
  activeTaskId: null,
  activeStepId: null,
  showStepWizard: false,

  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleNewProjectModal: () =>
    set((state) => ({
      showNewProjectModal: !state.showNewProjectModal,
    })),

  toggleNewDocumentModal: () =>
    set((state) => ({
      showNewDocumentModal: !state.showNewDocumentModal,
    })),

  navigateToFolder: (folderId) => set({ currentFolder: folderId }),

  selectDocument: (documentId) => set({ selectedDocument: documentId }),

  // Step-related UI actions
  setActiveTask: (taskId) => {
    const dataStore = useDataStore.getState();
    set(() => ({
      activeTaskId: taskId,
      activeStepId: taskId
        ? dataStore.getCurrentStep(taskId)?.id || null
        : null,
      showStepWizard: !!taskId,
    }));
  },

  setActiveStep: (stepId) => set({ activeStepId: stepId }),

  toggleStepWizard: () =>
    set((state) => ({
      showStepWizard: !state.showStepWizard,
      // Reset task and step IDs when closing the wizard
      activeTaskId: state.showStepWizard ? null : state.activeTaskId,
      activeStepId: state.showStepWizard ? null : state.activeStepId,
    })),

  moveToNextStep: (taskId) => {
    const dataStore = useDataStore.getState();
    const task = dataStore.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentStepId = get().activeStepId;
    const taskSteps = dataStore
      .getTaskSteps(taskId)
      .sort((a, b) => a.order - b.order);

    if (taskSteps.length === 0) return;

    let nextStepIndex = 0;

    if (currentStepId) {
      const currentStepIndex = taskSteps.findIndex(
        (step) => step.id === currentStepId
      );
      if (currentStepIndex < taskSteps.length - 1) {
        nextStepIndex = currentStepIndex + 1;
      } else {
        // Last step reached, no next step
        return;
      }
    }

    const nextStep = taskSteps[nextStepIndex];

    // Update task in dataStore
    dataStore.updateTaskData(taskId, { currentStepId: nextStep.id });

    // Update step status if it's pending
    if (nextStep.status === 'pending') {
      dataStore.updateStep(nextStep.id, { status: "in-progress" });
    }

    // Update UI state
    set({ activeStepId: nextStep.id });
  },

  moveToPreviousStep: (taskId) => {
    const dataStore = useDataStore.getState();
    const task = dataStore.tasks.find((t) => t.id === taskId);
    if (!task || !get().activeStepId) return;

    const taskSteps = dataStore
      .getTaskSteps(taskId)
      .sort((a, b) => a.order - b.order);
    
    const currentStepIndex = taskSteps.findIndex(
      (step) => step.id === get().activeStepId
    );

    if (currentStepIndex <= 0) return;

    const prevStep = taskSteps[currentStepIndex - 1];

    // Update task in dataStore
    dataStore.updateTaskData(taskId, { currentStepId: prevStep.id });

    // Update UI state
    set({ activeStepId: prevStep.id });
  },

  connectTaskWithSteps: (taskId) => {
    const dataStore = useDataStore.getState();
    const task = dataStore.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const taskSteps = dataStore.getTaskSteps(taskId);
    if (taskSteps.length === 0) {
      // Create default steps if none exist
      const defaultSteps: Step[] = [
        {
          id: `step-${taskId}-1`,
          taskId,
          title: "Define requirements",
          description: "Define the requirements for this task",
          type: "form",
          status: "pending",
          order: 1,
          config: {
            fields: [
              {
                name: "requirements",
                label: "Requirements",
                type: "textarea",
                required: true,
              },
              {
                name: "notes",
                label: "Additional Notes",
                type: "textarea",
                required: false,
              },
            ],
          },
          result: null,
        },
        {
          id: `step-${taskId}-2`,
          taskId,
          title: "Create document",
          description: "Create a document for this task",
          type: "document",
          status: "pending",
          order: 2,
          config: {},
          result: null,
        },
      ];

      // Add steps to dataStore
      defaultSteps.forEach((step) => dataStore.addStep(step));

      // Update task with current step
      dataStore.updateTaskData(taskId, { currentStepId: defaultSteps[0].id });

      // Update UI state
      set({
        activeTaskId: taskId,
        activeStepId: defaultSteps[0].id,
        showStepWizard: true,
      });
    } else {
      // Use existing steps
      const currentStep = dataStore.getCurrentStep(taskId);

      // Update task with current step if needed
      if (currentStep && !task.currentStepId) {
        dataStore.updateTaskData(taskId, { currentStepId: currentStep.id });
      }

      // Update UI state
      set({
        activeTaskId: taskId,
        activeStepId: currentStep?.id || taskSteps[0].id,
        showStepWizard: true,
      });
    }
  },
}));