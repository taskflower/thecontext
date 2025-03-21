import React from "react";
import { useAppStore } from "../../store";
import { useDialogState } from "../../common/hooks";
import { Dialog, ItemList, SectionHeader } from "@/modules/ui/components";



export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const selected = useAppStore((state) => state.selected.node);
  const selectNode = useAppStore((state) => state.selectNode);
  const deleteNode = useAppStore((state) => state.deleteNode);
  const addNode = useAppStore((state) => state.addNode);
  /* refresh */
  useAppStore((state) => state.stateVersion);
  useAppStore((state) => state.selected.scenario);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    label: "", 
    value: "" 
  });
  
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  
  const onAdd = () => {
    if (formData.label && formData.value) {
      addNode(formData);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Nodes"
        onAddClick={() => openDialog()}
      />
      <div className="flex-1 overflow-auto">
        <ItemList
          items={nodes}
          selected={selected}
          onClick={selectNode}
          onDelete={deleteNode}
          renderItem={(item) => (
            <div className="flex items-center">
              <div className="text-sm">{item.label}</div>
              <span className="ml-auto inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {item.value}
              </span>
            </div>
          )}
        />
      </div>

      {isOpen && (
        <Dialog
          title="New Node"
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={[
            { name: "label", placeholder: "Node name" },
            { name: "value", placeholder: "Value", type: "number" },
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default NodesList;