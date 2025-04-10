// src/InitialDataProvider.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from './lib/store';
import { startTransition } from 'react';

const InitialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { workspace, scenario } = useParams<{ workspace: string; scenario?: string }>();
  const { selectWorkspace, selectScenario } = useAppStore();

  useEffect(() => {
    if (workspace) {
      startTransition(() => {
        // selectWorkspace teraz również inicjalizuje kontekst
        selectWorkspace(workspace);
      });
    }
    if (scenario) {
      startTransition(() => {
        selectScenario(scenario);
      });
    }
  }, [workspace, scenario, selectWorkspace, selectScenario]);

  return <>{children}</>;
};

export default InitialDataProvider;