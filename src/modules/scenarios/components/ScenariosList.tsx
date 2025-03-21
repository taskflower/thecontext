import React from "react";
import { useAppStore } from "../../store";
import { useDialogState } from "../../common/hooks";
import { Dialog, ItemList, SectionHeader } from "@/modules/ui/components";

export const ScenariosList: React.FC = () => {
  const workspace = useAppStore((state) => 
    state.items.find(w => w.id === state.selected.workspace)
  );
  const selected = useAppStore((state) => state.selected.scenario);
  const selectScenario = useAppStore((state) => state.selectScenario);
  const deleteScenario = useAppStore((state) => state.deleteScenario);
  const addScenario = useAppStore((state) => state.addScenario);
  /* refresh */
  useAppStore((state) => state.stateVersion);
  useAppStore((state) => state.selected.workspace);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    name: "", 
    description: "" 
  });
  
  const scenarios = workspace?.children || [];
  
  const onAdd = () => {
    if (formData.name) {
      addScenario(formData);
      setIsOpen(false);
    }
  };
  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Scenarios"
        onAddClick={() => openDialog()}
      />
      <div className="flex-1 overflow-auto">
        <ItemList
          items={scenarios}
          selected={selected}
          onClick={selectScenario}
          onDelete={deleteScenario}
          renderItem={(item) => (
            <>
              <div className="text-sm">{item.name}</div>
              {item.description && (
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {item.description}
                </div>
              )}
            </>
          )}
        />
      </div>
      {isOpen && (
        <Dialog
          title="New Scenario"
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={[
            { name: "name", placeholder: "Scenario name" },
            { name: "description", placeholder: "Description" },
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default ScenariosList;