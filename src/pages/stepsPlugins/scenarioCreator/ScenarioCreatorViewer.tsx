/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreator/ScenarioCreatorViewer.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ViewerProps } from '../types';
import { ConversationItem } from '@/types';
import { registerPluginHandler, unregisterPluginHandler } from '../pluginHandlers';


// Import podzielonych komponentów
import { ScenarioList } from './components/ScenarioList';
import { CreateButton } from './components/CreateButton';
import ScenarioService from './service/ScenarioService';

// Mock data scenarios
const MOCK_SCENARIOS = [
  {
    id: "scenario-1",
    title: "Content Strategy Development",
    description: "Create a comprehensive content plan targeting key audience segments.",
    objective: "Increase organic traffic by 30% in 3 months",
    connections: ["scenario-2", "scenario-5"]
  },
  {
    id: "scenario-2",
    title: "Social Media Campaign",
    description: "Launch coordinated campaigns across Instagram, Twitter, and LinkedIn.",
    objective: "Achieve 15% engagement rate and 5000 new followers",
    connections: ["scenario-1"]
  },
  {
    id: "scenario-3",
    title: "Analytics Implementation",
    description: "Set up tracking and reporting for all marketing initiatives.",
    objective: "Create real-time KPI dashboard for executive team",
    connections: ["scenario-4"]
  },
  {
    id: "scenario-4",
    title: "Audience Engagement Strategy",
    description: "Develop interactive content and community-building initiatives.",
    objective: "Increase average time on site by 25%",
    connections: ["scenario-3", "scenario-5"]
  },
  {
    id: "scenario-5",
    title: "Brand Awareness Campaign",
    description: "Launch multi-channel campaign to increase brand visibility.",
    objective: "Improve brand recognition metrics by 20%",
    connections: ["scenario-1", "scenario-4"]
  }
];

export function ScenarioCreatorViewer({ step, onComplete }: ViewerProps) {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [creationStatus, setCreationStatus] = useState<{[key: string]: 'pending' | 'success' | 'error'}>({});
  
  const { useMockData = true, projectPrefix = 'Marketing Campaign' } = step.config || {};
  
  // Load scenarios on initial render
  useEffect(() => {
    loadScenarios();
  }, []); 

  // Initialize selected scenarios whenever scenarios change
  useEffect(() => {
    const initialSelection = scenarios.reduce((acc, scenario) => {
      acc[scenario.id] = true; // Default: all selected
      return acc;
    }, {} as {[key: string]: boolean});
    
    setSelectedScenarios(initialSelection);
  }, [scenarios]);
  
  const loadScenarios = () => {
    setIsRefreshing(true);
    
    // In a real implementation, you might fetch from an API
    // For now, just use mock data with a simulated delay
    setTimeout(() => {
      if (useMockData) {
        setScenarios(MOCK_SCENARIOS);
      } else {
        // In a real implementation, you would fetch from your API here
        setScenarios(MOCK_SCENARIOS); 
      }
      setIsRefreshing(false);
    }, 800);
  };
  
  const handleToggleScenario = (scenarioId: string) => {
    setSelectedScenarios(prev => ({
      ...prev,
      [scenarioId]: !prev[scenarioId]
    }));
  };
  
  const handleSelectAll = () => {
    const allSelected = scenarios.every(s => selectedScenarios[s.id]);
    
    // If all are selected, deselect all. Otherwise, select all
    const newSelection = scenarios.reduce((acc, scenario) => {
      acc[scenario.id] = !allSelected;
      return acc;
    }, {} as {[key: string]: boolean});
    
    setSelectedScenarios(newSelection);
  };
  
  // ID generation and date calculations are now handled by ScenarioService
  
  // Create scenarios in the store
  const handleCreateScenarios = async () => {
    setLoading(true);
    
    // Filter only selected scenarios
    const scenariosToCreate = scenarios.filter(scenario => selectedScenarios[scenario.id]);
    
    // Reset status
    const initialStatus = scenariosToCreate.reduce((acc, scenario) => {
      acc[scenario.id] = 'pending';
      return acc;
    }, {} as {[key: string]: 'pending' | 'success' | 'error'});
    
    setCreationStatus(initialStatus);
    
    // Status callback function
    const updateStatus = (id: string, status: 'pending' | 'success' | 'error') => {
      setCreationStatus(prev => ({
        ...prev,
        [id]: status
      }));
    };
    
    // Create conversation data for the step
    const conversationData: ConversationItem[] = [
      {
        role: "user",
        content: `Create ${scenariosToCreate.length} scenarios for the project`
      },
      {
        role: "assistant",
        content: `Created ${scenariosToCreate.length} scenarios successfully`
      }
    ];
    
    try {
      // Use the ScenarioService to create all scenarios with connections
      const createdScenarios = await ScenarioService.createScenarioGroup(
        scenariosToCreate,
        projectPrefix,
        updateStatus
      );
      
      // Complete the step with result data
      onComplete({
        createdScenarios,
        timestamp: new Date().toISOString()
      }, conversationData);
      
    } catch (error) {
      console.error("Error creating scenarios:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Register handler for plugin handling system
  useEffect(() => {
    const completeHandler = () => {
      const selectedCount = Object.values(selectedScenarios).filter(Boolean).length;
      if (selectedCount === 0) {
        // Maybe show error or notification that at least one scenario is required
        return;
      }
      handleCreateScenarios();
    };
    
    registerPluginHandler(step.id, completeHandler);
    
    return () => {
      unregisterPluginHandler(step.id);
    };
  }, [step.id, selectedScenarios, scenarios]);
  
  // Helper to get connections display
  const getConnectionTitle = (connectionId: string) => {
    const scenario = scenarios.find(s => s.id === connectionId);
    return scenario ? scenario.title : connectionId;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{step.title || 'Scenario Creator'}</CardTitle>
        <CardDescription>
          {step.description || 'Select which scenarios to create for your project'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <ScenarioList 
          scenarios={scenarios}
          selectedScenarios={selectedScenarios}
          creationStatus={creationStatus}
          onToggleScenario={handleToggleScenario}
          onSelectAll={handleSelectAll}
          onRefresh={loadScenarios}
          getConnectionTitle={getConnectionTitle}
          loading={loading}
          isRefreshing={isRefreshing}
        />
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <CreateButton 
          onClick={handleCreateScenarios}
          disabled={loading || isRefreshing || Object.values(selectedScenarios).filter(Boolean).length === 0}
          loading={loading}
        />
      </CardFooter>
    </Card>
  );
}