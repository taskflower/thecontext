// Updated LayoutProvider.tsx - add ScenariosProvider
import React, { createContext, useContext, useMemo } from 'react';
import { useAppNavigation, useConfig, useDynamicComponent } from '../index';
import { AppConfig, WorkspaceConfig } from '../types';
import { ScenariosProvider } from './ScenariosProvider';

interface LayoutContextType {
  LayoutComponent: React.ComponentType<{ children: React.ReactNode }> | null;
  layoutLoading: boolean;
}

const LayoutContext = createContext<LayoutContextType>({
  LayoutComponent: null,
  layoutLoading: true,
});

export const useLayout = () => useContext(LayoutContext);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, workspace } = useAppNavigation();
  
  const { config: appConfig } = useConfig<AppConfig>(`/src/configs/${config}/app.json`);
  const { config: workspaceConfig, loading: workspaceLoading } = useConfig<WorkspaceConfig>(
    `/src/configs/${config}/workspaces/${workspace}.json`
  );
  
  const LayoutComponent = useDynamicComponent(
    appConfig?.tplDir ? `themes/${appConfig.tplDir}/layouts` : undefined,
    workspaceConfig?.templateSettings?.layoutFile
  );

  const value = useMemo(() => ({
    LayoutComponent,
    layoutLoading: workspaceLoading || !LayoutComponent,
  }), [LayoutComponent, workspaceLoading]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

