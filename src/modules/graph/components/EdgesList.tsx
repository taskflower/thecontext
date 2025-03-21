import React from "react";
import { Link } from "lucide-react";
import { useAppStore } from "../../store";
import { useDialogState } from "../../common/hooks";
import { Dialog, ItemList, SectionHeader } from "@/modules/ui/components";

export const EdgesList: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const deleteEdge = useAppStore((state) => state.deleteEdge);
  const addEdge = useAppStore((state) => state.addEdge);
  /* refresh */
  useAppStore((state) => state.stateVersion);
  useAppStore((state) => state.selected.workspace);
  useAppStore((state) => state.selected.scenario);
  useAppStore((state) => state.selected.node);
  
  const scenario = getCurrentScenario();
  const edges = scenario?.edges || [];
  const nodes = scenario?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    source: nodes[0]?.id || "", 
    target: nodes[1]?.id || "", 
    label: "" 
  });
  
  const getNodeLabel = (nodeId: string): string => {
    const node = nodes.find((n) => n.id === nodeId);
    return node ? node.label : nodeId;
  };
  
  const onAdd = () => {
    if (formData.source && formData.target) {
      addEdge({
        source: formData.source,
        target: formData.target,
        label: formData.label,
        type: "step",
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Edges"
        onAddClick={() => openDialog()}
      />
      <div className="flex-1 overflow-auto">
        <ItemList
          items={edges}
          selected={""}
          onClick={() => {}}
          onDelete={deleteEdge}
          renderItem={(item) => (
            <div className="text-sm flex items-center">
              {getNodeLabel(item.source)}
              <Link className="h-3 w-3 mx-1" />
              {getNodeLabel(item.target)}
              {item.label && (
                <span className="ml-1 text-muted-foreground">({item.label})</span>
              )}
            </div>
          )}
        />
      </div>

      {isOpen && (
        <Dialog
          title="New Edge"
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={[
            {
              name: "source",
              placeholder: "Source node",
              type: "select",
              options: nodes.map((n) => ({ value: n.id, label: n.label })),
            },
            {
              name: "target",
              placeholder: "Target node",
              type: "select",
              options: nodes.map((n) => ({ value: n.id, label: n.label })),
            },
            { name: "label", placeholder: "Edge label (optional)", type: "text-optional" },
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default EdgesList;