// src/pages/scenarios/components/ScenariosView.tsx
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUIStore, useScenarioStore } from "@/store"; // Import useScenarioStore
import { Scenario } from "@/types";
import { Card } from "@/components/ui";

import EditScenarioModal from "./modals/EditScenarioModal";
import scenarioService, { ScenarioStats } from "../services/ScenarioService";
import { NewScenarioModal, ScenarioCard, ScenarioListItem, ScenariosHeader } from ".";

const ScenariosView: React.FC = () => {
  // Stan dla scenariuszy ze statystykami
  const [scenariosWithStats, setScenariosWithStats] = useState<(Scenario & ScenarioStats)[]>([]);
  
  // Pobieranie stanu UI
  const { viewMode, setActiveTab, toggleNewScenarioModal, setViewMode, showNewScenarioModal } = useUIStore();
  
  // Get the scenarios from the store directly
  const { scenarios } = useScenarioStore();

  const navigate = useNavigate();
  const { lang } = useParams();

  // Pobieranie scenariuszy ze statystykami
  useEffect(() => {
    const fetchScenarios = () => {
      const scenarios = scenarioService.getAllScenariosWithStats();
      setScenariosWithStats(scenarios);
    };
    
    fetchScenarios();
  }, [scenarios]); // Add scenarios as a dependency to re-run when it changes

  // Stan dla edycji scenariusza
  const [editScenario, setEditScenario] = useState<Scenario | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const toggleEditScenarioModal = (scenario: Scenario | null) => {
    setEditScenario(scenario);
    setShowEditModal(!!scenario);
  };

  // Nawigacja do folderu
  const navigateToFolder = (folderId: string) => {
    navigate(`/admin/${lang}/documents/${folderId}`);
    setActiveTab("documents");
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <ScenariosHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        toggleNewScenarioModal={toggleNewScenarioModal}
      />

      <div className="p-4 flex-1 overflow-auto">
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenariosWithStats.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                navigateToFolder={navigateToFolder}
                setActiveTab={setActiveTab}
                toggleEditScenarioModal={toggleEditScenarioModal}
              />
            ))}

            <Card
              className="border border-dashed cursor-pointer hover:bg-secondary/20 transition-colors"
              onClick={toggleNewScenarioModal}
            >
              <div className="p-6 flex flex-col items-center justify-center text-muted-foreground">
                <Plus size={24} />
                <span className="mt-2">Add New Scenario</span>
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <div className="grid grid-cols-12 p-3 font-medium text-sm text-muted-foreground border-b">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Progress</div>
              <div className="col-span-2">Tasks</div>
              <div className="col-span-2">Due Date</div>
              <div className="col-span-1"></div>
            </div>

            {scenariosWithStats.map((scenario) => (
              <ScenarioListItem
                key={scenario.id}
                scenario={scenario}
                navigateToFolder={navigateToFolder}
                setActiveTab={setActiveTab}
                toggleEditScenarioModal={toggleEditScenarioModal}
              />
            ))}
          </Card>
        )}
      </div>

      {/* Renderowanie modali */}
      {showNewScenarioModal && (
        <NewScenarioModal toggleNewScenarioModal={toggleNewScenarioModal} />
      )}

      <EditScenarioModal
        scenario={editScenario}
        isOpen={showEditModal}
        onClose={() => toggleEditScenarioModal(null)}
      />
    </div>
  );
};

export default ScenariosView;