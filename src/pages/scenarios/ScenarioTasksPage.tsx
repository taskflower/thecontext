// src/pages/scenarios/components/details/ScenarioTasksPage.tsx
import React from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { AlertTriangle, Calendar } from "lucide-react";
import { Badge, Button, Card, CardHeader, CardContent } from "@/components/ui";
import { Scenario } from "@/types";
import { useTaskStore } from "@/store";

type ContextType = { scenario: Scenario };

const ScenarioTasksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  useOutletContext<ContextType>();
  const { tasks } = useTaskStore();
  
  // Filter related data
  const scenarioTasks = tasks.filter((t) => t.scenarioId === id);

  return (
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
  );
};

export default ScenarioTasksPage;