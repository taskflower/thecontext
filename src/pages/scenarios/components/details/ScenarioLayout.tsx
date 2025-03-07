import React, { useState, useEffect } from "react";
import { useParams, Outlet, NavLink } from "react-router-dom";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";

import { useAdminNavigate } from "@/hooks";

import scenarioService from "../../services/ScenarioService";
import { EditScenarioModal, ScenarioHeader } from "..";

const ScenarioLayout: React.FC = () => {
  const { id, lang } = useParams<{ id: string; lang: string }>();
  const navigate = useAdminNavigate();
  
  // Stan dla modalu edycji
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Pobieranie scenariusza przez serwis
  const scenario = id ? scenarioService.getScenarioById(id) : undefined;
  const scenarioTasks = id ? scenarioService.getScenarioTasks(id) : [];

  // Obsługa przypadku, gdy scenariusz nie istnieje
  useEffect(() => {
    if (!scenario && id) {
      navigate("/scenarios");
    }
  }, [scenario, id, navigate]);

  if (!scenario || !id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6 px-6 pb-8 text-center">
            <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Scenario Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The scenario you are looking for does not exist or has been deleted.
            </p>
            <Button 
              onClick={() => navigate("/scenarios")} 
              className="w-full flex items-center justify-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Return to Scenarios
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Nagłówek */}
      <ScenarioHeader
        scenario={scenario}
        onEditClick={() => setShowEditModal(true)}
      />

      {/* Główna zawartość */}
      <main className="flex-1 overflow-auto p-4 mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="w-full justify-start border-b p-1">
            <div className="flex">
              <NavLink
                to={`/admin/${lang || 'en'}/scenarios/${id}`}
                end
                className={({ isActive }) => 
                  `py-2 px-4 text-sm font-medium flex-1 max-w-[180px] text-center ${
                    isActive ? 'bg-primary/10 text-primary rounded-md' : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Overview
              </NavLink>
              <NavLink
                to={`/admin/${lang || 'en'}/scenarios/${id}/tasks`}
                className={({ isActive }) => 
                  `py-2 px-4 text-sm font-medium flex-1 max-w-[180px] text-center ${
                    isActive ? 'bg-primary/10 text-primary rounded-md' : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Tasks <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-1 text-xs">{scenarioTasks.length}</span>
              </NavLink>
              <NavLink
                to={`/admin/${lang || 'en'}/scenarios/${id}/connections`}
                className={({ isActive }) => 
                  `py-2 px-4 text-sm font-medium flex-1 max-w-[180px] text-center ${
                    isActive ? 'bg-primary/10 text-primary rounded-md' : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                Connections
              </NavLink>
            </div>
          </div>
        </div>

        {/* Outlet dla zagnieżdżonych tras */}
        <Outlet context={{ scenario }} />
      </main>

      {/* Modal edycji */}
      {showEditModal && (
        <EditScenarioModal
          scenario={scenario}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default ScenarioLayout;