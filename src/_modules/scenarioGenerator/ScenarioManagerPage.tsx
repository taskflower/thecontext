// src/_modules/scenarioGenerator/examples/ScenarioManagerPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore, useAuth } from '@/hooks';
import { ScenarioGenerator } from './index';

/**
 * Example implementation of a page that uses the ScenarioGenerator
 */
const ScenarioManagerPage: React.FC = () => {
  const { workspaceId, scenarioId } = useParams<{ workspaceId?: string; scenarioId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // App state
  const { 
    selectWorkspace, 
    selectScenario, 
    getCurrentWorkspace, 
    getCurrentScenario,
    data
  } = useAppStore();
  
  // Local state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  
  // Current data
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();
  
  // Handle navigation and data loading
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
      
      if (scenarioId) {
        selectScenario(scenarioId);
        setMode('edit');
      } else {
        setMode('create');
      }
    }
  }, [workspaceId, scenarioId, selectWorkspace, selectScenario]);
  
  // Handle unauthorized access
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Handle generated scenario code
  const handleScenarioComplete = async (code: string, contextCode?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real application, you would:
      // 1. Save the code to a file or database
      // 2. Create database entries for the scenario and its steps
      // 3. Update the application state
      
      console.log('Generated scenario code:', code);
      if (contextCode) {
        console.log('Generated context code:', contextCode);
      }
      
      // Simulate success
      alert('Scenario generated successfully!');
      
      // Navigate back to workspace
      if (workspaceId) {
        navigate(`/${workspaceId}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // If no workspace is selected, show error
  if (!currentWorkspace && workspaceId) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-medium">Error</p>
          <p>Workspace not found or not loaded.</p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
        ??????
      {/* Workspace context info */}
      {currentWorkspace && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6">
          <h2 className="font-medium">Current Workspace: {currentWorkspace.name}</h2>
          <p className="text-sm">{currentWorkspace.description}</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Main scenario generator */}
      <ScenarioGenerator
        existingScenario={mode === 'edit' ? currentScenario : undefined}
        mode={mode}
        onComplete={handleScenarioComplete}
      />
    </div>
  );
};

export default ScenarioManagerPage;