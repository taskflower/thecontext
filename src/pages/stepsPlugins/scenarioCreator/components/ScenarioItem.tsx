/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreator/components/ScenarioItem.tsx
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Link, Info, Check, X, Loader2 } from 'lucide-react';

interface ScenarioItemProps {
  scenario: any;
  isSelected: boolean;
  status?: 'pending' | 'success' | 'error';
  selectedScenarios: { [key: string]: boolean };
  onToggle: (id: string) => void;
  getConnectionTitle: (id: string) => string;
  disabled?: boolean;
}

export const ScenarioItem: React.FC<ScenarioItemProps> = ({
  scenario,
  isSelected,
  status,
  selectedScenarios,
  onToggle,
  getConnectionTitle,
  disabled = false
}) => {
  return (
    <div 
      className={`border rounded-md p-4 transition-colors ${
        isSelected ? 'bg-primary/5 border-primary/30' : ''
      }`}
    >
      <div className="flex items-start">
        <Checkbox 
          id={scenario.id}
          checked={isSelected}
          onCheckedChange={() => onToggle(scenario.id)}
          className="mt-1 mr-3"
          disabled={disabled}
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <label 
              htmlFor={scenario.id} 
              className="font-medium cursor-pointer flex items-center"
            >
              {scenario.title}
            </label>
            
            {/* Status indicator */}
            {status && (
              <div className="flex items-center">
                {status === 'pending' && (
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Creating...
                  </Badge>
                )}
                {status === 'success' && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Created
                  </Badge>
                )}
                {status === 'error' && (
                  <Badge variant="outline" className="bg-red-100 text-red-800">
                    <X className="h-3 w-3 mr-1" />
                    Error
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-1">
            {scenario.description}
          </p>
          
          <div className="mt-2">
            <span className="text-xs font-medium">Objective:</span>
            <span className="text-xs ml-1 text-muted-foreground">
              {scenario.objective}
            </span>
          </div>
          
          {scenario.connections && scenario.connections.length > 0 && (
            <ConnectionsList 
              connections={scenario.connections}
              selectedScenarios={selectedScenarios}
              getConnectionTitle={getConnectionTitle}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ConnectionsList Component
interface ConnectionsListProps {
  connections: string[];
  selectedScenarios: { [key: string]: boolean };
  getConnectionTitle: (id: string) => string;
}

export const ConnectionsList: React.FC<ConnectionsListProps> = ({ 
  connections, 
  selectedScenarios,
  getConnectionTitle 
}) => {
  return (
    <div className="mt-3">
      <div className="flex items-center mb-1">
        <Link className="h-3 w-3 mr-1 text-muted-foreground" />
        <span className="text-xs font-medium">Connections:</span>
      </div>
      
      <div className="flex flex-wrap gap-1 mt-1">
        {connections.map((connId: string) => (
          <ConnectionBadge 
            key={connId}
            connectionId={connId}
            isSelected={!!selectedScenarios[connId]}
            title={getConnectionTitle(connId)}
          />
        ))}
      </div>
    </div>
  );
};

// ConnectionBadge Component
interface ConnectionBadgeProps {
  connectionId: string;
  isSelected: boolean;
  title: string;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({

  isSelected,
  title
}) => {
  return (
    <Badge 
      variant="outline" 
      className={`text-xs flex items-center ${
        isSelected 
          ? 'bg-primary/10 border-primary/30' 
          : 'opacity-50'
      }`}
    >
      <span>{title}</span>
      {!isSelected && (
        <Info className="h-3 w-3 ml-1 text-amber-500" />
      )}
      {!isSelected && (
        <span className="text-xs text-amber-500 ml-1">(not selected)</span>
      )}
    </Badge>
  );
};