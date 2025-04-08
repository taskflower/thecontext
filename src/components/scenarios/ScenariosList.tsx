import React from 'react';
import useStore from "@/store";
import { ContextInfoPlugin } from '@/plugins/ContextInfoPlugin';
import ScenarioItem from './ScenarioItem';

const ScenariosList: React.FC = () => {
  const contextItems = useStore(state => state.contextItems);
  const workspaces = useStore(state => state.workspaces);
  const createScenario = useStore(state => state.createScenario);
  const navigateBack = useStore(state => state.navigateBack);

  const handleCreate = () => {
    const name = prompt("Nazwa scenariusza:");
    if (name?.trim()) {
      createScenario(name);
    }
  };

  return (
    <div className="p-6">
      {/* Renderowanie pluginu informacji o kontekście */}
      {ContextInfoPlugin.renderContextSummary(contextItems)}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={navigateBack}
            className="text-[hsl(var(--primary))] hover:opacity-80 text-sm font-medium"
          >
            ← Powrót
          </button>
          <h2 className="text-xl font-semibold">
            {workspaces.find(w => w.id === useStore.getState().selectedIds.workspace)?.name || "Scenariusze"}
          </h2>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] h-6 w-6 rounded-full flex items-center justify-center hover:bg-opacity-90"
          title="Dodaj scenariusz"
        >+</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces
          .find(w => w.id === useStore.getState().selectedIds.workspace)
          ?.scenarios.map((scenario) => (
            <ScenarioItem key={scenario.id} scenario={scenario} />
          ))}

        {!workspaces
          .find(w => w.id === useStore.getState().selectedIds.workspace)
          ?.scenarios.length && (
          <div className="text-[hsl(var(--muted-foreground))] text-sm italic py-2">
            Brak scenariuszy
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenariosList;