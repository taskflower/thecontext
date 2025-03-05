// src/pages/scenarios/components/details/ScenarioConnectionsPanel.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link2, Unlink, ExternalLink } from "lucide-react";
import { useScenarioStore } from "@/store";
import { ConnectionModal } from "..";
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Progress 
} from "@/components/ui";
import { ConnectionTypeBadge } from "@/components/status";


interface ScenarioConnectionsPanelProps {
  scenarioId: string;
}

export const ScenarioConnectionsPanel: React.FC<
  ScenarioConnectionsPanelProps
> = ({ scenarioId }) => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { scenarios, getConnectedScenarios, removeScenarioConnection } =
    useScenarioStore();
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const currentScenario = scenarios.find((s) => s.id === scenarioId);
  const connectedScenarios = getConnectedScenarios(scenarioId);

  if (!currentScenario) {
    return null;
  }

  const handleDisconnect = (connectedId: string) => {
    if (confirm("Are you sure you want to remove this connection?")) {
      removeScenarioConnection(scenarioId, connectedId);
    }
  };

  const handleNavigateToScenario = (id: string) => {
    navigate(`/admin/${lang}/scenarios/${id}`);
  };

  const toggleConnectionModal = () => {
    setShowConnectionModal(!showConnectionModal);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold">
              Connected Scenarios
            </CardTitle>
            <CardDescription>
              Link this scenario with others to create dependencies or
              relationships
            </CardDescription>
          </div>
          <Button
            onClick={toggleConnectionModal}
            disabled={scenarios.length <= 1}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Connect Scenario
          </Button>
        </CardHeader>
        <CardContent>
          {connectedScenarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No connected scenarios yet</p>
              <p className="text-sm">
                Connect this scenario with others to establish relationships
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {connectedScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="border rounded-lg p-4 transition-all hover:border-gray-400"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center mb-2">
                        <h4 className="font-medium">{scenario.title}</h4>
                        <div className="ml-2">
                          <ConnectionTypeBadge
                            type={scenario.connections?.includes(scenarioId)
                              ? scenario.connectionType
                              : currentScenario.connectionType}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {scenario.description || "No description available"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{scenario.progress}%</span>
                    </div>
                    <Progress value={scenario.progress} className="h-2" />
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Tasks: {scenario.completedTasks}/{scenario.tasks}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleNavigateToScenario(scenario.id)}
                        title="View scenario"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDisconnect(scenario.id)}
                        title="Remove connection"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showConnectionModal && (
        <ConnectionModal
          scenarioId={scenarioId}
          isOpen={showConnectionModal}
          onClose={toggleConnectionModal}
        />
      )}
    </>
  );
};

export default ScenarioConnectionsPanel;