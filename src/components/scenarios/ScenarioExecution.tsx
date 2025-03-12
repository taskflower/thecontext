/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/scenarios/ScenarioExecution.tsx
import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Clock, X, DownloadCloud } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useNodeStore } from "@/stores/nodeStore";

export const ScenarioExecution: React.FC = () => {
  const { currentScenarioId, getScenario } = useScenarioStore();
  const {
    executeScenario,
    getLatestExecution,
    getExecutionsByScenario,
    clearHistory,
  } = useExecutionStore();
  const { getNode } = useNodeStore();

  const [isExecuting, setIsExecuting] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);

  // Get current scenario
  const scenario = currentScenarioId ? getScenario(currentScenarioId) : null;

  // Get executions for this scenario
  const executions = scenario
    ? getExecutionsByScenario(scenario.id).slice(0, 5) // Only show last 5 executions
    : [];

  if (!scenario) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          No active scenario. Please select or create a scenario.
        </CardContent>
      </Card>
    );
  }

  const handleExecuteScenario = async () => {
    if (!scenario) return;

    setIsExecuting(true);
    try {
      await executeScenario(scenario.id);
    } catch (error) {
      console.error("Error executing scenario:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportResults = () => {
    if (!scenario) return;

    const execution = getLatestExecution(scenario.id);
    if (!execution) return;

    const exportObj = {
      executionId: execution.id,
      scenarioName: scenario.name,
      scenarioId: scenario.id,
      timestamp: execution.startTime,
      results: execution.results,
    };

    setExportData(JSON.stringify(exportObj, null, 2));
  };

  const handleClearHistory = () => {
    if (!scenario) return;

    clearHistory(scenario.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            Scenario Execution
          </div>
        </CardTitle>
        <CardDescription>
          Run the current scenario and view execution results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleExecuteScenario}
              disabled={isExecuting}
              className="flex-grow"
            >
              <Play className="h-4 w-4 mr-2" />
              {isExecuting ? "Executing..." : "Execute Scenario"}
            </Button>

            <Button
              variant="outline"
              onClick={handleExportResults}
              disabled={!executions.length}
              title="Export latest results"
            >
              <DownloadCloud className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={handleClearHistory}
              disabled={!executions.length}
              title="Clear execution history"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          {exportData && (
            <Alert className="bg-slate-50">
              <AlertTitle className="flex items-center justify-between">
                <span>Execution Results Export</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExportData(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </AlertTitle>
              <AlertDescription>
                <ScrollArea className="h-60 w-full">
                  <pre className="text-xs font-mono p-2">{exportData}</pre>
                </ScrollArea>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Recent Executions</h3>

            {executions.length === 0 ? (
              <div className="text-center py-4 text-slate-500 border rounded-md">
                No executions yet. Click "Execute Scenario" to run this
                scenario.
              </div>
            ) : (
              <div className="border-red-600">
                {executions.map((execution: any) => (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={
                          execution.status === "completed"
                            ? "text-green-600"
                            : execution.status === "error"
                            ? "text-red-600"
                            : "text-amber-600"
                        }
                      >
                        {execution.status.charAt(0).toUpperCase() +
                          execution.status.slice(1)}
                      </span>
                      <span className="text-slate-500">•</span>
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span>
                        {formatDistanceToNow(execution.startTime, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    <div className="space-y-2 py-2">
                      {Object.entries(execution.results).map(
                        ([nodeId, result]:any) => {
                          const node = getNode(nodeId);
                          return (
                            <div
                              key={nodeId}
                              className="border rounded-md p-2 text-sm"
                            >
                              <div className="font-medium">
                                {node?.type || nodeId}
                              </div>
                              <div className="text-xs mt-1">
                                <div className="font-medium text-slate-500 mb-1">
                                  Output:
                                </div>
                                <pre className="bg-slate-50 p-2 rounded whitespace-pre-wrap overflow-x-auto">
                                  {result.output}
                                </pre>
                              </div>
                            </div>
                          );
                        }
                      )}

                      {execution.error && (
                        <Alert variant="destructive">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{execution.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
