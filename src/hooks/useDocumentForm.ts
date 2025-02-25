/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useDocumentForm.ts
import React from 'react';
import { useContainerStore } from '../store/containerStore';
import { IContainerDocument } from '@/utils/containers/types';


export const useDocumentForm = (containerId: string) => {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [customFields, setCustomFields] = React.useState<Record<string, any>>({});
  const [selectedSchemaId, setSelectedSchemaId] = React.useState<string>('');
  
  const addDocument = useContainerStore(state => state.addDocument);
  const container = useContainerStore(
    state => state.containers.find(c => c.id === containerId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemaId) return;

    const newDocument: IContainerDocument = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      customFields,
      schemaId: selectedSchemaId
    };

    const schema = container?.schemas.find(s => s.id === selectedSchemaId);
    if (schema && container) {
      addDocument(containerId, newDocument);
      setTitle('');
      setContent('');
      setCustomFields({});
    }
  };

  return {
    title,
    setTitle,
    content,
    setContent,
    customFields,
    setCustomFields,
    selectedSchemaId,
    setSelectedSchemaId,
    handleSubmit
  };
};