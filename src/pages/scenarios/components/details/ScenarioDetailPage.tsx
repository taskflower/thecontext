import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, Calendar, ChevronLeft } from "lucide-react";
import {
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardHeader,
  CardContent
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
      {/* Header Component */}
      <ScenarioHeader
        scenario={scenario}
        onEditClick={() => setShowEditModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="overview" className="w-full">
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <TabsList className="w-full justify-start border-b p-1">
              <TabsTrigger value="overview" className="flex-1 max-w-[180px]">Overview</TabsTrigger>
              <TabsTrigger value="tasks" className="flex-1 max-w-[180px]">
                Tasks <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-1 text-xs">{scenarioTasks.length}</span>
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex-1 max-w-[180px]">Connections</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-4 space-y-6">
            <ScenarioProgressWidget scenario={scenario} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ScenarioDescriptionWidget scenario={scenario} />
                <ScenarioMilestonesWidget
                  scenario={scenario}
                  tasks={scenarioTasks}
                />
              </div>
              
              <div className="space-y-6">
                <ScenarioStatusWidget scenario={scenario} />
                <ScenarioAudienceWidget scenario={scenario} />
                <ScenarioChannelsWidget scenario={scenario} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <Button className="bg-primary hover:bg-primary/90">
                  Create New Task
                </Button>
              </CardHeader>
              <CardContent>
                {scenarioTasks.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="font-medium text-lg">No tasks created yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create tasks to track work for this scenario
                    </p>
                    <Button className="mt-4" variant="outline">Create Your First Task</Button>
                  </div>
                ) : (
                  <div className="divide-y">
                    {scenarioTasks.map((task) => (
                      <div
                        key={task.id}
                        className="py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer rounded-md -mx-1 px-1"
                      >
                        <div className="space-y-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {task.description || "No description provided"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-6">
                          {task.dueDate && (
                            <div className="text-sm text-muted-foreground flex items-center">
                              <Calendar size={14} className="mr-1" />
                              {task.dueDate}
                            </div>
                          )}
                          <Badge
                            variant="outline"
                            className={
                              task.status === "completed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : task.status === "in-progress"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : task.status === "review"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-gray-50 text-gray-700 border-gray-200"
                            }
                          >
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connections" className="mt-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <ScenarioConnectionsPanel scenarioId={id!} />
              </CardContent>
            </Card>
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