// src/modules/sequence_module/SequenceExecutor.tsx
import React, { useState } from 'react';
import { useScenarioStore } from '../scenarios_module/scenarioStore';
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
import { PlayIcon, XIcon, ChevronRightIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SequenceExecutor: React.FC = () => {
  const { nodes, edges, addNodeResponse } = useScenarioStore();

  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentProcessResponses, setCurrentProcessResponses] = useState<{ [key: string]: string }>({});
  // Keep track of total steps for accurate progress calculation
  const [totalSteps, setTotalSteps] = useState(0);

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
    
    // Save the response
    addNodeResponse(currentNodeId, currentResponse);
    const newResponses = { ...currentProcessResponses, [currentNodeId]: currentResponse };
    setCurrentProcessResponses(newResponses);

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
              <Badge variant="outline">
                Node: {messageQueue[currentMessageIndex]}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              <Progress value={progressPercentage} className="mt-2" />
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div>
              <div className="font-medium text-sm mb-2 flex items-center">
                <span className="text-slate-800">Prompt:</span>
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-800 border-blue-200">
                  {nodes[messageQueue[currentMessageIndex]]?.category}
                </Badge>
              </div>
              <ScrollArea className="h-48">
                <div className="bg-slate-50 p-4 rounded-md border whitespace-pre-wrap text-slate-800">
                  {currentPrompt}
                </div>
              </ScrollArea>
            </div>
            
            <div>
              <div className="font-medium text-sm mb-2 text-slate-800">Your Response:</div>
              <Textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                placeholder="Enter your response..."
                className="min-h-32"
              />
            </div>
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