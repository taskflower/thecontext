import React from "react";
import { useDialogState } from "@/hooks";
import { useAppStore } from '../store';
import { CardPanel, Dialog, ItemList } from "@/components/APPUI";
import { Scenario } from "../types";

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
    <>
      <CardPanel title="Scenarios" onAddClick={() => openDialog({ name: '', description: '' })}>
        <ItemList<Scenario> 
          items={scenarios}
          selected={selected.scenario}
          onClick={selectScenario}
          onDelete={deleteScenario}
          renderItem={(item) => (
            <>
              <div className="font-medium">{item.name}</div>
              {item.description && <div className="text-xs opacity-70 truncate">{item.description}</div>}
            </>
          )}
        />
      </CardPanel>
      
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
    </>
  );
};