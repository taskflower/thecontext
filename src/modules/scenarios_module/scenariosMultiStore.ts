// src/modules/scenarios_module/scenariosStore.ts
import { create } from "zustand";
import { Node, Edge } from "./types";

export interface MultiScenario {
  id: string;
  nodes: Record<string, Node>;
  edges: Edge[];
  categories: string[];
  nodeResponses: Record<string, string>;
}

interface ScenariosMultiState {
  scenarios: Record<string, MultiScenario>;
  currentScenarioId: string | null;
  // Ustawia aktywny scenariusz
  setCurrentScenario: (id: string | null) => void;
  // Dodaje nowy scenariusz i ustawia go jako aktywny
  addScenario: (scenario: MultiScenario) => void;
  // Aktualizuje scenariusz poprzez funkcję modyfikującą
  updateScenario: (id: string, updater: (scenario: MultiScenario) => MultiScenario) => void;
  // Usuwa scenariusz o podanym ID
  removeScenario: (id: string) => void;
  // Eksportuje dany scenariusz
  exportScenario: (id: string) => MultiScenario | null;
  // Importuje scenariusz (dodaje go do store)
  importScenario: (scenario: MultiScenario) => void;
}

export const useScenariosMultiStore = create<ScenariosMultiState>((set, get) => ({
  scenarios: {},
  currentScenarioId: null,

  setCurrentScenario: (id) => set({ currentScenarioId: id }),

  addScenario: (scenario) => set((state) => ({
    scenarios: { ...state.scenarios, [scenario.id]: scenario },
    currentScenarioId: scenario.id,
  })),

  updateScenario: (id, updater) => set((state) => {
    const scenario = state.scenarios[id];
    if (!scenario) return {};
    const updatedScenario = updater(scenario);
    return { scenarios: { ...state.scenarios, [id]: updatedScenario } };
  }),

  removeScenario: (id) => set((state) => {
    const newScenarios = { ...state.scenarios };
    delete newScenarios[id];
    const currentScenarioId = state.currentScenarioId === id ? null : state.currentScenarioId;
    return { scenarios: newScenarios, currentScenarioId };
  }),

  exportScenario: (id) => {
    const scenario = get().scenarios[id];
    return scenario ? { ...scenario } : null;
  },

  importScenario: (scenario) => set((state) => ({
    scenarios: { ...state.scenarios, [scenario.id]: scenario },
    currentScenarioId: scenario.id,
  })),
}));
