// src/pages/scenarios/components/ScenariosView.tsx
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useScenarioStore, useUIStore } from "@/store";
import { Scenario } from "@/types";
import { Card } from "@/components/ui";
import { EditScenarioModal, NewScenarioModal, ScenarioCard, ScenarioListItem, ScenariosHeader } from ".";
import scenarioService, { ScenarioStats } from "../services/ScenarioService";

const ScenariosView: React.FC = () => {
  // State for scenarios with statistics
  const [scenariosWithStats, setScenariosWithStats] = useState<(Scenario & ScenarioStats)[]>([]);
  
  // Getting UI state
  const { viewMode, setActiveTab, toggleNewScenarioModal, setViewMode, showNewScenarioModal } = useUIStore();

  const navigate = useNavigate();
  const { lang } = useParams();

  // Fetch scenarios with stats
  useEffect(() => {
    const fetchScenarios = () => {
      const scenarios = scenarioService.getAllScenariosWithStats();
      setScenariosWithStats(scenarios);
    };
    
    fetchScenarios();
    
    // We need to listen to scenario store changes
    const unsubscribe = useScenarioStore.subscribe(fetchScenarios);
    
    return () => {
      unsubscribe();
    };
  }, []);

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
    <div className="flex-1 flex flex-colp bg-gray-50 flex-col">
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