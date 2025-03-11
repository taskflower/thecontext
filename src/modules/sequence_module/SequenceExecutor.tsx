// src/modules/sequence_module/SequenceExecutor.tsx
import React, { useState } from 'react';
import { useScenarioStore } from '../scenarios_module/scenarioStore';
import { usePluginStore } from '../plugins_system/pluginStore';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlayIcon, XIcon, ChevronRightIcon, Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SequenceExecutor: React.FC = () => {
  const { nodes, edges, addNodeResponse } = useScenarioStore();
  const { plugins, updatePluginConfig, updatePluginResult } = usePluginStore();

  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentProcessResponses, setCurrentProcessResponses] = useState<{ [key: string]: string }>({});
  const [totalSteps, setTotalSteps] = useState(0);
  const [showPluginConfig, setShowPluginConfig] = useState(false);

  const processTemplateString = (
    templateString: string,
    responses: { [key: string]: string } = currentProcessResponses
  ) => {
    return templateString.replace(/\{\{([\w.]+)\}\}/g, (match, variable) => {
      const parts = variable.split('.');
      if (parts.length === 2 && parts[1] === 'response') {
        const nodeId = parts[0];
        return responses[nodeId] || match;
      }
      return match;
    });
  };

  const executeAll = () => {
    setCurrentProcessResponses({});
    const visited = new Set<string>();
    const newMessageQueue: string[] = [];
    
    // Find starting nodes (nodes with no incoming edges)
    const allNodeIds = Object.keys(nodes);
    const nodesWithIncoming = new Set(edges.map(edge => edge.target));
    const startingNodes = allNodeIds.filter(id => !nodesWithIncoming.has(id));
    const nodesToStart = startingNodes.length > 0 ? startingNodes : (allNodeIds.length > 0 ? [allNodeIds[0]] : []);

    // Create a function to traverse the graph and build the initial execution order
    const traverseAndCollect = (nodeId: string, visited: Set<string>, result: string[]) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      result.push(nodeId);
      
      // Find all outgoing nodes
      const outgoingNodes = edges.filter(edge => edge.source === nodeId).map(edge => edge.target);
      outgoingNodes.forEach(nextNodeId => traverseAndCollect(nextNodeId, visited, result));
    };

    // Build the initial message queue
    nodesToStart.forEach(startNodeId => traverseAndCollect(startNodeId, visited, newMessageQueue));

    if (newMessageQueue.length > 0) {
      // Set the initial queue and total expected steps
      setMessageQueue(newMessageQueue);
      setTotalSteps(newMessageQueue.length);
      setCurrentMessageIndex(0);
      
      // Set up the first prompt
      const firstNodeId = newMessageQueue[0];
      const processedMessage = processTemplateString(nodes[firstNodeId].message, {});
      setCurrentPrompt(processedMessage);
      setCurrentResponse('');
      setIsExecuting(true);
    }
  };

  const handleResponseSubmit = () => {
    const currentNodeId = messageQueue[currentMessageIndex];
    const currentNode = nodes[currentNodeId];
    
    // Save the response
    addNodeResponse(currentNodeId, currentResponse);
    const newResponses = { ...currentProcessResponses, [currentNodeId]: currentResponse };
    setCurrentProcessResponses(newResponses);

    // If there's a plugin associated with this node, update its result
    if (currentNode.pluginId && plugins[currentNode.pluginId]) {
      updatePluginResult(currentNode.pluginId, currentResponse);
    }

    // Move to next node in queue
    if (currentMessageIndex < messageQueue.length - 1) {
      // There are more nodes in the existing queue
      const nextIndex = currentMessageIndex + 1;
      setCurrentMessageIndex(nextIndex);
      
      const nextNodeId = messageQueue[nextIndex];
      const processedMessage = processTemplateString(nodes[nextNodeId].message, newResponses);
      setCurrentPrompt(processedMessage);
      setCurrentResponse('');
    } else {
      // We've reached the end of the queue
      setIsExecuting(false);
      setCurrentPrompt('');
      setCurrentResponse('');
      setCurrentMessageIndex(0);
    }
  };

  const handleCancelExecution = () => {
    setIsExecuting(false);
    setCurrentPrompt('');
    setCurrentResponse('');
    setMessageQueue([]);
    setCurrentMessageIndex(0);
    setTotalSteps(0);
  };

  // Calculate progress percentage based on current index and the initial total steps
  const progressPercentage = totalSteps > 0 
    ? Math.round((currentMessageIndex + 1) / totalSteps * 100)
    : 0;

  // Get the current node and check if it has an associated plugin
  const currentNodeId = messageQueue[currentMessageIndex];
  const currentNode = currentNodeId ? nodes[currentNodeId] : null;
  const hasPlugin = currentNode && currentNode.pluginId && plugins[currentNode.pluginId];
  const currentPlugin = hasPlugin ? plugins[currentNode.pluginId] : null;

  // Handle plugin configuration update for the current node
  const handlePluginConfigUpdate = (configUpdates: any) => {
    if (currentNode && currentNode.pluginId) {
      // Update both the plugin state and the node's pluginConfig
      updatePluginConfig(currentNode.pluginId, configUpdates);
      
      // Use scenarioStore to update the node's pluginConfig
      useScenarioStore.getState().updateNodePluginConfig(
        currentNodeId, 
        configUpdates
      );
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        <div className="text-center space-y-2 max-w-xl">
          <h3 className="text-lg font-medium">Execute Your Prompt Sequence</h3>
          <p className="text-slate-500">
            Run your entire sequence to collect responses for each node in the flow.
          </p>
        </div>
        
        <Button 
          onClick={executeAll} 
          size="lg"
          disabled={Object.keys(nodes).length === 0}
          className="px-8"
        >
          <PlayIcon className="h-4 w-4 mr-2" />
          Execute Sequence
        </Button>
      </div>

      {/* Execution Dialog */}
      <Dialog open={isExecuting} onOpenChange={(open) => !open && handleCancelExecution()}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                Sequence Execution: Step {currentMessageIndex + 1} of {totalSteps}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Node: {messageQueue[currentMessageIndex]}
                </Badge>
                {hasPlugin && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    Plugin: {currentPlugin?.name}
                  </Badge>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              <Progress value={progressPercentage} className="mt-2" />
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div>
              <div className="font-medium text-sm mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-slate-800">Prompt:</span>
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800 border-blue-200">
                    {nodes[messageQueue[currentMessageIndex]]?.category}
                  </Badge>
                </div>
                
                {hasPlugin && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowPluginConfig(!showPluginConfig)}
                    className="text-xs"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Plugin Settings
                  </Button>
                )}
              </div>
              <ScrollArea className="h-48">
                <div className="bg-slate-50 p-4 rounded-md border whitespace-pre-wrap text-slate-800">
                  {currentPrompt}
                </div>
              </ScrollArea>
            </div>
            
            <div>
              <div className="font-medium text-sm mb-2 text-slate-800">
                {hasPlugin ? 'Plugin Interface:' : 'Your Response:'}
              </div>
              
              {hasPlugin && currentPlugin ? (
                // Render the plugin's ViewComponent for response
                <div className="border rounded-md p-4 min-h-32 bg-white">
                  <div className="plugin-container">
                    <currentPlugin.ViewComponent 
                      nodeId={currentNodeId}
                      config={currentNode.pluginConfig || {}}
                      onConfigChange={handlePluginConfigUpdate}
                      onResponseChange={setCurrentResponse}
                    />
                  </div>
                </div>
              ) : (
                // Render the default textarea for response
                <Textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder="Enter your response..."
                  className="min-h-32"
                />
              )}
            </div>
            
            {/* Plugin Configuration Panel */}
            {hasPlugin && showPluginConfig && (
              <div className="border rounded-md p-4 bg-slate-50">
                <h4 className="text-sm font-medium mb-3">Plugin Configuration</h4>
                <div className="plugin-config-container">
                  {currentPlugin && (
                    <currentPlugin.ConfigComponent
                      nodeId={currentNodeId}
                      config={currentNode.pluginConfig || {}}
                      onConfigChange={handlePluginConfigUpdate}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between flex flex-row items-center">
            <Button 
              variant="outline" 
              onClick={handleCancelExecution}
            >
              <XIcon className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleResponseSubmit}
              disabled={!currentResponse.trim()}
            >
              {currentMessageIndex < messageQueue.length - 1 ? (
                <>
                  <ChevronRightIcon className="h-4 w-4 mr-2" />
                  Continue
                </>
              ) : (
                'Finish'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SequenceExecutor;