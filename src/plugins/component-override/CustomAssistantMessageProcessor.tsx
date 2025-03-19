// src/plugins/component-override/CustomAssistantMessageProcessor.tsx
import { useState, useEffect, useRef, memo } from "react";

import { useWorkspaceContext } from "../../modules/context/hooks/useContext";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFlowPlayer } from "@/modules/flowPlayer";
import { usePluginStore } from "@/modules/plugin";

// Using memo to prevent unnecessary rerenders
export const CustomAssistantMessageProcessor = memo(() => {
  const { currentNode, isNodeProcessed, markNodeAsProcessed, nextNode } =
    useFlowPlayer();
  const { processTemplate } = useWorkspaceContext();
  const { plugins } = usePluginStore();
  const [activeTab, setActiveTab] = useState("message");
  const [clickCount, setClickCount] = useState(0);
  const renderCountRef = useRef(0);
  const nodeIdRef = useRef<string | null>(null);
  const processedRef = useRef(false);

  // Increment render counter for debugging
  renderCountRef.current += 1;

  console.log("CustomAssistantMessageProcessor render:", {
    nodeId: currentNode?.id,
    plugin: currentNode?.plugin,
    renderCount: renderCountRef.current,
    isFirstRender: nodeIdRef.current === null,
    isProcessed: currentNode?.id ? isNodeProcessed(currentNode.id) : false,
    time: new Date().toISOString(),
  });

  // Optimization: Only process message when node ID changes
  // Not on every render and not when the entire node object changes reference
  useEffect(() => {
    if (!currentNode) return;

    const currentNodeId = currentNode.id;

    // Only process if we have a new node ID
    if (currentNodeId !== nodeIdRef.current) {
      console.log("Node ID changed:", {
        from: nodeIdRef.current,
        to: currentNodeId,
        wasProcessed: isNodeProcessed(currentNodeId),
        time: new Date().toISOString(),
      });

      nodeIdRef.current = currentNodeId;
      processedRef.current = false;

      // Process the node if needed
      if (currentNode.assistant && !isNodeProcessed(currentNodeId)) {
        markNodeAsProcessed(currentNodeId);
        processedRef.current = true;
      }
    }
  }, [currentNode?.id, isNodeProcessed, markNodeAsProcessed]);

  if (!currentNode) {
    return null;
  }

  // Memoize expensive operations
  const pluginOptions =
    currentNode.plugin && currentNode.pluginOptions
      ? currentNode.pluginOptions[currentNode.plugin]
      : {};

  // Process message with plugin
  const displayMessage = currentNode.assistant
    ? processTemplate(currentNode.assistant)
    : "";

  const pluginName = currentNode.plugin
    ? plugins[currentNode.plugin]?.name || currentNode.plugin
    : "None";

  const handleButtonClick = () => {
    setClickCount((prev) => prev + 1);
  };

  const handleNext = () => {
    nextNode(`Przechodzę do następnego kroku (kliknięcia: ${clickCount})`);
  };

  return (
    <Card className="custom-message-processor">
      <CardContent className="pt-4">
        <div className="mb-2">
          <span className="text-xs   px-2 py-1 rounded-full">
            Plugin: {pluginName} (Render: {renderCountRef.current})
          </span>
          {pluginOptions.show_debug && (
            <span className="ml-2 text-xs  text-gray-700 px-2 py-1 rounded-full">
              Debug Mode
            </span>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-2">
          <TabsList className="mb-2">
            <TabsTrigger value="message">Message</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="message">
            <div className=" p-4 rounded-md border border-blue-200">
              <p className="whitespace-pre-wrap">{displayMessage}</p>
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="p-4  rounded-md border">
              <div className="mb-2">Interaktywne akcje:</div>
              <div className="flex space-x-3">
                <Button onClick={handleButtonClick} variant="default">
                  Kliknij mnie ({clickCount})
                </Button>
                <Button onClick={handleNext} variant="outline">
                  Następny krok
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="json">
            <div className="min-h-32  p-3 rounded-md overflow-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(
                  {
                    nodeId: currentNode.id,
                    nodeLabel: currentNode.label,
                    nodePlugin: currentNode.plugin,
                    pluginOptions,
                    isProcessed: isNodeProcessed(currentNode.id),
                    renderCount: renderCountRef.current,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

// Set display name for debugging
CustomAssistantMessageProcessor.displayName = "CustomAssistantMessageProcessor";
