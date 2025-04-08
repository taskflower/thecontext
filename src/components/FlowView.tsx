// src/components/FlowView.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { useNodeManager } from '../hooks/useNodeManager';

export const FlowView: React.FC = () => {
  const { 
    workspaces, 
    selectedWorkspace, 
    selectedScenario, 
    currentNodeIndex,
    nextNode,
    prevNode 
  } = useAppStore();

  const { 
    currentNode, 
    executeNode 
  } = useNodeManager();

  const [userInput, setUserInput] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('Current Flow State:', {
      workspaces,
      selectedWorkspace,
      selectedScenario,
      currentNodeIndex,
      currentNode
    });
  }, [workspaces, selectedWorkspace, selectedScenario, currentNodeIndex, currentNode]);

  const handleSubmit = () => {
    if (currentNode) {
      executeNode(userInput);
      nextNode();
      setUserInput('');
    }
  };

  // Detailed loading state
  if (!selectedWorkspace) return <div>No workspace selected</div>;
  if (!selectedScenario) return <div>No scenario selected</div>;
  if (!currentNode) return <div>No current node available</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Flow: {currentNode.label}
        </h1>
        <button 
          onClick={() => window.history.back()}
          className="text-sm text-gray-600"
        >
          Back to Scenarios
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Assistant Message
          </h2>
          <p className="text-gray-600">
            {currentNode.assistantMessage || 'No assistant message'}
          </p>
        </div>

        <textarea 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          rows={4}
          placeholder="Your response..."
        />

        <div className="flex justify-between">
          <button 
            onClick={prevNode}
            disabled={currentNodeIndex === 0}
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Next
          </button>
        </div>

        {/* Debug Information */}
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <h3 className="font-bold">Debug Info:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              workspaceId: selectedWorkspace,
              scenarioId: selectedScenario,
              currentNodeIndex,
              currentNodeId: currentNode.id,
              currentNodeLabel: currentNode.label
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};