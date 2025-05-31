// src/modules/appTree/hooks/useAppTree.ts - Optional hook for state management
import { useState, useCallback } from 'react';

interface UseAppTreeReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useAppTree = (): UseAppTreeReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

// src/modules/appTree/types/index.ts - Type definitions
export interface AppConfig {
  name: string;
  tplDir: string;
  defaultWorkspace: string;
  defaultScenario: string;
}

export interface WorkspaceInfo {
  slug: string;
  name: string;
  scenarios: ScenarioInfo[];
}

export interface ScenarioInfo {
  slug: string;
  name: string;
  nodes: NodeInfo[];
}

export interface NodeInfo {
  slug: string;
  label: string;
  order: number;
  tplFile: string;
}

export interface AppTreeCardProps {
  onClose: () => void;
  configName?: string;
  className?: string;
}

export interface AppTreeViewProps {
  configName: string;
  onNavigate?: () => void;
  onWorkspaceSelect?: (workspace: WorkspaceInfo) => void;
  onScenarioSelect?: (workspace: WorkspaceInfo, scenario: ScenarioInfo) => void;
}