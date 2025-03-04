// src/pages/scenarios/components/ConnectionModal.tsx
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDataStore } from '@/store';
import { ConnectionType } from '@/types';

interface ConnectionModalProps {
  scenarioId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionModal: React.FC<ConnectionModalProps> = ({
  scenarioId,
  isOpen,
  onClose
}) => {
  const { scenarios, addScenarioConnection, getConnectedScenarios } = useDataStore();
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('related');
  
  // Get current scenario and already connected scenarios
  const currentScenario = scenarios.find(s => s.id === scenarioId);
  const connectedScenarios = getConnectedScenarios(scenarioId);
  
  // Filter out already connected scenarios and the current scenario
  const availableScenarios = scenarios.filter(s => 
    s.id !== scenarioId && 
    !connectedScenarios.some(cs => cs.id === s.id)
  );
  
  const handleConnect = () => {
    if (!selectedScenario) return;
    
    addScenarioConnection(scenarioId, selectedScenario, connectionType);
    onClose();
  };
  
  const getConnectionTypeDescription = (type: ConnectionType) => {
    switch(type) {
      case 'dependency':
        return "This scenario depends on the selected scenario to be completed";
      case 'parent':
        return "This scenario is a parent of the selected scenario";
      case 'child':
        return "This scenario is a child of the selected scenario";
      case 'related':
      default:
        return "These scenarios are related but independent";
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Scenario</DialogTitle>
          <DialogDescription>
            Create a connection between "{currentScenario?.title}" and another scenario.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="scenario">Select Scenario</Label>
            <Select
              value={selectedScenario}
              onValueChange={setSelectedScenario}
            >
              <SelectTrigger id="scenario">
                <SelectValue placeholder="Select a scenario" />
              </SelectTrigger>
              <SelectContent>
                {availableScenarios.length === 0 ? (
                  <SelectItem value="none" disabled>No scenarios available</SelectItem>
                ) : (
                  availableScenarios.map(scenario => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="connectionType">Connection Type</Label>
            <Select
              value={connectionType}
              onValueChange={(value) => setConnectionType(value as ConnectionType)}
            >
              <SelectTrigger id="connectionType">
                <SelectValue placeholder="Select connection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="related">Related</SelectItem>
                <SelectItem value="dependency">Dependency</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              {getConnectionTypeDescription(connectionType)}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleConnect}
            disabled={!selectedScenario || availableScenarios.length === 0}
          >
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectionModal;