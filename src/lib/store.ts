// src/lib/store.ts
import { create } from "zustand";
import { NodeData, Scenario } from "../../raw_modules/revertcontext-nodes-module/src";

export interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
}

export interface Workspace {
  id: string;
  name: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
}

interface AppState {
  workspaces: Workspace[];
  selectedWorkspace?: string;
  selectedScenario?: string;
  currentNodeIndex: number;
}

interface AppActions {
  selectWorkspace: (workspaceId: string) => void;
  selectScenario: (scenarioId: string) => void;
  nextNode: () => void;
  prevNode: () => void;
  setNodeIndex: (index: number) => void;
}

// Tworzenie domyślnego workspace z ustawieniami szablonów
const createDefaultWorkspace = (): Workspace => {
  const initialNode: NodeData = {
    id: "node-1",
    scenarioId: "scenario-1",
    label: "Welcome",
    assistantMessage: "Hello! What is your name?",
    contextKey: "userName",
    templateId: "basic-step"
  };
  
  const secondNode: NodeData = {
    id: "node-2",
    scenarioId: "scenario-1",
    label: "Greeting",
    assistantMessage: "Nice to meet you, {{userName}}! How can I help you today?",
    contextKey: "userRequest",
    templateId: "llm-query"
  };

  const initialScenario: Scenario = {
    id: "scenario-1",
    name: "First Scenario",
    description: "A simple introduction scenario",
    nodes: [initialNode, secondNode],
  };

  return {
    id: "workspace-1",
    name: "Default Workspace",
    scenarios: [initialScenario],
    templateSettings: {
      layoutTemplate: "default",
      scenarioWidgetTemplate: "card-list",
      defaultFlowStepTemplate: "basic-step"
    }
  };
};

// Tworzenie workspace z szablonami New York Style
const createNewYorkWorkspace = (): Workspace => {
  const initialNode: NodeData = {
    id: "nyc-node-1",
    scenarioId: "nyc-scenario-1",
    label: "Introduction",
    assistantMessage: "Welcome to the New York experience. What's your name?",
    contextKey: "userName",
    templateId: "newyork-standard"
  };
  
  const secondNode: NodeData = {
    id: "nyc-node-2",
    scenarioId: "nyc-scenario-1",
    label: "Question",
    assistantMessage: "Great to meet you, {{userName}}. What brings you here today?",
    contextKey: "userNeed",
    templateId: "newyork-ai"
  };
  
  const thirdNode: NodeData = {
    id: "nyc-node-3",
    scenarioId: "nyc-scenario-1",
    label: "Feedback",
    assistantMessage: "Based on what you've told me about {{userNeed}}, I'd recommend exploring our premium options. How does that sound?",
    contextKey: "userFeedback",
    templateId: "newyork-standard"
  };

  const initialScenario: Scenario = {
    id: "nyc-scenario-1",
    name: "New York Experience",
    description: "A sleek, modern user interaction flow",
    nodes: [initialNode, secondNode, thirdNode],
  };
  
  const secondScenario: Scenario = {
    id: "nyc-scenario-2",
    name: "Quick Survey",
    description: "A brief customer feedback collection",
    nodes: [
      {
        id: "survey-node-1",
        scenarioId: "nyc-scenario-2",
        label: "Survey Start",
        assistantMessage: "We'd love to hear your thoughts on our services. Would you mind taking a quick survey?",
        contextKey: "surveyConsent",
        templateId: "newyork-standard"
      },
      {
        id: "survey-node-2",
        scenarioId: "nyc-scenario-2",
        label: "Rating Question",
        assistantMessage: "On a scale of 1-10, how would you rate your experience with us?",
        contextKey: "userRating",
        templateId: "newyork-form"
      }
    ]
  };

  return {
    id: "workspace-2",
    name: "New York Style Workspace",
    scenarios: [initialScenario, secondScenario],
    templateSettings: {
      layoutTemplate: "newyork-main",
      scenarioWidgetTemplate: "newyork-card",
      defaultFlowStepTemplate: "newyork-standard"
    }
  };
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  workspaces: [createDefaultWorkspace(), createNewYorkWorkspace()],
  selectedWorkspace: "workspace-1",
  selectedScenario: "scenario-1",
  currentNodeIndex: 0,

  selectWorkspace: (workspaceId) =>
    set({
      selectedWorkspace: workspaceId,
      selectedScenario: undefined,
      currentNodeIndex: 0,
    }),

  selectScenario: (scenarioId) =>
    set({
      selectedScenario: scenarioId,
      currentNodeIndex: 0,
    }),

  nextNode: () => {
    const { selectedScenario, workspaces, currentNodeIndex } = get();
    const scenario = workspaces
      .flatMap((w) => w.scenarios)
      .find((s) => s.id === selectedScenario);

    if (scenario && currentNodeIndex < scenario.nodes.length - 1) {
      set((state) => ({ currentNodeIndex: state.currentNodeIndex + 1 }));
    }
  },

  prevNode: () => {
    const { currentNodeIndex } = get();
    if (currentNodeIndex > 0) {
      set((state) => ({ currentNodeIndex: state.currentNodeIndex - 1 }));
    }
  },
  
  setNodeIndex: (index) => {
    set({ currentNodeIndex: index });
  },
}));