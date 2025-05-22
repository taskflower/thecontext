// engine/store/scenariosStore.ts
type Subscriber = () => void;

class ScenariosStore {
  private cache: Record<string, string[]> = {};
  private subscribers: Set<Subscriber> = new Set();

  getScenarios(config: string, workspace: string): string[] {
    const key = `${config}/${workspace}`;
    
    if (!this.cache[key]) {
      this.loadScenarios(config, workspace);
      return [];
    }
    
    return this.cache[key];
  }

  private loadScenarios(config: string, workspace: string) {
    const key = `${config}/${workspace}`;
    const scenarioModules = import.meta.glob('/src/configs/*/scenarios/*/*.json');
    const pattern = `/src/configs/${config}/scenarios/${workspace}/`;
    const allPaths = Object.keys(scenarioModules);
    const filteredPaths = allPaths.filter(path => path.startsWith(pattern));
    const scenarioFiles = filteredPaths.map(path => path.replace(pattern, '').replace('.json', ''));
    
    this.cache[key] = scenarioFiles;
    this.notifySubscribers();
  }

  subscribe(callback: Subscriber) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }
}

export const scenariosStore = new ScenariosStore();

// engine/hooks/useAppScenarios.ts
import { useState, useEffect } from "react";
import { scenariosStore } from "../store/scenariosStore";

export const useAppScenarios = (config?: string, workspace?: string) => {
  const [scenarios, setScenarios] = useState<string[]>([]);

  useEffect(() => {
    if (!config || !workspace) {
      setScenarios([]);
      return;
    }

    const updateScenarios = () => {
      setScenarios(scenariosStore.getScenarios(config, workspace));
    };

    updateScenarios();
    return scenariosStore.subscribe(updateScenarios);
  }, [config, workspace]);

  return { scenarios, loading: false };
};