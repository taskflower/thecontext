// src/views/ScenarioView.tsx
import React, { Suspense, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getLayoutComponent, getWidgetComponent } from "../tpl";
import { useWorkspaceStore } from "@/hooks/stateManagment/useWorkspaceStore";
import { Scenario, LayoutProps, WidgetProps } from "@/types";
import SharedLoader from "@/components/SharedLoader";

export const ScenarioView: React.FC = () => {
  const navigate = useNavigate();
  const { workspace, application } = useParams();
  const { selectWorkspace, getCurrentWorkspace, isLoading } = useWorkspaceStore();

  useEffect(() => {
    if (workspace) selectWorkspace(workspace);
  }, [workspace, selectWorkspace]);
  
  const currentWorkspace = getCurrentWorkspace();

  if (isLoading) return <SharedLoader message="Ładowanie workspace..." fullScreen={true} />;
  if (!currentWorkspace) return <Navigate to="/" replace />;

  const layoutName = currentWorkspace.templateSettings?.layoutTemplate || "default";
  const LayoutComponent = getLayoutComponent(layoutName);

  if (!LayoutComponent) return <div>Layout not found: {layoutName}</div>;
  const LayoutComponentWithType = LayoutComponent as React.ComponentType<LayoutProps>;

  const handleSelectScenario = (scenarioId: string) => 
    navigate(`/${workspace}/${scenarioId}`);

  const handleBack = () => {
    if (application) {
      navigate(`/app/${application}`);
    } else {
      navigate('/');
    }
  };

  // Dane dla widgetów
  const scenarioData = (currentWorkspace.scenarios || []).map((scenario: Scenario) => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    count: scenario.nodes?.length || 0,
    countLabel: "steps",
    icon: scenario.icon || "default-icon",
  }));

  const headerData = {
    title: currentWorkspace.name,
    description: currentWorkspace.description,
    backLink: application ? `/app/${application}` : '/',
    backText: 'Wróć do listy workspaces'
  };

  return (
    <Suspense fallback={<SharedLoader message="Ładowanie komponentów..." />}>
      <LayoutComponentWithType title={currentWorkspace.name} onBackClick={handleBack}>
        {/* Renderuj widgety zgodnie z konfiguracją */}
        {currentWorkspace.templateSettings?.widgets?.map((widgetConfig: any, index: number) => {
          const { type, data } = widgetConfig;
          const WidgetComponent = getWidgetComponent(type);
          
          if (!WidgetComponent) {
            return <div key={index}>Widget type not found: {type}</div>;
          }
          
          const WidgetComponentWithType = WidgetComponent as React.ComponentType<WidgetProps>;
          
          // Wybierz odpowiednie dane dla widgetu
          let widgetData;
          if (type === 'card-list' && data === 'scenarios') {
            widgetData = scenarioData;
          } else if (type === 'info' && data === 'header') {
            widgetData = headerData;
          } else {
            widgetData = widgetConfig.data || {};
          }
          
          return (
            <div key={index} className="mb-6">
              <WidgetComponentWithType 
                data={widgetData} 
                onSelect={type === 'card-list' ? handleSelectScenario : (path) => navigate(path)}
                attrs={widgetConfig.attrs}
              />
            </div>
          );
        })}
        
        {/* Jeśli nie ma zdefiniowanych widgetów, pokaż domyślne */}
        {(!currentWorkspace.templateSettings?.widgets || currentWorkspace.templateSettings.widgets.length === 0) && (
          <>
            
            
            {(() => {
              const DefaultWidget = getWidgetComponent("card-list");
              if (!DefaultWidget) return <div>Default widget not found</div>;
              const DefaultWidgetWithType = DefaultWidget as React.ComponentType<WidgetProps>;
              return <DefaultWidgetWithType data={scenarioData} onSelect={handleSelectScenario} />;
            })()}
          </>
        )}
      </LayoutComponentWithType>
    </Suspense>
  );
};

export default ScenarioView;  