// src/views/ScenariosManagementView.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from '@/lib/store';
import { getLayoutComponent } from "@/lib/templates";
import { Scenario } from '@/templates/baseTemplate';
import { useLlmService } from '@/lib/scenarioGeneratorLLM';
import ScenarioManager from '@/components/ScenarioManager';

const ScenariosManagementView: React.FC = () => {
  const { workspace: workspaceId } = useParams<{ workspace: string }>();
  const navigate = useNavigate();
  const llmService = useLlmService();

  // State
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showDownloadDialog, setShowDownloadDialog] = useState<boolean>(false);
  const [newScenarioId, setNewScenarioId] = useState<string>('');

  // Get workspace data and context
  const { selectWorkspace, getCurrentWorkspace, workspaces } = useAppStore();

  // Set active workspace
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, selectWorkspace]);

  const currentWorkspace = getCurrentWorkspace();

  // Handle return
  const handleBack = () => navigate(`/${workspaceId}`);

  // Handle scenario generation completion
  const handleScenarioGenerated = (code: string) => {
    setGeneratedCode(code);
    setShowDownloadDialog(true);
    
    // Extract scenario ID from generated code
    const idMatch = code.match(/id: "([^"]+)"/);
    if (idMatch && idMatch[1]) {
      setNewScenarioId(idMatch[1]);
    }
  };

  // Handle download of generated code
  const handleDownloadCode = () => {
    if (!generatedCode) return;

    // Utwórz plik do pobrania
    const blob = new Blob([generatedCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenario-${newScenarioId || 'new'}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // If workspace not found
  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Workspace not found
          </h2>
          <p className="text-gray-600 mb-4">
            Cannot find workspace with ID:{" "}
            <span className="font-mono">{workspaceId}</span>
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to workspace list
          </button>
        </div>
      </div>
    );
  }

  // Get layout component
  const LayoutComponent = getLayoutComponent(
    currentWorkspace.templateSettings.layoutTemplate
  );

  if (!LayoutComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Layout not found
          </h2>
          <p className="text-gray-600 mb-4">
            Cannot find layout:{" "}
            <span className="font-mono">
              {currentWorkspace.templateSettings.layoutTemplate}
            </span>
          </p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to workspace list
          </button>
        </div>
      </div>
    );
  }

  // Przygotuj scenariusze zgodne z interfejsem Scenario
  const scenariosForManager = currentWorkspace.scenarios.map(scenario => {
    return {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      systemMessage: scenario.systemMessage,
      getSteps: () => scenario.nodes
    } as Scenario;
  });

  return (
    <LayoutComponent
      title="Zarządzanie scenariuszami"
      showBackButton={true}
      onBackClick={handleBack}
    >
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            Generator scenariuszy
          </h2>
          <p className="text-blue-700">
            Wybierz scenariusz wzorcowy i podaj opis nowego scenariusza, a system automatycznie wygeneruje kod źródłowy na podstawie wzorca.
          </p>
        </div>

        <ScenarioManager 
          workspaceId={workspaceId || ''} 
          availableScenarios={scenariosForManager}
          llmService={llmService}
          onScenarioGenerated={handleScenarioGenerated}
        />

        {/* Dialog potwierdzenia pobrania */}
        {showDownloadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-3">Scenariusz wygenerowany!</h3>
              <p className="mb-4">
                Scenariusz został wygenerowany. Co chcesz z nim zrobić?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDownloadDialog(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Zamknij
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Pobierz kod
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutComponent>
  );
};

export default ScenariosManagementView;