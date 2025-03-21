import React from "react";
import { useAppStore } from "../../store";
import { useDialogState } from "../../common/hooks";
import { Dialog, ItemList, SectionHeader } from "@/modules/ui/components";

export const WorkspacesList: React.FC = () => {
  const items = useAppStore((state) => state.items);
  const selected = useAppStore((state) => state.selected.workspace);
  const selectWorkspace = useAppStore((state) => state.selectWorkspace);
  const deleteWorkspace = useAppStore((state) => state.deleteWorkspace);
  const addWorkspace = useAppStore((state) => state.addWorkspace);
  /* refresh */
  useAppStore((state) => state.stateVersion);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ title: "" });
  
  const onAdd = () => {
    if (formData.title) {
      addWorkspace(formData);
      setIsOpen(false);
    }
  };
  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Workspaces"
        onAddClick={() => openDialog()}
      />
      <div className="flex-1 overflow-auto">
        <ItemList
          items={items}
          selected={selected}
          onClick={selectWorkspace}
          onDelete={deleteWorkspace}
          renderItem={(item) => <div className="text-sm">{item.title}</div>}
        />
      </div>
      {isOpen && (
        <Dialog
          title="New Workspace"
          onClose={() => setIsOpen(false)}
          onAdd={onAdd}
          fields={[{ name: "title", placeholder: "Workspace name" }]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </div>
  );
};

export default WorkspacesList;