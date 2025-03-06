// src/pages/projects/components/details/ProjectScenariosPanel.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Unlink, ExternalLink, Plus } from "lucide-react";
import { useScenarioStore } from "@/store";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from "@/components/ui";
import projectService from "../../services/ProjectService";
import scenarioService from "../../../scenarios/services/ScenarioService";
import { useToast } from "@/hooks/useToast";
import AddScenarioModal from "./AddScenarioModal";

interface ProjectScenariosPanelProps {
  projectId: string;
}

export const ProjectScenariosPanel: React.FC<ProjectScenariosPanelProps> = ({ 
  projectId 
}) => {
  const { lang } = useParams();
  const navigate = useNavigate();
  const { scenarios } = useScenarioStore();
  const { toast } = useToast();
  const [showAddScenarioModal, setShowAddScenarioModal] = useState(false);

  // Get the project and its associated scenarios
  const projectWithScenarios = projectService.getProjectWithScenarios(projectId);
  const project = projectWithScenarios;
  
  if (!project) {
    return null;
  }

  const handleRemoveScenario = (scenarioId: string) => {
    if (confirm("Are you sure you want to remove this scenario from the project?")) {
      const result = projectService.removeScenarioFromProject(projectId, scenarioId);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to remove scenario from project",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Scenario removed from project successfully",
          variant: "default"
        });
      }
    }
  };

  const handleNavigateToScenario = (id: string) => {
    navigate(`/admin/${lang}/scenarios/${id}`);
  };

  const toggleAddScenarioModal = () => {
    setShowAddScenarioModal(!showAddScenarioModal);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold">
              Project Scenarios
            </CardTitle>
            <CardDescription>
              Manage scenarios associated with this project
            </CardDescription>
          </div>
          <Button
            onClick={toggleAddScenarioModal}
            disabled={scenarios.length === 0 || scenarios.length === project.scenarios.length}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Scenario
          </Button>
        </CardHeader>
        <CardContent>
          {project.scenarioDetails.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto mb-3 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              <p>No scenarios in this project yet</p>
              <p className="text-sm">
                Add scenarios to this project to organize your work
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {project.scenarioDetails.map((scenario) => {
                // Get statistics from the scenario service
                const stats = scenarioService.getScenarioStats(scenario.id);
                
                return (
                  <div
                    key={scenario.id}
                    className="border rounded-lg p-4 transition-all hover:border-gray-400"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{scenario.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {scenario.description || "No description available"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{stats.progress}%</span>
                      </div>
                      <Progress value={stats.progress} className="h-2" />
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        Tasks: {stats.completedTasks}/{stats.totalTasks}
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
                          onClick={() => handleRemoveScenario(scenario.id)}
                          title="Remove from project"
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddScenarioModal && (
        <AddScenarioModal
          projectId={projectId}
          isOpen={showAddScenarioModal}
          onClose={toggleAddScenarioModal}
        />
      )}
    </>
  );
};

export default ProjectScenariosPanel;