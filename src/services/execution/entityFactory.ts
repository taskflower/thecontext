/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/execution/entityFactory.ts
import { useDocumentStore } from '@/store/documentStore';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';

export async function createContainer(projectId: string, data: any): Promise<string | null> {
  const { addContainerToProject } = useProjectStore.getState();
  return addContainerToProject(projectId, data.name);
}

export async function createDocument(projectId: string, data: any): Promise<string | null> {
  const { addDocument } = useDocumentStore.getState();
  const { containers } = useDocumentStore.getState();
  const projectContainers = useProjectStore.getState().getProjectContainers(projectId);
  
  // Jeśli nie określono containerId, używamy pierwszego dostępnego
  const containerId = data.containerId || projectContainers[0]?.id;
  if (!containerId) return null;
  
  // Sprawdź czy kontener istnieje
  if (!containers.some(c => c.id === containerId)) return null;
  
  return addDocument(containerId, {
    title: data.title || 'Nowy dokument',
    content: data.content || '',
    customFields: data.customFields || {},
    schemaId: data.schemaId || 'default'
  });
}

export async function createTask(projectId: string, data: any): Promise<string | null> {
  const { addTask } = useTaskStore.getState();
  const projectContainers = useProjectStore.getState().getProjectContainers(projectId);
  
  // Używamy containerId z danych lub pierwszego kontenera projektu
  const containerId = data.containerId || projectContainers[0]?.id;
  
  const taskId = addTask({
    title: data.title || 'Nowe zadanie',
    description: data.description || '',
    status: data.status || 'pending',
    priority: data.priority || 'medium',
    containerId,
    relatedDocumentIds: data.relatedDocumentIds || [],
    steps: data.steps || []
  });
  
  return taskId;
}

export async function createTemplate(projectId: string, data: any): Promise<string | null> {
  const { addTemplate } = useTaskStore.getState();
  const { addExistingTemplateToProject } = useProjectStore.getState();
  
  const templateId = addTemplate({
    name: data.name || 'Nowy szablon',
    description: data.description || '',
    defaultPriority: data.defaultPriority || 'medium',
    defaultSteps: data.defaultSteps || []
  });
  
  // Dodaj template do projektu
  addExistingTemplateToProject(projectId, templateId);
  
  return templateId;
}

export async function updateProject(projectId: string, data: any): Promise<boolean> {
  const { updateProject } = useProjectStore.getState();
  updateProject(projectId, data);
  return true;
}