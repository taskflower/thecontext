// src/components/FlowView.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { useNodeManager } from '../hooks/useNodeManager';
import { useNavigate, useParams } from 'react-router-dom';

export const FlowView: React.FC = () => {
  const { 
    workspace: workspaceId, 
    scenario: scenarioId, 
    node: nodeParam 
  } = useParams<{ workspace: string; scenario: string; node?: string }>();
  
  const { 
    workspaces, 
    selectWorkspace, 
    selectScenario,
    currentNodeIndex,
    nextNode,
    prevNode 
  } = useAppStore();
  
  const { currentNode, executeNode, contextItems, setContextItems } = useNodeManager();
  const [userInput, setUserInput] = useState('');
  const navigate = useNavigate();

  // Set the selected workspace and scenario based on URL params
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
    }
    if (scenarioId) {
      selectScenario(scenarioId);
    }
  }, [workspaceId, scenarioId, selectWorkspace, selectScenario]);

  // Calculate current scenario
  const currentScenario = useMemo(() => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.scenarios.find(s => s.id === scenarioId);
  }, [workspaces, workspaceId, scenarioId]);

  // Check if we're on the last node
  const isLastNode = currentScenario 
    ? currentNodeIndex === currentScenario.nodes.length - 1 
    : false;

  // Handle specific node navigation if node param is present
  useEffect(() => {
    if (nodeParam && currentScenario) {
      const nodeIndex = currentScenario.nodes.findIndex(n => n.id === nodeParam);
      if (nodeIndex !== -1) {
        // TODO: Add functionality to jump to specific node
      }
    }
  }, [nodeParam, currentScenario]);

  useEffect(() => {
    console.log('Current Flow State:', {
      workspaces,
      workspaceId,
      scenarioId,
      currentNodeIndex,
      currentNode,
      contextItems
    });
  }, [workspaces, workspaceId, scenarioId, currentNodeIndex, currentNode, contextItems]);

  const handleSubmit = () => {
    if (currentNode) {
      // Execute the node and get the result
      const result = executeNode(userInput);
      
      // If the context was updated, update our context state
      if (result && result.contextUpdated) {
        setContextItems(result.updatedContext);
      }
      
      if (!isLastNode) {
        // Navigate to the next node
        nextNode();
        
        // If we know what the next node will be, update URL
        if (currentScenario && currentNodeIndex + 1 < currentScenario.nodes.length) {
          const nextNodeId = currentScenario.nodes[currentNodeIndex + 1].id;
          navigate(`/${workspaceId}/${scenarioId}/${nextNodeId}`);
        }
      } else {
        // Action after flow completion - redirect to scenarios list
        alert('Flow completed!');
        navigate(`/${workspaceId}`);
      }
      setUserInput('');
    }
  };

  const handlePrevious = () => {
    if (currentNodeIndex > 0 && currentScenario) {
      prevNode();
      
      // Update URL to previous node
      const prevNodeId = currentScenario.nodes[currentNodeIndex - 1].id;
      navigate(`/${workspaceId}/${scenarioId}/${prevNodeId}`);
    }
  };

  if (!workspaceId) return <div>No workspace selected</div>;
  if (!scenarioId) return <div>No scenario selected</div>;
  if (!currentNode) return <div>No current node available</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Flow: {currentNode.label}</h1>
        <button 
          onClick={() => navigate(`/${workspaceId}`)}
          className="text-sm text-gray-600"
        >
          Back to Scenarios
        </button>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Assistant Message</h2>
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
            onClick={handlePrevious}
            disabled={currentNodeIndex === 0}
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button 
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isLastNode ? 'Finish' : 'Next'}
          </button>
        </div>

        <div className="mt-4 p-2 bg-gray-100 rounded">
          <h3 className="font-bold">Debug Info:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              workspaceId,
              scenarioId,
              nodeId: currentNode.id,
              currentNodeIndex,
              currentNodeLabel: currentNode.label,
              contextItems
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};