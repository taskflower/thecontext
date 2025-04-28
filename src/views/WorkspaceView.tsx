import { useApplicationStore } from "@/hooks";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/hooks/stateManagment/useWorkspaceStore";

interface Module {
  default: React.ComponentType<any>; // Updated to accept props
}

export const WorkspaceView: React.FC = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { fetchApplicationById, getCurrentApplication, isLoading, error } =
    useApplicationStore();
  const { selectWorkspace } = useWorkspaceStore();

  const [layoutComponent, setLayoutComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [cardListComponent, setCardListComponent] = useState<React.ComponentType<any> | null>(null);

  // Get current application
  const currentApplication = getCurrentApplication();
  const workspaces = currentApplication?.workspaces || [];

  // Prepare workspace data for card list
  const workspaceData = useMemo(() => {
    return workspaces.map(workspace => ({
      id: workspace.id,
      name: workspace.name,
      description: workspace.description || `Template: ${workspace.templateSettings?.layoutTemplate}`,
      count: workspace.scenarios?.length || 0,
      countLabel: "scenarios",
      icon: workspace.icon || "briefcase",
    }));
  }, [workspaces]);

  // Handle workspace selection
  const handleSelect = (workspaceId: string) => {
    selectWorkspace(workspaceId);
    navigate(`/${workspaceId}`);
  };

  const handleBackClick = () => navigate('/');

  // Determine template to use (from application settings or default)
  const templateName = useMemo(() => {
    return currentApplication?.templateSettings?.template || "default";
  }, [currentApplication]);

  // Fetch application data once when component mounts or applicationId changes
  useEffect(() => {
    if (applicationId) {
      fetchApplicationById(applicationId);
    }
  }, [applicationId, fetchApplicationById]);

  // Load the card list component
  useEffect(() => {
    const loadCardListComponent = async () => {
      try {
        // Definiujemy ścieżkę do komponentu
        const cardListPath = `/src/templates/${templateName}/widgets/card-list.tsx`;
        // Pobierz wszystkie moduły widgetów
        const modules = import.meta.glob("/src/templates/*/widgets/*.tsx");
        
        if (modules[cardListPath]) {
          const module = await modules[cardListPath]();
          setCardListComponent(() => module.default);
          return;
        }
        
        // Alternatywne próby znalezienia komponentu
        for (const path in modules) {
          const pathLower = path.toLowerCase();
          if ((pathLower.includes('card') && pathLower.includes('list')) || 
              pathLower.includes('cardlist')) {
            try {
              const module = await modules[path]();
              if (module.default) {
                setCardListComponent(() => module.default);
                return;
              }
            } catch (err) {
              console.error(`Próba załadowania ${path} nie powiodła się:`, err);
            }
          }
        }
        
        // Jeśli nie znaleziono, użyj fallbacku
        throw new Error(`Nie znaleziono komponentu CardList dla szablonu ${templateName}`);
      } catch (error) {
        console.error("Błąd ładowania komponentu CardList:", error);
        
        // Fallback komponent przy błędzie
        const FallbackCardList: React.FC<any> = ({ data = [], onSelect }) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(data) ? data : []).map((item: any) => (
              <div
                key={item.id || Math.random().toString(36).substring(7)}
                onClick={() => onSelect && onSelect(item.id)}
                className="group bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">{item.name || 'Brak nazwy'}</h3>
                {item.description && <p className="text-sm text-gray-500 mb-3">{item.description}</p>}
                {item.count !== undefined && (
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{item.count} {item.countLabel || 'elementów'}</span>
                    <span className="text-gray-500">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
        
        setCardListComponent(() => FallbackCardList);
      }
    };

    if (templateName) {
      loadCardListComponent();
    }
  }, [templateName]);

  // Load the appropriate layout component based on template
  const loadLayoutComponent = useCallback(async () => {
    if (!templateName) return;

    try {
      // Use dynamic import with the template name
      const layoutPath = `/src/templates/${templateName}/layouts/SimpleLayout.tsx`;
      const modules = import.meta.glob("/src/templates/*/layouts/*.tsx");

      if (!modules[layoutPath]) {
        throw new Error(`Layout ${layoutPath} not found`);
      }

      const module = (await modules[layoutPath]()) as Module;
      const ComponentToRender = module.default;

      setLayoutComponent(() => ComponentToRender);
      setLoadingError(null);
    } catch (error) {
      console.error("Error loading layout component:", error);
      setLoadingError(
        `Failed to load layout: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setLayoutComponent(null);
    }
  }, [templateName]);

  // Load the layout component when application or template changes
  useEffect(() => {
    if (currentApplication) {
      loadLayoutComponent();
    }
  }, [currentApplication, loadLayoutComponent]);

  // Render based on state
  if (isLoading) {
    return <div className="p-4">Loading application data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (loadingError) {
    return <div className="p-4 text-red-500">Layout error: {loadingError}</div>;
  }

  if (!currentApplication) {
    return (
      <div className="p-4">No application found with ID: {applicationId}</div>
    );
  }

  // Render workspace card list if no workspaces are available
  const renderWorkspaceContent = () => {
    if (workspaces.length === 0) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-700">Brak dostępnych workspaces w tej aplikacji.</p>
        </div>
      );
    }

    if (!cardListComponent) {
      return <div className="p-4">Loading workspace cards...</div>;
    }

    // Render the CardList component with workspace data
    return React.createElement(cardListComponent, {
      data: workspaceData,
      onSelect: handleSelect
    });
  };

  // Use proper JSX syntax for dynamic components with props
  return layoutComponent ? (
    React.createElement(layoutComponent, {
      title: currentApplication.name,
      onBackClick: handleBackClick,
      children: (
        <div className="space-y-6">
          {renderWorkspaceContent()}
        </div>
      )
    })
  ) : (
    <div className="p-4">Loading layout component...</div>
  );
};

export default WorkspaceView;