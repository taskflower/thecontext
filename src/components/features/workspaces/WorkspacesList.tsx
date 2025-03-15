// src/components/features/workspaces/WorkspacesList.tsx
import React from 'react';
import { CardPanel, Dialog, ItemList } from '@/components/APPUI';
import { useDialogState } from '@/hooks';
import { useAppStore } from '@/store';
import { Workspace } from '@/types/app';

export const WorkspacesList: React.FC = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const selectWorkspace = useAppStore(state => state.selectWorkspace);
  const deleteWorkspace = useAppStore(state => state.deleteWorkspace);
  const addWorkspace = useAppStore(state => state.addWorkspace);
  
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