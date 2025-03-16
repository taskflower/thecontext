// src/modules/scenarios/ScenariosList.tsx
import React from "react";
import { useDialogState } from "@/hooks";
import { useAppStore } from '../store';
import { Dialog, ItemList } from "@/components/APPUI";
import { Scenario } from "../types";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ScenariosList: React.FC = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const selectScenario = useAppStore(state => state.selectScenario);
  const deleteScenario = useAppStore(state => state.deleteScenario);
  const addScenario = useAppStore(state => state.addScenario);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const workspace = items.find(w => w.id === selected.workspace);
  const scenarios = workspace?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ name: '', description: '' });
  
  const handleAdd = () => {
    if (formData.name?.toString().trim()) {
      addScenario({
        name: String(formData.name),
        description: formData.description ? String(formData.description) : undefined
      });
      setIsOpen(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Scenarios</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => openDialog({ name: '', description: '' })} 
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        <ItemList<Scenario> 
          items={scenarios}
          selected={selected.scenario}
          onClick={selectScenario}
          onDelete={deleteScenario}
          renderItem={(item) => (
            <div className="p-2">
              <div className="font-medium flex items-center">
                <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {item.name}
              </div>
              {item.description && (
                <div className="text-xs text-muted-foreground truncate mt-0.5 ml-5.5">
                  {item.description}
                </div>
              )}
            </div>
          )}
          height="h-full"
        />
      </div>
      
      {isOpen && (
        <Dialog 
          title="New Scenario"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[
            { name: 'name', placeholder: 'Scenario name' },
            { name: 'description', placeholder: 'Description' }
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};