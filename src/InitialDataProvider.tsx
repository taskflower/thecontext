// src/InitialDataProvider.tsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from './lib/store';
import { useContextStore } from './lib/contextStore';
import { startTransition } from 'react';

const InitialDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { workspace, scenario } = useParams<{ workspace: string; scenario?: string }>();
  const { selectWorkspace, selectScenario } = useAppStore();
  const setActiveWorkspace = useContextStore(state => state.setActiveWorkspace);

  useEffect(() => {
    if (workspace) {
      startTransition(() => {
        selectWorkspace(workspace);
        setActiveWorkspace(workspace);
      });
    }
    if (scenario) {
      startTransition(() => {
        selectScenario(scenario);
      });
    }
  }, [workspace, scenario, selectWorkspace, selectScenario, setActiveWorkspace]);

  return <>{children}</>;
};

export default InitialDataProvider;
