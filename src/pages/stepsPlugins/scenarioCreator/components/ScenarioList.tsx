/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreator/components/ScenarioList.tsx
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScenarioItem } from './ScenarioItem';

interface ScenarioListProps {
  scenarios: any[];
  selectedScenarios: { [key: string]: boolean };
  creationStatus: { [key: string]: 'pending' | 'success' | 'error' };
  onToggleScenario: (id: string) => void;
  onSelectAll: () => void;
  onRefresh: () => void;
  getConnectionTitle: (id: string) => string;
  loading: boolean;
  isRefreshing: boolean;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({
  scenarios,
  selectedScenarios,
  creationStatus,
  onToggleScenario,
  onSelectAll,
  onRefresh,
  getConnectionTitle,
  loading,
  isRefreshing
}) => {
  if (isRefreshing) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Scenarios
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onSelectAll}
          disabled={loading}
        >
          {scenarios.every(s => selectedScenarios[s.id]) ? 'Deselect All' : 'Select All'}
        </Button>
      </div>
      
      <div className="space-y-4">
        {scenarios.map((scenario) => (
          <ScenarioItem
            key={scenario.id}
            scenario={scenario}
            isSelected={!!selectedScenarios[scenario.id]}
            status={creationStatus[scenario.id]}
            selectedScenarios={selectedScenarios}
            onToggle={onToggleScenario}
            getConnectionTitle={getConnectionTitle}
            disabled={loading}
          />
        ))}
        
        {scenarios.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            No scenarios available. Click Refresh to load scenarios.
          </div>
        )}
      </div>
    </>
  );
};