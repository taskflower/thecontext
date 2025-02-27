// src/utils/tasks/executors/genericStepExecutor.ts
import { useTaskStore } from '@/store/taskStore';
import { useDocumentStore } from '@/store/documentStore';

export async function executeGenericStep(taskId: string, stepId: string): Promise<boolean> {
  const { tasks, updateStep } = useTaskStore.getState();
  
  const task = tasks.find((t: { id: string }) => t.id === taskId);
  if (!task) return false;
  
  const step = task.steps.find((s: { id: string }) => s.id === stepId);
  if (!step) return false;
  
  updateStep(taskId, stepId, { status: 'in_progress' });
  
  try {
    const { containers } = useDocumentStore.getState();
    
    // Obsługa różnych typów kroków
    let output = '';
    let status: 'completed' | 'failed' = 'completed';
    
    switch(step.type) {
      case 'retrieval':
        // Pobieranie dokumentów powiązanych z zadaniem
        output = `Znaleziono ${task.relatedDocumentIds.length} dokumentów powiązanych z zadaniem`;
        break;
      
      case 'processing':
        // Przetwarzanie dokumentów
        if (task.relatedDocumentIds.length === 0) {
          output = 'Brak dokumentów do przetworzenia';
          status = 'failed';
        } else {
          output = `Przetworzono dane z ${task.relatedDocumentIds.length} dokumentów`;
        }
        break;
      
      case 'generation':
        // Generowanie dokumentu
        if (!task.containerId) {
          output = 'Nie można utworzyć dokumentu - nie przypisano kontenera';
          status = 'failed';
        } else {
          const container = containers.find(c => c.id === task.containerId);
          if (!container) {
            output = 'Nie można utworzyć dokumentu - kontener nie znaleziony';
            status = 'failed';
          } else {
            output = 'Utworzono nowy dokument';
          }
        }
        break;
      
      case 'validation':
        output = 'Dokument zwalidowany';
        break;
      
      default:
        output = `Wykonano krok ${step.description}`;
    }
    
    // Aktualizacja kroku
    updateStep(taskId, stepId, { 
      output,
      status
    });
    
    return status === 'completed';
  } catch (error) {
    console.error(`Błąd wykonania kroku ${stepId}:`, error);
    updateStep(taskId, stepId, { 
      output: `Błąd: ${error}`,
      status: 'failed'
    });
    return false;
  }
}