// src/modules/sequence_module/SequenceExecutor.tsx
// (dawniej SequenceExecutor.tsx)

import React, { useState } from 'react';
import { useScenarioStore } from '../scenarios_module/scenarioStore';



const SequenceExecutor: React.FC = () => {
  const { nodes, edges, addNodeResponse } = useScenarioStore();

  const [messageQueue, setMessageQueue] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentProcessResponses, setCurrentProcessResponses] = useState<{ [key: string]: string }>({});

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
    const allNodeIds = Object.keys(nodes);
    const nodesWithIncoming = new Set(edges.map(edge => edge.target));
    const startingNodes = allNodeIds.filter(id => !nodesWithIncoming.has(id));
    const nodesToStart = startingNodes.length > 0 ? startingNodes : (allNodeIds.length > 0 ? [allNodeIds[0]] : []);

    const traverseAndCollect = (nodeId: string, visited: Set<string>, result: string[]) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      result.push(nodeId);
      const outgoingNodes = edges.filter(edge => edge.source === nodeId).map(edge => edge.target);
      outgoingNodes.forEach(nextNodeId => traverseAndCollect(nextNodeId, visited, result));
    };

    nodesToStart.forEach(startNodeId => traverseAndCollect(startNodeId, visited, newMessageQueue));

    if (newMessageQueue.length > 0) {
      setMessageQueue(newMessageQueue);
      setCurrentMessageIndex(0);
      const firstNodeId = newMessageQueue[0];
      const processedMessage = processTemplateString(nodes[firstNodeId].message, {});
      setCurrentPrompt(processedMessage);
      setCurrentResponse('');
      setIsExecuting(true);
    }
  };

  const handleResponseSubmit = () => {
    const currentNodeId = messageQueue[currentMessageIndex];
    addNodeResponse(currentNodeId, currentResponse);
    const newResponses = { ...currentProcessResponses, [currentNodeId]: currentResponse };
    setCurrentProcessResponses(newResponses);

    const outgoingNodes = edges
      .filter(edge => edge.source === currentNodeId)
      .map(edge => edge.target);

    if (outgoingNodes.length > 0) {
      setMessageQueue([...messageQueue, ...outgoingNodes]);
      const nextIndex = currentMessageIndex + 1;
      setCurrentMessageIndex(nextIndex);
      const nextNodeId = outgoingNodes[0];
      const processedMessage = processTemplateString(nodes[nextNodeId].message, newResponses);
      setCurrentPrompt(processedMessage);
      setCurrentResponse('');
    } else {
      setIsExecuting(false);
      setCurrentPrompt('');
      setCurrentResponse('');
    }
  };

  const handleCancelExecution = () => {
    setIsExecuting(false);
    setCurrentPrompt('');
    setCurrentResponse('');
    setMessageQueue([]);
    setCurrentMessageIndex(0);
  };

  return (
    <>
      {isExecuting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                Krok {currentMessageIndex + 1} z {messageQueue.length}: {messageQueue[currentMessageIndex]}
              </h3>
              <button onClick={handleCancelExecution} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="mb-4">
              <div className="font-medium mb-2">Prompt:</div>
              <div className="bg-gray-100 p-3 rounded border whitespace-pre-wrap">{currentPrompt}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Twoja odpowiedź:</div>
              <textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                className="w-full p-3 border rounded min-h-32"
                placeholder="Wpisz swoją odpowiedź..."
              />
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleResponseSubmit}
                disabled={!currentResponse.trim()}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
              >
                {currentMessageIndex < messageQueue.length - 1 ? 'Kontynuuj' : 'Zakończ'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Przykładowy przycisk uruchamiający całą sekwencję */}
      <div className="text-center mt-4">
        <button onClick={executeAll} className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-indigo-700">
          Uruchom sekwencję
        </button>
      </div>
    </>
  );
};

export default SequenceExecutor;