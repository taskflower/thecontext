// src/pages/scenarios/components/details/ScenarioDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, Calendar } from "lucide-react";
import {
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { useScenarioStore, useTaskStore } from "@/store";
import {
  EditScenarioModal,
  ScenarioConnectionsPanel,
  ScenarioHeader,
} from "..";

import { ScenarioAudienceWidget } from "../widgets/ScenarioAudienceWidget";
import { ScenarioChannelsWidget } from "../widgets/ScenarioChannelsWidget";
import { ScenarioDescriptionWidget } from "../widgets/ScenarioDescriptionWidget";
import { ScenarioMilestonesWidget } from "../widgets/ScenarioMilestonesWidget";
import { ScenarioProgressWidget } from "../widgets/ScenarioProgressWidget";
import { ScenarioStatusWidget } from "../widgets/ScenarioStatusWidget";
import { useAdminNavigate } from "@/hooks";

const ScenarioDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useAdminNavigate();
  const { tasks } = useTaskStore();
  const { scenarios } = useScenarioStore();

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter related data
  const scenario = scenarios.find((s) => s.id === id);
  const scenarioTasks = tasks.filter((t) => t.scenarioId === id);

  // Handle scenario not found
  useEffect(() => {
    if (!scenario && id) {
      navigate("/scenarios");
    }
  }, [scenario, id, navigate]);

  if (!scenario) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Scenario Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The scenario you are looking for does not exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/scenarios")}>
            Return to Scenarios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Component */}
      <ScenarioHeader
        scenario={scenario}
        onEditClick={() => setShowEditModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">
              Tasks ({scenarioTasks.length})
            </TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <ScenarioProgressWidget scenario={scenario} />
            <ScenarioDescriptionWidget scenario={scenario} />
            <ScenarioMilestonesWidget
              scenario={scenario}
              tasks={scenarioTasks}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScenarioStatusWidget scenario={scenario} />
              <ScenarioAudienceWidget scenario={scenario} />
              <ScenarioChannelsWidget scenario={scenario} />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <div className="card">
              <div className="card-header flex flex-row items-center justify-between">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <Button>Create New Task</Button>
              </div>
              <div className="card-content">
                {scenarioTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No tasks created yet</p>
                    <p className="text-sm">
                      Create tasks to track work for this scenario
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scenarioTasks.map((task) => (
                      <div
                        key={task.id}
                        className="border rounded-md p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                      >
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description || "No description"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          {task.dueDate && (
                            <div className="text-sm text-muted-foreground">
                              <Calendar size={14} className="inline mr-1" />
                              {task.dueDate}
                            </div>
                          )}
                          <Badge
                            className={
                              task.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : task.status === "in-progress"
                                ? "bg-amber-100 text-amber-800"
                                : task.status === "review"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="connections" className="mt-6">
            <ScenarioConnectionsPanel scenarioId={id!} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Modal */}
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

export default ScenarioDetailPage;
