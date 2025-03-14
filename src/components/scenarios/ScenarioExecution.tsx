/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/scenarios/ScenarioExecution.tsx
import React, { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Clock,
  X,
  DownloadCloud,
  Loader,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useExecutionStore } from "@/stores/executionStore";
import { useNodeStore } from "@/stores/nodeStore";
import { usePluginStore } from "@/stores/pluginStore";

// Import the PluginModule type for type checking
import type { PluginModule } from "@/plugins/PluginInterface";

export const ScenarioExecution: React.FC = () => {
  const { currentScenarioId, getScenario } = useScenarioStore();
  const executeExecutionStore = useExecutionStore();
  const {
    getLatestExecution,
    getExecutionsByScenario,
    clearHistory,
    startExecution,
    executeNode,
    completeExecution,
    calculateExecutionOrder,
  } = executeExecutionStore;
  const { getNode, updateNodePluginConfig } = useNodeStore();
  const { isPluginActive, plugins } = usePluginStore();

  // Execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [exportData, setExportData] = useState<string | null>(null);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [isExecutionDialogOpen, setIsExecutionDialogOpen] = useState(false);

  // Step execution states
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [executionOrder, setExecutionOrder] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const [nodeContent, setNodeContent] = useState("");
  const [waitingForUserInput, setWaitingForUserInput] = useState(false);
  const [waitingForPlugin, setWaitingForPlugin] = useState(false);

  // Get current scenario
  const scenario = currentScenarioId ? getScenario(currentScenarioId) : null;

  // Get executions for this scenario
  const executions = scenario
    ? getExecutionsByScenario(scenario.id).slice(0, 5) // Only show last 5 executions
    : [];

  // Reset execution state between runs
  const resetExecutionState = () => {
    setIsExecutionDialogOpen(false);
    setCurrentNodeIndex(0);
    setExecutionOrder([]);
    setCurrentNodeId(null);
    setUserMessage("");
    setNodeContent("");
    setWaitingForUserInput(false);
    setWaitingForPlugin(false);
    setExecutionId(null);
  };

  // Get current node info for display
  const getCurrentNodeInfo = () => {
    if (!currentNodeId) return null;

    const node = getNode(currentNodeId);
    if (!node) return null;

    return {
      id: node.id,
      type: node.type,
      label: node.data.label || node.type,
      prompt: node.data.prompt || "",
      hasPlugin: !!node.data.pluginId,
      pluginId: node.data.pluginId,
      pluginConfig: node.data.pluginConfig,
    };
  };

  // Process the current node - show prompt, trigger plugin, or get user input
  const processCurrentNode = async () => {
    if (!executionId || !currentNodeId) return;

    const node = getNode(currentNodeId);
    if (!node) return;

    try {
      const originalPrompt = node.data.prompt || "";
      const processedPrompt = await executeExecutionStore.processVariables(
        originalPrompt,
        executionId
      );

      setNodeContent(processedPrompt);

      // Jeśli node ma plugin, zaktualizuj jego konfigurację
      if (node.data.pluginId && isPluginActive(node.data.pluginId)) {
        const currentConfig = node.data.pluginConfig || {};

        // Zaktualizuj konfigurację pluginu o aktualne dane
        updateNodePluginConfig(currentNodeId, {
          ...currentConfig,
          nodePrompt: processedPrompt,
          // Możesz dodać nodeResponse jeśli masz dostęp do poprzedniego wyniku
        });

        setWaitingForPlugin(true);
        setWaitingForUserInput(false);
      } else {
        setWaitingForUserInput(true);
        setWaitingForPlugin(false);
      }
    } catch (error) {
      console.error("Error processing node variables:", error);
      setNodeContent(node.data.prompt || "");
      setWaitingForUserInput(true);
      setWaitingForPlugin(false);
    }
  };

  // Handle user input submission for the current node
  const handleSubmitUserMessage = async () => {
    if (!executionId || !currentNodeId) return;

    try {
      // Pass the user message to execute the node
      await executeNode(executionId, currentNodeId, userMessage);
      moveToNextNode();
    } catch (error) {
      console.error(error);
    }
  };

  // Handle plugin completion
  const handlePluginComplete = async (pluginMessage: string) => {
    if (!executionId || !currentNodeId) return;

    try {
      await executeNode(executionId, currentNodeId, pluginMessage);
      setWaitingForPlugin(false);
      moveToNextNode();
    } catch (error) {
      console.error("Error processing plugin result:", error);
      completeExecution(
        executionId,
        "error",
        error instanceof Error ? error.message : String(error)
      );
      setIsExecutionDialogOpen(false);
    }
  };

  // Move to the next node in the execution order
  const moveToNextNode = () => {
    // Reset state for next node
    setUserMessage("");
    setNodeContent("");
    setWaitingForUserInput(false);
    setWaitingForPlugin(false);

    // Check if we're at the end
    if (currentNodeIndex >= executionOrder.length - 1) {
      if (executionId) {
        completeExecution(executionId, "completed");
      }
      setIsExecutionDialogOpen(false);
      setIsExecuting(false);
      return;
    }

    // Move to next node
    const nextIndex = currentNodeIndex + 1;
    setCurrentNodeIndex(nextIndex);
    setCurrentNodeId(executionOrder[nextIndex]);
  };

  // Initialize and start the execution process
  const startScenarioExecution = async () => {
    if (!scenario) return;

    setIsExecuting(true);

    try {
      // Reset any previous processedPrompt values in all nodes
      const nodeStore = useNodeStore.getState();
      const scenarioNodes = nodeStore.getNodesByScenario(scenario.id);
      scenarioNodes.forEach((node) => {
        if (node.data.processedPrompt) {
          nodeStore.updateNodeData(node.id, { processedPrompt: null });
        }
      });

      // Start a new execution
      const newExecutionId = startExecution(scenario.id);
      setExecutionId(newExecutionId);

      // Calculate execution order once at the beginning
      const order = await calculateExecutionOrder(scenario.id);
      setExecutionOrder(Array.isArray(order) ? order : []);

      // Begin execution if there are nodes to execute
      if (order.length > 0) {
        setCurrentNodeIndex(0);
        setCurrentNodeId(order[0]);
        setIsExecutionDialogOpen(true);
      } else {
        completeExecution(newExecutionId, "completed");
        setIsExecuting(false);
      }
    } catch (error) {
      console.error("Error initializing execution:", error);
      setIsExecuting(false);
    }
  };

  // Process current node when it changes
  useEffect(() => {
    if (isExecutionDialogOpen && currentNodeId) {
      processCurrentNode();
    }
  }, [currentNodeId, isExecutionDialogOpen]);

  // Handle dialog close
  const handleDialogClose = () => {
    if (executionId) {
      completeExecution(executionId, "interrupted");
    }
    resetExecutionState();
    setIsExecuting(false);
  };

  // Export execution results
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

  // Clear execution history
  const handleClearHistory = () => {
    if (!scenario) return;
    clearHistory(scenario.id);
  };

  // No active scenario message
  if (!scenario) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-slate-500">
          No active scenario. Please select or create a scenario.
        </CardContent>
      </Card>
    );
  }

  // Current node info for display
  const currentNode = getCurrentNodeInfo();

  // Plugin component for execution view
  const ExecutionPluginView: React.FC<{
    pluginId: string;
    nodeId: string;
    onComplete: (output: string) => void;
  }> = ({ pluginId, nodeId, onComplete }) => {
    const plugin = plugins[pluginId] as PluginModule;

    if (!plugin || !plugin.ViewComponent) {
      return <div>Plugin not found or missing view component</div>;
    }

    const ViewComponent = plugin.ViewComponent;
    const config = currentNode?.pluginConfig || plugin.defaultConfig || {};

    return (
      <div className="plugin-execution-container">
        <ViewComponent
          nodeId={nodeId}
          config={config}
          onProcessComplete={onComplete}
        />
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 " />
              Scenario Execution
            </div>
          </CardTitle>
          <CardDescription>
            Run the current scenario and interact with each step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={startScenarioExecution}
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
                <div>
                  {executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="mb-4 border rounded-md p-3"
                    >
                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span
                          className={
                            execution.status === "completed"
                              ? "text-green-600"
                              : execution.status === "error"
                              ? "text-red-600"
                              : execution.status === "interrupted"
                              ? "text-amber-600"
                              : "text-blue-600"
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
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                          <thead className="border-b text-gray-400">
                            <tr>
                              <th className="px-2 py-1 w-1/5">Step</th>
                              <th className="px-2 py-1 w-2/5">Prompt</th>
                              <th className="px-2 py-1 w-2/5">Message</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(execution.results).map(
                              ([nodeId, result]: any) => {
                                const node = getNode(nodeId);
                                return (
                                  <tr key={nodeId} className="border-b">
                                    <td className="px-2 py-1 font-medium">
                                      {node?.type || nodeId}
                                    </td>
                                    <td className="px-2 py-1">
                                      <pre className="whitespace-pre-wrap">
                                        {result.prompt}
                                      </pre>
                                    </td>
                                    <td className="px-2 py-1">
                                      <pre className="whitespace-pre-wrap">
                                        {result.message}
                                      </pre>
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </div>
                      {execution.error && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{execution.error}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Execution dialog */}
      <Dialog
        open={isExecutionDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
        }}
      >
        <DialogContent className="sm:max-w-2xl h-[90vh] flex flex-col  ">
          <DialogHeader>
            <DialogTitle>
              <p className="font-medium pb-2 text-sm">Executing Scenario:</p>
              <p className="pb-0.5 text-xl">{scenario.name}</p>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Step {currentNodeIndex + 1} of {executionOrder.length}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex-1 flex flex-col">
            <div className="flex-1"></div>
            {currentNode && (
              <div className="space-y-4">
                <div className="mb-6 border-b">
                  <h3 className="text-4xl font-bold uppercase">
                    {currentNode.label}
                  </h3>
                  <span className="text-xs text-slate-300">
                    Node ID: {currentNode.id}
                  </span>
                </div>

                {/* Plugin execution */}
                {currentNode.hasPlugin && waitingForPlugin && (
                  <>
                    {currentNode.pluginId && (
                      <ExecutionPluginView
                        pluginId={currentNode.pluginId}
                        nodeId={currentNode.id}
                        onComplete={handlePluginComplete}
                      />
                    )}
                  </>
                )}

                {/* User input workflow */}
                {!currentNode.hasPlugin && waitingForUserInput && (
                  <div className="space-y-4">
                    {nodeContent && (
                      <div className="border rounded-md p-3 bg-slate-50">
                        <div className="text-sm font-medium mb-2">Prompt:</div>
                        <div className="whitespace-pre-wrap text-sm">
                          {nodeContent}
                        </div>
                      </div>
                    )}
                    <div>
                      <label
                        htmlFor="userMessage"
                        className="block text-sm font-medium mb-1"
                      >
                        Message:
                      </label>
                      <Textarea
                        id="userMessage"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder="Enter your response..."
                        rows={6}
                        className="w-full border-black border-2"
                      />
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {!waitingForUserInput && !waitingForPlugin && (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                    <p>Processing node...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            {waitingForUserInput && (
              <div className="flex gap-2 w-full justify-between">
                <Button
                  size={"lg"}
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel Execution
                </Button>
                <Button
                  size={"lg"}
                  onClick={handleSubmitUserMessage}
                  disabled={!userMessage.trim()}
                >
                  Submit <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
