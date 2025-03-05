// src/store/scenarioStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Scenario } from '@/types';
import { ScenarioState } from './scenarioStore.types';


/**
 * ScenarioStore odpowiada wyłącznie za zarządzanie stanem (dane) i atomowe operacje na tych danych.
 * Nie zawiera logiki biznesowej ani walidacji - te są przeniesione do ScenarioService.
 */


export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      // Dane
      scenarios: [],
      
      // Podstawowe operacje CRUD
      getScenarioById: (scenarioId) => {
        return get().scenarios.find(scenario => scenario.id === scenarioId);
      },
      
      addScenario: (scenario) => {
        set((state) => ({ 
          scenarios: [...state.scenarios, scenario] 
        }));
      },
      
      updateScenario: (id, updates) => {
        const scenarioExists = get().scenarios.some(s => s.id === id);
        
        if (!scenarioExists) {
          return false;
        }
        
        set((state) => ({
          scenarios: state.scenarios.map(scenario => 
            scenario.id === id 
              ? { ...scenario, ...updates } 
              : scenario
          )
        }));
        
        return true;
      },
      
      deleteScenario: (id) => {
        const scenarioExists = get().scenarios.some(s => s.id === id);
        
        if (!scenarioExists) {
          return false;
        }
        
        set((state) => ({
          scenarios: state.scenarios.filter(p => p.id !== id)
        }));
        
        return true;
      },
      
      // Proste operacje na powiązaniach
      addConnection: (scenarioId, connectedId) => {
        const scenario = get().getScenarioById(scenarioId);
        
        if (!scenario) {
          return false;
        }
        
        set((state) => ({
          scenarios: state.scenarios.map(s => {
            if (s.id === scenarioId) {
              const connections = s.connections || [];
              return { 
                ...s, 
                connections: [...connections, connectedId]
              } as Scenario; // Jawne rzutowanie typu
            }
            return s;
          })
        }));
        
        return true;
      },
      
      removeConnection: (scenarioId, connectedId) => {
        const scenario = get().getScenarioById(scenarioId);
        
        if (!scenario || !scenario.connections?.includes(connectedId)) {
          return false;
        }
        
        set((state) => ({
          scenarios: state.scenarios.map(s => {
            if (s.id === scenarioId && s.connections) {
              return {
                ...s,
                connections: s.connections.filter(id => id !== connectedId)
              } as Scenario; // Jawne rzutowanie typu
            }
            return s;
          })
        }));
        
        return true;
      },
      
      updateConnectionType: (scenarioId, connectionType) => {
        const scenario = get().getScenarioById(scenarioId);
        
        if (!scenario) {
          return false;
        }
        
        set((state) => ({
          scenarios: state.scenarios.map(s => {
            if (s.id === scenarioId) {
              return { 
                ...s, 
                connectionType 
              } as Scenario; // Jawne rzutowanie typu
            }
            return s;
          })
        }));
        
        return true;
      }
    }),
    {
      name: 'app-scenarios-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        scenarios: state.scenarios
      }),
    }
  )
);