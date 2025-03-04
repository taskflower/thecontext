import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ScenariosHeader from "./ScenariosHeader";
import { Card } from "@/components/ui/card";
import ScenarioCard from "./ScenarioCard";
import ScenarioListItem from "./ScenarioListItem";
import { useDataStore, useUIStore } from "@/store";
import NewScenarioModal from "./NewScenarioModal";
import EditScenarioModal from "./EditScenarioModal";
import { Scenario } from "@/types";

const ScenariosView: React.FC = () => {
  const { scenarios } = useDataStore();
  const { 
    viewMode, 
    setActiveTab, 
    toggleNewScenarioModal,
    setViewMode,
    showNewScenarioModal
  } = useUIStore();

  const navigate = useNavigate();
  const { lang } = useParams();

  // State for edit scenario modal
  const [editScenario, setEditScenario] = useState<Scenario | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const toggleEditScenarioModal = (scenario: Scenario | null) => {
    setEditScenario(scenario);
    setShowEditModal(!!scenario);
  };

  // Router-based navigation to folder
  const navigateToFolder = (folderId: string) => {
    navigate(`/admin/${lang}/documents/${folderId}`);
    setActiveTab("documents");
  };

  return (
    <div className="flex-1 flex flex-col">
      <ScenariosHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        toggleNewScenarioModal={toggleNewScenarioModal}
      />
      
      <div className="p-6 flex-1 overflow-auto">
        <h3 className="text-lg font-medium mb-4">Your Scenarios</h3>

        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
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

            {scenarios.map((scenario) => (
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

      {/* Render the modals conditionally */}
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