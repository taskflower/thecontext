// Przykładowe poprawki komponentów używających store

import { useDialogState } from "@/hooks";
import { useWorkspaceStore } from ".";
import { CardPanel, Dialog, ItemList } from "@/components/APPUI";
import { Workspace } from "../types";


export const WorkspacesList: React.FC = () => {
  const items = useWorkspaceStore(state => state.items);
  const selected = useWorkspaceStore(state => state.selected);
  const selectWorkspace = useWorkspaceStore(state => state.selectWorkspace);
  const deleteWorkspace = useWorkspaceStore(state => state.deleteWorkspace);
  const addWorkspace = useWorkspaceStore(state => state.addWorkspace);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ title: '' });
  
  const handleAdd = () => {
    if (formData.title?.toString().trim()) {
      addWorkspace({
        title: String(formData.title)
      });
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <CardPanel title="Workspaces" onAddClick={() => openDialog({ title: '' })}>
        <ItemList<Workspace> 
          items={items}
          selected={selected.workspace}
          onClick={selectWorkspace}
          onDelete={deleteWorkspace}
          renderItem={(item) => <div className="font-medium">{item.title}</div>}
        />
      </CardPanel>
      
      {isOpen && (
        <Dialog 
          title="New Workspace"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[{ name: 'title', placeholder: 'Workspace name' }]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </>
  );
};