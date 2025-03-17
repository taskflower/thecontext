// src/modules/flow/FlowPlayer.tsx
import { useCallback, useState, useEffect } from "react";
import { Play } from "lucide-react";
import { useAppStore } from "../store";
import { StepModal } from "@/components/APPUI";
import { GraphNode } from "../types";
import { calculateFlowPath } from "./flowUtils";
import { MessageProcessor } from "../plugin/components/MessageProcessor";
import { pluginRegistry } from "../plugin/plugin-registry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceContext } from "../context/hooks/useContext";

export const FlowPlayer: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const addToConversation = useAppStore((state) => state.addToConversation);
  const clearConversation = useAppStore((state) => state.clearConversation);
  const setUserMessage = useAppStore((state) => state.setUserMessage);

  // Use context hook
  const context = useWorkspaceContext();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState<GraphNode[]>([]);

  // State for processed messages
  const [processedMessage, setProcessedMessage] = useState<string | null>(null);

  // Reset processed message when step changes
  useEffect(() => {
    setProcessedMessage(null);
  }, [currentNodeIndex]);

  const saveCurrentNodeMessages = useCallback(() => {
    const currentNode = flowPath[currentNodeIndex];
    if (currentNode) {
      if (currentNode.assistant) {
        const messageWithContext = context.processTemplate(
          currentNode.assistant
        );
        const finalMessage = processedMessage || messageWithContext;

        addToConversation({
          role: "assistant",
          message: finalMessage,
        });
      }

      if (currentNode.userMessage) {
        addToConversation({
          role: "user",
          message: currentNode.userMessage,
        });
      }
    }
  }, [
    flowPath,
    currentNodeIndex,
    processedMessage,
    context,
    addToConversation,
  ]);

  // Memoize the play handler to prevent recreation on renders
  const handlePlay = useCallback(() => {
    const scenario = getCurrentScenario();
    if (scenario) {
      const path = calculateFlowPath(scenario.children, scenario.edges);
      if (path.length > 0) {
        setFlowPath(path);
        setCurrentNodeIndex(0);
        setIsPlaying(true);
        clearConversation();
      }
    }
  }, [getCurrentScenario, clearConversation]);

  const handleNext = useCallback(() => {
    saveCurrentNodeMessages();

    // Reset processed message
    setProcessedMessage(null);

    // Move to the next node or close if at the end
    if (currentNodeIndex + 1 >= flowPath.length) {
      // Last node, close the flow
      setIsPlaying(false);
    } else {
      setCurrentNodeIndex((prev) => Math.min(prev + 1, flowPath.length - 1));
    }
  }, [saveCurrentNodeMessages, currentNodeIndex, flowPath.length]);

  const handlePrev = useCallback(() => {
    // We don't remove from conversation history when going back
    setCurrentNodeIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleClose = useCallback(() => {
    saveCurrentNodeMessages();

    // Force close regardless of state
    setIsPlaying(false);
    setCurrentNodeIndex(0);
    setFlowPath([]);
  }, [saveCurrentNodeMessages]);

  const handleUserMessageChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFlowPath((currentPath) => {
        const currentNode = currentPath[currentNodeIndex];
        if (currentNode) {
          // Update user message in store
          setUserMessage(currentNode.id, value);

          // Also update local state to ensure re-render
          const updatedPath = [...currentPath];
          updatedPath[currentNodeIndex] = {
            ...currentNode,
            userMessage: value,
          };
          return updatedPath;
        }
        return currentPath;
      });
    },
    [currentNodeIndex, setUserMessage]
  );

  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        <Button size="sm" onClick={handlePlay} className="px-3 py-2 space-x-1">
          <Play className="h-4 w-4 mr-1" />
          <span>Play Flow</span>
        </Button>
      </div>

      {isPlaying && flowPath.length > 0 && (
        <StepModal
          steps={flowPath}
          currentStep={currentNodeIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClose}
          renderStepContent={(step) => (
            <div className="flex flex-col space-y-6">
              <Card className="p-4 border-muted bg-muted/20">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Assistant</h3>

                    {/* Wyświetlanie pojedynczego pluginu */}
                    {step.plugin && (
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const plugin = pluginRegistry.getPlugin(step.plugin);
                          return plugin ? (
                            <Badge
                              key={step.plugin}
                              variant="outline"
                              className="text-xs"
                            >
                              {plugin.config.name}
                            </Badge>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>

                  {/* Message processor with callback for simulation */}
                  <MessageProcessor
                    message={context.processTemplate(step.assistant)}
                    onProcessed={setProcessedMessage}
                    autoProcess={true}
                    nodePlugins={step.plugin ? [step.plugin] : undefined}
                    nodePluginOptions={step.pluginOptions} // Add this line to pass plugin options
                    onSimulateFinish={handleNext}
                  />

                  <div className="text-sm whitespace-pre-line">
                    {processedMessage ||
                      context.processTemplate(step.assistant)}
                  </div>
                </div>
              </Card>

              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-semibold">Your Response</h3>
                <Textarea
                  className="min-h-[120px] resize-none"
                  placeholder="Type your message here..."
                  value={step.userMessage || ""}
                  onChange={handleUserMessageChange}
                />
              </div>
            </div>
          )}
        />
      )}
    </>
  );
};
